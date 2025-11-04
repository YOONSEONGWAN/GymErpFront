// src/components/ScheduleModal.jsx
import { useState, useEffect, useMemo } from "react";
import { Modal, Tabs, Tab, Button, Row, Col, Form } from "react-bootstrap";
import axios from "axios";



/* ============================================================= */
/* 🔹 메인 ScheduleModal */
export default function ScheduleModal({
  show,
  defaultTab = "pt",
  empNum,
  empName,
  onClose,
  onSaved,
  editData,
  selectedDate,
  readOnly = false, // ✅ 새로 추가: 상세 보기 모드 플래그
}) {
  const [tab, setTab] = useState(defaultTab);

  // 수정 모드 → 탭 자동 변경
  useEffect(() => {
    if (!editData) return;
    if (editData.codeBid === "VACATION") setTab("vacation");
    else if (editData.codeBid?.startsWith("ETC")) setTab("etc");
    else if (editData.codeBid === "SCHEDULE-PT") setTab("pt");
  }, [editData]);

  const handleSaved = (payload) => {
    console.log("✅ [일정 저장 완료] payload:", payload);
    onSaved?.(payload);
    onClose?.();
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{readOnly ? "일정 상세보기" : "일정 관리"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          id="schedule-tabs"
          activeKey={tab}
          onSelect={(k) => setTab(k || "pt")}
          className="mb-3"
          justify
        >
          <Tab eventKey="pt" title="PT">
            <PTTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
              readOnly={readOnly}
            />
          </Tab>

          <Tab eventKey="vacation" title="휴가">
            <VacationTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
              readOnly={readOnly}
            />
          </Tab>

          <Tab eventKey="etc" title="기타">
            <EtcTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
              readOnly={readOnly}
            />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/* ============================================================= */
/* 🟢 PT 탭 (상세 보기 모드 대응) */
function PTTab({ empNum, empName, onSaved, editData, selectedDate, readOnly }) {
  const [form, setForm] = useState({
    memNum: "",
    empNum: empNum || "",
    empName: empName || "",
    date: selectedDate || "",
    startTime: "",
    endTime: "",
    memo: "",
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (empNum) setForm((prev) => ({ ...prev, empNum, empName }));

    if (editData) {
      setForm({
        memNum: editData.memNum || "",
        empNum: editData.empNum || empNum,
        empName: editData.empName || empName,
        date: editData.startTime?.slice(0, 10) || selectedDate || "",
        startTime: editData.startTime?.slice(11, 16) || "",
        endTime: editData.endTime?.slice(11, 16) || "",
        memo: editData.memo || "",
      });
    }

    axios
      .get("http://localhost:9000/v1/member")
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("❌ 회원 목록 불러오기 실패:", err));
  }, [empNum, empName, editData, selectedDate]);

  const handleDelete = async () => {
    if (!editData?.shNum) return alert("삭제할 일정이 없습니다.");
    if (!window.confirm("정말 이 PT 일정을 삭제하시겠습니까?")) return;
    try {
      console.log("🗑 [PT 삭제 요청]", editData.shNum);
      await axios.delete(`http://localhost:9000/v1/schedule/delete/${editData.shNum}`);
      alert("✅ PT 일정이 삭제되었습니다.");
      onSaved?.();
    } catch (err) {
      console.error("❌ PT 일정 삭제 실패:", err);
    }
  };

  if (readOnly) {
    // ✅ 상세보기 모드 전용 UI
    return (
      <div>
        <Row className="g-3">
          <Col md={6}><strong>회원명:</strong> {editData?.memName}</Col>
          <Col md={6}><strong>트레이너:</strong> {editData?.empName}</Col>
          <Col md={6}><strong>시작 시간:</strong> {editData?.startTime}</Col>
          <Col md={6}><strong>종료 시간:</strong> {editData?.endTime}</Col>
          <Col md={12}><strong>메모:</strong> {editData?.memo}</Col>
        </Row>
        <div className="d-flex justify-content-end mt-4">
          <Button variant="danger" onClick={handleDelete}>삭제</Button>
        </div>
      </div>
    );
  }

  // 일반 등록/수정 모드
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      empNum: form.empNum,
      memNum: form.memNum,
      codeBid: "SCHEDULE-PT",
      startTime: `${form.date}T${form.startTime}`,
      endTime: `${form.date}T${form.endTime}`,
      memo: form.memo,
    };
    console.log("📦 [PT payload 확인]", payload);
    try {
      if (editData) {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("✅ PT 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("✅ PT 일정이 등록되었습니다.");
      }
      onSaved?.(payload);
    } catch (err) {
      console.error("❌ PT 일정 등록/수정 실패:", err);
    }
  };

  return (
    <Form onSubmit={submit}>
      {/* 기존 폼 그대로 */}
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>회원명</Form.Label>
          <Form.Select name="memNum" value={form.memNum} onChange={onChange}>
            <option value="">선택</option>
            {members.map((m) => (
              <option key={m.memNum} value={m.memNum}>
                {m.memName}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>트레이너</Form.Label>
          <Form.Control name="empName" value={form.empName} readOnly />
        </Col>
        <Col md={4}>
          <Form.Label>날짜</Form.Label>
          <Form.Control type="date" name="date" value={form.date} onChange={onChange} />
        </Col>
        <Col md={4}>
          <Form.Label>시작 시간</Form.Label>
          <Form.Control type="time" name="startTime" value={form.startTime} onChange={onChange} />
        </Col>
        <Col md={4}>
          <Form.Label>종료 시간</Form.Label>
          <Form.Control type="time" name="endTime" value={form.endTime} onChange={onChange} />
        </Col>
        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control as="textarea" rows={3} name="memo" value={form.memo} onChange={onChange} />
        </Col>
      </Row>
      <div className="d-flex justify-content-end mt-3 gap-2">
        <Button type="submit" variant="primary">
          저장
        </Button>
      </div>
    </Form>
  );
}
