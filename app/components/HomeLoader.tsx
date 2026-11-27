"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function HomeLoader() {
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (pathname !== "/") return false;
    if (typeof window !== "undefined") {
      try {
        if (window.sessionStorage.getItem("rgb:loader-seen") === "1") return false;
      } catch {}
    }
    return true;
  });
  const [isExiting, setIsExiting] = useState(false);
  const hasFinished = useRef(false);

  const finishLoader = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }

    try { window.sessionStorage.setItem("rgb:loader-seen", "1"); } catch {}
    setIsExiting(true);
    window.dispatchEvent(new Event("home-loader:reveal"));
  }, []);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasFinished.current) return;

    // Set playback speed to 1.25x for a snappy, fluid, premium experience (~8.2s instead of 10.3s)
    video.playbackRate = 1.25;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          console.warn("Autoplay was prevented or interrupted, finishing loader.", error);
          finishLoader();
        });
      }
    }
  }, [finishLoader]);

  useEffect(() => {
    if (!isVisible) return;

    const video = videoRef.current;
    if (!video) return;

    // Maximum fallback: ensure loader NEVER gets stuck indefinitely
    // 10.3s / 1.25 ≈ 8.2s, so 9.5s is an ample safety window
    fallbackTimerRef.current = setTimeout(() => {
      if (!hasFinished.current) {
        finishLoader();
      }
    }, 9500);

    const handleCanPlay = () => {
      startPlayback();
    };

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.25) {
        finishLoader();
      }
    };

    const handleWaiting = () => {
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      // If stalled for over 2.5s, exit gracefully rather than locking the UI
      stallTimerRef.current = setTimeout(() => {
        if (!hasFinished.current) {
          finishLoader();
        }
      }, 2500);
    };

    const handlePlaying = () => {
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPlayback();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        finishLoader();
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);

    // If media is already buffered/ready to play
    if (video.readyState >= 2) {
      startPlayback();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);

      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    };
  }, [isVisible, startPlayback, finishLoader]);

  if (!isVisible) return null;

  return (
    <div
      data-home-loader
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ease-out will-change-opacity ${
        isExiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading website"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && isExiting) {
          setIsVisible(false);
        }
      }}
    >
      <div className="relative flex items-center justify-center">
        <video
          ref={videoRef}
          className="h-auto max-h-[55vh] w-[min(45vw,420px)] object-contain transform-gpu will-change-transform"
          src="/rgbloader.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onEnded={finishLoader}
          onError={(event) => {
            console.error(
              "Unable to load the home page loader video.",
              event.currentTarget.error,
            );
            finishLoader();
          }}
        />
      </div>

      {/* Subtle Luxury Skip Control */}
      <button
        onClick={finishLoader}
        type="button"
        className="absolute bottom-8 right-8 z-10 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white/40 hover:text-white hover:border-white/50 text-[11px] font-mono tracking-widest uppercase transition-all duration-300 pointer-events-auto cursor-pointer select-none"
        aria-label="Skip loader animation"
      >
        Skip ↗
      </button>
    </div>
  );
}
