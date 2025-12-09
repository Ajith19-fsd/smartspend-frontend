// src/pages/Expenses.js
import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "EXPENSE",
    date: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ category: "", start: "", end: "" });

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Wrap fetchExpenses in useCallback
  const fetchExpenses = useCallback(async () => {
    try {
      const res = await api.get("/api/expenses", config);
      setExpenses(res.data);
    } catch (err) {
      alert("⚠️ Failed to fetch expenses");
    }
  }, [config]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "type" ? value.toUpperCase() : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };

    try {
      if (editingId) {
        await api.put(`/api/expenses/${editingId}`, payload, config);
        alert("✔️ Expense Updated Successfully");
      } else {
        await api.post("/api/expenses", payload, config);
        alert("🎉 Expense Added Successfully");
      }

      setForm({
        title: "",
        amount: "",
        category: "",
        type: "EXPENSE",
        date: "",
        description: "",
      });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      alert("❌ Error saving expense");
    }
  };

  const handleEdit = (expense) => {
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      type: expense.type.toUpperCase(),
      date: expense.date,
      description: expense.description,
    });
    setEditingId(expense.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`, config);
      alert("🗑️ Expense Deleted");
      fetchExpenses();
    } catch (err) {
      alert("❌ Failed to delete expense");
    }
  };

  const handleFilter = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/api/expenses/filter?${params}`, config);
      setExpenses(res.data);
    } catch (err) {
      alert("⚠️ Failed to filter expenses");
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">💸 Manage Expenses</h1>

      {/* Expense Form */}
      <form className="mb-6 glass-box p-4 animate-float" onSubmit={handleSubmit}>
        <h2 className="font-semibold text-xl mb-2">{editingId ? "✏️ Edit Expense" : "➕ Add Expense"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input className="border p-2 rounded bg-transparent border-white/40" type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input className="border p-2 rounded bg-transparent border-white/40" type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required />
          <input className="border p-2 rounded bg-transparent border-white/40" type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
          <select className="border p-2 rounded bg-transparent border-white/40" name="type" value={form.type} onChange={handleChange}>
            <option className="bg-gray-900 text-white" value="EXPENSE">Expense</option>
            <option className="bg-gray-900 text-white" value="INCOME">Income</option>
          </select>
          <input className="border p-2 rounded bg-transparent border-white/40" type="date" name="date" value={form.date} onChange={handleChange} />
          <input className="border p-2 rounded bg-transparent border-white/40" type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        </div>

        <button type="submit" className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded shadow-md">
          {editingId ? "Update Expense" : "Add Expense"}
        </button>
      </form>

      {/* Filters */}
      <div className="mb-4 glass-box p-4">
        <h2 className="font-semibold text-xl mb-2">🔍 Filter Expenses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="border p-2 rounded bg-transparent border-white/40" type="text" placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
          <input className="border p-2 rounded bg-transparent border-white/40" type="date" value={filters.start} onChange={(e) => setFilters({ ...filters, start: e.target.value })} />
          <input className="border p-2 rounded bg-transparent border-white/40" type="date" value={filters.end} onChange={(e) => setFilters({ ...filters, end: e.target.value })} />
        </div>
        <button onClick={handleFilter} className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Apply Filters</button>
      </div>

      {/* Table */}
      <div className="glass-box p-4">
        <table className="w-full border-collapse text-left text-gray-100">
          <thead>
            <tr className="bg-white/10">
              <th className="border px-2 py-1">Title</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-white/10 transition">
                <td className="border px-2 py-1">{exp.title}</td>
                <td className="border px-2 py-1">{exp.category}</td>
                <td className="border px-2 py-1">{exp.type}</td>
                <td className="border px-2 py-1">₹{exp.amount}</td>
                <td className="border px-2 py-1">{exp.date}</td>
                <td className="border px-2 py-1 space-x-2">
                  <button className="bg-yellow-500 px-2 py-1 rounded" onClick={() => handleEdit(exp)}>Edit</button>
                  <button className="bg-red-600 px-2 py-1 rounded" onClick={() => handleDelete(exp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
