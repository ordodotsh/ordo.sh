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
    dropletName: v.string(),
    dropletId: v.optional(v.number()),
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
    dropletId: v.optional(v.number()),
    ip: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { vmId, status, dropletId, ip, error }) => {
    const updates: any = { status };
    if (dropletId) updates.dropletId = dropletId;
    if (ip) updates.ip = ip;
    if (error) updates.error = error;
    if (status === "running") updates.error = undefined; // Clear error on success
    await ctx.db.patch(vmId, updates);
  },
});

// Generate cloud-init user data for DigitalOcean droplet
function generateCloudInit(envVars: Record<string, string>, botImage: string): string {
  // Build Docker env flags
  const envFlags = Object.entries(envVars)
    .map(([k, v]) => `-e ${k}="${v.replace(/"/g, '\\"')}"`)
    .join(' \\\n    ');

  // Simple shell script approach - more reliable than cloud-config YAML
  return `#!/bin/bash
set -ex

# Log everything
exec > /var/log/ordo-setup.log 2>&1

echo "=== Ordo.sh Setup Started ==="
date

# Set root password to 'ordo' for easy console access
echo 'root:ordo' | chpasswd

# Install Docker
apt-get update
apt-get install -y docker.io
systemctl enable docker
systemctl start docker

# Wait for Docker to be ready
sleep 5
docker version

# Create data directories with correct ownership (UID 1000 = kasm-user in container)
mkdir -p /opt/ordo/data/.openclaw
mkdir -p /opt/ordo/data/workspace
mkdir -p /opt/ordo/data/.config
chown -R 1000:1000 /opt/ordo/data

# Pull and run the ordo-bot container
# The container has Chrome, Xvfb, ttyd, and OpenClaw all built-in
docker pull ${botImage}

docker run -d \\
    --name ordo-bot \\
    --restart unless-stopped \\
    --network host \\
    ${envFlags} \\
    -v /opt/ordo/data/.openclaw:/home/ordo/.openclaw \\
    -v /opt/ordo/data/workspace:/home/ordo/ordo \\
    ${botImage}

# Wait for container to start
sleep 10

# Show container status
docker ps
docker logs ordo-bot

echo "=== Ordo.sh Setup Complete ==="
date
`;
}

// Provision a new VM on DigitalOcean
export const provision = action({
  args: { userId: v.id("users"), wallet: v.string() },
  handler: async (ctx, { userId, wallet }): Promise<{ success: true; vmId: Id<"vms">; dropletName: string; dropletId: number }> => {
    const dropletName = `ordo-${wallet.slice(0, 8).toLowerCase()}-${Date.now().toString(36)}`;
    const region = "nyc1"; // New York - good for US users

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
      dropletName,
      status: "provisioning",
      region,
    });

    try {
      const doToken = process.env.DIGITALOCEAN_API_TOKEN;
      if (!doToken) {
        throw new Error("DIGITALOCEAN_API_TOKEN not configured");
      }

      const botImage = await ctx.runQuery(api.settings.getBotImage, {});
      if (!botImage) {
        throw new Error("BOT_IMAGE not configured");
      }

      // Generate cloud-init script
      const userData = generateCloudInit(envVars, botImage);

      // Create DigitalOcean droplet
      const dropletRes = await fetch("https://api.digitalocean.com/v2/droplets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${doToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: dropletName,
          region: region,
          size: "s-2vcpu-4gb",        // 2 vCPU, 4GB RAM - $24/month
          image: "ubuntu-24-04-x64",  // Ubuntu 24.04 LTS
          user_data: userData,
          tags: ["ordo", wallet.slice(0, 8).toLowerCase()],
        }),
      });

      if (!dropletRes.ok) {
        const error = await dropletRes.text();
        throw new Error(`Failed to create droplet: ${error}`);
      }

      const dropletData = await dropletRes.json();
      const droplet = dropletData.droplet;
      
      // DigitalOcean doesn't return IP immediately - need to poll
      // For now, schedule a follow-up to get the IP
      await ctx.runMutation(internal.vms.updateStatus, {
        vmId,
        status: "provisioning",
        dropletId: droplet.id,
      });

      // Schedule IP fetch (droplet takes ~60s to provision)
      await ctx.scheduler.runAfter(60000, internal.vms.fetchDropletIp, {
        vmId,
        dropletId: droplet.id,
      });

      return { success: true, vmId, dropletName, dropletId: droplet.id };
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

// Fetch droplet IP after provisioning (scheduled)
export const fetchDropletIp = internalAction({
  args: { vmId: v.id("vms"), dropletId: v.number() },
  handler: async (ctx, { vmId, dropletId }) => {
    const doToken = process.env.DIGITALOCEAN_API_TOKEN;
    if (!doToken) {
      throw new Error("DIGITALOCEAN_API_TOKEN not configured");
    }

    const res = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
      headers: {
        Authorization: `Bearer ${doToken}`,
      },
    });

    if (!res.ok) {
      // Retry in 30 seconds
      await ctx.scheduler.runAfter(30000, internal.vms.fetchDropletIp, {
        vmId,
        dropletId,
      });
      return;
    }

    const data = await res.json();
    const droplet = data.droplet;
    
    // Find public IPv4
    const publicIp = droplet.networks?.v4?.find(
      (n: any) => n.type === "public"
    )?.ip_address;

    if (!publicIp) {
      // Retry in 30 seconds
      await ctx.scheduler.runAfter(30000, internal.vms.fetchDropletIp, {
        vmId,
        dropletId,
      });
      return;
    }

    // Store raw IP - frontend constructs URLs for port 6901 (desktop) and 7681 (terminal)
    await ctx.runMutation(internal.vms.updateStatus, {
      vmId,
      status: "running",
      ip: publicIp,  // Store raw IP, derive URLs in frontend
    });
  },
});

// Stop VM (power off)
export const stop = action({
  args: { vmId: v.id("vms") },
  handler: async (ctx, { vmId }) => {
    const vm = await ctx.runQuery(internal.vms.get, { vmId });
    if (!vm || !vm.dropletId) {
      throw new Error("VM not found");
    }

    const doToken = process.env.DIGITALOCEAN_API_TOKEN;
    if (!doToken) {
      throw new Error("DIGITALOCEAN_API_TOKEN not configured");
    }

    // Power off the droplet
    const res = await fetch(
      `https://api.digitalocean.com/v2/droplets/${vm.dropletId}/actions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${doToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "power_off" }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to stop droplet: ${error}`);
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
    if (!vm || !vm.dropletId) {
      throw new Error("VM not found");
    }

    const doToken = process.env.DIGITALOCEAN_API_TOKEN;
    if (!doToken) {
      throw new Error("DIGITALOCEAN_API_TOKEN not configured");
    }

    const res = await fetch(
      `https://api.digitalocean.com/v2/droplets/${vm.dropletId}/actions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${doToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "power_on" }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to start droplet: ${error}`);
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
    if (!vm || !vm.dropletId) {
      throw new Error("VM not found");
    }

    const doToken = process.env.DIGITALOCEAN_API_TOKEN;
    if (!doToken) {
      throw new Error("DIGITALOCEAN_API_TOKEN not configured");
    }

    await fetch(
      `https://api.digitalocean.com/v2/droplets/${vm.dropletId}/actions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${doToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "power_off" }),
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
  handler: async (ctx, { wallet }): Promise<{ success: true; vmId: Id<"vms">; dropletName: string; dropletId: number }> => {
    const user = await ctx.runQuery(internal.vms.getUserByWallet, { wallet }) as { _id: Id<"users">; wallet: string } | null;
    if (!user) {
      throw new Error("User not found");
    }

    // Find and delete the existing VM (and DigitalOcean droplet)
    const existingVm = await ctx.runQuery(internal.vms.getByUserId, { userId: user._id });
    if (existingVm) {
      // Delete from DigitalOcean if it exists
      if (existingVm.dropletId) {
        const doToken = process.env.DIGITALOCEAN_API_TOKEN;
        if (doToken) {
          await fetch(
            `https://api.digitalocean.com/v2/droplets/${existingVm.dropletId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${doToken}`,
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
  handler: async (ctx, { userId, wallet }): Promise<{ success: true; vmId: Id<"vms">; dropletName: string; dropletId: number }> => {
    const dropletName = `ordo-${wallet.slice(0, 8).toLowerCase()}-${Date.now().toString(36)}`;
    const region = "nyc1";

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
      dropletName,
      status: "provisioning",
      region,
    });

    try {
      const doToken = process.env.DIGITALOCEAN_API_TOKEN;
      if (!doToken) {
        throw new Error("DIGITALOCEAN_API_TOKEN not configured");
      }

      const botImage = await ctx.runQuery(api.settings.getBotImage, {});
      if (!botImage) {
        throw new Error("BOT_IMAGE not configured");
      }

      const userData = generateCloudInit(envVars, botImage);

      const dropletRes = await fetch("https://api.digitalocean.com/v2/droplets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${doToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: dropletName,
          region: region,
          size: "s-2vcpu-4gb",
          image: "ubuntu-24-04-x64",
          user_data: userData,
          tags: ["ordo", wallet.slice(0, 8).toLowerCase()],
        }),
      });

      if (!dropletRes.ok) {
        const error = await dropletRes.text();
        throw new Error(`Failed to create droplet: ${error}`);
      }

      const dropletData = await dropletRes.json();
      const droplet = dropletData.droplet;

      await ctx.runMutation(internal.vms.updateStatus, {
        vmId,
        status: "provisioning",
        dropletId: droplet.id,
      });

      // Schedule IP fetch
      await ctx.scheduler.runAfter(60000, internal.vms.fetchDropletIp, {
        vmId,
        dropletId: droplet.id,
      });

      return { success: true, vmId, dropletName, dropletId: droplet.id };
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
