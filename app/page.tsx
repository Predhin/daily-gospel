"use client";

import { useEffect, useState } from "react";

// Schema.org structured data for the gospel reading
function GospelSchema({ date, text }: { date: string; text: string }) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "Article",
					"headline": `Daily Gospel Reading - ${new Date(date).toLocaleDateString()}`,
					"datePublished": date,
					"description": text.substring(0, 150) + "...",
					"articleBody": text,
					"articleSection": "Gospel Reading",
				}),
			}}
		/>
	);
}

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
		<main className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4">
			<GospelSchema date={selectedDate} text={gospel} />
			
			<header className="w-full max-w-4xl mx-auto mb-8">
				<h1 className="text-3xl font-bold text-center mb-4">Daily Gospel Reading</h1>
				<nav className="flex items-center justify-center gap-4" aria-label="Date navigation">
					<button
						aria-label="Previous day"
						className="text-2xl px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
						onClick={() => changeDate(-1)}
					>
						←
					</button>
					<time 
						dateTime={selectedDate}
						className="text-xl font-semibold"
					>
						{new Date(selectedDate).toLocaleDateString(undefined, {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</time>
					<button
						aria-label="Next day"
						className="text-2xl px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
						onClick={() => changeDate(1)}
						disabled={selectedDate === today}
					>
						→
					</button>
				</nav>
			</header>

			{/* Simple animation placeholder */}
			<div className="mb-8 animate-bounce" aria-hidden="true">
				<svg
					width="48"
					height="48"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle cx="12" cy="12" r="10" fill="#fbbf24" />
				</svg>
			</div>

			<article className="max-w-xl w-full">
				{loading ? (
					<div className="text-center p-8" role="status">
						<span className="sr-only">Loading...</span>
						Loading...
					</div>
				) : (
					<div className="prose prose-lg dark:prose-invert mx-auto bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-100 p-8 rounded shadow">
						{gospel}
					</div>
				)}
			</article>

			{/* Admin link visible only with mode=admin query parameter */}
			{showAdminLink && (
				<a 
					href="/admin-upload" 
					className="fixed top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded shadow"
					aria-label="Go to admin upload page"
				>
					Admin Upload
				</a>
			)}
		</main>
	);
}
