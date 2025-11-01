import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import ScheduleModal from "../components/ScheduleModal.jsx";
import ScheduleCalendar from "../components/ScheduleCalendar.jsx"; // ✅ 추가

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  /** =================== 일정 불러오기 =================== */
  const loadSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:9000/empSchedule/all");
      const loaded = res.data.map((e) => ({
        title: `[${e.refType}] ${e.empName || "미지정"} - ${e.memo || ""}`,
        start: new Date(e.startTime || e.refStartTime),
        end: new Date(e.endTime || e.refEndTime),
        memo: e.memo || e.refDetail,
        empName: e.empName || "미지정",
        refType: e.refType,
        color:
          e.refType === "REGISTRATION"
            ? "#2ecc71"
            : e.refType === "VACATION"
            ? "#e74c3c"
            : "#3498db",
      }));
      setEvents(loaded);
    } catch (err) {
      console.error("❌ 일정 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  /** =================== 캘린더 이벤트 =================== */
  const handleSelectSlot = () => setShowModal(true);
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  /** =================== 일정 저장 =================== */
  const handleSaved = async (payload) => {
    try {
      // (등록 로직 생략 — 기존 그대로)
      await loadSchedules();
    } catch (err) {
      console.error("❌ 일정 등록 실패:", err);
    }
  };

  return (
    <div>
      <h4>📅 직원 일정 관리</h4>

      {/* ✅ 분리된 달력 컴포넌트 사용 */}
      <ScheduleCalendar
        events={events}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      <ScheduleModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleSaved}
      />

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📄 일정 상세</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent ? (
            <>
              <p><strong>종류:</strong> {selectedEvent.refType}</p>
              <p><strong>직원:</strong> {selectedEvent.empName}</p>
              <p><strong>내용:</strong> {selectedEvent.memo}</p>
            </>
          ) : (
            <p>로딩 중...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
