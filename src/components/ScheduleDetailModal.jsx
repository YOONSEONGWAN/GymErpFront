import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import axios from "axios";

export default function ScheduleDetailModal({ show, onClose, event, onEdit, onDelete }) {
  // ✅ 훅은 항상 최상단
  const [ptCount, setPtCount] = useState({ total: 0, remain: 0 });
  const [loading, setLoading] = useState(false);

  /** 💪 PT 일정일 경우 남은 횟수 조회 */
  useEffect(() => {
    const fetchPtCount = async () => {
      if (!event?.memNum) return;
      if (event.codeBId !== "B001") return;

      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:9000/schedule/ptCount/${event.memNum}`);
        setPtCount({
          total: res.data.totalCount || 0,
          remain: res.data.remainCount || 0,
        });
      } catch (err) {
        console.error("❌ PT 잔여 횟수 조회 실패:", err);
        setPtCount({ total: 0, remain: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (event) fetchPtCount();
  }, [event]);

  // ✅ 훅 호출이 끝난 다음에 조건부 렌더링
  if (!event) return null;

  /** ✅ 일정 타입 이름 변환 */
  const getTypeName = () => {
    const id = event.codeBId?.toUpperCase() || "";
    const name = event.codeName || "";

    if (id === "B001" || name.includes("PT")) return "PT";
    if (id === "B002" || name.includes("휴가")) return "휴가";
    if (event.etcType === "MEETING") return "회의";
    if (event.etcType === "COUNSEL") return "상담";
    if (event.etcType === "COMPETITION") return "대회";
    return "기타";
  };

  /** 📆 날짜 포맷 */
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "미정";

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>📄 일정 상세 정보</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          <b>📘 종류:</b> {getTypeName()}
        </p>
        <p>
          <b>👤 직원번호:</b> {event.empNum}
        </p>

        {event.memName && (
          <>
            <p>
              <b>💪 회원명:</b> {event.memName}
            </p>
            <p>
              <b>📞 연락처:</b> {event.memPhone}
            </p>
          </>
        )}

        {event.codeBId === "B001" && event.memNum && (
          <p>
            <b>🏋️ PT 잔여 횟수:</b>{" "}
            {loading ? (
              <Spinner size="sm" animation="border" />
            ) : (
              <strong>
                남은 {ptCount.remain}회 / 총 {ptCount.total}회
              </strong>
            )}
          </p>
        )}

        <p>
          <b>🕓 시작:</b> {fmt(event.start)}
        </p>
        <p>
          <b>🕔 종료:</b> {fmt(event.end)}
        </p>
        <p>
          <b>🗒️ 내용:</b> {event.memo || "(내용 없음)"}
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="warning" onClick={() => onEdit(event)}>
          ✏️ 수정
        </Button>
        <Button variant="danger" onClick={() => onDelete(event.id)}>
          🗑️ 삭제
        </Button>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
