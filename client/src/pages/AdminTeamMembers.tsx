import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import { trpc } from '@/lib/trpc';

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: '16px' }}>
      <span style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#777', marginBottom: '6px' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' };
const textAreaStyle: React.CSSProperties = { ...inputStyle, minHeight: '96px', resize: 'vertical' };

function MemberForm({ initial, onSubmit, onCancel, isPending }: { initial?: Partial<TeamMemberFormState>; onSubmit: (data: TeamMemberFormState) => void; onCancel?: () => void; isPending?: boolean }) {
  const [form, setForm] = React.useState<TeamMemberFormState>({ ...emptyForm, ...initial });
  const update = <K extends keyof TeamMemberFormState>(key: K, value: TeamMemberFormState[K]) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} style={{ background: '#fff', border: '1px solid #e5e5e5', padding: '24px', marginBottom: '28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <Field label="Name"><input value={form.name} onChange={e => update('name', e.target.value)} style={inputStyle} required /></Field>
        <Field label="Role"><input value={form.role} onChange={e => update('role', e.target.value)} style={inputStyle} required /></Field>
        <Field label="Specialty"><input value={form.specialty} onChange={e => update('specialty', e.target.value)} style={inputStyle} placeholder="Yunnan · Sichuan · Tibetan Plateau" /></Field>
        <Field label="Sort Order"><input type="number" value={form.sortOrder} onChange={e => update('sortOrder', Number(e.target.value))} style={inputStyle} /></Field>
      </div>

      <Field label="Bio Paragraph 1"><textarea value={form.bio1} onChange={e => update('bio1', e.target.value)} style={textAreaStyle} /></Field>
      <Field label="Bio Paragraph 2"><textarea value={form.bio2} onChange={e => update('bio2', e.target.value)} style={textAreaStyle} /></Field>
      <Field label="Quote"><textarea value={form.quote} onChange={e => update('quote', e.target.value)} style={{ ...textAreaStyle, minHeight: '70px' }} /></Field>

      <ImageUploader label="Portrait Image" value={form.image} onChange={value => update('image', value)} category="team" source="team-member" sourceLabel={form.name || 'Team Member'} sourceUrl="/about/our-team" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
        <Field label="Story Title"><input value={form.storyTitle} onChange={e => update('storyTitle', e.target.value)} style={inputStyle} /></Field>
        <Field label="Story Subtitle"><input value={form.storySubtitle} onChange={e => update('storySubtitle', e.target.value)} style={inputStyle} /></Field>
      </div>
      <Field label="Story Text"><textarea value={form.storyText} onChange={e => update('storyText', e.target.value)} style={textAreaStyle} /></Field>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        <ImageUploader label="Story Background Image" value={form.storyImage} onChange={value => update('storyImage', value)} category="team" source="team-member" sourceLabel={form.name || 'Team Member'} sourceUrl="/about/our-team" compact />
        <ImageUploader label="Story Foreground Image" value={form.storyImage2} onChange={value => update('storyImage2', value)} category="team" source="team-member" sourceLabel={form.name || 'Team Member'} sourceUrl="/about/our-team" compact />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '18px 0', color: '#555', fontSize: '13px' }}>
        <input type="checkbox" checked={form.isActive} onChange={e => update('isActive', e.target.checked)} /> Active on public page
      </label>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={isPending} style={{ background: '#111', color: '#fff', border: 0, padding: '10px 18px', cursor: 'pointer' }}>{isPending ? 'Saving...' : 'Save Member'}</button>
        {onCancel && <button type="button" onClick={onCancel} style={{ background: '#f3f3f3', color: '#333', border: '1px solid #ddd', padding: '10px 18px', cursor: 'pointer' }}>Cancel</button>}
      </div>
    </form>
  );
}

export default function AdminTeamMembers() {
  const utils = trpc.useUtils();
  const { data: members = [], isLoading } = trpc.admin.listTeamMembers.useQuery();
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  const invalidate = () => utils.admin.listTeamMembers.invalidate();
  const createMutation = trpc.admin.createTeamMember.useMutation({ onSuccess: () => { invalidate(); setShowCreate(false); } });
  const updateMutation = trpc.admin.updateTeamMember.useMutation({ onSuccess: () => { invalidate(); setEditingId(null); } });
  const deleteMutation = trpc.admin.deleteTeamMember.useMutation({ onSuccess: invalidate });

  return (
    <AdminLayout title="Team Members">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Georgia, serif', fontWeight: 400 }}>Team Members</h1>
          <p style={{ color: '#777', marginTop: '6px' }}>Manage the editorial profiles displayed on About / Our Team.</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ background: '#F5569B', color: '#fff', border: 0, padding: '11px 18px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '12px' }}>Add Member</button>
      </div>

      {showCreate && <MemberForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setShowCreate(false)} isPending={createMutation.isPending} />}

      {isLoading ? <p>Loading...</p> : members.map(member => (
        <div key={member.id} style={{ background: '#fff', border: '1px solid #e5e5e5', marginBottom: '14px', padding: '18px' }}>
          {editingId === member.id ? (
            <MemberForm initial={{ ...member, bio1: member.bio1 || '', bio2: member.bio2 || '', quote: member.quote || '', image: member.image || '', specialty: member.specialty || '', storyTitle: member.storyTitle || '', storySubtitle: member.storySubtitle || '', storyText: member.storyText || '', storyImage: member.storyImage || '', storyImage2: member.storyImage2 || '' }} onSubmit={(data) => updateMutation.mutate({ id: member.id, ...data })} onCancel={() => setEditingId(null)} isPending={updateMutation.isPending} />
          ) : (
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
              {member.image && <img src={member.image} alt={member.name} style={{ width: '72px', height: '90px', objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 400 }}>{member.name}</h2>
                <p style={{ margin: '0 0 8px', color: '#777', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{member.role}</p>
                <p style={{ margin: 0, color: '#555', fontSize: '13px' }}>{member.specialty}</p>
              </div>
              <span style={{ color: member.isActive ? '#2a7a6a' : '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{member.isActive ? 'Active' : 'Hidden'}</span>
              <button onClick={() => setEditingId(member.id)} style={{ border: '1px solid #ddd', background: '#fff', padding: '8px 12px', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => { if (confirm('Delete this team member?')) deleteMutation.mutate({ id: member.id }); }} style={{ border: '1px solid #f1c5c5', color: '#b00020', background: '#fff', padding: '8px 12px', cursor: 'pointer' }}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}
