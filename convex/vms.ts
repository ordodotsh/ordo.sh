import { v } from "convex/values";
import { query, action, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
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
    serverName: v.string(),
    hetznerServerId: v.optional(v.number()),
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
    hetznerServerId: v.optional(v.number()),
    ip: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { vmId, status, hetznerServerId, ip, error }) => {
    const updates: any = { status };
    if (hetznerServerId) updates.hetznerServerId = hetznerServerId;
    if (ip) updates.ip = ip;
    if (error) updates.error = error;
    if (status === "running") updates.error = undefined; // Clear error on success
    await ctx.db.patch(vmId, updates);
  },
});

// Generate cloud-init user data for Hetzner server
function generateCloudInit(envVars: Record<string, string>, botImage: string): string {
  // Escape values for shell
  const escapeForShell = (s: string) => s.replace(/'/g, "'\\''");
  
  // Build env file content
  const envFileContent = Object.entries(envVars)
    .map(([k, v]) => `${k}='${escapeForShell(v)}'`)
    .join('\n');

  return `#cloud-config
package_update: true
package_upgrade: true

packages:
  - docker.io
  - docker-compose
  - xvfb
  - chromium-browser
  - fonts-liberation
  - libnss3
  - libatk-bridge2.0-0
  - libgtk-3-0

runcmd:
  # Enable Docker
  - systemctl enable docker
  - systemctl start docker
  
  # Create directories
  - mkdir -p /opt/ordo
  - mkdir -p /home/ordo/.clawdbot
  - mkdir -p /home/ordo/clawd
  
  # Write environment file
  - |
    cat > /opt/ordo/.env << 'ENVEOF'
${envFileContent}
ENVEOF
  
  # Write docker-compose file
  - |
    cat > /opt/ordo/docker-compose.yml << 'COMPOSEEOF'
version: '3.8'
services:
  clawdbot:
    image: ${botImage}
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - HOME=/home/node
      - NODE_ENV=production
      - DISPLAY=:99
      - CLAWDBOT_GATEWAY_BIND=lan
      - CLAWDBOT_GATEWAY_PORT=18789
    volumes:
      - /home/ordo/.clawdbot:/home/node/.clawdbot
      - /home/ordo/clawd:/home/node/clawd
    network_mode: host
    depends_on:
      - xvfb
    command: clawdbot gateway
  
  xvfb:
    image: selenium/standalone-chrome:latest
    restart: unless-stopped
    environment:
      - DISPLAY=:99
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix
    network_mode: host
    command: Xvfb :99 -screen 0 1920x1080x24

  ttyd:
    image: tsl0922/ttyd:latest
    restart: unless-stopped
    command: ttyd -W -p 7681 docker exec -it ordo-clawdbot-1 /bin/bash
    ports:
      - "7681:7681"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
COMPOSEEOF

  # Pull images and start (gateway runs automatically as container's main process)
  - cd /opt/ordo && docker-compose pull
  - cd /opt/ordo && docker-compose up -d

  # Set up firewall (allow SSH, HTTP, HTTPS, ttyd)
  - ufw allow 22/tcp
  - ufw allow 80/tcp
  - ufw allow 443/tcp
  - ufw allow 7681/tcp
  - ufw --force enable
`;
}

// Provision a new VM on Hetzner Cloud
export const provision = action({
  args: { userId: v.id("users"), wallet: v.string() },
  handler: async (ctx, { userId, wallet }): Promise<{ success: true; vmId: Id<"vms">; serverName: string; serverId: number }> => {
    const serverName = `ordo-${wallet.slice(0, 8).toLowerCase()}-${Date.now().toString(36)}`;
    const region = "nbg1"; // Nuremberg, Germany - good connectivity

    // Fetch user's credentials and connections
    const credentials = await ctx.runQuery(internal.credentials.getFull, { userId });
    const connections = await ctx.runQuery(internal.connections.getAllFull, { userId });

    // Build environment variables for the container
    const envVars: Record<string, string> = {
      USER_WALLET: wallet,
      ORDO_AUTO_CONFIG: "true",
    };

    // Add Anthropic API key if set
    if (credentials?.anthropicKey) {
      envVars.ANTHROPIC_API_KEY = credentials.anthropicKey;
    }

    // Add channel tokens and configs
    for (const conn of connections) {
      if (conn.platform === "telegram_user") {
        if (conn.config?.apiId) envVars.TELEGRAM_API_ID = conn.config.apiId;
        if (conn.config?.apiHash) envVars.TELEGRAM_API_HASH = conn.config.apiHash;
        if (conn.config?.phone) envVars.TELEGRAM_PHONE = conn.config.phone;
      } else if (conn.platform === "email") {
        if (conn.config?.imapHost) envVars.EMAIL_IMAP_HOST = conn.config.imapHost;
        if (conn.config?.imapUser) envVars.EMAIL_IMAP_USER = conn.config.imapUser;
        if (conn.token) envVars.EMAIL_IMAP_PASS = conn.token;
        if (conn.config?.smtpHost) envVars.EMAIL_SMTP_HOST = conn.config.smtpHost;
      } else {
        const envKey = `${conn.platform.toUpperCase()}_TOKEN`;
        if (conn.token) {
          envVars[envKey] = conn.token;
        }
      }
    }

    // Create VM record first (provisioning status)
    const vmId: Id<"vms"> = await ctx.runMutation(internal.vms.create, {
      userId,
      serverName,
      status: "provisioning",
      region,
    });

    try {
      const hetznerToken = process.env.HETZNER_API_TOKEN;
      if (!hetznerToken) {
        throw new Error("HETZNER_API_TOKEN not configured");
      }

      const botImage = await ctx.runQuery(api.settings.getBotImage, {});
      if (!botImage) {
        throw new Error("BOT_IMAGE not configured");
      }

      // Generate cloud-init script
      const userData = generateCloudInit(envVars, botImage);

      // Create Hetzner server
      const serverRes = await fetch("https://api.hetzner.cloud/v1/servers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hetznerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: serverName,
          server_type: "cx22",        // 2 vCPU, 4GB RAM - ~€4.50/month
          image: "ubuntu-24.04",      // Ubuntu 24.04 LTS
          location: region,
          start_after_create: true,
          user_data: userData,
          labels: {
            ordo: "true",
            wallet: wallet.slice(0, 8).toLowerCase(),
          },
          public_net: {
            enable_ipv4: true,
            enable_ipv6: true,
          },
        }),
      });

      if (!serverRes.ok) {
        const error = await serverRes.text();
        throw new Error(`Failed to create server: ${error}`);
      }

      const serverData = await serverRes.json();
      const server = serverData.server;
      const publicIp = server.public_net?.ipv4?.ip;
      
      // Terminal URL will be http://IP:7681 (ttyd)
      const terminalUrl = publicIp ? `http://${publicIp}:7681` : undefined;

      // Update VM record with server info
      await ctx.runMutation(internal.vms.updateStatus, {
        vmId,
        status: "running",
        hetznerServerId: server.id,
        ip: terminalUrl,
      });

      return { success: true, vmId, serverName, serverId: server.id };
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

// Stop VM (shutdown)
export const stop = action({
  args: { vmId: v.id("vms") },
  handler: async (ctx, { vmId }) => {
    const vm = await ctx.runQuery(internal.vms.get, { vmId });
    if (!vm || !vm.hetznerServerId) {
      throw new Error("VM not found");
    }

    const hetznerToken = process.env.HETZNER_API_TOKEN;
    if (!hetznerToken) {
      throw new Error("HETZNER_API_TOKEN not configured");
    }

    // Shutdown the server (graceful)
    const res = await fetch(
      `https://api.hetzner.cloud/v1/servers/${vm.hetznerServerId}/actions/shutdown`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hetznerToken}`,
        },
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to stop server: ${error}`);
    }

    await ctx.runMutation(internal.vms.updateStatus, {
      vmId,
      status: "stopped",
    });

    return { success: true };
  },
});

// Start VM (power on)
export const start = action({
  args: { vmId: v.id("vms") },
  handler: async (ctx, { vmId }) => {
    const vm = await ctx.runQuery(internal.vms.get, { vmId });
    if (!vm || !vm.hetznerServerId) {
      throw new Error("VM not found");
    }

    const hetznerToken = process.env.HETZNER_API_TOKEN;
    if (!hetznerToken) {
      throw new Error("HETZNER_API_TOKEN not configured");
    }

    const res = await fetch(
      `https://api.hetzner.cloud/v1/servers/${vm.hetznerServerId}/actions/poweron`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hetznerToken}`,
        },
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to start server: ${error}`);
    }

    await ctx.runMutation(internal.vms.updateStatus, {
      vmId,
      status: "running",
    });

    return { success: true };
  },
});

// Internal: Stop VM (called by subscription expiry cron)
export const stopInternal = internalAction({
  args: { vmId: v.id("vms") },
  handler: async (ctx, { vmId }) => {
    const vm = await ctx.runQuery(internal.vms.get, { vmId });
    if (!vm || !vm.hetznerServerId) {
      throw new Error("VM not found");
    }

    const hetznerToken = process.env.HETZNER_API_TOKEN;
    if (!hetznerToken) {
      throw new Error("HETZNER_API_TOKEN not configured");
    }

    await fetch(
      `https://api.hetzner.cloud/v1/servers/${vm.hetznerServerId}/actions/shutdown`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hetznerToken}`,
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

// Retry failed VM provisioning (reprovision)
export const retry = action({
  args: { wallet: v.string() },
  handler: async (ctx, { wallet }): Promise<{ success: true; vmId: Id<"vms">; serverName: string; serverId: number }> => {
    const user = await ctx.runQuery(internal.vms.getUserByWallet, { wallet }) as { _id: Id<"users">; wallet: string } | null;
    if (!user) {
      throw new Error("User not found");
    }

    // Find and delete the existing VM (and Hetzner server)
    const existingVm = await ctx.runQuery(internal.vms.getByUserId, { userId: user._id });
    if (existingVm) {
      // Delete from Hetzner if it exists
      if (existingVm.hetznerServerId) {
        const hetznerToken = process.env.HETZNER_API_TOKEN;
        if (hetznerToken) {
          await fetch(
            `https://api.hetzner.cloud/v1/servers/${existingVm.hetznerServerId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${hetznerToken}`,
              },
            }
          );
        }
      }
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
  handler: async (ctx, { userId, wallet }): Promise<{ success: true; vmId: Id<"vms">; serverName: string; serverId: number }> => {
    const serverName = `ordo-${wallet.slice(0, 8).toLowerCase()}-${Date.now().toString(36)}`;
    const region = "nbg1";

    const credentials = await ctx.runQuery(internal.credentials.getFull, { userId });
    const connections = await ctx.runQuery(internal.connections.getAllFull, { userId });

    const envVars: Record<string, string> = {
      USER_WALLET: wallet,
      ORDO_AUTO_CONFIG: "true",
    };

    if (credentials?.anthropicKey) {
      envVars.ANTHROPIC_API_KEY = credentials.anthropicKey;
    }

    for (const conn of connections) {
      if (conn.platform === "telegram_user") {
        if (conn.config?.apiId) envVars.TELEGRAM_API_ID = conn.config.apiId;
        if (conn.config?.apiHash) envVars.TELEGRAM_API_HASH = conn.config.apiHash;
        if (conn.config?.phone) envVars.TELEGRAM_PHONE = conn.config.phone;
      } else if (conn.platform === "email") {
        if (conn.config?.imapHost) envVars.EMAIL_IMAP_HOST = conn.config.imapHost;
        if (conn.config?.imapUser) envVars.EMAIL_IMAP_USER = conn.config.imapUser;
        if (conn.token) envVars.EMAIL_IMAP_PASS = conn.token;
        if (conn.config?.smtpHost) envVars.EMAIL_SMTP_HOST = conn.config.smtpHost;
      } else {
        const envKey = `${conn.platform.toUpperCase()}_TOKEN`;
        if (conn.token) {
          envVars[envKey] = conn.token;
        }
      }
    }

    const vmId: Id<"vms"> = await ctx.runMutation(internal.vms.create, {
      userId,
      serverName,
      status: "provisioning",
      region,
    });

    try {
      const hetznerToken = process.env.HETZNER_API_TOKEN;
      if (!hetznerToken) {
        throw new Error("HETZNER_API_TOKEN not configured");
      }

      const botImage = await ctx.runQuery(api.settings.getBotImage, {});
      if (!botImage) {
        throw new Error("BOT_IMAGE not configured");
      }

      const userData = generateCloudInit(envVars, botImage);

      const serverRes = await fetch("https://api.hetzner.cloud/v1/servers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hetznerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: serverName,
          server_type: "cx22",
          image: "ubuntu-24.04",
          location: region,
          start_after_create: true,
          user_data: userData,
          labels: {
            ordo: "true",
            wallet: wallet.slice(0, 8).toLowerCase(),
          },
          public_net: {
            enable_ipv4: true,
            enable_ipv6: true,
          },
        }),
      });

      if (!serverRes.ok) {
        const error = await serverRes.text();
        throw new Error(`Failed to create server: ${error}`);
      }

      const serverData = await serverRes.json();
      const server = serverData.server;
      const publicIp = server.public_net?.ipv4?.ip;
      const terminalUrl = publicIp ? `http://${publicIp}:7681` : undefined;

      await ctx.runMutation(internal.vms.updateStatus, {
        vmId,
        status: "running",
        hetznerServerId: server.id,
        ip: terminalUrl,
      });

      return { success: true, vmId, serverName, serverId: server.id };
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
