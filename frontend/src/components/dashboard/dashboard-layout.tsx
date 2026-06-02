import type { ReactNode } from "react"
import { useUIStore } from "../../store/ui.store"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { cn } from "../../lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-x-hidden transition-all duration-200",
          "lg:pl-56",
          !sidebarOpen && "lg:pl-16",
        )}
      >
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
