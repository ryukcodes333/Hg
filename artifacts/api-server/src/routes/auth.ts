import { Router } from "express";
import jwt from "jsonwebtoken";
import { User, WebOtp } from "../lib/mongodb";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { RequestOtpBody, VerifyOtpBody } from "@workspace/api-zod";

const router = Router();

function cleanPhone(phone: string): string {
  return String(phone).split("@")[0].split(":")[0].replace(/\D/g, "");
}

function formatUser(u: Record<string, unknown>) {
  return {
    phone: u.phone,
    name: u.name || "Unknown",
    bio: u.bio || "",
    title: u.title || "Newcomer",
    role: u.role || "member",
    level: (u.level as number) ?? 1,
    xp: (u.xp as number) ?? 0,
    // Use ?? (nullish coalescing) not || so that a legitimate 0 balance is never
    // replaced with the default value.  || treats 0 as falsy → always shows $500.
    wallet: (u.wallet as number) ?? 0,
    bank: (u.bank as number) ?? 500,
    gems: (u.gems as number) ?? 0,
    streak: (u.streak as number) ?? 0,
    premium: u.premium || false,
    banned: u.banned || false,
    profilePp: u.profile_pp || null,
    profileBg: u.profile_bg || null,
    profileFrame: u.profile_frame || 1,
    pokemonBadges: u.pokemon_badges || 0,
    pokemonWins: u.pokemon_wins || 0,
    pokemonLosses: u.pokemon_losses || 0,
    reputation: u.reputation || 0,
    className: u.class_name || null,
    createdAt: u.createdAt || u.created_at || new Date().toISOString(),
  };
}

// POST /api/auth/request-otp
router.post("/auth/request-otp", async (req, res) => {
  try {
    const parsed = RequestOtpBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, message: "Invalid request" });
      return;
    }

    const phone = cleanPhone(parsed.data.phone);
    if (!phone || phone.length < 7) {
      res.status(400).json({ ok: false, message: "Invalid phone number. Include country code, no + or spaces." });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in MongoDB
    await WebOtp.findOneAndUpdate(
      { phone },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    // Try to send OTP via bot API
    const botUrl = process.env.BOT_API_URL?.replace(/\/$/, "");
    if (botUrl) {
      try {
        await fetch(`${botUrl}/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        });
        req.log.info({ phone }, "OTP sent via bot API");
        res.json({ ok: true, message: "OTP sent to your WhatsApp number", devOtp: null });
        return;
      } catch (err) {
        req.log.warn({ err }, "Bot API unavailable, falling back to devOtp");
      }
    }

    // Dev mode: return OTP in response
    req.log.info({ phone, otp }, "Dev mode: OTP generated");
    res.json({
      ok: true,
      message: "OTP generated (dev mode — bot not connected)",
      devOtp: process.env.NODE_ENV === "production" ? null : otp,
    });
  } catch (err) {
    req.log.error({ err }, "request-otp error");
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const parsed = VerifyOtpBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, message: "Invalid request" });
      return;
    }

    const phone = cleanPhone(parsed.data.phone);
    const { otp, name } = parsed.data;

    const record = await WebOtp.findOne({ phone }).lean() as Record<string, unknown> | null;
    if (!record) {
      res.status(401).json({ ok: false, message: "No OTP found for this number. Request a new one." });
      return;
    }

    if (new Date() > new Date(record.expiresAt as string)) {
      res.status(401).json({ ok: false, message: "OTP expired. Request a new one." });
      return;
    }

    if (record.otp !== otp.trim()) {
      res.status(401).json({ ok: false, message: "Incorrect OTP. Try again." });
      return;
    }

    // Mark as verified
    await WebOtp.findOneAndUpdate({ phone }, { verified: true });

    // Get or create user
    let user = await User.findOne({ phone }).lean() as Record<string, unknown> | null;
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const newUser = await User.create({
        phone,
        name: name || phone,
        wallet: 0,
        bank: 500,
        gems: 0,
        xp: 0,
        level: 1,
      });
      user = newUser.toObject();
    } else if (name && (!user.name || user.name === user.phone)) {
      await User.findOneAndUpdate({ phone }, { $set: { name } });
      user = { ...user, name };
    }

    // Issue JWT
    const token = jwt.sign(
      { phone, name: user!.name },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "30d" }
    );

    res.json({ ok: true, token, user: formatUser(user!), isNewUser });
  } catch (err) {
    req.log.error({ err }, "verify-otp error");
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const phone = req.user!.phone;
    const user = await User.findOne({ phone }).lean() as Record<string, unknown> | null;
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "get-me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { formatUser };
export default router;
