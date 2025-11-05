// src/components/Graph/TotalSalesChart.jsx
import React, { useState } from "react";
import ChartWrapper from "./ChartWrapper";
import ChartFilterBar from "./ChartFilterBar";

function TotalSalesChart() {
  // ✅ 필터 상태 (ChartFilterBar에서 직접 제어)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categoryType: "", // SERVICE | ITEM | ""
  });

  return (
    <div>
      {/* 🔹 공통 필터바 (기간 + 품목 드롭다운) */}
      <ChartFilterBar
        type="total"              // ✅ 필수 추가
        filters={filters}
        setFilters={setFilters}
      />

      {/* 🔹 그래프 본문 */}
      <ChartWrapper
        title="전체 매출 그래프"
        apiUrl="/v1/analytics/sales/total"
        defaultType="bar"
        filters={filters}
      />
    </div>
  );
}

export default TotalSalesChart;
