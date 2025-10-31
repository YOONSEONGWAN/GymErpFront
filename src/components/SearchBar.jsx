function SearchBar({ type, keyword, onTypeChange, onKeywordChange, onSearch }) {
  return (
    <div className="d-flex">
      <select
        className="form-select me-2"
        style={{ width: "120px" }}
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <option value="all">전체</option>
        <option value="name">이름</option>
        <option value="phone">연락처</option>
      </select>

      <input
        type="text"
        className="form-control me-2"
        placeholder="검색어 입력..."
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        style={{ width: "200px" }}
      />

      <button className="btn btn-outline-secondary" onClick={onSearch}>
        검색
      </button>
    </div>
  );
}

export default SearchBar;
