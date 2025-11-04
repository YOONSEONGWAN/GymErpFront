import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns";

function CustomToolbar({ label, onNavigate, onView }) {
  return (
    <div className="rbc-toolbar d-flex justify-content-between align-items-center mb-3">
      <div>
        {/* 순서 변경: Back → Today → Next */}
        <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => onNavigate("PREV")}>Back</button>
        <button className="btn btn-outline-primary btn-sm me-1" onClick={() => onNavigate("TODAY")}>Today</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("NEXT")}>Next</button>
      </div>
      <span className="fw-bold">{label}</span>
      <div>
        {/* 오른쪽에 view 전환 버튼 */}
        <button className="btn btn-outline-dark btn-sm me-1" onClick={() => onView("month")}>Month</button>
        <button className="btn btn-outline-dark btn-sm me-1" onClick={() => onView("week")}>Week</button>
        <button className="btn btn-outline-dark btn-sm" onClick={() => onView("day")}>Day</button>
      </div>
    </div>
  );
}
