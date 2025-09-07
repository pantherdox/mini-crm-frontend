import withAuth from "../../utils/withAuth";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import Badge from "../../components/Badge";
import Pagination from "../../components/Pagination";
import useSWR from "swr";
import api from "../../lib/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function Leads() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "New", source: "" });
  const [reassignLead, setReassignLead] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Build the URL with filters
  const buildUrl = () => {
    let url = `/leads?page=${page}&limit=10`;
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    if (search) {
      url += `&q=${encodeURIComponent(search)}`;
    }
    if (showArchived) {
      url += `&showArchived=true`;
    }
    return url;
  };

  const { data, mutate } = useSWR(buildUrl(), fetcher);
  const { data: users } = useSWR(user?.role === 'admin' ? '/auth/users?limit=100' : null, fetcher);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setPage(1);
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", status: "New", source: "" });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (lead) => {
    setForm({ name: lead.name || "", email: lead.email || "", phone: lead.phone || "", status: lead.status || "New", source: lead.source || "" });
    setEditingId(lead._id);
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.patch("/leads/" + editingId, form);
    } else {
      await api.post("/leads", form);
    }
    setShowForm(false);
    resetForm();
    mutate();
  };

  const handleReassign = async (leadId, newAgentId) => {
    try {
      await api.post(`/leads/${leadId}/reassign`, { assignedAgent: newAgentId });
      mutate();
      setReassignLead(null);
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleArchive = async (leadId) => {
    try {
      await api.patch(`/leads/${leadId}/archive`);
      mutate();
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred while archiving');
    }
  };

  const handleUnarchive = async (leadId) => {
    try {
      await api.patch(`/leads/${leadId}/unarchive`);
      mutate();
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred while unarchiving');
    }
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Link href={"/leads/" + r._id} className="text-blue-600">
            {r.name}
          </Link>
          {r.archived && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Archived
            </span>
          )}
        </div>
      ),
    },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    {
      key: "assignedAgent",
      title: "Assigned Agent",
      render: (r) => r.assignedAgent?.name || "—",
    },
    {
      key: "status",
      title: "Status",
      render: (r) => (
        <Badge
          color={
            r.status === "New"
              ? "blue"
              : r.status === "Closed Won"
              ? "green"
              : "yellow"
          }
        >
          {r.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (r) => (
        <div className="space-x-2">
          {!showArchived && (
            <button
              onClick={() => openEdit(r)}
              className="inline-flex items-center md:px-3 px-2 py-1.5 md:text-sm text-xs font-medium border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
            >
              Edit
            </button>
          )}
          {!showArchived ? (
            <button
              onClick={() => {
                if (confirm("Archive this lead?")) {
                  handleArchive(r._id);
                }
              }}
              className="inline-flex items-center md:px-3 px-2 py-1.5 md:text-sm text-xs font-medium border border-red-300 text-red-700 rounded hover:bg-red-50"
            >
              Archive
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm("Unarchive this lead?")) {
                  handleUnarchive(r._id);
                }
              }}
              className="inline-flex items-center md:px-3 px-2 py-1.5 md:text-sm text-xs font-medium border border-green-300 text-green-700 rounded hover:bg-green-50"
            >
              Unarchive
            </button>
          )}
          {!showArchived && (
            <button
              onClick={async () => {
                if (confirm("Convert?")) {
                  await api.post("/leads/" + r._id + "/convert");
                  mutate();
                }
              }}
              className="inline-flex items-center md:px-3 px-2 py-1.5 md:text-sm text-xs font-medium border border-green-300 text-green-700 rounded hover:bg-green-50"
            >
              Convert
            </button>
          )}
          {!showArchived && user?.role === 'admin' && (
            <button
              onClick={() => setReassignLead(r)}
              className="inline-flex items-center md:px-3 px-2 py-1.5 md:text-sm text-xs font-medium border border-purple-300 text-purple-700 rounded hover:bg-purple-50"
            >
              Reassign
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
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Leads</h1>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => {
                setShowArchived(e.target.checked);
                setPage(1);
              }}
              className="rounded"
            />
            Show Archived
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              handleFilterChange();
            }}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
          {!showArchived && (
            <>
              <button onClick={openCreate} className="md:hidden ml-0 sm:ml-1 px-2 py-1 bg-blue-600 text-white rounded">
                +
              </button>
              <button onClick={openCreate} className="hidden md:block ml-0 sm:ml-2 px-3 py-2 bg-blue-600 text-white rounded">
                New Lead
              </button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={submitForm} className="mb-4 p-4 bg-white rounded shadow space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="Name" className="border p-2 rounded w-full" required />
            <input value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} placeholder="Email" className="border p-2 rounded w-full" />
            <input value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="border p-2 rounded w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <select value={form.status} onChange={(e)=>setForm({ ...form, status: e.target.value })} className="border p-2 rounded">
              <option>New</option>
              <option>In Progress</option>
              <option>Closed Won</option>
              <option>Closed Lost</option>
            </select>
            <input value={form.source} onChange={(e)=>setForm({ ...form, source: e.target.value })} placeholder="Source" className="border p-2 rounded w-full" />
            <div className="md:ml-auto space-x-2">
              <button type="button" onClick={()=>{ setShowForm(false); resetForm(); }} className="px-3 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">{editingId ? 'Update Lead' : 'Create Lead'}</button>
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

      {/* Reassignment Modal */}
      {reassignLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Reassign Lead: {reassignLead.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Current agent: {reassignLead.assignedAgent?.name || "Unassigned"}
            </p>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Select new agent:</label>
              <select
                className="w-full border p-2 rounded"
                onChange={(e) => {
                  if (e.target.value) {
                    handleReassign(reassignLead._id, e.target.value);
                  }
                }}
              >
                <option value="">Select an agent...</option>
                {users?.items?.filter(u => u.role === 'agent' && u.isActive).map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setReassignLead(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
