import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield, Users, Star, Plus, Search, ChevronRight,
  Crown, Sword, Trophy, Lock, Globe, Upload, X, Check,
  Sparkles, AlertTriangle
} from "lucide-react";

interface Guild {
  id: string;
  name: string;
  motto: string;
  level: number;
  members: number;
  maxMembers: number;
  mainImage: string;
  bannerImage: string;
  owner: string;
  isOpen: boolean;
  tags: string[];
}

const MOCK_GUILDS: Guild[] = [
  {
    id: "1",
    name: "Shadow Garden",
    motto: "We are… Shadow Garden.",
    level: 12,
    members: 48,
    maxMembers: 50,
    mainImage: "https://i.imgur.com/JZmcpFC.png",
    bannerImage: "https://i.imgur.com/wSTFkRM.jpg",
    owner: "Kurumi",
    isOpen: false,
    tags: ["RPG", "PvP", "Elite"],
  },
  {
    id: "2",
    name: "Crimson Demons",
    motto: "EXPLOSION! That is our calling.",
    level: 9,
    members: 32,
    maxMembers: 40,
    mainImage: "https://i.imgur.com/QkIa5Tl.png",
    bannerImage: "https://i.imgur.com/3yMsRSk.jpg",
    owner: "Megumin",
    isOpen: true,
    tags: ["Magic", "Casual", "Fun"],
  },
  {
    id: "3",
    name: "Axis Order",
    motto: "Praise Aqua! Join us and be blessed!",
    level: 7,
    members: 21,
    maxMembers: 50,
    mainImage: "https://i.imgur.com/placeholder.png",
    bannerImage: "https://i.imgur.com/placeholder.jpg",
    owner: "Aqua_Fan",
    isOpen: true,
    tags: ["Casual", "Economy", "Support"],
  },
  {
    id: "4",
    name: "Crusader Alliance",
    motto: "We will protect everyone! (whether they like it or not)",
    level: 5,
    members: 15,
    maxMembers: 30,
    mainImage: "https://i.imgur.com/placeholder2.png",
    bannerImage: "https://i.imgur.com/placeholder2.jpg",
    owner: "Darkness",
    isOpen: true,
    tags: ["Tank", "PvP", "Defense"],
  },
];

function GuildCard({ guild, onView }: { guild: Guild; onView: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/[0.08] bg-[#0f1117] overflow-hidden cursor-pointer group"
      onClick={onView}
    >
      {/* Banner */}
      <div className="h-24 bg-gradient-to-br from-[#4effff]/10 to-[#8b5cf6]/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1117]/80" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-2 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#0b0d12] border-2 border-[#4effff]/30 flex items-center justify-center overflow-hidden">
              <Shield className="h-5 w-5 text-[#4effff]/60" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none">{guild.name}</p>
              <p className="text-[10px] text-white/40 mt-0.5">by {guild.owner}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#4effff]/10 border border-[#4effff]/20">
            <Star className="h-3 w-3 text-[#4effff]" />
            <span className="text-xs text-[#4effff] font-black">Lv {guild.level}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-xs text-white/40 italic mb-3 line-clamp-1">"{guild.motto}"</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-white/30" />
            <span className="text-xs text-white/50">{guild.members}/{guild.maxMembers}</span>
          </div>
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
            ${guild.isOpen ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {guild.isOpen ? <><Globe className="h-2.5 w-2.5" /> OPEN</> : <><Lock className="h-2.5 w-2.5" /> INVITE ONLY</>}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-white/[0.06] mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4effff]/60 to-[#4effff]"
            style={{ width: `${(guild.members / guild.maxMembers) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {guild.tags.slice(0, 2).map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#4effff]/08 text-[#4effff]/60 font-bold">{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#4effff]/60 group-hover:text-[#4effff] transition-colors font-bold">
            View <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreateGuildModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: Partial<Guild>) => void }) {
  const [form, setForm] = useState({ name: "", motto: "", mainImage: "", bannerImage: "" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Guild name is required"); return; }
    if (!form.motto.trim()) { setError("Motto is required"); return; }
    onCreate(form);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        className="w-full max-w-lg rounded-3xl border border-[#4effff]/15 bg-[#0f1117] p-6 shadow-[0_0_60px_rgba(78,255,255,0.08)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white">Create Guild</h2>
            <p className="text-xs text-white/30 mt-0.5">Minimum Level 3 required</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Guild Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Shadow Garden"
              maxLength={32}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/40 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Motto *</label>
            <input
              value={form.motto}
              onChange={e => setForm(f => ({ ...f, motto: e.target.value }))}
              placeholder="Your guild's rallying cry…"
              maxLength={80}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/40 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Main Image URL</label>
            <div className="flex gap-2">
              <input
                value={form.mainImage}
                onChange={e => setForm(f => ({ ...f, mainImage: e.target.value }))}
                placeholder="https://… (guild icon)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/40 transition-all"
              />
              {form.mainImage && (
                <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
                  <img src={form.mainImage} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Banner Image URL</label>
            <input
              value={form.bannerImage}
              onChange={e => setForm(f => ({ ...f, bannerImage: e.target.value }))}
              placeholder="https://… (wide banner image)"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/40 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.08] text-sm font-bold text-white/50 hover:text-white hover:border-white/20 transition-all">
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[rgba(78,255,255,0.15)] border border-[#4effff]/30 text-[#4effff] text-sm font-black hover:bg-[rgba(78,255,255,0.25)] transition-all"
            >
              CREATE GUILD
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function GuildDetailModal({ guild, onClose, onJoin }: { guild: Guild; onClose: () => void; onJoin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0f1117] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]"
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-to-br from-[#4effff]/15 to-[#8b5cf6]/15 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1117]" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-5 flex items-end gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0b0d12] border-2 border-[#4effff]/40 flex items-center justify-center">
              <Shield className="h-7 w-7 text-[#4effff]/60" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{guild.name}</h2>
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-[#f59e0b]" />
                <span className="text-xs text-white/40">{guild.owner}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-white/50 italic mb-5">"{guild.motto}"</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: Star, label: "Level", value: guild.level },
              { icon: Users, label: "Members", value: `${guild.members}/${guild.maxMembers}` },
              { icon: Trophy, label: "Rank", value: "#4" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <s.icon className="h-4 w-4 text-[#4effff] mx-auto mb-1" />
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-[10px] text-white/30 font-bold">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-5 flex-wrap">
            {guild.tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-[#4effff]/08 border border-[#4effff]/20 text-[#4effff] text-xs font-bold">{t}</span>
            ))}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${guild.isOpen ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {guild.isOpen ? "Open" : "Invite Only"}
            </span>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.08] text-sm font-bold text-white/50 hover:text-white transition-all">
              Close
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onJoin}
              disabled={!guild.isOpen || guild.members >= guild.maxMembers}
              className="flex-1 py-3 rounded-xl bg-[rgba(78,255,255,0.15)] border border-[#4effff]/30 text-[#4effff] text-sm font-black hover:bg-[rgba(78,255,255,0.25)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {guild.members >= guild.maxMembers ? "FULL" : guild.isOpen ? "REQUEST TO JOIN" : "INVITE ONLY"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Guild() {
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState("");
  const [guilds, setGuilds] = useState<Guild[]>(MOCK_GUILDS);
  const [showCreate, setShowCreate] = useState(false);
  const [viewGuild, setViewGuild] = useState<Guild | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showMsg(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function handleCreate(data: Partial<Guild>) {
    const newGuild: Guild = {
      id: Date.now().toString(),
      name: data.name!,
      motto: data.motto!,
      level: 3,
      members: 1,
      maxMembers: 20,
      mainImage: data.mainImage || "",
      bannerImage: data.bannerImage || "",
      owner: user?.name || "You",
      isOpen: true,
      tags: ["New"],
    };
    setGuilds(g => [newGuild, ...g]);
    setShowCreate(false);
    showMsg(`Guild "${newGuild.name}" created!`);
  }

  function handleJoin(guild: Guild) {
    setViewGuild(null);
    showMsg(`Join request sent to ${guild.name}!`);
  }

  const filtered = guilds.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.motto.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0d12] pt-8 px-4 pb-16">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[9999] px-5 py-3 rounded-2xl border text-sm font-bold flex items-center gap-2"
            style={{
              background: toast.ok ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
              borderColor: toast.ok ? "#34d39940" : "#ef444440",
              color: toast.ok ? "#34d399" : "#ef4444",
            }}
          >
            {toast.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(78,255,255,0.08)] border border-[#4effff]/20 text-[#4effff] text-xs font-black tracking-widest uppercase mb-3">
                <Sword className="h-3 w-3" />
                Guild System
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Guilds</h1>
              <p className="text-sm text-white/40 mt-1">Join a guild or forge your own legacy</p>
            </div>

            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[rgba(78,255,255,0.12)] border border-[#4effff]/30 text-[#4effff] text-sm font-black hover:bg-[rgba(78,255,255,0.22)] transition-all shadow-[0_0_20px_rgba(78,255,255,0.1)]"
              >
                <Plus className="h-4 w-4" />
                Create Guild
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white/40 font-bold">
                <Lock className="h-3.5 w-3.5" />
                Login to create a guild
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Shield, label: "Total Guilds", value: guilds.length },
            { icon: Users, label: "Total Members", value: guilds.reduce((a, g) => a + g.members, 0) },
            { icon: Globe, label: "Open Guilds", value: guilds.filter(g => g.isOpen).length },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-[#4effff]/10 bg-[rgba(78,255,255,0.04)] p-4 text-center"
            >
              <s.icon className="h-5 w-5 text-[#4effff] mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-white/30 font-bold mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
          <Search className="h-4 w-4 text-white/30 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guilds by name or motto…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
          />
        </div>

        {/* Guild Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-8 w-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/30 font-bold">No guilds found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GuildCard guild={g} onView={() => setViewGuild(g)} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Level requirement notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-4 rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/05 flex items-start gap-3"
        >
          <Sparkles className="h-4 w-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#f59e0b]">Guild Creation Requirements</p>
            <p className="text-xs text-[#f59e0b]/60 mt-0.5">
              You must be at least <strong>Level 3</strong> to create a guild. Your guild needs a name, banner image, main image, and a motto. Once created, members can request to join.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CreateGuildModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
        {viewGuild && <GuildDetailModal guild={viewGuild} onClose={() => setViewGuild(null)} onJoin={() => handleJoin(viewGuild)} />}
      </AnimatePresence>
    </div>
  );
}
