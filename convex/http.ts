import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Webhook to update the bot image after GitHub Action builds
http.route({
  path: "/api/update-bot-image",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify the secret token
    const authHeader = request.headers.get("Authorization");
    const expectedToken = process.env.WEBHOOK_SECRET;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const body = await request.json();
      const { image, sha } = body as { image?: string; sha?: string };

      if (!image && !sha) {
        return new Response("Missing image or sha", { status: 400 });
      }

      // Build the image URL from SHA if provided
      const imageUrl = image || `ghcr.io/ordodotsh/ordo-bot:${sha}`;

      // Update the setting
      await ctx.runMutation(api.settings.set, {
        key: "BOT_IMAGE",
        value: imageUrl,
      });

      return new Response(JSON.stringify({ success: true, image: imageUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(`Error: ${error}`, { status: 500 });
    }
  }),
});

export default http;
