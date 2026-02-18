import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import './CalendarPicker.css';

const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function today() {
  return new Date();
}

export default function CalendarPicker({ selectedDate, selectedTime, onDateChange, onTimeChange, error }) {
  const now = today();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async (year, month) => {
    setLoading(true);
    const firstDay = toDateStr(year, month, 1);
    const lastDay = toDateStr(year, month, new Date(year, month + 1, 0).getDate());

    const [{ data: blocked }, { data: booked }] = await Promise.all([
      supabase
        .from('availability_blocks')
        .select('block_date, block_time')
        .gte('block_date', firstDay)
        .lte('block_date', lastDay),
      supabase
        .from('booked_slots')
        .select('preferred_date, preferred_time')
        .gte('preferred_date', firstDay)
        .lte('preferred_date', lastDay),
    ]);

    setBlockedSlots(blocked || []);
    setBookedSlots(booked || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSlots(viewYear, viewMonth);
  }, [viewYear, viewMonth, fetchSlots]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isSlotUnavailable = (dateStr, time) => {
    const isBlocked = blockedSlots.some(s => s.block_date === dateStr && s.block_time === time);
    const isTaken = bookedSlots.some(s => s.preferred_date === dateStr && s.preferred_time === time);
    return isBlocked || isTaken;
  };

  const availableSlotsForDate = (dateStr) => {
    return TIME_SLOTS.filter(t => !isSlotUnavailable(dateStr, t));
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const minDateStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const handleDayClick = (dateStr) => {
    if (dateStr < minDateStr) return;
    const available = availableSlotsForDate(dateStr);
    if (available.length === 0) return;
    onDateChange(dateStr);
    onTimeChange('');
  };

  const handleTimeClick = (time) => {
    if (isSlotUnavailable(selectedDate, time)) return;
    onTimeChange(time);
  };

  const canPrevMonth = () => {
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    return new Date(y, m + 1, 0) >= now;
  };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal-picker">
      <div className="cal-header">
        <button
          type="button"
          className="cal-nav-btn"
          onClick={prevMonth}
          disabled={!canPrevMonth()}
          aria-label="Vorige maand"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="cal-month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button
          type="button"
          className="cal-nav-btn"
          onClick={nextMonth}
          aria-label="Volgende maand"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="cal-loading">Beschikbaarheid laden...</div>
      ) : (
        <>
          <div className="cal-grid">
            {DAY_NAMES.map(d => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="cal-day-cell cal-day-cell--empty" />;
              const dateStr = toDateStr(viewYear, viewMonth, day);
              const isPast = dateStr < minDateStr;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const available = availableSlotsForDate(dateStr);
              const totalSlots = TIME_SLOTS.length;
              const fullyBooked = !isPast && available.length === 0;
              const partial = !isPast && available.length > 0 && available.length < totalSlots;

              let cls = 'cal-day-cell';
              if (isPast) cls += ' cal-day-cell--disabled';
              else if (fullyBooked) cls += ' cal-day-cell--booked';
              else if (partial) cls += ' cal-day-cell--partial';
              else if (isToday) cls += ' cal-day-cell--today';
              if (isSelected) cls += ' cal-day-cell--selected';

              return (
                <div
                  key={dateStr}
                  className={cls}
                  onClick={() => !isPast && !fullyBooked && handleDayClick(dateStr)}
                  title={fullyBooked ? 'Geen beschikbaarheid' : undefined}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {selectedDate && (
            <div className="cal-time-section">
              <div className="cal-time-label">
                Kies een tijdstip op{' '}
                <span>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="cal-time-grid">
                {TIME_SLOTS.map(time => {
                  const unavailable = isSlotUnavailable(selectedDate, time);
                  const isSelected = time === selectedTime;
                  let cls = 'cal-time-slot';
                  if (unavailable) cls += ' cal-time-slot--blocked';
                  if (isSelected) cls += ' cal-time-slot--selected';
                  return (
                    <div
                      key={time}
                      className={cls}
                      onClick={() => handleTimeClick(time)}
                    >
                      {time}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="cal-error">{error}</p>}

          <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0070ff' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>Beschikbaar</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>Beperkt</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fca5a5' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>Volgeboekt</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
