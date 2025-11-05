// src/pages/Sales/SalesItemList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../components/Pagination';
import EmpSearchModal from '../../components/EmpSearchModal';
import SalesServiceSearchModal from '../../components/SalesServiceSearchModal';

const API_BASE = 'http://localhost:9000';
const LIST_API = `${API_BASE}/v1/sales/products`;

const normalizeRow = (row, fallbackIndex) => {
  const id   = row.itemSalesId ?? fallbackIndex;
  const qty  = row.quantity ?? 0;
  const unit = row.unitPrice ?? 0;

  return {
    id,
    salesAt: row.createdAt ?? null,
    category: row.productType ?? '-',
    productName: row.productName ?? '-',
    quantity: qty,
    empText: row.empNum ?? '-',
    totalAmount: row.totalAmount ?? unit * qty,
  };
};

const fetchSalesData = async (filter) => {
  const params = {
    page: filter.page,
    size: filter.size,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };
  if (filter.empNum) params.empNum = filter.empNum;
  if (filter.keyword) params.productNameKeyword = filter.keyword;

  const res = await axios.get(LIST_API, { params });

  const pageSize   = Number(res.data?.pageSize ?? filter.size ?? 10);
  const totalCount = Number(res.data?.totalCount ?? 0);
  const list       = Array.isArray(res.data?.list) ? res.data.list : [];

  return {
    list,
    totalPage: Math.max(1, Math.ceil(totalCount / pageSize)),
    pageSize,
    currentPage: Number(res.data?.currentPage ?? filter.page ?? 1),
  };
};

function SalesItemList() {
  const navigate = useNavigate();

  const [salesList, setSalesList] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 검색/필터
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [filterDetails, setFilterDetails] = useState({
    startDate: '',
    endDate: '',
    empNum: ''
  });

  // 직원 모달
  const [empModalOpen, setEmpModalOpen] = useState(false);

  // 서비스 모달(테스트용)
  const [svcModalOpen, setSvcModalOpen] = useState(false);
  const [pickedService, setPickedService] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { list, totalPage } = await fetchSalesData({
        page,
        size: 10,
        keyword,
        ...filterDetails
      });
      const normalized = list.map((row, idx) =>
        normalizeRow(row, list.length - idx)
      );
      setSalesList(normalized);
      setTotalPage(totalPage);
    } catch (e) {
      console.error('판매 내역 조회 실패:', e);
      setSalesList([]);
      setTotalPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, keyword, filterDetails]);

  useEffect(() => {
    load();
  }, [page, filterDetails, load]);

  const handleSearch = () => {
    if (page !== 1) setPage(1);
    else load();
  };

  const handleReset = () => {
    setPage(1);
    setKeyword('');
    setPickedService(null);
    setFilterDetails({ startDate: '', endDate: '', empNum: '' });
  };

  const handleGoToCreate = () => {
    navigate('/sales/salesitemcreate');
  };

  const goToDetail = (id) => {
    navigate('/sales/salesitemdetail', { state: { itemId: id } });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">상품 판매 내역 조회</h2>

      {/* 기준점 설정 */}
      <div className="card-body position-relative">

        <div className="row justify-content-center g-3 align-items-end">

          <div className="col-md-3">
            <label htmlFor="startDate" className="form-label">기간 선택</label>
            <div className="input-group">
              <input
                type="date"
                id="startDate"
                className="form-control"
                value={filterDetails.startDate}
                onChange={(e) =>
                  setFilterDetails((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
              <span className="input-group-text">~</span>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={filterDetails.endDate}
                onChange={(e) =>
                  setFilterDetails((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          {/* 직원 선택 */}
          <div className="col-md-3">
            <label className="form-label">
              직원 <small className="text-muted">(사원번호: {filterDetails.empNum || "전체"})</small>
            </label>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setEmpModalOpen(true)}
              >
                <i className="bi bi-person-fill me-1" />
                직원 선택
              </button>
              {filterDetails.empNum && (
                <button
                  className="btn btn-outline-danger"
                  title="선택 해제"
                  onClick={() => setFilterDetails(prev => ({ ...prev, empNum: '' }))}
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 서비스 선택 (테스트용) */}
          <div className="col-md-4">
            <label className="form-label">서비스 선택 (테스트)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="선택한 서비스명으로 상품명 검색에 채워집니다"
                value={pickedService?.name || pickedService?.serviceName || ''}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSvcModalOpen(true)}
              >
                서비스 선택
              </button>
              {pickedService && (
                <button
                  className="btn btn-outline-danger"
                  title="선택 해제"
                  onClick={() => { setPickedService(null); setKeyword(''); }}
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 상품명 + 검색 버튼 */}
          <div className="col-md-8 mt-2">
            <label className="form-label">품목</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="상품명을 입력하세요"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="btn btn-primary"
              >
                <i className="bi bi-search me-1" />
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 🔘 떠 있는 초기화 버튼 (우측 상단 고정) */}
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn btn-outline-secondary d-flex align-items-center position-absolute end-0"
          style={{
            top: 120,          // ← 높이 조절 (스크린샷처럼 70~90 사이에서 맞춰보세요)
            zIndex: 2
          }}
          title="필터 초기화"
        >
          <i className="bi bi-arrow-counterclockwise me-1" />
          초기화
        </button>

      </div>

      {/* 테이블 */}
      <table className="table table-striped table-hover text-center align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th>판매번호</th>
            <th>판매 일시</th>
            <th>구분</th>
            <th>상품명</th>
            <th>수량</th>
            <th>직원 ID</th>
            <th>총액(단위:원)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr />
          ) : salesList.length > 0 ? (
            salesList.map((item) => (
              <tr
                key={item.id}
                onDoubleClick={() => goToDetail(item.id)}
                style={{ cursor: 'pointer' }}
                title="더블클릭하면 상세 페이지로 이동합니다"
              >
                <td className="text-primary fw-semibold">{item.id}</td>
                <td>{item.salesAt ? new Date(item.salesAt).toLocaleString('ko-KR') : '-'}</td>
                <td className="fw-bold text-primary">{item.category}</td>
                <td className="text-start">{item.productName}</td>
                <td>{Number(item.quantity ?? 0).toLocaleString()}</td>
                <td>{item.empText}</td>
                <td className="fw-bold">{Number(item.totalAmount ?? 0).toLocaleString()}원</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-4 text-muted">조회된 판매 내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 하단: 페이지네이션 + 등록 버튼 */}
      <div className="position-relative mt-3">
        <div className="d-flex justify-content-center">
          <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
        </div>

        <button
          onClick={handleGoToCreate}
          className="btn btn-success position-absolute end-0 top-50 translate-middle-y"
        >
          <i className="bi bi-journal-plus me-1" />
          등록
        </button>
      </div>

      {/* 직원 선택 모달 */}
      <EmpSearchModal
        show={empModalOpen}
        onHide={() => setEmpModalOpen(false)}
        onExited={() => {}}
        onConfirm={(picked) => {
          setFilterDetails(prev => ({ ...prev, empNum: picked.empNum }));
          setPage(1);
        }}
        multi={false}
      />

      {/* 서비스 선택/검색 모달 (테스트용) */}
      <SalesServiceSearchModal
        show={svcModalOpen}
        onHide={() => setSvcModalOpen(false)}
        onExited={() => {}}
        onSelect={(svc) => {
          const name = svc.name || svc.serviceName || '';
          setPickedService(svc);
          setKeyword(name);
          setPage(1);
          setSvcModalOpen(false);
        }}
        // categories={[{ code: "PT", label: "PT" }, { code: "MEMBERSHIP", label: "회원권" }]}
      />
    </div>
  );
}

export default SalesItemList;
