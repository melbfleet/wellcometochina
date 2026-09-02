import React from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';

const ACCENT = '#F5569B';

type OfficeHour = { day: string; hours: string };
type SocialPlatform = 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook' | 'Xiaohongshu';
type SocialLink = { platform: SocialPlatform; url: string; isVisible: true };
type ContactForm = {
  addressLabel: string;
  address: string;
  email: string;
  phone: string;
  phoneAvailabilityText: string;
  officeHours: OfficeHour[];
  officeHoursNote: string;
  socialLinks: SocialLink[];
};

const SOCIAL_PLATFORMS = [
  { platform: 'YouTube', label: 'YouTube', defaultUrl: 'https://youtube.com' },
  { platform: 'TikTok', label: 'TikTok', defaultUrl: 'https://tiktok.com' },
  { platform: 'Instagram', label: 'Instagram', defaultUrl: 'https://instagram.com' },
  { platform: 'Facebook', label: 'Facebook', defaultUrl: 'https://facebook.com' },
  { platform: 'Xiaohongshu', label: 'Xiaohongshu (小红书)', defaultUrl: 'https://www.xiaohongshu.com' },
] as const;

const DEFAULT_FORM: ContactForm = {
  addressLabel: 'Address Chengdu',
  address: '26th Floor, No. 1-2 Hangkong Road,\nWuhou District, Chengdu, Sichuan',
  email: 'info@wellcometochina.com',
  phone: '+86 130 0812 2836',
  phoneAvailabilityText: "We're open at 9.00am",
  officeHours: [
    { day: 'Monday', hours: '2:00pm - 5:30pm' },
    { day: 'Tuesday', hours: '9:00am - 11:00pm' },
    { day: 'Wednesday', hours: '9:00am - 11:00pm' },
    { day: 'Thursday', hours: '9:00am - 11:00pm' },
    { day: 'Friday', hours: '9:00am - 11:00pm' },
    { day: 'Saturday', hours: 'Closed' },
    { day: 'Sunday', hours: 'Closed' },
  ],
  officeHoursNote: '(excluding national holidays)',
  socialLinks: SOCIAL_PLATFORMS.map(({ platform }) => ({ platform, url: '', isVisible: true })),
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '7px',
  color: '#777',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #ddd',
  background: '#f7f7f7',
  color: '#222',
  fontSize: '13px',
  padding: '10px 12px',
  outline: 'none',
};

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e8e8e8', padding: '26px', marginBottom: '20px' }}>
      <h2 style={{ margin: 0, color: '#222', fontSize: '15px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</h2>
      <p style={{ margin: '6px 0 22px', color: '#888', fontSize: '12px' }}>{description}</p>
      {children}
    </section>
  );
}

export default function AdminContactInformation() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.siteContact.get.useQuery();
  const [form, setForm] = React.useState<ContactForm>(DEFAULT_FORM);

  React.useEffect(() => {
    if (!data) return;
    setForm({
      addressLabel: data.addressLabel,
      address: data.address,
      email: data.email,
      phone: data.phone,
      phoneAvailabilityText: data.phoneAvailabilityText,
      officeHours: [...data.officeHours],
      officeHoursNote: data.officeHoursNote,
      socialLinks: SOCIAL_PLATFORMS.map(({ platform }) => ({
        platform,
        url: data.socialLinks.find(link => link.platform === platform)?.url || '',
        isVisible: true,
      })),
    });
  }, [data]);

  const updateMutation = trpc.siteContact.update.useMutation({
    onSuccess: updated => {
      utils.siteContact.get.setData(undefined, updated);
      toast.success('Contact information saved');
    },
    onError: err => toast.error(err.message || 'Unable to save contact information'),
  });

  const updateField = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const updateOfficeHour = (index: number, key: keyof OfficeHour, value: string) => {
    updateField('officeHours', form.officeHours.map((entry, entryIndex) => entryIndex === index ? { ...entry, [key]: value } : entry));
  };

  const updateSocialLink = (index: number, patch: Partial<SocialLink>) => {
    updateField('socialLinks', form.socialLinks.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...patch } : entry));
  };

  const canSave = form.officeHours.every(entry => entry.day.trim() && entry.hours.trim())
    && form.socialLinks.every(entry => entry.platform.trim());

  return (
    <AdminLayout title="Contact Information">
      <div style={{ padding: '32px', maxWidth: '980px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1a1a1a', fontSize: '22px', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Contact Information</h1>
            <p style={{ color: '#888', fontSize: '13px', margin: '6px 0 0' }}>Manage footer contact details and the Enquire contact card.</p>
          </div>
          <button
            type="button"
            disabled={!canSave || updateMutation.isPending}
            onClick={() => updateMutation.mutate(form)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', border: 0, background: !canSave || updateMutation.isPending ? '#bbb' : ACCENT, color: '#fff', cursor: !canSave || updateMutation.isPending ? 'not-allowed' : 'pointer', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            <Save size={14} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {isLoading && <p style={{ color: '#888', fontSize: '13px' }}>Loading contact information...</p>}
        {error && <p style={{ color: '#c33', fontSize: '13px' }}>{error.message}</p>}

        {!isLoading && !error && (
          <>
            <Section title="Footer Contact Details" description="These fields appear in the footer. The public email does not change SMTP or enquiry delivery settings.">
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '18px' }}>
                <div>
                  <label style={labelStyle}>Address label</label>
                  <input style={inputStyle} value={form.addressLabel} onChange={event => updateField('addressLabel', event.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Public email</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={event => updateField('email', event.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Address</label>
                  <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.address} onChange={event => updateField('address', event.target.value)} />
                </div>
              </div>
            </Section>

            <Section title="Enquire Contact Card" description="The phone number and availability text appear beside the Enquire form.">
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '18px' }}>
                <div>
                  <label style={labelStyle}>Phone number</label>
                  <input style={inputStyle} value={form.phone} onChange={event => updateField('phone', event.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Availability text</label>
                  <input style={inputStyle} value={form.phoneAvailabilityText} onChange={event => updateField('phoneAvailabilityText', event.target.value)} />
                </div>
              </div>
            </Section>

            <Section title="Office Hours" description="Add, remove or reorder the rows shown on the Enquire page.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {form.officeHours.map((entry, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 0.7fr) minmax(180px, 1fr) 36px', gap: '10px', alignItems: 'center' }}>
                    <input aria-label={`Day ${index + 1}`} style={inputStyle} value={entry.day} onChange={event => updateOfficeHour(index, 'day', event.target.value)} placeholder="Day" />
                    <input aria-label={`Hours ${index + 1}`} style={inputStyle} value={entry.hours} onChange={event => updateOfficeHour(index, 'hours', event.target.value)} placeholder="Hours or Closed" />
                    <button aria-label={`Remove ${entry.day}`} type="button" onClick={() => updateField('officeHours', form.officeHours.filter((_, entryIndex) => entryIndex !== index))} style={{ border: 0, background: 'transparent', color: '#b44', cursor: 'pointer', padding: '8px' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => updateField('officeHours', [...form.officeHours, { day: '', hours: '' }])} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px', padding: '9px 14px', border: '1px solid #ddd', background: '#fff', color: '#555', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}><Plus size={13} /> Add hours row</button>
              <div style={{ marginTop: '18px' }}>
                <label style={labelStyle}>Office hours note</label>
                <input style={inputStyle} value={form.officeHoursNote} onChange={event => updateField('officeHoursNote', event.target.value)} />
              </div>
            </Section>

            <Section title="Social Media" description="Footer social icons stay fixed and Xiaohongshu appears last. Leave a field blank to use that platform's official homepage.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SOCIAL_PLATFORMS.map(({ platform, label, defaultUrl }, index) => (
                  <div key={platform} style={{ display: 'grid', gridTemplateColumns: '140px minmax(220px, 1fr)', gap: '14px', alignItems: 'center' }}>
                    <span style={{ color: '#444', fontSize: '13px', fontWeight: 600 }}>{label}</span>
                    <input aria-label={`${platform} URL`} style={inputStyle} value={form.socialLinks[index]?.url || ''} onChange={event => updateSocialLink(index, { url: event.target.value, isVisible: true })} placeholder={`Default: ${defaultUrl}`} />
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
