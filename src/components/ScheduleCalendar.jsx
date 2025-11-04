import React, { useState, useCallback } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Navigate,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMonths } from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

/**
 * 📆 ScheduleCalendar.jsx (버전 무관 완성형)
 * -------------------------------------------------
 * ✅ 월 보기 전용
 * ✅ 이전 / 다음 / 오늘 완벽 작동
 * ✅ 일정별 색상 표시
 * ✅ 오늘 날짜 강조
 * ✅ Bootstrap 스타일 통합
 */
const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

/** ✅ 커스텀 툴바 */
function CustomToolbar({ label, onNavigate }) {
  return (
    <div
      className="d-flex justify-content-between align-items-center mb-2 px-3 py-2"
      style={{
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
      }}
    >
      <div>
        <button
          className="btn btn-outline-secondary btn-sm me-2"
          onClick={() => onNavigate("PREV")}
        >
          ◀ 이전
        </button>
        <button
          className="btn btn-outline-secondary btn-sm me-2"
          onClick={() => onNavigate("TODAY")}
        >
          오늘
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => onNavigate("NEXT")}
        >
          다음 ▶
        </button>
      </div>
      <h5 className="mb-0 fw-bold text-dark">
        {label.replace(" ", "년 ")} {/* 예: 2025 11월 → 2025년 11월 */}
      </h5>
    </div>
  );
}

/** ✅ 캘린더 본체 */
export default function ScheduleCalendar({ events, onSelectSlot, onSelectEvent }) {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);

  /** ✅ 수동으로 navigate 처리 */
  const handleNavigate = useCallback(
    (action) => {
      switch (action) {
        case "TODAY":
          setDate(new Date());
          break;
        case "PREV":
          setDate((d) => addMonths(d, -1));
          break;
        case "NEXT":
          setDate((d) => addMonths(d, 1));
          break;
        default:
          break;
      }
    },
    []
  );

  return (
    <div className="p-2 bg-white rounded shadow-sm">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        date={date}
        view={view}
        views={[Views.MONTH]} // ✅ 월 보기 고정
        onView={(newView) => setView(newView)}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        popup
        style={{ height: 750 }}
        components={{
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              onNavigate={(action) => handleNavigate(action)}
            />
          ),
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color || "#95a5a6",
            color: "white",
            borderRadius: "8px",
            border: "none",
            padding: "3px 6px",
            whiteSpace: "normal",
            fontSize: "0.85rem",
          },
        })}
        dayPropGetter={(date) => {
          const isToday = new Date().toDateString() === date.toDateString();
          return isToday
            ? { style: { backgroundColor: "#fff9e6" } }
            : {};
        }}
        messages={{
          next: "다음",
          previous: "이전",
          today: "오늘",
          month: "월",
          week: "주",
          day: "일",
        }}
      />
    </div>
  );
}
