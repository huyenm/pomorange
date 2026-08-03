import { ChangeEvent, useRef, useState } from "react";
import {
  Check,
  ClipboardPaste,
  ImagePlus,
  Link,
  Palette,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DEFAULT_BACKGROUND,
  useBackground,
} from "@/hooks/use-background";

const BACKGROUNDS = [
  { name: "Pomorange cream", color: DEFAULT_BACKGROUND },
  { name: "Soft peach", color: "#FFE4D6" },
  { name: "Warm sand", color: "#F5E6CC" },
  { name: "Sage", color: "#E1EBDD" },
  { name: "Sky", color: "#DDECF7" },
  { name: "Lavender", color: "#E9E1F5" },
];

const BACKGROUND_HISTORY_KEY = "pomorange_background_history";

function getBackgroundHistory(currentImage: string | null) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(BACKGROUND_HISTORY_KEY) || "[]",
    ) as string[];
    return currentImage && !saved.includes(currentImage)
      ? [currentImage, ...saved].slice(0, 4)
      : saved.slice(0, 4);
  } catch {
    return currentImage ? [currentImage] : [];
  }
}

export function BackgroundPicker() {
  const {
    background,
    backgroundImage,
    setBackground,
    setBackgroundImage,
    resetBackground,
  } = useBackground();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [backgroundHistory, setBackgroundHistory] = useState<string[]>(() =>
    getBackgroundHistory(backgroundImage),
  );

  const rememberAndApplyImage = (image: string) => {
    setBackgroundImage(image);
    setBackgroundHistory(current => {
      const next = [image, ...current.filter(item => item !== image)].slice(0, 4);
      try {
        localStorage.setItem(BACKGROUND_HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Keep the gallery available for this session if storage is full.
      }
      return next;
    });
    setError("");
  };

  const applyImageFile = (file: File | Blob) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError(
        "This image is larger than 3 MB. Choose a smaller image so it can be saved reliably.",
      );
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        rememberAndApplyImage(reader.result);
      }
    };
    reader.onerror = () =>
      setUploadError("That image could not be loaded. Please try another file.");
    reader.readAsDataURL(file);
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) applyImageFile(file);
  };

  const applyImageLink = (value = imageLink) => {
    try {
      const url = new URL(value.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      rememberAndApplyImage(url.toString());
      setImageLink(url.toString());
    } catch {
      setError("Enter a valid image link beginning with http:// or https://.");
    }
  };

  const pasteImage = async () => {
    setError("");
    try {
      if (!navigator.clipboard?.read) {
        const copiedText = await navigator.clipboard?.readText?.();
        if (copiedText) {
          setImageLink(copiedText);
          applyImageLink(copiedText);
        } else {
          setError("Clipboard access is not supported by this browser.");
        }
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const image = await item.getType(imageType);
          applyImageFile(image);
          return;
        }
      }

      const copiedText = await navigator.clipboard.readText();
      if (copiedText) {
        setImageLink(copiedText);
        applyImageLink(copiedText);
        return;
      }
      setError("No image or image link was found in your clipboard.");
    } catch {
      setError(
        "Clipboard access was blocked. Allow clipboard permission and try again.",
      );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-4 left-4 z-40 h-11 rounded-full bg-[#F3793A] px-4 text-white shadow-lg hover:bg-[#E86A2B] sm:bottom-6 sm:left-6"
          aria-label="Change site background"
          title="Change background"
        >
          <Palette className="h-4 w-4" />
          <span>Background</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="max-h-[calc(100vh-6rem)] w-80 overflow-y-auto"
      >
        <div className="mb-4">
          <h2 className="font-semibold text-[#41210A]">Site background</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a color or upload an image for every screen.
          </p>
        </div>

        {backgroundHistory.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Previous images
            </p>
            <div className="grid grid-cols-4 gap-2">
              {backgroundHistory.map((image, index) => (
                <div key={`${image.slice(0, 40)}-${index}`} className="group relative">
                  <button
                    type="button"
                    onClick={() => rememberAndApplyImage(image)}
                    className={`h-14 w-full rounded-md bg-cover bg-center shadow-sm ring-offset-2 ${
                      backgroundImage === image
                        ? "ring-2 ring-[#F3793A]"
                        : "ring-1 ring-black/10 hover:ring-[#F3793A]"
                    }`}
                    style={{ backgroundImage: `url("${image.replace(/"/g, '\\"')}")` }}
                    aria-label={`Use previous background ${index + 1}`}
                    aria-pressed={backgroundImage === image}
                  >
                    {backgroundImage === image && (
                      <Check className="m-auto h-4 w-4 rounded-full bg-white/90 p-0.5 text-[#F3793A]" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBackgroundHistory(current => {
                        const next = current.filter(item => item !== image);
                        try {
                          localStorage.setItem(
                            BACKGROUND_HISTORY_KEY,
                            JSON.stringify(next),
                          );
                        } catch {
                          // The gallery still updates for this session.
                        }
                        return next;
                      });
                    }}
                    className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-gray-500 shadow group-hover:flex focus:flex"
                    aria-label={`Remove previous background ${index + 1}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImage}
          className="hidden"
          aria-label="Upload background image"
        />
        <div className="mb-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            {backgroundImage ? "Change image" : "Add image"}
          </Button>
          {backgroundImage && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setBackgroundImage(null)}
              aria-label="Remove background image"
              title="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {uploadError && (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {uploadError}
          </p>
        )}

        <div className="mb-3 rounded-lg bg-orange-50 p-3">
          <div className="mb-2 flex items-start gap-2">
            <ClipboardPaste className="mt-0.5 h-4 w-4 shrink-0 text-[#F3793A]" />
            <div>
              <p className="text-sm font-medium text-[#41210A]">Paste from clipboard</p>
              <p className="text-xs text-muted-foreground">
                Copy an image or image link, then click below.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-white"
            onClick={pasteImage}
          >
            Paste and use background
          </Button>
        </div>

        <div className="mb-4">
          <label
            htmlFor="background-image-link"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"
          >
            <Link className="h-4 w-4 text-[#F3793A]" />
            Use an image link
          </label>
          <div className="flex gap-2">
            <Input
              id="background-image-link"
              type="url"
              value={imageLink}
              onChange={(event) => setImageLink(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyImageLink();
              }}
              placeholder="https://example.com/image.jpg"
              className="h-9"
            />
            <Button
              type="button"
              size="sm"
              className="btn-primary h-9 px-3"
              onClick={() => applyImageLink()}
              disabled={!imageLink.trim()}
            >
              Use
            </Button>
          </div>
        </div>
        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="grid grid-cols-6 gap-2" aria-label="Background presets">
          {BACKGROUNDS.map(({ name, color }) => {
            const selected = background.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                aria-label={name}
                aria-pressed={selected}
                title={name}
                onClick={() => {
                  setBackground(color);
                  setBackgroundImage(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4F301D]/30 shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3793A] focus-visible:ring-offset-2"
                style={{ backgroundColor: color }}
              >
                {selected && <Check className="h-4 w-4 text-[#41210A]" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
          <label
            htmlFor="custom-background"
            className="cursor-pointer text-sm font-medium"
          >
            Custom color
          </label>
          <input
            id="custom-background"
            type="color"
            value={background}
            onChange={(event) => {
              setBackground(event.target.value);
              setBackgroundImage(null);
            }}
            className="h-9 w-14 cursor-pointer rounded border bg-white p-1"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetBackground}
          className="mt-3 w-full justify-center"
          disabled={
            !backgroundImage &&
            background.toLowerCase() === DEFAULT_BACKGROUND.toLowerCase()
          }
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to default
        </Button>
      </PopoverContent>
    </Popover>
  );
}
