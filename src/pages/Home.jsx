// src/pages/Home.jsx (또는 사용하는 경로)
import React from "react";
import TotalSalesChart from "../components/graph/TotalSalesChart";
import TrainerPerformanceChart from "../components/graph/TrainerPerformanceChart";
import AiMemberPredictionChart from "../components/graph/AiMemberPredictionChart";
import AiSalesPredictionChart from "../components/graph/AiSalesPredictionChart";

export default function Home() {
  return (
    <div className="container-fluid p-3 bg-light">
      {/* ✅ 대시보드 전용 오버라이드: 차트 컨테이너 통일 높이 */}
      <style>{`
        /* 기본 카드 높이 */
        .dashboard-sizer .card-body > div,
        .dashboard-sizer.border > .w-100,
        .dashboard-sizer .border.rounded > div {
          height: 360px !important;
          min-height: 360px !important;
          width: 100% !important;
        }

        /* AI 매출/회원 차트는 범례가 있어서 조금 더 높게 */
        .dashboard-sizer.ai-tall .card-body > div,
        .dashboard-sizer.ai-tall.border > .w-100,
        .dashboard-sizer.ai-tall .border.rounded > div {
          height: 400px !important;
          min-height: 400px !important;
        }

        /* Highcharts 컨테이너가 부모에 딱 맞게 */
        .dashboard-sizer .highcharts-container {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      {/* 2×2 그리드 */}
      <div className="row row-cols-1 row-cols-xl-2 g-4">
        {/* 상단: AI 차트 2종(가장 중요) */}
        <div className="col">
          <div className="dashboard-sizer ai-tall">
            <AiMemberPredictionChart />
          </div>
        </div>
        <div className="col">
          <div className="dashboard-sizer ai-tall">
            <AiSalesPredictionChart />
          </div>
        </div>

        {/* 하단: 일반 차트 2종 */}
        <div className="col">
          <div className="dashboard-sizer">
            <TotalSalesChart />
          </div>
        </div>
        <div className="col">
          <div className="dashboard-sizer">
            <TrainerPerformanceChart />
          </div>
        </div>
      </div>
    </div>
  );
}
