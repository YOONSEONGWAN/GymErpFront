import { useEffect, useState } from "react";
import { Modal, Button, Table, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import Pagination from "./Pagination.jsx";

/**
 * 👥 MemberSearchModal.jsx
 * PT 탭용 회원 검색 모달
 */
export default function MemberSearchModal({ show, onHide, onSelect }) {
  const [members, setMembers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 10;

  const formatPhone = (phone) => {
    if (!phone) return "";
    return phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:9000/v1/member");
      setMembers(res.data);
    } catch (err) {
      console.error("❌ 회원 목록 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      loadMembers();
      setKeyword("");
      setPage(1);
    }
  }, [show]);

  const filtered = members.filter((m) =>
    (m.memName || "").toLowerCase().includes(keyword.toLowerCase())
  );

  const indexOfLast = page * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPage = Math.ceil(filtered.length / perPage);

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
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="이름 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
        </InputGroup>

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
                  ⏳ 회원 목록을 불러오는 중...
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

        <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
