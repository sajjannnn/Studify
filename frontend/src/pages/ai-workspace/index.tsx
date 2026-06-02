import { useState } from "react"
import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  BookOpen,
  X,
} from "lucide-react"
import { DashboardLayout } from "../../components/dashboard/dashboard-layout"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import ChatPanel from "../../components/chat/chat-panel"
import { useDocuments } from "../../hooks/use-notes"
import { cn } from "../../lib/utils"

export default function AIWorkspace() {
  const location = useLocation()
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(() => {
    const state = location.state as { docId?: string; docIds?: string[] } | undefined
    if (state?.docIds?.length) return state.docIds
    if (state?.docId) return [state.docId]
    return []
  })
  const [showDocFilter, setShowDocFilter] = useState(false)
  const { data: documents } = useDocuments()

  const toggleDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    )
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3.5rem-3rem)] gap-4">
        {/* Main chat area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Workspace</h1>
              <p className="text-muted-foreground">
                Ask questions about your study materials.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDocFilter(!showDocFilter)}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              {selectedDocIds.length
                ? `${selectedDocIds.length} document${selectedDocIds.length > 1 ? "s" : ""} selected`
                : "All documents"}
            </Button>
          </div>

          <ChatPanel docIds={selectedDocIds.length ? selectedDocIds : undefined} showHeader={false} />
        </div>

        {/* Doc filter sidebar */}
        <AnimatePresence>
          {showDocFilter && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="h-full p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Filter by documents</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowDocFilter(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Select specific documents to search within. Leave empty to search all.
                </p>
                {selectedDocIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-3 h-7 w-full text-xs"
                    onClick={() => setSelectedDocIds([])}
                  >
                    Clear selection
                  </Button>
                )}
                <div className="space-y-1">
                  {documents?.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.docId)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                        selectedDocIds.includes(doc.docId)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted",
                      )}
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate">{doc.title}</span>
                      {doc.type === "GENERATED" && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">
                          AI
                        </Badge>
                      )}
                    </button>
                  ))}
                  {(!documents || documents.length === 0) && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No documents yet. Upload some PDFs first.
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}