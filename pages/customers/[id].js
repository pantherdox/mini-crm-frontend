import withAuth from "../../utils/withAuth";
import Layout from "../../components/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const fetcher = (url) => api.get(url).then((r) => r.data);

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: customer, mutate } = useSWR(id ? `/customers/${id}` : null, fetcher);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [form, setForm] = useState({});
  const [noteText, setNoteText] = useState("");

  if (!customer) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  const openEdit = () => {
    setForm({
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      tags: customer.tags || [],
    });
    setShowEditForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/customers/${id}`, form);
      setShowEditForm(false);
      mutate();
    } catch (error) {
      alert("Error updating customer: " + (error.response?.data?.message || error.message));
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    
    try {
      await api.post(`/customers/${id}/notes`, { text: noteText });
      setNoteText("");
      setShowNoteForm(false);
      mutate();
    } catch (error) {
      alert("Error adding note: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <Link href="/customers" className="text-blue-600 hover:underline">
          ← Back to Customers
        </Link>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            {customer.company && (
              <p className="text-gray-600 mt-1">{customer.company}</p>
            )}
          </div>
          <div className="space-x-2">
            <button
              onClick={openEdit}
              className="md:px-4 px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => setShowNoteForm(true)}
              className="md:px-4 px-2 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Note
            </button>
          </div>
        </div>

        {showEditForm && (
          <form onSubmit={submitForm} className="mb-6 p-4 bg-gray-50 rounded space-y-4">
            <h3 className="font-semibold">Edit Customer</h3>
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
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full border p-2 rounded"
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
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update Customer
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

        {showNoteForm && (
          <form onSubmit={addNote} className="mb-6 p-4 bg-gray-50 rounded space-y-4">
            <h3 className="font-semibold">Add Note</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full border p-2 rounded"
                rows="3"
                placeholder="Enter your note here..."
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNoteForm(false);
                  setNoteText("");
                }}
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
                <span className="font-medium">Email:</span> {customer.email || "—"}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {customer.phone || "—"}
              </div>
              <div>
                <span className="font-medium">Owner:</span> {customer.owner?.name || "—"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Customer Details</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Created:</span> {new Date(customer.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(customer.updatedAt).toLocaleDateString()}
              </div>
              {customer.tags && customer.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>{" "}
                  {customer.tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {customer.notes && customer.notes.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Notes (Latest 5)</h3>
            <div className="space-y-3">
              {customer.notes.slice(0, 5).map((note, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">
                    {new Date(note.createdAt).toLocaleString()} by {note.author?.name || "Unknown"}
                  </div>
                  <div className="text-gray-800">{note.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {customer.deals && customer.deals.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Deals</h3>
            <div className="space-y-2">
              {customer.deals.map((deal, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{deal.title}</div>
                  <div className="text-sm text-gray-600">
                    Value: ${deal.value?.toLocaleString() || "—"} | Stage: {deal.stage || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

