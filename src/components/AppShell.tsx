"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Hoy", icon: "H" },
  { href: "/routine", label: "Rutina", icon: "R" },
  { href: "/progress", label: "Historial", icon: "P" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-5 sm:px-6 lg:px-8">
      <header className="mb-5 flex items-center justify-between gap-4">
        <Link href="/" className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Rodri</p>
          <h1 className="truncate text-2xl font-black text-white">Rutina Fuerza</h1>
        </Link>
        <Link
          href="/routine"
          className="rounded-full border border-line bg-panelSoft px-4 py-2 text-sm font-bold text-zinc-100"
        >
          Editar
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/92 px-4 pt-2 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center rounded-xl text-xs font-bold ${
                  active ? "bg-accent text-white" : "text-zinc-400"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
