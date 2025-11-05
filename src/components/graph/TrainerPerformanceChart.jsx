// src/components/Graph/TrainerPerformanceChart.jsx
import React, { useState } from "react";
import ChartWrapper from "./ChartWrapper";
import ChartFilterBar from "./ChartFilterBar";

function TrainerPerformanceChart() {
  // ✅ 필터 상태 (기간 + 트레이너 선택)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    empId: "",
  });

  return (
    <div>
      {/* 🔹 필터바 (기간 + 직원 선택 모달 예정) */}
      <ChartFilterBar
        type="trainer"
        filters={filters}
        setFilters={setFilters}
      />

      {/* 🔹 그래프 */}
      <ChartWrapper
        title="트레이너 실적 그래프"
        apiUrl="/v1/analytics/trainer/performance"
        defaultType="bar"
        filters={filters}
      />
    </div>
  );
}

export default TrainerPerformanceChart;
