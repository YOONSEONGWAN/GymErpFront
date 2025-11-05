// src/components/Graph/AiSalesPredictionChart.jsx
import React from "react";
import ChartWrapper from "./ChartWrapper";

function AiSalesPredictionChart() {
  return (
    <ChartWrapper
      title="AI 매출 예측 그래프"
      apiUrl="/v1/analytics/ai/sales"
      defaultType="line"
      filters={{}}
    />
  );
}

export default AiSalesPredictionChart;
