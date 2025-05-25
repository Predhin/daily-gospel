"use client";

import { useState } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "gospel2025";

export default function AdminGospelUpload() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Incorrect password.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/gospel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, text }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Gospel uploaded successfully!");
      setDate("");
      setText("");
    } else {
      setMessage(data.error || "Failed to upload gospel.");
    }
    setLoading(false);
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4">
        <form onSubmit={handleAuth} className="bg-yellow-50 dark:bg-yellow-900 p-8 rounded shadow max-w-lg w-full flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
          <input
            type="password"
            className="p-2 rounded border"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
          {message && <div className="text-center mt-2 text-red-700 dark:text-red-300">{message}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="bg-yellow-50 dark:bg-yellow-900 p-8 rounded shadow max-w-lg w-full flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Admin: Upload Daily Gospel</h1>
        <label className="font-semibold">Date</label>
        <input
          type="date"
          className="p-2 rounded border"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <label className="font-semibold">Gospel Text</label>
        <textarea
          className="p-2 rounded border min-h-[120px]"
          value={text}
          onChange={e => setText(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        {message && <div className="text-center mt-2 text-green-700 dark:text-green-300">{message}</div>}
      </form>
    </div>
  );
}
