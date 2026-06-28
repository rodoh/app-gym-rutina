import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-glow",
  secondary: "border border-line bg-panelSoft text-white",
  ghost: "bg-transparent text-zinc-300",
  danger: "border border-red-500/40 bg-red-500/10 text-red-100"
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-12 rounded-xl px-4 py-3 text-center text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string; children: ReactNode }) {
  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-black transition active:scale-[0.98] ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
