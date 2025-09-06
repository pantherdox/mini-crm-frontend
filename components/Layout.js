import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className=" mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 border rounded" onClick={()=>setOpen(!open)} aria-label="Toggle navigation">☰</button>
            <div className="font-bold text-lg">
              <Link href="/">
                Mini CRM
              </Link>
            </div>
          </div>
          <nav className="hidden md:flex gap-4">
          <Link href="/">
              Dashboard
            </Link>
            <Link href="/leads">
              Leads
            </Link>
            <Link href="/customers">
              Customers
            </Link>
            <Link href="/tasks">
              Tasks
            </Link>
            {user?.role === 'admin' && (
              <Link href="/users">
                Users
              </Link>
            )}
          </nav>
          <div className="hidden md:block">
            {user ? (
              <>
                <span>
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
        {open && (
          <div className="md:hidden px-4 pb-3 space-y-3">
            <div className="flex flex-col gap-2">
              <Link href="/leads" onClick={()=>setOpen(false)}>Leads</Link>
              <Link href="/customers" onClick={()=>setOpen(false)}>Customers</Link>
              <Link href="/tasks" onClick={()=>setOpen(false)}>Tasks</Link>
              {user?.role === 'admin' && (
                <Link href="/users" onClick={()=>setOpen(false)}>Users</Link>
              )}
              <Link href="/" onClick={()=>setOpen(false)}>Dashboard</Link>
            </div>
            <div>
              {user ? (
                <button onClick={()=>{ setOpen(false); logout(); }} className="mt-2 w-full bg-red-500 text-white px-3 py-2 rounded">Logout</button>
              ) : (
                <Link href="/login" onClick={()=>setOpen(false)}>Login</Link>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto p-4 flex-1 w-full">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500">
        Mini CRM - Aryaman Tickoo
      </footer>
    </div>
  );
}
