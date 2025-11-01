// src/components/ScheduleCalendar.jsx
import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

// ============================= 달력 지역화 설정 =============================
const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

/**
 * 📅 ScheduleCalendar 컴포넌트
 * @param {Array} events 일정 데이터 (start, end, title 등 포함)
 * @param {Function} onSelectSlot 빈 칸 클릭 시 실행할 함수
 * @param {Function} onSelectEvent 일정 클릭 시 실행할 함수
 */
function ScheduleCalendar({ events, onSelectSlot, onSelectEvent }) {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      selectable
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      style={{ height: 600 }}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.color,
          borderRadius: "5px",
          color: "white",
        },
      })}
    />
  );
}

export default ScheduleCalendar;
