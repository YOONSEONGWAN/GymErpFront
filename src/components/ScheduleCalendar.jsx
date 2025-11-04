import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

// ▼ 모달 임포트 (경로는 네 위치에 맞게)
import ScheduleOpenModal from "./ScheduleOpenModal";

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

  // ▼ “+n” 클릭 시 띄울 모달 상태
  const [more, setMore] = useState({ show: false, date: null, events: [] });

  return (
    <>
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

        // ▼ 라이브러리 기본 “+n” 기능 비활성 + 우리 모달로 대체
        popup={false}
        doShowMoreDrillDown={false}   
        onDrillDown={() => {}}                 // 날짜/헤더 클릭 전환까지 차단
        onShowMore={(evts, date) => setMore({ show: true, date, events: evts })}
      />

      {/* ▼ 스케줄 자세히 보기 모달 */}
      <ScheduleOpenModal
        show={more.show}
        date={more.date}
        events={more.events}
        onClose={() => setMore((s) => ({ ...s, show: false }))}
      />
    </>
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