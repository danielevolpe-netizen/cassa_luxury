"use client";

import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

const norm = (s: string) => s.trim().toLowerCase();

export function CounterpartyCombobox({
  name = "counterparty",
  options,
  defaultValue = "",
  placeholder = "Cerca o aggiungi…",
}: {
  name?: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const q = norm(value);
    const list = q
      ? options.filter((o) => norm(o).includes(q))
      : options;
    return list.slice(0, 50);
  }, [options, value]);

  const exact = options.some((o) => norm(o) === norm(value));
  const showCreate = value.trim().length > 0 && !exact;

  function choose(v: string) {
    setValue(v);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        name={name}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Ritarda la chiusura così il click su un'opzione viene registrato.
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter") {
            // Evita il submit del form quando il dropdown è aperto.
            if (open) e.preventDefault();
            setOpen(false);
          }
        }}
      />

      {open && (filtered.length > 0 || showCreate) ? (
        <ul
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 text-sm shadow-md"
          onMouseDown={(e) => {
            // Mantiene il focus sull'input durante il click.
            e.preventDefault();
            if (blurTimer.current) clearTimeout(blurTimer.current);
          }}
        >
          {filtered.map((o) => (
            <li key={o}>
              <button
                type="button"
                onClick={() => choose(o)}
                className="flex w-full items-center px-3 py-1.5 text-left hover:bg-muted"
              >
                {o}
              </button>
            </li>
          ))}
          {showCreate ? (
            <li>
              <button
                type="button"
                onClick={() => choose(value.trim())}
                className="flex w-full items-center gap-1 px-3 py-1.5 text-left text-primary hover:bg-muted"
              >
                + Aggiungi «{value.trim()}»
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
