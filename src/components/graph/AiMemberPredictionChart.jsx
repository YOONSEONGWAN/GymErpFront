// src/components/Graph/AiMemberPredictionChart.jsx
import React from "react";
import ChartWrapper from "./ChartWrapper";

function AiMemberPredictionChart() {
  return (
    <ChartWrapper
      title="연말 회원수 예측 그래프"
      apiUrl="/v1/analytics/ai/members"
      defaultType="bar"
      filters={{}}
    />
  );
}

export default AiMemberPredictionChart;
