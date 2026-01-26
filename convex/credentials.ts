import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

// Get user's credentials (masked for security)
export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const creds = await ctx.db
      .query("credentials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!creds) return null;

    // Return masked version for display
    return {
      hasAnthropicKey: !!creds.anthropicKey,
      anthropicKeyPreview: creds.anthropicKey
        ? `sk-ant-...${creds.anthropicKey.slice(-4)}`
        : null,
      updatedAt: creds.updatedAt,
    };
  },
});

// Save Anthropic API key
export const saveAnthropicKey = mutation({
  args: {
    userId: v.id("users"),
    anthropicKey: v.string(),
  },
  handler: async (ctx, { userId, anthropicKey }) => {
    // Validate key format
    if (!anthropicKey.startsWith("sk-ant-")) {
      throw new Error("Invalid Anthropic API key format");
    }

    const existing = await ctx.db
      .query("credentials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        anthropicKey,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("credentials", {
      userId,
      anthropicKey,
      updatedAt: Date.now(),
    });
  },
});

// Internal query to get full credentials (for VM provisioning)
export const getFull = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("credentials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});
