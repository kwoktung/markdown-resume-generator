"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AutoSaveContextType {
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
}

const AutoSaveContext = createContext<AutoSaveContextType | undefined>(
  undefined,
);

type AutoSaveProviderProps = {
  children: React.ReactNode;
  persistKey?: string;
};

export function AutoSaveProvider({
  children,
  persistKey = "editor-auto-save-enabled",
}: AutoSaveProviderProps) {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(persistKey);
    if (stored !== null) {
      setAutoSaveEnabled(stored === "true");
    }
    setMounted(true);
  }, [persistKey]);

  // Save preference to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(persistKey, String(autoSaveEnabled));
    }
  }, [autoSaveEnabled, mounted, persistKey]);

  return (
    <AutoSaveContext.Provider value={{ autoSaveEnabled, setAutoSaveEnabled }}>
      {children}
    </AutoSaveContext.Provider>
  );
}

export function useAutoSave() {
  const context = useContext(AutoSaveContext);
  if (context === undefined) {
    throw new Error("useAutoSave must be used within an AutoSaveProvider");
  }
  return context;
}
