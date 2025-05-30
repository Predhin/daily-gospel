"use client";

/* eslint-disable react/no-unescaped-entities */
import { useState, useRef } from "react";
import Image from "next/image";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "gospel2025";

export default function AdminGospelUpload() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Incorrect password.");
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");    try {
      const formData = new FormData();
      formData.append("date", date);
      formData.append("text", text || "");  // Always append text, even if empty
      if (fileInputRef.current?.files?.[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }

      const res = await fetch("/api/gospel", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Gospel uploaded successfully!");
        setText("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage(data.error || "Failed to upload gospel.");
      }
    } catch {
      setMessage("Failed to upload. Please try again.");
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
        />        <label className="font-semibold">Gospel Text (Optional)</label>
        <textarea
          className="p-2 rounded border min-h-[120px]"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          placeholder="Enter gospel text or upload an image below"
        />        <label className="font-semibold">
          Upload Image (Optional)
          <span className="block text-sm font-normal text-gray-600 space-y-1">
            <p>You can:</p>
            <ul className="list-disc pl-5">
              <li>Take a photo with your camera</li>
              <li>Choose an image from your gallery</li>
              <li>Paste a screenshot (on desktop)</li>
            </ul>
          </span>
        </label>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="p-2 rounded border w-full"
            capture="environment"
            onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
              const items = e.clipboardData?.items;
              const imageItem = Array.from(items).find(item => item.type.startsWith("image/"));
              if (imageItem) {
                const file = imageItem.getAsFile();
                if (file && fileInputRef.current) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  fileInputRef.current.files = dataTransfer.files;
                  handleImageChange({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
                }
              }
            }}
          />          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded min-w-[120px]"
            >
              Choose Image
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute("capture", "environment");
                  fileInputRef.current.click();
                }
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded min-w-[120px]"
            >
              Take Photo
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  if (navigator.clipboard?.read) {
                    const clipboardItems = await navigator.clipboard.read();
                    for (const clipboardItem of clipboardItems) {
                      for (const type of clipboardItem.types) {
                        if (type.startsWith("image/")) {
                          const blob = await clipboardItem.getType(type);
                          const file = new File([blob], "pasted-image.png", { type });
                          if (fileInputRef.current) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            fileInputRef.current.files = dataTransfer.files;
                            handleImageChange({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
                          }
                          return;
                        }
                      }
                    }
                  }
                  const permission = await navigator.permissions.query({
                    name: "clipboard-read" as PermissionName
                  });
                  if (permission.state === "denied") {
                    alert("Please allow clipboard access to paste images");
                    return;
                  }
                  alert("No image found in clipboard. Please copy an image first.");
                } catch (error) {
                  console.error("Error accessing clipboard:", error);
                  alert("Could not access clipboard. Please try another method.");
                }
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded min-w-[120px]"
            >
              Paste from Clipboard
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Tip: On WhatsApp, long press an image and select "Copy" to paste it here
          </p>
        </div>

        {imagePreview && (
          <div className="relative w-full h-48 mt-2">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-contain rounded border"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}

        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={loading || (!text && !imagePreview)}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        {message && <div className="text-center mt-2 text-green-700 dark:text-green-300">{message}</div>}
      </form>
    </div>
  );
}
