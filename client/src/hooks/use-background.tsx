import { createContext, useContext, useEffect, useMemo, useState } from "react";

const BACKGROUND_KEY = "pomorange_background";
const BACKGROUND_IMAGE_KEY = "pomorange_background_image";
export const DEFAULT_BACKGROUND = "#FEF5F0";

type BackgroundContextValue = {
  background: string;
  backgroundImage: string | null;
  setBackground: (color: string) => void;
  setBackgroundImage: (image: string | null) => void;
  resetBackground: () => void;
};

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

function getSavedBackground() {
  try {
    return localStorage.getItem(BACKGROUND_KEY) || DEFAULT_BACKGROUND;
  } catch {
    return DEFAULT_BACKGROUND;
  }
}

function getSavedBackgroundImage() {
  try {
    return localStorage.getItem(BACKGROUND_IMAGE_KEY);
  } catch {
    return null;
  }
}

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [background, setBackgroundState] = useState(getSavedBackground);
  const [backgroundImage, setBackgroundImageState] = useState(
    getSavedBackgroundImage,
  );

  const setBackground = (color: string) => {
    setBackgroundState(color);
    try {
      localStorage.setItem(BACKGROUND_KEY, color);
    } catch {
      // The selected background still applies for this session.
    }
  };

  const setBackgroundImage = (image: string | null) => {
    setBackgroundImageState(image);
    try {
      if (image) {
        localStorage.setItem(BACKGROUND_IMAGE_KEY, image);
      } else {
        localStorage.removeItem(BACKGROUND_IMAGE_KEY);
      }
    } catch {
      // The selected image still applies for this session.
    }
  };

  const resetBackground = () => {
    setBackgroundState(DEFAULT_BACKGROUND);
    setBackgroundImageState(null);
    try {
      localStorage.removeItem(BACKGROUND_KEY);
      localStorage.removeItem(BACKGROUND_IMAGE_KEY);
    } catch {
      // The default background still applies for this session.
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--site-background", background);
  }, [background]);

  const value = useMemo(
    () => ({
      background,
      backgroundImage,
      setBackground,
      setBackgroundImage,
      resetBackground,
    }),
    [background, backgroundImage],
  );

  return (
    <BackgroundContext.Provider value={value}>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundColor: background,
          backgroundImage: backgroundImage
            ? `url("${backgroundImage.replace(/"/g, '\\"')}")`
            : undefined,
          backgroundAttachment: "fixed",
        }}
      >
        {children}
      </div>
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used inside BackgroundProvider");
  }
  return context;
}
