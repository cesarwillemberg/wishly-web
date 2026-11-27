"use client";

import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { Avatar } from "@/components/avatar";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/dropdown-menu";
import type { SessionUser } from "@/lib/api/parse";

const UserContext = createContext<SessionUser | null>(null);
const HeaderActionsContext = createContext<{
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}>({ actions: null, setActions: () => {} });

export function useSessionUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("Sessão ausente");
  return user;
}

export function useHeaderActions() {
  return useContext(HeaderActionsContext);
}

export const pageFrame =
  "w-full ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))] md:ps-[max(1.5rem,env(safe-area-inset-left))] md:pe-[max(1.5rem,env(safe-area-inset-right))] lg:ps-[max(2rem,env(safe-area-inset-left))] lg:pe-[max(2rem,env(safe-area-inset-right))]";

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);
  const headerActions = useMemo(() => ({ actions, setActions }), [actions]);

  return (
    <UserContext value={user}>
      <HeaderActionsContext value={headerActions}>
        <div className="flex min-h-dvh flex-col bg-paper text-ink">
          <form id="logout-form" action="/api/auth/logout" method="post" />
          <header className="bg-brand pt-[env(safe-area-inset-top)]">
            <div className={`${pageFrame} flex h-16 items-center gap-2`}>
              <Link
                href="/"
                className="min-w-0 font-display text-[28px] leading-none font-semibold text-brand-cream italic"
              >
                Wishly
              </Link>
              <div className="ml-auto flex items-center gap-1">
                {actions}
                <AccountMenu user={user} />
              </div>
            </div>
          </header>
          <main className={`${pageFrame} flex-1 py-6`}>{children}</main>
        </div>
      </HeaderActionsContext>
    </UserContext>
  );
}

export function NewListButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-1 rounded-lg bg-accent px-3 text-sm font-semibold text-white"
    >
      <Plus className="size-4" />
      <span className="sm:hidden">Nova</span>
      <span className="hidden sm:inline">Nova lista</span>
    </button>
  );
}

function AccountMenu({ user }: { user: SessionUser }) {
  return (
    <Menu>
      <MenuTrigger
        aria-label="Conta"
        className="flex h-12 max-w-[12rem] cursor-pointer items-center gap-2 rounded-lg px-1.5 text-brand-cream outline-none hover:bg-white/10 focus-visible:ring-[1.4px] focus-visible:ring-accent"
      >
        <Avatar name={user.name} />
        <span className="hidden truncate text-sm font-semibold sm:inline">{user.name}</span>
      </MenuTrigger>
      <MenuContent>
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
  );
}
