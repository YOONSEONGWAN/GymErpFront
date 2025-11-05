// src/pages/Sales/SalesItemDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Form, InputGroup, Button, Alert, Spinner, Card } from "react-bootstrap";
import axios from "axios";
import SalesItemSearchModal from "../../components/SalesItemSearchModal"; // ⬅️ 기존 상품검색 모달 사용

const API_BASE = "http://localhost:9000";
const DETAIL_API  = (id) => `${API_BASE}/v1/sales/products/${id}`;
const UPDATE_API  = (id) => `${API_BASE}/v1/sales/products/${id}`;
const DELETE_API  = (id) => `${API_BASE}/v1/sales/products/${id}`; // 필요 시 경로만 바꾸면 됨

export default function SalesItemDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();

  // ID 우선순위: navigate state > URL param > ?id=
  const stateId = location.state?.itemId;
  const queryId = searchParams.get("id");
  const itemId  = stateId ?? paramId ?? queryId ?? null;

  // 기본은 조회 모드
  const [mode, setMode] = useState("view"); // 'view' | 'edit'
  const readOnly = mode === "view";

  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const [form, setForm] = useState({
    itemSalesId: "",
    productId: null,
    productName: "",
    productType: "",
    quantity: 1,
    unitPrice: 0,
  });

  const [productModalOpen, setProductModalOpen] = useState(false);

  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const totalAmount = useMemo(() => {
    const q = Number(form.quantity || 0);
    const u = Number(form.unitPrice || 0);
    return q * u;
  }, [form.quantity, form.unitPrice]);

  const numFmt = (v) => Number(v || 0).toLocaleString();

  // 상세 조회
  useEffect(() => {
    if (!itemId) {
      setErr("상세를 표시할 항목 ID가 없습니다.");
      return;
    }
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const { data } = await axios.get(DETAIL_API(itemId));
        setForm({
          itemSalesId: data.itemSalesId,
          productId: data.productId,
          productName: data.productName,
          productType: data.productType,
          quantity: data.quantity ?? 1,
          unitPrice: data.unitPrice ?? 0,
        });
      } catch (e) {
        console.error("상세 조회 실패:", e);
        setErr(e?.response?.data?.message || `상세 조회에 실패했습니다. (Error: ${e.response?.status || e.message})`);
      } finally {
        setLoading(false);
      }
    })();
  }, [itemId]);

  const handleSave = async () => {
    if (readOnly) return;
    if (!form.productId || !form.productName) return setErr("상품을 선택하세요.");
    if (form.quantity < 0) return setErr("수량은 0 이상이어야 합니다.");
    if (form.unitPrice < 0) return setErr("단가는 0 이상이어야 합니다.");

    setSaving(true);
    setErr("");
    try {
      const payload = { ...form, totalAmount };
      await axios.put(UPDATE_API(form.itemSalesId || itemId), payload);
      setMode("view"); // 저장 후 조회모드
    } catch (e) {
      console.error("저장 실패:", e);
      setErr(e?.response?.data?.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemId) return;
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await axios.delete(DELETE_API(itemId));
      alert("판매 내역이 삭제되었습니다.");
      navigate(-1);
    } catch (e) {
      console.error("삭제 실패:", e);
      alert(e?.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  // 상품명 영역 클릭 시 검색 (편의상 '수정 모드'에서만 열림)
  const openProductSearch = () => {
    if (readOnly) return;
    setProductModalOpen(true);
  };

  return (
    <Container className="py-4">
      {/* 상단: 제목 + 뒤로 */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">상품 판매 {readOnly ? "상세 (실물 상품)" : "수정 (실물 상품)"}</h3>
        {/* <Button variant="outline-secondary" onClick={() => navigate(-1)}>← 뒤로</Button> */}
      </div>

      {err && <Alert variant="danger" className="mb-3">{err}</Alert>}

      <Card className="rounded-4 shadow-sm overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {/* 1) 상품명 (텍스트/돋보기 클릭 시 검색) */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  상품명
                </Col>
                <Col md={9} className="bg-light d-flex align-items-center px-3 py-3">
                  <InputGroup>
                    <Form.Control
                      value={form.productName}
                      placeholder="상품명"
                      onChange={(e) => patch("productName", e.target.value)}
                      onClick={openProductSearch}
                      readOnly={readOnly} // 조회 모드에선 입력 불가지만 클릭은 받게 아래 버튼도 제공
                      style={{ cursor: readOnly ? "default" : "pointer" }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={openProductSearch}
                      disabled={readOnly}
                      title="상품 검색"
                    >
                      <i className="bi bi-search" />
                    </Button>
                  </InputGroup>
                </Col>
              </Row>

              {/* 2) 구분 */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  구분
                </Col>
                <Col md={9} className="bg-light d-flex align-items-center px-3 py-3">
                  <Form.Control
                    value={form.productType}
                    onChange={(e) => patch("productType", e.target.value)}
                    disabled={readOnly}
                  />
                </Col>
              </Row>

              {/* 3) 판매 수량 */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  판매 수량
                </Col>
                <Col md={9} className="bg-light d-flex align-items-center px-3 py-3">
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) => patch("quantity", Number(e.target.value || 0))}
                    disabled={readOnly}
                  />
                </Col>
              </Row>

              {/* 4) 단가(원) */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  단가 (원)
                </Col>
                <Col md={9} className="bg-light d-flex align-items-center px-3 py-3">
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.unitPrice}
                    onChange={(e) => patch("unitPrice", Number(e.target.value || 0))}
                    disabled={readOnly}
                  />
                </Col>
              </Row>

              {/* 5) 총액(원) */}
              <Row className="g-0">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  총액 (원)
                </Col>
                <Col md={9} className="bg-light d-flex align-items-center px-3 py-3">
                  <Form.Control value={numFmt(totalAmount)} readOnly />
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      {/* 하단 액션 바 */}
      <div className="d-flex justify-content-center gap-2 mt-3">
        {readOnly ? (
          <>
            <Button variant="primary" onClick={() => setMode("edit")} disabled={!itemId}>
              수정
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              확인
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setMode("view")} disabled={saving}>
              수정취소
            </Button>
            <Button variant="success" onClick={handleSave} disabled={saving || loading}>
              {saving ? "저장 중..." : "저장"}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={saving || loading}>
              삭제
            </Button>
          </>
        )}
      </div>

      {/* 상품 검색 모달 (수정 모드에서만) */}
      <SalesItemSearchModal
        show={productModalOpen}
        onHide={() => setProductModalOpen(false)}
        onExited={() => {}}
        onSelect={(p) => {
          // 모달에서 선택 시 폼 반영
          setForm((f) => ({
            ...f,
            productId: p.productId,
            productName: p.name,
            productType: p.codeBId || "PRODUCT",
            unitPrice: p.price ?? f.unitPrice,
          }));
          setProductModalOpen(false);
        }}
      />
    </Container>
  );
}
