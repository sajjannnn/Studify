import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, Moon, Sun, LogIn, User, Sparkles, LogOut } from "lucide-react"
import { Button } from "../ui/button"
import { useAuthStore } from "../../store/auth.store"
import { useLogout } from "../../hooks/use-auth"
import { useTheme } from "../../providers/theme-provider"
import { cn } from "../../lib/utils"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const logoutMutation = useLogout()
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Studify</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/explore" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Explore
          </Link>
          
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <User className="mr-2 h-4 w-4" />
                {user?.name}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth/login")}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/auth/signup")}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="space-y-2 p-4">
          <Link
            to="/"
            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Explore
          </Link>
          <div className="pt-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => { navigate("/dashboard"); setMobileOpen(false) }}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button className="w-full" variant="ghost" onClick={() => { logoutMutation.mutate(); setMobileOpen(false) }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => { navigate("/auth/login"); setMobileOpen(false) }}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button className="w-full" onClick={() => { navigate("/auth/signup"); setMobileOpen(false) }}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </nav>
  )
}
