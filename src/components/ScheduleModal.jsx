import { useState, useEffect } from "react";
import { Modal, Tabs, Tab, Button, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import "./css/ScheduleModal.css";

/* ================= 공통 에러 파서 - 강화판 ================= */
function parseErrorMessages(err) {
  const res = err?.response;
  const status = res?.status;
  const data = res?.data;

  // 서버에서 온 모든 단서 모으기
  const parts = [];
  if (typeof data === "string") parts.push(data);
  if (typeof data === "object" && data) {
    ["message", "error", "code", "errorCode", "detail", "details", "cause", "trace", "path"].forEach((k) => {
      if (data[k]) parts.push(String(data[k]));
    });
  }
  // 에러 객체 문자열/스택까지
  if (err?.message) parts.push(String(err.message));
  if (err?.stack) parts.push(String(err.stack));
  const raw = parts.join(" ").replace(/\s+/g, " ").trim();

  const msgs = [];
  const has = (re) => re.test(raw);

  // 도메인: 회원권/이용권
  if (has(/회원권|이용권|멤버십|membership|pass|ticket|잔여|남은|만료/i)) {
    msgs.push("이 회원은 유효한 회원권이 없습니다. 회원권 등록 후 다시 시도하세요.");
  }

  // 시간/중복
  if (has(/중복|overlap|already|duplicate/i)) {
    msgs.push("해당 시간대에 이미 다른 일정이 존재합니다. 시간을 변경해 주세요.");
  }
  if (has(/시간.*유효|invalid time|start.*after|end.*before/i)) {
    msgs.push("시작/종료 시간이 올바르지 않습니다.");
  }

  // 리소스 없음
  if (has(/member.*not.*found|회원.*없음/i)) msgs.push("선택한 회원을 찾을 수 없습니다.");
  if (has(/emp.*not.*found|직원.*없음|trainer/i)) msgs.push("트레이너 정보를 찾을 수 없습니다.");

  // DB 제약/오라클
  const ora = raw.match(/ORA-\d{5}/);
  if (ora) {
    msgs.push("데이터 제약조건을 위반했습니다. 입력 값을 확인하세요.");
  }

  // HTTP 상태 기본 처리
  if (status === 400 && msgs.length === 0) msgs.push("요청 값이 올바르지 않습니다.");
  if (status === 403) msgs.push("권한이 없습니다.");
  if (status === 404) msgs.push("대상을 찾을 수 없습니다.");
  if (status >= 500 && msgs.length === 0) msgs.push("서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.");

  if (msgs.length === 0) msgs.push("등록에 실패했습니다.");

  return { msgs: [...new Set(msgs)].filter(Boolean), raw };
}

/* ============================================================= */
/* 🧩 메인 ScheduleModal */
export default function ScheduleModal({
  show,
  defaultTab = "pt",
  empNum,
  empName,
  onSaved,
  editData,
  selectedDate,
}) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    if (!editData) return;
    if (editData.codeBid === "VACATION") setTab("vacation");
    else if (editData.codeBid?.startsWith("ETC")) setTab("etc");
    else if (editData.codeBid === "SCHEDULE-PT") setTab("pt");
  }, [editData]);

  const handleSaved = (payload) => {
    console.log("[일정 저장 완료] payload:", payload);
    onSaved?.(payload);
  };

  return (
    <Modal show={show} centered backdrop="static" size="lg">
      <Modal.Header>
        <Modal.Title>일정 관리</Modal.Title>
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
            />
          </Tab>

          <Tab eventKey="vacation" title="휴가">
            <VacationTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
            />
          </Tab>

          <Tab eventKey="etc" title="기타">
            <EtcTab
              empNum={empNum}
              empName={empName}
              onSaved={handleSaved}
              editData={editData}
              selectedDate={selectedDate}
            />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onSaved?.()}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}

/* ============================================================= */
/* PT 탭 */
function PTTab({ empNum, empName, onSaved, editData, selectedDate }) {
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
  const [errors, setErrors] = useState([]);       // 사용자용 메시지
  const [errorRaw, setErrorRaw] = useState("");   // 원문
  const [showRaw, setShowRaw] = useState(false);  // 원문 토글

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
    } else {
      setForm((prev) => ({ ...prev, date: selectedDate || "" }));
    }

    axios
      .get("http://localhost:9000/v1/member")
      .then((res) => setMembers(sortByKoName(res.data)))
      .catch((err) => console.error("❌ 회원 목록 불러오기 실패:", err));
  }, [empNum, empName, editData, selectedDate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setErrorRaw("");
    setShowRaw(false);

    const payload = {
      shNum: editData?.shNum,
      empNum: form.empNum,
      memNum: form.memNum,
      codeBid: "SCHEDULE-PT",
      startTime: `${form.date}T${form.startTime}`,
      endTime: `${form.date}T${form.endTime}`,
      memo: form.memo,
    };
    console.log("[PT payload 확인]", payload);

    try {
      if (editData) {
        await axios.put("http://localhost:9000/v1/schedule/update", payload);
        alert("PT 일정이 수정되었습니다.");
      } else {
        await axios.post("http://localhost:9000/v1/schedule/add", payload);
        alert("PT 일정이 등록되었습니다.");
      }
      onSaved?.(payload);
      //PT 등록 실패 시 메시지 처리용 추가 catch문
    } catch (err) {
      console.error("PT 일정 등록/수정 실패:", err);
      const { msgs, raw } = parseErrorMessages(err);
      setErrors(msgs);
      setErrorRaw(raw);
    }
  };

  const hasMembershipError = errors.some((m) => /회원권/.test(m));
  const hasTimeError = errors.some((m) => /시간|중복/.test(m));

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>회원명</Form.Label>
          <Form.Select
            name="memNum"
            value={form.memNum}
            onChange={onChange}
            className={hasMembershipError ? "is-invalid" : ""}
          >
            <option value="">선택</option>
            {members.map((m) => {
              const rawPhone = m.memPhone ?? m.phone ?? m.tel ?? m.memTel ?? m.mobile ?? "";
              const label = `${m.memName}${rawPhone ? " : " + fmtPhone(rawPhone) : ""}`;
              return (
                <option key={m.memNum} value={m.memNum} title={label}>
                  {label}
                </option>
              );
            })}
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
          <Form.Control
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
            className={hasTimeError ? "is-invalid" : ""}
          />
        </Col>
        <Col md={4}>
          <Form.Label>종료 시간</Form.Label>
          <Form.Control
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={onChange}
            className={hasTimeError ? "is-invalid" : ""}
          />
        </Col>
        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control as="textarea" rows={3} name="memo" value={form.memo} onChange={onChange} />
        </Col>
      </Row>

      {/* 실패 사유 + 자세히 보기 추가함 */}
      {errors.length > 0 && (
        <div className="mt-3">
          {errors.map((m, i) => (
            <div key={i} className="alert alert-danger py-2 mb-2">{m}</div>
          ))}
          {errorRaw && (
            <>
              <div className="text-end">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-muted p-0"
                  onClick={() => setShowRaw((s) => !s)}
                >
                  {showRaw ? "자세히 닫기" : "자세히 보기"}
                </button>
              </div>
              {showRaw && (
                <pre className="mt-2 p-2 bg-light border rounded" style={{ whiteSpace: "pre-wrap" }}>
                  {errorRaw}
                </pre>
              )}
            </>
          )}
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">저장</Button>
      </div>
    </Form>
  );
}

/* ============================================================= */
/* 휴가 탭 */
function VacationTab({ empNum, empName, onSaved, editData, selectedDate }) {
  const [form, setForm] = useState({
    empNum: empNum || "",
    registrant: empName || "",
    startDate: selectedDate || "",
    endDate: "",
    reason: "",
  });
  const [errors, setErrors] = useState([]);
  const [errorRaw, setErrorRaw] = useState("");
  const [showRaw, setShowRaw] = useState(false);

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

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setErrorRaw("");
    setShowRaw(false);

    const payload = {
      shNum: editData?.shNum,
      empNum: form.empNum,
      codeBid: "VACATION",
      startTime: `${form.startDate}T00:00`,
      endTime: `${form.endDate}T23:59`,
      memo: form.reason,
    };
    console.log("[VACATION payload 확인]", payload);

    try {
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
      const { msgs, raw } = parseErrorMessages(err);
      setErrors(msgs);
      setErrorRaw(raw);
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>등록자</Form.Label>
          <Form.Control name="registrant" value={form.registrant} readOnly />
        </Col>
        <Col md={6}>
          <Form.Label>사유</Form.Label>
          <Form.Control as="textarea" rows={2} name="reason" value={form.reason} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>시작일</Form.Label>
          <Form.Control type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>종료일</Form.Label>
          <Form.Control type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </Col>
      </Row>

      {errors.length > 0 && (
        <div className="mt-3">
          {errors.map((m, i) => (
            <div key={i} className="alert alert-danger py-2 mb-2">{m}</div>
          ))}
          {errorRaw && (
            <>
              <div className="text-end">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-muted p-0"
                  onClick={() => setShowRaw((s) => !s)}
                >
                  {showRaw ? "자세히 닫기" : "자세히 보기"}
                </button>
              </div>
              {showRaw && (
                <pre className="mt-2 p-2 bg-light border rounded" style={{ whiteSpace: "pre-wrap" }}>
                  {errorRaw}
                </pre>
              )}
            </>
          )}
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">저장</Button>
      </div>
    </Form>
  );
}

/* ============================================================= */
/* 기타 탭 */
function EtcTab({ empNum, empName, onSaved, editData, selectedDate }) {
  const [scheduleCodes, setScheduleCodes] = useState([]);
  const [form, setForm] = useState({
    empNum: empNum || "",
    registrant: empName || "",
    category: "",
    startDate: selectedDate || "",
    endDate: "",
    memo: "",
  });
  const [errors, setErrors] = useState([]);
  const [errorRaw, setErrorRaw] = useState("");
  const [showRaw, setShowRaw] = useState(false);

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
    setErrors([]);
    setErrorRaw("");
    setShowRaw(false);

    const payload = {
      shNum: editData?.shNum,
      empNum: form.empNum,
      codeBid: form.category,
      startTime: `${form.startDate}T00:00`,
      endTime: `${form.endDate}T23:59`,
      memo: form.memo,
    };
    console.log("[ETC payload 확인]", payload);

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
      const { msgs, raw } = parseErrorMessages(err);
      setErrors(msgs);
      setErrorRaw(raw);
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>등록자</Form.Label>
          <Form.Control name="registrant" value={form.registrant} readOnly />
        </Col>
        <Col md={6}>
          <Form.Label>일정유형</Form.Label>
          <Form.Select name="category" value={form.category} onChange={onChange}>
            <option value="">선택</option>
            {scheduleCodes.map((c) => (
              <option key={c.codeBId} value={c.codeBId}>
                {c.displayName}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>시작일</Form.Label>
          <Form.Control type="date" name="startDate" value={form.startDate} onChange={onChange} />
        </Col>
        <Col md={6}>
          <Form.Label>종료일</Form.Label>
          <Form.Control type="date" name="endDate" value={form.endDate} onChange={onChange} />
        </Col>
        <Col md={12}>
          <Form.Label>메모</Form.Label>
          <Form.Control as="textarea" rows={3} name="memo" value={form.memo} onChange={onChange} />
        </Col>
      </Row>

      {errors.length > 0 && (
        <div className="mt-3">
          {errors.map((m, i) => (
            <div key={i} className="alert alert-danger py-2 mb-2">{m}</div>
          ))}
          {errorRaw && (
            <>
              <div className="text-end">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-muted p-0"
                  onClick={() => setShowRaw((s) => !s)}
                >
                  {showRaw ? "자세히 닫기" : "자세히 보기"}
                </button>
              </div>
              {showRaw && (
                <pre className="mt-2 p-2 bg-light border rounded" style={{ whiteSpace: "pre-wrap" }}>
                  {errorRaw}
                </pre>
              )}
            </>
          )}
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary">저장</Button>
      </div>
    </Form>
  );
}
