"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

// Extend Navigator interface to include standalone for iOS PWA detection
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

// Schema.org structured data for the gospel reading
function GospelSchema({ date, text }: { date: string; text: string }) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "Article",
					"headline": `Daily Gospel Reading - ${new Date(date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}`,
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

type GospelContent = {
	text: string | null;
	imageData: string | null;
	contentType: string | null;
};

async function fetchGospel(date: string): Promise<GospelContent> {
	const res = await fetch(`/api/gospel?date=${date}`);
	if (!res.ok) return { text: "No gospel for this day.", imageData: null, contentType: null };
	const data = await res.json();
	return {
		text: data.text || null,
		imageData: data.imageData || null,
		contentType: data.contentType || null,
	};
}

export default function Home() {
   const [visitorId, setVisitorId] = useState<string | null>(null);
   const [trusted, setTrusted] = useState(false);
   const router = useRouter();
   const [currentPath, setCurrentPath] = useState('/');
    const today = getTodayISO();
	const [selectedDate, setSelectedDate] = useState(today);
	const [gospel, setGospel] = useState<GospelContent>({ text: null, imageData: null, contentType: null });
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setCurrentPath(window.location.pathname);
	}, []);

	// Auto-redirect trusted PWA installer to admin-upload
	useEffect(() => {
		async function checkTrust() {
			const fpAgent = await FingerprintJS.load();
			const { visitorId } = await fpAgent.get();
			setVisitorId(visitorId);
			try {
				const res = await fetch(`/api/check-trusted?fp=${visitorId}`);
				const data = await res.json();
				if (res.ok && data.trusted) {
					setTrusted(true);
					// respect skipRedirect flag
					const params = new URLSearchParams(window.location.search);
					if (params.get('skipRedirect') === 'true') return;
					router.replace('/admin-upload');
				}
			} catch {
				// ignore errors
			}
		}
		checkTrust();
	}, [router]);

	useEffect(() => {
		// Check for date parameter in URL on mount
		const urlParams = new URLSearchParams(window.location.search);
		const dateParam = urlParams.get('date');
		if (dateParam && dateParam !== selectedDate) {
			// Validate date format and ensure it's not in the future
			const parsedDate = new Date(dateParam);
			const today = new Date();
			today.setHours(23, 59, 59, 999); // End of today
			
			if (!isNaN(parsedDate.getTime()) && parsedDate <= today) {
				setSelectedDate(dateParam);
			}
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	
	useEffect(() => {
		setLoading(true);
		fetchGospel(selectedDate).then((content) => {
			setGospel(content);
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

	// Keyboard navigation
	useEffect(() => {
		function handleKeyPress(e: KeyboardEvent) {
			if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return; // Don't interfere with input fields
			
			switch (e.key) {
				case 'ArrowLeft':
				case 'h':
					e.preventDefault();
					changeDate(-1);
					break;
				case 'ArrowRight':
				case 'l':
					e.preventDefault();
					if (selectedDate < today) changeDate(1);
					break;
				case 't':
					e.preventDefault();
					setSelectedDate(today);
					break;
			}
		}
		
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [selectedDate, today]); // eslint-disable-line react-hooks/exhaustive-deps

	const [showAdminLink, setShowAdminLink] = useState(false);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		setShowAdminLink(urlParams.get("mode") === "admin");
	}, []);

	// Navigation menu
	const navSection = (
		<div className="mx-auto flex justify-center items-center space-x-4 w-full max-w-lg mb-4 bg-white dark:bg-gray-800 p-2 rounded shadow">
			<button
				onClick={() => router.replace(`/?skipRedirect=true`)}
				className={`py-2 px-4 rounded transition-colors ${
					currentPath === '/' ? 'bg-yellow-400 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
				}`}
			>
				Home
			</button>
			{trusted && (
				<button
					onClick={() => router.push('/admin-upload')}
					className={`py-2 px-4 rounded transition-colors ${
						currentPath === '/admin-upload' ? 'bg-yellow-400 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
					}`}
				>
					Admin
				</button>
			)}
		</div>
	);

	return (
		<>
			{visitorId && (
				<div className="fixed bottom-4 left-4 bg-yellow-100 text-black p-2 rounded">
					Your visitor ID: <code>{visitorId}</code>
				</div>
			)}
			{navSection}
			<main className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4">
				<GospelSchema date={selectedDate} text={gospel.text || ""} />
				
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
							{new Date(selectedDate).toLocaleDateString('en-US', {
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
							{gospel.text ? <div className="mb-4">{gospel.text}</div> : null}
							{gospel.imageData && (
								<div className="relative w-full h-[400px] mt-4">
									<Image
										src={`data:${gospel.contentType};base64,${gospel.imageData}`}
										alt="Gospel content"
										fill
										sizes="(max-width: 768px) 100vw, 700px"
										priority
										className="object-contain"
										unoptimized // Required for base64 images
									/>
									<button
										onClick={async () => {
											try {
												// For modern browsers that support the Share API
												if (navigator.share) {
													const response = await fetch(`data:${gospel.contentType};base64,${gospel.imageData}`);
													const blob = await response.blob();
													const file = new File([blob], 'gospel-image.png', { type: gospel.contentType || 'image/png' });
													await navigator.share({
														title: 'Daily Gospel',
														text: gospel.text || 'Daily Gospel Reading',
														files: [file]
													});
												} else if (navigator.clipboard?.write) {
													// Fallback to clipboard API
													const response = await fetch(`data:${gospel.contentType};base64,${gospel.imageData}`);
													const blob = await response.blob();
													await navigator.clipboard.write([
														new ClipboardItem({
															[gospel.contentType || 'image/png']: blob
														})
													]);
													alert('Image copied to clipboard!');
												} else {
													// Fallback for older browsers
													const link = document.createElement('a');
													link.href = `data:${gospel.contentType};base64,${gospel.imageData}`;
													link.download = 'gospel-image.png';
													link.click();
												}
											} catch (error) {
												console.error('Error sharing/copying image:', error);
												alert('Could not share/copy image. Try saving it instead.');
											}
										}}
										className="absolute bottom-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full shadow flex items-center gap-2"
										aria-label="Share or save image"
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
											<path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
										</svg>
										Share
									</button>
								</div>
							)}
						</div>
					)}
				</article>

				{/* Admin link visible only with mode=admin query parameter */}
				{showAdminLink && process.env.NODE_ENV !== 'production' && (
					<a 
						href="/admin-upload" 
						className="fixed top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded shadow"
						aria-label="Go to admin upload page"
					>
						Admin Upload
					</a>
				)}
			</main>
		</>
	);
}
