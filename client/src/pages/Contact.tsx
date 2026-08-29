import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Phone, Clock, ChevronDown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect';

// ── Contact Partner Logos with drag scroll ──
function ContactPartnerLogos() {
  const { data: homepageData } = trpc.homepage.getPublicData.useQuery();
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const ctaTexture = homepageAssets?.cta?.url || '';
  const textureOpacity = Math.max(0, Math.min(1, Number((homepageAssets?.cta as any)?.opacity ?? 28) / 100));
  const logos = (homepageData?.sponsors || []).flatMap((sponsor: any) => {
    let urls: string[] = [];
    try {
      urls = typeof sponsor.logoUrls === 'string' ? JSON.parse(sponsor.logoUrls) : sponsor.logoUrls || [];
    } catch {
      urls = [];
    }
    return urls.filter(Boolean).map((logoUrl: string) => ({
      src: logoUrl,
      alt: sponsor.name || 'Sponsor',
      url: sponsor.websiteUrl || undefined,
    }));
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const cancelInertia = () => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };
  const startInertia = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) < 0.5) { velocityRef.current = 0; return; }
      track.scrollLeft -= velocityRef.current;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelInertia(), []);

  if (logos.length === 0) return null;

  const onMouseDown = (e: React.MouseEvent) => {
    cancelInertia();
    draggingRef.current = true;
    startXRef.current = e.pageX;
    scrollStartRef.current = trackRef.current?.scrollLeft ?? 0;
    lastXRef.current = e.pageX;
    velocityRef.current = 0;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };
  const onMouseUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const walk = e.pageX - startXRef.current;
    velocityRef.current = e.pageX - lastXRef.current;
    lastXRef.current = e.pageX;
    if (trackRef.current) trackRef.current.scrollLeft = scrollStartRef.current - walk;
  };
  const onTouchStart = (e: React.TouchEvent) => {
    cancelInertia();
    draggingRef.current = true;
    startXRef.current = e.touches[0].pageX;
    scrollStartRef.current = trackRef.current?.scrollLeft ?? 0;
    lastXRef.current = e.touches[0].pageX;
    velocityRef.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const walk = e.touches[0].pageX - startXRef.current;
    velocityRef.current = e.touches[0].pageX - lastXRef.current;
    lastXRef.current = e.touches[0].pageX;
    if (trackRef.current) trackRef.current.scrollLeft = scrollStartRef.current - walk;
  };
  const onTouchEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    startInertia();
  };

  return (
    <section style={{ position: 'relative', width: '100%', height: '260px', backgroundColor: '#315c00', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: ctaTexture ? `url(${ctaTexture})` : '', backgroundSize: '420px 420px', backgroundRepeat: 'repeat', opacity: textureOpacity, mixBlendMode: 'normal', filter: 'contrast(1.45) brightness(1.08)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', overflow: 'hidden' }}>
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ display: 'flex', flexDirection: 'row', overflowX: 'scroll', msOverflowStyle: 'none', scrollbarWidth: 'none', cursor: 'grab', userSelect: 'none', WebkitOverflowScrolling: 'touch', paddingLeft: '24px', paddingRight: '24px', gap: '56px', alignItems: 'center' }}
        >
          {logos.map((logo, i) => (
            <div key={i} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', minWidth: '160px' }}>
              {logo.url ? (
                <a href={logo.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={logo.src} alt={logo.alt} draggable={false} style={{ height: '100%', width: 'auto', maxWidth: '280px', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85, pointerEvents: 'none' }} />
                </a>
              ) : (
                <img src={logo.src} alt={logo.alt} draggable={false} style={{ height: '100%', width: 'auto', maxWidth: '280px', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85, pointerEvents: 'none' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 全球国家区号数据（ISO 两字母代码 + 国家名 + 区号）
const COUNTRIES = [
  { iso: 'cn', name: 'China', code: '+86' },
  { iso: 'us', name: 'United States', code: '+1' },
  { iso: 'gb', name: 'United Kingdom', code: '+44' },
  { iso: 'fr', name: 'France', code: '+33' },
  { iso: 'de', name: 'Germany', code: '+49' },
  { iso: 'jp', name: 'Japan', code: '+81' },
  { iso: 'kr', name: 'South Korea', code: '+82' },
  { iso: 'au', name: 'Australia', code: '+61' },
  { iso: 'ca', name: 'Canada', code: '+1' },
  { iso: 'in', name: 'India', code: '+91' },
  { iso: 'br', name: 'Brazil', code: '+55' },
  { iso: 'ru', name: 'Russia', code: '+7' },
  { iso: 'it', name: 'Italy', code: '+39' },
  { iso: 'es', name: 'Spain', code: '+34' },
  { iso: 'mx', name: 'Mexico', code: '+52' },
  { iso: 'za', name: 'South Africa', code: '+27' },
  { iso: 'sg', name: 'Singapore', code: '+65' },
  { iso: 'hk', name: 'Hong Kong', code: '+852' },
  { iso: 'tw', name: 'Taiwan', code: '+886' },
  { iso: 'nl', name: 'Netherlands', code: '+31' },
  { iso: 'be', name: 'Belgium', code: '+32' },
  { iso: 'ch', name: 'Switzerland', code: '+41' },
  { iso: 'at', name: 'Austria', code: '+43' },
  { iso: 'se', name: 'Sweden', code: '+46' },
  { iso: 'no', name: 'Norway', code: '+47' },
  { iso: 'dk', name: 'Denmark', code: '+45' },
  { iso: 'fi', name: 'Finland', code: '+358' },
  { iso: 'pt', name: 'Portugal', code: '+351' },
  { iso: 'gr', name: 'Greece', code: '+30' },
  { iso: 'pl', name: 'Poland', code: '+48' },
  { iso: 'cz', name: 'Czech Republic', code: '+420' },
  { iso: 'hu', name: 'Hungary', code: '+36' },
  { iso: 'ro', name: 'Romania', code: '+40' },
  { iso: 'bg', name: 'Bulgaria', code: '+359' },
  { iso: 'hr', name: 'Croatia', code: '+385' },
  { iso: 'sk', name: 'Slovakia', code: '+421' },
  { iso: 'si', name: 'Slovenia', code: '+386' },
  { iso: 'lt', name: 'Lithuania', code: '+370' },
  { iso: 'lv', name: 'Latvia', code: '+371' },
  { iso: 'ee', name: 'Estonia', code: '+372' },
  { iso: 'ua', name: 'Ukraine', code: '+380' },
  { iso: 'tr', name: 'Turkey', code: '+90' },
  { iso: 'sa', name: 'Saudi Arabia', code: '+966' },
  { iso: 'ae', name: 'UAE', code: '+971' },
  { iso: 'il', name: 'Israel', code: '+972' },
  { iso: 'ir', name: 'Iran', code: '+98' },
  { iso: 'iq', name: 'Iraq', code: '+964' },
  { iso: 'pk', name: 'Pakistan', code: '+92' },
  { iso: 'bd', name: 'Bangladesh', code: '+880' },
  { iso: 'lk', name: 'Sri Lanka', code: '+94' },
  { iso: 'np', name: 'Nepal', code: '+977' },
  { iso: 'my', name: 'Malaysia', code: '+60' },
  { iso: 'id', name: 'Indonesia', code: '+62' },
  { iso: 'ph', name: 'Philippines', code: '+63' },
  { iso: 'th', name: 'Thailand', code: '+66' },
  { iso: 'vn', name: 'Vietnam', code: '+84' },
  { iso: 'mm', name: 'Myanmar', code: '+95' },
  { iso: 'kh', name: 'Cambodia', code: '+855' },
  { iso: 'la', name: 'Laos', code: '+856' },
  { iso: 'mn', name: 'Mongolia', code: '+976' },
  { iso: 'kz', name: 'Kazakhstan', code: '+7' },
  { iso: 'uz', name: 'Uzbekistan', code: '+998' },
  { iso: 'az', name: 'Azerbaijan', code: '+994' },
  { iso: 'ge', name: 'Georgia', code: '+995' },
  { iso: 'am', name: 'Armenia', code: '+374' },
  { iso: 'nz', name: 'New Zealand', code: '+64' },
  { iso: 'fj', name: 'Fiji', code: '+679' },
  { iso: 'pg', name: 'Papua New Guinea', code: '+675' },
  { iso: 'eg', name: 'Egypt', code: '+20' },
  { iso: 'ng', name: 'Nigeria', code: '+234' },
  { iso: 'ke', name: 'Kenya', code: '+254' },
  { iso: 'gh', name: 'Ghana', code: '+233' },
  { iso: 'tz', name: 'Tanzania', code: '+255' },
  { iso: 'ug', name: 'Uganda', code: '+256' },
  { iso: 'et', name: 'Ethiopia', code: '+251' },
  { iso: 'sn', name: 'Senegal', code: '+221' },
  { iso: 'ci', name: "Côte d'Ivoire", code: '+225' },
  { iso: 'cm', name: 'Cameroon', code: '+237' },
  { iso: 'ao', name: 'Angola', code: '+244' },
  { iso: 'mz', name: 'Mozambique', code: '+258' },
  { iso: 'zw', name: 'Zimbabwe', code: '+263' },
  { iso: 'zm', name: 'Zambia', code: '+260' },
  { iso: 'bw', name: 'Botswana', code: '+267' },
  { iso: 'na', name: 'Namibia', code: '+264' },
  { iso: 'ma', name: 'Morocco', code: '+212' },
  { iso: 'dz', name: 'Algeria', code: '+213' },
  { iso: 'tn', name: 'Tunisia', code: '+216' },
  { iso: 'ly', name: 'Libya', code: '+218' },
  { iso: 'sd', name: 'Sudan', code: '+249' },
  { iso: 'ar', name: 'Argentina', code: '+54' },
  { iso: 'cl', name: 'Chile', code: '+56' },
  { iso: 'co', name: 'Colombia', code: '+57' },
  { iso: 'pe', name: 'Peru', code: '+51' },
  { iso: 've', name: 'Venezuela', code: '+58' },
  { iso: 'ec', name: 'Ecuador', code: '+593' },
  { iso: 'bo', name: 'Bolivia', code: '+591' },
  { iso: 'py', name: 'Paraguay', code: '+595' },
  { iso: 'uy', name: 'Uruguay', code: '+598' },
  { iso: 'cr', name: 'Costa Rica', code: '+506' },
  { iso: 'pa', name: 'Panama', code: '+507' },
  { iso: 'gt', name: 'Guatemala', code: '+502' },
  { iso: 'hn', name: 'Honduras', code: '+504' },
  { iso: 'sv', name: 'El Salvador', code: '+503' },
  { iso: 'ni', name: 'Nicaragua', code: '+505' },
  { iso: 'cu', name: 'Cuba', code: '+53' },
  { iso: 'do', name: 'Dominican Republic', code: '+1' },
  { iso: 'jm', name: 'Jamaica', code: '+1' },
  { iso: 'tt', name: 'Trinidad and Tobago', code: '+1' },
  { iso: 'is', name: 'Iceland', code: '+354' },
  { iso: 'ie', name: 'Ireland', code: '+353' },
  { iso: 'lu', name: 'Luxembourg', code: '+352' },
  { iso: 'mt', name: 'Malta', code: '+356' },
  { iso: 'cy', name: 'Cyprus', code: '+357' },
  { iso: 'al', name: 'Albania', code: '+355' },
  { iso: 'mk', name: 'North Macedonia', code: '+389' },
  { iso: 'ba', name: 'Bosnia & Herzegovina', code: '+387' },
  { iso: 'rs', name: 'Serbia', code: '+381' },
  { iso: 'me', name: 'Montenegro', code: '+382' },
  { iso: 'md', name: 'Moldova', code: '+373' },
  { iso: 'by', name: 'Belarus', code: '+375' },
  { iso: 'jo', name: 'Jordan', code: '+962' },
  { iso: 'lb', name: 'Lebanon', code: '+961' },
  { iso: 'sy', name: 'Syria', code: '+963' },
  { iso: 'ye', name: 'Yemen', code: '+967' },
  { iso: 'om', name: 'Oman', code: '+968' },
  { iso: 'qa', name: 'Qatar', code: '+974' },
  { iso: 'bh', name: 'Bahrain', code: '+973' },
  { iso: 'kw', name: 'Kuwait', code: '+965' },
  { iso: 'af', name: 'Afghanistan', code: '+93' },
  { iso: 'mv', name: 'Maldives', code: '+960' },
  { iso: 'bt', name: 'Bhutan', code: '+975' },
  { iso: 'tl', name: 'Timor-Leste', code: '+670' },
  { iso: 'bn', name: 'Brunei', code: '+673' },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    destination: '',
    month: '',
    year: '',
    duration: '',
    travelers: '',
    budget: '',
    comments: '',
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    source: '',
    newsletter: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialCode, setDialCode] = useState(COUNTRIES[0]);
  const [dialOpen, setDialOpen] = useState(false);
  const phoneRowRef = useRef<HTMLDivElement>(null);

  // 今天起一周后的最早可选日期
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minYear = minDate.getFullYear();
  const minMonth = minDate.getMonth() + 1; // 1-12

  const monthValues = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const isMonthDisabled = (monthVal: string, selectedYear: string) => {
    const yearNum = parseInt(selectedYear);
    if (!selectedYear) return false;
    if (yearNum < minYear) return true;
    if (yearNum === minYear) {
      const monthIdx = monthValues.indexOf(monthVal) + 1; // 1-12
      return monthIdx < minMonth;
    }
    return false;
  };
  const isYearDisabled = (yearVal: string) => parseInt(yearVal) < minYear;

  // Select options (defined after helper functions)
  const monthOptions = [
    {value:'jan',label:'January'},{value:'feb',label:'February'},{value:'mar',label:'March'},
    {value:'apr',label:'April'},{value:'may',label:'May'},{value:'jun',label:'June'},
    {value:'jul',label:'July'},{value:'aug',label:'August'},{value:'sep',label:'September'},
    {value:'oct',label:'October'},{value:'nov',label:'November'},{value:'dec',label:'December'},
  ].map(o => ({...o, disabled: isMonthDisabled(o.value, formData.year)}));

  const yearOptions = ['2025','2026','2027','2028']
    .filter(y => !isYearDisabled(y))
    .map(y => ({value: y, label: y}));

  const durationOptions = [
    {value:'1-3',label:'1-3 days'},{value:'4-7',label:'4-7 days'},
    {value:'8-14',label:'8-14 days'},{value:'15-21',label:'15-21 days'},
    {value:'22-30',label:'22-30 days'},{value:'30+',label:'30+ days'},
  ];

  const travelersOptions = [
    {value:'1',label:'1 person'},{value:'2',label:'2 people'},
    {value:'3',label:'3 people'},{value:'4',label:'4 people'},{value:'5',label:'5+ people'},
  ];

  const sourceOptions = [
    {value:'google',label:'Google'},{value:'social',label:'Social Media'},
    {value:'referral',label:'Referral'},{value:'other',label:'Other'},
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };



  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.destination.trim()) newErrors.destination = 'Please select a destination';
    if (!formData.month) newErrors.month = 'Please select a month';
    if (!formData.year) newErrors.year = 'Please select a year';
    if (!formData.duration) newErrors.duration = 'Please select a duration';
    if (!formData.travelers) newErrors.travelers = 'Please select number of travelers';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.confirmEmail.trim()) newErrors.confirmEmail = 'Please confirm your email';
    if (formData.email !== formData.confirmEmail) newErrors.confirmEmail = 'Emails do not match';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success('Your enquiry has been sent! We will be in touch shortly.');
      setFormData({
        destination: '',
        month: '',
        year: '',
        duration: '',
        travelers: '',
        budget: '',
        comments: '',
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
        phone: '',
        source: '',
        newsletter: false,
      });
      setErrors({});
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send enquiry. Please try again later.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      submitMutation.mutate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: `${dialCode.code} ${formData.phone}`,
        destination: formData.destination,
        month: formData.month,
        year: formData.year,
        duration: formData.duration,
        groupSize: formData.travelers,
        budget: formData.budget,
        hearAboutUs: formData.source,
        message: formData.comments,
      });
    }
  };

  const budgetOptions = [
    { value: '$30,000+ per person', label: '$30,000+ per person' },
    { value: '$20,000 - 30,000 per person', label: '$20,000 - 30,000 per person' },
    { value: '$10,000 - 20,000 per person', label: '$10,000 - 20,000 per person' },
    { value: '$5,000 - 10,000 per person', label: '$5,000 - 10,000 per person' },
    { value: '$3,000 - 5,000 per person', label: '$3,000 - 5,000 per person' },
    { value: 'Under $3,000 per person', label: 'Under $3,000 per person' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-[50px] relative bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 uppercase tracking-widest text-[#1a1a1a]" style={{color: '#2e2e2e', fontSize: '35px', fontFamily: 'Manrope'}}>
              Plan Your Journey
            </h1>
            <p className="text-[#555555] max-w-2xl mx-auto text-lg leading-relaxed" style={{color: '#6b6b6b', fontSize: '15px', fontFamily: 'Lato, sans-serif'}}>
              We'll be in touch shortly after you submit the form, matching you with a Travel Expert and setting up a time to talk – over email, phone or video call. For an immediate conversation, simply call us.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Your Trip Section */}
                <div className="space-y-6 bg-[#f2f2f2] p-8">
                  <h2 className="text-2xl font-bold uppercase tracking-wider text-[#1a1a1a]">Your Trip</h2>
                  
                  {/* Where would you like to go */}
                  <div>
                    <label className="block text-base mb-3 text-[#333333]">
                      Where would you like to go?<span className="text-[#333333]">*</span>
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Select as many options as you want"
                      className={`w-full px-4 h-[50px] bg-white outline-none border border-transparent hover:border-[#777777] focus:border-[#777777] transition-all duration-300 placeholder-[#aaaaaa] text-base text-[#2d2d2d] ${errors.destination ? '!border-red-400' : ''}`}
                    />
                    {errors.destination && (
                      <p className="text-red-500 text-sm mt-2">{errors.destination}</p>
                    )}
                  </div>

                  {/* When, Year and Duration - All in one row */}
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-base mb-3 text-[#333333]">
                        <span className="whitespace-nowrap">When would you like to go?<span className="text-[#333333]">*</span></span>
                      </label>
                      <CustomSelect
                        options={monthOptions}
                        value={formData.month}
                        onChange={v => setFormData(p => ({...p, month: v}))}
                        placeholder="Select a month"
                        hasError={!!errors.month}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-[140px]">
                      <CustomSelect
                        options={yearOptions}
                        value={formData.year}
                        onChange={v => setFormData(p => {
                          // 如果新选的年份是今年，且已选月份早于最小可选月，则清空月份
                          const newYear = parseInt(v);
                          const currentMonth = p.month;
                          let newMonth = currentMonth;
                          if (currentMonth && newYear === minYear) {
                            const monthIdx = monthValues.indexOf(currentMonth) + 1;
                            if (monthIdx < minMonth) newMonth = '';
                          }
                          return {...p, year: v, month: newMonth};
                        })}
                        placeholder="Select a year"
                        hasError={!!errors.year}
                      />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-base mb-3 text-[#333333]">
                        How long for?<span className="text-[#333333]">*</span>
                      </label>
                      <CustomSelect
                        options={durationOptions}
                        value={formData.duration}
                        onChange={v => setFormData(p => ({...p, duration: v}))}
                        placeholder="Duration of trip"
                        hasError={!!errors.duration}
                      />
                    </div>
                  </div>

                  {/* Travelers */}
                  <div>
                    <label className="block text-base mb-3 text-[#333333]">
                      How many people are travelling?<span className="text-[#333333]">*</span>
                    </label>
                    <CustomSelect
                      options={travelersOptions}
                      value={formData.travelers}
                      onChange={v => setFormData(p => ({...p, travelers: v}))}
                      placeholder="Select a number"
                      hasError={!!errors.travelers}
                    />
                    {errors.travelers && (
                      <p className="text-red-500 text-sm mt-2">{errors.travelers}</p>
                    )}
                  </div>

                  {/* Budget Dropdown */}
                  <div>
                    <label className="block text-base mb-3 text-[#333333]">
                      How much would you like to spend <strong>per person</strong>?<span className="text-[#333333]">*</span>
                    </label>
                    <CustomSelect
                      options={budgetOptions}
                      value={formData.budget}
                      onChange={v => setFormData(p => ({...p, budget: v}))}
                      placeholder="Select a range"
                    />
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-base mb-3 text-[#333333]">
                      Any other comments or requests?
                    </label>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                      placeholder="E.g. special occasion, any must dos or don'ts"
                      className="w-full px-4 py-3 bg-white outline-none border border-transparent hover:border-[#777777] focus:border-[#777777] transition-all duration-300 h-32 resize-none placeholder-[#aaaaaa] text-base text-[#2d2d2d]"
                    ></textarea>
                  </div>
                </div>

                {/* Your Details Section */}
                <div className="space-y-6 bg-[#f2f2f2] p-8">
                  <h2 className="text-2xl font-bold uppercase tracking-wider text-[#1a1a1a]">Your Details</h2>

                  {/* Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0 sm:gap-y-4 gap-x-4">
                    <div>
                      <label className="block text-base mb-3 text-[#333333]">
                        Your Name<span className="text-[#333333]">*</span>
                      </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className={`w-full px-4 h-[50px] bg-white outline-none border border-transparent hover:border-[#777777] focus:border-[#777777] transition-all duration-300 placeholder-[#aaaaaa] text-base text-[#2d2d2d] ${errors.firstName ? '!border-red-400' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-2">{errors.firstName}</p>
                    )}
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <label className="block text-base mb-3 text-[#333333] invisible select-none sm:block hidden">
                        &nbsp;
                      </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className={`w-full px-4 h-[50px] bg-white outline-none border border-transparent hover:border-[#777777] focus:border-[#777777] transition-all duration-300 placeholder-[#aaaaaa] text-base text-[#2d2d2d] ${errors.lastName ? '!border-red-400' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-2">{errors.lastName}</p>
                    )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base mb-3 text-[#333333]">
                        Email address<span className="text-[#333333]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 h-[50px] bg-white outline-none border border-transparent hover:border-[#777777] focus:border-[#777777] transition-all duration-300 placeholder-[#aaaaaa] text-base text-[#2d2d2d] ${errors.email ? '!border-red-400' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-base mb-3 text-[#333333]">
                        Confirm email address<span className="text-[#333333]">*</span>
                      </label>
                      <input
                        type="email"
                        name="confirmEmail"
                        value={formData.confirmEmail}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 h-[50px] bg-white outline-none border border-transparent hover:border-[#777777] focus:border-[#777777] transition-all duration-300 placeholder-[#aaaaaa] text-base text-[#2d2d2d] ${errors.confirmEmail ? '!border-red-400' : ''}`}
                      />
                      {errors.confirmEmail && (
                        <p className="text-red-500 text-sm mt-2">{errors.confirmEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <div>
                      <label className="block text-base mb-3 text-[#333333]">
                        Phone number<span className="text-[#333333]">*</span>
                      </label>
                      <div className="flex gap-2 relative min-w-0" ref={phoneRowRef}>
                        {/* Custom dial code picker */}
                        <div className="relative w-[140px] flex-shrink-0">
                          <CustomSelect
                            options={COUNTRIES.map(c => ({
                              value: c.code + '|' + c.name,
                              label: `${c.name} (${c.code})`,
                              searchLabel: `${c.name} ${c.code}`,
                              displayLabel: (
                                <span className="flex items-center gap-2">
                                  <img src={`https://flagcdn.com/w40/${c.iso}.png`} alt={c.name} width={35} height={25} className="flex-shrink-0" />
                                  <span>{c.code}</span>
                                </span>
                              ),
                              optionLabel: (
                                <span className="flex items-center gap-3">
                                  <img src={`https://flagcdn.com/w40/${c.iso}.png`} alt={c.name} width={35} height={25} className="flex-shrink-0" />
                                  <span>{c.name} ({c.code})</span>
                                </span>
                              ),
                            }))}
                            value={dialCode.code + '|' + dialCode.name}
                            onChange={v => {
                              const found = COUNTRIES.find(c => c.code + '|' + c.name === v);
                              if (found) setDialCode(found);
                            }}
                            placeholder="+86"
                            searchable={true}
                            className="w-[140px]"
                            dropdownContainerRef={phoneRowRef}
                          />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Phone number"
                          className={`flex-1 min-w-0 px-4 h-[50px] bg-white outline-none border border-transparent hover:border-[#777777] focus:border-[#777777] transition-all duration-300 placeholder-[#aaaaaa] text-base text-[#2d2d2d] ${errors.phone ? '!border-red-400' : ''}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
                      )}
                    </div>

                  </div>

                  {/* Source - separate row */}
                  <div>
                    <label className="block text-base mb-3 text-[#333333]">
                      How did you hear about us?
                    </label>
                    <CustomSelect
                      options={sourceOptions}
                      value={formData.source}
                      onChange={v => setFormData(p => ({...p, source: v}))}
                      placeholder="Select"
                    />
                  </div>

                </div>
              </form>

            </div>

              {/* Sidebar */}
            <div className="sticky top-[55px]">
              {/* Mobile-only Submit Button — appears above phone card on portrait screens */}
              <div className="flex justify-center mb-6 lg:hidden">
                <button
                  type="button"
                  disabled={submitMutation.isPending}
                  onClick={handleSubmit as any}
                  style={{ backgroundColor: '#F5569B', color: '#ffffff', borderColor: '#F5569B' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#F5569B';
                    e.currentTarget.style.borderColor = '#F5569B';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#F5569B';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#F5569B';
                  }}
                  className="px-8 py-3 text-sm font-semibold tracking-wider uppercase border rounded-sm transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitMutation.isPending ? 'Sending...' : 'Submit Enquiry'}
                </button>
              </div>
              {/* Combined Call Today & Office Hours Card */}
              <div className="bg-[#f2f2f2] flex flex-col items-center text-center mx-auto" style={{maxWidth:'425px',width:'100%',height:'580px'}}>
                {/* Call Today Section */}
                <div className="w-full flex flex-col items-center px-8 pt-6 pb-4">
                  <Phone className="w-6 h-6 text-[#1a1a1a] mb-2" />
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-2 text-[#1a1a1a]">Call Us Today</h3>
                  <a href="tel:+8613008122836" className="font-bold text-lg hover:underline block mb-2" style={{color:'#e0457b', fontFamily: 'Brandon Grotesque', letterSpacing: '0.12em'}}>
                    +86 130 0812 2836
                  </a>
                  <p className="text-sm text-[#666666]" style={{letterSpacing: '0.03em'}}>
                    We're open at 9.00am
                  </p>
                </div>

                {/* Divider */}
                <div className="flex justify-center py-1">
                  <div className="border-t border-gray-300" style={{width:'80px'}}></div>
                </div>

                {/* Office Hours Section */}
                <div className="w-full flex flex-col items-center px-8 pt-5 pb-5 flex-1">
                  <Clock className="w-6 h-6 text-[#1a1a1a] mb-3" strokeWidth={1.2} />
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-4 text-[#1a1a1a]">Office Hours</h3>
                  <div className="space-y-[15px] w-full">
                    {[
                      ['Monday', '2:00pm - 5:30pm'],
                      ['Tuesday', '9:00am - 11:00pm'],
                      ['Wednesday', '9:00am - 11:00pm'],
                      ['Thursday', '9:00am - 11:00pm'],
                      ['Friday', '9:00am - 11:00pm'],
                      ['Saturday', 'Closed'],
                      ['Sunday', 'Closed'],
                    ].map(([day, hours]) => (
                      <p key={day} className="text-[#333333] text-center text-[15px]" style={{letterSpacing: '0.06em'}}>
                        <span className="font-bold">{day}:</span>{' '}
                        <span className="font-normal">{hours}</span>
                      </p>
                    ))}
                  </div>
                  <p className="text-[#999999] mt-4" style={{fontSize:'15px', letterSpacing: '0.06em'}}>(excluding national holidays)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button - desktop only (mobile version is above phone card in sidebar) */}
          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
            <div className="lg:col-span-2 flex justify-center">
              <button
                type="button"
                disabled={submitMutation.isPending}
                onClick={handleSubmit as any}
                style={{ backgroundColor: '#F5569B', color: '#ffffff', borderColor: '#F5569B' }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#F5569B';
                  e.currentTarget.style.borderColor = '#F5569B';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#F5569B';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#F5569B';
                }}
                className="px-8 py-3 text-sm font-semibold tracking-wider uppercase border rounded-sm transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitMutation.isPending ? 'Sending...' : 'Submit Enquiry'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Logos Section - Green Texture */}
      <ContactPartnerLogos />

      <Footer />
    </div>
  );
}
