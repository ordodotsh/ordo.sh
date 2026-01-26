import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users - identified by Solana wallet
  users: defineTable({
    wallet: v.string(),
    createdAt: v.number(),
  }).index("by_wallet", ["wallet"]),

  // Subscriptions - track payments
  subscriptions: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    txSignature: v.optional(v.string()),
    solAmount: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // VMs - one per user, running clawdbot
  vms: defineTable({
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
    createdAt: v.number(),
    error: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_fly_app", ["flyAppName"]),

  // Chat connections - Telegram, Discord, etc.
  connections: defineTable({
    userId: v.id("users"),
    platform: v.union(
      v.literal("telegram"),
      v.literal("discord"),
      v.literal("slack"),
      v.literal("whatsapp")
    ),
    config: v.optional(v.any()),
    connectedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Waitlist - pre-launch signups
  waitlist: defineTable({
    xHandle: v.string(),
    createdAt: v.number(),
  }).index("by_handle", ["xHandle"]),
});
