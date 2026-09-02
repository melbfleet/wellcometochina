import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { MapPin, Compass, Map, Route as RouteIcon, Tag, Mail, ArrowRight, Home, Zap, X, CheckCircle, AlertCircle, Loader2, MousePointerClick, ExternalLink } from "lucide-react";

const ACCENT = "#F5569B";
const GREEN = "#3d9e8c";

function StatCard({ icon: Icon, label, count, path, color = ACCENT }: {
  icon: React.ComponentType<any>;
  label: string;
  count: number | undefined;
  path: string;
  color?: string;
}) {
  return (
    <Link
      href={path}
      style={{
        display: "block",
        background: "#fff",
        padding: "24px",
        textDecoration: "none",
        transition: "box-shadow 0.18s",
        cursor: "pointer",
        border: "1px solid #eee",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ width: "40px", height: "40px", background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} style={{ color }} />
        </div>
        <ArrowRight size={14} style={{ color: "#ccc" }} />
      </div>
      <div style={{ fontSize: "28px", fontWeight: "300", color: "#1a1a1a", marginBottom: "4px" }}>
        {count ?? "—"}
      </div>
      <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>
        {label}
      </div>
    </Link>
  );
}

// ── Confirm Dialog ──────────────────────────────────────────────────────────
function ConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", width: "480px", maxWidth: "90vw",
        padding: "40px", position: "relative",
      }}>
        <button
          onClick={onCancel}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#888" }}
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "48px", height: "48px", background: GREEN + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={22} style={{ color: GREEN }} />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "500", color: "#1a1a1a", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Generate Static Pages
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
              This will render all public pages to HTML
            </div>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.7", marginBottom: "12px" }}>
          This process will use a headless browser to visit every public page on your website and save it as a static HTML file. Pages will be served from cache until you regenerate.
        </p>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.7", marginBottom: "28px" }}>
          Estimated time: <strong>1–3 minutes</strong> depending on the number of pages. The site will remain fully accessible during generation.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 24px", background: "none", border: "1px solid #ddd",
              cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#555",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 28px", background: GREEN, border: "none",
              cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#fff", fontWeight: "500",
            }}
          >
            Generate Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Result Dialog ───────────────────────────────────────────────────────────
function ResultDialog({
  result,
  onClose,
}: {
  result: { success: boolean; pagesGenerated: number; errors: string[]; durationMs: number; navDataGenerated: boolean } | null;
  onClose: () => void;
}) {
  if (!result) return null;
  const seconds = (result.durationMs / 1000).toFixed(1);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", width: "520px", maxWidth: "90vw",
        padding: "40px", position: "relative",
      }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#888" }}
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          {result.success ? (
            <CheckCircle size={28} style={{ color: GREEN }} />
          ) : (
            <AlertCircle size={28} style={{ color: "#e05c5c" }} />
          )}
          <div style={{ fontSize: "16px", fontWeight: "500", color: "#1a1a1a", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {result.success ? "Generation Complete" : "Generation Finished with Errors"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Pages Generated", value: result.pagesGenerated },
            { label: "Duration", value: `${seconds}s` },
            { label: "Nav Data", value: result.navDataGenerated ? "✓ Updated" : "✗ Failed" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#f8f8f8", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: "300", color: "#1a1a1a" }}>{value}</div>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>

        {result.errors.length > 0 && (
          <div style={{ background: "#fff5f5", border: "1px solid #fcc", padding: "16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c00", marginBottom: "8px" }}>
              {result.errors.length} Error{result.errors.length > 1 ? "s" : ""}
            </div>
            <div style={{ maxHeight: "120px", overflowY: "auto" }}>
              {result.errors.map((err, i) => (
                <div key={i} style={{ fontSize: "11px", color: "#c00", marginBottom: "4px" }}>{err}</div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "12px", background: GREEN, border: "none",
            cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#fff", fontWeight: "500",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: cities = [] } = trpc.admin.listCities.useQuery();
  const { data: experiences = [] } = trpc.admin.listExperiences.useQuery();
  const { data: waysToTravel = [] } = trpc.admin.listWaysToTravel.useQuery();
  const { data: itineraries = [] } = trpc.admin.listItineraries.useQuery();
  const { data: tags = [] } = trpc.admin.listTags.useQuery();
  const { data: enquiries = [] } = trpc.admin.listEnquiries.useQuery();
  const { data: linkClickStats, isLoading: linkClickStatsLoading } = trpc.admin.getWayToTravelLinkClickStats.useQuery();

  const [showConfirm, setShowConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean; pagesGenerated: number; errors: string[]; durationMs: number; navDataGenerated: boolean;
  } | null>(null);

  const generateMutation = trpc.staticGen.generate.useMutation({
    onSuccess: (data) => {
      setGenerating(false);
      setResult(data);
    },
    onError: (err) => {
      setGenerating(false);
      setResult({
        success: false,
        pagesGenerated: 0,
        errors: [err.message],
        durationMs: 0,
        navDataGenerated: false,
      });
    },
  });

  function handleGenerateClick() {
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    setGenerating(true);
    generateMutation.mutate();
  }

  return (
    <AdminLayout title="Dashboard">
      <div style={{ padding: "32px" }}>

        {/* Header row: Content Overview (left) + Generate button (right) */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", gap: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>
              Content Overview
            </h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>
              Manage all your website content from here.
            </p>
          </div>

          {/* Generate Static Pages button */}
          <button
            onClick={handleGenerateClick}
            disabled={generating}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "14px 28px",
              background: generating ? "#aaa" : GREEN,
              border: "none", cursor: generating ? "not-allowed" : "pointer",
              color: "#fff", flexShrink: 0,
              fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "500",
              transition: "background 0.2s, transform 0.1s",
            }}
            onMouseEnter={(e) => { if (!generating) e.currentTarget.style.background = "#2d8e7c"; }}
            onMouseLeave={(e) => { if (!generating) e.currentTarget.style.background = GREEN; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {generating ? (
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Zap size={16} />
            )}
            {generating ? "Generating..." : "Generate Static Pages"}
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
          <StatCard icon={Mail}    label="Enquiries"   count={enquiries.length}   path="/admin/enquiries"   color="#F5569B" />
          <StatCard icon={MapPin}  label="Cities"      count={cities.length}      path="/admin/cities"      color="#c9a96e" />
          <StatCard icon={Compass} label="Experiences" count={experiences.length} path="/admin/experiences" color="#6e9ec9" />
          <StatCard icon={RouteIcon} label="Way to Travel" count={waysToTravel.length} path="/admin/ways-to-travel" color="#8d7ac9" />
          <StatCard icon={Map}     label="Itineraries" count={itineraries.length} path="/admin/itineraries" color="#6ec98b" />
          <StatCard icon={Tag}     label="Tags"        count={tags.length}        path="/admin/tags"        color="#c9896e" />
          <StatCard icon={Home}    label="Homepage"    count={undefined}          path="/admin/homepage"    color="#F5569B" />
        </div>

        {/* Company link click statistics */}
        <div style={{ marginTop: "40px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Company Link Clicks
              </h2>
              <p style={{ color: "#aaa", fontSize: "12px", margin: "6px 0 0" }}>
                Every click on a company-display EXPLORE button is counted once.
              </p>
            </div>
            <div style={{ minWidth: "150px", background: "#fff", border: "1px solid #eee", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", background: "#8d7ac918", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MousePointerClick size={17} style={{ color: "#8d7ac9" }} />
              </div>
              <div>
                <div style={{ color: "#1a1a1a", fontSize: "24px", fontWeight: 300, lineHeight: 1 }}>
                  {linkClickStatsLoading ? "—" : (linkClickStats?.totalClicks ?? 0).toLocaleString()}
                </div>
                <div style={{ color: "#999", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "5px" }}>Total Clicks</div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #eee", overflowX: "auto" }}>
            {linkClickStatsLoading ? (
              <div style={{ padding: "28px 20px", color: "#aaa", fontSize: "13px", textAlign: "center" }}>Loading link statistics...</div>
            ) : !linkClickStats?.links.length ? (
              <div style={{ padding: "28px 20px", color: "#aaa", fontSize: "13px", textAlign: "center" }}>No company EXPLORE links have been configured yet.</div>
            ) : (
              <table style={{ width: "100%", minWidth: "780px", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f7f7f7", borderBottom: "1px solid #e8e8e8" }}>
                    {['Way to Travel', 'Detail Block', 'Target Link', 'Clicks', 'Last Click'].map(label => (
                      <th key={label} style={{ padding: "11px 16px", color: "#888", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linkClickStats.links.map((link, index) => (
                    <tr key={link.detailId} style={{ background: index % 2 === 0 ? "#fff" : "#fafafa", borderBottom: index === linkClickStats.links.length - 1 ? "none" : "1px solid #eee" }}>
                      <td style={{ padding: "13px 16px", color: "#222", fontSize: "13px", fontWeight: 500 }}>{link.wayToTravelName}</td>
                      <td style={{ padding: "13px 16px", color: "#555", fontSize: "13px" }}>{link.blockTitle}</td>
                      <td style={{ padding: "13px 16px", maxWidth: "280px" }}>
                        <a href={link.targetUrl} target="_blank" rel="noopener noreferrer" title={link.targetUrl} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#777", fontSize: "12px", textDecoration: "none", minWidth: 0 }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.targetUrl}</span>
                          <ExternalLink size={12} style={{ flexShrink: 0 }} />
                        </a>
                      </td>
                      <td style={{ padding: "13px 16px", color: "#1a1a1a", fontSize: "14px", fontWeight: 700 }}>{link.clickCount.toLocaleString()}</td>
                      <td style={{ padding: "13px 16px", color: "#888", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {link.lastClickedAt ? new Date(link.lastClickedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent enquiries */}
        {enquiries.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", margin: 0 }}>
                Recent Enquiries
              </h2>
              <Link href="/admin/enquiries" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div style={{ background: "#fff", border: "1px solid #eee" }}>
              {enquiries.slice(0, 5).map((enq, idx) => {
                const bg = idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8";
                return (
                  <div key={enq.id} style={{ display: "flex", alignItems: "center", padding: "12px 20px", background: bg, gap: "12px" }}>
                    <div style={{ width: "32px", height: "32px", background: "rgba(245,86,155,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: ACCENT }}>
                        {enq.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", color: "#1a1a1a" }}>{enq.firstName} {enq.lastName}</div>
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "1px" }}>{enq.email}</div>
                    </div>
                    {enq.destination && (
                      <span style={{ fontSize: "11px", color: "#888", background: "#fff", padding: "2px 8px" }}>{enq.destination}</span>
                    )}
                    <span style={{ fontSize: "11px", color: "#aaa", flexShrink: 0 }}>
                      {new Date(enq.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Dialogs */}
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {result && (
        <ResultDialog
          result={result}
          onClose={() => setResult(null)}
        />
      )}
    </AdminLayout>
  );
}
