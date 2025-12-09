import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

ChartJS.defaults.color = "#ffffff";
ChartJS.defaults.borderColor = "rgba(255,255,255,0.3)";

// -------------------- Pie Chart --------------------
function CategoryPieChart({ expenses }) {
  const categories = [...new Set(expenses.map((e) => e.category))];
  const amounts = categories.map((cat) =>
    expenses
      .filter((e) => e.category === cat)
      .reduce((acc, e) => acc + Number(e.amount), 0)
  );

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Expenses by Category",
        data: amounts,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#8A2BE2",
          "#00FA9A",
          "#FF7F50",
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={data} />;
}

// -------------------- Bar Chart --------------------
function IncomeExpenseBar({ summary }) {
  const data = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [summary.totalIncome, summary.totalExpenses],
        backgroundColor: ["#4ade80", "#f87171"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
}

// -------------------- Line Chart --------------------
function MonthlyTrendLine({ trend }) {
  const data = {
    labels: trend.map((item) => item.month),
    datasets: [
      {
        label: "Income",
        data: trend.map((item) => item.income || 0),
        borderColor: "#4ade80",
        backgroundColor: "#4ade80",
        tension: 0.4,
      },
      {
        label: "Expense",
        data: trend.map((item) => item.expense || 0),
        borderColor: "#f87171",
        backgroundColor: "#f87171",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  return <Line data={data} options={options} />;
}

// -------------------- Dashboard --------------------
export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    remaining: 0,
    totalBudget: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    loadDashboardDebug();
    loadDashboard();
  }, []);

  // -------------------- Debug Load --------------------
  const loadDashboardDebug = async () => {
    try {
      const res1 = await api.get("/api/reports/summary");
      const res2 = await api.get(
        "/api/reports/dashboard/category-summary?year=2025&month=12"
      );
      const res3 = await api.get(
        "/api/reports/dashboard/income-expense-summary?year=2025&month=12"
      );

      console.log("Summary:", res1.data);
      console.log("Category:", res2.data);
      console.log("Income vs Expense:", res3.data);

      setSummary(res1.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  // -------------------- Actual Dashboard Load --------------------
  const loadDashboard = async () => {
    try {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;

      const resSummary = await api.get(
        "/api/reports/dashboard/income-expense-summary",
        { params: { year, month } }
      );
      const resRecent = await api.get("/api/expenses?recent=true");
      const resAll = await api.get("/api/expenses");
      const resTrend = await api.get("/api/reports/dashboard/monthly-trend", {
        params: { year },
      });

      const trendObj = resTrend.data;
      const months = [
        "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
      ];

      const trendArray = Object.entries(trendObj).map(([key, value]) => {
        const monthNumber = parseInt(key.split("-")[1]);
        return {
          month: months[monthNumber - 1],
          expense: value.expense || 0,
          income: value.income || 0
        };
      });

      trendArray.sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

      const summaryData = {
        totalExpenses: resSummary.data.expense || 0,
        totalIncome: resSummary.data.income || 0,
        remaining: resSummary.data.balance || 0,
        totalBudget: resSummary.data.budget || 0,
      };

      setSummary(summaryData);
      setRecentExpenses(Array.isArray(resRecent.data) ? resRecent.data : []);
      setAllExpenses(Array.isArray(resAll.data) ? resAll.data : []);
      setMonthlyTrend(trendArray);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  // -------------------- Download Reports --------------------
  const downloadReport = async (type) => {
    try {
      const url = type === "excel" ? "/api/reports/excel" : "/api/reports/pdf";
      const res = await api.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type:
          type === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download =
        type === "excel" ? "expenses_report.xlsx" : "expenses_report.pdf";
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center drop-shadow-lg">
        📊 SmartSpend Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg">
          <p className="text-lg">💸 Total Expenses</p>
          <h2 className="text-2xl font-bold mt-1 text-red-300">
            ₹{summary.totalExpenses}
          </h2>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg">
          <p className="text-lg">💰 Total Income</p>
          <h2 className="text-2xl font-bold mt-1 text-green-300">
            ₹{summary.totalIncome}
          </h2>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg">
          <p className="text-lg">🟢 Remaining</p>
          <h2 className={`text-2xl font-bold mt-1 ${summary.remaining < 0 ? "text-red-400" : "text-blue-300"}`}>
            ₹{summary.remaining}
          </h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 mb-8 flex justify-center gap-6 flex-wrap">
        <button onClick={() => navigate("/expenses")} className="px-6 py-3 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700">
          Manage Expenses
        </button>

        <button onClick={() => navigate("/budget")} className="px-6 py-3 bg-green-600 rounded-lg shadow-md hover:bg-green-700">
          Manage Budget
        </button>

        <button onClick={() => downloadReport("excel")} className="px-6 py-3 bg-yellow-600 rounded-lg shadow-md hover:bg-yellow-700">
          Download Excel
        </button>

        <button onClick={() => downloadReport("pdf")} className="px-6 py-3 bg-red-600 rounded-lg shadow-md hover:bg-red-700">
          Download PDF
        </button>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg mb-6">
        <h2 className="font-bold text-xl mb-2">🧾 Recent Expenses</h2>
        {recentExpenses.length === 0 ? (
          <p className="text-gray-200">No recent expenses found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-blue-200 text-base">
                <th className="py-1">Category</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((exp, index) => (
                <tr key={index} className="hover:bg-white/20 transition">
                  <td className="py-1">{exp.category}</td>
                  <td>₹{exp.amount}</td>
                  <td>{exp.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Charts */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Expense Breakdown */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg">
          <h2 className="font-bold text-xl mb-2">🟠 Expense Breakdown</h2>
          <div style={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CategoryPieChart expenses={allExpenses} />
          </div>
        </div>

        {/* Income vs Expense */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg">
          <h2 className="font-bold text-xl mb-2">📊 Income vs Expense</h2>
          <div style={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <IncomeExpenseBar summary={summary} />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg md:col-span-2">
          <h2 className="font-bold text-xl mb-2">📈 Monthly Trend</h2>
          <div style={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <MonthlyTrendLine trend={monthlyTrend} />
          </div>
        </div>
      </div>
    </div>
  );
}
