import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import MemberModal from "../components/MemberModal";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

function MemberList() {
  const [rawList, setRawList] = useState([]); // 서버에서 받은 전체/검색 결과
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all"); // SearchBar와 인터페이스 맞춤
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const location = useLocation();
  const navigate = useNavigate();

  const totalPage = useMemo(() => Math.max(1, Math.ceil(rawList.length / pageSize)), [rawList, pageSize]);
  const pageList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rawList.slice(start, start + pageSize);
  }, [rawList, page, pageSize]);

  const fetchAll = async () => {
    const res = await axios.get("http://localhost:9000/v1/member"); // 전체 조회
    setRawList(res.data || []);
    setPage(1);
  };

  const fetchSearch = async () => {
    // 서버 검색 엔드포인트 사용 시
    const res = await axios.get("http://localhost:9000/v1/member/search", {
      params: { keyword },
    });
    setRawList(res.data || []);
    setPage(1);
  };

  const loadData = async () => {
    try {
      if (keyword && keyword.trim() !== "") {
        await fetchSearch();
      } else {
        await fetchAll();
      }
    } catch (e) {
      console.error("회원 목록 조회 실패:", e);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // App에서 전달된 상태로 모달 자동 오픈
  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>회원 목록</h2>
        <div className="d-flex align-items-center">
          <SearchBar
            type={type}
            keyword={keyword}
            onTypeChange={setType}
            onKeywordChange={setKeyword}
            onSearch={loadData}
          />
          <button className="btn btn-success ms-3" onClick={() => setIsModalOpen(true)}>
            회원 등록
          </button>
        </div>
      </div>

      <table className="table table-striped text-center">
        <thead className="table-dark">
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>이메일</th>
            <th>연락처</th>
            <th>등록일</th>
            <th>상세보기</th>
          </tr>
        </thead>
        <tbody>
          {pageList.length > 0 ? (
            pageList.map((m) => (
              <tr key={m.memNum}>
                <td>{m.memNum}</td>
                <td>{m.memName}</td>
                <td>{m.memEmail}</td>
                <td>{m.memPhone}</td>
                <td>{m.memCreated?.slice?.(0, 10) || "-"}</td>
                <td>
                  <button
                    className="btn btn-link text-dark"
                    onClick={() => navigate(`/member/${m.memNum}`)}
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">회원 데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />

      <MemberModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

export default MemberList;
