import { FormEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Music2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MUSIC_KEY = "pomorange_background_music";

type SavedMusic = {
  url: string;
  videoId: string;
};

function getSavedMusic(): SavedMusic | null {
  try {
    const saved = localStorage.getItem(MUSIC_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as SavedMusic;
    return parsed.url && parsed.videoId ? parsed : null;
  } catch {
    return null;
  }
}

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(parts[0])) {
        return parts[1] || null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function BackgroundMusicPlayer() {
  const [music, setMusic] = useState<SavedMusic | null>(getSavedMusic);
  const [link, setLink] = useState(music?.url || "");
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
      if (
        event.source !== playerRef.current?.contentWindow ||
        (!event.origin.includes("youtube.com") &&
          !event.origin.includes("youtube-nocookie.com"))
      ) {
        return;
      }

      try {
        const message =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (message?.event === "onStateChange") {
          setIsPlaying(message.info === 1);
        }
      } catch {
        // Ignore unrelated messages from the embedded player.
      }
    };

    window.addEventListener("message", handlePlayerMessage);
    return () => window.removeEventListener("message", handlePlayerMessage);
  }, []);

  const connectPlayerEvents = () => {
    const playerWindow = playerRef.current?.contentWindow;
    if (!playerWindow) return;

    const subscribe = () => {
      playerWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "addEventListener",
          args: ["onStateChange"],
        }),
        "*",
      );
      playerWindow.postMessage(
        JSON.stringify({ event: "listening", id: "pomorange-music-player" }),
        "*",
      );
    };

    subscribe();
    window.setTimeout(subscribe, 750);
  };

  const saveMusic = (event: FormEvent) => {
    event.preventDefault();
    const videoId = getYouTubeVideoId(link);

    if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
      setError("Enter a valid YouTube video link.");
      return;
    }

    const nextMusic = { url: link.trim(), videoId };
    setMusic(nextMusic);
    setIsPlaying(false);
    setError("");
    try {
      localStorage.setItem(MUSIC_KEY, JSON.stringify(nextMusic));
    } catch {
      // Music remains available for this session.
    }
  };

  const removeMusic = () => {
    setMusic(null);
    setIsPlaying(false);
    setLink("");
    setError("");
    try {
      localStorage.removeItem(MUSIC_KEY);
    } catch {
      // The player is still cleared for this session.
    }
  };

  return (
    <section
      className={`fixed bottom-4 right-4 z-40 rounded-xl border border-orange-200 bg-white/90 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#211d1a]/95 sm:bottom-6 sm:right-6 ${
        expanded ? "w-[calc(100vw-2rem)] max-w-xs" : "w-fit"
      }`}
      aria-label="Background music"
    >
      <div className="flex h-11 items-center gap-2 px-3">
        <Music2 className="h-4 w-4 text-[#F3793A]" />
        <span className="flex-1 text-sm font-semibold text-[#41210A]">
          Background music
        </span>
        {music && isPlaying && (
          <span
            className="music-playing-indicator"
            title="Music is playing"
            role="img"
            aria-label="Music is playing"
          >
            <span />
            <span />
            <span />
          </span>
        )}
        {music && !isPlaying && (
          <span
            className="h-2 w-2 rounded-full bg-[#94A3B8]"
            title="Music is paused"
            aria-label="Music is paused"
          />
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setExpanded((current) => !current)}
          aria-label={expanded ? "Collapse music player" : "Open music player"}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className={expanded ? "border-t p-3" : "hidden"}>
        {music && (
          <div className="mb-3 overflow-hidden rounded-lg bg-black">
            <iframe
              ref={playerRef}
              className="aspect-video w-full"
              src={`https://www.youtube-nocookie.com/embed/${music.videoId}?playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
              title="YouTube background music player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={connectPlayerEvents}
              allowFullScreen
            />
          </div>
        )}

        <form onSubmit={saveMusic} className="space-y-2">
          <label
            htmlFor="background-music-link"
            className="text-sm font-medium text-[#41210A]"
          >
            YouTube link
          </label>
          <Input
            id="background-music-link"
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            aria-describedby={error ? "music-link-error" : undefined}
          />
          {error && (
            <p
              id="music-link-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1 btn-primary">
              {music ? "Change music" : "Add music"}
            </Button>
            {music && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={removeMusic}
                aria-label="Remove background music"
                title="Remove music"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
