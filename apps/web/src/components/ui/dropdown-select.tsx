"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownSelectProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
};

export function DropdownSelect({
  value,
  options,
  onChange,
  label,
  disabled = false,
  className = "",
  compact = false,
}: DropdownSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.findIndex((option) => option.value === value)));

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function toggleOpen() {
    if (disabled) return;
    if (!isOpen) {
      const selectedIndex = options.findIndex((option) => option.value === value);
      setActiveIndex(Math.max(0, selectedIndex));
    }
    setIsOpen((current) => !current);
  }

  function selectActiveOption() {
    const option = options[activeIndex];
    if (option) onChange(option.value);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleOpen();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(0, options.length - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectActiveOption();
    }
  }

  return (
    <div ref={rootRef} className={`cm-dropdown ${compact ? "cm-dropdown--compact" : ""} ${className}`}>
      <button
        type="button"
        className="cm-dropdown__trigger"
        id={`${listId}-trigger`}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen ? `${listId}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
      >
        <span className="cm-dropdown__value">{selected?.label ?? value}</span>
        <svg className={`cm-dropdown__chevron ${isOpen ? "is-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="cm-dropdown__menu" id={listId} role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`cm-dropdown__option ${index === activeIndex ? "is-active" : ""} ${option.value === value ? "is-selected" : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4 10 4 4 8-8" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}