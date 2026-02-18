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
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(day)} ${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

export default function AgendaPage() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [reason, setReason] = useState('');

  const fetchData = useCallback(async (year, month) => {
    setLoading(true);
    const firstDay = toDateStr(year, month, 1);
    const lastDay = toDateStr(year, month, new Date(year, month + 1, 0).getDate());

    const [{ data: blocked }, { data: booked }] = await Promise.all([
      supabase
        .from('availability_blocks')
        .select('id, block_date, block_time, reason')
        .gte('block_date', firstDay)
        .lte('block_date', lastDay),
      supabase
        .from('intakes')
        .select('id, naam, bedrijf, preferred_date, preferred_time')
        .gte('preferred_date', firstDay)
        .lte('preferred_date', lastDay)
        .not('preferred_date', 'is', null)
        .not('preferred_time', 'is', null),
    ]);

    setBlockedSlots(blocked || []);
    setBookedSlots(booked || []);
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
    bookedSlots.find(s => s.preferred_date === dateStr && s.preferred_time === time);

  const toggleBlock = async (dateStr, time) => {
    const key = `${dateStr}-${time}`;
    setSaving(key);

    const existing = blockedSlots.find(s => s.block_date === dateStr && s.block_time === time);
    if (existing) {
      await supabase.from('availability_blocks').delete().eq('id', existing.id);
    } else {
      const booking = getBooking(dateStr, time);
      if (booking) { setSaving(null); return; }
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

  const getSlotStatus = (dateStr, time) => {
    if (getBooking(dateStr, time)) return 'booked';
    if (isBlocked(dateStr, time)) return 'blocked';
    return 'free';
  };

  const dayBookings = selectedDate
    ? bookedSlots.filter(s => s.preferred_date === selectedDate)
    : [];

  const dayBlockedCount = selectedDate
    ? blockedSlots.filter(s => s.block_date === selectedDate).length
    : 0;

  const isDayFullyBlocked = selectedDate &&
    TIME_SLOTS.every(t => isBlocked(selectedDate, t) || getBooking(selectedDate, t));

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Agenda</h1>
        <p className="admin-page-subtitle">Beheer beschikbaarheid en bekijk geplande kennismakingen</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* Left: calendar */}
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
                {/* day-of-week headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                  {DAY_NAMES.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 0 8px' }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* calendar cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const dateStr = toDateStr(viewYear, viewMonth, day);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const dayBooked = bookedSlots.filter(s => s.preferred_date === dateStr).length;
                    const dayBlocked = blockedSlots.filter(s => s.block_date === dateStr).length;
                    const availCount = TIME_SLOTS.length - dayBooked - dayBlocked;

                    let bg = '#ffffff';
                    let border = '1.5px solid #e5e7eb';
                    let textColor = '#1f2937';
                    if (dayBooked > 0 && availCount === 0) { bg = '#fef2f2'; border = '1.5px solid #fecaca'; textColor = '#dc2626'; }
                    else if (dayBooked > 0) { bg = '#fff7ed'; border = '1.5px solid #fed7aa'; textColor = '#c2410c'; }
                    else if (dayBlocked > 0 && availCount === 0) { bg = '#f8fafc'; border = '1.5px solid #e2e8f0'; textColor = '#94a3b8'; }
                    if (isSelected) { bg = '#0070ff'; border = '1.5px solid #0070ff'; textColor = '#ffffff'; }
                    if (isToday && !isSelected) { border = '1.5px solid #0070ff'; }

                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        style={{
                          aspectRatio: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          border,
                          background: bg,
                          color: textColor,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: isToday ? 700 : 500,
                          position: 'relative',
                          transition: 'all 0.12s',
                        }}
                      >
                        {day}
                        {(dayBooked > 0 || dayBlocked > 0) && !isSelected && (
                          <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            {dayBooked > 0 && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f97316' }} />}
                            {dayBlocked > 0 && availCount < TIME_SLOTS.length && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#94a3b8' }} />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  {[
                    { color: '#0070ff', label: 'Geselecteerd' },
                    { color: '#f97316', label: 'Boeking' },
                    { color: '#94a3b8', label: 'Geblokkeerd' },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: day detail panel */}
        <div>
          {selectedDate ? (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title" style={{ fontSize: 14 }}>
                  {formatDutchDate(selectedDate)}
                </h2>
              </div>
              <div className="admin-card-body" style={{ paddingTop: 0 }}>

                {/* Quick actions */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button
                    className="admin-btn admin-btn--sm"
                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', flex: 1 }}
                    onClick={() => blockFullDay(selectedDate)}
                    disabled={saving === `day-${selectedDate}` || isDayFullyBlocked}
                  >
                    Dag blokkeren
                  </button>
                  <button
                    className="admin-btn admin-btn--sm"
                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', flex: 1 }}
                    onClick={() => unblockFullDay(selectedDate)}
                    disabled={saving === `day-${selectedDate}` || dayBlockedCount === 0}
                  >
                    Dag vrijgeven
                  </button>
                </div>

                {/* Optional reason input */}
                <div style={{ marginBottom: 16 }}>
                  <input
                    className="admin-form-input"
                    placeholder="Reden (optioneel)"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{ fontSize: 12 }}
                  />
                </div>

                {/* Time slots */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {TIME_SLOTS.map(time => {
                    const status = getSlotStatus(selectedDate, time);
                    const booking = getBooking(selectedDate, time);
                    const isSaving = saving === `${selectedDate}-${time}`;

                    let bg = '#f8fafc';
                    let textCol = '#374151';
                    let borderCol = '#e5e7eb';
                    let label = 'Beschikbaar';
                    if (status === 'blocked') { bg = '#fef2f2'; textCol = '#ef4444'; borderCol = '#fecaca'; label = 'Geblokkeerd'; }
                    if (status === 'booked') { bg = '#fffbeb'; textCol = '#c2410c'; borderCol = '#fed7aa'; label = booking ? `${booking.naam || booking.bedrijf || 'Boeking'}` : 'Bezet'; }

                    return (
                      <div
                        key={time}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: bg,
                          border: `1px solid ${borderCol}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', minWidth: 42 }}>{time}</span>
                          <span style={{ fontSize: 12, color: textCol, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{label}</span>
                        </div>
                        {status !== 'booked' && (
                          <button
                            onClick={() => toggleBlock(selectedDate, time)}
                            disabled={isSaving}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: 6,
                              border: 'none',
                              cursor: isSaving ? 'default' : 'pointer',
                              background: status === 'blocked' ? '#dcfce7' : '#fee2e2',
                              color: status === 'blocked' ? '#16a34a' : '#dc2626',
                              transition: 'opacity 0.1s',
                              opacity: isSaving ? 0.5 : 1,
                            }}
                          >
                            {isSaving ? '...' : status === 'blocked' ? 'Vrijgeven' : 'Blokkeer'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bookings detail */}
                {dayBookings.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>
                      Geplande kennismakingen
                    </p>
                    {dayBookings.map(b => (
                      <div key={b.id} style={{ padding: '8px 12px', borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa', marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{b.naam || '—'}</div>
                        {b.bedrijf && <div style={{ fontSize: 11, color: '#64748b' }}>{b.bedrijf}</div>}
                        <div style={{ fontSize: 12, color: '#c2410c', marginTop: 2 }}>{b.preferred_time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="admin-card">
              <div className="admin-card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Klik op een datum om de tijdslots te beheren</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
