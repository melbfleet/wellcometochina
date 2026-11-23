import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function FloatingWhatsApp() {
  const [location] = useLocation();
  const { data: contactSettings } = trpc.siteContact.get.useQuery();
  const whatsappNumber = (contactSettings?.phone || "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "";
  const isExperiencePage = /^\/experiences(?:\/|$)/.test(location);

  if (location.startsWith("/admin") || /^\/make-an-enquiry\/?$/.test(location) || !whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      aria-label="Chat with us on WhatsApp"
      title="WhatsApp"
      className={`${isExperiencePage ? 'hidden md:flex' : 'flex'} fixed right-[calc(1rem+env(safe-area-inset-right,0px))] bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-40 size-12 items-center justify-center touch-manipulation md:right-6 md:bottom-6 md:size-14`}
      style={{
        borderRadius: "50%",
        background: "#25D366",
        color: "#fff",
        boxShadow: "0 5px 18px rgba(0, 0, 0, 0.24)",
        userSelect: "none",
      }}
    >
      <svg width="29" height="29" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.02 3.2A12.7 12.7 0 0 0 5.1 22.38L3.3 28.8l6.58-1.73a12.72 12.72 0 1 0 6.14-23.87Zm0 22.96a10.53 10.53 0 0 1-5.36-1.47l-.38-.22-3.9 1.02 1.04-3.8-.25-.39a10.5 10.5 0 1 1 8.85 4.86Zm5.77-7.87c-.31-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.21.31-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.31-.16-1.33-.49-2.53-1.56a9.47 9.47 0 0 1-1.75-2.18c-.18-.32-.02-.49.14-.65.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.11-.21.05-.39-.02-.55-.08-.16-.71-1.72-.98-2.35-.25-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.39-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.29 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.87-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
