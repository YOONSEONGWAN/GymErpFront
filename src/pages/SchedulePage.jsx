import React, { useEffect, useState } from "react";
import axios from "axios";
import ScheduleModal from "../components/ScheduleModal.jsx";
import ScheduleCalendar from "../components/ScheduleCalendar.jsx";
import ScheduleDetailModal from "../components/ScheduleDetailModal.jsx";
import { useLocation } from "react-router-dom";
import { scheduleColors } from "../constants/scheduleColors.js";

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [ptCount, setPtCount] = useState(null); // 💪 PT 잔여횟수 상태 추가

  const { state } = useLocation();
  const empNum = state?.empNum || null;
  const empName = state?.empName || "관리자";

  /** ✅ 일정 불러오기 */
  const loadSchedules = async () => {
    try {
      const url = empNum
        ? `http://localhost:9000/schedule/emp/${empNum}`
        : `http://localhost:9000/schedule/all`;

      const res = await axios.get(url);
      const loaded = res.data.map((e) => {
        // ✅ codeBId 보정
        const codeBId =
          e.codeBId ||
          (e.codeName?.includes("PT")
            ? "B001"
            : e.codeName?.includes("휴가")
            ? "B002"
            : "B003");

        // ✅ 색상 설정
        const color =
          codeBId === "B001"
            ? scheduleColors.PT
            : codeBId === "B002"
            ? scheduleColors.VACATION
            : e.etcType === "MEETING"
            ? scheduleColors.ETC_MEETING
            : e.etcType === "COUNSEL"
            ? scheduleColors.ETC_COUNSEL
            : e.etcType === "COMPETITION"
            ? scheduleColors.ETC_COMPETITION
            : scheduleColors.DEFAULT;

        return {
          id: e.shNum,
          title: `[${e.codeName || e.refType || "기타"}] ${e.memo || ""}`,
          start: new Date(e.startTime),
          end: new Date(e.endTime),
          empNum: e.empNum,
          codeBId,
          codeName: e.codeName,
          memNum: e.memNum,
          memName: e.memName,
          memPhone: e.memPhone,
          memo: e.memo,
          etcType: e.etcType,
          color,
        };
      });
      setEvents(loaded);
    } catch (err) {
      console.error("❌ 일정 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [empNum]);

  /** 📆 빈칸 클릭 → 일정 등록 */
  const handleSelectSlot = (slotInfo) => {
    setMode("create");
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setShowModal(true);
  };

  /** 📄 일정 클릭 → 상세 보기 (PT 횟수 포함) */
  const handleSelectEvent = async (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);

    // 💪 PT 일정이면 PT 잔여횟수 조회
    if (event.codeBId === "B001" && event.memNum) {
      try {
        const res = await axios.get(`http://localhost:9000/schedule/ptCount/${event.memNum}`);
        setPtCount(res.data);
      } catch (err) {
        console.error("⚠️ PT 잔여횟수 불러오기 실패:", err);
        setPtCount(null);
      }
    } else {
      setPtCount(null);
    }
  };

  /** ✅ 등록 / 수정 저장 */
  const handleSaved = async (payload, mode) => {
    try {
      const memo = payload.ptMemo || payload.vacMemo || payload.etcMemo || payload.memo || "";
      const data = { ...payload, memo };

      if (mode === "edit") {
        await axios.put(`http://localhost:9000/schedule/${data.id}`, data);
        alert("✏️ 일정이 수정되었습니다!");
      } else {
        await axios.post("http://localhost:9000/schedule", data);
        alert("✅ 일정이 등록되었습니다!");
      }

      setShowModal(false);
      await loadSchedules();
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  /** 🗑️ 삭제 */
  const handleDelete = async (eventId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:9000/schedule/${eventId}`);
      alert("🗑️ 일정이 삭제되었습니다.");
      setShowDetailModal(false);
      await loadSchedules();
    } catch (err) {
      console.error("⚠️ 일정 삭제 실패:", err);
      alert("⚠️ 일정 삭제 중 오류가 발생했습니다.");
    }
  };

  /** ✏️ 상세보기 → 수정 모드 전환 */
  const handleEditFromDetail = (event) => {
    setShowDetailModal(false);
    setSelectedEvent(event);
    setSelectedSlot(null);
    setMode("edit");
    setTimeout(() => setShowModal(true), 200);
  };

  return (
    <div className="container mt-4">
      <h4>📅 직원 일정 관리</h4>

      {/* 🎨 색상 범례 */}
      <div className="mb-3 d-flex flex-wrap gap-3">
        {Object.entries({
          PT: scheduleColors.PT,
          휴가: scheduleColors.VACATION,
          회의: scheduleColors.ETC_MEETING,
          상담: scheduleColors.ETC_COUNSEL,
          대회: scheduleColors.ETC_COMPETITION,
        }).map(([label, color]) => (
          <span key={label}>
            <span
              style={{
                backgroundColor: color,
                width: 15,
                height: 15,
                display: "inline-block",
                marginRight: 5,
              }}
            ></span>
            {label}
          </span>
        ))}
      </div>

      {/* 📆 캘린더 */}
      <ScheduleCalendar
        events={events}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {/* 🪶 등록 / 수정 모달 */}
      <ScheduleModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleSaved}
        empNum={empNum}
        empName={empName}
        defaultStartTime={selectedSlot?.start}
        defaultEndTime={selectedSlot?.end}
        mode={mode}
        initialData={selectedEvent}
      />

      {/* 📄 상세 보기 모달 (PT 잔여횟수 포함) */}
      <ScheduleDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        event={selectedEvent}
        ptCount={ptCount} // 💪 PT 횟수 전달
        onEdit={handleEditFromDetail}
        onDelete={handleDelete}
      />
    </div>
  );
}
