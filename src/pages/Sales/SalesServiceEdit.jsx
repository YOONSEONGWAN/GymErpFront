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
    empNum: 1, // 테스트용 로그인 직원
    createdAt: "",
    updatedAt: "",
  });

  const [original, setOriginal] = useState({}); // 초기 원본 저장용

  const formatNumber = (value) =>
    value === null || value === ""
      ? ""
      : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const parseNumber = (value) => Number(value.replace(/[^0-9]/g, "")) || 0;

  // ✅ 페이지 진입 시 row 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/v1/sales/services/${id}`);
        const data = {
          ...res.data,
          empNum: 1, // 로그인 직원 테스트용
          updatedAt: new Date().toISOString().slice(0, 10), // 오늘 날짜
        };
        setForm(data);
        setOriginal(data); // ✅ 원본 저장
      } catch (err) {
        console.error(err);
        alert("데이터 조회 중 오류가 발생했습니다.");
      }
    };
    fetchData();
  }, [id]);

  // ✅ 상품 선택 (테스트용)
  const handleSelectService = () => {
    const selected = {
      serviceId: 10,
      serviceName: "PT 20회권",
      serviceType: "PT",
      serviceValue: 20,
      price: 800000,
    };
    setForm((prev) => ({
      ...prev,
      serviceId: selected.serviceId,
      serviceName: selected.serviceName,
      serviceType: selected.serviceType,
      baseCount: selected.serviceValue,
      actualCount: selected.serviceValue,
      baseAmount: selected.price,
      actualAmount: selected.price - prev.discount,
    }));
  };

  // ✅ 회원 선택 (테스트용)
  const handleSelectMember = () => {
    const selected = { memNum: 202 };
    setForm((prev) => ({ ...prev, memNum: selected.memNum }));
  };

  // ✅ 값 변경
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

  // ✅ 수정 완료
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/v1/sales/services/${id}`, form);
      alert(res.data.message || "수정이 완료되었습니다!");
      navigate(`/sales/services/${id}`); // 수정 후 조회 페이지 이동
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h4 className="fw-bold mb-5 text-start">
        {id}번 서비스 판매 내역 수정
      </h4>

      <form
        onSubmit={handleSubmit}
        className="border rounded-4 shadow-sm overflow-hidden mt-4"
      >
        <table className="table table-striped m-0 align-middle text-center">
          <tbody>
            {/* [1] 상품명 */}
            <tr>
              <th
                className="bg-dark text-white text-center align-middle"
                style={{ width: "30%" }}
              >
                상품명
              </th>
              <td className="bg-light align-middle position-relative">
                <div
                  className="d-flex justify-content-center"
                  style={{ width: "340px", margin: "0 auto" }}
                >
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
                    style={{
                      right: "calc(50% - 170px - 45px)",
                      height: "38px",
                    }}
                    onClick={handleSelectService}
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* [2] 구분 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                구분
              </th>
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
              <th className="bg-dark text-white text-center align-middle">
                회원
              </th>
              <td className="bg-light align-middle position-relative">
                <div
                  className="d-flex justify-content-center"
                  style={{ width: "340px", margin: "0 auto" }}
                >
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
                    style={{
                      right: "calc(50% - 170px - 45px)",
                      height: "38px",
                    }}
                    onClick={handleSelectMember}
                  >
                    <FaSearch />
                  </button>
                </div>
              </td>
            </tr>

            {/* [4] 직원 */}
            <tr>
              <th className="bg-dark text-white text-center align-middle">
                직원 ID
              </th>
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
              <th className="bg-dark text-white text-center align-middle">
                횟수/일수
              </th>
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
              <th className="bg-dark text-white text-center align-middle">
                실제 횟수/일수
              </th>
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
              <th className="bg-dark text-white text-center align-middle">
                총액
              </th>
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
              <th className="bg-dark text-white text-center align-middle">
                할인금액
              </th>
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
              <th className="bg-dark text-white text-center align-middle">
                최종금액
              </th>
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
              <th className="bg-dark text-white text-center align-middle">
                등록일
              </th>
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
              <th className="bg-dark text-white text-center align-middle">
                수정일
              </th>
              <td className="bg-light align-middle">
                <input
                  type="date"
                  name="updatedAt"
                  className="form-control text-center mx-auto"
                  style={{ width: "340px" }}
                  value={form.updatedAt}
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
        {/* 🔹 초기값 복원 */}
        <button
          type="button"
          className="btn btn-secondary px-5"
          onClick={() => setForm(original)}
        >
          수정 취소
        </button>

        {/* 🔹 조회 페이지로 이동 */}
        <button
          type="button"
          className="btn btn-success px-5"
          onClick={() => navigate(`/sales/services/${id}`)}
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default SalesServiceEdit;
