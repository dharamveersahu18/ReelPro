
"use client";

import Link from "next/link";
import { useEffect, useState,useRef } from "react";

type Reel = {
  _id: string;
  video: string;
  username: string;
  caption: string;
  music: string;
  likes: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("For You");
  const [reels, setReels] = useState<Reel[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/video");

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid video data received from server");
        }

        const formattedReels: Reel[] = data.map(
          (video: {
            _id: string;
            videoUrl: string;
            title: string;
            description: string;
          }) => ({
            _id: video._id,
            video: video.videoUrl,
            username: "creator",
            caption: video.description || video.title,
            music: "Original audio",
            likes: "0",
          })
        );

        setReels(formattedReels);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  useEffect(() => {
  const videos = videoRefs.current.filter(
    (video): video is HTMLVideoElement => video !== null
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          videos.forEach((otherVideo) => {
            if (otherVideo !== video) {
              otherVideo.pause();
            }
          });

          video.play().catch((error) => {
            console.log("Video playback requires user interaction:", error);
          });
        } else {
          video.pause();
        }
      });
    },
    { threshold: [0, 0.6, 1] }
  );

  videos.forEach((video) => observer.observe(video));

  return () => observer.disconnect();
}, [reels]);
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 z-20 flex w-full items-center justify-between bg-black/80 px-5 py-4 backdrop-blur-md">
        <Link href="/" className="text-2xl font-black tracking-tight">
          Reels<span className="text-pink-500">Pro</span>
        </Link>

        <div className="flex gap-5 text-sm font-semibold">
          {["Following", "For You"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "border-b-2 border-pink-500 pb-1"
                  : "text-gray-500"
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <Link href="/upload" aria-label="Upload a reel">
          <span className="text-2xl">＋</span>
        </Link>
      </header>

      {/* Reels feed */}
      <section className="mx-auto max-w-md pt-16 pb-20">
        {loading && (
          <p className="py-12 text-center text-gray-400">
            Loading videos...
          </p>
        )}

        {!loading && reels.length === 0 && (
          <p className="py-12 text-center text-gray-400">
            No videos uploaded yet. Upload your first reel!
          </p>
        )}

        {!loading &&
          reels.map((reel,index) => (
            <article
              key={reel._id}
              className="relative h-[calc(100dvh-9rem)] min-h-[480px] overflow-hidden border-b border-white/10 bg-gray-900"
            >
              <video
                ref={(element) => {
    videoRefs.current[index] = element;
  }}

                src={reel.video}
                className="absolute inset-0 h-full w-full object-cover"
                
                loop
                muted
                playsInline
                controls
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Reel details */}
              <div className="absolute bottom-6 left-4 right-20 z-10">
                <h2 className="text-lg font-bold">@{reel.username}</h2>

                <p className="mt-2 text-sm">{reel.caption}</p>

                <p className="mt-3 text-xs text-gray-300">
                  ♪ {reel.music}
                </p>
              </div>

              {/* Action buttons */}
              <div className="absolute bottom-8 right-3 z-10 flex flex-col items-center gap-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-600 font-bold">
                  {reel.username[0]?.toUpperCase()}
                </div>

                <button
                  onClick={() =>
                    setLiked((prev) =>
                      prev.includes(reel._id)
                        ? prev.filter((id) => id !== reel._id)
                        : [...prev, reel._id]
                    )
                  }
                  className="text-center"
                >
                  <span className="block text-2xl">
                    {liked.includes(reel._id) ? "❤️" : "🤍"}
                  </span>

                  <span className="text-xs">
                    {liked.includes(reel._id) ? "Liked" : reel.likes}
                  </span>
                </button>

                <button className="text-center">
                  <span className="block text-2xl">💬</span>
                  <span className="text-xs">Comment</span>
                </button>

                <button className="text-center">
                  <span className="block text-2xl">↗</span>
                  <span className="text-xs">Share</span>
                </button>
              </div>
            </article>
          ))}
      </section>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 z-20 flex w-full justify-around border-t border-white/10 bg-black px-3 py-3">
        <Link href="/" className="text-center text-pink-500">
          <span className="block text-xl">⌂</span>
          <span className="text-xs">Home</span>
        </Link>

        <Link href="/explore" className="text-center text-gray-400">
          <span className="block text-xl">⌕</span>
          <span className="text-xs">Explore</span>
        </Link>

        <Link href="/upload" className="text-center text-gray-400">
          <span className="block text-xl">⊕</span>
          <span className="text-xs">Upload</span>
        </Link>

        <Link href="/profile" className="text-center text-gray-400">
          <span className="block text-xl">♙</span>
          <span className="text-xs">Profile</span>
        </Link>
      </nav>
    </main>
  );
}
