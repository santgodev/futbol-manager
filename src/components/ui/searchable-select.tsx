"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown } from "lucide-react";

type Option = { value: string; label: string };

export function SearchableSelect({ id, options, value, onValueChange, placeholder = "Buscar...", disabled = false }: {
  id: string;
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Combobox.Root items={options} value={options.find((option) => option.value === value) ?? null}
      onValueChange={(option) => onValueChange(option?.value ?? "")} disabled={disabled}>
      <div className="relative">
        <Combobox.Input id={id} placeholder={placeholder}
          className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 pr-11 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:text-sm" />
        <Combobox.Trigger aria-label="Mostrar opciones" className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronsUpDown className="size-4" />
        </Combobox.Trigger>
      </div>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className="z-50 w-[var(--anchor-width)] max-w-[calc(100vw-32px)]">
          <Combobox.Popup className="overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg">
            <Combobox.Empty className="p-3 text-sm text-text-secondary">Sin resultados</Combobox.Empty>
            <Combobox.List className="max-h-64 overflow-y-auto">
              {(option: Option) => (
                <Combobox.Item key={option.value} value={option} className="flex min-h-11 cursor-default items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none data-highlighted:bg-secondary">
                  <span className="min-w-0 flex-1 break-words">{option.label}</span>
                  <Combobox.ItemIndicator><Check className="size-4" /></Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
