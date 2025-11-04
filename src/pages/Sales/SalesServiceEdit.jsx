// src/pages/Sales/SalesServiceEdit.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

function SalesServiceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    serviceId: "",
    serviceName: "",
    serviceType: "",
    baseCount: 0,
    actualCount: 0,
    baseAmount: 0,
    actualAmount: 0,
    discount: 0,
    memNum: "",
    empNum: "",
    createdAt: "",
    updatedAt: "",
  });

  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 숫자 포맷/파싱
  const formatNumber = (value) =>
    value === null || value === ""
      ? ""
      : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const parseNumber = (value) => Number(value.replace(/[^0-9]/g, "")) || 0;

  // ✅ 초기 데이터 로딩 (SalesServiceDetail과 동일)
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`/v1/sales/services/${id}`);

        const data =
          res?.data?.serviceName !== undefined
            ? res.data
            : res?.data?.data
            ? res.data.data
            : null;

        if (!data) {
          setError("데이터를 불러오지 못했습니다.");
          return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const filled = { ...data, updatedAt: today };
        setForm(filled);
        setOriginal(filled);
      } catch (err) {
        console.error("❌ 데이터 조회 실패:", err);
        setError("데이터 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <h5>데이터를 불러오는 중입니다...</h5>
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        <h5>{error}</h5>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>
    );

  // ✅ 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    const num = parseNumber(value);

    if (name === "discount") {
      const actual = form.baseAmount - num;
      setForm((prev) => ({ ...prev, discount: num, actualAmount: actual }));
    } else if (name === "actualAmount") {
      const discount = form.baseAmount - num;
      setForm((prev) => ({
        ...prev,
        actualAmount: num,
        discount: discount >= 0 ? discount : 0,
      }));
    } else if (name === "actualCount") {
      setForm((prev) => ({ ...prev, actualCount: num }));
    } else {
      setForm((prev) => ({ ...prev, [name]: num }));
    }
  };

  // ✅ 수정 확인
  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/v1/sales/services/${id}`, form);
      alert(res.data.message || "수정이 완료되었습니다!");
      navigate(`/sales/salesservicedetail/${id}`);
    } catch (err) {
      console.error("❌ 수정 오류:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // ✅ 취소 → 수정 없이 상세페이지로 이동
  const handleCancel = () => {
    navigate(`/sales/salesservicedetail/${id}`);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h4 className="fw-bold mb-5 text-start">
        {id}번 서비스 판매 내역 수정
      </h4>

      <form
        onSubmit={handleConfirm}
        className="border rounded-4 shadow-sm overflow-hidden mt-4"
      >
        <table className="table table-striped m-0 align-middle text-center">
          <tbody>
            {/* [1] 상품명 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle" style={{ width: "30%" }}>
                상품명
              </th>
              <td className="bg-light align-middle position-relative">
                <div className="d-flex justify-content-center" style={{ width: "340px", margin: "0 auto" }}>
                  <input
                    type="text"
                    name="serviceName"
                    className="form-control text-center"
                    placeholder="상품 선택"
                    value={form.serviceName}
                    readOnly
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary position-absolute"
                    style={{ right: "calc(50% - 170px - 45px)", height: "38px" }}
                    onClick={() => console.log("상품 선택 모달 예정")}
                  >
                    <FaSearch />
                  </button>
                </div>
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

            {/* [3] 회원 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">회원</th>
              <td className="bg-light align-middle position-relative">
                <div className="d-flex justify-content-center" style={{ width: "340px", margin: "0 auto" }}>
                  <input
                    type="text"
                    name="memNum"
                    className="form-control text-center"
                    placeholder="회원 선택"
                    value={form.memNum}
                    readOnly
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary position-absolute"
                    style={{ right: "calc(50% - 170px - 45px)", height: "38px" }}
                    onClick={() => console.log("회원 선택 모달 예정")}
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* [4] 직원 ID */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">직원 ID</th>
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                />
              </td>
            </tr>

            {/* [10] 등록일 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">등록일</th>
              <td className="bg-light align-middle">
                <input
                  type="date"
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

      {/* ✅ 버튼 컨테이너 */}
      <div
        className="d-flex justify-content-center align-items-center mt-4"
        style={{ gap: "20px" }}
      >
        {/* 🔹 취소 → 상세페이지 이동 */}
        <button type="button" className="btn btn-secondary px-5" onClick={handleCancel}>
          취소
        </button>

        {/* 🔹 수정 확인 */}
        <button type="submit" className="btn btn-primary px-5" onClick={handleConfirm}>
          확인
        </button>
      </div>
    </div>
  );
}

export default SalesServiceEdit;
