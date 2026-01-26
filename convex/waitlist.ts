import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add to waitlist
export const join = mutation({
  args: { xHandle: v.string() },
  handler: async (ctx, { xHandle }) => {
    // Check if already on waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_handle", (q) => q.eq("xHandle", xHandle))
      .first();

    if (existing) {
      return { success: true, alreadyJoined: true };
    }

    await ctx.db.insert("waitlist", {
      xHandle,
      createdAt: Date.now(),
    });

    return { success: true, alreadyJoined: false };
  },
});

// Get waitlist count
export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("waitlist").collect();
    return entries.length;
  },
});
