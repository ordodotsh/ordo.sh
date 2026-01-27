import { v } from "convex/values";
import { query, action, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Get user's VM
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("vms")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Create VM record (called by provision action)
export const create = internalMutation({
  args: {
    userId: v.id("users"),
    flyAppName: v.string(),
    flyMachineId: v.optional(v.string()),
    status: v.union(
      v.literal("provisioning"),
      v.literal("running"),
      v.literal("stopped"),
      v.literal("failed"),
      v.literal("deleted")
    ),
    region: v.string(),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vmId = await ctx.db.insert("vms", {
      ...args,
      createdAt: Date.now(),
    });
    return vmId;
  },
});

// Update VM status
export const updateStatus = internalMutation({
  args: {
    vmId: v.id("vms"),
    status: v.union(
      v.literal("provisioning"),
      v.literal("running"),
      v.literal("stopped"),
      v.literal("failed"),
      v.literal("deleted")
    ),
    flyMachineId: v.optional(v.string()),
    ip: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { vmId, status, flyMachineId, ip, error }) => {
    const updates: any = { status };
    if (flyMachineId) updates.flyMachineId = flyMachineId;
    if (ip) updates.ip = ip;
    if (error) updates.error = error;
    if (status === "running") updates.error = undefined; // Clear error on success
    await ctx.db.patch(vmId, updates);
  },
});

// Provision a new VM on Fly.io
export const provision = action({
  args: { userId: v.id("users"), wallet: v.string() },
  handler: async (ctx, { userId, wallet }): Promise<{ success: true; vmId: Id<"vms">; appName: string; machineId: string }> => {
    const appName = `ordo-${wallet.slice(0, 8).toLowerCase()}-${Date.now().toString(36)}`;
    const region = "iad"; // US East, can make configurable

    // Fetch user's credentials and connections
    const credentials = await ctx.runQuery(internal.credentials.getFull, { userId });
    const connections = await ctx.runQuery(internal.connections.getAllFull, { userId });

    // Build environment variables for the container
    const envVars: Record<string, string> = {
      USER_WALLET: wallet,
      ORDO_AUTO_CONFIG: "true", // Signal to startup script to auto-configure
    };

    // Add Anthropic API key if set
    if (credentials?.anthropicKey) {
      envVars.ANTHROPIC_API_KEY = credentials.anthropicKey;
    }

    // Add channel tokens
    for (const conn of connections) {
      const envKey = `${conn.platform.toUpperCase()}_TOKEN`;
      if (conn.token) {
        envVars[envKey] = conn.token;
      }
    }

    // Create VM record first (provisioning status)
    const vmId: Id<"vms"> = await ctx.runMutation(internal.vms.create, {
      userId,
      flyAppName: appName,
      status: "provisioning",
      region,
    });

    try {
      const flyToken = process.env.FLY_API_TOKEN;
      if (!flyToken) {
        throw new Error("FLY_API_TOKEN not configured");
      }

      // 1. Create Fly app
      const appRes = await fetch("https://api.machines.dev/v1/apps", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_name: appName,
          org_slug: "personal",
        }),
      });

      if (!appRes.ok) {
        const error = await appRes.text();
        throw new Error(`Failed to create app: ${error}`);
      }

      // 2. Allocate shared IPv4 address
      const ipRes = await fetch("https://api.fly.io/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `mutation($input: AllocateIPAddressInput!) {
            allocateIpAddress(input: $input) {
              ipAddress { id address type }
            }
          }`,
          variables: {
            input: {
              appId: appName,
              type: "shared_v4",
            },
          },
        }),
      });

      if (!ipRes.ok) {
        const error = await ipRes.text();
        throw new Error(`Failed to allocate IP: ${error}`);
      }

      // 3. Create Machine with bot image
      const botImage = process.env.BOT_IMAGE;
      if (!botImage) {
        throw new Error("BOT_IMAGE not configured");
      }

      const machineRes = await fetch(
        `https://api.machines.dev/v1/apps/${appName}/machines`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${flyToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            config: {
              image: botImage,
              guest: {
                cpu_kind: "shared",
                cpus: 2,
                memory_mb: 2048,
              },
              env: envVars,
              services: [
                {
                  ports: [
                    {
                      port: 443,
                      handlers: ["tls", "http"],
                    },
                    {
                      port: 80,
                      handlers: ["http"],
                    },
                  ],
                  protocol: "tcp",
                  internal_port: 7681,
                },
              ],
            },
            region,
          }),
        }
      );

      if (!machineRes.ok) {
        const error = await machineRes.text();
        throw new Error(`Failed to create machine: ${error}`);
      }

      const machine = await machineRes.json();
      const terminalUrl = `https://${appName}.fly.dev`;

      // 4. Update VM record with machine info
      await ctx.runMutation(internal.vms.updateStatus, {
        vmId,
        status: "running",
        flyMachineId: machine.id,
        ip: terminalUrl,
      });

      return { success: true, vmId, appName, machineId: machine.id };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Update VM status to failed with error message
      await ctx.runMutation(internal.vms.updateStatus, {
        vmId,
        status: "failed",
        error: errorMessage,
      });

      throw err;
    }
  },
});

// Stop VM
export const stop = action({
  args: { vmId: v.id("vms") },
  handler: async (ctx, { vmId }) => {
    const vm = await ctx.runQuery(internal.vms.get, { vmId });
    if (!vm || !vm.flyMachineId) {
      throw new Error("VM not found");
    }

    const flyToken = process.env.FLY_API_TOKEN;
    if (!flyToken) {
      throw new Error("FLY_API_TOKEN not configured");
    }

    await fetch(
      `https://api.machines.dev/v1/apps/${vm.flyAppName}/machines/${vm.flyMachineId}/stop`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flyToken}`,
        },
      }
    );

    await ctx.runMutation(internal.vms.updateStatus, {
      vmId,
      status: "stopped",
    });

    return { success: true };
  },
});

// Internal: Stop VM (called by subscription expiry cron)
export const stopInternal = internalAction({
  args: { vmId: v.id("vms") },
  handler: async (ctx, { vmId }) => {
    const vm = await ctx.runQuery(internal.vms.get, { vmId });
    if (!vm || !vm.flyMachineId) {
      throw new Error("VM not found");
    }

    const flyToken = process.env.FLY_API_TOKEN;
    if (!flyToken) {
      throw new Error("FLY_API_TOKEN not configured");
    }

    await fetch(
      `https://api.machines.dev/v1/apps/${vm.flyAppName}/machines/${vm.flyMachineId}/stop`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flyToken}`,
        },
      }
    );

    await ctx.runMutation(internal.vms.updateStatus, {
      vmId,
      status: "stopped",
    });

    return { success: true };
  },
});

// Internal query to get VM by ID
export const get = internalQuery({
  args: { vmId: v.id("vms") },
  handler: async (ctx, { vmId }) => {
    return await ctx.db.get(vmId);
  },
});

// Retry failed VM provisioning
export const retry = action({
  args: { wallet: v.string() },
  handler: async (ctx, { wallet }): Promise<{ success: true; vmId: Id<"vms">; appName: string; machineId: string }> => {
    // Find user
    const user = await ctx.runQuery(internal.vms.getUserByWallet, { wallet }) as { _id: Id<"users">; wallet: string } | null;
    if (!user) {
      throw new Error("User not found");
    }

    // Find and delete the failed VM
    const existingVm = await ctx.runQuery(internal.vms.getByUserId, { userId: user._id });
    if (existingVm) {
      await ctx.runMutation(internal.vms.deleteVm, { vmId: existingVm._id });
    }

    // Trigger new provisioning
    return await ctx.runAction(internal.vms.provisionInternal, {
      userId: user._id,
      wallet,
    });
  },
});

// Internal: get user by wallet
export const getUserByWallet = internalQuery({
  args: { wallet: v.string() },
  handler: async (ctx, { wallet }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("wallet", wallet))
      .first();
  },
});

// Internal: get VM by userId
export const getByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("vms")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Internal: delete VM record
export const deleteVm = internalMutation({
  args: { vmId: v.id("vms") },
  handler: async (ctx, { vmId }) => {
    await ctx.db.delete(vmId);
  },
});

// Internal provision action (callable from other actions)
export const provisionInternal = internalAction({
  args: { userId: v.id("users"), wallet: v.string() },
  handler: async (ctx, { userId, wallet }): Promise<{ success: true; vmId: Id<"vms">; appName: string; machineId: string }> => {
    const appName = `ordo-${wallet.slice(0, 8).toLowerCase()}-${Date.now().toString(36)}`;
    const region = "iad";

    // Fetch user's credentials and connections
    const credentials = await ctx.runQuery(internal.credentials.getFull, { userId });
    const connections = await ctx.runQuery(internal.connections.getAllFull, { userId });

    // Build environment variables for the container
    const envVars: Record<string, string> = {
      USER_WALLET: wallet,
      ORDO_AUTO_CONFIG: "true",
    };

    if (credentials?.anthropicKey) {
      envVars.ANTHROPIC_API_KEY = credentials.anthropicKey;
    }

    for (const conn of connections) {
      const envKey = `${conn.platform.toUpperCase()}_TOKEN`;
      if (conn.token) {
        envVars[envKey] = conn.token;
      }
    }

    const vmId: Id<"vms"> = await ctx.runMutation(internal.vms.create, {
      userId,
      flyAppName: appName,
      status: "provisioning",
      region,
    });

    try {
      const flyToken = process.env.FLY_API_TOKEN;
      if (!flyToken) {
        throw new Error("FLY_API_TOKEN not configured");
      }

      const appRes = await fetch("https://api.machines.dev/v1/apps", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_name: appName,
          org_slug: "personal",
        }),
      });

      if (!appRes.ok) {
        const error = await appRes.text();
        throw new Error(`Failed to create app: ${error}`);
      }

      // Allocate shared IPv4 address
      const ipRes = await fetch("https://api.fly.io/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `mutation($input: AllocateIPAddressInput!) {
            allocateIpAddress(input: $input) {
              ipAddress { id address type }
            }
          }`,
          variables: {
            input: {
              appId: appName,
              type: "shared_v4",
            },
          },
        }),
      });

      if (!ipRes.ok) {
        const error = await ipRes.text();
        throw new Error(`Failed to allocate IP: ${error}`);
      }

      const botImage = process.env.BOT_IMAGE;
      if (!botImage) {
        throw new Error("BOT_IMAGE not configured");
      }

      const machineRes = await fetch(
        `https://api.machines.dev/v1/apps/${appName}/machines`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${flyToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            config: {
              image: botImage,
              guest: {
                cpu_kind: "shared",
                cpus: 2,
                memory_mb: 2048,
              },
              env: envVars,
              services: [
                {
                  ports: [
                    {
                      port: 443,
                      handlers: ["tls", "http"],
                    },
                    {
                      port: 80,
                      handlers: ["http"],
                    },
                  ],
                  protocol: "tcp",
                  internal_port: 7681,
                },
              ],
            },
            region,
          }),
        }
      );

      if (!machineRes.ok) {
        const error = await machineRes.text();
        throw new Error(`Failed to create machine: ${error}`);
      }

      const machine = await machineRes.json();
      const terminalUrl = `https://${appName}.fly.dev`;

      await ctx.runMutation(internal.vms.updateStatus, {
        vmId,
        status: "running",
        flyMachineId: machine.id,
        ip: terminalUrl,
      });

      return { success: true, vmId, appName, machineId: machine.id };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      await ctx.runMutation(internal.vms.updateStatus, {
        vmId,
        status: "failed",
        error: errorMessage,
      });

      throw err;
    }
  },
});
