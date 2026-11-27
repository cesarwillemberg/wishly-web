"use client";

import { ChevronRight, MoreVertical, Settings } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";

import { Avatar } from "@/components/avatar";
import { ThemeMenu } from "@/components/theme-menu";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/components/ui/dropdown-menu";
import type { SessionUser } from "@/lib/api/parse";

const UserContext = createContext<SessionUser | null>(null);

export function useSessionUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("Sessão ausente");
  return user;
}

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <UserContext value={user}>
      <div className="flex min-h-dvh flex-col bg-paper text-ink">
        <form id="logout-form" action="/api/auth/logout" method="post" />
        <header className="bg-brand ps-[max(1rem,env(safe-area-inset-left))] pe-[max(0.5rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top)]">
          <div className="flex items-center py-2">
            <Link
              href="/configuracoes"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2"
            >
              <Avatar name={user.name} />
              <span className="min-w-0">
                <span className="block truncate font-display text-xl leading-[1.05] font-semibold text-brand-cream sm:hidden">
                  {user.name}
                </span>
                <span className="hidden truncate font-display text-[32px] leading-[1.05] font-semibold text-brand-cream italic sm:block">
                  Wishly
                </span>
                <span className="block truncate text-sm font-semibold text-on-ink">
                  <span className="sm:hidden">Configurações</span>
                  <span className="hidden sm:inline">{user.name}</span>
                </span>
              </span>
            </Link>
            <ThemeMenu />
            <Menu>
              <MenuTrigger
                aria-label="Mais"
                className="grid size-12 cursor-pointer place-items-center rounded-lg text-brand-cream outline-none hover:bg-white/10 focus-visible:ring-[1.4px] focus-visible:ring-accent sm:hidden"
              >
                <MoreVertical className="size-5" />
              </MenuTrigger>
              <MenuContent>
                <MenuLabel>Minha conta</MenuLabel>
                <MenuItem asChild>
                  <Link href="/configuracoes">{user.name}</Link>
                </MenuItem>
                <MenuItem asChild>
                  <Link href="/configuracoes">
                    <Settings className="size-5" />
                    Configurações
                  </Link>
                </MenuItem>
                <MenuItem
                  onSelect={() => {
                    const form = document.getElementById("logout-form");
                    if (form instanceof HTMLFormElement) form.requestSubmit();
                  }}
                >
                  Sair
                </MenuItem>
              </MenuContent>
            </Menu>
            <button
              type="submit"
              form="logout-form"
              className="hidden h-12 cursor-pointer px-4 font-semibold text-brand-cream sm:inline-flex"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 px-5 py-5 ps-[max(1.25rem,env(safe-area-inset-left))] pe-[max(1.25rem,env(safe-area-inset-right))]">
          {children}
        </main>
        <footer className="bg-brand pb-[env(safe-area-inset-bottom)] sm:hidden">
          <Link
            href="/configuracoes"
            className="flex min-h-12 items-center gap-3 px-4 py-3 ps-[max(1rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]"
          >
            <Avatar name={user.name} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-brand-cream">{user.name}</span>
              <span className="block text-sm font-semibold text-on-ink-muted">Configurações</span>
            </span>
            <ChevronRight className="size-5 text-brand-cream" />
          </Link>
        </footer>
      </div>
    </UserContext>
  );
}
