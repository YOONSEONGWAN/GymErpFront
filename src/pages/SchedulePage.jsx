import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Modal, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleModal from "../components/ScheduleModal";

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editData, setEditData] = useState(null); // 수정 모드용 데이터
  const [clickedDate, setClickedDate] = useState(null); // 클릭한 날짜 반영

  // 직원 상세 → 일정으로 넘어올 때 URL 파라미터로 empNum 받기
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const empNum = params.get("empNum");
  const empName = params.get("empName");

  // 일정 로딩
  const loadSchedules = async () => {
    try {
      const url = empNum
        ? `http://localhost:9000/v1/schedule/emp/${empNum}`
        : "http://localhost:9000/v1/schedule/all"; // empNum 없으면 전체일정
      const res = await axios.get(url);

      const loaded = res.data.map((e) => ({
        title: `[${e.codeBName || e.codeBId || "일정"}] ${e.empName || ""} - ${e.memo || ""}`,
        start: new Date(e.startTime),
        end: new Date(e.endTime),
        color:
        e.codeBid === "PT" || e.codeBid === "SCHEDULE-PT"
          ? "#2ecc71" // PT 는 초록
          : e.codeBid === "VACATION"
          ? "#e74c3c" // 휴가는 빨강
          : e.codeBid?.startsWith("ETC")
          ? "#3498db" // 기타는 파랑
          : "#95a5a6", // null일 경우 회색
        ...e,
      }));
      setEvents(loaded);
    } catch (err) {
      console.error("일정 불러오기 에러:", err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [empNum]);

  // 캘린더 클릭 핸들러
  const handleSelectSlot = (slotInfo) => {
    const dateStr = format(slotInfo.start, "yyyy-MM-dd"); // 클릭한 날짜를 문자열로 변환
    setClickedDate(dateStr);
    setEditData(null); // 등록 모드니까 수정데이터 초기화
    setShowModal(true);
  };
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  return (
    <div>
      <h4>📅 직원 일정 관리</h4>

      <ScheduleCalendar
        events={events}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {/* 일정 등록 모달 */}
      {showModal && (
        <ScheduleModal
          show={showModal}
          empNum={empNum}   // 직원번호
          empName={empName} // 직원이름
          onClose={() => setShowModal(false)}
          onSaved={loadSchedules}
          editData={editData} // 수정 데이터 전달
          selectedDate={clickedDate} // 클릭한 날짜 추가
        />
      )}

      {/* 일정 상세 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📄 일정 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent ? (
            <>
              <p><strong>유형:</strong> {selectedEvent.refType || "미지정"}</p>
              <p><strong>직원:</strong> {selectedEvent.empName || "미지정"}</p>
              <p><strong>내용:</strong> {selectedEvent.memo || "내용 없음"}</p>
              <p><strong>시작:</strong> {format(selectedEvent.start, "yyyy-MM-dd HH:mm")}</p>
              <p><strong>종료:</strong> {format(selectedEvent.end, "yyyy-MM-dd HH:mm")}</p>
            </>
          ) : (
            <p>일정 정보를 불러오는 중...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
          variant="primary"
          onClick={() => {
            setShowDetailModal(false);
            setEditData(selectedEvent); // 수정할 데이터 넘기기
            setShowModal(true); // 등록 모달 열기
          }}
          >
          수정
          </Button>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
