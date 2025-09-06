import withAuth from "../../utils/withAuth";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import useSWR from "swr";
import api from "../../lib/api";
import Link from "next/link";
import { useState } from "react";
const fetcher = (url) => api.get(url).then((r) => r.data);
export default function Customers() {
  const { data, mutate } = useSWR("/customers?page=1&limit=50", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });

  const resetForm = () => { setForm({ name: "", company: "", email: "", phone: "" }); setEditingId(null); };
  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (row) => { setForm({ name: row.name||"", company: row.company||"", email: row.email||"", phone: row.phone||"" }); setEditingId(row._id); setShowForm(true); };
  const submitForm = async (e) => {
    e.preventDefault();
    if (editingId) await api.patch('/customers/'+editingId, form); else await api.post('/customers', form);
    setShowForm(false); resetForm(); mutate();
  };
  const cols = [
    {
      key: "name",
      title: "Name",
      render: (r) => (
        <Link href={"/customers/" + r._id} className="text-blue-600">
          {r.name}
        </Link>
      ),
    },
    { key: "company", title: "Company" },
    { key: "email", title: "Email" },
    { key: "owner", title: "Owner", render: (r) => r.owner?.name || "—" },
    { key: 'actions', title: 'Actions', render: (r)=> (
      <button className="inline-flex items-center md:px-3 px-2 py-1.5 md:text-sm text-xs font-medium border border-blue-300 text-blue-700 rounded hover:bg-blue-50" onClick={()=>openEdit(r)}>Edit</button>
    )}
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
        <h1 className="text-xl font-bold">Customers</h1>
        <button onClick={openCreate} className="px-3 py-2 bg-blue-600 text-white rounded">New Customer</button>
      </div>

      {showForm && (
        <form onSubmit={submitForm} className="mb-4 p-4 bg-white rounded shadow space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="Name" className="border p-2 rounded w-full" required />
            <input value={form.company} onChange={(e)=>setForm({ ...form, company: e.target.value })} placeholder="Company" className="border p-2 rounded w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <input value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} placeholder="Email" className="border p-2 rounded w-full" />
            <input value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="border p-2 rounded w-full" />
            <div className="md:ml-auto space-x-2">
              <button type="button" onClick={()=>{ setShowForm(false); resetForm(); }} className="px-3 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">{editingId ? 'Update Customer' : 'Create Customer'}</button>
            </div>
          </div>
        </form>
      )}
      <Table columns={cols} data={data.items} />
    </Layout>
  );
}
