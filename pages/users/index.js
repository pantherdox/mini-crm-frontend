import withAuth from "../../utils/withAuth";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Pagination from "../../components/Pagination";
import useSWR from "swr";
import api from "../../lib/api";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function Users() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });

  // Build the URL with filters
  const buildUrl = () => {
    let url = `/auth/users?page=${page}&limit=10`;
    if (role) {
      url += `&role=${encodeURIComponent(role)}`;
    }
    if (search) {
      url += `&q=${encodeURIComponent(search)}`;
    }
    return url;
  };

  const { data, mutate } = useSWR(user?.role === 'admin' ? buildUrl() : null, fetcher);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Only show this page to admin users
  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setPage(1);
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "agent" });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (user) => {
    setForm({ 
      name: user.name || "", 
      email: user.email || "", 
      password: "", 
      role: user.role || "agent" 
    });
    setEditingId(user._id);
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update user (exclude password if empty)
        const updateData = { ...form };
        if (!updateData.password || updateData.password.trim() === '') {
          delete updateData.password;
        }
        await api.patch("/auth/users/" + editingId, updateData);
      } else {
        // Create new user
        await api.post("/auth/register", form);
      }
      setShowForm(false);
      resetForm();
      mutate();
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await api.patch("/auth/users/" + userId, { isActive: !currentStatus });
        mutate();
      } catch (error) {
        alert(error.response?.data?.message || 'An error occurred');
      }
    }
  };

  const columns = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    {
      key: "role",
      title: "Role",
      render: (r) => (
        <Badge color={r.role === "admin" ? "red" : "blue"}>
          {r.role}
        </Badge>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (r) => (
        <Badge color={r.isActive ? "green" : "gray"}>
          {r.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      title: "Actions",
      render: (r) => (
        <div className="space-x-2">
          <button
            onClick={() => openEdit(r)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
          >
            Edit
          </button>
          {r._id !== user.id && (
            <button
              onClick={() => handleToggleUserStatus(r._id, r.isActive)}
              className={"inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded hover:opacity-90 " + (r.isActive ? "border-red-300 text-red-700 hover:bg-red-50" : "border-green-300 text-green-700 hover:bg-green-50")}
            >
              {r.isActive ? "Deactivate" : "Activate"}
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!data)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-xl font-bold">User Management</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              handleFilterChange();
            }}
            className="border p-2 rounded"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
          </select>
          <button onClick={openCreate} className="hidden md:block ml-0 sm:ml-2 px-3 py-2 bg-blue-600 text-white rounded">
            New User
          </button>
          <button onClick={openCreate} className="md:hidden ml-0 w-full sm:ml-2 px-3 py-2 bg-blue-600 text-white rounded">
            +
          </button>
          {/* <Link href="/register" className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              Register User
            
          </Link> */}
        </div>
      </div>

      {showForm && (
        <form onSubmit={submitForm} className="mb-4 p-4 bg-white rounded shadow space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="border p-2 rounded w-full"
              required
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              type="email"
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editingId ? "New password (leave empty to keep current)" : "Password"}
              type="password"
              className="border p-2 rounded w-full"
              required={!editingId}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
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
                {editingId ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </form>
      )}

      <Table columns={columns} data={data.items} />
      <Pagination
        page={data.page}
        total={data.total}
        limit={data.limit}
        onChange={(p) => setPage(p)}
      />
    </Layout>
  );
}
