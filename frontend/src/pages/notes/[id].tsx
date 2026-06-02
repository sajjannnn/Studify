import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  FileText,
  ChevronLeft,
  Globe,
  Loader2,
  Sparkles,
  ExternalLink,
  Bookmark,
  Plus,
  MessageSquare,
  Eye,
  Pencil,
} from "lucide-react"
import { DashboardLayout } from "../../components/dashboard/dashboard-layout"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { useDocument, useUpdateDocument } from "../../hooks/use-notes"
import { useBookmarks, useToggleBookmark } from "../../hooks/use-auth"
import { useSummaries, useGenerateSummary } from "../../hooks/use-summaries"
import ChatPanel from "../../components/chat/chat-panel"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateShort(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const PROMPT_TEMPLATES = [
  "Summarize in simple language",
  "Create exam-focused notes",
  "Explain like I'm a beginner",
  "Prepare for interview",
]

const SUMMARY_LIMIT = 10

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: doc, isLoading, error } = useDocument(id || "")
  const { data: bookmarkedIds } = useBookmarks()
  const toggleBookmarkMutation = useToggleBookmark()
  const { data: summaries, isLoading: summariesLoading } = useSummaries(doc?.docId ?? "")
  const generateMutation = useGenerateSummary()
  const updateMutation = useUpdateDocument()
  const [pdfError, setPdfError] = useState(false)
  const [genOpen, setGenOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const isBookmarked = bookmarkedIds?.includes(doc?.docId ?? "") ?? false

  const handleGenerate = () => {
    const prompt = selectedPrompt || customPrompt
    if (!prompt.trim() || !doc || generateMutation.isPending) return
    generateMutation.mutate(
      { docId: doc.docId, prompt: prompt.trim() },
      {
        onSuccess: () => {
          toast.success("Summary generated!")
          setGenOpen(false)
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to generate summary")
        },
      },
    )
  }

  const handleEdit = () => {
    if (!doc || !editTitle.trim()) return
    updateMutation.mutate(
      { id: doc.id, data: { title: editTitle.trim() } },
      {
        onSuccess: () => {
          toast.success("Title updated")
          setEditOpen(false)
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to update title")
        },
      },
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !doc) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Globe className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">
                Document not found or failed to load.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex max-w-6xl flex-col gap-3 pb-8"
      >
        {/* Top bar */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{doc.title}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {doc.university ?? "N/A"} · {doc.course ?? "N/A"} ·{" "}
              {doc.semester ?? "N/A"} · {formatDate(doc.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={() => { setEditTitle(doc.title); setEditOpen(true) }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setGenOpen(true)}>
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </Button>
            <Dialog open={genOpen} onOpenChange={setGenOpen}>
              <DialogContent onClose={() => setGenOpen(false)}>
                <DialogHeader>
                  <DialogTitle>Generate Summary</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Choose a prompt template or write your own. Gemini will summarize the entire PDF.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_TEMPLATES.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setSelectedPrompt(selectedPrompt === p ? "" : p)
                          setCustomPrompt("")
                        }}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                          selectedPrompt === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:border-muted-foreground/30",
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Or write a custom prompt
                    </label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => {
                        setCustomPrompt(e.target.value)
                        if (e.target.value) setSelectedPrompt("")
                      }}
                      placeholder="e.g. Summarize this for interview preparation..."
                      rows={3}
                      disabled={!!selectedPrompt}
                    />
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={(!selectedPrompt && !customPrompt.trim()) || generateMutation.isPending}
                    className="w-full"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent onClose={() => setEditOpen(false)}>
                <DialogHeader>
                  <DialogTitle>Edit Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Title</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <Button
                    onClick={handleEdit}
                    disabled={!editTitle.trim() || updateMutation.isPending}
                    className="w-full"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleBookmarkMutation.mutate(doc.docId)}
              className={cn("gap-1.5", isBookmarked && "border-primary text-primary")}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            {doc.pdfUrl && (
              <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open PDF
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Tags + status */}
        <div className="flex items-center gap-2 shrink-0">
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {doc.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {doc.type === "UPLOADED" && doc.embeddingStatus !== "COMPLETED" && (
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
              <Loader2 className="mr-0.5 h-2.5 w-2.5 animate-spin" />
              {doc.embeddingStatus === "PENDING"
                ? "Queued"
                : doc.embeddingStatus === "PROCESSING"
                  ? "Processing"
                  : "Failed"}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px]">
            {doc.type === "GENERATED" ? "AI Generated" : "Uploaded"}
          </Badge>
        </div>

        {/* Split view: PDF + Chat */}
        <div className="flex flex-col min-h-[55vh] gap-3 lg:flex-row lg:h-[55vh]">
          <div className="flex-1 min-w-0">
            <Card className="h-full">
              <CardContent className="h-full p-0.5">
                {doc.pdfUrl && !pdfError ? (
                  <iframe
                    src={doc.pdfUrl}
                    className="h-full w-full rounded-xl"
                    title={doc.title}
                    onError={() => setPdfError(true)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">PDF preview unavailable</p>
                      <p className="text-xs text-muted-foreground">
                        {pdfError ? "Could not load the PDF." : "No preview available."}
                      </p>
                    </div>
                    {doc.type === "GENERATED" && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        AI-generated document
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex w-full lg:w-[400px] min-w-0">
            <Card className="flex-1">
              <CardContent className="flex h-full flex-col p-3">
                <ChatPanel docIds={[doc.docId]} showHeader />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Summaries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Community Summaries</h2>
              <p className="text-xs text-muted-foreground">
                AI-generated summaries created by the community.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setGenOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Generate Summary
            </Button>
          </div>

          {summariesLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : summaries && summaries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {summaries.slice(0, SUMMARY_LIMIT).map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                    onClick={() => navigate(`/summaries/${doc.docId}/${s.id}`)}
                  >
                    <CardContent className="space-y-2 p-4">
                      <p className="line-clamp-1 text-sm font-medium">{s.prompt}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {s.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>by {s.userName}</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-3 w-3" />
                            {s.viewCount}
                          </span>
                          <span>{formatDateShort(s.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No summaries yet</p>
                  <p className="text-xs text-muted-foreground">
                    Be the first to generate a community summary for this document.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}