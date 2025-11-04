import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function PostView() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [dto, setDto] = useState(null);

  // 게시글 상세 조회
  useEffect(() => {
    axios
      .get(`http://localhost:9000/v1/post/${postId}`, { params: { inc: true } })
      .then((res) => setDto(res.data))
      .catch((err) => {
        console.error("게시글 상세 조회 실패:", err);
        alert("상세 조회 실패");
      });
  }, [postId]);

  if (!dto) return <div>로딩중...</div>;

  return (
    <div className="d-grid gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="m-0">
          {dto.postPinned === "Y" && <span className="me-1">📌</span>}
          {dto.postTitle}
        </h3>
        <div className="text-muted small">조회 {dto.postViewCnt}</div>
      </div>

      <div className="text-muted">{dto.postWriter}</div>

      <pre
        className="p-3 bg-light border rounded"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {dto.postContent}
      </pre>

      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-secondary"
          onClick={() => nav(-1)}
        >
          뒤로
        </button>
        <Link className="btn btn-primary" to={`/post/edit/${postId}`}>
          수정
        </Link>
      </div>
    </div>
  );
}
