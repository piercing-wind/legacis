import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Home,
  },
  {
    title: "Platina Weatlh",
    url: "/admin/platina-wealth",
    icon: Inbox,
  },
  {
    title: "Risk Profile & Recommendation",
    url: "/admin/risk-profile",
    icon: Inbox,
  },
  {
    title: "Portfolio Review",
    url: "/admin/portfolio-review",
    icon: Inbox,
  },
  {
    title: "Services",
    url: "/admin/services",
    icon: Inbox,
  },
  {
    title: "Combo Services",
    url: "/admin/combo",
    icon: Inbox,
  },
  {
    title: "Coupons",
    url: "/admin/coupons",
    icon: Inbox,
  },
  {
    title: "Agreements & Policies",
    url: "/admin/agreements",
    icon: Inbox,
  },
  {
    title: "Blogs",
    url: "/admin/blog",
    icon: Inbox,
  },
  {
    title: "Contact Messages",
    url: "/admin/contact",
    icon: Inbox,
  },
  {
    title: "Banner",
    url: "/admin/banner",
    icon: Inbox,
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>
            <Link href="/" className   ="text-lg font-bold relative h-16 w-38">
              <Image
                src="/legacis-logo-black.png"
                alt="Legacis Logo"
                fill
                className="object-contain dark:hidden"
                style={{ objectFit: "contain" }}
              />
              <Image
                src="/legacis-logo-white.png"
                alt="Legacis Logo"
                fill
                className="object-contain hidden dark:block"
                style={{ objectFit: "contain" }}
              />
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      {/* <item.icon /> */}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}