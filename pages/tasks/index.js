import withAuth from "../../utils/withAuth";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import useSWR from "swr";
import api from "../../lib/api";
import { useState } from "react";
const fetcher = (url) => api.get(url).then((r) => r.data);
export default function Tasks() {
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Build URL with filter
  const buildUrl = () => {
    let url = "/tasks?page=1&limit=50";
    if (filter) {
      url += `&${filter}`;
    }
    return url;
  };
  
  const { data, mutate } = useSWR(buildUrl(), fetcher);
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    status: "Open",
    priority: "Medium",
    relatedType: "Lead",
    relatedId: "",
  });

  const resetForm = () => {
    setForm({
      title: "",
      dueDate: "",
      status: "Open",
      priority: "Medium",
      relatedType: "Lead",
      relatedId: "",
    });
    setEditingId(null);
  };
  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };
  const openEdit = (row) => {
    setForm({
      title: row.title || "",
      dueDate: row.dueDate
        ? new Date(row.dueDate).toISOString().slice(0, 10)
        : "",
      status: row.status || "Open",
      priority: row.priority || "Medium",
      relatedType: row.relatedType || "Lead",
      relatedId: row.relatedId || "",
    });
    setEditingId(row._id);
    setShowForm(true);
  };
  const submitForm = async (e) => {
    e.preventDefault();
    const payload = { ...form, dueDate: new Date(form.dueDate) };
    if (editingId) await api.patch("/tasks/" + editingId, payload);
    else await api.post("/tasks", payload);
    setShowForm(false);
    resetForm();
    mutate();
  };

  const isOverdue = (task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'Done';
  };

  const cols = [
    { key: "title", title: "Title" },
    {
      key: "dueDate",
      title: "Due",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span>{new Date(r.dueDate).toLocaleDateString()}</span>
          {isOverdue(r) && (
            <Badge color="red">Overdue</Badge>
          )}
        </div>
      ),
    },
    { 
      key: "status", 
      title: "Status",
      render: (r) => (
        <Badge color={
          r.status === 'Done' ? 'green' :
          r.status === 'In Progress' ? 'yellow' : 'blue'
        }>
          {r.status}
        </Badge>
      )
    },
    { 
      key: "priority", 
      title: "Priority",
      render: (r) => (
        <Badge color={
          r.priority === 'High' ? 'red' :
          r.priority === 'Medium' ? 'yellow' : 'green'
        }>
          {r.priority}
        </Badge>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (r) => (
        <button className="inline-flex items-center md:px-3 px-2 py-1.5 md:text-sm text-xs font-medium border border-blue-300 text-blue-700 rounded hover:bg-blue-50" onClick={() => openEdit(r)}>
          Edit
        </button>
      ),
    },
  ];
  if (!data)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );

  // Count overdue tasks
  const overdueCount = data.items ? data.items.filter(task => isOverdue(task)).length : 0;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-xl font-bold">Tasks</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Tasks</option>
            <option value="status=Open">Open</option>
            <option value="status=In Progress">In Progress</option>
            <option value="status=Done">Done</option>
            <option value="due=overdue">Overdue</option>
          </select>
          <button
            onClick={openCreate}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            New Task
          </button>
        </div>
      </div>

      {/* Overdue Tasks Summary */}
      {overdueCount > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge color="red">{overdueCount}</Badge>
            <span className="text-red-800 font-medium">
              {overdueCount === 1 ? 'Task is' : 'Tasks are'} overdue
            </span>
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submitForm}
          className="mb-4 p-4 bg-white rounded shadow space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border p-2 rounded"
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="border p-2 rounded"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <select
              value={form.relatedType}
              onChange={(e) =>
                setForm({ ...form, relatedType: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option>Lead</option>
              <option>Customer</option>
            </select>
            <input
              value={form.relatedId}
              onChange={(e) => setForm({ ...form, relatedId: e.target.value })}
              placeholder="Related ID"
              className="border p-2 rounded w-full"
              required
            />
            <div className="md:ml-auto space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                {editingId ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      )}

      <Table columns={cols} data={data.items} />
    </Layout>
  );
}
