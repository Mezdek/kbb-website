import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "donate"
  | "inactive"
  | "utility"
  | "utilityOnDark";

// No radius, no shadow — flat surfaces and hairlines, per the component
// sheet ("Keine Radien, keine Schatten... wie in einem gesetzten Buch").
// max-md:min-h-11 guarantees a 44px tap target on the phone without forcing
// the same height on the compact desktop utility chips.
const BASE = "inline-flex items-center justify-center gap-2 max-md:min-h-11 no-underline";

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: `${BASE} bg-primary text-secondary-shade-2 px-6 py-3 text-[15px]`,
  secondary: `${BASE} border border-primary text-primary bg-transparent px-6 py-3 text-[15px]`,
  donate: `${BASE} bg-flair-shade-2 text-secondary-shade-2 px-5 py-2.5 text-[15px]`,
  inactive: `${BASE} border border-secondary/60 text-text-secondary bg-transparent px-6 py-3 text-[15px]`,
  // For light/paper surfaces (component sheet, card toolbars).
  utility: `${BASE} border border-secondary text-primary-shade-1 bg-transparent px-4 py-2 text-sm`,
  // For dark-green surfaces (the prayer band) — `utility`'s dark text would
  // be invisible against this background.
  utilityOnDark: `${BASE} border border-secondary text-secondary-shade-2 bg-transparent px-4 py-2 text-sm`,
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: { variant?: ButtonVariant; className?: string } & ComponentProps<typeof Link>) {
  return <Link className={`${BUTTON_VARIANT_CLASSES[variant]} ${className}`.trim()} {...props} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: ButtonVariant; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${BUTTON_VARIANT_CLASSES[variant]} ${className}`.trim()} {...props} />;
}
