// src/pages/PostList.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Pagination from "../components/Pagination";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// 백엔드 응답 스키마 혼용 대비 정규화
function norm(row) {
  return {
    id: row.postId ?? row.id,
    title: row.postTitle ?? row.title ?? "",
    writer: row.postWriter ?? row.writerName ?? "",
    pinned: row.postPinned ?? row.pinned ?? "N",
    viewCnt: row.postViewCnt ?? row.viewCnt ?? 0,
    createdAt: row.postCreatedAt ?? row.createdAt ?? null,
  };
}

export default function PostList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 개발모드 StrictMode 중복 호출 가드
  const loaded = useRef(false);

  // 목록 로드(상단고정 → 최신순 정렬은 서버에서 수행)
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    axios
      .get("http://localhost:9000/v1/post")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data.map(norm) : [];
        setRows(list);
      })
      .catch((err) => {
        console.error("게시글 목록 불러오기 실패:", err);
        alert("목록 불러오기 실패");
      });
  }, []);

  // 검색 필터
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.writer.toLowerCase().includes(q)
    );
  }, [rows, keyword]);

  // 페이지 계산
  const totalPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // 행 클릭 시 상세 이동
  const onRowClick = (id) => () => nav(`/post/${id}`);

  // 날짜 포맷(yyyy-mm-dd까지만)
  const d8 = (s) => (typeof s === "string" ? s.slice(0, 10) : "-");

  return (
    <div className="container py-4">
      {/* 헤더 */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h2 className="m-0">게시판</h2>

        <div className="d-flex align-items-center gap-2">
          {/* 심플 검색바 */}
          <div className="input-group" style={{ minWidth: 280 }}>
            <input
              className="form-control"
              placeholder="검색(제목/작성자)"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            />
            <button className="btn btn-outline-secondary" onClick={() => setPage(1)}>
              <i className="bi bi-search" />
            </button>
          </div>

          <button
            className="btn btn-success w-100"
            style={{ maxWidth: "100px", height: "38px" }}
            onClick={() => nav("/post/new")}
          >
            등록
          </button>
        </div>
      </div>

      {/* 표 */}
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle text-center mb-3">
          <thead className="table-dark sticky-top">
            <tr>
              <th style={{ width: 90 }}>번호</th>
              <th className="text-start">제목</th>
              <th style={{ width: 180 }}>작성자</th>
              <th style={{ width: 140 }}>조회수</th>
              <th style={{ width: 160 }}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {pageList.length > 0 ? (
              pageList.map((v) => (
                <tr
                  key={v.id}
                  onClick={onRowClick(v.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{v.id}</td>
                  <td className="text-start">
                    {v.pinned === "Y" && <span className="me-1">📌</span>}
                    <span
                      className="text-decoration-underline text-primary"
                      onClick={(e) => {
                        e.stopPropagation(); // 행 클릭과 충돌 방지
                        nav(`/post/${v.id}`);
                      }}
                      role="button"
                    >
                      {v.title || "(제목 없음)"}
                    </span>
                  </td>
                  <td>{v.writer}</td>
                  <td>{v.viewCnt}</td>
                  <td>{d8(v.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-muted py-4">
                  게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="d-flex justify-content-center">
        <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
      </div>
    </div>
  );
}
