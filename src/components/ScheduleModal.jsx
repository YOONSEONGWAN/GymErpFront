// src/components/ScheduleModal.jsx
import { useMemo, useState } from "react";
import { Modal, Tabs, Tab, Button, Row, Col, Form, InputGroup } from "react-bootstrap";
// import axios from "axios"; // 실제 연동 시 사용

export default function ScheduleModal({ show, defaultTab = "pt", onClose, onSaved }) {
  const [tab, setTab] = useState(defaultTab);

  const handleSaved = (payload) => {
    onSaved?.(payload); // 저장 후 부모에서 처리(목록 갱신 등)
    onClose?.();
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>일정 등록/수정</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs activeKey={tab} onSelect={(k) => setTab(k || "pt")} className="mb-3" justify>
          <Tab eventKey="pt" title="PT">
            <PTTab onSaved={handleSaved} />
          </Tab>
          <Tab eventKey="etc" title="기타">
            <EtcTab onSaved={handleSaved} />
          </Tab>
          <Tab eventKey="vacation" title="휴가">
            <VacationTab onSaved={handleSaved} />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>취소</Button>
      </Modal.Footer>
    </Modal>
  );
}

/* ================= PT 탭 (수정본) ================= */
function PTTab({ onSaved }) {
  const [form, setForm] = useState({
    memberName: "",
    trainer: "",
    date: "",
    startTime: "",
    endTime: "",          // ✅ 종료시간 필드 추가
    durationMin: 60,
    memo: "",
    ptRemain: 20,         // ✅ 기본값 20
    ptTotal: 20,          // ✅ 기본값 20
  });

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    // const { data } = await axios.post("/api/v1/pt-schedules", form);
    onSaved?.({ type: "PT", ...form });
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>회원 검색</Form.Label>
          <InputGroup>
            <Form.Control
              name="memberName"
              value={form.memberName}
              onChange={onChange}
              placeholder="회원명"
            />
            <Button variant="outline-secondary" type="button">검색</Button>
          </InputGroup>
        </Col>

        <Col md={6}>
          <Form.Label>트레이너</Form.Label>
          <Form.Control
            name="trainer"
            value={form.trainer}
            onChange={onChange}
            placeholder="담당자"
          />
        </Col>

        <Col md={4}>
          <Form.Label>날짜</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
          />
        </Col>

        <Col md={4}>
          <Form.Label>시작 시간</Form.Label>
          <Form.Control
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
          />
        </Col>

        <Col md={4}>
          <Form.Label>종료 시간</Form.Label>
          <Form.Control
            type="time"
            name="endTime"          // ✅ 올바른 name/value
            value={form.endTime}
            onChange={onChange}
          />
        </Col>

        {/* ✅ PT 남은 횟수 / 총 PT 횟수 표시 (기본 20/20) */}
        <Col md={12}>
          <Form.Label>PT 남은 횟수 / 총 PT 횟수</Form.Label>
          <Form.Control readOnly value={`${form.ptRemain}/${form.ptTotal}`} />
        </Col>

        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            name="memo"
            value={form.memo}
            onChange={onChange}
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">확인</Button>
      </div>
    </Form>
  );
}

function EtcTab({ onSaved }) {
  const [form, setForm] = useState({
    registrant: "",
    category: "상담",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    memo: "",
  });
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    // const { data } = await axios.post("/api/v1/etc-schedules", form);
    onSaved?.({ type: "ETC", ...form });
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>등록자</Form.Label>
          <Form.Control name="registrant" value={form.registrant} onChange={onChange} placeholder="로그인 사용자명" />
        </Col>
        <Col md={6}>
          <Form.Label>일정 종류</Form.Label>
          <Form.Select name="category" value={form.category} onChange={onChange}>
            <option value="상담">상담</option>
            <option value="회의">회의</option>
            <option value="업무">업무</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>시작 일</Form.Label>
          <Form.Control type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>종료 일</Form.Label>
          <Form.Control type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>시작 시간</Form.Label>
          <Form.Control type="time" name="startTime" value={form.startTime} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>종료 시간</Form.Label>
          <Form.Control type="time" name="endTime" value={form.endTime} onChange={onChange} />
        </Col>
        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control as="textarea" rows={4} name="memo" value={form.memo} onChange={onChange} />
        </Col>
      </Row>
      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">확인</Button>
      </div>
    </Form>
  );
}

/* ================= 휴가 탭 ================= */
function VacationTab({ onSaved }) {
  const [form, setForm] = useState({
    registrant: "",
    startDate: "",
    endDate: "",
    remainDays: 0,
    reason: "",
  });
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const usedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const d1 = new Date(form.startDate);
    const d2 = new Date(form.endDate);
    // 양끝 포함 계산
    return Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
  }, [form.startDate, form.endDate]);

  const submit = async (e) => {
    e.preventDefault();
    // const { data } = await axios.post("/api/v1/vacations", { ...form, usedDays });
    onSaved?.({ type: "VACATION", ...form, usedDays });
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>등록자</Form.Label>
          <Form.Control name="registrant" value={form.registrant} onChange={onChange} placeholder="로그인 사용자명" />
        </Col>
        <Col md={3}>
          <Form.Label>사용 일 수</Form.Label>
          <Form.Control value={usedDays} readOnly />
        </Col>
        <Col md={3}>
          <Form.Label>남은 휴가 수</Form.Label>
          <Form.Control name="remainDays" value={form.remainDays} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>시작 일</Form.Label>
          <Form.Control type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>종료 일</Form.Label>
          <Form.Control type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </Col>
        <Col md={12}>
          <Form.Label>휴가 사유</Form.Label>
          <Form.Control as="textarea" rows={4} name="reason" value={form.reason} onChange={onChange} />
        </Col>
      </Row>
      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">확인</Button>
      </div>
    </Form>
  );
}
