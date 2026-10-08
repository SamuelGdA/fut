import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";
import { cn } from "./cn";

interface TabsRootProps<T extends string> {
  value: T;
  onValueChange(value: T): void;
  values: readonly T[];
  children: ReactNode;
  className?: string;
}

/** Abas controladas por valor textual. Valores fora da lista são ignorados. */
export function TabsRoot<T extends string>({ value, onValueChange, values, children, className }: TabsRootProps<T>) {
  const handleChange = (next: unknown) => {
    const match = values.find((candidate) => candidate === next);
    if (match !== undefined) onValueChange(match);
  };
  return (
    <BaseTabs.Root value={value} onValueChange={handleChange} className={className}>
      {children}
    </BaseTabs.Root>
  );
}

interface TabListProps {
  label: string;
  children: ReactNode;
  /** Cor do sublinhado ativo; "club" segue a cor do clube atual. */
  tone?: "club" | "good" | "glory";
  className?: string;
}

export function TabList({ label, children, tone, className }: TabListProps) {
  return (
    <BaseTabs.List aria-label={label} className={cn("tabs-list", className)} data-tone={tone}>
      {children}
      <BaseTabs.Indicator className="tabs-indicator" />
    </BaseTabs.List>
  );
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  return (
    <BaseTabs.Tab value={value} className="tabs-tab">
      {children}
    </BaseTabs.Tab>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <BaseTabs.Panel value={value} className={cn("tabs-panel", className)}>
      {children}
    </BaseTabs.Panel>
  );
}
