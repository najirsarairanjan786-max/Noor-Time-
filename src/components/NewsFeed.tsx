import React, { useState, useEffect } from "react";
import {
  Heart,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "@/src/lib/icons";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface FeedVideo {
  id: string;
  url: string;
  title: string;
  category?: string;
  thumbnail?: string;
  duration?: string;
  date?: string;
  createdAt?: number;
}

export function NewsFeed() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Firebase
  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vids: FeedVideo[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        vids.push({
          id: doc.id,
          url: data.url,
          title: data.title,
          category: data.category,
          thumbnail: data.thumbnail,
          duration: data.duration,
          date: data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }) : "Recent",
          createdAt: data.createdAt
        });
      });
      setVideos(vids);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-lg mx-auto pb-6 px-1 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-emerald-100 px-2 drop-shadow-sm">
          Videos
        </h2>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-emerald-200/60 text-sm">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-10 bg-emerald-950/40 rounded-2xl border border-emerald-900/30">
            <p className="text-emerald-200/50 text-sm font-medium">
              No videos available right now.
            </p>
          </div>
        ) : (
          videos.map((item) => (
            <VideoCard
              key={item.id}
              video={item}
            />
          ))
        )}
      </div>
    </div>
  );
}

const VideoCard: React.FC<{
  video: FeedVideo;
}> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/shorts/")) {
      videoId = url.split("shorts/")[1]?.split("?")[0];
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

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

  const isYouTube = isYouTubeUrl(video.url);

  return (
    <div className="bg-emerald-950/60 backdrop-blur-sm border border-emerald-800/40 rounded-3xl overflow-hidden shadow-lg flex flex-col relative">
      <div
        className="relative w-full aspect-video bg-black group cursor-pointer"
        onClick={!isYouTube ? togglePlay : undefined}
      >
        {isYouTube ? (
          <iframe 
            src={getYouTubeEmbedUrl(video.url)} 
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <>
            <video
              ref={videoRef}
              src={video.url}
              poster={video.thumbnail}
              className="w-full h-full object-cover"
              playsInline
              muted={isMuted}
              onEnded={() => setIsPlaying(false)}
            />
            {/* Play/Pause overlay for native video */}
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
            {/* Mute toggle for native video */}
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
          </>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <h3
            className="text-emerald-50 text-base font-semibold leading-snug font-arabic"
            dir="auto"
          >
            {video.title}
          </h3>
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
          <div className="flex gap-2">
            {video.category && (
              <span className="bg-emerald-800/30 text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-emerald-700/30 uppercase tracking-wider">
                {video.category}
              </span>
            )}
            <span className="bg-emerald-900/50 text-emerald-200/80 text-[11px] font-medium px-2.5 py-1 rounded-full border border-emerald-800/50">
              {video.date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

