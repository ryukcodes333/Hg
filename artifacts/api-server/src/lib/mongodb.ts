import mongoose from "mongoose";
import { logger } from "./logger";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.warn("MONGO_URI not set — skipping MongoDB connection");
    return;
  }
  try {
    await mongoose.connect(uri);
    isConnected = true;
    logger.info("MongoDB connected");

    // Drop legacy non-sparse jid_1 index if it exists
    try {
      const db = mongoose.connection.db;
      const usersCol = db!.collection("users");
      const indexes = await usersCol.indexes();
      const hasJidIndex = indexes.some(
        (i) => i["name"] === "jid_1" && !i["sparse"]
      );
      if (hasJidIndex) {
        await usersCol.dropIndex("jid_1");
        logger.info("Dropped stale jid_1 index");
      }
    } catch (idxErr: unknown) {
      logger.warn({ err: idxErr }, "Could not clean jid index");
    }
  } catch (err) {
    logger.error({ err }, "MongoDB connection error");
  }
}

// ── Schemas ─────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true, sparse: true },
    name: { type: String, default: "Unknown" },
    password: { type: String, default: null },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 500 },
    bank_limit: { type: Number, default: 50000 },
    gems: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    rpg_xp: { type: Number, default: 0 },
    rpg_wallet: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    banned: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    role: { type: String, default: "member" },
    title: { type: String, default: "Newcomer" },
    bio: { type: String, default: "" },
    pokemon_badges: { type: Number, default: 0 },
    pokemon_wins: { type: Number, default: 0 },
    pokemon_losses: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    reputation: { type: Number, default: 0 },
    class_name: { type: String, default: null },
    skill_xp: { type: String, default: "{}" },
    profile_pp: { type: String, default: null },
    profile_bg: { type: String, default: null },
    profile_frame: { type: Number, default: 1 },
    jid: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const webOtpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});
webOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const inventorySchema = new mongoose.Schema({
  phone: String,
  item: String,
  quantity: { type: Number, default: 1 },
});
inventorySchema.index({ phone: 1, item: 1 }, { unique: true });

const cardSchema = new mongoose.Schema(
  {
    name: String,
    tier: String,
    series: String,
    price: { type: Number, default: 35000 },
    image_url: String,
    rarity: String,
    uploaded_by: String,
    external_id: { type: String, sparse: true },
  },
  { timestamps: true }
);

const userCardSchema = new mongoose.Schema(
  {
    phone: String,
    card_id: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
    in_deck: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userPokemonSchema = new mongoose.Schema(
  {
    phone: String,
    name: String,
    pokemon_id: Number,
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    hp: Number,
    max_hp: Number,
    in_party: { type: Boolean, default: true },
    is_shiny: { type: Boolean, default: false },
    types: { type: [String], default: [] },
    moves: { type: [String], default: [] },
    ball: { type: String, default: "pokeball" },
    slot: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    card_id: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
  },
  { timestamps: true }
);
wishlistSchema.index({ phone: 1, card_id: 1 }, { unique: true });

// ── Models ──────────────────────────────────────────────────────────────────

export const User =
  mongoose.models["User"] || mongoose.model("User", userSchema);
export const WebOtp =
  mongoose.models["WebOtp"] || mongoose.model("WebOtp", webOtpSchema);
export const Inventory =
  mongoose.models["Inventory"] || mongoose.model("Inventory", inventorySchema);
export const Card =
  mongoose.models["Card"] || mongoose.model("Card", cardSchema);
export const UserCard =
  mongoose.models["UserCard"] || mongoose.model("UserCard", userCardSchema);
export const UserPokemon =
  mongoose.models["UserPokemon"] ||
  mongoose.model("UserPokemon", userPokemonSchema);
export const Wishlist =
  mongoose.models["Wishlist"] || mongoose.model("Wishlist", wishlistSchema);
