import { useEffect, useState } from "react";
import { Modal, Button, Table, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import Pagination from "./Pagination.jsx";

/**
 * 👥 MemberSearchModal.jsx
 * -------------------------------------------------
 * PT 일정 등록 시 회원 선택 모달
 * - 이름 검색 가능
 * - 페이지네이션 적용
 * - 회원 선택 시 부모 컴포넌트로 전달
 */
export default function MemberSearchModal({ show, onHide, onSelect }) {
  const [members, setMembers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 10;

  /** 📞 연락처 포맷 */
  const formatPhone = (phone) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, ""); // 숫자만 남김
    return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  };

  /** ✅ 회원 목록 불러오기 */
  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:9000/v1/member");
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ 회원 목록 불러오기 실패:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  /** 🔄 모달 열릴 때 초기화 */
  useEffect(() => {
    if (show) {
      loadMembers();
      setKeyword("");
      setPage(1);
    }
  }, [show]);

  /** 🔍 검색 필터 */
  const filtered = members.filter((m) =>
    (m.memName || "").toLowerCase().includes(keyword.toLowerCase())
  );

  /** 📄 페이지네이션 계산 */
  const indexOfLast = page * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPage = Math.ceil(filtered.length / perPage);

  /** ✅ 회원 선택 시 부모로 전달 */
  const handleSelect = (m) => {
    onSelect(m);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>👥 회원 검색</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* 🔍 검색창 */}
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="이름 또는 이메일 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
        </InputGroup>

        {/* 📋 회원 목록 */}
        <Table bordered hover responsive>
          <thead className="table-light text-center align-middle">
            <tr>
              <th>회원명</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">
                  ⏳ 회원 목록을 불러오는 중입니다...
                </td>
              </tr>
            ) : current.length ? (
              current.map((m) => (
                <tr key={m.memNum} className="align-middle">
                  <td>{m.memName}</td>
                  <td>{formatPhone(m.memPhone)}</td>
                  <td>{m.memEmail}</td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleSelect(m)}
                    >
                      선택
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* 📑 페이지네이션 */}
        {totalPage > 1 && (
          <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
