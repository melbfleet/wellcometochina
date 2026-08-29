import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Mail, ArrowLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

type Enquiry = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  destination: string | null;
  month: string | null;
  year: string | null;
  duration: string | null;
  groupSize: string | null;
  budget: string | null;
  hearAboutUs: string | null;
  message: string | null;
  createdAt: Date;
};

function formatDate(d: Date) {
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Email preview HTML — table-based layout
function buildEmailHtml(data: Enquiry) {
  const logoUrl = '';

  const sectionHeader = (title: string) =>
    `<tr><td colspan="2" style="background:#c8c8c8;padding:10px 20px;font-size:16px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #b8b8b8">${title}</td></tr>`;

  const row = (label: string, value: string, even: boolean) => {
    const bg = even ? '#f2f2f2' : '#e8e8e8';
    return `<tr style="background:${bg}"><td style="padding:12px 20px;font-size:16px;color:#888;width:150px;white-space:nowrap;vertical-align:middle">${label}</td><td style="padding:12px 20px;font-size:16px;color:#2d2d2d;vertical-align:middle">${value}</td></tr>`;
  };

  const contactRows =
    row('Name', `${data.firstName} ${data.lastName}`, true) +
    row('Email', `<a href="mailto:${data.email}" style="color:#1a6fb5">${data.email}</a>`, false) +
    row('Phone', data.phone, true);

  const tripRows =
    row('Destination', data.destination || '—', true) +
    row('Travel Date', [data.month, data.year].filter(Boolean).join(' ') || '—', false) +
    row('Duration', data.duration || '—', true) +
    row('Group Size', data.groupSize || '—', false) +
    row('Budget', data.budget || '—', true) +
    row('Heard About Us', data.hearAboutUs || '—', false);

  const messageSection = data.message
    ? sectionHeader('Message') +
      `<tr><td colspan="2" style="background:#f2f2f2;padding:16px 20px"><div style="font-size:16px;color:#2d2d2d;line-height:1.7;border-left:3px solid #F5569B;padding:12px 16px;background:#ebebeb">${data.message.replace(/\n/g, '<br>')}</div></td></tr>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff">
    <tr><td align="center" style="padding:32px 24px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px">
        <tr><td style="background:rgba(20,20,20,0.92);height:65px">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="height:65px">
            <tr>
              <td style="width:130px;padding-left:20px;vertical-align:middle">
                <img src="${logoUrl}" alt="Wayseek" style="height:44px;width:auto;display:block">
              </td>
              <td style="text-align:center;vertical-align:middle">
                <span style="color:#ffffff;font-size:18px;letter-spacing:0.15em;text-transform:uppercase">NEW ENQUIRY</span>
              </td>
              <td style="width:130px;padding-right:20px;vertical-align:middle;text-align:right">
                <span style="color:#aaa;font-size:11px;letter-spacing:0.05em">${formatDate(data.createdAt)}</span>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
            ${sectionHeader('Contact Details')}
            ${contactRows}
            ${sectionHeader('Trip Details')}
            ${tripRows}
            ${messageSection}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ZebraRow({ index, label, value }: { index: number; label: string; value: React.ReactNode }) {
  const bg = index % 2 === 0 ? '#f2f2f2' : '#e8e8e8';
  return (
    <div className="flex items-center px-6 py-3" style={{ background: bg }}>
      <span className="text-sm text-[#888] w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-[#2d2d2d]">{value}</span>
    </div>
  );
}

// ── Detail view ──
function EnquiryDetail({ enquiry, onBack }: { enquiry: Enquiry; onBack: () => void }) {
  const [tab, setTab] = useState<'details' | 'email'>('details');

  return (
    <div style={{ padding: '32px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={onBack}
          style={{
            color: '#888',
            fontSize: '12px',
            letterSpacing: '0.1em',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
            transition: 'color 0.2s',
            textTransform: 'uppercase',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1a1a1a'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#888'; }}
        >
          <ArrowLeft size={14} /> Back to Enquiries
        </button>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '300', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1a1a', margin: 0 }}>
          Enquiry #{enquiry.id}
        </h1>
        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
          {enquiry.firstName} {enquiry.lastName} — {formatDate(enquiry.createdAt)}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e8e8e8', marginBottom: '24px' }}>
        {(['details', 'email'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: tab === t ? '#111' : '#888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              paddingBottom: '10px',
              borderBottom: tab === t ? '2px solid #F5569B' : '2px solid transparent',
              transition: 'color 0.2s, border-color 0.2s',
              marginBottom: '-1px',
            }}
          >
            {t === 'details' ? 'Details' : 'Email Preview'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'details' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
          {/* Contact */}
          <div className="bg-[#f2f2f2] overflow-hidden">
            <div className="bg-[#e8e8e8] px-6 py-3 border-b border-[#d8d8d8]">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Contact Details</h2>
            </div>
            <ZebraRow index={0} label="Name" value={`${enquiry.firstName} ${enquiry.lastName}`} />
            <ZebraRow index={1} label="Email" value={<a href={`mailto:${enquiry.email}`} className="text-blue-600 hover:underline">{enquiry.email}</a>} />
            <ZebraRow index={2} label="Phone" value={enquiry.phone} />
          </div>

          {/* Trip */}
          <div className="bg-[#f2f2f2] overflow-hidden">
            <div className="bg-[#e8e8e8] px-6 py-3 border-b border-[#d8d8d8]">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Trip Details</h2>
            </div>
            <ZebraRow index={0} label="Destination" value={enquiry.destination || '—'} />
            <ZebraRow index={1} label="Travel Date" value={[enquiry.month, enquiry.year].filter(Boolean).join(' ') || '—'} />
            <ZebraRow index={2} label="Duration" value={enquiry.duration || '—'} />
            <ZebraRow index={3} label="Group Size" value={enquiry.groupSize || '—'} />
            <ZebraRow index={4} label="Budget" value={enquiry.budget || '—'} />
            <ZebraRow index={5} label="Heard About Us" value={enquiry.hearAboutUs || '—'} />
          </div>

          {/* Message */}
          {enquiry.message && (
            <div className="bg-[#f2f2f2] overflow-hidden">
              <div className="bg-[#e8e8e8] px-6 py-3 border-b border-[#d8d8d8]">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Message</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-[#2d2d2d] leading-relaxed whitespace-pre-wrap border-l-[3px] border-[#F5569B] pl-4 bg-[#ebebeb] py-3 pr-4">
                  {enquiry.message}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#f2f2f2] overflow-hidden" style={{ maxWidth: '720px' }}>
          <div className="bg-[#e8e8e8] px-6 py-3 border-b border-[#d8d8d8] flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Email Preview</h2>
            <span className="text-xs text-[#888]">Email sent to inbox on submission</span>
          </div>
          <div className="p-4">
            <iframe
              srcDoc={buildEmailHtml(enquiry)}
              title="Email Preview"
              className="w-full border-0"
              style={{ height: '700px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── List view ──
function EnquiryList({ onSelect }: { onSelect: (e: Enquiry) => void }) {
  const { data: enquiries = [], isLoading } = trpc.admin.listEnquiries.useQuery();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <span style={{ color: '#888', fontSize: '13px' }}>Loading enquiries...</span>
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
        <Mail size={40} style={{ color: '#c9a96e', marginBottom: '16px', opacity: 0.5 }} />
        <p style={{ color: '#888', fontSize: '13px' }}>No enquiries yet.</p>
        <p style={{ color: '#aaa', fontSize: '12px', marginTop: '4px' }}>Submissions from the contact form will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      {enquiries.map((enq, idx) => {
        const bg = idx % 2 === 0 ? '#f2f2f2' : '#e8e8e8';
        return (
          <button
            key={enq.id}
            onClick={() => onSelect(enq as Enquiry)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: bg,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'inset 0 0 0 1px transparent',
              transition: 'box-shadow 0.18s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #ccc')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'inset 0 0 0 1px transparent')}
          >
            {/* Avatar */}
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(245,86,155,0.12)', flexShrink: 0,
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#F5569B' }}>
                {enq.firstName.charAt(0).toUpperCase()}{enq.lastName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
                  {enq.firstName} {enq.lastName}
                </span>
                {enq.destination && (
                  <span style={{ fontSize: '12px', color: '#888', background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: '9999px' }}>
                    {enq.destination}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>{enq.email}</span>
                {enq.budget && (
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#F5569B' }}>{enq.budget}</span>
                )}
              </div>
            </div>

            {/* Date */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '12px', color: '#888' }}>{formatDate(enq.createdAt)}</div>
            </div>

            <ChevronRight size={16} style={{ color: '#ccc', flexShrink: 0 }} />
          </button>
        );
      })}
    </div>
  );
}

// ── Main page ──
export default function AdminEnquiries() {
  const [selected, setSelected] = useState<Enquiry | null>(null);

  return (
    <AdminLayout title="Enquiries">
      {selected ? (
        <EnquiryDetail enquiry={selected} onBack={() => setSelected(null)} />
      ) : (
        <div style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '300', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1a1a', margin: 0 }}>
              Enquiries
            </h1>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              Click a row to view details and email preview
            </p>
          </div>

          {/* Table */}
          <div style={{ background: '#f2f2f2', overflow: 'hidden' }}>
            <div style={{ background: '#e8e8e8', padding: '12px 24px', borderBottom: '1px solid #d8d8d8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a1a1a', margin: 0 }}>
                All Enquiries
              </h2>
              <span style={{ fontSize: '12px', color: '#888' }}>Click a row to view details</span>
            </div>
            <EnquiryList onSelect={setSelected} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
