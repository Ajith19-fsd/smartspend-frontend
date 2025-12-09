// src/pages/Budget.js
import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: "", amount: "" });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/api/budgets", config);
      setBudgets(res.data);
    } catch (error) {
      alert("⚠️ Failed to fetch budgets");
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) return alert("⚠️ Please fill all fields!");

    const payload = { category: form.category, amount: Number(form.amount) };

    try {
      if (editingId) {
        await api.put(`/api/budgets/${editingId}`, payload, config);
        alert("✔️ Budget Updated Successfully");
      } else {
        await api.post("/api/budgets", payload, config);
        alert("🎉 Budget Added Successfully");
      }
      setForm({ category: "", amount: "" });
      setEditingId(null);
      fetchBudgets();
    } catch (error) {
      alert("❌ Error saving budget");
    }
  };

  const handleEdit = (budget) => {
    setForm({ category: budget.category, amount: budget.amount });
    setEditingId(budget.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/budgets/${id}`, config);
      alert("🗑️ Budget Deleted");
      fetchBudgets();
    } catch (err) {
      alert("❌ Failed to delete budget");
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">💰 Manage Budget</h1>

      {/* Budget Form */}
      <form className="mb-6 glass-box p-4 animate-float" onSubmit={handleSubmit}>
        <h2 className="font-semibold text-xl mb-2">
          {editingId ? "✏️ Edit Budget" : "➕ Add Budget"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            className="border p-2 rounded bg-transparent border-white/40"
            type="text"
            name="category"
            placeholder="Category (Ex: Food, Travel)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
          <input
            className="border p-2 rounded bg-transparent border-white/40"
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded shadow-md"
        >
          {editingId ? "Update Budget" : "Add Budget"}
        </button>
      </form>

      {/* Budget Table */}
      <div className="glass-box p-4">
        <table className="w-full border-collapse text-left text-gray-100">
          <thead>
            <tr className="bg-white/10">
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b.id} className="hover:bg-white/10 transition">
                <td className="border px-2 py-1">{b.category}</td>
                <td className="border px-2 py-1">₹{b.amount}</td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    className="bg-yellow-500 px-2 py-1 rounded"
                    onClick={() => handleEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 px-2 py-1 rounded"
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {budgets.length === 0 && (
              <tr>
                <td colSpan="3" className="p-3 text-center text-gray-300">
                  🚫 No budgets added yet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
