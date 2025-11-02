// src/pages/EmpAttendance/admin.jsx
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, InputGroup, Table } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

// 전체조회 프로토타입
// const fetchAll = () => {
//   setLoading(true);
//   setError("");
//   fetch(`/api/v1/attendance`)
//     .then(async (res) => {
//       if (!res.ok) throw new Error((await res.text()) || "전체 목록 조회 실패");
//       return res.json();
//     })
//     .then((data) => setRows(Array.isArray(data) ? data : []))
//     .catch((e) => setError(e.message || "에러"))
//     .finally(() => setLoading(false));
// };

// 사번 검색 프로토타입
// const fetchByEmp = (n) => {
//   if (!n) return fetchAll();
//   setLoading(true);
//   setError("");
//   const qs = new URLSearchParams();
//   qs.set("empNum", n);
//   fetch(`/api/v1/attendance?${qs.toString()}`)
//     .then(async (res) => {
//       if (!res.ok) throw new Error((await res.text()) || "직원별 목록 조회 실패");
//       return res.json();
//     })
//     .then((data) => setRows(Array.isArray(data) ? data : []))
//     .catch((e) => setError(e.message || "에러"))
//     .finally(() => setLoading(false));
// };

function EmpAttendanceView() {
  const [params, setParams] = useSearchParams();

  // 입력은 "이름 또는 사번" 하나로
  const [keyword, setKeyword] = useState(params.get("q") || params.get("empNum") || "");

  const [rows, setRows] = useState([]);      // 화면 표시용(필터 반영)
  const [allRows, setAllRows] = useState([]); // 전체 데이터(이름검색용 필터 소스)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // empNum -> empName 캐시
  const [nameMap, setNameMap] = useState({}); // { "3": "홍길동", ... }

  const fmtTime = (s) => (s ? s.replace("T", " ").slice(0, 19) : "");
  const fmtDur = (sec) => {
    if (sec == null) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // empNum들 이름 캐싱
  const ensureNames = async (list) => {
    const need = Array.from(
      new Set(
        (list || [])
          .map((r) => r.empNum)
          .filter((n) => n != null && nameMap[String(n)] == null)
      )
    );
    if (need.length === 0) return;

    const results = await Promise.allSettled(need.map((n) => axios.get(`/api/v1/emp/${n}`)));
    const next = { ...nameMap };
    results.forEach((res, i) => {
      const n = String(need[i]);
      if (res.status === "fulfilled") {
        const dto = res.value.data;
        next[n] = dto?.name ?? dto?.empName ?? `(emp ${n})`;
      } else {
        next[n] = `(emp ${n})`;
      }
    });
    setNameMap(next);
  };

  // 전체 조회(이름검색시 소스가 됨)
  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/v1/attendance");
      const list = Array.isArray(data) ? data : [];
      setAllRows(list);
      setRows(list);
      await ensureNames(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "전체목록 조회 실패");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // 사번 검색(API로)
  const fetchByEmp = async (empNum) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/v1/attendance", { params: { empNum } });
      const list = Array.isArray(res.data) ? res.data : [];
      setAllRows(list); // 이름검색 전환 시에도 기반이 되도록
      setRows(list);
      await ensureNames(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "직원별 목록 조회 실패");
      setAllRows([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // URL 변화에 반응: q(키워드) 또는 empNum(숫자) 지원
  useEffect(() => {
    const q = params.get("q") || "";
    const n = params.get("empNum") || "";
    setKeyword(q || n || "");

    // 숫자만 -> 사번 검색
    if (n || (/^\d+$/.test(q) && q !== "")) {
      const num = n || q;
      fetchByEmp(num);
    } else if (q) {
      // 이름검색: 전체 불러오고 클라이언트 필터
      (async () => {
        await fetchAll();
        // ensureNames가 끝나야 이름 필터 가능하므로 약간 지연 적용
        setTimeout(() => {
          setRows((prev) =>
            prev.filter((r) => {
              const name = nameMap[String(r.empNum)];
              return (name || "").toLowerCase().includes(q.toLowerCase());
            })
          );
        }, 0);
      })();
    } else {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // 검색 버튼: 숫자면 empNum 파라미터, 아니면 q 파라미터 사용
  const handleSearch = () => {
    const next = new URLSearchParams(params);
    const trimmed = (keyword || "").trim();
    if (!trimmed) {
      next.delete("q");
      next.delete("empNum");
    } else if (/^\d+$/.test(trimmed)) {
      next.set("empNum", trimmed);
      next.delete("q");
    } else {
      next.set("q", trimmed);
      next.delete("empNum");
    }
    setParams(next, { replace: true });
  };

  // 전체 버튼
  const handleReset = () => {
    setKeyword("");
    const next = new URLSearchParams(params);
    next.delete("q");
    next.delete("empNum");
    setParams(next, { replace: true });
  };

  const openCount = useMemo(
    () =>
      rows.filter(
        (r) => (r.checkOut == null || r.checkOut === "") && (r.checkIn || r.startedAt)
      ).length,
    [rows]
  );

  return (
    <>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible className="mt-3">
          {error}
        </Alert>
      )}

      <div className="d-flex align-items-center mt-3 mb-2">
        <h1 className="me-3 mb-0">직원 출퇴근(조회)</h1>
        <span className="badge text-bg-secondary">전체 {rows.length}건</span>
        <span className="badge text-bg-warning ms-2">미퇴근 {openCount}명</span>
      </div>

      {/* 검색 영역: 이름 또는 사번 */}
      <InputGroup className="my-3" style={{ maxWidth: 420 }}>
        <Form.Control
          placeholder="이름 또는 사번으로 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button variant="primary" onClick={handleSearch} disabled={loading}>
          검색
        </Button>
        <Button variant="outline-secondary" onClick={handleReset} disabled={loading}>
          전체
        </Button>
      </InputGroup>

      {/* 목록 테이블 */}
      <Table bordered hover size="sm" className="align-middle">
        <thead>
          <tr>
            <th style={{ width: 90 }}>attNum</th>
            <th style={{ width: 160 }}>직원명</th>
            <th style={{ width: 120 }}>일자</th>
            <th>출근</th>
            <th>퇴근</th>
            <th style={{ width: 120 }}>근무시간</th>
            <th style={{ width: 110 }}>상태</th>
            <th style={{ width: 110 }}>액션</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">데이터 없음</td>
            </tr>
          )}
          {rows.map((r) => {
            const attNum = r.attNum ?? r.id;
            const attDate = (r.attDate || r.startedAt || r.checkIn || "").slice(0, 10);
            const started = r.checkIn ?? r.startedAt ?? "";
            const ended = r.checkOut ?? r.endedAt ?? "";
            const duration = r.workHours ?? r.duration ?? r.durationS ?? r.durationSec;
            const status = ended ? (r.attState ?? "DONE") : (r.attState ?? "WORKING");

            const focusThisEmp = () => {
              const v = String(r.empNum);
              const next = new URLSearchParams(params);
              next.set("empNum", v);
              next.delete("q");
              setParams(next, { replace: true }); // → useEffect가 조회
            };

            const empName = nameMap[String(r.empNum)] ?? r.empNum;

            return (
              <tr key={attNum}>
                <td>{attNum}</td>
                <td>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={focusThisEmp}
                    disabled={loading}
                    title={`사번: ${r.empNum}`}
                  >
                    {empName}
                  </Button>
                </td>
                <td>{attDate}</td>
                <td>{fmtTime(started)}</td>
                <td>{ended ? fmtTime(ended) : <span className="text-danger">미퇴근</span>}</td>
                <td>{duration != null ? fmtDur(duration) : ended ? "-" : ""}</td>
                <td>
                  <span
                    className={`badge ${
                      status === "WORKING"
                        ? "text-bg-success"
                        : status === "DONE"
                        ? "text-bg-secondary"
                        : "text-bg-info"
                    }`}
                  >
                    {status}
                  </span>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={focusThisEmp}
                    disabled={loading}
                  >
                    이 직원만
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
export default EmpAttendanceView;
