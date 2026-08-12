"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { GlobeIcon } from "./icons/GlobeIcon";

/**
 * One component, one appearance, in the navbar on every page and every
 * breakpoint (CLAUDE.md: Design — "Language switcher"). A dropdown: globe
 * symbol plus the language name in its own script. Same pattern as
 * MobileNav's disclosure (plain links, no menu/listbox ARIA role — those
 * imply arrow-key roving behaviour this component doesn't implement, so
 * using them would be a correctness bug, not a nicety) — just a labelled,
 * expandable/collapsible list of real links, which are keyboard-operable on
 * their own.
 */
export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common.localeNames");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={popupId}
        className="flex items-center gap-1.5 border border-secondary px-2.5 py-1.5 text-xs text-secondary-shade-2"
      >
        <GlobeIcon className="h-3.5 w-3.5 shrink-0" />
        <span className={locale === "ar" ? "font-arabic text-[13px]" : ""}>{t(locale)}</span>
      </button>
      {open && (
        <div
          id={popupId}
          className="absolute end-0 top-full z-20 mt-1 min-w-[9rem] border border-secondary/60 bg-secondary-shade-2"
        >
          {routing.locales.map((l) => (
            <Link
              key={l}
              href={pathname}
              locale={l}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm no-underline text-primary ${
                l === locale ? "bg-primary text-secondary-shade-2" : ""
              } ${l === "ar" ? "font-arabic text-[16px]" : ""}`}
            >
              {t(l)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
