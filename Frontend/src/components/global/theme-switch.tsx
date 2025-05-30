// src/globales/ThemeSwitch.tsx
import React, { useEffect, useState } from "react";
import { Switch } from "@nextui-org/react";
import { SunFilledIcon, MoonFilledIcon } from "../global/icons"; // Ajusta la ruta

export const ThemeSwitch: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setIsDark(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Switch
      isSelected={isDark}
      onChange={toggleTheme}
      thumbIcon={isDark ? <MoonFilledIcon size={16} /> : <SunFilledIcon size={16} />}
    />
  );
};

export default ThemeSwitch;