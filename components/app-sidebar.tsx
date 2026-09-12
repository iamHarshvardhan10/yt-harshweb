
"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  BarChart3,
  Video,
  Clapperboard,
  Search,
  Lightbulb,
  CalendarDays,
  MessageCircle,
  Users,
  FileSearch,
  Library,
  Settings2,
} from "lucide-react"


const data = {
  user: {
    name: "Harsh Bhosale",
    email: "Creator",
    avatar: "/avatars/harsh.jpg",
  },

  teams: [
    {
      name: "Harsh Bhosale",
      logo: <LayoutDashboard />,
      plan: "Creator Studio",
    },
  ],

  navMain: [
    // =========================
    // OVERVIEW
    // =========================

    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      isActive: true,
    },




    // =========================
    // CONTENT
    // =========================

    {
      title: "Content",
      url: "#",
      icon: <Video />,

      items: [
        {
          title: "Videos / Shorts",
          url: "/dashboard/videos",
        },
        {
          title: "Investigations",
          url: "/dashboard/investigations",
        },
        {
          title: "Content Ideas",
          url: "/dashboard/ideas",
        },
        {
          title: "Schedule",
          url: "/dashboard/schedule",
        },
      ],
    },


    // =========================
    // COMMUNITY
    // =========================

    {
      title: "Community",
      url: "#",
      icon: <MessageCircle />,

      items: [
        {
          title: "Comments",
          url: "/dashboard/comments",
        },
        {
          title: "Audience",
          url: "/dashboard/audience",
        },
      ],
    },


    // =========================
    // RESEARCH
    // =========================

    {
      title: "Research",
      url: "#",
      icon: <Search />,

      items: [
        {
          title: "Sources",
          url: "/dashboard/sources",
        },
        {
          title: "Research Library",
          url: "/dashboard/research",
        },
      ],
    },


    // =========================
    // WEBSITE
    // =========================

    {
      title: "Website",
      url: "#",
      icon: <Clapperboard />,

      items: [
        {
          title: "Home",
          url: "/dashboard/home",
        },
        {
          title: "About",
          url: "/dashboard/about",
        },
        {
          title: "Videos",
          url: "/dashboard/videos",
        },
        {
          title: "Investigations",
          url: "/dashboard/investigations",
        },
        {
          title: "Contact",
          url: "/dashboard/contactus",
        },
      ],
    },


    // =========================
    // CHANNEL
    // =========================

    {
      title: "Channel",
      url: "#",
      icon: <LayoutDashboard />,

      items: [
        {
          title: "YouTube Channel",
          url: "/dashboard/channel",
        },
        {
          title: "Audience",
          url: "/dashboard/audience",
        },
      ],
    },

    {
      title: "Newsletter",
      url: "/dashboard/newsletter",
      icon: <BarChart3 />,
    },


    // =========================
    // SETTINGS
    // =========================

    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2 />,
    },
  ],
}


export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >

      {/* =========================
          SIDEBAR HEADER
      ========================= */}

      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>


      {/* =========================
          SIDEBAR CONTENT
      ========================= */}

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>


      {/* =========================
          SIDEBAR FOOTER
      ========================= */}

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>


      <SidebarRail />

    </Sidebar>
  )
}
