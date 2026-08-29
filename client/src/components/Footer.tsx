import { Youtube, Facebook, Instagram, Linkedin, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useEffect, useState } from 'react';

/**
 * Footer Component
 * Design: Minimalist footer with Brand, Contact and Social Media sections
 * Reference: WildChina footer layout with brand logo on left
 */
export default function Footer() {
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const { data: contactSettings } = trpc.siteContact.get.useQuery();
  const logoUrl = homepageAssets?.logo?.url || '';
  const [logoLoaded, setLogoLoaded] = useState(false);

  const addressLabel = contactSettings?.addressLabel ?? '';
  const address = contactSettings?.address ?? '';
  const email = contactSettings?.email ?? '';
  const socialLinks = (contactSettings?.socialLinks ?? []).filter(link => link.isVisible && link.url.trim());

  const socialIcon = (platform: string) => {
    switch (platform.trim().toLowerCase()) {
      case 'youtube': return <Youtube size={20} />;
      case 'instagram': return <Instagram size={20} />;
      case 'facebook': return <Facebook size={20} />;
      case 'linkedin': return <Linkedin size={20} />;
      case 'tiktok':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        );
      default: return <ExternalLink size={20} />;
    }
  };

  useEffect(() => {
    setLogoLoaded(false);
  }, [logoUrl]);

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="w-full flex justify-center py-16">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Content - Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="flex items-center">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-20 object-contain"
                style={{ backgroundColor: 'transparent', display: logoLoaded ? 'block' : 'none' }}
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoLoaded(false)}
              />
            )}
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-sm font-light tracking-[0.2em] uppercase mb-8 text-white/60">CONTACT</h4>
            <div className="space-y-6">
              {/* Address */}
              <div>
                {addressLabel && <p className="text-sm font-light mb-2 text-white/80">📍 {addressLabel}:</p>}
                <p className="text-sm leading-relaxed text-white/70 whitespace-pre-line">{address}</p>
              </div>
              
              {/* Email */}
              <div>
                {email && (
                  <>
                    <p className="text-sm font-light mb-2 text-white/80">✉️ Email:</p>
                    <a href={`mailto:${email}`} className="text-sm text-white/70 hover:text-[#D4AF37] transition-colors">{email}</a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Column */}
          <div>
            <h4 className="text-sm font-light tracking-[0.2em] uppercase mb-8 text-white/60">SOCIAL MEDIA</h4>
            <div className="flex gap-6 flex-wrap">
              {socialLinks.map((link, index) => (
                <a
                  key={`${link.platform}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#D4AF37] transition-colors"
                  aria-label={link.platform}
                  title={link.platform}
                >
                  {socialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F5F3EF]/10 mb-8"></div>

        {/* Bottom Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40 tracking-wide">
            WELCOMETOCHINA | COPYRIGHT 2026 | ALL RIGHTS RESERVED
          </p>
          <div className="flex gap-8 text-xs text-white/40">
            <a href="#" className="hover:text-white/70 transition-colors tracking-wide">TERMS & CONDITIONS</a>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
