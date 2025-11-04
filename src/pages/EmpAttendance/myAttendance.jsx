// src/pages/EmpAttendance/myAttendance.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import axios from "axios";

const API = "http://localhost:9000/v1"; // 너가 원하는 방식 그대로

// ---- 유틸 ----
const toYmd = (d) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};
const parse = (s) => {
  if (!s) return null;
  const d = new Date(String(s).trim().replace(" ", "T"));
  return isNaN(d) ? null : d;
};
const fmtTime = (s) => {
  const d = parse(s);
  if (!d) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};
const fmtDur = (sec) => {
  if (sec == null) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
};

export default function EmpAttendanceMy() {
  // 로그인 사번(없어도 목록은 보이되, 버튼은 비활성)
const myEmpNum = (() => {
    // 1) 로그인 때 저장한 sessionStorage "user" 먼저 사용
    const sess = sessionStorage.getItem("user");
    if (sess) {
      try {
       const u = JSON.parse(sess);
       const n = Number(u?.empNum);
        if (Number.isFinite(n) && n > 0) return n;
      } catch {}
    }
   // 2) 없으면 예전 키들도 백업으로 시도
   const n =
      Number(localStorage.getItem("empNum")) ||
     Number(sessionStorage.getItem("empNum"));
   return Number.isFinite(n) && n > 0 ? n : null;
    })();

  const [rows, setRows] = useState([]);
  const [nameMap, setNameMap] = useState({}); // empNum -> empName 캐시
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 날짜 페이지(0=오늘)
  const [pageOffset, setPageOffset] = useState(0);
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + pageOffset);
    return d;
  }, [pageOffset]);
  const ymd = useMemo(() => toYmd(targetDate), [targetDate]);

  // 하루치(전직원) 조회 - 서버가 date 파라미터를 안 받더라도 클라에서 당일만 필터링
  const fetchDaily = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${API}/attendance`);
      const arr = Array.isArray(data) ? data : [];

      // 당일만 남기기
      const onlyDay = arr.filter((r) => {
        const base = r.attDate || r.checkIn || r.startedAt;
        if (!base) return false;
        const d = new Date(String(base).replace(" ", "T"));
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        return m === ymd;
      });

      setRows(onlyDay);
    } catch (e) {
      setRows([]);
      setError(e.response?.data?.message || e.message || "목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [ymd]);

  useEffect(() => {
    fetchDaily();
  }, [fetchDaily]);

  // 직원명 보강(응답에 empName이 없으면, 가능한 경우 개별 조회해서 캐시)
  useEffect(() => {
    const needNums = Array.from(
      new Set(
        rows
          .filter(
            (r) =>
              !r.empName &&
              !(r.employee && r.employee.empName) &&
              !nameMap[String(r.empNum ?? "")] &&
              r.empNum != null
          )
          .map((r) => r.empNum)
      )
    );

    if (needNums.length === 0) return;

    // 아래는 예시: GET /v1/employees/{empNum} 가 {empName: "..."} 또는 전체 Employee 반환한다고 가정.
    // 없으면 조용히 무시(캐치).
    (async () => {
      const next = { ...nameMap };
      await Promise.all(
        needNums.map(async (num) => {
          try {
            const res = await axios.get(`${API}/employees/${num}`);
            const emp = res.data || {};
            const name =
              emp.empName ||
              emp.name ||
              emp.employee?.empName ||
              emp.data?.empName ||
              null;
            if (name) next[String(num)] = String(name);
          } catch {
            // 무시(백엔드에 해당 API 없을 수도 있음)
          }
        })
      );
      setNameMap(next);
    })();
  }, [rows, nameMap]);

  // 오늘 내 미퇴근 레코드 찾기(당일 rows 기준)
  const openToday = useMemo(() => {
    if (pageOffset !== 0) return null;
    if (!myEmpNum) return null;
    return (
      rows
        .filter((r) => r.empNum === myEmpNum)
        .find((r) => {
          const notOut = !r.checkOut && !r.endedAt;
          return !!notOut;
        }) || null
    );
  }, [rows, myEmpNum, pageOffset]);

  // 출근
  const handleCheckIn = async () => {
    if (pageOffset !== 0) return;
    if (!myEmpNum) return setError("내 사번을 확인할 수 없습니다.");
    try {
      setLoading(true);
      setError("");
      // 서버가 dto.empNum을 받는 형태라면 바디로 전달
    await axios.post(`${API}/attendance`, myEmpNum ? { empNum: myEmpNum } : {});
      setMessage("출근 처리했습니다");
      await fetchDaily();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "출근 처리 실패");
    } finally {
      setLoading(false);
    }
  };

  // 퇴근
  const handleCheckOut = async () => {
    if (!openToday) return;
    const attNum = openToday.attNum ?? openToday.id ?? openToday.num;
    if (!attNum) return setError("퇴근 처리용 attNum이 없습니다.");
    try {
      setLoading(true);
      setError("");
      await axios.put(`${API}/attendance/${attNum}/checkout`);
      setMessage("퇴근 처리했습니다");
      await fetchDaily();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "퇴근 처리 실패");
    } finally {
      setLoading(false);
    }
  };

  // 화면용 가공(이름 우선순위: 응답 empName → 응답 employee.empName → 캐시 → 숫자)
  const viewRows = useMemo(
    () =>
      rows
        .map((r) => {
          const cached = nameMap[String(r.empNum ?? "")];
          return {
            ...r,
            _name:
              r.empName ||
              r.employee?.empName ||
              cached ||
              r.name ||
              String(r.empNum ?? ""),
            _start: r.checkIn ?? r.startedAt,
            _end: r.checkOut ?? r.endedAt,
            _dur: r.workHours ?? r.duration ?? r.durationS ?? r.durationSec,
          };
        })
        .sort((a, b) => {
          const n = String(a._name).localeCompare(String(b._name), "ko");
          if (n !== 0) return n;
          const ta = parse(a._start)?.getTime() ?? 0;
          const tb = parse(b._start)?.getTime() ?? 0;
          return ta - tb;
        }),
    [rows, nameMap]
  );

  const goPrev = () => setPageOffset((v) => v - 1);
  const goNext = () => setPageOffset((v) => v + 1);
  const goToday = () => setPageOffset(0);

  return (
    <>
      {message && (
        <Alert
          variant="success"
          onClose={() => setMessage("")}
          dismissible
          className="mt-3"
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError("")}
          dismissible
          className="mt-3"
        >
          {error}
        </Alert>
      )}

      <h1 className="mt-3">출퇴근(하루 단위 · 전직원)</h1>

      {/* 상단 컨트롤 */}
      <div className="my-3 d-flex flex-wrap gap-2 align-items-center">
        <Button
          variant={openToday ? "secondary" : "success"}
          disabled={loading || pageOffset !== 0 || !!openToday}
          onClick={handleCheckIn}
          title={!myEmpNum ? "내 사번이 없어 출근 불가" : ""}
        >
          출근
        </Button>

        <Button
          variant="danger"
          disabled={loading || pageOffset !== 0 || !openToday}
          onClick={handleCheckOut}
          title={!myEmpNum ? "내 사번이 없어 퇴근 불가" : ""}
        >
          퇴근
        </Button>

        <Button variant="outline-secondary" disabled={loading} onClick={fetchDaily}>
          새로고침
        </Button>

        <div className="ms-auto d-flex align-items-center">
          <nav>
            <ul className="pagination mb-0">
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => setPageOffset((v) => v - 7)}
                >
                  &laquo;
                </button>
              </li>
              <li className="page-item">
                <button className="page-link" onClick={goPrev}>
                  &lt;
                </button>
              </li>
              <li className="page-item disabled">
                <span
                  className="page-link fw-semibold"
                  style={{ minWidth: 140, textAlign: "center" }}
                >
                  {ymd}
                </span>
              </li>
              <li className="page-item">
                <button className="page-link" onClick={goNext}>
                  &gt;
                </button>
              </li>
              <li className={`page-item ${pageOffset === 0 ? "disabled" : ""}`}>
                <button className="page-link" onClick={goToday}>
                  오늘
                </button>
              </li>
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => setPageOffset((v) => v + 7)}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* 내 기록 요약(오늘만 표시) */}
      <div className="p-3 border rounded-3 mb-3">
        <div className="fw-semibold mb-2">내 기록 요약 ({ymd})</div>
        {openToday ? (
          <div className="d-flex flex-wrap gap-4">
            <div>
              <span className="text-muted me-2">출근</span>
              {fmtTime(openToday.checkIn || openToday.startedAt)}
            </div>
            <div>
              <span className="text-muted me-2">퇴근</span>
              {openToday.checkOut || openToday.endedAt
                ? fmtTime(openToday.checkOut || openToday.endedAt)
                : "미퇴근"}
            </div>
            <div>
              <span className="text-muted me-2">상태</span>
              <span
                className={`badge ${
                  openToday.checkOut || openToday.endedAt
                    ? "text-bg-secondary"
                    : "text-bg-success"
                }`}
              >
                {openToday.checkOut || openToday.endedAt ? "근무 종료" : "근무 중"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-muted">
            {pageOffset === 0 ? "오늘 내 출근 기록 없음" : "이 날짜의 내 출근 기록 없음"}
          </div>
        )}
      </div>

      {/* 전직원 테이블 */}
      <Table bordered hover size="sm" className="align-middle">
        <thead>
          <tr>
            <th style={{ width: 200 }}>직원명</th>
            <th>출근</th>
            <th>퇴근</th>
            <th style={{ width: 120 }}>근무시간</th>
          </tr>
        </thead>
        <tbody>
          {viewRows.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted py-4">
                데이터 없음
              </td>
            </tr>
          ) : (
            viewRows.map((r) => {
              const key = r.attNum ?? r.id ?? `${r.empNum}-${r._start}-${r._end}`;
              return (
                <tr
                  key={key}
                  className={myEmpNum && r.empNum === myEmpNum ? "table-primary" : ""}
                >
                  <td className="fw-semibold">{r._name}</td>
                  <td>{fmtTime(r._start)}</td>
                  <td>
                    {r._end ? fmtTime(r._end) : <span className="text-danger">미퇴근</span>}
                  </td>
                  <td>{r._dur != null ? fmtDur(r._dur) : r._end ? "-" : ""}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </>
  );
}

export default EmpAttendanceMy;
