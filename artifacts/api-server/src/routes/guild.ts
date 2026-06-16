import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { User } from "../lib/mongodb";

const router = Router();

const guildSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    motto:       { type: String, required: true },
    mainImage:   { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    owner:       { type: String, required: true },
    members:     { type: [String], default: [] },
    maxMembers:  { type: Number, default: 20 },
    level:       { type: Number, default: 3 },
    isOpen:      { type: Boolean, default: true },
    tags:        { type: [String], default: [] },
    requests:    { type: [String], default: [] },
  },
  { timestamps: true }
);

const Guild = mongoose.models["Guild"] || mongoose.model("Guild", guildSchema);

// GET /api/guilds
router.get("/guilds", async (req, res) => {
  try {
    const page  = parseInt(String(req.query.page  || "1"));
    const limit = Math.min(parseInt(String(req.query.limit || "20")), 50);
    const search = String(req.query.search || "");

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: "i" } },
        { motto: { $regex: search, $options: "i" } },
      ];
    }

    const [guilds, total] = await Promise.all([
      Guild.find(query)
        .select("-requests -members")
        .sort({ level: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Guild.countDocuments(query),
    ]);

    const mapped = (guilds as any[]).map(g => ({
      ...g,
      memberCount: g.members?.length ?? 0,
    }));

    res.json({ ok: true, guilds: mapped, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "get-guilds error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// GET /api/guilds/:id
router.get("/guilds/:id", async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id).lean() as any;
    if (!guild) { res.status(404).json({ ok: false, error: "Guild not found" }); return; }
    res.json({ ok: true, guild: { ...guild, memberCount: guild.members?.length ?? 0 } });
  } catch (err) {
    req.log.error({ err }, "get-guild error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/guilds — create guild (auth required, level >= 3)
router.post("/guilds", requireAuth, async (req: AuthRequest, res) => {
  try {
    const phone = req.user!.phone;
    const user = await User.findOne({ phone }).lean() as any;

    if (!user) { res.status(401).json({ ok: false, error: "User not found" }); return; }
    if ((user.level ?? 1) < 3) {
      res.status(403).json({ ok: false, error: "You must be at least Level 3 to create a guild." });
      return;
    }

    const { name, motto, mainImage, bannerImage } = req.body as {
      name: string; motto: string; mainImage?: string; bannerImage?: string;
    };

    if (!name?.trim()) { res.status(400).json({ ok: false, error: "Guild name is required" }); return; }
    if (!motto?.trim()) { res.status(400).json({ ok: false, error: "Motto is required" }); return; }

    const existing = await Guild.findOne({ name: name.trim() }).lean();
    if (existing) { res.status(409).json({ ok: false, error: "A guild with that name already exists" }); return; }

    const guild = await Guild.create({
      name: name.trim(),
      motto: motto.trim(),
      mainImage:   mainImage || "",
      bannerImage: bannerImage || "",
      owner: phone,
      members: [phone],
      level: 3,
      isOpen: true,
    });

    res.status(201).json({ ok: true, guild });
  } catch (err) {
    req.log.error({ err }, "create-guild error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/guilds/:id/request — request to join
router.post("/guilds/:id/request", requireAuth, async (req: AuthRequest, res) => {
  try {
    const phone = req.user!.phone;
    const guild = await Guild.findById(req.params.id).lean() as any;
    if (!guild) { res.status(404).json({ ok: false, error: "Guild not found" }); return; }

    if (guild.members.includes(phone)) {
      res.status(409).json({ ok: false, error: "Already a member" }); return;
    }
    if (guild.requests?.includes(phone)) {
      res.status(409).json({ ok: false, error: "Request already pending" }); return;
    }

    if (guild.isOpen && guild.members.length < guild.maxMembers) {
      await Guild.findByIdAndUpdate(req.params.id, { $push: { members: phone } });
      res.json({ ok: true, message: "Joined guild!" });
    } else {
      await Guild.findByIdAndUpdate(req.params.id, { $push: { requests: phone } });
      res.json({ ok: true, message: "Join request sent to guild owner." });
    }
  } catch (err) {
    req.log.error({ err }, "guild-request error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// DELETE /api/guilds/:id/leave — leave guild
router.delete("/guilds/:id/leave", requireAuth, async (req: AuthRequest, res) => {
  try {
    const phone = req.user!.phone;
    const guild = await Guild.findById(req.params.id).lean() as any;
    if (!guild) { res.status(404).json({ ok: false, error: "Guild not found" }); return; }

    if (guild.owner === phone) {
      res.status(403).json({ ok: false, error: "Guild owner cannot leave — transfer ownership or delete the guild." });
      return;
    }

    await Guild.findByIdAndUpdate(req.params.id, { $pull: { members: phone } });
    res.json({ ok: true, message: "Left the guild." });
  } catch (err) {
    req.log.error({ err }, "guild-leave error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;
