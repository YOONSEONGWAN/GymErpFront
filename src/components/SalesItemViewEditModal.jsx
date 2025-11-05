// src/components/SalesItemViewEditModal.jsx
import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

const API_BASE   = "http://localhost:9000";
const DETAIL_API = (id) => `${API_BASE}/v1/sales-items/${id}`;
const UPDATE_API = (id) => `${API_BASE}/v1/sales-items/${id}`;

export default function SalesItemViewEditModal({
  show,
  onHide,
  onExited,
  mode = "create",        // 'create' | 'view' | 'edit'
  itemId,
  onSaved,
  onOpenProductSearch,    // 상품검색 모달 열기 콜백(선택)
}) {
  const readOnly = mode === "view";
  const isCreate = mode === "create";

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

  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const totalAmount = useMemo(() => {
    const q = Number(form.quantity || 0);
    const u = Number(form.unitPrice || 0);
    return q * u;
  }, [form.quantity, form.unitPrice]);

  // 상세 로드
  useEffect(() => {
    if (!show) return;
    setErr("");

    if (itemId && (mode === "view" || mode === "edit")) {
      (async () => {
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
          console.error(e);
          setErr("상세 조회에 실패했습니다.");
        } finally {
          setLoading(false);
        }
      })();
    } else if (isCreate) {
      setForm({
        itemSalesId: "",
        productId: null,
        productName: "",
        productType: "",
        quantity: 1,
        unitPrice: 0,
      });
    }
  }, [show, itemId, mode, isCreate]);

  const numFmt = (v) => Number(v || 0).toLocaleString();

  const handleSave = async () => {
    if (readOnly) return onHide();
    if (!form.productId || !form.productName) return setErr("상품을 선택하세요.");
    if (form.quantity < 0) return setErr("수량은 0 이상이어야 합니다.");
    if (form.unitPrice < 0) return setErr("단가는 0 이상이어야 합니다.");

    setSaving(true);
    setErr("");
    try {
      const payload = { ...form, totalAmount };
      if (isCreate) {
        // 필요 시 POST 엔드포인트 사용
        // await axios.post(`${API_BASE}/v1/sales-items`, payload);
        await axios.put(UPDATE_API(form.itemSalesId || itemId || 0), payload); // 임시
      } else {
        await axios.put(UPDATE_API(form.itemSalesId || itemId), payload);
      }
      onSaved && onSaved();
      onHide();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      onExited={onExited}
      centered
      size="lg"
      backdrop="static"
      keyboard
      unmountOnClose
    >
      <Modal.Header closeButton>
        <Modal.Title>
          상품 판매 {isCreate ? "등록 (실물 상품)" : mode === "edit" ? "수정 (실물 상품)" : "상세 (실물 상품)"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="py-5 text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            {err && <Alert variant="danger" className="py-2">{err}</Alert>}

            {/* 카드 느낌: 라운드 + 그림자 */}
            <div className="rounded-4 shadow-sm overflow-hidden">
              {/* 1) 상품명 + 검색 */}
              <Row className="g-0 border-bottom">
                <Col md={3} className="bg-dark text-white fw-semibold d-flex align-items-center px-3 py-3">
                  상품명
                </Col>
                <Col md={9} className="bg-light d-flex align-items-center px-3 py-3">
                  <InputGroup>
                    <Form.Control
                      value={form.productName}
                      placeholder="상품 선택"
                      onChange={(e) => patch("productName", e.target.value)}
                      disabled={readOnly}
                    />
                    <Button
                      variant="outline-secondary"
                      disabled={readOnly || !onOpenProductSearch}
                      onClick={() =>
                        onOpenProductSearch &&
                        onOpenProductSearch({
                          onSelect: (p) => {
                            patch("productId", p.productId);
                            patch("productName", p.name);
                            patch("productType", p.codeBId || "PRODUCT");
                          },
                        })
                      }
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
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-center">
        {readOnly ? (
          <Button variant="success" onClick={onHide}>닫기</Button>
        ) : (
          <Button variant="success" onClick={handleSave} disabled={saving || loading}>
            {saving ? "저장 중..." : isCreate ? "등록" : "저장"}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
