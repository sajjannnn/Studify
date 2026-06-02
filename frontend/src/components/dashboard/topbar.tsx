import { useNavigate } from "react-router-dom"
import { Menu, LogOut, Sun, Moon } from "lucide-react"
import { useAuthStore } from "../../store/auth.store"
import { useUIStore } from "../../store/ui.store"
import { useTheme } from "../../providers/theme-provider"
import { useLogout } from "../../hooks/use-auth"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

export function Topbar() {
  const user = useAuthStore((state) => state.user)
  const { toggleMobileSidebar } = useUIStore()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const logoutMutation = useLogout()

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm transition-all duration-200",
        "lg:px-6",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        className="lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      {/* User info */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <span className="hidden text-sm font-medium sm:block">
          {user?.name}
        </span>
        <button
          onClick={() => navigate("/profile")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white"
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
