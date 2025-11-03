import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Tabs, Tab, Row, Col, Spinner } from "react-bootstrap";
import MemberSearchModal from "./MemberSearchModal.jsx";

export default function ScheduleModal({
  show,
  onClose,
  onSaved,
  empNum,
  empName,
  defaultStartTime,
  defaultEndTime,
  mode = "create",
  initialData = null,
}) {
  const [activeTab, setActiveTab] = useState("PT");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [ptCount, setPtCount] = useState({ total: 0, remain: 0 });
  const [loadingCount, setLoadingCount] = useState(false);
  const [form, setForm] = useState({
    empNum,
    codeBId: "B001",
    startTime: "",
    endTime: "",
    memo: "",
    memNum: null,
    etcType: "",
  });

  /** 📅 시간 포맷 변환 (로컬 기준 ISO 변환) */
  const formatLocalDate = (d) =>
    d ? new Date(d - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

  /** ✅ 모달 열릴 때 초기값 세팅 */
  useEffect(() => {
    if (!show) return;

    if (mode === "edit" && initialData) {
      setForm({
        id: initialData.id,
        empNum: initialData.empNum,
        codeBId: initialData.codeBId,
        startTime: formatLocalDate(initialData.start),
        endTime: formatLocalDate(initialData.end),
        memo: initialData.memo || "",
        memNum: initialData.memNum || null,
        etcType: initialData.etcType || "",
      });

      // PT 일정이라면 회원 + PT 횟수 자동 세팅
      if (initialData.codeBId === "B001" && initialData.memNum) {
        setSelectedMember({
          memNum: initialData.memNum,
          memName: initialData.memName,
          memPhone: initialData.memPhone,
        });
        fetchPtCount(initialData.memNum);
      } else {
        setSelectedMember(null);
        setPtCount({ total: 0, remain: 0 });
      }

      // 탭 전환
      setActiveTab(
        initialData.codeBId === "B001"
          ? "PT"
          : initialData.codeBId === "B002"
          ? "VACATION"
          : "ETC"
      );
    } else if (mode === "create") {
      const start = formatLocalDate(defaultStartTime);
      const end = formatLocalDate(defaultEndTime);
      setForm({
        empNum,
        codeBId: "B001",
        startTime: start,
        endTime: end,
        memo: "",
        memNum: null,
        etcType: "",
      });
      setSelectedMember(null);
      setActiveTab("PT");
      setPtCount({ total: 0, remain: 0 });
    }
  }, [show, mode, initialData]);

  /** 💪 PT 잔여횟수 조회 */
  const fetchPtCount = async (memNum) => {
    if (!memNum) return;
    setLoadingCount(true);
    try {
      const res = await axios.get(`http://localhost:9000/schedule/ptCount/${memNum}`);
      setPtCount({
        total: res.data.totalCount || 0,
        remain: res.data.remainCount || 0,
      });
    } catch (err) {
      console.error("❌ PT 횟수 조회 실패:", err);
      setPtCount({ total: 0, remain: 0 });
    } finally {
      setLoadingCount(false);
    }
  };

  /** 🧭 탭 변경 시 코드 자동 동기화 */
  useEffect(() => {
    const map = { PT: "B001", VACATION: "B002", ETC: "B003" };
    setForm((prev) => ({ ...prev, codeBId: map[activeTab] }));
  }, [activeTab]);

  /** 🖊️ 입력값 변경 */
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /** ✅ 저장 버튼 클릭 */
  const handleSubmit = () => {
    const payload = {
      ...form,
      memNum: selectedMember?.memNum || form.memNum,
    };

    // ⚠️ PT 일정 유효성 검사
    if (activeTab === "PT") {
      if (!payload.memNum) return alert("PT 일정은 회원 선택이 필요합니다.");
      if (ptCount.remain <= 0)
        return alert("⚠️ 남은 PT 횟수가 없습니다. 회원권을 갱신하세요.");
    }

    // ⚠️ 기타 일정 유효성 검사
    if (activeTab === "ETC" && !payload.etcType)
      return alert("기타 구분을 선택하세요.");

    onSaved(payload, mode);
  };

  return (
    <>
      <Modal show={show} onHide={onClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {mode === "create" ? "📅 일정 등록" : "✏️ 일정 수정"} - {empName}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
            {/* 💪 PT 일정 */}
            <Tab eventKey="PT" title="💪 PT 일정">
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>회원명</Form.Label>
                  <Form.Control
                    readOnly
                    value={selectedMember?.memName || "(회원 선택)"}
                    onClick={() => setShowMemberModal(true)}
                    style={{ cursor: "pointer" }}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>연락처</Form.Label>
                  <Form.Control readOnly value={selectedMember?.memPhone || ""} />
                </Col>
              </Row>

              {selectedMember && (
                <div className="mb-3">
                  <Form.Label>PT 잔여 횟수</Form.Label>
                  <div className="border p-2 rounded bg-light">
                    {loadingCount ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <strong>
                        남은 {ptCount.remain}회 / 총 {ptCount.total}회
                      </strong>
                    )}
                  </div>
                </div>
              )}
            </Tab>

            {/* 🌴 휴가 일정 */}
            <Tab eventKey="VACATION" title="🌴 휴가 일정">
              <Form.Group className="mb-2">
                <Form.Label>사유</Form.Label>
                <Form.Control
                  as="textarea"
                  name="memo"
                  rows={2}
                  value={form.memo}
                  onChange={handleChange}
                />
              </Form.Group>
            </Tab>

            {/* 📝 기타 일정 */}
            <Tab eventKey="ETC" title="📝 기타 일정">
              <Form.Label>기타 구분</Form.Label>
              <Form.Select name="etcType" value={form.etcType} onChange={handleChange}>
                <option value="">선택</option>
                <option value="MEETING">회의</option>
                <option value="COUNSEL">상담</option>
                <option value="COMPETITION">대회</option>
              </Form.Select>
              <Form.Group className="mt-2">
                <Form.Label>내용</Form.Label>
                <Form.Control
                  as="textarea"
                  name="memo"
                  rows={2}
                  value={form.memo}
                  onChange={handleChange}
                />
              </Form.Group>
            </Tab>
          </Tabs>

          <Row>
            <Col>
              <Form.Label>시작</Form.Label>
              <Form.Control
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />
            </Col>
            <Col>
              <Form.Label>종료</Form.Label>
              <Form.Control
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
          <Button
            variant={mode === "create" ? "primary" : "warning"}
            onClick={handleSubmit}
            disabled={activeTab === "PT" && ptCount.remain <= 0} // PT 잔여 0회면 비활성화
          >
            {mode === "create" ? "등록" : "수정"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 👤 회원 검색 모달 */}
      <MemberSearchModal
        show={showMemberModal}
        onHide={() => setShowMemberModal(false)}
        onSelect={(m) => {
          setSelectedMember(m);
          setForm((p) => ({ ...p, memNum: m.memNum }));
          fetchPtCount(m.memNum); // 선택 시 PT 횟수 즉시 갱신
        }}
      />
    </>
  );
}
