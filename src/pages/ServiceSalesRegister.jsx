import React, { useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

function ServiceSalesRegister() {
  // 초기 상태: 모두 빈 값 또는 0
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
    empNum: 1, // 로그인 사용자 (임시 1)
    status: "ACTIVE",
  });

  /** ✅ 상품 선택 버튼 (모달 연결될 자리)
   *  나중에 모달이 완성되면 여기서 선택한 객체를 받아서 setForm으로 채움.
   */
  const handleSelectService = () => {
    // 예시: 모달에서 선택한 서비스 데이터가 들어올 예정
    const selected = {
      serviceId: 3,
      serviceName: "PT 10회권",
      serviceValue: 10,
      price: 500000,
      codeBId: "PT",
    };

    setForm((prev) => ({
      ...prev,
      serviceId: selected.serviceId,
      serviceName: selected.serviceName,
      serviceType: selected.codeBId === "PT" ? "PT" : "VOUCHER",
      baseCount: selected.serviceValue,
      actualCount: selected.serviceValue,
      baseAmount: selected.price,
      actualAmount: selected.price,
    }));
  };

  /** ✅ 회원 선택 버튼 (모달 연결될 자리)
   *  나중에 회원 검색 모달에서 선택 시 setForm으로 memNum 설정.
   */
  const handleSelectMember = () => {
    // 예시: 회원 모달 선택 결과
    const selected = { memNum: 101 };
    setForm((prev) => ({ ...prev, memNum: selected.memNum }));
  };

  /** ✅ 입력 가능한 필드 변경 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** ✅ 등록 요청 */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      serviceId: form.serviceId,
      serviceName: form.serviceName,
      empNum: form.empNum,
      memNum: form.memNum,
      baseCount: form.baseCount,
      actualCount: form.actualCount,
      discount: form.discount,
      baseAmount: form.baseAmount,
      actualAmount: form.actualAmount,
      serviceType: form.serviceType,
      status: "ACTIVE",
    };

    try {
      const res = await axios.post("/api/v1/sales/services", payload);
      alert(res.data.message || "판매 등록 완료!");
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "420px" }}>
      <h4 className="fw-bold mb-4">서비스 판매 등록</h4>

      <form onSubmit={handleSubmit} className="border rounded-4 p-4 shadow-sm bg-white">
        
        {/* [1] 서비스 선택 */}
        <div className="mb-3">
          <label className="form-label">상품명</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              name="serviceName"
              placeholder="서비스 선택"
              value={form.serviceName}
              readOnly
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleSelectService}
            >
              <FaSearch /> {/* 모달 자리 */}
            </button>
          </div>
        </div>

        {/* [2] 구분 */}
        <div className="mb-3">
          <label className="form-label">구분</label>
          <input
            type="text"
            name="serviceType"
            className="form-control bg-light"
            value={form.serviceType}
            readOnly
          />
        </div>

        {/* [3] 회원 선택 */}
        <div className="mb-3">
          <label className="form-label">회원</label>
          <div className="input-group">
            <input
              type="text"
              name="memNum"
              className="form-control"
              placeholder="회원 선택"
              value={form.memNum}
              readOnly
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleSelectMember}
            >
              <FaSearch /> {/* 모달 자리 */}
            </button>
          </div>
        </div>

        {/* [4] 횟수/일수 */}
        <div className="mb-3">
          <label className="form-label">횟수/일수</label>
          <input
            type="number"
            name="baseCount"
            className="form-control bg-light"
            value={form.baseCount}
            readOnly
          />
        </div>

        {/* [5] 실제 횟수/일수 */}
        <div className="mb-3">
          <label className="form-label">실제 횟수/일수</label>
          <input
            type="number"
            name="actualCount"
            className="form-control"
            value={form.actualCount}
            onChange={handleChange}
          />
        </div>

        {/* [6] 총액 */}
        <div className="mb-3">
          <label className="form-label">총액</label>
          <input
            type="number"
            name="baseAmount"
            className="form-control bg-light"
            value={form.baseAmount}
            readOnly
          />
        </div>

        {/* [7] 할인금액 */}
        <div className="mb-3">
          <label className="form-label">할인금액</label>
          <input
            type="number"
            name="discount"
            className="form-control"
            value={form.discount}
            onChange={handleChange}
          />
        </div>

        {/* [8] 최종금액 */}
        <div className="mb-3">
          <label className="form-label">최종금액</label>
          <input
            type="number"
            name="actualAmount"
            className="form-control"
            value={form.actualAmount}
            onChange={handleChange}
          />
        </div>

        {/* [9] 등록 버튼 */}
        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary w-100">
            등록
          </button>
        </div>

      </form>
    </div>
  );
}

export default ServiceSalesRegister;
