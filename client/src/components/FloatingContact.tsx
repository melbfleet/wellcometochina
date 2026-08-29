import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function FloatingContact() {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation("/make-an-enquiry");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed right-8 top-1/2 -translate-y-1/2 z-40 w-16 h-16 bg-[#D4AF37] hover:bg-[#C4A137] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
      aria-label="Contact Us"
    >
      <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform active:scale-90" />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-4 px-4 py-2 bg-[#F5F3EF] text-black rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        <span className="font-serif text-sm">Contact Us</span>
        {/* Arrow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
          <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white" />
        </div>
      </div>
    </button>
  );
}
