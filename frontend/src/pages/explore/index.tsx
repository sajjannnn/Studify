import { useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Compass,
  FileText,
  X,
  Filter,
  Loader2,
  Sparkles,
  Bot,
  Check,
  Bookmark,
} from "lucide-react"
import { DashboardLayout } from "../../components/dashboard/dashboard-layout"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { useFeed, useSearch } from "../../hooks/use-search"
import { useBookmarks, useToggleBookmark } from "../../hooks/use-auth"
import { useAuthStore } from "../../store/auth.store"
import { UNIVERSITIES, SEMESTERS, COURSES } from "../../lib/constants"
import { cn } from "../../lib/utils"
import type { Document } from "../../types"

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function DocCard({
  doc,
  index,
  selected,
  onToggle,
  bookmarked,
  onBookmark,
}: {
  doc: Document
  index: number
  selected: boolean
  onToggle: (id: string) => void
  bookmarked: boolean
  onBookmark: (id: string) => void
}) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card
        className={cn(
          "h-full cursor-pointer transition-all",
          selected
            ? "border-primary ring-1 ring-primary"
            : "hover:border-primary/50 hover:shadow-sm",
        )}
        onClick={() => navigate(`/notes/${doc.id}`)}
      >
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle(doc.docId)
              }}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                selected
                  ? "bg-primary"
                  : "bg-gradient-to-br from-indigo-500 to-violet-600 hover:opacity-80",
              )}
            >
              {selected ? (
                <Check className="h-4 w-4 text-primary-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-white" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{doc.title}</p>
              <p className="text-xs text-muted-foreground">
                {doc.university ?? "N/A"} · {doc.course ?? "N/A"} · {doc.semester ?? "N/A"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onBookmark(doc.docId)
                }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  bookmarked
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
              </button>
              {doc.type === "GENERATED" && (
                <Badge variant="secondary" className="text-[10px]">
                  <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                  AI
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {doc.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
              {doc.tags.length > 3 && (
                <Badge variant="outline" className="text-[10px]">
                  +{doc.tags.length - 3}
                </Badge>
              )}
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatDate(doc.createdAt)}
            </span>
          </div>
          {doc.embeddingStatus !== "COMPLETED" && (
            <div className="flex items-center gap-1.5 text-[10px] text-amber-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              {doc.embeddingStatus === "PENDING"
                ? "Queued for processing"
                : doc.embeddingStatus === "PROCESSING"
                  ? "Processing..."
                  : "Failed"}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DocGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function Explore() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const filterMode = (location.state as any)?.filter as string | undefined
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUni, setSelectedUni] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])

  const { data: bookmarkedIds } = useBookmarks()
  const toggleBookmarkMutation = useToggleBookmark()

  const hasFilters = selectedUni || selectedCourse || selectedSemester

  const { data: feed, isLoading: feedLoading, error: feedError } = useFeed(
    hasFilters
      ? {
          university: selectedUni || undefined,
          course: selectedCourse || undefined,
          semester: selectedSemester || undefined,
        }
      : undefined,
  )

  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useSearch({
    q: searchQuery || undefined,
    university: selectedUni || undefined,
    course: selectedCourse || undefined,
    semester: selectedSemester || undefined,
  })

  const isSearching = !!searchQuery
  const documents = isSearching ? searchResults : feed
  const isLoading = isSearching ? searchLoading : feedLoading
  const error = isSearching ? searchError : feedError

  const toggleDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : prev.length < 5 ? [...prev, docId] : prev,
    )
  }

  const clearFilters = () => {
    setSelectedUni("")
    setSelectedCourse("")
    setSelectedSemester("")
    setSearchQuery("")
  }

  const filteredDocuments = useMemo(() => {
    if (!documents) return documents
    if (filterMode === "my") {
      const myIds = new Set(user?.documentIds ?? [])
      return documents.filter((d) => myIds.has(d.docId))
    }
    if (filterMode === "bookmarks") {
      const bookmarkIds = new Set(bookmarkedIds ?? [])
      return documents.filter((d) => bookmarkIds.has(d.docId))
    }
    return documents
  }, [documents, filterMode, user?.documentIds, bookmarkedIds])

  const filterLabel = filterMode === "my" ? "My Documents" : filterMode === "bookmarks" ? "Bookmarked" : null

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{filterLabel ?? "Explore"}</h1>
          <p className="text-muted-foreground">
            {filterMode === "my"
              ? "Your uploaded study materials."
              : filterMode === "bookmarks"
                ? "Your bookmarked documents."
                : "Discover study materials shared by the community."}
          </p>
        </div>

        {/* Search & filters bar */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card>
                <CardContent className="space-y-4 p-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      University
                    </label>
                    <div className="flex gap-2 overflow-x-auto flex-nowrap pb-1">
                      {UNIVERSITIES.map((uni) => (
                        <button
                          key={uni}
                          onClick={() => {
                            setSelectedUni(selectedUni === uni ? "" : uni)
                            setSelectedCourse("")
                          }}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all shrink-0",
                            selectedUni === uni
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input hover:border-muted-foreground/30",
                          )}
                        >
                          {uni}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedUni && (
                    <div>
                      <label className="mb-2 block text-xs font-medium text-muted-foreground">
                        Course
                      </label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">All courses</option>
                        {COURSES[selectedUni]?.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      Semester
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto flex-nowrap pb-1">
                      <button
                        onClick={() => setSelectedSemester("")}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all shrink-0",
                          !selectedSemester
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:border-muted-foreground/30",
                        )}
                      >
                        All
                      </button>
                      {SEMESTERS.map((sem) => (
                        <button
                          key={sem}
                          onClick={() =>
                            setSelectedSemester(selectedSemester === sem ? "" : sem)
                          }
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all shrink-0",
                            selectedSemester === sem
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input hover:border-muted-foreground/30",
                          )}
                        >
                          {sem.replace("SEM", "Sem ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 text-xs"
                    >
                      Clear all filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Active filters */}
        {(isSearching || hasFilters) && (
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
            <span className="text-xs text-muted-foreground">Active:</span>
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchQuery}"
              </Badge>
            )}
            {selectedUni && (
              <Badge
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => {
                  setSelectedUni("")
                  setSelectedCourse("")
                }}
              >
                {selectedUni} ×
              </Badge>
            )}
            {selectedCourse && (
              <Badge
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCourse("")}
              >
                {selectedCourse} ×
              </Badge>
            )}
            {selectedSemester && (
              <Badge
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => setSelectedSemester("")}
              >
                {selectedSemester.replace("SEM", "Sem ")} ×
              </Badge>
            )}
          </div>
        )}

        {/* Results count */}
        {filteredDocuments && filteredDocuments.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
            {filterMode === "my" ? " uploaded by you" : filterMode === "bookmarks" ? " bookmarked" : isSearching ? " found" : " in feed"}
          </p>
        )}

        {/* Results grid */}
        {isLoading ? (
          <DocGridSkeleton />
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <X className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">
                Failed to load documents. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc, i) => (
              <DocCard
                key={doc.id}
                doc={doc}
                index={i}
                selected={selectedDocIds.includes(doc.docId)}
                onToggle={toggleDoc}
                bookmarked={bookmarkedIds?.includes(doc.docId) ?? false}
                onBookmark={(id) => toggleBookmarkMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Compass className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No documents found</p>
                <p className="text-sm text-muted-foreground">
                  {filterMode === "my"
                    ? "You haven't uploaded any documents yet."
                    : filterMode === "bookmarks"
                      ? "You haven't bookmarked any documents yet."
                      : isSearching || hasFilters
                        ? "Try different search terms or filters."
                        : "No documents have been uploaded yet."}
                </p>
              </div>
              {(isSearching || hasFilters) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Floating Ask AI bar */}
        <AnimatePresence>
          {selectedDocIds.length > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
            >
              <Card className="border-primary/30 shadow-lg">
                <CardContent className="flex items-center gap-4 px-5 py-3">
                  <div className="text-sm">
                    <span className="font-medium">{selectedDocIds.length}</span> document
                    {selectedDocIds.length > 1 ? "s" : ""} selected
                    {selectedDocIds.length >= 5 && (
                      <span className="ml-1 text-muted-foreground">(max 5)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDocIds([])}
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate("/ai-workspace", {
                          state: { docIds: selectedDocIds },
                        })
                      }
                      className="gap-2"
                    >
                      <Bot className="h-4 w-4" />
                      Ask AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  )
}
