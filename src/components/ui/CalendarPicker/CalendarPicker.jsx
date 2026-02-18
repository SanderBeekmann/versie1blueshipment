import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import './CalendarPicker.css';

const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

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
  const [popupDate, setPopupDate] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, alignRight: false });
  const gridRef = useRef(null);
  const popupRef = useRef(null);

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

  useEffect(() => {
    const handleOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopupDate(null);
      }
    };
    if (popupDate) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [popupDate]);

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

  const handleDayClick = (e, dateStr, isPast, isFullyBooked) => {
    if (isPast || isFullyBooked) return;
    onDateChange(dateStr);
    onTimeChange('');

    const cell = e.currentTarget;
    const grid = gridRef.current;
    if (!cell || !grid) { setPopupDate(dateStr); return; }

    const cellRect = cell.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const top = cellRect.top - gridRect.top + cell.offsetHeight / 2;
    const spaceRight = gridRect.right - cellRect.right;
    const alignRight = spaceRight < 180;
    const left = alignRight
      ? cellRect.left - gridRect.left - 4
      : cellRect.right - gridRect.left + 6;

    setPopupPos({ top, left, alignRight });
    setPopupDate(dateStr);
  };

  const handleTimeClick = (time) => {
    if (!popupDate || isSlotUnavailable(popupDate, time)) return;
    onTimeChange(time);
    setPopupDate(null);
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="cal-loading">Beschikbaarheid laden...</div>
      ) : (
        <>
          <div className="cal-grid" ref={gridRef}>
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
              if (popupDate === dateStr) cls += ' cal-day-cell--active';

              return (
                <div
                  key={dateStr}
                  className={cls}
                  onClick={(e) => handleDayClick(e, dateStr, isPast, fullyBooked)}
                  title={fullyBooked ? 'Geen beschikbaarheid' : isPast ? 'Datum verstreken' : undefined}
                >
                  {day}
                  {partial && <div className="cal-day-indicator cal-day-indicator--partial" />}
                  {fullyBooked && <div className="cal-day-indicator cal-day-indicator--booked" />}
                </div>
              );
            })}

            {popupDate && (
              <div
                ref={popupRef}
                className={`cal-time-popup${popupPos.alignRight ? ' cal-time-popup--left' : ''}`}
                style={{ top: popupPos.top, left: popupPos.left }}
              >
                <div className="cal-time-popup-header">
                  {new Date(popupDate + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className="cal-time-popup-grid">
                  {TIME_SLOTS.map(time => {
                    const unavailable = isSlotUnavailable(popupDate, time);
                    const isTimeSelected = time === selectedTime && popupDate === selectedDate;
                    let cls = 'cal-time-popup-slot';
                    if (unavailable) cls += ' cal-time-popup-slot--blocked';
                    else if (isTimeSelected) cls += ' cal-time-popup-slot--selected';
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
          </div>

          {selectedDate && selectedTime && (
            <div className="cal-selection-summary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#0070ff" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="#0070ff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })} om <strong>{selectedTime}</strong>
              </span>
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
