import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Modal, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleModal from "../components/ScheduleModal";
import GymIcon from "../components/icons/GymIcon";


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

    const loaded = res.data.map((e) => {
      // 코드별 한글 라벨 매핑
      const typeMap = {
        "PT": "PT",
        "SCHEDULE-PT": "PT",
        "VACATION": "휴가",
        "ETC-COUNSEL": "상담",
        "ETC-MEETING": "회의",
        "ETC-COMPETITION": "대회",
      };

      // 매칭되는 이름 없으면 codeBName 또는 "일정"
      const typeLabel = typeMap[e.codeBid] || e.codeBName || "일정";

      return {
        title:
          typeLabel === "PT"
            ? `[${typeLabel}] ${e.memName || "회원"} - ${e.memo || ""}` // PT는 회원명 중심
            : `[${typeLabel}] ${e.empName || ""} - ${e.memo || ""}`,     // 그 외는 직원명 중심
        start: new Date(e.startTime),
        end: new Date(e.endTime),
        color:
        e.codeBid === "PT" || e.codeBid === "SCHEDULE-PT"
          ? "#2ecc71" // PT: 초록
          : e.codeBid === "VACATION"
          ? "#e74c3c" // 휴가: 빨강
          : e.codeBid === "ETC-COMPETITION"
          ? "#9b59b6" // 대회: 보라
          : e.codeBid === "ETC-COUNSEL"
          ? "#f39c12" // 상담: 주황
          : e.codeBid === "ETC-MEETING"
          ? "#34495e" // 회의: 남색
          : "#95a5a6", // 기본: 회색
        ...e,
      };
    });
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
      <h4 style={{fontWeight:"600", coloer:"#444", fontSize:"1.8rem", marginBottom:"1.2rem",}}> <GymIcon size={32} color="#f1c40f" secondary="#2c3e50" /></h4>
      <hr />
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
