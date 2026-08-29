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

const emptyForm = {
  name: '',
  role: '',
  bio1: '',
  bio2: '',
  quote: '',
  image: '',
  specialty: '',
  storyTitle: '',
  storySubtitle: '',
  storyText: '',
  storyImage: '',
  storyImage2: '',
  isActive: true,
  sortOrder: 0,
};

type TeamMemberFormState = typeof emptyForm;

function MemberForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  title,
}: {
  initial?: Partial<TeamMemberFormState>;
  onSubmit: (data: TeamMemberFormState) => void;
  onCancel?: () => void;
  isPending?: boolean;
  title: string;
}) {
  const [form, setForm] = React.useState<TeamMemberFormState>({ ...emptyForm, ...initial });
  const update = <K extends keyof TeamMemberFormState>(key: K, value: TeamMemberFormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      {/* Basic Info */}
      <div style={sectionStyle}>
        <SectionTitle>{title}</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <Field label="Name *">
            <TextInput value={form.name} onChange={v => update('name', v)} placeholder="e.g. Sarah Chen" />
          </Field>
          <Field label="Role *">
            <TextInput value={form.role} onChange={v => update('role', v)} placeholder="e.g. Lead Guide" />
          </Field>
          <Field label="Specialty">
            <TextInput value={form.specialty} onChange={v => update('specialty', v)} placeholder="Yunnan · Sichuan · Tibetan Plateau" />
          </Field>
          <Field label="Sort Order">
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => update('sortOrder', Number(e.target.value))}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = ACCENT; }}
              onBlur={e => { e.target.style.borderColor = '#ddd'; }}
            />
          </Field>
        </div>
        <div style={{ display: 'grid', gap: '20px' }}>
          <Field label="Bio Paragraph 1">
            <TextArea value={form.bio1} onChange={v => update('bio1', v)} rows={3} />
          </Field>
          <Field label="Bio Paragraph 2">
            <TextArea value={form.bio2} onChange={v => update('bio2', v)} rows={3} />
          </Field>
          <Field label="Quote">
            <TextArea value={form.quote} onChange={v => update('quote', v)} rows={2} />
          </Field>
        </div>
        <div style={{ marginTop: '20px' }}>
          <ImageUploader
            label="Portrait Image"
            value={form.image}
            onChange={value => update('image', value)}
            category="team"
            source="team-member"
            sourceLabel={form.name || 'Team Member'}
            sourceUrl="/about/our-team"
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', color: '#555', fontSize: '13px', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isActive} onChange={e => update('isActive', e.target.checked)} />
          Active on public page
        </label>
      </div>

      {/* Story Section */}
      <div style={sectionStyle}>
        <SectionTitle>Story Section</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <Field label="Story Title">
            <TextInput value={form.storyTitle} onChange={v => update('storyTitle', v)} />
          </Field>
          <Field label="Story Subtitle">
            <TextInput value={form.storySubtitle} onChange={v => update('storySubtitle', v)} />
          </Field>
        </div>
        <Field label="Story Text">
          <TextArea value={form.storyText} onChange={v => update('storyText', v)} rows={4} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <ImageUploader
            label="Story Background Image"
            value={form.storyImage}
            onChange={value => update('storyImage', value)}
            category="team"
            source="team-member"
            sourceLabel={form.name || 'Team Member'}
            sourceUrl="/about/our-team"
          />
          <ImageUploader
            label="Story Foreground Image"
            value={form.storyImage2}
            onChange={value => update('storyImage2', value)}
            category="team"
            source="team-member"
            sourceLabel={form.name || 'Team Member'}
            sourceUrl="/about/our-team"
          />
        </div>
      </div>

      {/* Actions */}
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
          {isPending ? 'Saving...' : 'Save Member'}
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

export default function AdminAboutOurTeam() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: members = [], isLoading } = trpc.admin.listTeamMembers.useQuery();
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  const invalidate = () => utils.admin.listTeamMembers.invalidate();
  const createMutation = trpc.admin.createTeamMember.useMutation({ onSuccess: () => { invalidate(); setShowCreate(false); } });
  const updateMutation = trpc.admin.updateTeamMember.useMutation({ onSuccess: () => { invalidate(); setEditingId(null); } });
  const deleteMutation = trpc.admin.deleteTeamMember.useMutation({ onSuccess: invalidate });

  return (
    <AdminLayout title="Our Team">
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
              Our Team
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
              <Plus size={14} /> Add Member
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <MemberForm
            title="New Team Member"
            onSubmit={data => createMutation.mutate(data)}
            onCancel={() => setShowCreate(false)}
            isPending={createMutation.isPending}
          />
        )}

        {/* Member list */}
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888', fontSize: '13px' }}>Loading...</div>
        ) : members.length === 0 && !showCreate ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
            <p style={{ fontSize: '13px' }}>No team members yet. Click "+ Add Member" to get started.</p>
          </div>
        ) : (
          members.map(member => (
            <div key={member.id}>
              {editingId === member.id ? (
                <MemberForm
                  title={`Edit: ${member.name}`}
                  initial={{
                    ...member,
                    bio1: member.bio1 || '',
                    bio2: member.bio2 || '',
                    quote: member.quote || '',
                    image: member.image || '',
                    specialty: member.specialty || '',
                    storyTitle: member.storyTitle || '',
                    storySubtitle: member.storySubtitle || '',
                    storyText: member.storyText || '',
                    storyImage: member.storyImage || '',
                    storyImage2: member.storyImage2 || '',
                  }}
                  onSubmit={data => updateMutation.mutate({ id: member.id, ...data })}
                  onCancel={() => setEditingId(null)}
                  isPending={updateMutation.isPending}
                />
              ) : (
                <div style={{ background: '#fff', border: '1px solid #eee', marginBottom: '12px', padding: '18px 24px', display: 'flex', gap: '18px', alignItems: 'center' }}>
                  {member.image ? (
                    <img src={member.image} alt={member.name} style={{ width: '60px', height: '75px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '60px', height: '75px', background: '#f2f2f2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Img</span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '400', color: '#1a1a1a', marginBottom: '3px' }}>{member.name}</div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>{member.role}</div>
                    {member.specialty && <div style={{ fontSize: '12px', color: '#aaa' }}>{member.specialty}</div>}
                  </div>
                  <span style={{
                    fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: member.isActive ? '#2a7a6a' : '#999',
                    padding: '3px 8px', border: `1px solid ${member.isActive ? '#2a7a6a' : '#ddd'}`,
                  }}>
                    {member.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <button
                    onClick={() => setEditingId(member.id)}
                    style={{
                      padding: '7px 16px', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer',
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.color = '#555'; }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${member.name}"?`)) deleteMutation.mutate({ id: member.id }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#b00020'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#ccc'; }}
                    title="Delete member"
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
