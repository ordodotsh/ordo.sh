import Anthropic from "@anthropic-ai/sdk";
import { Telegraf } from "telegraf";
import { Client, Events, GatewayIntentBits } from "discord.js";

// Environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const USER_WALLET = process.env.USER_WALLET;

if (!ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is required");
  process.exit(1);
}

// Initialize Anthropic client
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Store conversation history per user
const conversations = new Map<string, Array<{ role: "user" | "assistant"; content: string }>>();

async function chat(userId: string, message: string): Promise<string> {
  // Get or create conversation history
  let history = conversations.get(userId) || [];

  // Add user message
  history.push({ role: "user", content: message });

  // Keep last 20 messages to avoid context overflow
  if (history.length > 20) {
    history = history.slice(-20);
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are a helpful AI assistant running on Ordo.sh, a personal cloud AI platform.
You're chatting with a user whose wallet is ${USER_WALLET || "unknown"}.
Be friendly, helpful, and concise. You can help with coding, writing, analysis, and general questions.`,
      messages: history,
    });

    const assistantMessage = response.content[0].type === "text"
      ? response.content[0].text
      : "I couldn't generate a response.";

    // Add assistant response to history
    history.push({ role: "assistant", content: assistantMessage });
    conversations.set(userId, history);

    return assistantMessage;
  } catch (error) {
    console.error("Anthropic API error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
}

// Telegram Bot
function startTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("No TELEGRAM_BOT_TOKEN - skipping Telegram bot");
    return;
  }

  const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

  bot.start((ctx) => {
    ctx.reply("Hello! I'm your personal Ordo AI assistant. Send me a message and I'll help you out!");
  });

  bot.help((ctx) => {
    ctx.reply("Just send me any message and I'll respond! I can help with coding, writing, research, and more.");
  });

  bot.on("text", async (ctx) => {
    const userId = `telegram:${ctx.from.id}`;
    const message = ctx.message.text;

    // Show typing indicator
    await ctx.sendChatAction("typing");

    const response = await chat(userId, message);

    // Split long messages (Telegram limit is 4096 chars)
    if (response.length > 4000) {
      const chunks = response.match(/.{1,4000}/gs) || [response];
      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    } else {
      await ctx.reply(response);
    }
  });

  bot.launch();
  console.log("Telegram bot started");

  // Graceful shutdown
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

// Discord Bot
function startDiscordBot() {
  if (!DISCORD_BOT_TOKEN) {
    console.log("No DISCORD_BOT_TOKEN - skipping Discord bot");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`Discord bot ready as ${c.user.tag}`);
  });

  client.on(Events.MessageCreate, async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Only respond to DMs or mentions
    const isMentioned = message.mentions.has(client.user!);
    const isDM = !message.guild;

    if (!isDM && !isMentioned) return;

    // Remove mention from message
    const content = message.content.replace(/<@!?\d+>/g, "").trim();
    if (!content) return;

    const userId = `discord:${message.author.id}`;

    // Show typing
    await message.channel.sendTyping();

    const response = await chat(userId, content);

    // Split long messages (Discord limit is 2000 chars)
    if (response.length > 1900) {
      const chunks = response.match(/.{1,1900}/gs) || [response];
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(response);
    }
  });

  client.login(DISCORD_BOT_TOKEN);
}

// Main
console.log("Starting Ordo bot...");
console.log(`User wallet: ${USER_WALLET || "not set"}`);

startTelegramBot();
startDiscordBot();

// Keep process alive
if (!TELEGRAM_BOT_TOKEN && !DISCORD_BOT_TOKEN) {
  console.error("No bot tokens configured. Set TELEGRAM_BOT_TOKEN or DISCORD_BOT_TOKEN.");
  process.exit(1);
}

console.log("Ordo bot is running!");
