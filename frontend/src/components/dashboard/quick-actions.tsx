import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Upload, Bot, Compass } from "lucide-react"
import { Card, CardContent } from "../ui/card"

const actions = [
  {
    title: "Upload PDF",
    description: "Upload lecture notes or study material",
    icon: Upload,
    color: "from-blue-500 to-blue-600",
    href: "/upload",
  },
  {
    title: "AI Workspace",
    description: "Chat with your documents",
    icon: Bot,
    color: "from-purple-500 to-violet-600",
    href: "/ai-workspace",
  },
  {
    title: "Explore",
    description: "Discover notes from peers",
    icon: Compass,
    color: "from-orange-500 to-red-500",
    href: "/explore",
  },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card
            className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
            onClick={() => navigate(action.href)}
          >
            <CardContent className="p-6">
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color}`}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-1 font-semibold">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
