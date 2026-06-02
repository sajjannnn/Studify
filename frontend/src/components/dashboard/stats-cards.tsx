import { FileText, Sparkles, Tag } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import type { Document } from "../../types"

interface StatsCardsProps {
  documents?: Document[]
  isLoading: boolean
  summaryCount: number
}

export function StatsCards({ documents, isLoading, summaryCount }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalDocs = documents?.length ?? 0
  const uniqueTags = new Set(documents?.flatMap((d) => d.tags) ?? []).size

  const stats = [
    { label: "Shared Notes by Community", value: totalDocs, icon: FileText, color: "text-blue-500" },
    { label: "Summaries", value: summaryCount, icon: Sparkles, color: "text-yellow-500" },
    { label: "Topics", value: uniqueTags, icon: Tag, color: "text-orange-500" },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
