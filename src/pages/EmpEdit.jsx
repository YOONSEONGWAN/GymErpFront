import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSave, FaArrowLeft } from "react-icons/fa";

function EmpEdit() {
  const { empNum } = useParams();
  const [emp, setEmp] = useState({
    empName: "",
    gender: "",
    empAddress: "",
    empBirth: "",
    empPhone: "",
    empEmail: "",
    hireDate: "",
    fireDate: "",
    empMemo: "",
  });
  const navigate = useNavigate();

  // 직원 기존 데이터 불러오기
  useEffect(() => {
    axios
      .get(`http://localhost:9000/v1/emp/${empNum}`)
      .then((res) => setEmp(res.data))
      .catch((err) => console.error("직원 상세조회 실패:", err));
  }, [empNum]);

  // 값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmp((prev) => ({ ...prev, [name]: value }));
  };

  // 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:9000/v1/emp/${empNum}`, emp);
      alert("직원 정보가 수정되었습니다.");
      navigate(`/emp/${empNum}`); // 수정 후 상세 페이지로 이동
    } catch (error) {
      console.error("직원 수정 실패:", error);
      alert("직원 수정에 실패했습니다.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <div className="card shadow-sm rounded-4 p-4 border-0">
        <h3 className="fw-bold mb-4 text-primary">직원 정보 수정</h3>

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">이름</label>
              <input
                type="text"
                name="empName"
                value={emp.empName || ""}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">성별</label>
              <select
                name="gender"
                value={emp.gender || ""}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">선택</option>
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">주소</label>
            <input
              type="text"
              name="empAddress"
              value={emp.empAddress || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">생년월일</label>
              <input
                type="date"
                name="empBirth"
                value={emp.empBirth || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">연락처</label>
              <input
                type="text"
                name="empPhone"
                value={emp.empPhone || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">이메일</label>
            <input
              type="email"
              name="empEmail"
              value={emp.empEmail || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">입사일</label>
              <input
                type="date"
                name="hireDate"
                value={emp.hireDate || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">퇴사일</label>
              <input
                type="date"
                name="fireDate"
                value={emp.fireDate || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">메모</label>
            <textarea
              name="empMemo"
              value={emp.empMemo || ""}
              onChange={handleChange}
              className="form-control"
              rows="3"
            ></textarea>
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary d-flex align-items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft /> 돌아가기
            </button>
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center gap-2"
            >
              <FaSave /> 수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmpEdit;
