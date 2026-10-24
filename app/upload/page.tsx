
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@imagekit/next";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
const [progress, setProgress] = useState(0); 
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }

    if (selected.size > 100 * 1024 * 1024) {
      setError("Video must be smaller than 100 MB.");
      return;
    }

    setError("");
    setFile(selected);

    setPreview((oldPreview) => {
      if (oldPreview) URL.revokeObjectURL(oldPreview);
      return URL.createObjectURL(selected);
    });
  }

 
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError("");

  if (!file) {
    setError("Please select a video first.");
    return;
  }

  if (!caption.trim()) {
    setError("Please enter a caption.");
    return;
  }

  setUploading(true);
  setProgress(0);

  try {
    // 1. Get secure upload credentials from our server
    const authResponse = await fetch("/api/auth/imagekit-auth");
    const authData = await authResponse.json();

    if (!authResponse.ok) {
      throw new Error(authData.error || "ImageKit authentication failed.");
    }

    const credentials = authData.authenticationParameters;

    if (
      !credentials?.token ||
      !credentials?.signature ||
      !credentials?.expire ||
      !authData.publicKey
    ) {
      throw new Error("ImageKit credentials are incomplete. Check your configuration.");
    }

    // 2. Upload the video file to ImageKit
    const uploaded = await upload({
      file,
      fileName: file.name,
      publicKey: authData.publicKey,
      token: credentials.token,
      signature: credentials.signature,
      expire: credentials.expire,
      onProgress: (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });

    if (!uploaded.url) {
      throw new Error("ImageKit did not return a video URL.");
    }

    // 3. Save the video details to MongoDB through our API
    const saveResponse = await fetch("/api/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: caption.trim(),
        description: caption.trim(),
        videoUrl: uploaded.url,
        thumbnailUrl: `${uploaded.url}?tr=so-1`,
      }),
    });

    const savedVideo = await saveResponse.json();

    if (!saveResponse.ok) {
      throw new Error(
        savedVideo.error ||
          (saveResponse.status === 401
            ? "Please log in before uploading."
            : "Video uploaded, but saving it failed.")
      );
    }

    // 4. Upload and database save succeeded
    window.location.href = "/";
  } catch (err) {
    console.error("Video upload failed:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong while uploading your video."
    );
  } finally {
    setUploading(false);
  }
}


  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <Link href="/" className="text-2xl font-black">
          Reels<span className="text-pink-500">Pro</span>
        </Link>

        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to feed
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10 md:py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
            Creator Studio
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Create a reel
          </h1>

          <p className="mt-3 text-gray-400">
            Share your moment with the ReelsPro community.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 md:grid-cols-2"
        >
          {/* Video selection and preview */}
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative flex aspect-[9/14] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/[0.03] transition hover:border-pink-500"
            >
              {preview ? (
                <video
                  src={preview}
                  controls
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain"
                />
              ) : (
                <>
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/15 text-3xl text-pink-400">
                    +
                  </span>

                  <span className="font-semibold">
                    Select your video
                  </span>

                  <span className="mt-2 text-sm text-gray-500">
                    MP4, WebM or other supported video
                  </span>

                  <span className="mt-1 text-xs text-gray-600">
                    Maximum size: 100 MB
                  </span>
                </>
              )}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {file && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview((old) => {
                      if (old) URL.revokeObjectURL(old);
                      return "";
                    });
                    if (fileRef.current) {
                      fileRef.current.value = "";
                    }
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Caption and publishing details */}
          <div className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="caption"
                className="mb-2 block text-sm font-semibold"
              >
                Caption
              </label>

              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
                rows={5}
                placeholder="Write something about your reel..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm outline-none placeholder:text-gray-600 focus:border-pink-500"
              />

              <p className="mt-2 text-right text-xs text-gray-500">
                {caption.length}/500
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="font-semibold">Publishing checklist</h2>

              <p className="mt-3 text-sm text-gray-400">
                ✓ Video selected
              </p>

              <p className="mt-2 text-sm text-gray-400">
                ✓ Caption ready
              </p>

              <p className="mt-2 text-sm text-gray-400">
                • ImageKit upload and database save
              </p>
            </div>

            {error && (
              <p
                role="status"
                className="rounded-lg bg-pink-500/10 p-3 text-sm text-pink-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl 
              bg-gradient-to-r from-pink-600 to-violet-600 px-5 py-3.5 font-semibold transition hover:brightness-110"
               disabled={uploading}
            >
                {uploading ? `Uploading... ${progress}%` : "Upload video"}
            </button>
{uploading && (
  <p className="mt-3 text-sm text-gray-400">
    Uploading video to ImageKit: {progress}%
  </p>
)}
            <p className="text-center text-xs text-gray-500">
              Your reel won't be published until the upload is complete.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
