import React from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type Point = { x: number; y: number };

const BUTTON_SIZE = 56;
const EDGE_GAP = 16;
const STORAGE_KEY = "wellcometochina-whatsapp-position";

function clampPosition(point: Point): Point {
  return {
    x: Math.min(Math.max(EDGE_GAP, point.x), Math.max(EDGE_GAP, window.innerWidth - BUTTON_SIZE - EDGE_GAP)),
    y: Math.min(Math.max(EDGE_GAP, point.y), Math.max(EDGE_GAP, window.innerHeight - BUTTON_SIZE - EDGE_GAP)),
  };
}

export default function FloatingWhatsApp() {
  const [location] = useLocation();
  const { data: contactSettings } = trpc.siteContact.get.useQuery();
  const [position, setPosition] = React.useState<Point | null>(null);
  const suppressClick = React.useRef(false);
  const drag = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origin: Point;
    current: Point;
    moved: boolean;
  } | null>(null);

  const whatsappNumber = (contactSettings?.phone || "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "";

  React.useEffect(() => {
    let initialPosition = {
      x: window.innerWidth - BUTTON_SIZE - 24,
      y: window.innerHeight - BUTTON_SIZE - 96,
    };

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Point>;
        if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
          initialPosition = { x: parsed.x as number, y: parsed.y as number };
        }
      }
    } catch {
      // A saved position is optional; use the default when storage is unavailable.
    }

    setPosition(clampPosition(initialPosition));

    const handleResize = () => setPosition(current => current ? clampPosition(current) : current);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (location.startsWith("/admin") || !whatsappUrl || !position) return null;

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: position,
      current: position,
      moved: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - activeDrag.startX;
    const deltaY = event.clientY - activeDrag.startY;
    if (!activeDrag.moved && Math.hypot(deltaX, deltaY) < 5) return;

    activeDrag.moved = true;
    activeDrag.current = clampPosition({
      x: activeDrag.origin.x + deltaX,
      y: activeDrag.origin.y + deltaY,
    });
    setPosition(activeDrag.current);
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

    suppressClick.current = activeDrag.moved;
    if (activeDrag.moved) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activeDrag.current));
      } catch {
        // The button remains draggable even when storage is unavailable.
      }
    }
    drag.current = null;
  };

  return (
    <button
      type="button"
      aria-label="Chat with us on WhatsApp. Drag to reposition."
      title="WhatsApp — drag to reposition"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 100,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: 0,
        borderRadius: "50%",
        background: "#25D366",
        color: "#fff",
        boxShadow: "0 5px 18px rgba(0, 0, 0, 0.24)",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <svg width="29" height="29" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.02 3.2A12.7 12.7 0 0 0 5.1 22.38L3.3 28.8l6.58-1.73a12.72 12.72 0 1 0 6.14-23.87Zm0 22.96a10.53 10.53 0 0 1-5.36-1.47l-.38-.22-3.9 1.02 1.04-3.8-.25-.39a10.5 10.5 0 1 1 8.85 4.86Zm5.77-7.87c-.31-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.21.31-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.31-.16-1.33-.49-2.53-1.56a9.47 9.47 0 0 1-1.75-2.18c-.18-.32-.02-.49.14-.65.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.11-.21.05-.39-.02-.55-.08-.16-.71-1.72-.98-2.35-.25-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.39-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.29 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.87-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </button>
  );
}
