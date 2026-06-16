import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Building2, Coins, Swords, Image, Radio,
  Bell, Wrench, Bot, Shield, Zap, Search, Ban, Star, Trash2,
  Download, RefreshCw, AlertTriangle, Lock, Unlock, Activity,
  TrendingUp, Database, Clock, Server, Eye, Edit2, Plus, Minus,
  Play, StopCircle, Volume2, Key, LogOut, X, ChevronRight,
  BarChart3, Wifi, MessageSquare, Gift, Megaphone, Code,
  Terminal, RotateCcw, Globe, Cpu, ShieldAlert, History,
  Fingerprint, SmartphoneIcon, AlertOctagon, PauseCircle,
  Sparkles, CheckCircle2, XCircle, Timer, Package
} from "lucide-react";

const ADMIN_PASSWORD = "Konosuba$Castle91!MysticRain";
const STORAGE_KEY = "admin_auth_v1";

type Section =
  | "dashboard" | "users" | "groups" | "economy" | "pokemon"
  | "content" | "monitoring" | "broadcast" | "devtools" | "ai"
  | "security" | "emergency";

const sections: { id: Section; label: string; icon: typeof LayoutDashboard; danger?: boolean }[] = [
  { id: "dashboard",   label: "Dashboard",       icon: LayoutDashboard },
  { id: "users",       label: "User Management", icon: Users },
  { id: "groups",      label: "Group Management",icon: Building2 },
  { id: "economy",     label: "Economy",         icon: Coins },
  { id: "pokemon",     label: "Pokémon",         icon: Swords },
  { id: "content",     label: "Content",         icon: Image },
  { id: "monitoring",  label: "Live Monitoring", icon: Activity },
  { id: "broadcast",   label: "Broadcast",       icon: Bell },
  { id: "devtools",    label: "Dev Tools",       icon: Wrench },
  { id: "ai",          label: "AI Controls",     icon: Bot },
  { id: "security",    label: "Security",        icon: Shield },
  { id: "emergency",   label: "Emergency",       icon: Zap, danger: true },
];

function StatCard({ icon: Icon, label, value, sub, color = "#4effff", glow }: {
  icon: typeof LayoutDashboard; label: string; value: string | number; sub?: string;
  color?: string; glow?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 flex flex-col gap-3"
      style={{
        background: `rgba(${color === "#4effff" ? "78,255,255" : color === "#f59e0b" ? "245,158,11" : color === "#ef4444" ? "239,68,68" : "139,92,246"},0.06)`,
        borderColor: `${color}22`,
        boxShadow: glow ? `0 0 20px ${color}18` : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-white/40">{sub}</p>}
    </motion.div>
  );
}

function ActionBtn({ icon: Icon, label, color = "cyan", onClick, danger }: {
  icon: typeof LayoutDashboard; label: string; color?: string; onClick?: () => void; danger?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left
        ${danger
          ? "bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20"
          : "bg-[rgba(78,255,255,0.08)] border border-[#4effff]/20 text-[#4effff] hover:bg-[rgba(78,255,255,0.15)]"
        }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </motion.button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-xl font-black text-white">{children}</h2>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f1117] p-5">
      <p className="text-xs font-black text-[#4effff]/60 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  );
}

function LiveDot({ active = true }: { active?: boolean }) {
  return (
    <span className={`inline-flex w-2 h-2 rounded-full ${active ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" : "bg-white/20"}`} />
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "ok") setAuthed(true);
  }, []);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "ok");
      setAuthed(true);
      setPwErr("");
    } else {
      setPwErr("❌ Incorrect password. Access denied.");
      setPw("");
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPw("");
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0b0d12] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-[#4effff]/15 bg-[#0f1117] p-8 shadow-[0_0_60px_rgba(78,255,255,0.08)]">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-[rgba(78,255,255,0.1)] border border-[#4effff]/30 flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8 text-[#4effff]" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Control Center</h1>
              <p className="text-sm text-white/30 mt-1">Restricted access. Enter admin password.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm font-medium outline-none focus:border-[#4effff]/40 focus:shadow-[0_0_0_3px_rgba(78,255,255,0.08)] transition-all"
                />
                {pwErr && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-2 font-medium"
                  >{pwErr}</motion.p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 rounded-xl font-black text-sm bg-[rgba(78,255,255,0.15)] border border-[#4effff]/30 text-[#4effff] hover:bg-[rgba(78,255,255,0.25)] transition-all shadow-[0_0_20px_rgba(78,255,255,0.1)]"
              >
                UNLOCK ACCESS
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] flex relative">
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
            {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 z-50 w-64 h-full flex flex-col bg-[#0d0f14] border-r border-white/[0.06] shadow-[4px_0_30px_rgba(0,0,0,0.5)]"
          >
            {/* Logo */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[rgba(78,255,255,0.12)] border border-[#4effff]/25 flex items-center justify-center">
                  <Cpu className="h-4 w-4 text-[#4effff]" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">SHADOW GARDEN</p>
                  <p className="text-[10px] text-[#4effff]/60 font-bold mt-0.5">CONTROL CENTER</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {sections.map((s, i) => {
                const Icon = s.icon;
                const active = section === s.id;
                return (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                      ${active
                        ? s.danger
                          ? "bg-red-500/15 text-red-400 border border-red-500/25"
                          : "bg-[rgba(78,255,255,0.12)] text-[#4effff] border border-[#4effff]/25"
                        : s.danger
                          ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/08"
                          : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                      }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {s.label}
                    {active && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </motion.button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle sidebar button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-5 left-5 z-50 w-10 h-10 rounded-xl bg-[#0d0f14] border border-white/10 flex items-center justify-center text-white/60 hover:text-[#4effff] hover:border-[#4effff]/30 transition-all"
        >
          <LayoutDashboard className="h-4 w-4" />
        </button>
      )}

      {/* Main Content */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} p-8`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >

            {/* ── DASHBOARD ── */}
            {section === "dashboard" && (
              <div>
                <SectionTitle>📊 Dashboard</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard icon={Users} label="Total Users" value="12,847" sub="+142 this week" />
                  <StatCard icon={Building2} label="Servers/Groups" value="2,391" sub="across all platforms" color="#8b5cf6" />
                  <StatCard icon={TrendingUp} label="Commands Today" value="48,203" sub="↑ 12% vs yesterday" color="#f59e0b" glow />
                  <StatCard icon={Timer} label="Avg Response" value="142ms" sub="last 1000 commands" color="#34d399" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <StatCard icon={Database} label="Database Size" value="3.2 GB" sub="MongoDB Atlas M10" color="#f59e0b" />
                  <StatCard icon={AlertTriangle} label="Error Logs" value="23" sub="last 24 hours" color="#ef4444" />
                  <StatCard icon={Wifi} label="Uptime" value="99.7%" sub="30-day average" color="#34d399" glow />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PanelCard title="Recent Activity">
                    <div className="space-y-3">
                      {[
                        { user: "+234912…6800", action: "Used .catch", time: "2s ago", ok: true },
                        { user: "+233 72…2256", action: "Joined group Bankai Borders", time: "14s ago", ok: true },
                        { user: "+234816…6319", action: "Daily reward claimed", time: "1m ago", ok: true },
                        { user: "+23491…7839", action: "Failed login attempt", time: "3m ago", ok: false },
                        { user: "+234905…1122", action: ".casino 5000 coins", time: "5m ago", ok: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                          <LiveDot active={item.ok} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white/80 truncate">{item.user}</p>
                            <p className="text-xs text-white/30">{item.action}</p>
                          </div>
                          <span className="text-[10px] text-white/20 flex-shrink-0">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </PanelCard>

                  <PanelCard title="System Status">
                    <div className="space-y-3">
                      {[
                        { name: "WhatsApp Connection", ok: true },
                        { name: "MongoDB Database",    ok: true },
                        { name: "Redis Cache",         ok: true },
                        { name: "Pokémon API",         ok: true },
                        { name: "Bot API Gateway",     ok: false },
                        { name: "Webhook Server",      ok: true },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <LiveDot active={s.ok} />
                          <span className="flex-1 text-sm text-white/60 font-medium">{s.name}</span>
                          <span className={`text-xs font-bold ${s.ok ? "text-emerald-400" : "text-red-400"}`}>
                            {s.ok ? "ONLINE" : "OFFLINE"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── USER MANAGEMENT ── */}
            {section === "users" && (
              <div>
                <SectionTitle>👤 User Management</SectionTitle>

                <div className="flex gap-3 mb-6">
                  <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <Search className="h-4 w-4 text-white/30" />
                    <input
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      placeholder="Search by phone or name…"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
                    />
                  </div>
                  <button className="px-5 py-3 rounded-xl bg-[rgba(78,255,255,0.12)] border border-[#4effff]/25 text-[#4effff] text-sm font-bold hover:bg-[rgba(78,255,255,0.2)] transition-all">
                    Search
                  </button>
                </div>

                {/* User table */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0f1117] overflow-hidden mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {["Phone", "Name", "Level", "Wallet", "Status", "Actions"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-black text-white/30 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { phone: "+234912…6800", name: "Kurumi",   lv: 42, wallet: 128500, premium: true,  banned: false },
                        { phone: "+23380…2256",  name: "Kazuma",   lv: 31, wallet: 45200,  premium: false, banned: false },
                        { phone: "+234816…6319", name: "Aqua",     lv: 58, wallet: 320000, premium: true,  banned: false },
                        { phone: "+234916…7839", name: "Darkness", lv: 27, wallet: 8900,   premium: false, banned: true  },
                        { phone: "+234905…1122", name: "Megumin",  lv: 51, wallet: 211000, premium: true,  banned: false },
                      ].filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch)).map((u, i) => (
                        <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-xs text-white/40 font-mono">{u.phone}</td>
                          <td className="px-4 py-3 text-sm font-bold text-white">{u.name}
                            {u.premium && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] font-black">PRO</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#4effff] font-bold">{u.lv}</td>
                          <td className="px-4 py-3 text-sm text-emerald-400 font-bold">{u.wallet.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${u.banned ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                              {u.banned ? "BANNED" : "ACTIVE"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => showToast(`Viewing ${u.name}'s profile`)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-[#4effff] transition-all" title="View Profile"><Eye className="h-3.5 w-3.5" /></button>
                              <button onClick={() => showToast(`Editing ${u.name}`)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-[#4effff] transition-all" title="Edit"><Edit2 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => showToast(`${u.banned ? "Unbanned" : "Banned"} ${u.name}`, !u.banned)} className={`p-1.5 rounded-lg transition-all ${u.banned ? "hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400" : "hover:bg-red-500/10 text-white/40 hover:text-red-400"}`} title={u.banned ? "Unban" : "Ban"}>
                                {u.banned ? <Unlock className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                              </button>
                              <button onClick={() => showToast(`Deleted ${u.name}`, false)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <ActionBtn icon={Star} label="Give Premium" onClick={() => showToast("Premium granted")} />
                  <ActionBtn icon={Coins} label="Edit Balance" onClick={() => showToast("Balance editor opened")} />
                  <ActionBtn icon={Package} label="Edit Inventory" onClick={() => showToast("Inventory editor opened")} />
                  <ActionBtn icon={Download} label="Export Data" onClick={() => showToast("Export started")} />
                </div>
              </div>
            )}

            {/* ── GROUP MANAGEMENT ── */}
            {section === "groups" && (
              <div>
                <SectionTitle>🏰 Group Management</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <StatCard icon={Building2} label="Total Groups" value="2,391" />
                  <StatCard icon={Activity} label="Active Today" value="891" color="#34d399" />
                  <StatCard icon={Ban} label="Blacklisted" value="14" color="#ef4444" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PanelCard title="Group Actions">
                    <div className="space-y-2">
                      <ActionBtn icon={Eye} label="List All Groups" onClick={() => showToast("Fetching groups…")} />
                      <ActionBtn icon={Edit2} label="Change Group Settings" onClick={() => showToast("Settings editor opened")} />
                      <ActionBtn icon={Ban} label="Blacklist Group" onClick={() => showToast("Group blacklisted", false)} danger />
                      <ActionBtn icon={Megaphone} label="Broadcast To Group" onClick={() => showToast("Broadcast sent")} />
                      <ActionBtn icon={LogOut} label="Leave Group" onClick={() => showToast("Left group", false)} danger />
                    </div>
                  </PanelCard>
                  <PanelCard title="Group Analytics">
                    <div className="space-y-3">
                      {[
                        { name: "Bankai Borders",     members: 247, commands: 1820, active: true },
                        { name: "Shadow Garden HQ",   members: 189, commands: 2410, active: true },
                        { name: "Konosuba Fan Club",  members: 312, commands: 980,  active: true },
                        { name: "RPG Champions",      members: 98,  commands: 430,  active: false },
                      ].map((g, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                          <LiveDot active={g.active} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{g.name}</p>
                            <p className="text-xs text-white/30">{g.members} members · {g.commands} commands today</p>
                          </div>
                          <button onClick={() => showToast(`Viewing ${g.name}`)} className="text-[#4effff]/60 hover:text-[#4effff] transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── ECONOMY CONTROLS ── */}
            {section === "economy" && (
              <div>
                <SectionTitle>🎁 Economy Controls</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={Coins} label="Total Coins" value="4.2B" sub="across all wallets" color="#f59e0b" />
                  <StatCard icon={TrendingUp} label="Daily Volume" value="28.4M" sub="trades today" color="#34d399" />
                  <StatCard icon={Activity} label="Active Casino" value="132" sub="games in progress" color="#8b5cf6" />
                  <StatCard icon={BarChart3} label="Shop Sales" value="847" sub="items sold today" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <PanelCard title="Coin Management">
                    <div className="space-y-2 mb-4">
                      <ActionBtn icon={Plus} label="Add Coins to User" onClick={() => showToast("Coins added")} />
                      <ActionBtn icon={Minus} label="Remove Coins from User" onClick={() => showToast("Coins removed", false)} danger />
                    </div>
                    <div className="space-y-2">
                      <input placeholder="Phone number" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/30 transition-all" />
                      <input placeholder="Amount" type="number" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/30 transition-all" />
                    </div>
                  </PanelCard>
                  <PanelCard title="Shop & Casino">
                    <div className="space-y-2">
                      <ActionBtn icon={Edit2} label="Shop Editor" onClick={() => showToast("Shop editor opened")} />
                      <ActionBtn icon={Package} label="Item Editor" onClick={() => showToast("Item editor opened")} />
                      <ActionBtn icon={Coins} label="Casino Settings" onClick={() => showToast("Casino config opened")} />
                    </div>
                  </PanelCard>
                  <PanelCard title="Leaderboard">
                    <div className="space-y-2">
                      <ActionBtn icon={RotateCcw} label="Reset Leaderboard" onClick={() => showToast("Leaderboard reset", false)} danger />
                      <div className="mt-3 space-y-2">
                        {["Kazuma — 4,200,000", "Megumin — 3,800,000", "Aqua — 2,100,000"].map((e, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-5 h-5 rounded-full bg-[#4effff]/10 text-[#4effff] font-black text-center leading-5">{i + 1}</span>
                            <span className="text-white/60">{e}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── POKEMON CONTROLS ── */}
            {section === "pokemon" && (
              <div>
                <SectionTitle>🎴 Pokémon Controls</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={Swords} label="Total Pokémon" value="89,241" sub="owned by users" color="#8b5cf6" />
                  <StatCard icon={Sparkles} label="Shiny Caught" value="342" sub="all time" color="#f59e0b" glow />
                  <StatCard icon={Activity} label="Active Battles" value="28" color="#34d399" />
                  <StatCard icon={TrendingUp} label="Catches Today" value="1,847" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PanelCard title="Pokémon Actions">
                    <div className="mb-3">
                      <input placeholder="Target phone / Pokémon name" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/30 transition-all mb-2" />
                    </div>
                    <div className="space-y-2">
                      <ActionBtn icon={Play} label="Spawn Pokémon" onClick={() => showToast("Pokémon spawned!")} />
                      <ActionBtn icon={Sparkles} label="Force Shiny" onClick={() => showToast("Made shiny!")} />
                      <ActionBtn icon={TrendingUp} label="Set Level" onClick={() => showToast("Level set")} />
                      <ActionBtn icon={Gift} label="Give Pokémon to User" onClick={() => showToast("Pokémon gifted")} />
                      <ActionBtn icon={RefreshCw} label="Evolve Pokémon" onClick={() => showToast("Evolved!")} />
                      <ActionBtn icon={Trash2} label="Delete Pokémon" onClick={() => showToast("Pokémon deleted", false)} danger />
                    </div>
                  </PanelCard>
                  <PanelCard title="Pokémon Analytics">
                    <div className="space-y-3">
                      {[
                        { name: "Pikachu",   count: 4821, shiny: 12 },
                        { name: "Charizard", count: 2310, shiny: 7 },
                        { name: "Mewtwo",    count: 891,  shiny: 3 },
                        { name: "Eevee",     count: 3940, shiny: 28 },
                        { name: "Gengar",    count: 1820, shiny: 9 },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
                          <div className="w-7 h-7 rounded-full bg-[#4effff]/08 text-[#4effff] text-xs font-black flex items-center justify-center">#{i + 1}</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{p.name}</p>
                            <p className="text-xs text-white/30">{p.count.toLocaleString()} caught</p>
                          </div>
                          <span className="text-xs text-[#f59e0b] font-bold">✨ {p.shiny}</span>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── CONTENT MANAGEMENT ── */}
            {section === "content" && (
              <div>
                <SectionTitle>🎨 Content Management</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PanelCard title="Media & Banners">
                    <div className="space-y-2">
                      <ActionBtn icon={Image} label="Change Menu Images" onClick={() => showToast("Image manager opened")} />
                      <ActionBtn icon={Edit2} label="Edit Cards" onClick={() => showToast("Card editor opened")} />
                      <ActionBtn icon={Megaphone} label="Announcement Banner" onClick={() => showToast("Banner editor opened")} />
                      <ActionBtn icon={Image} label="Event Banners" onClick={() => showToast("Event banner editor opened")} />
                    </div>
                  </PanelCard>
                  <PanelCard title="Text Content">
                    <div className="space-y-2">
                      <ActionBtn icon={Edit2} label="Edit MOTD" onClick={() => showToast("MOTD editor opened")} />
                      <div className="mt-3">
                        <p className="text-xs text-white/30 mb-2 font-bold">Current MOTD</p>
                        <textarea
                          defaultValue="Welcome to Shadow Garden Bot! Use .help to see commands. 🌸"
                          className="w-full h-24 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 outline-none focus:border-[#4effff]/30 resize-none transition-all"
                        />
                        <button onClick={() => showToast("MOTD saved")} className="mt-2 px-4 py-2 rounded-xl bg-[rgba(78,255,255,0.12)] border border-[#4effff]/25 text-[#4effff] text-xs font-black transition-all hover:bg-[rgba(78,255,255,0.2)]">
                          Save MOTD
                        </button>
                      </div>
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── LIVE MONITORING ── */}
            {section === "monitoring" && (
              <div>
                <SectionTitle>📡 Live Monitoring</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <StatCard icon={Users} label="Online Users" value="1,247" sub="right now" color="#34d399" glow />
                  <StatCard icon={Swords} label="Active Battles" value="28" color="#8b5cf6" />
                  <StatCard icon={Coins} label="Casino Games" value="132" color="#f59e0b" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PanelCard title="Live Feed">
                    <div className="space-y-2">
                      {[
                        { type: "CMD",  user: "+23491…6800", action: ".catch",        time: "now"  },
                        { type: "MSG",  user: "+23480…2256", action: "Joined group",   time: "3s"   },
                        { type: "ECON", user: "+23481…6319", action: "+500 coins",     time: "8s"   },
                        { type: "PKM",  user: "+23491…7839", action: "Caught Pikachu", time: "12s"  },
                        { type: "CMD",  user: "+23490…1122", action: ".battle @user",  time: "18s"  },
                        { type: "ECON", user: "+23480…4421", action: "Casino win 12k", time: "24s"  },
                        { type: "MSG",  user: "+23490…8812", action: ".help",          time: "31s"  },
                      ].map((e, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black flex-shrink-0
                            ${e.type === "CMD" ? "bg-[#4effff]/10 text-[#4effff]"
                              : e.type === "MSG" ? "bg-[#8b5cf6]/10 text-[#8b5cf6]"
                              : e.type === "PKM" ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                              : "bg-emerald-500/10 text-emerald-400"
                            }`}>{e.type}</span>
                          <span className="text-white/40 font-mono">{e.user}</span>
                          <span className="flex-1 text-white/60">{e.action}</span>
                          <span className="text-white/20">{e.time}</span>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                  <PanelCard title="Command Usage (Today)">
                    <div className="space-y-2">
                      {[
                        { cmd: ".catch",   count: 8420, pct: 92 },
                        { cmd: ".daily",   count: 6831, pct: 75 },
                        { cmd: ".battle",  count: 5210, pct: 57 },
                        { cmd: ".shop",    count: 4120, pct: 45 },
                        { cmd: ".casino",  count: 3890, pct: 43 },
                        { cmd: ".profile", count: 3210, pct: 35 },
                      ].map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-mono text-[#4effff] w-20 flex-shrink-0">{c.cmd}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/[0.06]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${c.pct}%` }}
                              transition={{ delay: i * 0.1, duration: 0.6 }}
                              className="h-full rounded-full bg-gradient-to-r from-[#4effff]/60 to-[#4effff]"
                            />
                          </div>
                          <span className="text-xs text-white/30 w-12 text-right">{c.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── BROADCAST ── */}
            {section === "broadcast" && (
              <div>
                <SectionTitle>🔔 Broadcast System</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PanelCard title="Send Broadcast">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-white/30 mb-1.5 font-bold">Target</p>
                        <select className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-[#4effff]/30 transition-all appearance-none">
                          <option>All Users</option>
                          <option>Premium Users</option>
                          <option>All Groups</option>
                          <option>Specific Group</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-white/30 mb-1.5 font-bold">Message</p>
                        <textarea
                          placeholder="Enter your broadcast message…"
                          className="w-full h-28 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4effff]/30 resize-none transition-all"
                        />
                      </div>
                      <ActionBtn icon={Megaphone} label="Send Global Announcement" onClick={() => showToast("Broadcast sent to all users!")} />
                    </div>
                  </PanelCard>
                  <PanelCard title="Special Actions">
                    <div className="space-y-2">
                      <ActionBtn icon={Gift} label="Reward All Users" onClick={() => showToast("Rewards sent to all users!")} />
                      <ActionBtn icon={Bell} label="Push Notification" onClick={() => showToast("Push notification sent")} />
                      <ActionBtn icon={Sparkles} label="Event Notice" onClick={() => showToast("Event notice sent!")} />
                      <div className="mt-4 p-3 rounded-xl bg-[#f59e0b]/08 border border-[#f59e0b]/20">
                        <p className="text-xs text-[#f59e0b] font-bold">⚠️ Broadcast History</p>
                        <div className="mt-2 space-y-1.5">
                          {["Halloween Event — 2 days ago", "Maintenance Notice — 4 days ago", "Double XP Weekend — 1 week ago"].map((b, i) => (
                            <p key={i} className="text-xs text-white/30">{b}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── DEV TOOLS ── */}
            {section === "devtools" && (
              <div>
                <SectionTitle>🛠️ Developer Tools</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <PanelCard title="Service Control">
                    <div className="space-y-2">
                      <ActionBtn icon={RefreshCw} label="Restart Services" onClick={() => showToast("Services restarting…")} />
                      <ActionBtn icon={RotateCcw} label="Clear Cache" onClick={() => showToast("Cache cleared")} />
                      <ActionBtn icon={RotateCcw} label="Rollback Database" onClick={() => showToast("DB rollback triggered", false)} danger />
                    </div>
                  </PanelCard>
                  <PanelCard title="Diagnostics">
                    <div className="space-y-2">
                      <ActionBtn icon={Terminal} label="View Logs" onClick={() => showToast("Opening log viewer")} />
                      <ActionBtn icon={AlertTriangle} label="Error Tracker" onClick={() => showToast("Opening error tracker")} />
                      <ActionBtn icon={Database} label="Database Explorer" onClick={() => showToast("DB explorer opened")} />
                      <ActionBtn icon={Globe} label="API Tester" onClick={() => showToast("API tester opened")} />
                      <ActionBtn icon={Wifi} label="Webhook Monitor" onClick={() => showToast("Webhook monitor opened")} />
                    </div>
                  </PanelCard>
                  <PanelCard title="Error Log (Last 10)">
                    <div className="space-y-2">
                      {[
                        { msg: "MongoDB timeout on query",    time: "2h ago", sev: "warn" },
                        { msg: "Bot API gateway unreachable", time: "3h ago", sev: "error" },
                        { msg: "Rate limit hit on OTP",       time: "5h ago", sev: "warn" },
                        { msg: "Pokémon API 504",             time: "8h ago", sev: "error" },
                      ].map((e, i) => (
                        <div key={i} className={`p-2.5 rounded-xl border text-xs ${e.sev === "error" ? "bg-red-500/08 border-red-500/20 text-red-400" : "bg-[#f59e0b]/08 border-[#f59e0b]/20 text-[#f59e0b]"}`}>
                          <p className="font-bold">{e.msg}</p>
                          <p className="opacity-50 mt-0.5">{e.time}</p>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── AI CONTROLS ── */}
            {section === "ai" && (
              <div>
                <SectionTitle>🤖 AI Controls</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PanelCard title="Prompt & Personality">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-white/30 mb-1.5 font-bold">Active Personality</p>
                        <select className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-[#4effff]/30 transition-all">
                          <option>Aqua (Default)</option>
                          <option>Megumin (Explosive)</option>
                          <option>Darkness (Masochist)</option>
                          <option>Kazuma (Neutral)</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-white/30 mb-1.5 font-bold">System Prompt</p>
                        <textarea defaultValue="You are Aqua from KonoSuba. Respond in character — cheerful, a bit air-headed, but genuinely helpful. You love water and hate demons." className="w-full h-28 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 outline-none focus:border-[#4effff]/30 resize-none transition-all" />
                      </div>
                      <ActionBtn icon={Bot} label="Save Personality" onClick={() => showToast("Personality saved")} />
                    </div>
                  </PanelCard>
                  <PanelCard title="Moderation">
                    <div className="space-y-2">
                      <ActionBtn icon={Edit2} label="Knowledge Base" onClick={() => showToast("Knowledge base opened")} />
                      <ActionBtn icon={Ban} label="Word Filter" onClick={() => showToast("Word filter opened")} />
                      <ActionBtn icon={MessageSquare} label="Conversation Logs" onClick={() => showToast("Logs opened")} />
                      <div className="mt-3 p-3 rounded-xl bg-[#4effff]/05 border border-[#4effff]/15">
                        <p className="text-xs text-[#4effff]/60 font-bold mb-2">Filtered Words</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["scam", "hack", "phish", "spam", "ban bypass"].map(w => (
                            <span key={w} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">{w}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {section === "security" && (
              <div>
                <SectionTitle>🔒 Security</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={Shield} label="Admin Roles" value="3" sub="super, mod, viewer" />
                  <StatCard icon={History} label="Audit Events" value="1,248" sub="last 30 days" color="#8b5cf6" />
                  <StatCard icon={AlertTriangle} label="Login Fails" value="27" sub="last 24 hours" color="#ef4444" />
                  <StatCard icon={Key} label="API Keys" value="5" sub="active keys" color="#f59e0b" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PanelCard title="Access Control">
                    <div className="space-y-2">
                      <ActionBtn icon={Shield} label="Manage Admin Roles" onClick={() => showToast("Role manager opened")} />
                      <ActionBtn icon={Lock} label="Permissions Matrix" onClick={() => showToast("Permissions opened")} />
                      <ActionBtn icon={Key} label="API Keys Manager" onClick={() => showToast("Key manager opened")} />
                      <ActionBtn icon={SmartphoneIcon} label="2FA Management" onClick={() => showToast("2FA settings opened")} />
                    </div>
                  </PanelCard>
                  <PanelCard title="Audit & History">
                    <div className="space-y-2 mb-3">
                      <ActionBtn icon={History} label="Audit Logs" onClick={() => showToast("Audit logs opened")} />
                      <ActionBtn icon={Fingerprint} label="Login History" onClick={() => showToast("Login history opened")} />
                    </div>
                    <div className="space-y-2">
                      {[
                        { event: "Admin login",       actor: "Super Admin",  time: "1h ago",  ok: true },
                        { event: "User banned",       actor: "Mod#1",        time: "2h ago",  ok: false },
                        { event: "Broadcast sent",    actor: "Super Admin",  time: "4h ago",  ok: true },
                        { event: "DB rollback",       actor: "Super Admin",  time: "1d ago",  ok: false },
                      ].map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                          <span className="text-white/60 flex-1">{a.event}</span>
                          <span className="text-white/30">{a.actor}</span>
                          <span className="text-white/20">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

            {/* ── EMERGENCY ── */}
            {section === "emergency" && (
              <div>
                <SectionTitle>⚔️ Emergency Panel</SectionTitle>
                <div className="mb-6 p-4 rounded-2xl bg-red-500/08 border border-red-500/25">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertOctagon className="h-4 w-4 text-red-400" />
                    <p className="text-sm font-black text-red-400">DANGER ZONE — Actions here are irreversible</p>
                  </div>
                  <p className="text-xs text-red-400/60">Use only in case of emergencies. All actions are logged.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PanelCard title="System Controls">
                    <div className="space-y-2">
                      <ActionBtn icon={PauseCircle} label="Enable Maintenance Mode" onClick={() => showToast("⚠️ Maintenance mode ON", false)} danger />
                      <ActionBtn icon={StopCircle} label="Disable All Commands" onClick={() => showToast("All commands disabled", false)} danger />
                      <ActionBtn icon={Lock} label="Lock Economy" onClick={() => showToast("Economy locked", false)} danger />
                      <ActionBtn icon={RotateCcw} label="Rollback Database" onClick={() => showToast("DB rollback initiated", false)} danger />
                    </div>
                  </PanelCard>
                  <PanelCard title="Emergency Alerts">
                    <div className="space-y-2">
                      <ActionBtn icon={Megaphone} label="Emergency Alert to All" onClick={() => showToast("Emergency alert sent!", false)} danger />
                      <div className="mt-3">
                        <textarea
                          placeholder="Emergency message…"
                          className="w-full h-24 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-red-500/20 text-sm text-white placeholder:text-red-400/30 outline-none focus:border-red-500/40 resize-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/08 border border-emerald-500/20">
                      <p className="text-xs text-emerald-400 font-bold">✅ Current Status: OPERATIONAL</p>
                      <p className="text-xs text-emerald-400/50 mt-0.5">All systems nominal. No active emergencies.</p>
                    </div>
                  </PanelCard>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
