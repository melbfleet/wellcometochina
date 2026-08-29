import React from 'react';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const ACCENT = '#F5569B';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '13px',
  background: '#f2f2f2',
  border: '1px solid #ddd',
  outline: 'none',
  color: '#2d2d2d',
  boxSizing: 'border-box',
};

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #eee',
  padding: '28px',
  marginBottom: '24px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#1a1a1a',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid #eee',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={sectionTitleStyle}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = ACCENT; }}
      onBlur={e => { e.target.style.borderColor = '#ddd'; }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, resize: 'vertical' }}
      onFocus={e => { e.target.style.borderColor = ACCENT; }}
      onBlur={e => { e.target.style.borderColor = '#ddd'; }}
    />
  );
}

interface SectionForm {
  title: string;
  content: string;
  image: string;
  backgroundColor: string;
  sortOrder: number;
}

const emptySection: SectionForm = { title: '', content: '', image: '', backgroundColor: '#12334c', sortOrder: 0 };

function WhyUsSectionForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  formTitle,
}: {
  initial?: Partial<SectionForm>;
  onSubmit: (data: SectionForm) => void;
  onCancel?: () => void;
  isPending?: boolean;
  formTitle: string;
}) {
  const [form, setForm] = React.useState<SectionForm>({ ...emptySection, ...initial });
  const update = <K extends keyof SectionForm>(key: K, value: SectionForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      <div style={sectionStyle}>
        <SectionTitle>{formTitle}</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', marginBottom: '20px', alignItems: 'end' }}>
          <Field label="Title *">
            <TextInput value={form.title} onChange={v => update('title', v)} placeholder="e.g. Local Expertise" />
          </Field>
          <Field label="Sort Order">
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => update('sortOrder', Number(e.target.value))}
              style={{ ...inputStyle, width: '90px' }}
              onFocus={e => { e.target.style.borderColor = ACCENT; }}
              onBlur={e => { e.target.style.borderColor = '#ddd'; }}
            />
          </Field>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Field label="Background Color">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                value={form.backgroundColor || '#12334c'}
                onChange={e => update('backgroundColor', e.target.value)}
                style={{ width: 44, height: 34, padding: 0, border: '1px solid #ddd', background: 'transparent', cursor: 'pointer' }}
              />
              <TextInput value={form.backgroundColor || '#12334c'} onChange={v => update('backgroundColor', v)} placeholder="#12334c" />
            </div>
          </Field>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Field label="Content *">
            <TextArea value={form.content} onChange={v => update('content', v)} rows={4} placeholder="Describe this reason..." />
          </Field>
        </div>
        <ImageUploader
          label="Section Image"
          value={form.image}
          onChange={value => update('image', value)}
          category="about"
          source="why-us"
          sourceLabel={form.title || 'Why Us Section'}
          sourceUrl="/about/why-us"
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 28px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
            background: isPending ? 'rgba(245,86,155,0.5)' : ACCENT,
            color: '#fff', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Saving...' : 'Save Section'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
              background: 'transparent', color: '#888', border: '1px solid #ddd', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminAboutWhyUs() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: sections = [], isLoading } = trpc.about.listWhyUsSections.useQuery();
  const { data: homeSettings } = trpc.about.getWhyUsHomeSettings.useQuery();
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [homeBackgroundColor, setHomeBackgroundColor] = React.useState('#12334c');

  React.useEffect(() => {
    if (homeSettings?.backgroundColor) setHomeBackgroundColor(homeSettings.backgroundColor);
  }, [homeSettings?.backgroundColor]);

  const invalidate = () => utils.about.listWhyUsSections.invalidate();
  const invalidateHome = () => utils.about.getWhyUsHomeSettings.invalidate();
  const updateHomeSettings = trpc.about.updateWhyUsHomeSettings.useMutation({ onSuccess: invalidateHome });
  const createMutation = trpc.about.createWhyUsSection.useMutation({
    onSuccess: () => { invalidate(); setShowCreate(false); },
  });
  const updateMutation = trpc.about.updateWhyUsSection.useMutation({
    onSuccess: () => { invalidate(); setEditingId(null); },
  });
  const deleteMutation = trpc.about.deleteWhyUsSection.useMutation({ onSuccess: invalidate });

  return (
    <AdminLayout title="Why Us?">
      <div style={{ padding: '32px', maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/admin/about')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              onMouseEnter={e => { e.currentTarget.style.color = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '300', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1a1a', margin: 0 }}>
              Why Us?
            </h1>
          </div>
          {!showCreate && editingId === null && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
                background: ACCENT, color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add Section
            </button>
          )}
        </div>

        <div style={sectionStyle}>
          <SectionTitle>Why Us Homepage</SectionTitle>
          <Field label="Homepage Background Color">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                value={homeBackgroundColor}
                onChange={e => setHomeBackgroundColor(e.target.value)}
                style={{ width: 44, height: 34, padding: 0, border: '1px solid #ddd', background: 'transparent', cursor: 'pointer' }}
              />
              <TextInput value={homeBackgroundColor} onChange={setHomeBackgroundColor} placeholder="#12334c" />
              <button
                type="button"
                onClick={() => updateHomeSettings.mutate({ backgroundColor: homeBackgroundColor })}
                style={{ padding: '10px 20px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', background: ACCENT, color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {updateHomeSettings.isPending ? 'Saving...' : 'Save Color'}
              </button>
            </div>
          </Field>
        </div>

        {/* Create form */}
        {showCreate && (
          <WhyUsSectionForm
            formTitle="New Section"
            onSubmit={data => createMutation.mutate({ ...data, image: data.image || undefined })}
            onCancel={() => setShowCreate(false)}
            isPending={createMutation.isPending}
          />
        )}

        {/* Section list */}
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '13px' }}>Loading...</div>
        ) : sections.length === 0 && !showCreate ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
            <p style={{ fontSize: '13px' }}>No sections yet. Click "+ Add Section" to get started.</p>
          </div>
        ) : (
          sections.map((section, idx) => (
            <div key={section.id}>
              {editingId === section.id ? (
                <WhyUsSectionForm
                  formTitle={`Edit Section ${String(idx + 1).padStart(2, '0')}`}
                  initial={{
                    title: section.title,
                    content: section.content,
                    image: section.image || '',
                    backgroundColor: (section as any).backgroundColor || '#12334c',
                    sortOrder: section.sortOrder ?? idx,
                  }}
                  onSubmit={data => updateMutation.mutate({ id: section.id, ...data, image: data.image || undefined })}
                  onCancel={() => setEditingId(null)}
                  isPending={updateMutation.isPending}
                />
              ) : (
                <div style={{ background: '#fff', border: '1px solid #eee', marginBottom: '12px', padding: '18px 24px', display: 'flex', gap: '18px', alignItems: 'center' }}>
                  {/* Index badge */}
                  <span style={{ fontSize: '11px', color: '#c8b89a', letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0, width: '24px' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {/* Thumbnail */}
                  {section.image ? (
                    <img src={section.image} alt={section.title} style={{ width: '72px', height: '54px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '72px', height: '54px', background: '#f2f2f2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Img</span>
                    </div>
                  )}
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', color: '#1a1a1a', marginBottom: '4px' }}>{section.title}</div>
                    <div style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {section.content}
                    </div>
                  </div>
                  <div title={(section as any).backgroundColor || '#12334c'} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #ddd', background: (section as any).backgroundColor || '#12334c', flexShrink: 0 }} />
                  {/* Actions */}
                  <button
                    onClick={() => setEditingId(section.id)}
                    style={{
                      padding: '7px 16px', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer',
                      transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.color = '#555'; }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this section?')) deleteMutation.mutate({ id: section.id }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#b00020'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#ccc'; }}
                    title="Delete section"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
