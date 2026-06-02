import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, GraduationCap, BookOpen, Calendar, Save, X, Loader2 } from "lucide-react"
import { DashboardLayout } from "../../components/dashboard/dashboard-layout"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useAuthStore } from "../../store/auth.store"
import { useUpdateProfile } from "../../hooks/use-auth"
import { getMe } from "../../services/auth.service"
import { UNIVERSITIES, SEMESTERS, COURSES } from "../../lib/constants"
import { cn } from "../../lib/utils"

export default function Profile() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const updateMutation = useUpdateProfile()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [university, setUniversity] = useState(user?.university ?? "")
  const [course, setCourse] = useState(user?.course ?? "")
  const [semester, setSemester] = useState(user?.semester ?? "")

  useEffect(() => {
    getMe().then((fresh) => setUser(fresh)).catch(() => {})
  }, [setUser])

  if (!user) return null

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const startEditing = () => {
    setName(user.name)
    setUniversity(user.university)
    setCourse(user.course)
    setSemester(user.semester)
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
  }

  const saveProfile = () => {
    updateMutation.mutate(
      { name, university: university as any, course, semester: semester as any },
      { onSuccess: () => setEditing(false) },
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings.</p>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Edit profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveProfile} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3 w-3" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Avatar + basic info */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {editing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs text-center"
              />
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Account Details
            </h3>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            {/* University */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">University</p>
                {editing ? (
                  <div className="mt-1 flex gap-2">
                    {UNIVERSITIES.map((u) => (
                      <button
                        key={u}
                        onClick={() => {
                          setUniversity(u)
                          setCourse("")
                        }}
                        className={cn(
                          "rounded-lg border px-3 py-1 text-sm font-medium transition-all",
                          university === u
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:border-muted-foreground/30",
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium">{user.university || "—"}</p>
                )}
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Course</p>
                {editing && university ? (
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select course</option>
                    {COURSES[university]?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-medium">{user.course || "—"}</p>
                )}
              </div>
            </div>

            {/* Semester */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Semester</p>
                {editing ? (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {SEMESTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSemester(semester === s ? "" : s)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                          semester === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:border-muted-foreground/30",
                        )}
                      >
                        {s.replace("SEM", "Sem ")}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium">
                    {user.semester ? user.semester.replace("SEM", "Sem ") : "—"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Activity
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => navigate("/explore", { state: { filter: "my" } })} className="rounded-xl border p-4 text-center transition-colors hover:bg-muted/50 cursor-pointer">
                <p className="text-2xl font-bold">{user.documentIds.length}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </button>
              <button onClick={() => navigate("/ai-workspace")} className="rounded-xl border p-4 text-center transition-colors hover:bg-muted/50 cursor-pointer">
                <p className="text-2xl font-bold">{user.noteIds.length}</p>
                <p className="text-xs text-muted-foreground">Notes</p>
              </button>
              <button onClick={() => navigate("/explore", { state: { filter: "bookmarks" } })} className="rounded-xl border p-4 text-center transition-colors hover:bg-muted/50 cursor-pointer">
                <p className="text-2xl font-bold">{user.bookmarkNoteIds.length}</p>
                <p className="text-xs text-muted-foreground">Bookmarks</p>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Member since {memberSince}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
