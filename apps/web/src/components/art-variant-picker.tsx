"use client";
import React from "react";
import { FOIL_HEX, type ArtVariant } from "@/lib/print-art";
interface ArtVariantPickerProps {
  variants: ArtVariant[];
  value: string | undefined;
  onChange: (id: string) => void;
}
export function ArtVariantPicker({ variants, value, onChange }: ArtVariantPickerProps) {
  if (variants.length === 0) {
    return null;
  }
  const activeId = value ?? variants[0]?.id;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="रंग पर्याय">
      {variants.map((v) => {
        const selected = v.id === activeId;
        const ring = FOIL_HEX[v.foil].bright;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v.id)}
            aria-pressed={selected}
            aria-label={`रंग पर्याय: ${v.labelMr}`}
            title={v.labelMr}
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              borderRadius: 9999,
              background: v.bgGradient,
              border: `2px solid ${ring}`,
              boxShadow: selected ? `0 0 0 2px #fff, 0 0 0 4px ${ring}` : "0 1px 2px rgba(0,0,0,0.25)",
              cursor: "pointer",
            }}
          />
        );
      })}
    </div>
  );
}
