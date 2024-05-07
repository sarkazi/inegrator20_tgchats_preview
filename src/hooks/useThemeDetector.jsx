import { useState, useEffect } from "react";

export const useThemeDetector = () => {
  const [theme, setTheme] = useState(() => {
    return (
      document.documentElement.getAttribute("data-color-scheme") || "light"
    );
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-color-scheme"
        ) {
          const newTheme = document.documentElement.getAttribute(
            "data-color-scheme"
          );
          setTheme(newTheme || "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return theme;
};
