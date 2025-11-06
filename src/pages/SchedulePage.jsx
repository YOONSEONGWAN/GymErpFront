// src/pages/SchedulePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Button, Form, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleModal from "../components/ScheduleModal";

/* ========= 공통 유틸 ========= */
const safeJson = (s) => {
  try { return JSON.parse(s); } catch { return null; }
};

// 공통 매핑 함수 (일정 → 캘린더 이벤트)
const typeMap = {
  PT: "PT",
  "SCHEDULE-PT": "PT",
  VACATION: "휴가",
  "ETC-COUNSEL": "상담",
  "ETC-MEETING": "회의",
  "ETC-COMPETITION": "대회",
};
const codeColor = (codeBid) =>
  codeBid === "PT" || codeBid === "SCHEDULE-PT"
    ? "#2ecc71"
    : codeBid === "VACATION"
    ? "#e74c3c"
    : codeBid === "ETC-COMPETITION"
    ? "#9b59b6"
    : codeBid === "ETC-COUNSEL"
    ? "#f39c12"
    : codeBid === "ETC-MEETING"
    ? "#34495e"
    : "#95a5a6";

function mapToEvents(list = []) {
  return list.map((e) => {
    const label = typeMap[e.codeBid] || e.codeBName || "일정";
    return {
      title:
        label === "PT"
          ? `[${label}] ${e.memName || "회원"} - ${e.memo || ""}`
          : `[${label}] ${e.empName || ""} - ${e.memo || ""}`,
      start: new Date(e.startTime),
      end: new Date(e.endTime),
      color: codeColor(e.codeBid),
      ...e,
    };
  });
}

// 저장소에서 역할 뽑기
function readRoleFromStorage() {
  const candidates = [
    localStorage.getItem("loginUser"),
    sessionStorage.getItem("loginUser"),
    localStorage.getItem("user"),
    sessionStorage.getItem("user"),
    localStorage.getItem("emp"),
    sessionStorage.getItem("emp"),
  ].filter(Boolean);

  for (const c of candidates) {
    const obj = safeJson(c);
    if (!obj) continue;

    if (obj.role) return String(obj.role).toUpperCase();
    if (Array.isArray(obj.roles) && obj.roles.length) {
      const found = obj.roles.map((x) => String(x).toUpperCase()).find((x) => x.includes("ADMIN"));
      if (found) return found;
    }
    if (Array.isArray(obj.authorities) && obj.authorities.length) {
      const toStr = (x) => (typeof x === "string" ? x : x?.authority ?? "");
      const found = obj.authorities.map(toStr).map((s) => s.toUpperCase()).find((x) => x.includes("ADMIN"));
      if (found) return found;
    }
  }

  const direct = (localStorage.getItem("role") || sessionStorage.getItem("role") || "").toUpperCase();
  return direct || "";
}
const isAdminRole = (r) => (r || "").toUpperCase().includes("ADMIN");

/* ========= 페이지 ========= */
export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [focusDate, setFocusDate] = useState(null);

  const [showModal, setShowModal] = useState(false);         // 등록/수정 모달 표시
  const [modalKey, setModalKey] = useState(0);               // 🔑 강제 리마운트 키
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editData, setEditData] = useState(null);
  const [clickedDate, setClickedDate] = useState(null);

  // 직원 상세 → 일정으로 넘어올 때 URL 파라미터로 empNum/empName 받기
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const empNumFromUrl = params.get("empNum");
  const empNameFromUrl = params.get("empName");
  const storedUser = safeJson(sessionStorage.getItem("user"));
  const empNum = empNumFromUrl || storedUser?.empNum || null;
  const empName = empNameFromUrl || storedUser?.empName || null;

  const roleStr = readRoleFromStorage();
  const isAdmin = isAdminRole(roleStr);

  /* ============================================ */
  /** 일정 로딩 */
  const loadSchedules = useCallback(async () => {
    try {
      const url = empNum
        ? `http://localhost:9000/v1/schedule/emp/${empNum}`
        : "http://localhost:9000/v1/schedule/all";

      const { data } = await axios.get(url);
      const loaded = mapToEvents(data || []);
      setEvents(loaded);
    } catch (err) {
      console.error("[일정 불러오기 실패]:", err);
    }
  }, [empNum]);

  // 최초 & empNum 변경 시 로딩
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  /* ============================================ */
  /** 관리자 검색 (직원이름, 유형, 키워드만) */
  const searchAdmin = async ({ empName, codeBid, keyword }) => {
    if (!isAdmin) return;

    const params = { page: 1, size: 20 };
    const kw = (empName || keyword || "").trim();
    if (kw) params.keyword = kw;
    if (codeBid) params.codeBid = codeBid;

    const { data } = await axios.get(`http://localhost:9000/v1/schedules/search`, { params });

    const list = data?.list || [];
    const mapped = mapToEvents(list);
    setEvents(mapped);

    if (list.length > 0) {
      const first = list[0];
      setFocusDate(new Date(first.startTime));
      const next = new URLSearchParams(location.search);
      next.set("empNum", String(first.empNum));
      if (first.empName) next.set("empName", first.empName);
      navigate({ search: `?${next.toString()}` }, { replace: true });
    } else {
      alert("검색 결과가 없습니다.");
    }
  };

  /* ============================================ */
  /** 캘린더 빈 칸 클릭 → 등록 */
  const handleSelectSlot = (slotInfo) => {
    const dateStr = format(slotInfo.start, "yyyy-MM-dd");
    setClickedDate(dateStr);
    setEditData(null);
    setModalKey(Date.now());          // 🔑 항상 새 키로 리마운트
    setShowModal(true);               // ✅ 표시
  };

  /** 일정 클릭 → 상세 보기 */
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  /** 상세 보기 → 삭제 */
  const handleDelete = async () => {
    if (!selectedEvent?.shNum) {
      alert("삭제할 일정의 shNum이 없습니다.");
      return;
    }
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;
    try {
      const url = `http://localhost:9000/v1/schedule/delete/${selectedEvent.shNum}`;
      await axios.delete(url);
      alert("일정이 삭제되었습니다.");

      setShowDetailModal(false);
      setSelectedEvent(null);
      await loadSchedules();
    } catch (err) {
      console.error("[일정 삭제 실패]:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  /** 상세 → 수정 전환 */
  const handleEdit = () => {
    setShowDetailModal(false);
    setEditData(selectedEvent);
    setModalKey(Date.now());          // 🔑 수정 모달도 새 키로
    setShowModal(true);
  };

  /** 등록/수정 모달 닫기 (X/ESC/닫기) */
  const handleCloseEditModal = () => {
    setShowModal(false);              // ✅ 반드시 false로 내려 언마운트
    setEditData(null);
    setClickedDate(null);
  };

  /** 등록/수정 저장 완료 후: 닫고 새로고침 */
  const handleSaved = async () => {
    setShowModal(false);
    setEditData(null);
    setClickedDate(null);
    await loadSchedules();
  };

  return (
    <div>
      {/* <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <h2 className="page-title mb-1">일정관리</h2>
        </div>
      </div> */}
      <hr />

      {/* 관리자 전용 간단 검색바 */}
      {isAdmin ? <AdminSearchBar onSearch={searchAdmin} isAdmin={isAdmin} /> : null}

      {/* 캘린더 */}
      <ScheduleCalendar
        events={events}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        isAdmin={isAdmin}
        focusDate={focusDate}
      />

      {/* 등록/수정 모달 — 조건부 렌더링 + 강제 리마운트 키 */}
      {showModal && (
        <ScheduleModal
          key={modalKey}             // 🔑 동일 날짜/데이터여도 항상 새로 마운트
          show={true}
          empNum={empNum}
          empName={empName}
          editData={editData}
          selectedDate={clickedDate}
          onSaved={handleSaved}      // 저장 후 닫고, 목록 새로고침
          onClose={handleCloseEditModal}  // ✅ 닫기 버튼/ESC/X 처리
        />
      )}

      {/* 상세 보기 모달 */}
      {showDetailModal && selectedEvent && (
        <ScheduleModal
          show={showDetailModal}
          mode="view"
          defaultTab={
            selectedEvent.codeBid === "VACATION"
              ? "vacation"
              : selectedEvent.codeBid?.startsWith("ETC")
              ? "etc"
              : "pt"
          }
          empNum={selectedEvent.empNum}
          empName={selectedEvent.empName}
          editData={selectedEvent}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
}

/* ========= 관리자 간단 검색바 ========= */
function AdminSearchBar({ onSearch, isAdmin = false }) {
  if (!isAdmin) return null;

  const [empName, setEmpName] = useState("");
  const [codeBid, setCodeBid] = useState("");
  const [keyword, setKeyword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSearch?.({ empName: empName.trim(), codeBid, keyword: keyword.trim() });
  };
  const reset = () => {
    setEmpName("");
    setCodeBid("");
    setKeyword("");
    onSearch?.({ empName: "", codeBid: "", keyword: "" });
  };

  return (
    <Form onSubmit={submit} className="mb-3">
      <Row className="gy-2 align-items-end">
        <Col md={3}>
          <Form.Label>직원이름</Form.Label>
          <Form.Control
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            placeholder="예) 시스템관리자"
          />
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
          <Form.Control
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예) 초기상담, 김철수"
          />
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
