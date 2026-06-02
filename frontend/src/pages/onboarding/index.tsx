import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { useUpdateProfile } from "../../hooks/use-auth"
import { useAuthStore } from "../../store/auth.store"
import { UNIVERSITIES, SEMESTERS, COURSES } from "../../lib/constants"
import { cn } from "../../lib/utils"

export default function Onboarding() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const updateMutation = useUpdateProfile()
  const [university, setUniversity] = useState("")
  const [course, setCourse] = useState("")
  const [semester, setSemester] = useState("")

  const canSubmit = university && course && semester

  const handleSubmit = () => {
    if (!canSubmit) return
    updateMutation.mutate(
      { university: university as any, course, semester: semester as any },
      {
        onSuccess: () => {
          toast.success("Profile updated!")
          navigate("/dashboard")
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to update profile")
        },
      },
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Tell us about your studies so we can personalize your experience.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">University</label>
              <div className="flex gap-2">
                {UNIVERSITIES.map((u) => (
                  <button
                    key={u}
                    onClick={() => { setUniversity(u); setCourse("") }}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                      university === u
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input hover:border-muted-foreground/30",
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {university && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Course <span className="text-destructive">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {COURSES[university]?.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCourse(c)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                        course === c
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-muted-foreground/30",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <div className="grid grid-cols-4 gap-1.5">
                {SEMESTERS.map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSemester(sem)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                      semester === sem
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input hover:border-muted-foreground/30",
                    )}
                  >
                    {sem.replace("SEM", "Sem ")}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full gap-2"
              size="lg"
              disabled={!canSubmit || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
