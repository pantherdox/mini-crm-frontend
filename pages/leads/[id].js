import withAuth from "../../utils/withAuth";
import Layout from "../../components/Layout";
import Badge from "../../components/Badge";
import useSWR from "swr";
import api from "../../lib/api";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function LeadDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: lead, mutate } = useSWR(id ? `/leads/${id}` : null, fetcher);
  const [showEditForm, setShowEditForm] = useState(false);
  const [form, setForm] = useState({});

  if (!lead) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  const openEdit = () => {
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      status: lead.status || "New",
      source: lead.source || "",
    });
    setShowEditForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/leads/${id}`, form);
      setShowEditForm(false);
      mutate();
    } catch (error) {
      alert("Error updating lead: " + (error.response?.data?.message || error.message));
    }
  };

  const convertLead = async () => {
    if (confirm("Convert this lead to customer?")) {
      try {
        await api.post(`/leads/${id}/convert`);
        alert("Lead converted to customer successfully!");
        router.push("/customers");
      } catch (error) {
        alert("Error converting lead: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const archiveLead = async () => {
    if (confirm("Archive this lead?")) {
      try {
        await api.delete(`/leads/${id}`);
        alert("Lead archived successfully!");
        router.push("/leads");
      } catch (error) {
        alert("Error archiving lead: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "blue";
      case "In Progress": return "yellow";
      case "Closed Won": return "green";
      case "Closed Lost": return "red";
      default: return "gray";
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <Link href="/leads" className="text-blue-600 hover:underline">
          ← Back to Leads
        </Link>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div className="md:block flex justify-between">
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            <div className="mt-2">
              <Badge color={getStatusColor(lead.status)}>
                {lead.status}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openEdit}
              className="md:px-4 px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={convertLead}
              className="md:px-4 px-2 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Convert to Customer
            </button>
            <button
              onClick={archiveLead}
              className="md:px-4 px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Archive
            </button>
          </div>
        </div>

        {showEditForm && (
          <form onSubmit={submitForm} className="mb-6 p-4 bg-gray-50 rounded space-y-4">
            <h3 className="font-semibold">Edit Lead</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border p-2 rounded"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <input
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update Lead
              </button>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Email:</span> {lead.email || "—"}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {lead.phone || "—"}
              </div>
              <div>
                <span className="font-medium">Source:</span> {lead.source || "—"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Lead Details</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Assigned Agent:</span> {lead.assignedAgent?.name || "—"}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(lead.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(lead.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {lead.history && lead.history.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">History</h3>
            <div className="space-y-2">
              {lead.history.map((entry, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{entry.action}</span> - {new Date(entry.at).toLocaleString()}
                  {entry.by && <span> by {entry.by.name}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

