// src/components/ScheduleCalendar.jsx
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import CustomToolbar from "./CustomToolbar";             // 그대로 사용
import "bootstrap/dist/css/bootstrap.min.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../components/css/ScheduleCalendar.css";

const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// ★ props에 onShowMore 추가
function ScheduleCalendar({
  events,
  onSelectSlot,
  onSelectEvent,
  onShowMore,                                           // ★ FIX: 부모 위임
  isAdmin = false,
  focusDate,
}) {
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // 검색/포커스 날짜 반영
  useEffect(() => {
    if (focusDate instanceof Date && !Number.isNaN(focusDate)) {
      setCurrentDate(focusDate);
    }
  }, [focusDate]);

  const Toolbar = (props) => <CustomToolbar {...props} isAdmin={isAdmin} />;

  return (
    <Calendar
      localizer={localizer}
      culture="ko"
      events={events}
      startAccessor="start"
      endAccessor="end"
      selectable
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      style={{ height: 600 }}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.color || "#007bff",
          borderRadius: "5px",
          color: "white",
        },
      })}
      view={currentView}
      onView={setCurrentView}
      date={currentDate}
      onNavigate={setCurrentDate}
      components={{ toolbar: Toolbar }}
      views={["month", "week", "day"]}
      defaultView="month"
      popup={false}
      doShowMoreDrillDown={false}
      onDrillDown={() => {}}
      onShowMore={(evts, date) => onShowMore?.(evts, date)}  // ★ FIX: 부모로 그대로 전달
    />
  );
}

export default ScheduleCalendar;
