// src/components/Graph/ItemSalesChart.jsx
import React, { useState } from "react";
import ChartWrapper from "./ChartWrapper";
import ChartFilterBar from "./ChartFilterBar";

function ItemSalesChart() {
  // ✅ 필터 상태 (기간 + 품목 모달)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categories: [],
  });

  return (
    <div>
      {/* 🔹 필터바 (기간 + 실물 상품 선택 모달 예정) */}
      <ChartFilterBar
        type="item"
        filters={filters}
        setFilters={setFilters}
      />

      {/* 🔹 그래프 */}
      <ChartWrapper
        title="실물 상품 매출 그래프"
        apiUrl="/v1/analytics/sales/item"
        defaultType="bar"
        filters={filters}
      />
    </div>
  );
}

export default ItemSalesChart;
