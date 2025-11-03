import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function SalesServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    serviceName: "",
    serviceType: "",
    memNum: "",
    empNum: "",
    baseCount: "",
    actualCount: "",
    baseAmount: "",
    discount: "",
    actualAmount: "",
    createdAt: "",
    updatedAt: "",
  });

  // 숫자 포맷 함수
  const formatNumber = (value) =>
    value === null || value === ""
      ? ""
      : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ✅ 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/v1/sales/services/${id}`);
        const today = new Date().toISOString().slice(0, 10);
        const data = { ...res.data, updatedAt: today };
        setForm(data);
      } catch (err) {
        console.error(err);
        alert("데이터 조회 중 오류가 발생했습니다.");
      }
    };
    fetchData();
  }, [id]);

  // ✅ 버튼 이벤트
  const handleEdit = () => navigate(`/sales/services/${id}/edit`);

  const handleConfirm = () => navigate("/sales/services");

  const handleDelete = () => {
    // 1️⃣ 삭제 확인 메시지
    const confirmed = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmed) return;

    // 2️⃣ 실제 삭제 처리 (지금은 테스트용)
    alert(`${id}번 판매내역이 삭제되었습니다.`);

    // 3️⃣ 목록 페이지로 이동
    navigate("/sales/services");
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      {/* 제목 */}
      <h4 className="fw-bold mb-5 text-start">
        {id}번 서비스 판매 내역 조회
      </h4>

      {/* =====================
          [1] 테이블 컨테이너
      ====================== */}
      <form className="border rounded-4 shadow-sm overflow-hidden">
        <table className="table table-striped m-0 align-middle text-center">
          <tbody>
            {/* [1] 상품명 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle" style={{ width: "30%" }}>
                상품명
              </th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.serviceName}
                  readOnly
                />
              </td>
            </tr>

            {/* [2] 구분 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">구분</th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="serviceType"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.serviceType}
                  readOnly
                />
              </td>
            </tr>

            {/* [3] 회원 ID */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">회원 ID</th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="memNum"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.memNum}
                  readOnly
                />
              </td>
            </tr>

            {/* [4] 판매자 ID */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">판매자 ID</th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="empNum"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.empNum}
                  readOnly
                />
              </td>
            </tr>

            {/* [5] 횟수/일수 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">횟수/일수</th>
              <td className="bg-light align-middle">
                <input
                  type="number"
                  name="baseCount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.baseCount}
                  readOnly
                />
              </td>
            </tr>

            {/* [6] 실제 횟수/일수 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">실제 횟수/일수</th>
              <td className="bg-light align-middle">
                <input
                  type="number"
                  name="actualCount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.actualCount}
                  readOnly
                />
              </td>
            </tr>

            {/* [7] 총액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">총액</th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="baseAmount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={formatNumber(form.baseAmount)}
                  readOnly
                />
              </td>
            </tr>

            {/* [8] 할인금액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">할인금액</th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="discount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={formatNumber(form.discount)}
                  readOnly
                />
              </td>
            </tr>

            {/* [9] 최종금액 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">최종금액</th>
              <td className="bg-light align-middle">
                <input
                  type="text"
                  name="actualAmount"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={formatNumber(form.actualAmount)}
                  readOnly
                />
              </td>
            </tr>

            {/* [10] 등록일 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">등록일</th>
              <td className="bg-light align-middle">
                <input
                  type="date"
                  name="createdAt"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.createdAt ? form.createdAt.slice(0, 10) : ""}
                  readOnly
                />
              </td>
            </tr>

            {/* [11] 수정일 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">수정일</th>
              <td className="bg-light align-middle">
                <input
                  type="date"
                  name="updatedAt"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.updatedAt ? form.updatedAt.slice(0, 10) : ""}
                  readOnly
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      {/* =====================
          [2] 버튼 컨테이너
      ====================== */}
      <div
        className="d-flex justify-content-center align-items-center mt-4"
        style={{ gap: "20px" }}
      >
        <button
          type="button"
          className="btn btn-primary px-4"
          onClick={handleEdit}
        >
          수정
        </button>

        <button
          type="button"
          className="btn btn-success px-4"
          onClick={handleConfirm}
        >
          확인
        </button>

        <button
          type="button"
          className="btn btn-danger px-4"
          onClick={handleDelete}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default SalesServiceDetail;
