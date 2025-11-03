import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});



// ScheduleCalendar (캘린더 렌더링)
function ScheduleCalendar({ events, onSelectSlot, onSelectEvent }) {
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date()); 
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
          backgroundColor: event.color || "#007bff",
          borderRadius: "5px",
          color: "white",
        },
      })}
      view={currentView}
      onView={(view) => setCurrentView(view)}
      date={currentDate} // 현재 달력 기준 날짜
      onNavigate={(newDate) => setCurrentDate(newDate)} // 버튼 클릭 시 날짜 업데이트
      components={{ toolbar: CustomToolbar }}
      views={["month", "week", "day"]}
      defaultView="month"
    />
  );
}

// Custom Toolbar
function CustomToolbar({ label, onNavigate, onView }) {
  return (
    <div className="rbc-toolbar d-flex justify-content-between align-items-center mb-3">
      <div>
        <button
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => onNavigate("PREV")}
        >
          Back
        </button>
        <button
          className="btn btn-outline-primary btn-sm me-1"
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => onNavigate("NEXT")}
        >
          Next
        </button>
      </div>
      <span className="fw-bold">{label}</span>
      <div>
        <button
          className="btn btn-outline-dark btn-sm me-1"
          onClick={() => onView("month")}
        >
          Month
        </button>
        <button
          className="btn btn-outline-dark btn-sm me-1"
          onClick={() => onView("week")}
        >
          Week
        </button>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={() => onView("day")}
        >
          Day
        </button>
      </div>
    </div>
  );
}
export default ScheduleCalendar;
