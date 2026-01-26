import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin wallets - these get free lifetime access
const ADMIN_WALLETS = [
  "vzKiUT2mjZqCce8iLgm9SJUUGd7bY9fXd3De56LRdTq", // Treasury wallet
];

export const isAdmin = (wallet: string) => ADMIN_WALLETS.includes(wallet);

// Get user by wallet address
export const getByWallet = query({
  args: { wallet: v.string() },
  handler: async (ctx, { wallet }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("wallet", wallet))
      .first();
  },
});

// Create or get existing user
export const getOrCreate = mutation({
  args: { wallet: v.string() },
  handler: async (ctx, { wallet }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("wallet", wallet))
      .first();

    if (existing) {
      // For admins, ensure they have a subscription
      if (isAdmin(wallet)) {
        const existingSub = await ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q) => q.eq("userId", existing._id))
          .first();

        if (!existingSub) {
          // Create lifetime admin subscription (no auto-provisioning - admins use manual button)
          await ctx.db.insert("subscriptions", {
            userId: existing._id,
            status: "active",
            paidAt: Date.now(),
            expiresAt: Date.now() + (100 * 365 * 24 * 60 * 60 * 1000), // 100 years
          });
        }
      }
      return existing;
    }

    const userId = await ctx.db.insert("users", {
      wallet,
      createdAt: Date.now(),
    });

    // Auto-subscribe admins (no auto-provisioning - admins use manual button)
    if (isAdmin(wallet)) {
      await ctx.db.insert("subscriptions", {
        userId,
        status: "active",
        paidAt: Date.now(),
        expiresAt: Date.now() + (100 * 365 * 24 * 60 * 60 * 1000), // 100 years
      });
    }

    return await ctx.db.get(userId);
  },
});

// Get user's full dashboard data (user, subscription, vm, connections)
export const getDashboard = query({
  args: { wallet: v.string() },
  handler: async (ctx, { wallet }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("wallet", wallet))
      .first();

    if (!user) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    const vm = await ctx.db
      .query("vms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const connections = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      user,
      subscription,
      vm,
      connections,
      isAdmin: isAdmin(wallet),
    };
  },
});
