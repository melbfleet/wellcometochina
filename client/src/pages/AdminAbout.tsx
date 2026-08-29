import React from 'react';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';
import { Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';

const ACCENT = '#F5569B';

const SLUG_TO_EDIT_PATH: Record<string, string> = {
  'our-team': '/admin/about/our-team',
  'why-us': '/admin/about/why-us',
};

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

const iconBtnStyle = (color: string): React.CSSProperties => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color,
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  opacity: 0.7,
  transition: 'opacity 0.15s',
});

export default function AdminAbout() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: sections = [], isLoading } = trpc.about.listSections.useQuery();
  const [showAdd, setShowAdd] = React.useState(false);
  const [newName, setNewName] = React.useState('');

  const invalidate = () => utils.about.listSections.invalidate();

  const createMutation = trpc.about.createSection.useMutation({
    onSuccess: () => { invalidate(); setShowAdd(false); setNewName(''); },
  });
  const updateMutation = trpc.about.updateSection.useMutation({ onSuccess: invalidate });
  const deleteMutation = trpc.about.deleteSection.useMutation({ onSuccess: invalidate });

  const toggleVisible = (id: number, current: boolean) => {
    updateMutation.mutate({ id, isVisible: !current });
  };

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const getEditPath = (section: { slug: string | null; name: string }) => {
    const slug = section.slug || slugify(section.name);
    return SLUG_TO_EDIT_PATH[slug] ?? null;
  };

  return (
    <AdminLayout title="About">
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '300', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1a1a', margin: 0 }}>
              About
            </h1>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              {sections.length} section{sections.length !== 1 ? 's' : ''}
            </p>
          </div>
          {!showAdd && (
            <button
              onClick={() => setShowAdd(true)}
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

        {/* Add section form */}
        {showAdd && (
          <div style={{ background: '#fff', border: '1px solid #eee', padding: '28px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Section Name *</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Our Story"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = ACCENT; }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newName.trim())
                      createMutation.mutate({ name: newName.trim(), slug: slugify(newName.trim()) });
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  if (newName.trim())
                    createMutation.mutate({ name: newName.trim(), slug: slugify(newName.trim()) });
                }}
                disabled={createMutation.isPending || !newName.trim()}
                style={{
                  padding: '10px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: createMutation.isPending || !newName.trim() ? '#ccc' : ACCENT,
                  color: '#fff', border: 'none', cursor: createMutation.isPending || !newName.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {createMutation.isPending ? 'Adding...' : 'Add Section'}
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewName(''); }}
                style={{
                  padding: '10px 24px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'transparent', color: '#888', border: '1px solid #ddd', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#888', fontSize: '13px' }}>Loading...</div>
        ) : sections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>
            <p style={{ fontSize: '13px', marginTop: '12px' }}>No sections yet. Add your first section above.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #eee' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', background: '#e8e8e8', borderBottom: '1px solid #d8d8d8' }}>
              <span style={{ flex: 1, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888' }}>Section</span>
              <span style={{ width: '120px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', textAlign: 'center' }}>Visibility</span>
              <span style={{ width: '120px' }} />
            </div>

            {sections.map((section, idx) => {
              const bg = idx % 2 === 0 ? '#f2f2f2' : '#e8e8e8';
              const editPath = getEditPath(section);
              return (
                <div
                  key={section.id}
                  style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', background: bg, borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                >
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', color: '#1a1a1a' }}>{section.name}</div>
                    {section.slug && (
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>/about/{section.slug}</div>
                    )}
                  </div>

                  {/* Show on page toggle */}
                  <div style={{ width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      {section.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                    <button
                      onClick={() => toggleVisible(section.id, section.isVisible ?? true)}
                      style={{
                        width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                        background: section.isVisible ? ACCENT : '#ccc',
                        position: 'relative', transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                      title={section.isVisible ? 'Hide from page' : 'Show on page'}
                    >
                      <span style={{
                        position: 'absolute', top: '3px',
                        left: section.isVisible ? '21px' : '3px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    {editPath ? (
                      <button
                        onClick={() => navigate(editPath)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          color: '#888', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '4px 8px', transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = ACCENT; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#888'; }}
                      >
                        Edit <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          background: 'none', border: 'none',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          color: '#ccc', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '4px 8px', cursor: 'not-allowed',
                        }}
                        title="No editor available for this section yet"
                      >
                        Edit <ArrowRight size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm(`Delete "${section.name}"?`)) deleteMutation.mutate({ id: section.id }); }}
                      style={iconBtnStyle('#b00020')}
                      title="Delete section"
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
