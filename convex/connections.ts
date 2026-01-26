import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

const platformValidator = v.union(
  v.literal("telegram"),
  v.literal("discord"),
  v.literal("slack"),
  v.literal("whatsapp")
);

// Get all connections for a user (masked tokens)
export const getAll = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Return masked tokens for security
    return connections.map((conn) => ({
      _id: conn._id,
      platform: conn.platform,
      status: conn.status,
      hasToken: !!conn.token,
      tokenPreview: conn.token ? `...${conn.token.slice(-4)}` : null,
      connectedAt: conn.connectedAt,
    }));
  },
});

// Add or update a connection
export const save = mutation({
  args: {
    userId: v.id("users"),
    platform: platformValidator,
    token: v.string(),
    config: v.optional(v.any()),
  },
  handler: async (ctx, { userId, platform, token, config }) => {
    // Check if connection already exists
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("platform"), platform))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        token,
        config,
        status: "active",
        connectedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("connections", {
      userId,
      platform,
      token,
      config,
      status: "active",
      connectedAt: Date.now(),
    });
  },
});

// Remove a connection
export const remove = mutation({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, { connectionId }) => {
    await ctx.db.delete(connectionId);
  },
});

// Internal: get all connections with full tokens (for VM)
export const getAllFull = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});
