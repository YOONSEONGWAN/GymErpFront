import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSave, FaArrowLeft } from "react-icons/fa";

function MemberEdit() {
  const { memNum } = useParams();
  const [mem, setMem] = useState({
    memName: "",
    memGender: "",
    memAddr: "",
    memBirthday: "",
    memPhone: "",
    memEmail: "",
    memNote: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:9000/v1/member/${memNum}`)
      .then((res) => setMem(res.data))
      .catch((err) => console.error("회원 상세조회 실패:", err));
  }, [memNum]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:9000/v1/member/${memNum}`, mem);
      alert("회원 정보가 수정되었습니다.");
      navigate(`/members/${memNum}`);
    } catch (error) {
      console.error("회원 수정 실패:", error);
      alert("회원 수정에 실패했습니다.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <div className="card shadow-sm rounded-4 p-4 border-0">
        <h3 className="fw-bold mb-4 text-primary">회원 정보 수정</h3>

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">이름</label>
              <input
                type="text"
                name="memName"
                value={mem.memName || ""}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">성별</label>
              <select name="memGender" value={mem.memGender || ""} onChange={handleChange} className="form-select">
                <option value="">선택</option>
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">주소</label>
            <input type="text" name="memAddr" value={mem.memAddr || ""} onChange={handleChange} className="form-control" />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">생년월일</label>
              <input
                type="date"
                name="memBirthday"
                value={mem.memBirthday || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">연락처</label>
              <input type="text" name="memPhone" value={mem.memPhone || ""} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">이메일</label>
            <input type="email" name="memEmail" value={mem.memEmail || ""} onChange={handleChange} className="form-control" />
          </div>

          <div className="mb-4">
            <label className="form-label">메모</label>
            <textarea name="memNote" value={mem.memNote || ""} onChange={handleChange} className="form-control" rows="3"></textarea>
          </div>

          <div className="d-flex justify-content-between">
            <button type="button" className="btn btn-secondary d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
              <FaArrowLeft /> 돌아가기
            </button>
            <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
              <FaSave /> 수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberEdit;
