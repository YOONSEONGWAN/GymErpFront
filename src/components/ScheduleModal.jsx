import { useState, useEffect } from "react";
import { Modal, Tabs, Tab, Button, Row, Col, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import "./css/ScheduleModal.css";
import MemberSearchModal from "../components/MemberSearchModal";

/* ============================================================= */
/* 메인 ScheduleModal */
export default function ScheduleModal({
  show,
  defaultTab = "pt",
  empNum,
  empName,
  onSaved,
  editData,
  selectedDate,
  mode = "edit",     // 'view' | 'edit' | 'create'
  onEdit,
  onDelete,
  onClose,
}) {
  const [tab, setTab] = useState(defaultTab);
  const isView = mode === "view";

  // 수정/조회 시 → 탭 자동 이동
  useEffect(() => {
    if (!editData) {
      setTab(defaultTab);
      return;
    }
    if (editData.codeBid === "VACATION") setTab("vacation");
    else if (editData.codeBid?.startsWith("ETC")) setTab("etc");
    else if (editData.codeBid === "SCHEDULE-PT") setTab("pt");
  }, [editData, defaultTab]);

  const handleSaved = (payload) => {
    onSaved?.(payload);
  };

  return (
    <Modal
      show={show}
      centered
      size="lg"
      backdrop="static"
      onHide={onClose}     // X/ESC 닫기
    >
      <Modal.Header closeButton>
        <Modal.Title>일정 {isView ? "상세" : "관리"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          id="schedule-tabs"
          activeKey={tab}
          onSelect={(k) => setTab(k || "pt")}
          className="mb-3"
          justify
          mountOnEnter          // 탭 최초 진입 시에만 마운트
          unmountOnExit         // 탭 벗어나면 언마운트(상태 초기화)
        >
          <Tab eventKey="pt" title="PT">
            <PTTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
              readOnly={isView}
            />
          </Tab>

          <Tab eventKey="vacation" title="휴가">
            <VacationTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
              readOnly={isView}
            />
          </Tab>

          <Tab eventKey="etc" title="기타">
            <EtcTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
              readOnly={isView}
            />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        {isView ? (
          <>
            {onEdit && (
              <Button variant="primary" onClick={() => onEdit(editData)}>수정</Button>
            )}
            {onDelete && (
              <Button variant="danger" onClick={() => onDelete(editData)}>삭제</Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose}>
              닫기
            </Button>
          </>
        ) : (
          <Button type="button" variant="secondary" onClick={onClose}>
            닫기
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

/* ============================================================= */
/* PT 탭 — 조회/수정 */
function PTTab({ empNum, empName, onSaved, editData, selectedDate, readOnly=false }) {
  const disabled = readOnly;
  const toStrId = (v) => (v === null || v === undefined ? "" : String(v));
  const [showMemberModal, setShowMemberModal] = useState(false);

  const handlePickMember = (m) => {
    setForm(prev => ({ ...prev, memNum: toStrId(m.memNum) }));
    setShowMemberModal(false);
  };

  // HH:mm 문자열에 분 더하기
  const addMinutesToTime = (timeStr, minutes) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const total = (h * 60 + m + minutes + 1440) % 1440; // 24h 래핑
    const hh = String(Math.floor(total / 60)).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // 사용자가 종료시간을 직접 수정했는지
  const [endDirty, setEndDirty] = useState(false);

  const [form, setForm] = useState({
    memNum: "",
    empNum: toStrId(empNum),
    empName: empName || "",
    date: selectedDate || "",
    startTime: "",
    endTime: "",
    memo: "",
  });

  const fmtPhone = (v) => {
    if (!v) return "";
    const s = String(v).replace(/\D/g, "");
    if (s.length === 11) return s.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    if (s.length === 10) return s.replace(/(\d{2,3})(\d{3,4})(\d{4})/, "$1-$2-$3");
    return v;
  };

  const sortByKoName = (arr) =>
    [...(Array.isArray(arr) ? arr : [])].sort((a, b) =>
      (a.memName || "").localeCompare(b.memName || "", "ko")
    );

  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (empNum || empName) {
      setForm((prev) => ({
        ...prev,
        empNum: toStrId(empNum),
        empName: empName || prev.empName,
      }));
    }

    if (editData) {
      setForm({
        memNum: toStrId(editData.memNum),
        empNum: toStrId(editData.empNum || empNum),
        empName: editData.empName || empName || "",
        date: editData.startTime?.slice(0, 10) || selectedDate || "",
        startTime: editData.startTime?.slice(11, 16) || "",
        endTime: editData.endTime?.slice(11, 16) || "",
        memo: editData.memo || "",
      });
      setEndDirty(true);   // 기존 일정은 사용자가 직접 세팅한 값 존중
    } else {
      setForm((prev) => ({ ...prev, date: selectedDate || "" }));
      setEndDirty(false);  // 새 일정: 자동 +1h 모드
    }

    axios
      .get("http://localhost:9000/v1/member")
      .then((res) => setMembers(sortByKoName(res.data)))
      .catch((err) => console.error("회원 목록 불러오기 실패:", err));
  }, [empNum, empName, editData, selectedDate]);

  // 공용 onChange: 시작시간이면 endDirty=false일 때 자동 +1h
  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "startTime") {
        if (!value) {
          next.endTime = ""; // 시작시간 지우면 종료시간도 비우기
        } else if (!endDirty) {
          next.endTime = addMinutesToTime(value, 60); // 자동 +1h
        }
      }
      return next;
    });
  };

  // 종료시간을 직접 변경하면 자동 덮어쓰기 중단
  const onEndTimeChange = (e) => {
    setEndDirty(true);
    setForm((prev) => ({ ...prev, endTime: e.target.value }));
  };

  // 현재 선택값/라벨 계산(문자열 통일)
  const currentValue = toStrId(form.memNum);
  const currentMember =
    members.find((m) => toStrId(m.memNum) === currentValue) || null;

  // 🔹 동명이인 구분을 위해 "이름 : 전화" 라벨 구성
  const currentLabel = (() => {
    if (currentMember) {
      const raw = currentMember.memPhone ?? currentMember.phone ?? currentMember.tel ?? currentMember.mobile ?? "";
      const ph = fmtPhone(raw);
      return `${currentMember.memName}${ph ? ` : ${ph}` : ""}`;
    }
    if (editData?.memName) {
      const raw = editData.memPhone ?? "";
      const ph = fmtPhone(raw);
      return `${editData.memName}${ph ? ` : ${ph}` : ""}`;
    }
    return currentValue ? `회원번호 ${currentValue}` : "";
  })();

  const submit = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    const payload = {
      shNum: editData?.shNum,
      empNum: toStrId(form.empNum),
      memNum: toStrId(form.memNum),
      codeBid: "SCHEDULE-PT",
      startTime: `${form.date}T${form.startTime}`,
      endTime: `${form.date}T${form.endTime}`,
      memo: form.memo,
    };

    // 🔹 PT는 회원 선택 필수
    if (!payload.memNum) {
      alert("PT 예약에는 회원 선택이 필요합니다.");
      return;
    }

    try {
      if (editData) {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("PT 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("PT 일정이 등록되었습니다.");
      }
      onSaved?.(payload);
    } catch (err) {
      console.error("PT 일정 등록/수정 실패:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "등록 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  return (
    <>
      <Form onSubmit={submit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label className="fw-bold">회원명</Form.Label>

            {readOnly ? (
              <Form.Select name="memNum" value={currentValue} disabled>
                <option value={currentValue}>{currentLabel}</option>
              </Form.Select>
            ) : (
              <InputGroup>
                <Form.Control
                  readOnly
                  placeholder="회원 검색을 눌러 선택하세요"
                  value={currentLabel || ""}
                />
                <Button variant="outline-secondary" onClick={() => setShowMemberModal(true)}>
                  회원 검색
                </Button>
                {!!currentValue && (
                  <Button
                    variant="outline-dark"
                    onClick={() => setForm(prev => ({ ...prev, memNum: "" }))}
                  >
                    지우기
                  </Button>
                )}
              </InputGroup>
            )}
          </Col>

          <Col md={6}>
            <Form.Label className="fw-bold">트레이너</Form.Label>
            <Form.Control name="empName" value={form.empName} readOnly />
          </Col>

          <Col md={4}>
            <Form.Label className="fw-bold">날짜</Form.Label>
            <Form.Control type="date" name="date" value={form.date} onChange={onChange} disabled={disabled} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-bold">시작 시간</Form.Label>
            <Form.Control type="time" name="startTime" value={form.startTime} onChange={onChange} disabled={disabled} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-bold">종료 시간</Form.Label>
            <Form.Control type="time" name="endTime" value={form.endTime} onChange={onEndTimeChange} disabled={disabled} />
          </Col>

          <Col md={12}>
            <Form.Label className="fw-bold">메모</Form.Label>
            <Form.Control as="textarea" rows={3} name="memo" value={form.memo} onChange={onChange} disabled={disabled} />
          </Col>
        </Row>

        {!readOnly && (
          <div className="d-flex justify-content-end mt-3">
            <Button type="submit" variant="primary">저장</Button>
          </div>
        )}
      </Form>

      {/* 🔹 회원 검색 모달 (중첩 모달) */}
      <MemberSearchModal
        show={showMemberModal}
        onHide={() => setShowMemberModal(false)}
        onSelect={handlePickMember}
        // 필요시: enforceFocus를 끄고 싶다면 MemberSearchModal에서 Modal props 받아서 전달하도록 확장
        // enforceFocus={false}
      />
    </>
  );
}







/* ============================================================= */
/* 휴가 탭 */
function VacationTab({ empNum, empName, onSaved, editData, selectedDate, readOnly=false }) {
  const disabled = readOnly;

  const [form, setForm] = useState({
    empNum: empNum || "",
    registrant: empName || "",
    startDate: selectedDate || "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    if (empNum && empName) setForm((prev) => ({ ...prev, empNum, registrant: empName }));
    if (editData && editData.codeBid === "VACATION") {
      setForm({
        empNum: editData.empNum || empNum,
        registrant: editData.empName || empName,
        startDate: editData.startTime?.slice(0, 10) || "",
        endDate: editData.endTime?.slice(0, 10) || "",
        reason: editData.memo || "",
      });
    }
  }, [empNum, empName, editData, selectedDate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    if (!form.startDate || !form.endDate) {
      alert("휴가 시작일/종료일을 선택하세요.");
      return;
    }
    if (form.endDate < form.startDate) {
      alert("종료일이 시작일보다 빠를 수 없습니다.");
      return;
    }

    const payload = {
      shNum: editData?.shNum,
      empNum: form.empNum,
      codeBid: "VACATION",
      startTime: `${form.startDate}T00:00`,
      endTime: `${form.endDate}T23:59`,
      memo: form.reason,
    };

    try {
      setSaving(true);
      if (editData && editData.codeBid === "VACATION") {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("휴가 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("휴가 일정이 등록되었습니다.");
      }
      onSaved?.(payload);
    } catch (err) {
      console.error("휴가 일정 등록 실패:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      const msg = (typeof data === "string" ? data : data?.message) || err.message || "";
      const existing = typeof data === "object" ? data?.detail?.existing?.[0] : undefined;

      if (status === 409 || /휴가|겹치/i.test(msg)) {
        if (existing?.start && existing?.end) {
          const s = String(existing.start).slice(0, 10);
          const e = String(existing.end).slice(0, 10);
          alert(`선택한 기간이 기존 휴가(${s} ~ ${e})와 겹칩니다.\n휴가는 하루에 1건만 등록할 수 있습니다.`);
        } else {
          alert("휴가는 하루에 1건만 등록할 수 있습니다.");
        }
        return;
      }
      alert(msg || "등록/수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">

        {/* 1줄: 등록자 */}
        <Col md={6}>
          <Form.Label className="fw-bold">등록자</Form.Label>
          <Form.Control name="registrant" value={form.registrant} readOnly />
        </Col>
        <Col md={6} /> {/* 자리 맞춤 (필요 없으면 다른 필드 배치) */}

        {/* 2줄: 시작일 / 종료일 */}
        <Col md={6}>
          <Form.Label className="fw-bold">시작일</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            disabled={disabled}
          />
        </Col>

        <Col md={6}>
          <Form.Label className="fw-bold">종료일</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            disabled={disabled}
          />
        </Col>

        {/* 3줄: 사유(=메모 자리) 풀폭 */}
        <Col md={12}>
          <Form.Label className="fw-bold">사유</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}                           // PT/기타 메모와 동일 높이 권장
            name="reason"
            value={form.reason}
            onChange={onChange}
            placeholder="휴가 사유를 입력하세요"
            disabled={disabled}
          />
        </Col>
      </Row>

      {/* 저장 버튼: 조회 모드에서는 숨김 */}
      {!readOnly && (
        <div className="d-flex justify-content-end mt-3">
          <Button type="submit" variant="primary" disabled={saving}>
            저장
          </Button>
        </div>
      )}
    </Form>
  );
}

/* ============================================================= */
/* 기타 탭 */
function EtcTab({ empNum, empName, onSaved, editData, selectedDate, readOnly=false }) {
  const disabled = readOnly;

  const [scheduleCodes, setScheduleCodes] = useState([]);
  const [form, setForm] = useState({
    empNum: empNum || "",
    registrant: empName || "",
    category: "",
    startDate: selectedDate || "",
    endDate: "",
    memo: "",
  });

  useEffect(() => {
    if (empNum && empName) setForm((prev) => ({ ...prev, empNum, registrant: empName }));
    if (editData && editData.codeBid?.startsWith("ETC")) {
      setForm({
        empNum: editData.empNum || empNum,
        registrant: editData.empName || empName,
        category: editData.codeBid || "",
        startDate: editData.startTime?.slice(0, 10) || "",
        endDate: editData.endTime?.slice(0, 10) || "",
        memo: editData.memo || "",
      });
    }

    axios
      .get("http://localhost:9000/v1/schedule-types")
      .then((res) => {
        const nameMap = {
          "ETC-COMPETITION": "대회",
          "ETC-COUNSEL": "상담",
          "ETC-MEETING": "회의",
        };
        const etc = res.data
          .filter((c) => c.codeBId.startsWith("ETC"))
          .map((c) => ({ ...c, displayName: nameMap[c.codeBId] || c.codeBName || c.codeBId }));
        setScheduleCodes(etc);
      })
      .catch((err) => console.error("일정유형 코드 불러오기 실패:", err));
  }, [empNum, empName, editData, selectedDate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    const payload = {
      shNum: editData?.shNum,
      empNum: form.empNum,
      codeBid: form.category,
      startTime: `${form.startDate}T00:00`,
      endTime: `${form.endDate}T23:59`,
      memo: form.memo,
    };

    try {
      if (editData && editData.codeBid?.startsWith("ETC")) {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("기타 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("기타 일정이 등록되었습니다.");
      }
      onSaved?.(payload);
    } catch (err) {
      console.error("기타 일정 등록 실패:", err);
      alert("등록/수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label className="fw-bold">등록자</Form.Label>
          <Form.Control name="registrant" value={form.registrant} readOnly />
        </Col>
        <Col md={6}>
          <Form.Label className="fw-bold">일정유형</Form.Label>
          <Form.Select name="category" value={form.category} onChange={onChange} disabled={disabled}>
            <option value="">선택</option>
            {scheduleCodes.map((c) => (
              <option key={c.codeBId} value={c.codeBId}>{c.displayName}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label className="fw-bold">시작일</Form.Label>
          <Form.Control type="date" name="startDate" value={form.startDate} onChange={onChange} disabled={disabled} />
        </Col>
        <Col md={6}>
          <Form.Label className="fw-bold">종료일</Form.Label>
          <Form.Control type="date" name="endDate" value={form.endDate} onChange={onChange} disabled={disabled} />
        </Col>
        <Col md={12}>
          <Form.Label className="fw-bold">메모</Form.Label>
          <Form.Control as="textarea" rows={3} name="memo" value={form.memo} onChange={onChange} disabled={disabled} />
        </Col>
      </Row>

      {/* 저장 버튼: 조회 모드에서는 숨김 */}
      {!readOnly && (
        <div className="d-flex justify-content-end mt-3">
          <Button type="submit" variant="primary">
            저장
          </Button>
        </div>
      )}
    </Form>
  );
}
