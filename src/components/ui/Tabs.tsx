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
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const { value: activeValue, setValue } = context;
  const active = value === activeValue;

  return (
    <button
      onClick={() => setValue(value)}
      data-state={active ? "active" : "inactive"}
      className={className}
      style={{
        padding: "8px 16px",
        border: "none",
        borderRadius: "8px",
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
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  return context.value === value ? <div className={className} style={{ marginTop: 24 }}>{children}</div> : null;
}
