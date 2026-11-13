"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: number | string;
  label: string;
  badge?: string;
}

export interface CustomDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: DropdownOption[];
  selectedValue: number | string;
  onSelect: (value: number | string) => void;
  className?: string;
  ariaLabel?: string;
  align?: "left" | "right" | "auto";
}

export function CustomDropdown({
  label,
  icon,
  options,
  selectedValue,
  onSelect,
  className = "",
  ariaLabel,
  align = "auto",
}: CustomDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption =
    options.find((opt) => String(opt.value) === String(selectedValue)) || options[0];

  const alignmentClasses =
    align === "left"
      ? "left-0 origin-top-left"
      : align === "right"
      ? "right-0 origin-top-right"
      : "left-0 sm:left-auto sm:right-0 origin-top-left sm:origin-top-right";

  // Cerrar al pulsar fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSelectOption = (value: number | string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Botón Gatillo (Trigger) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || label}
        className={`flex items-center gap-1.5 rounded-poster border border-border-active bg-surface-active px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover ${
          isOpen ? "ring-1 ring-accent border-accent" : ""
        }`}
      >
        {icon && <span className="text-accent">{icon}</span>}
        <span className="truncate max-w-[150px]">{selectedOption?.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform duration-150 ${
            isOpen ? "rotate-180 text-accent" : ""
          }`}
        />
      </button>

      {/* Menú Flotante Animado (Popover) */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel || label}
          className={`absolute z-50 mt-1.5 min-w-[180px] max-w-[calc(100vw-2.5rem)] sm:max-w-[280px] max-h-64 overflow-y-auto rounded-poster border border-border-active bg-surface p-1 shadow-lg motion-safe:animate-pop focus:outline-none ${alignmentClasses}`}
        >
          {options.map((option) => {
            const isSelected = String(option.value) === String(selectedValue);
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelectOption(option.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectOption(option.value);
                  }
                }}
                className={`flex items-center justify-between rounded-poster px-3 py-2 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-surface-active text-accent font-semibold"
                    : "text-foreground hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
                  <span className="truncate">{option.label}</span>
                </div>

                {option.badge && (
                  <span className="ml-2 shrink-0 rounded-poster bg-surface-active px-1.5 py-0.5 text-xs text-muted border border-border">
                    {option.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
