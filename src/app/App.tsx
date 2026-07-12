import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Users, Zap, Navigation, Radio, Fuel, Hotel, UtensilsCrossed,
  Plus, ChevronRight, Bike, Settings, Bell, Shield, Clock, Wind,
  Thermometer, Gauge, AlertTriangle, CheckCircle, X, Search, Star,
  Phone, ArrowUpRight, RotateCw, Signal, Battery, Wifi, TrendingUp,
  Map, Route, Eye, EyeOff, ChevronDown, ChevronUp, Activity
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const RIDERS = [
  { id: 1, name: "IRONCLAD", callsign: "Ghost Rider", lat: 28.6139, lng: 77.209, speed: 87, fuel: 72, status: "riding", avatar: "GR", color: "#FF6600" },
  { id: 2, name: "STEELWOLF", callsign: "Night Hawk", lat: 28.622, lng: 77.218, speed: 0, fuel: 45, status: "stopped", avatar: "NH", color: "#FFB800" },
  { id: 3, name: "VIPER_MC", callsign: "Road King", lat: 28.608, lng: 77.225, speed: 94, fuel: 88, status: "riding", avatar: "RK", color: "#FF4444" },
  { id: 4, name: "THROTTLE", callsign: "Blue Falcon", lat: 28.618, lng: 77.195, speed: 62, fuel: 30, status: "fuel-low", avatar: "BF", color: "#00AAFF" },
  { id: 5, name: "DRIFTER_X", callsign: "Desert Eagle", lat: 28.628, lng: 77.205, speed: 110, fuel: 91, status: "riding", avatar: "DE", color: "#AA44FF" },
];

const FUEL_STATIONS = [
  { id: 1, name: "HP Petrol Pump", distance: "0.8 km", rating: 4.2, open: true, brand: "HP" },
  { id: 2, name: "Indian Oil Station", distance: "1.4 km", rating: 4.0, open: true, brand: "IOC" },
  { id: 3, name: "BPCL Fuel Point", distance: "2.1 km", rating: 3.8, open: false, brand: "BPCL" },
  { id: 4, name: "Shell Express", distance: "3.3 km", rating: 4.5, open: true, brand: "Shell" },
];

const HOTELS = [
  { id: 1, name: "Riders Inn Deluxe", distance: "1.2 km", rating: 4.3, price: "₹2,400/night", parking: true },
  { id: 2, name: "Highway Motel 66", distance: "2.8 km", rating: 3.9, price: "₹1,200/night", parking: true },
  { id: 3, name: "The Iron Horse Lodge", distance: "4.1 km", rating: 4.7, price: "₹4,800/night", parking: true },
];

const RESTAURANTS = [
  { id: 1, name: "Dhaba King", distance: "0.4 km", rating: 4.6, cuisine: "North Indian", open: true },
  { id: 2, name: "Moto Cafe", distance: "1.1 km", rating: 4.4, cuisine: "Continental", open: true },
  { id: 3, name: "Roadhouse Grill", distance: "1.9 km", rating: 4.1, cuisine: "BBQ & Grill", open: true },
];

const GROUPS = [
  { id: 1, name: "IRON WOLVES MC", members: 12, route: "Delhi → Manali", status: "active", leader: "IRONCLAD" },
  { id: 2, name: "HIGHWAY REBELS", members: 8, route: "Mumbai → Goa", status: "planning", leader: "VIPER_MC" },
];

const WAYPOINTS = [
  { city: "New Delhi", time: "06:00", distance: "START", status: "done" },
  { city: "Murthal (Dhaba Stop)", time: "07:30", distance: "48 km", status: "done" },
  { city: "Panipat", time: "08:45", distance: "90 km", status: "current" },
  { city: "Ambala Fuel Stop", time: "10:15", distance: "200 km", status: "pending" },
  { city: "Chandigarh Rest", time: "11:30", distance: "260 km", status: "pending" },
  { city: "Shimla", time: "14:00", distance: "360 km", status: "pending" },
];

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useOdometer(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.floor(start));
      if (start >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

function usePulse() {
  const [p, setP] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setP(x => !x), 900);
    return () => clearInterval(t);
  }, []);
  return p;
}

// ── Micro Components ──────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    riding: "bg-green-400", stopped: "bg-yellow-400",
    "fuel-low": "bg-red-500", offline: "bg-gray-600",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status] ?? "bg-gray-600"} ${status === "riding" ? "animate-pulse" : ""}`} />
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star size={10} className="text-accent fill-accent" />
      <span className="font-mono text-xs text-accent">{rating.toFixed(1)}</span>
    </span>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "danger" | "warn" }) {
  const styles: Record<string, string> = {
    default: "bg-primary/20 text-primary border-primary/30",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    warn: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ── Top HUD Bar ───────────────────────────────────────────────────────────────

function TopBar({ apiKey }: { apiKey: string }) {
  const pulse = usePulse();
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Bike size={16} className="text-black" />
          </div>
          <div>
            <div className="font-display text-sm font-black tracking-widest text-foreground uppercase">MotoTrack Pro</div>
            <div className="font-mono text-[9px] text-muted-foreground tracking-widest">RIDE · CONNECT · CONQUER</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${pulse ? "bg-green-400" : "bg-green-600"}`} />
          <span className="font-mono text-[10px] text-green-400 tracking-wider">LIVE</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Signal size={12} className="text-primary" />
          <span className="font-mono text-[10px]">5G</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Navigation size={12} className="text-primary" />
          <span className="font-mono text-[10px]">GPS LOCK</span>
        </div>
        {!apiKey && (
          <Badge variant="warn">NO API KEY</Badge>
        )}
        <Bell size={15} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
        <Settings size={15} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const nav = [
    { id: "map", icon: Map, label: "MAP" },
    { id: "squad", icon: Users, label: "SQUAD" },
    { id: "radar", icon: Radio, label: "RADAR" },
    { id: "route", icon: Route, label: "ROUTE" },
  ];
  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2 shrink-0">
      {nav.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer
            ${active === id
              ? "bg-primary text-black shadow-lg shadow-primary/40"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
        >
          <Icon size={18} />
          <span className="text-[8px] font-mono font-bold tracking-wider">{label}</span>
        </button>
      ))}
      <div className="mt-auto">
        <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
          <span className="text-xs font-display font-black text-primary">GR</span>
        </div>
      </div>
    </div>
  );
}

// ── Map Panel ─────────────────────────────────────────────────────────────────

function MapPanel({ apiKey, setApiKey }: { apiKey: string; setApiKey: (k: string) => void }) {
  const [input, setInput] = useState("");
  const [showRiders, setShowRiders] = useState(true);
  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=28.6139,77.2090&zoom=13&maptype=roadmap`
    : `https://maps.google.com/maps?q=New+Delhi+India&z=13&output=embed`;

  return (
    <div className="flex flex-col h-full">
      {!apiKey && (
        <div className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/30 flex items-center gap-3">
          <AlertTriangle size={14} className="text-yellow-400 shrink-0" />
          <span className="font-mono text-[11px] text-yellow-300">Enter your Google Maps API key for full GPS features</span>
          <div className="flex gap-2 ml-auto shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="AIza..."
              className="bg-black/40 border border-yellow-500/30 rounded px-2 py-1 text-[11px] font-mono text-foreground w-48 focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={() => input.trim() && setApiKey(input.trim())}
              className="bg-primary text-black font-mono text-[11px] font-bold px-3 py-1 rounded hover:bg-accent transition-colors cursor-pointer"
            >
              APPLY
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <iframe
          src={mapSrc}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps"
        />

        {/* Rider Overlay */}
        {showRiders && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {RIDERS.map(r => (
              <motion.div
                key={r.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 bg-black/80 border border-border rounded-lg px-2 py-1.5 backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-display font-black text-black" style={{ backgroundColor: r.color }}>
                  {r.avatar}
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold text-foreground">{r.callsign}</div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={r.status} />
                    <span className="font-mono text-[9px] text-muted-foreground">{r.speed > 0 ? `${r.speed} km/h` : "STOPPED"}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => setShowRiders(x => !x)}
            className="bg-black/80 border border-border rounded-lg p-2 backdrop-blur-sm hover:border-primary transition-colors cursor-pointer"
            title="Toggle riders"
          >
            {showRiders ? <Eye size={14} className="text-primary" /> : <EyeOff size={14} className="text-muted-foreground" />}
          </button>
          <button className="bg-black/80 border border-border rounded-lg p-2 backdrop-blur-sm hover:border-primary transition-colors cursor-pointer">
            <RotateCw size={14} className="text-muted-foreground hover:text-primary" />
          </button>
        </div>

        {/* Bottom Speed Widget */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <SpeedWidget />
        </div>
      </div>
    </div>
  );
}

// ── Speed Widget ──────────────────────────────────────────────────────────────

function SpeedWidget() {
  const speed = useOdometer(87);
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center gap-4 bg-black/90 border border-primary/30 rounded-2xl px-6 py-3 backdrop-blur-md shadow-xl shadow-black/50"
    >
      <div className="text-center">
        <div className="font-display text-3xl font-black text-primary leading-none">{speed}</div>
        <div className="font-mono text-[9px] text-muted-foreground tracking-widest">KM/H</div>
      </div>
      <div className="w-px h-10 bg-border" />
      <div className="text-center">
        <div className="font-display text-xl font-black text-accent leading-none">246</div>
        <div className="font-mono text-[9px] text-muted-foreground tracking-widest">KM LEFT</div>
      </div>
      <div className="w-px h-10 bg-border" />
      <div className="text-center">
        <div className="font-display text-xl font-black text-green-400 leading-none">72%</div>
        <div className="font-mono text-[9px] text-muted-foreground tracking-widest">FUEL</div>
      </div>
      <div className="w-px h-10 bg-border" />
      <div className="text-center">
        <div className="font-display text-xl font-black text-foreground leading-none">34°</div>
        <div className="font-mono text-[9px] text-muted-foreground tracking-widest">TEMP</div>
      </div>
    </motion.div>
  );
}

// ── Squad Panel ───────────────────────────────────────────────────────────────

function SquadPanel() {
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [route, setRoute] = useState("");

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-black tracking-widest text-foreground uppercase">Your Squad</div>
            <div className="font-mono text-[10px] text-muted-foreground">5 riders online · 2 groups active</div>
          </div>
          <button
            onClick={() => setShowCreate(x => !x)}
            className="flex items-center gap-1.5 bg-primary text-black text-xs font-display font-bold px-3 py-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer"
          >
            <Plus size={12} /> NEW GROUP
          </button>
        </div>
      </div>

      {showCreate && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mx-4 mt-3 bg-secondary border border-primary/30 rounded-xl p-4 overflow-hidden"
        >
          <div className="font-display text-sm font-black text-primary tracking-wider mb-3">CREATE RIDE GROUP</div>
          <div className="flex flex-col gap-2">
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Group name (e.g. IRON WOLVES MC)"
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary placeholder-muted-foreground"
            />
            <input
              value={route}
              onChange={e => setRoute(e.target.value)}
              placeholder="Route (e.g. Delhi → Manali)"
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary placeholder-muted-foreground"
            />
            <div className="flex gap-2">
              <button className="flex-1 bg-primary text-black font-display font-bold text-sm py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                CREATE GROUP
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 bg-card border border-border text-muted-foreground text-sm rounded-lg hover:border-primary transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Groups */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {GROUPS.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-secondary border border-border rounded-xl p-3 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-display font-black text-sm text-foreground tracking-wide">{g.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground">Leader: {g.leader}</div>
              </div>
              <Badge variant={g.status === "active" ? "success" : "warn"}>{g.status}</Badge>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><Users size={10} className="text-primary" /> {g.members} riders</span>
              <span className="flex items-center gap-1"><Navigation size={10} className="text-primary" /> {g.route}</span>
            </div>
            <div className="mt-2.5 flex gap-2">
              <button className="flex-1 bg-primary/15 border border-primary/30 text-primary text-[10px] font-display font-bold py-1.5 rounded-lg hover:bg-primary/25 transition-colors cursor-pointer uppercase tracking-wider">
                Join Ride
              </button>
              <button className="flex-1 bg-card border border-border text-muted-foreground text-[10px] font-mono py-1.5 rounded-lg hover:border-primary transition-colors cursor-pointer">
                View Map
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Riders List */}
      <div className="px-4 pt-4 pb-4">
        <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Live Riders</div>
        <div className="flex flex-col gap-2">
          {RIDERS.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="flex items-center gap-3 bg-secondary rounded-xl px-3 py-2.5 border border-border hover:border-primary/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-[11px] text-black shrink-0" style={{ backgroundColor: r.color }}>
                {r.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-xs text-foreground">{r.callsign}</div>
                <div className="font-mono text-[9px] text-muted-foreground">{r.name}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <StatusDot status={r.status} />
                  <span className="font-mono text-[10px] text-foreground font-bold">{r.speed} km/h</span>
                </div>
                <div className="font-mono text-[9px] text-muted-foreground">Fuel {r.fuel}%</div>
              </div>
              <button className="shrink-0 w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer">
                <Phone size={10} className="text-primary" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Radar Panel ───────────────────────────────────────────────────────────────

function RadarAnimation() {
  const pulse = usePulse();
  return (
    <div className="relative w-40 h-40 mx-auto my-3">
      <div className="absolute inset-0 rounded-full border border-primary/20" />
      <div className="absolute inset-4 rounded-full border border-primary/30" />
      <div className="absolute inset-8 rounded-full border border-primary/40" />
      <div className="absolute inset-12 rounded-full border border-primary/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>
      {/* Sweep arm */}
      <motion.div
        className="absolute inset-0 origin-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute left-1/2 top-0 bottom-1/2 w-px origin-bottom"
          style={{ background: "linear-gradient(to top, #FF6600, transparent)" }} />
      </motion.div>
      {/* Blip dots */}
      {[
        { top: "18%", left: "62%", color: "bg-yellow-400" },
        { top: "65%", left: "30%", color: "bg-green-400" },
        { top: "42%", left: "78%", color: "bg-red-400" },
        { top: "72%", left: "65%", color: "bg-yellow-400" },
      ].map((dot, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${dot.color} ${pulse ? "opacity-100" : "opacity-40"} transition-opacity`}
          style={{ top: dot.top, left: dot.left }}
        />
      ))}
      {/* Cross lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-primary/20" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-px h-full bg-primary/20" />
      </div>
    </div>
  );
}

function RadarPanel() {
  const [activeTab, setActiveTab] = useState<"fuel" | "hotel" | "food">("fuel");
  const tabs = [
    { id: "fuel" as const, label: "FUEL", icon: Fuel, count: FUEL_STATIONS.length },
    { id: "hotel" as const, label: "STAY", icon: Hotel, count: HOTELS.length },
    { id: "food" as const, label: "FOOD", icon: UtensilsCrossed, count: RESTAURANTS.length },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="font-display text-xl font-black tracking-widest text-foreground uppercase">Zone Radar</div>
        <div className="font-mono text-[10px] text-muted-foreground">Scanning 5 km radius · Updated live</div>
      </div>

      <RadarAnimation />

      <div className="flex mx-4 gap-1 mb-3">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-display font-bold tracking-wider transition-all cursor-pointer
              ${activeTab === t.id ? "bg-primary text-black" : "bg-secondary text-muted-foreground hover:text-primary border border-border"}`}
          >
            <t.icon size={11} /> {t.label}
            <span className={`ml-0.5 text-[9px] font-mono ${activeTab === t.id ? "text-black/70" : "text-primary"}`}>({t.count})</span>
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 flex flex-col gap-2">
        {activeTab === "fuel" && FUEL_STATIONS.map((s, i) => (
          <motion.div key={s.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
            className="bg-secondary border border-border rounded-xl px-3 py-2.5 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Fuel size={14} className="text-primary" />
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-foreground">{s.name}</div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={s.rating} />
                    <span className="font-mono text-[9px] text-muted-foreground">{s.distance}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={s.open ? "success" : "danger"}>{s.open ? "OPEN" : "CLOSED"}</Badge>
                <button className="text-[9px] font-mono text-primary hover:text-accent transition-colors cursor-pointer flex items-center gap-0.5">
                  Navigate <ArrowUpRight size={9} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {activeTab === "hotel" && HOTELS.map((h, i) => (
          <motion.div key={h.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
            className="bg-secondary border border-border rounded-xl px-3 py-2.5 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                  <Hotel size={14} className="text-accent" />
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-foreground">{h.name}</div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={h.rating} />
                    <span className="font-mono text-[9px] text-muted-foreground">{h.distance}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono text-[10px] text-accent font-bold">{h.price}</span>
                {h.parking && <Badge variant="success">PARKING</Badge>}
              </div>
            </div>
            <button className="mt-2 w-full bg-accent/10 border border-accent/30 text-accent text-[10px] font-display font-bold py-1.5 rounded-lg hover:bg-accent/20 transition-colors cursor-pointer uppercase tracking-wider">
              Book Stay
            </button>
          </motion.div>
        ))}
        {activeTab === "food" && RESTAURANTS.map((r, i) => (
          <motion.div key={r.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
            className="bg-secondary border border-border rounded-xl px-3 py-2.5 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <UtensilsCrossed size={14} className="text-green-400" />
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-foreground">{r.name}</div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={r.rating} />
                    <span className="font-mono text-[9px] text-muted-foreground">{r.cuisine}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={r.open ? "success" : "danger"}>{r.open ? "OPEN" : "CLOSED"}</Badge>
                <span className="font-mono text-[9px] text-muted-foreground">{r.distance}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Route Panel ───────────────────────────────────────────────────────────────

function RoutePanel() {
  const dist = useOdometer(490);
  const eta = useOdometer(8);
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="font-display text-xl font-black tracking-widest text-foreground uppercase">Route Planner</div>
        <div className="font-mono text-[10px] text-muted-foreground">Delhi → Shimla · Active Ride</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mx-4 mt-4">
        {[
          { label: "TOTAL KM", value: `${dist}`, unit: "km", color: "text-primary" },
          { label: "ETA", value: `${eta}h`, unit: "30m", color: "text-accent" },
          { label: "PROGRESS", value: "48%", unit: "done", color: "text-green-400" },
        ].map(s => (
          <div key={s.label} className="bg-secondary border border-border rounded-xl p-2.5 text-center">
            <div className={`font-display text-xl font-black ${s.color} leading-none`}>{s.value}</div>
            <div className="font-mono text-[8px] text-muted-foreground tracking-widest mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mx-4 mt-3">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "48%" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          />
        </div>
      </div>

      {/* Waypoints */}
      <div className="px-4 pt-4 pb-4">
        <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-3">Waypoints</div>
        <div className="relative flex flex-col gap-0">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-border" />
          {WAYPOINTS.map((w, i) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 pb-4 relative"
            >
              <div className={`relative z-10 w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0
                ${w.status === "done" ? "bg-green-500 border-green-500"
                  : w.status === "current" ? "bg-primary border-primary animate-pulse"
                  : "bg-card border-border"}`}>
                {w.status === "done" && <CheckCircle size={8} className="text-black" />}
                {w.status === "current" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              <div className="flex-1">
                <div className={`font-display font-bold text-xs ${w.status === "done" ? "text-muted-foreground line-through" : w.status === "current" ? "text-primary" : "text-foreground"}`}>
                  {w.city}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-1"><Clock size={8} /> {w.time}</span>
                  <span className="font-mono text-[9px] text-muted-foreground">{w.distance}</span>
                </div>
              </div>
              {w.status === "current" && (
                <Badge variant="default">CURRENT</Badge>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weather strip */}
      <div className="mx-4 mb-4 bg-secondary border border-border rounded-xl px-3 py-3">
        <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Route Weather</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { city: "Delhi", temp: "34°", icon: "☀️" },
            { city: "Panipat", temp: "31°", icon: "⛅" },
            { city: "Ambala", temp: "28°", icon: "🌤️" },
            { city: "Shimla", temp: "18°", icon: "🌧️" },
          ].map(w => (
            <div key={w.city}>
              <div className="text-lg">{w.icon}</div>
              <div className="font-mono text-[10px] font-bold text-foreground">{w.temp}</div>
              <div className="font-mono text-[8px] text-muted-foreground">{w.city}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Right Widgets Panel ───────────────────────────────────────────────────────

function RiderStatsWidget() {
  const pulse = usePulse();
  return (
    <div className="bg-card border border-border rounded-xl p-3 mx-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Live Riders</span>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${pulse ? "bg-green-400" : "bg-green-700"}`} />
          <span className="font-mono text-[9px] text-green-400">5 ONLINE</span>
        </div>
      </div>
      <div className="flex gap-1">
        {RIDERS.map(r => (
          <div key={r.id} title={r.callsign}
            className="flex-1 aspect-square rounded-lg flex items-center justify-center text-[9px] font-display font-black text-black cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: r.color }}>
            {r.avatar}
          </div>
        ))}
      </div>
    </div>
  );
}

function FuelGaugeWidget() {
  const fuelPct = 72;
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - fuelPct / 100);
  return (
    <div className="bg-card border border-border rounded-xl p-3 mx-3 mt-2">
      <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Fuel Level</div>
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#1E1E1E" strokeWidth="6" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={fuelPct > 30 ? "#FF6600" : "#FF2D2D"}
              strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-black text-sm text-primary leading-none">{fuelPct}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-display font-black text-lg text-foreground">~160 km</div>
          <div className="font-mono text-[9px] text-muted-foreground">Range remaining</div>
          <div className="mt-1 text-[9px] font-mono text-primary flex items-center gap-1">
            <Fuel size={9} /> Next pump 0.8 km
          </div>
        </div>
      </div>
    </div>
  );
}

function CompassWidget() {
  const [bearing, setBearing] = useState(47);
  useEffect(() => {
    const t = setInterval(() => setBearing(b => (b + 0.5) % 360), 100);
    return () => clearInterval(t);
  }, []);
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dirIdx = Math.round(bearing / 45) % 8;
  return (
    <div className="bg-card border border-border rounded-xl p-3 mx-3 mt-2">
      <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Compass</div>
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14">
          <motion.svg viewBox="0 0 56 56" className="w-full h-full" style={{ rotate: -bearing }}>
            <circle cx="28" cy="28" r="26" fill="#1E1E1E" stroke="#333" strokeWidth="1" />
            <polygon points="28,6 32,28 28,24 24,28" fill="#FF2D2D" />
            <polygon points="28,50 32,28 28,32 24,28" fill="#888" />
            <circle cx="28" cy="28" r="3" fill="#FF6600" />
          </motion.svg>
        </div>
        <div>
          <div className="font-display font-black text-2xl text-foreground leading-none">{dirs[dirIdx]}</div>
          <div className="font-mono text-[10px] text-muted-foreground">{Math.round(bearing)}°</div>
          <div className="font-mono text-[9px] text-accent mt-0.5">Heading Manali</div>
        </div>
      </div>
    </div>
  );
}

function AlertWidget() {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mx-3 mt-2">
      <div className="flex items-start gap-2">
        <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <div className="font-display font-bold text-xs text-red-400">THROTTLE — LOW FUEL</div>
          <div className="font-mono text-[9px] text-red-300/70 mt-0.5">Blue Falcon is at 30% fuel. Nearest pump 1.4 km.</div>
        </div>
      </div>
    </div>
  );
}

function RightPanel() {
  return (
    <div className="w-56 border-l border-border bg-card/60 flex flex-col overflow-y-auto shrink-0 pb-4">
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">HUD Widgets</div>
      </div>
      <AlertWidget />
      <RiderStatsWidget />
      <FuelGaugeWidget />
      <CompassWidget />

      {/* Trip Stats */}
      <div className="bg-card border border-border rounded-xl p-3 mx-3 mt-2">
        <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Today&apos;s Ride</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Distance", value: "244 km", icon: TrendingUp, color: "text-primary" },
            { label: "Duration", value: "3h 20m", icon: Clock, color: "text-accent" },
            { label: "Avg Speed", value: "73 km/h", icon: Gauge, color: "text-green-400" },
            { label: "Max Speed", value: "121 km/h", icon: Zap, color: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-secondary rounded-lg p-2">
              <s.icon size={10} className={s.color} />
              <div className={`font-display font-black text-sm ${s.color} leading-tight mt-0.5`}>{s.value}</div>
              <div className="font-mono text-[8px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [apiKey, setApiKey] = useState("");

  const panels: Record<string, React.ReactNode> = {
    map: <MapPanel apiKey={apiKey} setApiKey={setApiKey} />,
    squad: <SquadPanel />,
    radar: <RadarPanel />,
    route: <RoutePanel />,
  };

  return (
    <div className="size-full flex flex-col bg-background font-sans overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        .font-display { font-family: 'Barlow Condensed', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #FF660033; border-radius: 9px; }
        ::-webkit-scrollbar-thumb:hover { background: #FF660066; }
      `}</style>

      <TopBar apiKey={apiKey} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeTab} setActive={setActiveTab} />

        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {panels[activeTab]}
            </motion.div>
          </AnimatePresence>
        </main>

        <RightPanel />
      </div>
    </div>
  );
}
