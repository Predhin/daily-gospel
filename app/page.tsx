"use client";

import { useEffect, useState } from "react";

function getTodayISO() {
	return new Date().toISOString().slice(0, 10);
}

async function fetchGospel(date: string): Promise<string> {
	const res = await fetch(`/api/gospel?date=${date}`);
	if (!res.ok) return "No gospel for this day.";
	const data = await res.json();
	return data.text || "No gospel for this day.";
}

export default function Home() {
	const today = getTodayISO();
	const [selectedDate, setSelectedDate] = useState(today);
	const [gospel, setGospel] = useState<string>("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		fetchGospel(selectedDate).then((text) => {
			setGospel(text);
			setLoading(false);
		});
	}, [selectedDate]);

	function changeDate(offset: number) {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + offset);
		const iso = newDate.toISOString().slice(0, 10);
		if (iso > today) return; // Prevent navigating to future
		setSelectedDate(iso);
	}

	const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
	const showAdminLink = urlParams?.get("mode") === "admin";

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4">
			<div className="flex items-center gap-4 mb-8">
				<button
					aria-label="Previous day"
					className="text-2xl px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
					onClick={() => changeDate(-1)}
				>
					←
				</button>
				<span className="text-xl font-semibold">
					{new Date(selectedDate).toLocaleDateString(undefined, {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</span>
				<button
					aria-label="Next day"
					className="text-2xl px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
					onClick={() => changeDate(1)}
					disabled={selectedDate === today}
				>
					→
				</button>
			</div>
			{/* Simple animation placeholder */}
			<div className="mb-8 animate-bounce">
				<svg
					width="48"
					height="48"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle cx="12" cy="12" r="10" fill="#fbbf24" />
				</svg>
			</div>
			<div className="max-w-xl text-center text-2xl font-serif bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-100 p-8 rounded shadow min-h-[120px] flex items-center justify-center">
				{loading ? "Loading..." : gospel}
			</div>
			{showAdminLink && (
				<a href="/admin-upload" className="fixed top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded shadow">Admin Upload</a>
			)}
		</div>
	);
}
