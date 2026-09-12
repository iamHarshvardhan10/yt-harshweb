"use client"

import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const [openItem, setOpenItem] = React.useState<string | null>(
    items.find((item) => item.isActive)?.title ?? null
  )

  return (
    <SidebarGroup className="px-2 py-2">

      <SidebarMenu className="gap-1">

        {items.map((item) => {
          const hasSubItems = !!item.items?.length
          const isOpen = openItem === item.title

          return (
            <Collapsible
              key={item.title}
              open={isOpen}
              onOpenChange={(open) => {
                setOpenItem(open ? item.title : null)
              }}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >

              {/* MAIN ITEM */}

              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`
                      h-10
                      rounded-lg
                      px-3
                      text-[14px]
                      font-medium
                      text-[#0f0f0f]

                      hover:bg-[#f2f2f2]
                      hover:text-[#0f0f0f]

                      data-[state=open]:bg-[#f2f2f2]

                      dark:text-white
                      dark:hover:bg-[#272727]
                      dark:data-[state=open]:bg-[#272727]

                      transition-colors
                    `}
                  />
                }
              >

                {hasSubItems ? (
                  <>
                    <span className="text-[#0f0f0f] dark:text-white">
                      {item.icon}
                    </span>

                    <span>
                      {item.title}
                    </span>

                    <ChevronRightIcon
                      className={`
                        ml-auto
                        size-4
                        text-[#606060]
                        transition-transform
                        duration-200

                        ${isOpen ? "rotate-90" : "rotate-0"}

                        dark:text-[#aaa]
                      `}
                    />
                  </>
                ) : (
                  <a
                    href={item.url}
                    className="flex w-full items-center gap-3"
                  >
                    <span>
                      {item.icon}
                    </span>

                    <span>
                      {item.title}
                    </span>
                  </a>
                )}

              </CollapsibleTrigger>


              {/* SUB MENU */}

              {hasSubItems && (
                <CollapsibleContent>

                  <SidebarMenuSub
                    className="
                      ml-4
                      border-l
                      border-[#e5e5e5]
                      pl-3

                      dark:border-[#3f3f3f]
                    "
                  >

                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.title}
                      >

                        <SidebarMenuSubButton

                          className="
                            h-9
                            rounded-md
                            px-3
                            text-[13px]
                            text-[#606060]

                            hover:bg-[#f2f2f2]
                            hover:text-[#0f0f0f]

                            dark:text-[#aaa]
                            dark:hover:bg-[#272727]
                            dark:hover:text-white

                            transition-colors
                          "
                        >

                          <a href={subItem.url}>
                            <span>
                              {subItem.title}
                            </span>
                          </a>

                        </SidebarMenuSubButton>

                      </SidebarMenuSubItem>
                    ))}

                  </SidebarMenuSub>

                </CollapsibleContent>
              )}

            </Collapsible>
          )
        })}

      </SidebarMenu>

    </SidebarGroup>
  )
}