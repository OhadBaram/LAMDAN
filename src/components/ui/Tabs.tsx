import React, { useState, createContext, useContext, ReactNode } from "react";

type TabsContextType = {
  value: string;
  setValue: (val: string) => void;
};
const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (val: string) => void;
  children: ReactNode;
}) {
  return (
    <TabsContext.Provider value={{ value, setValue: onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", gap: 8, ...style }}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const { value: activeValue, setValue } = context;
  const active = value === activeValue;

  return (
    <button
      onClick={() => setValue(value)}
      style={{
        padding: "8px 16px",
        border: "none",
        borderRadius: "8px",
        background: active ? "#1976d2" : "#e0e0e0",
        color: active ? "#fff" : "#333",
        fontWeight: active ? "bold" : "normal",
        cursor: "pointer",
        fontSize: "1rem",
        transition: "background 0.2s",
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  return context.value === value ? <div style={{ marginTop: 24 }}>{children}</div> : null;
}
