"use client";

import { useEffect, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export default function FingerprintPage() {
  const [visitorId, setVisitorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFingerprint() {
      try {
        setLoading(true);
        setError("");
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setVisitorId(result.visitorId);
      } catch (err) {
        setError("Failed to load fingerprint. Please refresh the page.");
        console.error("Fingerprint error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFingerprint();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(visitorId);
      alert("Visitor ID copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = visitorId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert("Visitor ID copied to clipboard!");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="bg-yellow-50 dark:bg-yellow-900 p-8 rounded shadow max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Device Visitor ID</h1>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
            <p>Loading fingerprint...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-center">Copy this visitor ID into your <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">TRUSTED_FPS</code> environment variable in Vercel:</p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border relative">
              <pre className="text-sm break-all"><code>{visitorId}</code></pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-yellow-400 hover:bg-yellow-500 text-white text-xs px-2 py-1 rounded"
                title="Copy to clipboard"
              >
                Copy
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2"><strong>Instructions:</strong></p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to your Vercel project dashboard</li>
                <li>Navigate to Settings → Environment Variables</li>
                <li>Add a new variable named <code>TRUSTED_FPS</code></li>
                <li>Set the value to the ID above</li>
                <li>Deploy your changes</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
