import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useAuthStore } from "../../store/auth.store"
import { useDocuments } from "../../hooks/use-notes"
import { useFeed } from "../../hooks/use-search"
import { useSummaryCount } from "../../hooks/use-summaries"
import { DashboardLayout } from "../../components/dashboard/dashboard-layout"
import { StatsCards } from "../../components/dashboard/stats-cards"
import { QuickActions } from "../../components/dashboard/quick-actions"
import { RecentDocuments } from "../../components/dashboard/recent-documents"
import { FeedSection } from "../../components/dashboard/feed-section"

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const { data: documents, isLoading: docsLoading } = useDocuments()
  const { data: feed, isLoading: feedLoading } = useFeed()
  const { data: summaryCount } = useSummaryCount()

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Welcome */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your study hub.
          </p>
        </div>

        {/* Stats */}
        <StatsCards documents={documents} isLoading={docsLoading} summaryCount={summaryCount?.count ?? 0} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Grid: Recent docs + Feed */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentDocuments documents={documents} isLoading={docsLoading} />
          <FeedSection feed={feed} isLoading={feedLoading} />
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
