import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import '../styles/admin.css';

const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTH_NAMES = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDutchDate(dateStr) {
  if (!dateStr) return '—';
  const [, month, day] = dateStr.split('-');
  const weekday = new Date(dateStr).toLocaleDateString('nl-NL', { weekday: 'long' });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${parseInt(day)} ${MONTH_NAMES[parseInt(month) - 1]}`;
}

const STATUS_LABELS = {
  nieuw: 'Nieuw',
  contact_opgenomen: 'Contact opgenomen',
  gekwalificeerd: 'Gekwalificeerd',
  offerte_verstuurd: 'Offerte verstuurd',
  gewonnen: 'Gewonnen',
  verloren: 'Verloren',
  geannuleerd: 'Geannuleerd',
  afgewezen: 'Afgewezen',
};

function DayTimeline({ selectedDate, bookedSlots, tasks, blockedSlots, saving, reason, onToggleBlock, onBlockDay, onUnblockDay, onReasonChange }) {
  const activeBookings = bookedSlots.filter(
    s => s.preferred_date === selectedDate && !['geannuleerd', 'afgewezen'].includes(s.status)
  );
  const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(selectedDate));
  const dayBlockedCount = blockedSlots.filter(s => s.block_date === selectedDate).length;
  const isDayFullyBlocked = TIME_SLOTS.every(t => {
    const blocked = blockedSlots.some(s => s.block_date === selectedDate && s.block_time === t);
    const booked = bookedSlots.some(s => s.preferred_date === selectedDate && s.preferred_time === t && !['geannuleerd', 'afgewezen'].includes(s.status));
    return blocked || booked;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
          {formatDutchDate(selectedDate)}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          {activeBookings.length} afspraak{activeBookings.length !== 1 ? 'en' : ''} · {dayTasks.length} ta{dayTasks.length !== 1 ? 'ken' : 'ak'}
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button
            className="admin-btn admin-btn--sm"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', flex: 1, fontSize: 11 }}
            onClick={() => onBlockDay(selectedDate)}
            disabled={saving === `day-${selectedDate}` || isDayFullyBlocked}
          >
            Dag blokkeren
          </button>
          <button
            className="admin-btn admin-btn--sm"
            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', flex: 1, fontSize: 11 }}
            onClick={() => onUnblockDay(selectedDate)}
            disabled={saving === `day-${selectedDate}` || dayBlockedCount === 0}
          >
            Dag vrijgeven
          </button>
        </div>
        <input
          className="admin-form-input"
          placeholder="Reden blokkade (optioneel)"
          value={reason}
          onChange={e => onReasonChange(e.target.value)}
          style={{ fontSize: 11 }}
        />
      </div>

      <div style={{ overflowY: 'auto', maxHeight: 520 }}>
        {TIME_SLOTS.map(time => {
          const booking = bookedSlots.find(
            s => s.preferred_date === selectedDate && s.preferred_time === time && !['geannuleerd', 'afgewezen'].includes(s.status)
          );
          const blocked = blockedSlots.find(s => s.block_date === selectedDate && s.block_time === time);
          const isSaving = saving === `${selectedDate}-${time}`;
          const slotTasks = dayTasks.filter(t => {
            if (!t.due_date) return false;
            const h = new Date(t.due_date).getHours();
            const slotH = parseInt(time.split(':')[0]);
            return h === slotH;
          });

          const hasContent = booking || blocked || slotTasks.length > 0;

          return (
            <div
              key={time}
              style={{
                display: 'flex',
                gap: 0,
                borderBottom: '1px solid #f8fafc',
                minHeight: hasContent ? 'auto' : 36,
              }}
            >
              <div style={{
                width: 48,
                flexShrink: 0,
                paddingTop: 8,
                paddingLeft: 16,
                fontSize: 11,
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '0.3px',
              }}>
                {time}
              </div>

              <div style={{ flex: 1, padding: '6px 12px 6px 8px', display: 'flex', flexDirection: 'column', gap: 4, borderLeft: '2px solid #f1f5f9' }}>
                {booking && (
                  <div style={{
                    borderRadius: 8,
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    padding: '7px 10px',
                    borderLeft: '3px solid #f97316',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#c2410c' }}>
                        {booking.naam || '—'}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        background: '#fef3c7', color: '#92400e',
                        padding: '1px 6px', borderRadius: 20,
                        border: '1px solid #fde68a',
                      }}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </div>
                    {booking.bedrijf && (
                      <div style={{ fontSize: 11, color: '#92400e' }}>{booking.bedrijf}</div>
                    )}
                    {(booking.telefoon || booking.email) && (
                      <div style={{ fontSize: 10, color: '#b45309', marginTop: 3 }}>
                        {booking.telefoon}{booking.telefoon && booking.email ? ' · ' : ''}{booking.email}
                      </div>
                    )}
                  </div>
                )}

                {slotTasks.map(task => {
                  const isOverdue = !task.completed && new Date(task.due_date) < new Date();
                  return (
                    <div
                      key={task.id}
                      style={{
                        borderRadius: 8,
                        background: task.completed ? '#f8fafc' : isOverdue ? '#fef2f2' : '#eff6ff',
                        border: `1px solid ${task.completed ? '#e2e8f0' : isOverdue ? '#fecaca' : '#bfdbfe'}`,
                        borderLeft: `3px solid ${task.completed ? '#cbd5e1' : isOverdue ? '#ef4444' : '#2563eb'}`,
                        padding: '7px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                        background: task.completed ? '#22c55e' : isOverdue ? '#ef4444' : '#2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {task.completed && (
                          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600,
                          color: task.completed ? '#94a3b8' : '#0f172a',
                          textDecoration: task.completed ? 'line-through' : 'none',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {task.title}
                        </div>
                        {task.intakes?.naam && (
                          <div style={{ fontSize: 10, color: '#64748b' }}>
                            {task.intakes.naam}{task.intakes.bedrijf ? ` · ${task.intakes.bedrijf}` : ''}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, flexShrink: 0,
                        padding: '1px 6px', borderRadius: 20,
                        background: task.completed ? '#dcfce7' : isOverdue ? '#fee2e2' : '#dbeafe',
                        color: task.completed ? '#16a34a' : isOverdue ? '#dc2626' : '#1d4ed8',
                      }}>
                        {task.completed ? 'Klaar' : isOverdue ? 'Te laat' : 'Open'}
                      </span>
                    </div>
                  );
                })}

                {blocked && !booking && (
                  <div style={{
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '3px solid #cbd5e1',
                    padding: '5px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {blocked.reason ? blocked.reason : 'Geblokkeerd'}
                    </span>
                    <button
                      onClick={() => onToggleBlock(selectedDate, time)}
                      disabled={isSaving}
                      style={{
                        fontSize: 10, fontWeight: 600,
                        padding: '2px 7px', borderRadius: 5,
                        border: 'none', cursor: isSaving ? 'default' : 'pointer',
                        background: '#dcfce7', color: '#16a34a',
                        opacity: isSaving ? 0.5 : 1, flexShrink: 0,
                      }}
                    >
                      {isSaving ? '...' : 'Vrijgeven'}
                    </button>
                  </div>
                )}

                {!hasContent && (
                  <button
                    onClick={() => onToggleBlock(selectedDate, time)}
                    disabled={isSaving}
                    style={{
                      background: 'none', border: 'none',
                      cursor: isSaving ? 'default' : 'pointer',
                      fontSize: 10, color: '#e2e8f0',
                      padding: '2px 0', textAlign: 'left',
                      opacity: isSaving ? 0.5 : 1,
                    }}
                  >
                    {isSaving ? '...' : '+ blokkeer'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateStr(now.getFullYear(), now.getMonth(), now.getDate()));
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [reason, setReason] = useState('');

  const fetchData = useCallback(async (year, month) => {
    setLoading(true);
    const firstDay = toDateStr(year, month, 1);
    const lastDay = toDateStr(year, month, new Date(year, month + 1, 0).getDate());
    const firstDayTs = `${firstDay}T00:00:00`;
    const lastDayTs = `${lastDay}T23:59:59`;

    const [{ data: blocked }, { data: booked }, { data: taskData }] = await Promise.all([
      supabase
        .from('availability_blocks')
        .select('id, block_date, block_time, reason')
        .gte('block_date', firstDay)
        .lte('block_date', lastDay),
      supabase
        .from('intakes')
        .select('id, naam, bedrijf, telefoon, email, preferred_date, preferred_time, status')
        .gte('preferred_date', firstDay)
        .lte('preferred_date', lastDay)
        .not('preferred_date', 'is', null)
        .not('preferred_time', 'is', null),
      supabase
        .from('crm_tasks')
        .select('id, title, due_date, completed, intake_id, intakes(naam, bedrijf)')
        .gte('due_date', firstDayTs)
        .lte('due_date', lastDayTs)
        .not('due_date', 'is', null),
    ]);

    setBlockedSlots(blocked || []);
    setBookedSlots(booked || []);
    setTasks(taskData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(viewYear, viewMonth);
  }, [viewYear, viewMonth, fetchData]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isBlocked = (dateStr, time) =>
    blockedSlots.some(s => s.block_date === dateStr && s.block_time === time);

  const getBooking = (dateStr, time) =>
    bookedSlots.find(s =>
      s.preferred_date === dateStr &&
      s.preferred_time === time &&
      !['geannuleerd', 'afgewezen'].includes(s.status)
    );

  const toggleBlock = async (dateStr, time) => {
    const key = `${dateStr}-${time}`;
    setSaving(key);
    const existing = blockedSlots.find(s => s.block_date === dateStr && s.block_time === time);
    if (existing) {
      await supabase.from('availability_blocks').delete().eq('id', existing.id);
    } else {
      if (getBooking(dateStr, time)) { setSaving(null); return; }
      await supabase.from('availability_blocks').insert({
        block_date: dateStr,
        block_time: time,
        reason: reason || null,
      });
    }
    await fetchData(viewYear, viewMonth);
    setSaving(null);
  };

  const blockFullDay = async (dateStr) => {
    setSaving(`day-${dateStr}`);
    const toBlock = TIME_SLOTS.filter(t => !isBlocked(dateStr, t) && !getBooking(dateStr, t));
    if (toBlock.length > 0) {
      await supabase.from('availability_blocks').insert(
        toBlock.map(t => ({ block_date: dateStr, block_time: t, reason: reason || 'Dag geblokkeerd' }))
      );
    }
    await fetchData(viewYear, viewMonth);
    setSaving(null);
  };

  const unblockFullDay = async (dateStr) => {
    setSaving(`day-${dateStr}`);
    const ids = blockedSlots.filter(s => s.block_date === dateStr).map(s => s.id);
    if (ids.length > 0) {
      await supabase.from('availability_blocks').delete().in('id', ids);
    }
    await fetchData(viewYear, viewMonth);
    setSaving(null);
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Agenda</h1>
        <p className="admin-page-subtitle">Beheer beschikbaarheid en bekijk geplande kennismakingen</p>
      </div>

      <div className="agenda-layout">

        <div className="admin-card">
          <div className="admin-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="admin-card-title">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={prevMonth}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18L9 12l6-6"/>
                </svg>
              </button>
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={nextMonth}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="admin-card-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>Laden...</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                  {DAY_NAMES.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 0 8px' }}>
                      {d}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                  {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} style={{ background: '#fafafa', minHeight: 80 }} />;
                    const dateStr = toDateStr(viewYear, viewMonth, day);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;

                    const dayBookings = bookedSlots.filter(
                      s => s.preferred_date === dateStr && !['geannuleerd', 'afgewezen'].includes(s.status)
                    ).sort((a, b) => (a.preferred_time || '').localeCompare(b.preferred_time || ''));
                    const dayTaskItems = tasks.filter(t => t.due_date && t.due_date.startsWith(dateStr));

                    const MAX_VISIBLE = 3;
                    const allItems = [
                      ...dayBookings.map(b => ({ type: 'booking', data: b })),
                      ...dayTaskItems.map(t => ({ type: 'task', data: t })),
                    ];
                    const visibleItems = allItems.slice(0, MAX_VISIBLE);
                    const overflow = allItems.length - MAX_VISIBLE;

                    return (
                      <div
                        key={dateStr}
                        className="agenda-calendar-cell"
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        style={{
                          minHeight: 88,
                          padding: '6px 5px 5px',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          borderRight: '1px solid #f1f5f9',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.1s',
                          position: 'relative',
                        }}
                      >
                        <div className="agenda-day-number" style={{
                          width: 22, height: 22,
                          borderRadius: '50%',
                          background: isToday ? '#0070ff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 4,
                          marginLeft: 1,
                        }}>
                          <span style={{
                            fontSize: 12,
                            fontWeight: isToday ? 700 : 500,
                            color: isToday ? '#ffffff' : isSelected ? '#0070ff' : '#374151',
                            lineHeight: 1,
                          }}>
                            {day}
                          </span>
                        </div>

                        {allItems.length > 0 && (
                          <div className="agenda-event-dots" style={{ display: 'none', gap: 3, justifyContent: 'center', marginBottom: 2 }}>
                            {dayBookings.length > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f97316' }} />}
                            {dayTaskItems.length > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb' }} />}
                          </div>
                        )}
                        <div className="agenda-event-pills" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {visibleItems.map((item, idx) => {
                            if (item.type === 'booking') {
                              const b = item.data;
                              return (
                                <div key={`b-${b.id}`} style={{
                                  background: '#fff7ed',
                                  border: '1px solid #fed7aa',
                                  borderLeft: '2px solid #f97316',
                                  borderRadius: 3,
                                  padding: '1px 4px',
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: '#c2410c',
                                  lineHeight: 1.3,
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {b.preferred_time && <span style={{ opacity: 0.75, marginRight: 3 }}>{b.preferred_time}</span>}
                                  {b.naam || b.bedrijf || 'Afspraak'}
                                </div>
                              );
                            }
                            const t = item.data;
                            const isOverdue = !t.completed && new Date(t.due_date) < new Date();
                            return (
                              <div key={`t-${t.id}`} style={{
                                background: t.completed ? '#f0fdf4' : isOverdue ? '#fef2f2' : '#eff6ff',
                                border: `1px solid ${t.completed ? '#bbf7d0' : isOverdue ? '#fecaca' : '#bfdbfe'}`,
                                borderLeft: `2px solid ${t.completed ? '#22c55e' : isOverdue ? '#ef4444' : '#2563eb'}`,
                                borderRadius: 3,
                                padding: '1px 4px',
                                fontSize: 10,
                                fontWeight: 600,
                                color: t.completed ? '#15803d' : isOverdue ? '#dc2626' : '#1d4ed8',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                textDecoration: t.completed ? 'line-through' : 'none',
                              }}>
                                {t.title}
                              </div>
                            );
                          })}
                          {overflow > 0 && (
                            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, paddingLeft: 2 }}>
                              +{overflow} meer
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  {[
                    { color: '#f97316', label: 'Afspraak' },
                    { color: '#2563eb', label: 'Taak' },
                    { color: '#ef4444', label: 'Te laat' },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                      <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="admin-card" style={{ overflow: 'hidden' }}>
          {selectedDate ? (
            <DayTimeline
              selectedDate={selectedDate}
              bookedSlots={bookedSlots}
              tasks={tasks}
              blockedSlots={blockedSlots}
              saving={saving}
              reason={reason}
              onToggleBlock={toggleBlock}
              onBlockDay={blockFullDay}
              onUnblockDay={unblockFullDay}
              onReasonChange={setReason}
            />
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Klik op een datum om de dagweergave te openen</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
