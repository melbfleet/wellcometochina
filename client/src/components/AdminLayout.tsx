import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard, MapPin, Compass, Map, Route as RouteIcon, Tag, Mail, LogOut, Menu, X, ChevronRight, Images, Info, Home,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",    path: "/admin",              icon: LayoutDashboard },
  { label: "Media Library", path: "/admin/media",        icon: Images },
  { label: "Homepage",     path: "/admin/homepage",     icon: Home },
  { label: "Destination",  path: "/admin/cities",       icon: MapPin },
  { label: "Experience",   path: "/admin/experiences",  icon: Compass },
  { label: "Way to Travel", path: "/admin/ways-to-travel", icon: RouteIcon },
  { label: "Itinerary",    path: "/admin/itineraries",  icon: Map },
  { label: "About",        path: "/admin/about",        icon: Info },
  { label: "Enquiries",    path: "/admin/enquiries",    icon: Mail },
  { label: "Tags",         path: "/admin/tags",         icon: Tag },
];

const ACCENT = "#F5569B";
const NAV_BG = "rgba(20,20,20,0.97)";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// ── Login form ──
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { data: brandAssets } = trpc.media.getHomepageAssets.useQuery();
  const logoUrl = brandAssets?.logo?.url || "";
  const passwordRef = useRef<HTMLInputElement>(null);
  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      // Session is stored in httpOnly cookie only — no localStorage
      onSuccess();
    },
    onError: (err) => {
      setError(err.message || "Invalid password. Please try again.");
      setPassword("");
      setTimeout(() => passwordRef.current?.focus(), 50);
    },
  });

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: "52px", maxWidth: "280px", width: "auto", objectFit: "contain" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : null}
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
          <p style={{ color: "#888", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", marginBottom: "28px" }}>
            Admin Access
          </p>
          <form onSubmit={e => { e.preventDefault(); setError(""); loginMutation.mutate({ password }); }}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#666", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                Username
              </label>
              <input
                type="text"
                value="Admin"
                readOnly
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#555", fontSize: "14px", padding: "10px 14px", outline: "none", boxSizing: "border-box", cursor: "default" }}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#888", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                Password
              </label>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                autoFocus
                placeholder="Enter password"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${error ? "#e05" : "rgba(255,255,255,0.12)"}`,
                  color: "#fff",
                  fontSize: "14px",
                  padding: "10px 14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { if (!error) e.currentTarget.style.borderColor = "rgba(245,86,155,0.5)"; }}
                onBlur={e => { if (!error) e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              />
              {error && <p style={{ color: "#e05", fontSize: "12px", marginTop: "8px" }}>{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending || !password}
              style={{
                width: "100%",
                background: loginMutation.isPending || !password ? "rgba(245,86,155,0.4)" : ACCENT,
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "12px",
                border: "none",
                cursor: loginMutation.isPending || !password ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar — defined OUTSIDE AdminLayout to prevent remount on route change ──
function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [location] = useLocation();
  const { data: brandAssets } = trpc.media.getHomepageAssets.useQuery();
  const logoUrl = brandAssets?.logo?.url || "";

  return (
    <div
      style={{
        background: NAV_BG,
        width: "220px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href="/" style={{ display: "block", height: "36px" }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: "36px", maxWidth: "180px", width: "auto", objectFit: "contain" }}
              onError={e => { (e.target as HTMLImageElement).style.visibility = "hidden"; }}
            />
          ) : null}
        </a>
        <div style={{ marginTop: "8px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555" }}>
          Admin Panel
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isActive ? "#fff" : "#666",
                background: isActive ? "rgba(245,86,155,0.12)" : "transparent",
                borderLeft: isActive ? `2px solid ${ACCENT}` : "2px solid transparent",
                textDecoration: "none",
                transition: "color 0.18s ease, background 0.18s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { if (!isActive) { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { if (!isActive) { e.currentTarget.style.color = "#666"; e.currentTarget.style.background = "transparent"; } }}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#555",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "color 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#F5569B"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#555"; }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
}

// ── Main Layout ──
export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: authData, isLoading: authLoading, isError: authError } = trpc.admin.check.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: true,   // Re-check when user returns to tab
      staleTime: 0,                  // Always consider data stale
      gcTime: 0,                     // Never cache
    }
  );
  const logout = trpc.admin.logout.useMutation({
    onSuccess: () => {
      // Cookie is cleared by server; just redirect to login
      window.location.href = "/admin";
    },
  });

  const handleLoginSuccess = () => {
    window.location.reload();
  };

  const handleLogout = () => logout.mutate();

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#555", fontSize: "13px" }}>Loading...</div>
      </div>
    );
  }

  if (!authData?.authenticated || authError) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}
          onClick={() => setSidebarOpen(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", zIndex: 51 }}>
            <Sidebar onLogout={handleLogout} />
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            background: "rgba(20,20,20,0.97)",
            height: "55px",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: "#888", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            <span style={{ color: "#555", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin</span>
            {title && (
              <>
                <ChevronRight size={12} style={{ color: "#444" }} />
                <span style={{ color: "#aaa", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</span>
              </>
            )}
          </div>

          {/* View site link */}
          <a
            href="/"
            style={{ color: "#555", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", transition: "color 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#aaa"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; }}
          >
            View Site →
          </a>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
