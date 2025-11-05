// src/components/Graph/ChartWrapper.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

function ChartWrapper({ title, apiUrl, defaultType = "bar", filters }) {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState(defaultType);
  const [loading, setLoading] = useState(false);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FFF"];

  /* ==============================
     ✅ 백엔드 호환용 파라미터 빌더
  ============================== */
  const buildParams = () => {
    const params = {
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    };

    // ✅ categoryType → 백엔드의 categories 매핑
    if (filters.categoryType === "SERVICE") {
      params.categories = ["PT", "VOUCHER"];
    } else if (filters.categoryType === "ITEM") {
      params.categories = ["SUPPLEMENTS", "DRINK", "CLOTHES"];
    } else {
      params.categories = ["PT", "VOUCHER", "SUPPLEMENTS", "DRINK", "CLOTHES"];
    }

    return params;
  };

  /* ==============================
     ✅ 데이터 로딩
  ============================== */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(apiUrl, { params: buildParams() });
        const fetchedData = res.data || [];

        // ✅ [AI 예측 그래프 처리]
        if (apiUrl.includes("/ai/members") || apiUrl.includes("/ai/sales")) {
          setData(fetchedData);
          setChartType("ai");
        } else {
          // ✅ 기존 그래프 로직 (총매출 등)
          const filtered = fetchedData.filter(
            (d) => (d.total_sales || d.TOTAL_SALES || 0) >= 0
          );
          setData(filtered);

          // ✅ 기간 선택 시 bar 그래프, 미선택 시 pie 그래프
          if (filters.startDate && filters.endDate) {
            setChartType("bar");
          } else {
            setChartType("pie");
          }
        }
      } catch (err) {
        console.error("📉 ChartWrapper fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl, filters.startDate, filters.endDate, filters.categoryType, defaultType]);

  /* ==============================
     ✅ 누락된 월 보정 (프론트 레벨)
  ============================== */
  const fillMissingMonths = (inputData) => {
    if (!inputData || inputData.length === 0) return [];
    const months = {};
    inputData.forEach((d) => {
      const label = d.group_label || d.GROUP_LABEL || "";
      if (label && !months[label]) months[label] = d;
    });
    const now = new Date();
    const currentYear = now.getFullYear();
    for (let m = 1; m <= 12; m++) {
      const key = `${currentYear}-${String(m).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = { group_label: key, total_sales: 0, TOTAL_SALES: 0 };
      }
    }
    return Object.values(months).sort((a, b) =>
      (a.group_label || a.GROUP_LABEL).localeCompare(
        b.group_label || b.GROUP_LABEL
      )
    );
  };

  /* ==============================
     ✅ 데이터 전처리 (총매출 전용)
  ============================== */
  let processedData = data;
  if (apiUrl.includes("/analytics/sales/total") && chartType === "bar") {
    const grouped = {};
    data.forEach((d) => {
      const key = d.group_label || d.GROUP_LABEL || "기타";
      if (!grouped[key]) grouped[key] = { label: key };

      // ✅ category/label 대응
      const category =
        d.category || d.label || d.CATEGORY || d.LABEL || "기타";
      const amount = d.total_sales || d.TOTAL_SALES || 0;

      if (filters.categoryType === "SERVICE") {
        if (!grouped[key].PT) grouped[key].PT = 0;
        if (!grouped[key].VOUCHER) grouped[key].VOUCHER = 0;
        if (category === "PT") grouped[key].PT += amount;
        if (category === "VOUCHER") grouped[key].VOUCHER += amount;
      } else if (filters.categoryType === "ITEM") {
        if (!grouped[key].SUPPLEMENTS) grouped[key].SUPPLEMENTS = 0;
        if (!grouped[key].DRINK) grouped[key].DRINK = 0;
        if (!grouped[key].CLOTHES) grouped[key].CLOTHES = 0;
        if (category === "SUPPLEMENTS") grouped[key].SUPPLEMENTS += amount;
        if (category === "DRINK") grouped[key].DRINK += amount;
        if (category === "CLOTHES") grouped[key].CLOTHES += amount;
      } else {
        if (!grouped[key].service_sales) grouped[key].service_sales = 0;
        if (!grouped[key].item_sales) grouped[key].item_sales = 0;
        if (["PT", "VOUCHER"].includes(category))
          grouped[key].service_sales += amount;
        if (["SUPPLEMENTS", "DRINK", "CLOTHES"].includes(category))
          grouped[key].item_sales += amount;
      }
    });
    processedData = fillMissingMonths(Object.values(grouped));
  }

  /* ==============================
     ✅ 로딩 & 데이터 없음 처리
  ============================== */
  if (loading) {
    return (
      <div className="border rounded p-3 text-center text-secondary">
        데이터를 불러오는 중입니다...
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="border rounded p-3 text-center text-muted">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  /* ==============================
     ✅ 렌더링
  ============================== */
  return (
    <div className="border rounded p-3 mb-4">
      <h6 className="fw-bold mb-3">{title}</h6>

      {/* 🧠 [AI 회원수 예측 그래프] */}
      {chartType === "ai" && apiUrl.includes("/ai/members") && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={(() => {
              const adjustedData = data.map((d) => {
                const rawMonth = d.month || d.MONTH || "";
                const dataType = d.data_type || d.DATA_TYPE || "";
                let adjustedMonth = rawMonth;
                if (dataType === "예측") {
                  let dateObj = new Date(rawMonth + "-01");
                  dateObj.setMonth(dateObj.getMonth() - 1);
                  adjustedMonth = `${dateObj.getFullYear()}-${String(
                    dateObj.getMonth() + 1
                  ).padStart(2, "0")}`;
                }
                return {
                  month: adjustedMonth,
                  predictedCount: d.predictedCount || d.PREDICTEDCOUNT,
                  type: dataType,
                };
              });
              return adjustedData.sort((a, b) => a.month.localeCompare(b.month));
            })()}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(v) => `${parseInt(v.split("-")[1])}월`}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const info = payload[0].payload;
                  const title =
                    info.type === "예측" ? "예측 회원수" : "실제 회원수";
                  return (
                    <div
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        padding: "5px 10px",
                        borderRadius: "5px",
                      }}
                    >
                      <strong>{`${label}`}</strong>
                      <br />
                      {title} : {info.predictedCount?.toLocaleString()}명
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="predictedCount">
              {data
                .map((d) => {
                  const rawMonth = d.month || d.MONTH || "";
                  const dataType = d.data_type || d.DATA_TYPE || "";
                  let adjustedMonth = rawMonth;
                  if (dataType === "예측") {
                    let dateObj = new Date(rawMonth + "-01");
                    dateObj.setMonth(dateObj.getMonth() - 1);
                    adjustedMonth = `${dateObj.getFullYear()}-${String(
                      dateObj.getMonth() + 1
                    ).padStart(2, "0")}`;
                  }
                  return adjustedMonth;
                })
                .sort((a, b) => a.localeCompare(b))
                .map((month, idx) => {
                  const color =
                    month.includes("2025-11") || month.includes("2025-12")
                      ? "#FF4C4C"
                      : "#0088FE";
                  return <Cell key={`cell-${idx}`} fill={color} />;
                })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* 🧠 [AI 매출 예측 그래프] */}
      {chartType === "ai" && apiUrl.includes("/ai/sales") && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(val) => `${val.toLocaleString()}원`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="predictedSales"
              name="예측 매출"
              stroke="#00C49F"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* 🔸 원형 그래프 */}
      {chartType === "pie" && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={(d) => d.total_sales || d.TOTAL_SALES || 0}
              nameKey={(d) =>
                d.label || d.LABEL || d.category || d.CATEGORY || "-"
              }
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ label, LABEL, total_sales, TOTAL_SALES }) =>
                `${label || LABEL || "-"} / ${Number(
                  total_sales || TOTAL_SALES || 0
                ).toLocaleString()}원`
              }
            >
              {data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => `${Number(val).toLocaleString()}원`} />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* 🔹 막대 그래프 */}
      {chartType === "bar" && !apiUrl.includes("/ai/") && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(val) => `${val.toLocaleString()}원`} />

            {!filters.categoryType && (
              <>
                <Bar dataKey="service_sales" name="서비스 매출" fill="#0088FE" />
                <Bar dataKey="item_sales" name="실물 상품 매출" fill="#FF8042" />
              </>
            )}

            {filters.categoryType === "SERVICE" && (
              <>
                <Bar dataKey="PT" name="PT 매출" fill="#00C49F" />
                <Bar dataKey="VOUCHER" name="회원권 매출" fill="#A28FFF" />
              </>
            )}

            {filters.categoryType === "ITEM" && (
              <>
                <Bar dataKey="SUPPLEMENTS" name="보충제 매출" fill="#FFBB28" />
                <Bar dataKey="DRINK" name="음료 매출" fill="#0088FE" />
                <Bar dataKey="CLOTHES" name="의류 매출" fill="#FF8042" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ChartWrapper;
