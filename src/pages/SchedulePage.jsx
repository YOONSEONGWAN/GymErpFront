// src/pages/SchedulePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleModal from "../components/ScheduleModal";
import GymIcon from "../components/icons/GymIcon";


function safeJson(s) { try { return JSON.parse(s); } catch { return null; } }

function mapToEvents(arr) {
  const typeMap = {
    PT: "PT",
    "SCHEDULE-PT": "PT",
    VACATION: "휴가",
    "ETC-COUNSEL": "상담",
    "ETC-MEETING": "회의",
    "ETC-COMPETITION": "대회",
  };
  return (arr || []).map((e) => {
    const typeLabel = typeMap[e.codeBid] || e.codeBName || "일정";
    return {
      title: typeLabel === "PT"
        ? `[${typeLabel}] ${e.memName || "회원"} - ${e.memo || ""}`
        : `[${typeLabel}] ${e.empName || ""} - ${e.memo || ""}`,
      start: new Date(e.startTime),
      end: new Date(e.endTime),
      color:
        e.codeBid === "PT" || e.codeBid === "SCHEDULE-PT" ? "#2ecc71" :
        e.codeBid === "VACATION" ? "#e74c3c" :
        e.codeBid === "ETC-COMPETITION" ? "#9b59b6" :
        e.codeBid === "ETC-COUNSEL" ? "#f39c12" :
        e.codeBid === "ETC-MEETING" ? "#34495e" : "#95a5a6",
      ...e,
    };
  });
}

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [focusDate, setFocusDate] = useState(null); // 🔎 검색 결과 날짜 포커스용

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editData, setEditData] = useState(null);
  const [clickedDate, setClickedDate] = useState(null);

  const rawUser = localStorage.getItem("loginUser") || sessionStorage.getItem("loginUser");
  const user = rawUser ? safeJson(rawUser) : null;
  const directRole = (localStorage.getItem("role") || sessionStorage.getItem("role") || "").toUpperCase();
  const role = (user?.role || directRole || "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const empNum = params.get("empNum");
  const empName = params.get("empName");

  // 기본/직원별 일정 로딩
  const loadSchedules = async () => {
    try {
      const url = empNum ? `http://localhost:9000/v1/schedule/emp/${empNum}` : `http://localhost:9000/v1/schedule/all`;
      const res = await axios.get(url);
      const loaded = mapToEvents(res.data);
      setEvents(loaded);
      // 기존 진입 시에도 첫 이벤트가 있으면 그 달로 포커스(초기 UX 보강)
      if (loaded.length > 0 && !focusDate) setFocusDate(loaded[0].start);
    } catch (err) {
      console.error("❌ [일정 불러오기 실패]:", err);
    }
  };
  useEffect(() => { loadSchedules(); /* eslint-disable-next-line */ }, [empNum]);

  // 관리자 검색 (직원이름, 유형, 키워드만)

  // const searchAdmin = async ({ empName, codeBid, keyword }) => {
  //   const qs = new URLSearchParams();
  //   // 백엔드 검색 파라미터는 keyword 하나이므로, 직원이름 우선 → 없으면 일반 키워드
  //   if (empName) qs.set("keyword", empName);
  //   else if (keyword) qs.set("keyword", keyword);
  //   if (codeBid) qs.set("codeBid", codeBid);
  //   qs.set("page", 1);
  //   qs.set("size", 20);

  //   const { data } = await axios.get(`http://localhost:9000/v1/schedules/search?${qs.toString()}`);

 const searchAdmin = async ({ empName, codeBid, keyword }) => {
   const params = { page: 1, size: 20 };
   const kw = (empName || keyword || "").trim();
   if (kw) params.keyword = kw;
   if (codeBid) params.codeBid = codeBid;

   const { data } = await axios.get(`http://localhost:9000/v1/schedules/search`, { params });


    const list = data?.list || [];
    const mapped = mapToEvents(list);
    setEvents(mapped);

    // 🔁 검색 결과 첫 건 기준으로: empNum 로 이동 + 그 날짜로 포커스
    if (list.length > 0) {
      const first = list[0];
      const firstEmpNum = first.empNum;
      const firstEmpName = first.empName || "";
      const firstDate = new Date(first.startTime);
      setFocusDate(firstDate);

      const next = new URLSearchParams(location.search);
      next.set("empNum", String(firstEmpNum));
      if (firstEmpName) next.set("empName", firstEmpName);
      navigate({ search: `?${next.toString()}` }, { replace: true });
      // useEffect(empNum)로 직원별 일정 재호출 → 달력은 focusDate로 해당 월로 이동
    } else {
      // 결과 0건이면 현재 월 유지
      alert("검색 결과가 없습니다.");
    }
  };

  const handleSelectSlot = (slotInfo) => {
    const dateStr = format(slotInfo.start, "yyyy-MM-dd");
    setClickedDate(dateStr);
    setEditData(null);
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEvent?.shNum) { alert("삭제할 일정의 shNum이 없습니다."); return; }
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;
    try {
      const url = `http://localhost:9000/v1/schedule/delete/${selectedEvent.shNum}`;
      await axios.delete(url);
      alert("✅ 일정이 삭제되었습니다.");
      setShowDetailModal(false);
      setSelectedEvent(null);
      await loadSchedules();
    } catch (err) {
      console.error("❌ [일정 삭제 실패]:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    setShowDetailModal(false);
    setEditData(selectedEvent);
    setShowModal(true);
  };

  return (
    <div>
      <h4 style={{ fontWeight: 600, color: "#444", fontSize: "1.8rem", marginBottom: "1.2rem" }}>
        <GymIcon size={32} color="#f1c40f" secondary="#2c3e50" /> 일정 관리
      </h4>
      <hr />

      {/* 🔐 관리자 전용 간단 검색바 */}
      {isAdmin && (
        <AdminSearchBar onSearch={searchAdmin} />
      )}

      {/* 📅 캘린더 */}
      <ScheduleCalendar
        events={events}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        isAdmin={isAdmin}
        focusDate={focusDate}   // 🔎 이걸로 해당 월로 이동
      />

      {/* 🟢 등록/수정 모달 */}
      {showModal && (
        <ScheduleModal
          show={showModal}
          empNum={empNum}
          empName={empName}
          onSaved={() => {
            loadSchedules();
            setShowModal(false);
            setEditData(null);
          }}
          editData={editData}
          selectedDate={clickedDate}
        />
      )}

      {/* 📄 상세 보기 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📄 일정 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent ? (
            <>
              <p><strong>유형:</strong> {selectedEvent.codeBName || selectedEvent.codeBid || "미지정"}</p>
              <p><strong>직원:</strong> {selectedEvent.empName || "-"}</p>
              {selectedEvent.memName && <p><strong>회원:</strong> {selectedEvent.memName}</p>}
              <p><strong>내용:</strong> {selectedEvent.memo || "내용 없음"}</p>
              <p><strong>시작:</strong> {format(selectedEvent.start, "yyyy-MM-dd HH:mm")}</p>
              <p><strong>종료:</strong> {format(selectedEvent.end, "yyyy-MM-dd HH:mm")}</p>
            </>
          ) : (
            <p>일정 정보를 불러오는 중...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleEdit}>수정</Button>
          <Button variant="danger" onClick={handleDelete}>삭제</Button>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>닫기</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/** ==== 관리자 간단 검색바(직원이름/유형/키워드) ==== */
function AdminSearchBar({ onSearch }) {
  const [empName, setEmpName] = useState("");
  const [codeBid, setCodeBid] = useState("");
  const [keyword, setKeyword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSearch?.({ empName: empName.trim(), codeBid, keyword: keyword.trim() });
  };
  const reset = () => {
    setEmpName(""); setCodeBid(""); setKeyword("");
    onSearch?.({ empName: "", codeBid: "", keyword: "" });
  };

  return (
    <Form onSubmit={submit} className="mb-3">
      <Row className="gy-2 align-items-end">
        <Col md={3}>
          <Form.Label>직원이름</Form.Label>
          <Form.Control value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder="예) 시스템관리자" />
        </Col>
        <Col md={2}>
          <Form.Label>유형</Form.Label>
          <Form.Select value={codeBid} onChange={(e) => setCodeBid(e.target.value)}>
            <option value="">전체</option>
            <option value="SCHEDULE-PT">PT</option>
            <option value="VACATION">휴가</option>
            <option value="ETC-MEETING">회의</option>
            <option value="ETC-COUNSEL">상담</option>
            <option value="ETC-COMPETITION">대회</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Label>키워드(메모/회원명 등)</Form.Label>
          <Form.Control value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예) 초기상담, 김철수" />
        </Col>
        <Col md="auto">
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary">검색</Button>
            <Button type="button" variant="secondary" onClick={reset}>초기화</Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
}
