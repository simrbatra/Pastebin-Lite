
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health Check
  app.get(api.healthz.path, (req, res) => {
    res.json({ ok: true });
  });

  // Create Paste
  app.post(api.pastes.create.path, async (req, res) => {
    try {
      const input = api.pastes.create.input.parse(req.body);
      const paste = await storage.createPaste(input);
      
      // Construct public URL
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host;
      const url = `${protocol}://${host}/p/${paste.id}`;

      res.status(201).json({ id: paste.id, url });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // Simple seed on startup (check if any pastes exist)
  // We can't easily check count without exposing it in storage, but we can try to get a known ID or just skip it.
  // Actually, let's just create a welcome paste if we can.
  // For now, we'll skip complex seeding as the app is simple.
  // But let's add a log to confirm routes registered.
  console.log("Routes registered");


  // Get Paste API
  app.get(api.pastes.get.path, async (req, res) => {
    const id = req.params.id;
    const paste = await storage.getPaste(id);

    // 1. Check if exists
    if (!paste) {
      return res.status(404).json({ message: "Paste not found" });
    }

    // Determine "now" based on test header
    const testNowHeader = req.headers["x-test-now-ms"];
    const now = testNowHeader 
      ? new Date(parseInt(testNowHeader as string, 10)) 
      : new Date();

    // 2. Check Expiry (TTL)
    if (paste.expiresAt && now > paste.expiresAt) {
      return res.status(404).json({ message: "Paste expired" });
    }

    // 3. Check View Limit
    // "Paste with max_views = 1: first API fetch → 200, second API fetch → 404"
    // This implies we check BEFORE incrementing or use the current value.
    // If maxViews is set, and views >= maxViews, it's unavailable.
    if (paste.maxViews !== null && paste.views >= paste.maxViews) {
      return res.status(404).json({ message: "View limit exceeded" });
    }

    // Increment view count (side effect of successful fetch)
    await storage.incrementView(id);

    // Prepare response
    const remainingViews = paste.maxViews !== null 
      ? Math.max(0, paste.maxViews - (paste.views + 1)) 
      : null;

    res.json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null,
    });
  });

  return httpServer;
}
