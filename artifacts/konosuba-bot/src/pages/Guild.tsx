import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield, Users, Star, Plus, Search, ChevronRight,
  Crown, Sword, Trophy, Lock, Globe, X, Check,
  Sparkles, AlertTriangle, Loader2, RefreshCw
} from "lucide-react";

interface Guild {
  _id: string;
  name: string;
  motto: string;
  level: number;
  memberCount: number;
  maxMembers: number;
  mainImage: string;
  bannerImage: string;
  owner: string;
  isOpen: boolean;
  tags: string[];
}

const API = "/api";

async function apiFetch(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> || {}) } });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

function GuildCard({ guild, onView }: { guild: Guild; onView: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/[0.08] bg-[#0f1117] overflow-hidden cursor-pointer group"
      onClick={onView}
    >
      <div
        className="h-24 bg-gradient-to-br from-[#4effff]/10 to-[#8b5cf6]/10 relative overflow-hidden"
        style={guild.bannerImage ? { backgroundImage: `url(${guild.bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1117]/80" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-2 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#0b0d12] border-2 border-[#4effff]/30 flex items-center justify-center overflow-hidden">
              {guild.mainImage
                ? <img src={guild.mainImage} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : <Shield className="h-5 w-5 text-[#4effff]/60" />}
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

      <div className="p-4">
        <p className="text-xs text-white/40 italic mb-3 line-clamp-1">"{guild.motto}"</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-white/30" />
            <span className="text-xs text-white/50">{guild.memberCount}/{guild.maxMembers}</span>
          </div>
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
            ${guild.isOpen ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {guild.isOpen ? <><Globe className="h-2.5 w-2.5" /> OPEN</> : <><Lock className="h-2.5 w-2.5" /> INVITE ONLY</>}
          </span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.06] mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4effff]/60 to-[#4effff]"
            style={{ width: `${Math.min((guild.memberCount / guild.maxMembers) * 100, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {(guild.tags || []).slice(0, 2).map(t => (
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

function CreateGuildModal({ onClose, onCreate, loading }: {
  onClose: () => void;
  onCreate: (data: { name: string; motto: string; mainImage: string; bannerImage: string }) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState({ name: "", motto: "", mainImage: "", bannerImage: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Guild name is required"); return; }
    if (!form.motto.trim()) { setError("Motto is required"); return; }
    setError("");
    setSubmitting(true);
    try {
      await onCreate(form);
    } catch (err: any) {
      setError(err.message || "Failed to create guild");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
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
          {[
            { key: "name", label: "Guild Name *", placeholder: "e.g. Shadow Garden", max: 32 },
            { key: "motto", label: "Motto *", placeholder: "Your guild's rallying cry…", max: 80 },
            { key: "mainImage", label: "Main Image URL", placeholder: "https://… (guild icon)", max: 500 },
            { key: "bannerImage", label: "Banner Image URL", placeholder: "https://… (wide banner image)", max: 500 },
          ].map(({ key, label, placeholder, max }) => (
            <div key={key}>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 block">{label}</label>
              <div className="flex gap-2">
                <input
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  maxLength={max}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/40 transition-all"
                />
                {(key === "mainImage") && (form as any)[key] && (
                  <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
                    <img src={(form as any)[key]} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
            </div>
          ))}

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
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[rgba(78,255,255,0.15)] border border-[#4effff]/30 text-[#4effff] text-sm font-black hover:bg-[rgba(78,255,255,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "CREATE GUILD"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function GuildDetailModal({ guild, onClose, onJoin }: { guild: Guild; onClose: () => void; onJoin: () => Promise<void> }) {
  const [joining, setJoining] = useState(false);

  async function handleJoin() {
    setJoining(true);
    try { await onJoin(); } finally { setJoining(false); }
  }

  const isFull = guild.memberCount >= guild.maxMembers;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0f1117] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]"
      >
        <div
          className="h-32 bg-gradient-to-br from-[#4effff]/15 to-[#8b5cf6]/15 relative"
          style={guild.bannerImage ? { backgroundImage: `url(${guild.bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1117]" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-5 flex items-end gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0b0d12] border-2 border-[#4effff]/40 flex items-center justify-center overflow-hidden">
              {guild.mainImage
                ? <img src={guild.mainImage} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : <Shield className="h-7 w-7 text-[#4effff]/60" />}
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
              { icon: Users, label: "Members", value: `${guild.memberCount}/${guild.maxMembers}` },
              { icon: Trophy, label: "Status", value: guild.isOpen ? "Open" : "Closed" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <s.icon className="h-4 w-4 text-[#4effff] mx-auto mb-1" />
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-[10px] text-white/30 font-bold">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-5 flex-wrap">
            {(guild.tags || []).map(t => (
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
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={isFull || joining}
              className="flex-1 py-3 rounded-xl bg-[rgba(78,255,255,0.15)] border border-[#4effff]/30 text-[#4effff] text-sm font-black hover:bg-[rgba(78,255,255,0.25)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {joining
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Joining…</>
                : isFull ? "FULL" : guild.isOpen ? "JOIN GUILD" : "REQUEST TO JOIN"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GuildPage() {
  const { isAuthenticated, token } = useAuth();
  const [search, setSearch] = useState("");
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewGuild, setViewGuild] = useState<Guild | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showMsg(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const fetchGuilds = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (q) params.set("search", q);
      const data = await apiFetch(`/guilds?${params}`);
      setGuilds(data.guilds || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load guilds");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  useEffect(() => {
    const t = setTimeout(() => fetchGuilds(search), 350);
    return () => clearTimeout(t);
  }, [search, fetchGuilds]);

  async function handleCreate(data: { name: string; motto: string; mainImage: string; bannerImage: string }) {
    const result = await apiFetch("/guilds", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
    setShowCreate(false);
    showMsg(`Guild "${result.guild.name}" created!`);
    fetchGuilds(search);
  }

  async function handleJoin(guild: Guild) {
    if (!isAuthenticated) { showMsg("Login to join guilds", false); return; }
    try {
      const result = await apiFetch(`/guilds/${guild._id}/request`, { method: "POST" }, token);
      setViewGuild(null);
      showMsg(result.message || "Request sent!");
      fetchGuilds(search);
    } catch (err: any) {
      showMsg(err.message || "Failed to join guild", false);
    }
  }

  const openCount = guilds.filter(g => g.isOpen).length;
  const totalMembers = guilds.reduce((a, g) => a + (g.memberCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0b0d12] pt-8 px-4 pb-16">
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(78,255,255,0.08)] border border-[#4effff]/20 text-[#4effff] text-xs font-black tracking-widest uppercase mb-3">
                <Sword className="h-3 w-3" />
                Guild System
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Guilds</h1>
              <p className="text-sm text-white/40 mt-1">Join a guild or forge your own legacy</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchGuilds(search)}
                className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-all"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              {isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
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
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Shield, label: "Total Guilds", value: loading ? "…" : total },
            { icon: Users, label: "Total Members", value: loading ? "…" : totalMembers },
            { icon: Globe, label: "Open Guilds", value: loading ? "…" : openCount },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-[#4effff]/10 bg-[rgba(78,255,255,0.04)] p-4 text-center"
            >
              <s.icon className="h-5 w-5 text-[#4effff] mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-white/30 font-bold mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
          <Search className="h-4 w-4 text-white/30 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guilds by name or motto…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-white/20 hover:text-white/50 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 text-[#4effff] animate-spin" />
            <p className="text-white/30 text-sm font-bold">Loading guilds…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertTriangle className="h-8 w-8 text-red-400/60" />
            <p className="text-red-400/60 text-sm font-bold">{error}</p>
            <button onClick={() => fetchGuilds(search)} className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white/50 hover:text-white font-bold transition-all">
              Try Again
            </button>
          </div>
        ) : guilds.length === 0 ? (
          <div className="text-center py-24">
            <Sparkles className="h-8 w-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/30 font-bold">{search ? "No guilds match your search" : "No guilds yet — be the first!"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guilds.map((g, i) => (
              <motion.div key={g._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GuildCard guild={g} onView={() => setViewGuild(g)} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-10 p-4 rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/05 flex items-start gap-3"
        >
          <Sparkles className="h-4 w-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#f59e0b]">Guild Creation Requirements</p>
            <p className="text-xs text-[#f59e0b]/60 mt-0.5">
              You must be at least <strong>Level 3</strong> to create a guild. Your guild needs a name and a motto. Once created, members can request to join.
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCreate && <CreateGuildModal onClose={() => setShowCreate(false)} onCreate={handleCreate} loading={loading} />}
        {viewGuild && <GuildDetailModal guild={viewGuild} onClose={() => setViewGuild(null)} onJoin={() => handleJoin(viewGuild)} />}
      </AnimatePresence>
    </div>
  );
}
