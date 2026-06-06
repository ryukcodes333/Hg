import { Router } from "express";
import { User } from "../lib/mongodb";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { formatUser } from "./auth";
import { UpdateProfileBody } from "@workspace/api-zod";

const router = Router();

// GET /api/profile
router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findOne({ phone: req.user!.phone }).lean() as Record<string, unknown> | null;
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "get-profile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/profile
router.put("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
    if (parsed.data.profilePp !== undefined) updates.profile_pp = parsed.data.profilePp;
    if (parsed.data.profileBg !== undefined) updates.profile_bg = parsed.data.profileBg;
    if (parsed.data.profileFrame !== undefined) updates.profile_frame = parsed.data.profileFrame;

    const user = await User.findOneAndUpdate(
      { phone: req.user!.phone },
      { $set: updates },
      { new: true }
    ).lean() as Record<string, unknown> | null;

    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "update-profile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/:phone/profile
router.get("/users/:phone/profile", async (req, res) => {
  try {
    const phone = req.params.phone.replace(/\D/g, "");
    const user = await User.findOne({ phone }).lean() as Record<string, unknown> | null;
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "get-user-profile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
