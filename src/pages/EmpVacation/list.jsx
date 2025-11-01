import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";

function EmpVacationList() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState({ empNum: "" });

  useEffect(() => {
    const empNum = params.get("empNum") || "";
    setSearch({ empNum });

    const qs = new URLSearchParams();
    if (empNum) qs.set("empNum", empNum);

    // ✅ 프록시 설정 (/api → 백엔드 /v1로 rewrite)
    fetch(`/api/v1/vacation${qs.toString() ? `?${qs.toString()}` : ""}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error("vacation list error", e);
        setRows([]);
      });
  }, [params]); 

  const handleSearch = () => {
    const qs = new URLSearchParams();
    if (search.empNum) qs.set("empNum", search.empNum);
    navigate(`/vacation?${qs.toString()}`);
  };

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const fmt = (v) => {
    if (!v) return "";
    const d = new Date(v?.time ?? v);
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h1 className="h4 m-0">휴가 목록</h1>
        <NavLink className="btn btn-primary" to="/vacation/new">
          등록
        </NavLink>
      </div>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          name="empNum"
          className="form-control"
          placeholder="직원번호"
          value={search.empNum}
          onChange={handleChange}
        />
        <button className="btn btn-outline-secondary" onClick={handleSearch}>
          검색
        </button>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>vacNum</th>
            <th>empNum</th>
            <th>vacStartedAt</th>
            <th>vacEndedAt</th>
            <th>vacContent</th>
            <th>vacState</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.vacNum}>
              <td>{r.vacNum}</td>
              <td>{r.empNum}</td>
              <td>{fmt(r.vacStartedAt)}</td>
              <td>{fmt(r.vacEndedAt)}</td>
              <td>{r.vacContent}</td>
              <td>{r.vacState}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">
                데이터 없음
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default EmpVacationList;
