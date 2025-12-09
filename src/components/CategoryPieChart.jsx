import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import api from "../api/axiosConfig";

const COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE", "#FF6384", "#A020F0"];

export default function CategoryPieChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadCategoryData();
  }, []);

  const loadCategoryData = async () => {
    try {
      const res = await api.get("/api/expenses/category-summary");
      setData(res.data);
    } catch (err) {
      console.error("Error loading category chart:", err);
    }
  };

  return (
    <PieChart width={330} height={330}>
      <Pie
        data={data}
        dataKey="amount"
        nameKey="category"
        outerRadius={120}
        innerRadius={60}
        paddingAngle={4}
        label
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
