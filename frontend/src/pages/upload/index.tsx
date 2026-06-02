import { useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  Upload as UploadIcon,
  FileText,
  X,
  Sparkles,
  ChevronLeft,

} from "lucide-react"
import { DashboardLayout } from "../../components/dashboard/dashboard-layout"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent } from "../../components/ui/card"
import { useUploadDocument } from "../../hooks/use-notes"
import { UNIVERSITIES, SEMESTERS, COURSES } from "../../lib/constants"
import { cn } from "../../lib/utils"

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tags: z.string().optional(),
  university: z.string().optional(),
  course: z.string().min(1, "Course is required"),
  semester: z.string().optional(),
})

type UploadForm = z.infer<typeof uploadSchema>

export default function UploadPage() {
  const navigate = useNavigate()
  const uploadMutation = useUploadDocument()
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedUni, setSelectedUni] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", tags: "", university: "", course: "", semester: "" },
  })

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped)
    }
  }, [])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const onDragLeave = () => setDragOver(false)

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onSubmit = (data: UploadForm) => {
    if (!file) return

    const formData = new FormData()
    formData.append("pdf", file)
    formData.append("title", data.title)
    const tags = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : []
    if (tags.length) tags.forEach((t) => formData.append("tags[]", t))
    if (data.university) formData.append("university", data.university)
    formData.append("course", data.course)
    if (data.semester) formData.append("semester", data.semester)

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Document uploaded successfully!")
        navigate("/dashboard")
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || "Failed to upload document")
      },
    })
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Upload Document</h1>
            <p className="text-muted-foreground">
              Upload a PDF to create AI-powered study notes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Drop zone */}
          <Card>
            <CardContent className="p-6">
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : file
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50",
                )}
              >
                {file ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                      <FileText className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile()
                      }}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <UploadIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">
                        Drop your PDF here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Only PDF files are supported
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setFile(f)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form fields */}
          <Card>
            <CardContent className="space-y-5 p-6">
              <Input
                id="title"
                label="Title"
                placeholder="e.g. Calculus Lecture Notes"
                error={errors.title?.message}
                {...register("title")}
              />

              <Input
                id="tags"
                label="Tags (optional)"
                placeholder="e.g. mathematics, calculus, derivatives"
                error={errors.tags?.message}
                {...register("tags")}
              />

              {/* University */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">University (optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  {UNIVERSITIES.map((uni) => (
                    <button
                      key={uni}
                      type="button"
                      onClick={() => {
                        setValue("university", uni, { shouldValidate: true })
                        setValue("course", "", { shouldValidate: true })
                        setSelectedUni(uni)
                      }}
                      className={cn(
                        "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                        getValues("university") === uni
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-muted-foreground/30",
                      )}
                    >
                      {uni}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course */}
              {selectedUni && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Course <span className="text-destructive">*</span>
                  </label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                    {...register("course")}
                  >
                    <option value="">Select your course</option>
                    {COURSES[selectedUni]?.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                  {errors.course && (
                    <p className="text-xs text-destructive font-medium">{errors.course.message}</p>
                  )}
                </div>
              )}

              {/* Semester */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Semester (optional)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {SEMESTERS.map((sem) => (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setValue("semester", sem, { shouldValidate: true })}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                        getValues("semester") === sem
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-muted-foreground/30",
                      )}
                    >
                      {sem.replace("SEM", "Sem ")}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!file || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Uploading...
              </div>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Upload & Process with AI
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </DashboardLayout>
  )
}
