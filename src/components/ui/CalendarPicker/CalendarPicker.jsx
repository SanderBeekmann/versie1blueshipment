import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import './CalendarPicker.css';

const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

function padTwo(n) { return String(n).padStart(2, '0'); }

function toDateStr(year, month, day) {
  return `${year}-${padTwo(month + 1)}-${padTwo(day)}`;
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

function getTodayStr() {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function CalendarPicker({ selectedDate, selectedTime, onDateChange, onTimeChange, error }) {
  const todayStr = getTodayStr();
  const minDateStr = getTomorrowStr();

  const now = new Date();
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
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    if (prevY < now.getFullYear() || (prevY === now.getFullYear() && prevM < now.getMonth())) return;
    setViewYear(prevY);
    setViewMonth(prevM);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isPrevDisabled = () => {
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    return prevY < now.getFullYear() || (prevY === now.getFullYear() && prevM < now.getMonth());
  };

  const isSlotUnavailable = (dateStr, time) =>
    blockedSlots.some(s => s.block_date === dateStr && s.block_time === time) ||
    bookedSlots.some(s => s.preferred_date === dateStr && s.preferred_time === time);

  const availableCount = (dateStr) =>
    TIME_SLOTS.filter(t => !isSlotUnavailable(dateStr, t)).length;

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleDayClick = (dateStr, isPast, isFullyBooked) => {
    if (isPast || isFullyBooked) return;
    onDateChange(dateStr);
    onTimeChange('');
  };

  const handleTimeClick = (time) => {
    if (!selectedDate || isSlotUnavailable(selectedDate, time)) return;
    onTimeChange(time);
  };

  return (
    <div className="cal-picker">
      <div className="cal-header">
        <button
          type="button"
          className="cal-nav-btn"
          onClick={prevMonth}
          disabled={isPrevDisabled()}
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
              const avail = availableCount(dateStr);
              const fullyBooked = !isPast && avail === 0;
              const partial = !isPast && avail > 0 && avail < TIME_SLOTS.length;

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
                  onClick={() => handleDayClick(dateStr, isPast, fullyBooked)}
                  title={fullyBooked ? 'Geen beschikbaarheid' : isPast ? 'Datum verstreken' : undefined}
                >
                  {day}
                  {partial && <div className="cal-day-indicator cal-day-indicator--partial" />}
                  {fullyBooked && <div className="cal-day-indicator cal-day-indicator--booked" />}
                </div>
              );
            })}
          </div>

          {selectedDate && (
            <div className="cal-time-section">
              <div className="cal-time-label">
                Kies een tijdstip —{' '}
                <span>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="cal-time-grid">
                {TIME_SLOTS.map(time => {
                  const unavailable = isSlotUnavailable(selectedDate, time);
                  const isTimeSelected = time === selectedTime;
                  let cls = 'cal-time-slot';
                  if (unavailable) cls += ' cal-time-slot--blocked';
                  else if (isTimeSelected) cls += ' cal-time-slot--selected';
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

          <div className="cal-legend">
            <div className="cal-legend-item">
              <div className="cal-legend-dot cal-legend-dot--available" />
              <span>Beschikbaar</span>
            </div>
            <div className="cal-legend-item">
              <div className="cal-legend-dot cal-legend-dot--partial" />
              <span>Beperkt</span>
            </div>
            <div className="cal-legend-item">
              <div className="cal-legend-dot cal-legend-dot--full" />
              <span>Volgeboekt</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
