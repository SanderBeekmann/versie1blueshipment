import React, { useState, useEffect, useRef } from 'react';

const BLOCK_TYPES = [
  { value: 'paragraph', label: 'Alinea' },
  { value: 'heading', label: 'Kop' },
  { value: 'list', label: 'Lijst' },
  { value: 'cta-block', label: 'CTA blok' },
  { value: 'cta-inline', label: 'CTA inline' },
];

const HEADING_LEVELS = [
  { value: 2, label: 'H2 — Hoofdtitel' },
  { value: 3, label: 'H3 — Subtitel' },
  { value: 4, label: 'H4 — Klein kopje' },
];

function newBlock(type) {
  if (type === 'paragraph') return { type: 'paragraph', text: '' };
  if (type === 'heading') return { type: 'heading', level: 2, text: '' };
  if (type === 'list') return { type: 'list', items: [''] };
  if (type === 'cta-block') return { type: 'cta-block', title: '', text: '', buttonText: 'Neem contact op', buttonUrl: '', buttonType: 'primary' };
  if (type === 'cta-inline') return { type: 'cta-inline', text: '', linkText: '', linkUrl: '' };
  return { type: 'paragraph', text: '' };
}

function BlockTypeIcon({ type }) {
  if (type === 'heading') return <span style={{ fontWeight: 700, fontSize: 11, color: '#2563eb', fontFamily: 'monospace' }}>H</span>;
  if (type === 'list') return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
      <circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/>
    </svg>
  );
  if (type === 'cta-block' || type === 'cta-inline') return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/>
    </svg>
  );
}

function ParagraphBlock({ block, onChange }) {
  return (
    <textarea
      className="admin-form-textarea"
      style={{ minHeight: 100, fontSize: 14, lineHeight: 1.6 }}
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      placeholder="Schrijf hier je alinea..."
    />
  );
}

function HeadingBlock({ block, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {HEADING_LEVELS.map(l => (
          <button
            key={l.value}
            type="button"
            onClick={() => onChange({ ...block, level: l.value })}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1.5px solid',
              borderColor: block.level === l.value ? '#2563eb' : '#e2e8f0',
              background: block.level === l.value ? '#eff6ff' : '#fff',
              color: block.level === l.value ? '#2563eb' : '#64748b',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
      <input
        className="admin-form-input"
        style={{ fontSize: block.level === 2 ? 18 : block.level === 3 ? 16 : 14, fontWeight: 700 }}
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder={`Koptekst ${block.level}`}
      />
    </div>
  );
}

function ListBlock({ block, onChange }) {
  const items = block.items || [''];

  const updateItem = (i, val) => {
    const next = [...items];
    next[i] = val;
    onChange({ ...block, items: next });
  };

  const addItem = () => onChange({ ...block, items: [...items, ''] });

  const removeItem = (i) => {
    if (items.length === 1) return;
    onChange({ ...block, items: items.filter((_, idx) => idx !== i) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: 16, userSelect: 'none', flexShrink: 0 }}>•</span>
          <input
            className="admin-form-input"
            style={{ flex: 1, fontSize: 14 }}
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={`Lijstitem ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 4, borderRadius: 4, flexShrink: 0 }}
            title="Verwijder item"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontWeight: 500 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Item toevoegen
      </button>
    </div>
  );
}

function CtaBlockBlock({ block, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5 }}>CTA Blok</div>
      <div className="admin-form-field" style={{ marginBottom: 0 }}>
        <label className="admin-form-label" style={{ fontSize: 12 }}>Titel</label>
        <input className="admin-form-input" value={block.title || ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="CTA titel" />
      </div>
      <div className="admin-form-field" style={{ marginBottom: 0 }}>
        <label className="admin-form-label" style={{ fontSize: 12 }}>Tekst</label>
        <textarea className="admin-form-textarea" value={block.text || ''} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={2} placeholder="Overtuigende tekst..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="admin-form-field" style={{ marginBottom: 0 }}>
          <label className="admin-form-label" style={{ fontSize: 12 }}>Knoptekst</label>
          <input className="admin-form-input" value={block.buttonText || ''} onChange={(e) => onChange({ ...block, buttonText: e.target.value })} placeholder="Neem contact op" />
        </div>
        <div className="admin-form-field" style={{ marginBottom: 0 }}>
          <label className="admin-form-label" style={{ fontSize: 12 }}>URL (leeg = WhatsApp)</label>
          <input className="admin-form-input" value={block.buttonUrl || ''} onChange={(e) => onChange({ ...block, buttonUrl: e.target.value })} placeholder="https://... of leeg laten" />
        </div>
      </div>
      <div className="admin-form-field" style={{ marginBottom: 0 }}>
        <label className="admin-form-label" style={{ fontSize: 12 }}>Knopstijl</label>
        <select className="admin-form-select" value={block.buttonType || 'primary'} onChange={(e) => onChange({ ...block, buttonType: e.target.value })}>
          <option value="primary">Primair (blauw)</option>
          <option value="outline">Outline</option>
        </select>
      </div>
    </div>
  );
}

function CtaInlineBlock({ block, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5 }}>CTA Inline (tekst met link)</div>
      <div className="admin-form-field" style={{ marginBottom: 0 }}>
        <label className="admin-form-label" style={{ fontSize: 12 }}>Tekst voor de link</label>
        <input className="admin-form-input" value={block.text || ''} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Lees meer over..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="admin-form-field" style={{ marginBottom: 0 }}>
          <label className="admin-form-label" style={{ fontSize: 12 }}>Linktekst</label>
          <input className="admin-form-input" value={block.linkText || ''} onChange={(e) => onChange({ ...block, linkText: e.target.value })} placeholder="klik hier" />
        </div>
        <div className="admin-form-field" style={{ marginBottom: 0 }}>
          <label className="admin-form-label" style={{ fontSize: 12 }}>URL</label>
          <input className="admin-form-input" value={block.linkUrl || ''} onChange={(e) => onChange({ ...block, linkUrl: e.target.value })} placeholder="https://..." />
        </div>
      </div>
    </div>
  );
}

function Block({ block, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const typeMenuRef = useRef(null);

  useEffect(() => {
    if (!showTypeMenu) return;
    const handler = (e) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target)) {
        setShowTypeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTypeMenu]);

  const renderEditor = () => {
    if (block.type === 'paragraph') return <ParagraphBlock block={block} onChange={onChange} />;
    if (block.type === 'heading') return <HeadingBlock block={block} onChange={onChange} />;
    if (block.type === 'list') return <ListBlock block={block} onChange={onChange} />;
    if (block.type === 'cta-block') return <CtaBlockBlock block={block} onChange={onChange} />;
    if (block.type === 'cta-inline') return <CtaInlineBlock block={block} onChange={onChange} />;
    return null;
  };

  const currentLabel = BLOCK_TYPES.find(t => t.value === block.type)?.label || block.type;

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => onMoveUp()}
          disabled={index === 0}
          style={{ background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? '#e2e8f0' : '#94a3b8', padding: 3, borderRadius: 4 }}
          title="Omhoog"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />
        <button
          type="button"
          onClick={() => onMoveDown()}
          disabled={index === total - 1}
          style={{ background: 'none', border: 'none', cursor: index === total - 1 ? 'default' : 'pointer', color: index === total - 1 ? '#e2e8f0' : '#94a3b8', padding: 3, borderRadius: 4 }}
          title="Omlaag"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      <div style={{ flex: 1, background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 14, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ position: 'relative' }} ref={typeMenuRef}>
            <button
              type="button"
              onClick={() => setShowTypeMenu(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#374151' }}
            >
              <BlockTypeIcon type={block.type} />
              {currentLabel}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showTypeMenu && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 50, minWidth: 160, overflow: 'hidden' }}>
                {BLOCK_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { onChange(newBlock(t.value)); setShowTypeMenu(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: t.value === block.type ? '#eff6ff' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: t.value === block.type ? '#2563eb' : '#374151', textAlign: 'left', fontWeight: t.value === block.type ? 600 : 400 }}
                  >
                    <BlockTypeIcon type={t.value} />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 4, borderRadius: 4 }}
            title="Blok verwijderen"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
        {renderEditor()}
      </div>
    </div>
  );
}

function AddBlockButton({ onAdd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#f1f5f9', transform: 'translateY(-50%)', zIndex: 0 }} />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1.5px dashed #cbd5e1', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748b', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Blok toevoegen
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', marginTop: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 50, display: 'flex', gap: 6, padding: 10, flexWrap: 'wrap', minWidth: 320 }}>
          {BLOCK_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => { onAdd(t.value); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}
            >
              <BlockTypeIcon type={t.value} />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlockEditor({ blocks, onChange }) {
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const updateBlock = (index, updated) => {
    const next = [...safeBlocks];
    next[index] = updated;
    onChange(next);
  };

  const removeBlock = (index) => {
    onChange(safeBlocks.filter((_, i) => i !== index));
  };

  const addBlock = (type, afterIndex) => {
    const next = [...safeBlocks];
    const idx = afterIndex !== undefined ? afterIndex + 1 : next.length;
    next.splice(idx, 0, newBlock(type));
    onChange(next);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...safeBlocks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index) => {
    if (index === safeBlocks.length - 1) return;
    const next = [...safeBlocks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {safeBlocks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 10, border: '1.5px dashed #e2e8f0' }}>
          Nog geen blokken. Klik op "Blok toevoegen" om te beginnen.
        </div>
      )}
      {safeBlocks.map((block, i) => (
        <Block
          key={i}
          block={block}
          index={i}
          total={safeBlocks.length}
          onChange={(updated) => updateBlock(i, updated)}
          onRemove={() => removeBlock(i)}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
        />
      ))}
      <AddBlockButton onAdd={(type) => addBlock(type)} />
    </div>
  );
}
