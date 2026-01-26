import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Get user's active subscription
export const getActive = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!sub) return null;

    // Check if still active
    if (sub.status === "active" && sub.expiresAt && sub.expiresAt > Date.now()) {
      return sub;
    }

    return null;
  },
});

// Create a pending subscription (waiting for payment)
export const createPending = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subId = await ctx.db.insert("subscriptions", {
      userId,
      status: "pending",
    });
    return subId;
  },
});

// Activate subscription after payment verified
export const activate = mutation({
  args: {
    userId: v.id("users"),
    txSignature: v.string(),
    solAmount: v.number(),
  },
  handler: async (ctx, { userId, txSignature, solAmount }) => {
    // Check if there's already an active subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    // 30 days from now (or extend existing)
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = existing?.expiresAt
      ? Math.max(existing.expiresAt, now) + thirtyDays
      : now + thirtyDays;

    if (existing) {
      // Extend existing subscription
      await ctx.db.patch(existing._id, {
        expiresAt,
        txSignature,
        solAmount,
        paidAt: now,
      });
      return existing._id;
    }

    // Create new active subscription
    const subId = await ctx.db.insert("subscriptions", {
      userId,
      status: "active",
      txSignature,
      solAmount,
      paidAt: now,
      expiresAt,
    });

    return subId;
  },
});

// Mark subscription as expired
export const expire = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, { subscriptionId }) => {
    await ctx.db.patch(subscriptionId, {
      status: "expired",
    });
  },
});

// Create subscription from wallet address (called from frontend after payment)
export const create = mutation({
  args: {
    wallet: v.string(),
    txSignature: v.string(),
    solAmount: v.number(),
  },
  handler: async (ctx, { wallet, txSignature, solAmount }) => {
    // Find user by wallet
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("wallet", wallet))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if there's already an active subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    // 30 days from now (or extend existing)
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = existing?.expiresAt
      ? Math.max(existing.expiresAt, now) + thirtyDays
      : now + thirtyDays;

    if (existing) {
      // Extend existing subscription
      await ctx.db.patch(existing._id, {
        expiresAt,
        txSignature,
        solAmount,
        paidAt: now,
      });
      return existing._id;
    }

    // Create new active subscription
    const subId = await ctx.db.insert("subscriptions", {
      userId: user._id,
      status: "active",
      txSignature,
      solAmount,
      paidAt: now,
      expiresAt,
    });

    // Check if user already has a VM
    const existingVm = await ctx.db
      .query("vms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // If no VM, schedule provisioning
    if (!existingVm) {
      await ctx.scheduler.runAfter(0, api.vms.provision, {
        userId: user._id,
        wallet,
      });
    }

    return subId;
  },
});
