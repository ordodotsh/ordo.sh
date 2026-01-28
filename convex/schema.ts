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

  // VMs - one per user, running clawdbot on DigitalOcean
  vms: defineTable({
    userId: v.id("users"),
    // DigitalOcean fields
    dropletName: v.optional(v.string()),  // DigitalOcean droplet name
    dropletId: v.optional(v.number()),    // DigitalOcean droplet ID
    // Legacy Fly.io fields (for migration)
    flyAppName: v.optional(v.string()),
    flyMachineId: v.optional(v.string()),
    // Common fields
    status: v.union(
      v.literal("provisioning"),
      v.literal("running"),
      v.literal("stopped"),
      v.literal("failed"),
      v.literal("deleted")
    ),
    region: v.string(),                   // DO region (nyc1, sfo3, etc.)
    ip: v.optional(v.string()),           // Public IPv4 (terminal URL)
    createdAt: v.number(),
    error: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),

  // User credentials - API keys for clawdbot
  credentials: defineTable({
    userId: v.id("users"),
    anthropicKey: v.optional(v.string()),
    openaiKey: v.optional(v.string()),
    googleKey: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Chat connections - Telegram, Discord, etc.
  connections: defineTable({
    userId: v.id("users"),
    platform: v.union(
      v.literal("telegram"),
      v.literal("telegram_user"),
      v.literal("discord"),
      v.literal("slack"),
      v.literal("whatsapp"),
      v.literal("email")
    ),
    token: v.optional(v.string()), // Bot token for the platform
    config: v.optional(v.any()),   // Additional platform-specific config
    status: v.union(v.literal("active"), v.literal("inactive")),
    connectedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Waitlist - pre-launch signups
  waitlist: defineTable({
    xHandle: v.string(),
    createdAt: v.number(),
  }).index("by_handle", ["xHandle"]),

  // Settings - system configuration
  settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
