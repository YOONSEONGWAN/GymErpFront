// src/pages/SchedulePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ko } from "date-fns/locale";
import { Modal, Button, Form, Tabs, Tab, Row, Col } from "react-bootstrap";

const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [memberList, setMemberList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("registration");

  const [form, setForm] = useState({
    empNum: "",
    memNum: "",
    type: "상담",
    memo: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  /** ============================= 데이터 로딩 ============================= */
  const loadEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:9000/v1/emp/list");
      setEmployeeList(res.data);
    } catch (err) {
      console.error("❌ 직원 목록 에러:", err);
    }
  };

  const loadMembers = async () => {
    try {
      const res = await axios.get("http://localhost:9000/v1/member");
      setMemberList(res.data);
    } catch (err) {
      console.error("❌ 회원 목록 에러:", err);
    }
  };

  const loadSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:9000/empSchedule/all");
      const loadedEvents = res.data.map((e) => {
        const empName = e.empName || "미지정";
        const refType =
          e.refType === "REGISTRATION"
            ? "PT"
            : e.refType === "VACATION"
            ? "휴가"
            : "기타";
        const title = `[${refType}] ${empName} - ${
          e.memo || e.refDetail || ""
        }`;

        return {
          title,
          start: new Date(e.startTime || e.refStartTime),
          end: new Date(e.endTime || e.refEndTime),
          memo: e.memo || e.refDetail,
          calNum: e.calNum,
          empNum: e.empNum,
          empName: empName,
          refType: refType,
          color:
            e.refType === "REGISTRATION"
              ? "#2ecc71"
              : e.refType === "VACATION"
              ? "#e74c3c"
              : "#3498db",
        };
      });
      setEvents(loadedEvents);
    } catch (err) {
      console.error("❌ 일정 불러오기 에러:", err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadMembers();
    loadSchedules();
  }, []);

  /** ============================= 캘린더 동작 ============================= */
  const handleSelectSlot = (slot) => {
    setForm({
      empNum: "",
      memNum: "",
      type: "상담",
      memo: "",
      startDate: format(slot.start, "yyyy-MM-dd"),
      startTime: format(slot.start, "HH:mm"),
      endDate: format(slot.end, "yyyy-MM-dd"),
      endTime: format(slot.end, "HH:mm"),
    });
    setActiveTab("registration");
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  /** ============================= 일정 등록 ============================= */
  const handleSave = async () => {
    if (!form.empNum) return alert("직원을 선택하세요!");
    const start = `${form.startDate}T${form.startTime}`;
    const end = `${form.endDate}T${form.endTime}`;

    const payload = {
      empNum: Number(form.empNum),
      refType: activeTab.toUpperCase(),
      memo: form.memo,
    };

    if (activeTab === "etc") {
      payload.etc = {
        etcType: form.type,
        etcMemo: form.memo,
        startTime: start,
        endTime: end,
      };
    } else if (activeTab === "vacation") {
      payload.vacation = {
        vacContent: form.memo,
        vacStartedAt: start,
        vacEndedAt: end,
      };
    } else if (activeTab === "registration") {
      if (!form.memNum) return alert("회원 선택은 필수입니다!");
      payload.registration = {
        memNum: Number(form.memNum),
        regTime: start,
        lastTime: end,
        regNote: form.memo,
      };
    }

    try {
      await axios.post(`http://localhost:9000/empSchedule/${activeTab}`, payload);
      alert(`${activeTab} 일정이 등록되었습니다.`);
      setShowModal(false);
      loadSchedules();
    } catch (err) {
      console.error("❌ 일정 등록 실패:", err);
    }
  };

  /** ============================= 렌더링 ============================= */
  return (
    <div>
      <div className="d-flex justify-content-between mb-2">
        <h4>📅 직원 일정 관리</h4>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        style={{ height: 600 }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color,
            borderRadius: "5px",
            color: "white",
          },
        })}
      />

      {/* 일정 등록/수정 모달 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>일정 등록 / 수정</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
            {/* PT 일정 */}
            <Tab eventKey="registration" title="PT">
              <Form>
                <Row className="mb-3">
                  <Col sm={6}>
                    <Form.Label>회원 선택</Form.Label>
                    <Form.Select
                      value={form.memNum}
                      onChange={(e) => setForm({ ...form, memNum: e.target.value })}
                    >
                      <option value="">회원 선택</option>
                      {memberList.map((mem) => (
                        <option key={mem.memNum} value={mem.memNum}>
                          {mem.memName}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col sm={6}>
                    <Form.Label>트레이너 선택</Form.Label>
                    <Form.Select
                      value={form.empNum}
                      onChange={(e) => setForm({ ...form, empNum: e.target.value })}
                    >
                      <option value="">직원 선택</option>
                      {employeeList.map((emp) => (
                        <option key={emp.empNum} value={emp.empNum}>
                          {emp.empName}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <Form.Label>날짜</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </Col>
                  <Col sm={4}>
                    <Form.Label>시작 시간</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </Col>
                  <Col sm={4}>
                    <Form.Label>총 시간(분)</Form.Label>
                    <Form.Control type="number" value={60} readOnly />
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label>메모</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.memo}
                    onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  />
                </Form.Group>
              </Form>
            </Tab>

            {/* 기타 일정 */}
            <Tab eventKey="etc" title="기타">
              <Form>
                <Row className="mb-3">
                  <Col sm={6}>
                    <Form.Label>직원 선택</Form.Label>
                    <Form.Select
                      value={form.empNum}
                      onChange={(e) => setForm({ ...form, empNum: e.target.value })}
                    >
                      <option value="">직원 선택</option>
                      {employeeList.map((emp) => (
                        <option key={emp.empNum} value={emp.empNum}>
                          {emp.empName}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col sm={6}>
                    <Form.Label>일정 종류</Form.Label>
                    <Form.Select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option>상담</option>
                      <option>회의</option>
                      <option>행사</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={6}>
                    <Form.Label>시작 일</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Label>종료 일</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={6}>
                    <Form.Label>시작 시간</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Label>종료 시간</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    />
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label>메모</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.memo}
                    onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  />
                </Form.Group>
              </Form>
            </Tab>

            {/* 휴가 일정 */}
            <Tab eventKey="vacation" title="휴가">
              <Form>
                <Row className="mb-3">
                  <Col sm={6}>
                    <Form.Label>직원 선택</Form.Label>
                    <Form.Select
                      value={form.empNum}
                      onChange={(e) => setForm({ ...form, empNum: e.target.value })}
                    >
                      <option value="">직원 선택</option>
                      {employeeList.map((emp) => (
                        <option key={emp.empNum} value={emp.empNum}>
                          {emp.empName}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col sm={6}>
                    <Form.Label>휴가 사유</Form.Label>
                    <Form.Control
                      value={form.memo}
                      onChange={(e) => setForm({ ...form, memo: e.target.value })}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col sm={6}>
                    <Form.Label>시작 일</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Label>종료 일</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </Col>
                </Row>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave}>
            확인
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 일정 상세 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📄 일정 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent ? (
            <>
              <p>
                <strong>일정 종류:</strong> {selectedEvent.refType}
              </p>
              <p>
                <strong>직원 이름:</strong> {selectedEvent.empName}
              </p>
              <p>
                <strong>내용:</strong> {selectedEvent.memo}
              </p>
              <p>
                <strong>시작 시간:</strong>{" "}
                {format(selectedEvent.start, "yyyy-MM-dd HH:mm")}
              </p>
              <p>
                <strong>종료 시간:</strong>{" "}
                {format(selectedEvent.end, "yyyy-MM-dd HH:mm")}
              </p>
            </>
          ) : (
            <p>일정 정보를 불러오는 중...</p>
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