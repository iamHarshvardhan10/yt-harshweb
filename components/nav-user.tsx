"use client"

import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react"

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
}

export function NavUser({
  user: fallbackUser,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [admin, setAdmin] = React.useState<{ name: string; email: string } | null>(null)
  const [signingOut, setSigningOut] = React.useState(false)

  // The signed-in admin (the static user is only shown until this loads)
  React.useEffect(() => {
    let ignore = false
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => !ignore && data?.user && setAdmin(data.user))
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  async function logout() {
    setSigningOut(true)
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    window.location.replace("/login")
  }

  const name = admin?.name ?? fallbackUser.name
  const email = admin?.email ?? fallbackUser.email

  return (
    <SidebarMenu className="hover:bg-transparent">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar>
              <AvatarImage src={fallbackUser.avatar} alt={name} />
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs">{email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            className="min-w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Signed in as {email}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={signingOut} onClick={logout}>
              <LogOutIcon />
              {signingOut ? "Signing out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
