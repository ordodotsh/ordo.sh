import { v } from "convex/values";
import { query, mutation, httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Get a setting by key
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return setting?.value ?? null;
  },
});

// Set a setting (internal only)
export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, { key, value }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("settings", { key, value, updatedAt: Date.now() });
    }
  },
});

// Get the current bot image (with fallback to env var)
export const getBotImage = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "BOT_IMAGE"))
      .first();
    
    // Fall back to environment variable if not set in DB
    return setting?.value ?? process.env.BOT_IMAGE ?? "ghcr.io/ordodotsh/ordo-bot:latest";
  },
});
