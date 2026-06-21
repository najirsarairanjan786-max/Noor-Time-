import React, { useState, useEffect } from "react";
import {
  Heart,
  Share2,
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Settings2,
} from "lucide-react";

interface FeedVideo {
  id: string;
  url: string;
  title: string;
  date: string;
}

const DEFAULT_VIDEOS: FeedVideo[] = [
  {
    id: "v1",
    url: "https://www.w3schools.com/html/mov_bbb.mp4", // Replace with your actual video URL
    title: "ایسے افراد کو اپنے دل سے نکال دو!",
    date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
  },
];

export function NewsFeed() {
  const [videos, setVideos] = useState<FeedVideo[]>(DEFAULT_VIDEOS);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("noor_newsfeed_videos");
      if (stored) {
        setVideos(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load videos from local storage");
    }
  }, []);

  // Save to local storage
  const saveVideos = (updated: FeedVideo[]) => {
    setVideos(updated);
    try {
      localStorage.setItem("noor_newsfeed_videos", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save videos to local storage");
    }
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newVideo: FeedVideo = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      url: newUrl.trim(),
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    saveVideos([newVideo, ...videos]);
    setNewTitle("");
    setNewUrl("");
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      saveVideos(videos.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-6 px-1 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-emerald-100 px-2 drop-shadow-sm">
          Newsfeed
        </h2>
      </div>

      <div className="space-y-6">
        {videos.map((item) => (
          <VideoCard
            key={item.id}
            video={item}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
        {videos.length === 0 && (
          <div className="text-center py-10 bg-emerald-950/40 rounded-2xl border border-emerald-900/30">
            <p className="text-emerald-200/50 text-sm font-medium">
              No videos in the newsfeed yet.
            </p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 min-h-screen z-[100] flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#05110d] rounded-2xl border border-emerald-800/80 shadow-2xl p-5 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-emerald-100 font-bold text-lg">
                Add New Video
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-900/40 text-emerald-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleAddVideo}
              className="flex flex-col gap-4 relative z-10"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-emerald-300 font-medium">
                  Video Title / Caption
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., হযরত বাবা ফরিদ..."
                  className="w-full bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2.5 outline-none "
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-emerald-300 font-medium">
                  Video URL (MP4)
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2.5 outline-none"
                  required
                />
                <span className="text-[10px] text-emerald-400/60 mt-1">
                  Provide a direct link to an MP4 video file.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium text-sm transition-colors shadow-lg"
              >
                Add to Newsfeed
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const VideoCard: React.FC<{
  video: FeedVideo;
  onDelete: () => void;
}> = ({ video, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Auto-play was prevented or interrupted", error);
            setIsPlaying(false);
          });
      } else {
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-emerald-950/60 backdrop-blur-sm border border-emerald-800/40 rounded-3xl overflow-hidden shadow-lg flex flex-col relative">
      <div
        className="relative w-full aspect-video bg-black group cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-cover"
          playsInline
          muted={isMuted}
          onEnded={() => setIsPlaying(false)}
        />
        {/* Play/Pause overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
        >
          <div className="w-14 h-14 rounded-full bg-black/50 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </div>
        </div>
        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/50 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <h3
            className="text-emerald-50 text-base font-semibold leading-snug font-arabic"
            dir="auto"
          >
            {video.title}
          </h3>
          <button
            onClick={onDelete}
            className="text-emerald-500/50 hover:text-red-400 p-1 shrink-0 transition-colors ml-2"
          >
            <Settings2 className="w-4 h-4 opacity-0" />{" "}
            {/* Spacer or future admin button */}
            <span className="sr-only">Delete</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-emerald-900/50 pt-3 mt-1">
          <div className="flex items-center gap-4 text-emerald-400/60">
            <button className="hover:text-pink-500 transition-colors flex items-center gap-1.5 focus:outline-none">
              <Heart className="w-5 h-5" />
            </button>
            <button className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 focus:outline-none">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <span className="bg-emerald-900/50 text-emerald-200/80 text-[11px] font-medium px-2.5 py-1 rounded-full border border-emerald-800/50">
            {video.date}
          </span>
        </div>
      </div>
    </div>
  );
}
