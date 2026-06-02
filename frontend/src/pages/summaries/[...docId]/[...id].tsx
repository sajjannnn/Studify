import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ChevronLeft, Eye, User, Calendar, Trash2, Pencil, Printer } from "lucide-react"
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Skeleton } from "../../../components/ui/skeleton"
import { Separator } from "../../../components/ui/separator"
import { Textarea } from "../../../components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { useSummary, useDeleteSummary, useUpdateSummary } from "../../../hooks/use-summaries"
import { summariesService } from "../../../services/summaries.service"
import { useAuthStore } from "../../../store/auth.store"
import ChatPanel from "../../../components/chat/chat-panel"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function SummaryDetail() {
  const { docId, summaryId } = useParams<{ docId: string; summaryId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: summary, isLoading, error } = useSummary(docId || "", summaryId || "")
  const deleteMutation = useDeleteSummary()
  const updateMutation = useUpdateSummary()
  const [editOpen, setEditOpen] = useState(false)
  const [editPrompt, setEditPrompt] = useState("")

  const handleDelete = () => {
    if (!summaryId || !window.confirm("Delete this summary?")) return
    deleteMutation.mutate(summaryId, {
      onSuccess: () => {
        toast.success("Summary deleted")
        navigate(-1)
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || "Failed to delete summary")
      },
    })
  }

  const handleEdit = () => {
    if (!summaryId || !editPrompt.trim()) return
    updateMutation.mutate(
      { summaryId, payload: { prompt: editPrompt.trim() } },
      {
        onSuccess: () => {
          toast.success("Prompt updated")
          setEditOpen(false)
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to update prompt")
        },
      },
    )
  }

  const handleChat = async (query: string) => {
    const data = await summariesService.chat(summaryId || "", query, [])
    return { answer: data.answer, sources: data.sources }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !summary) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Summary not found.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <style>{`
        @media print {
          @page { margin: 0.6in; }
          .no-print { display: none !important; }
          .print-meta { font-size: 11pt; color: #555; margin-bottom: 12pt; }
          h1 { font-size: 18pt !important; margin-bottom: 4pt !important; }
          h3 { font-size: 10pt !important; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 6pt !important; }
          .print-prompt { font-style: italic; color: #666; margin-bottom: 16pt; }
          .print-content { font-size: 11pt; line-height: 1.6; white-space: pre-wrap; }
          .print-chat { height: auto !important; }
          .print-chat .overflow-y-auto { overflow: visible !important; max-height: none !important; }
          .print-chat form, .print-chat textarea, .print-chat button[type="submit"],
          .print-chat .mt-3 { display: none !important; }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="print-area mx-auto flex max-w-5xl flex-col gap-6 pb-8"
      >
        {/* Header */}
        <div className="no-print flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Summary</p>
            <h1 className="truncate text-xl font-bold">{summary.prompt}</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
            {summary.userId === user?.id && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setEditPrompt(summary.prompt); setEditOpen(true) }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="print-meta flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {summary.userName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(summary.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {summary.viewCount} views
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {summary.content.split(/\s+/).length} words
          </Badge>
        </div>

        <Separator className="no-print" />

        {/* Prompt */}
        <div>
          <h3 className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Original Prompt
          </h3>
          <p className="print-prompt text-sm italic text-muted-foreground">&ldquo;{summary.prompt}&rdquo;</p>
        </div>

        {/* Summary Content */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Generated Summary
            </h3>
            <div className="print-content whitespace-pre-wrap text-sm leading-relaxed">
              {summary.content}
            </div>
          </CardContent>
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent onClose={() => setEditOpen(false)}>
            <DialogHeader>
              <DialogTitle>Edit Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Prompt</label>
                <Textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleEdit}
                disabled={!editPrompt.trim() || updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Separator />

        {/* Chat with this summary */}
        <div>
          <h2 className="mb-1 text-lg font-semibold">Chat about this summary</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Ask questions about the document — context from this summary and the original PDF will be used.
          </p>
          <Card>
            <CardContent className="p-3">
              <div className="print-chat h-[400px]">
                <ChatPanel
                  docIds={[summary.documentId]}
                  showHeader={false}
                  onSend={handleChat}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}