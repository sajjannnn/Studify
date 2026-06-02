import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Sparkles,
  Search,
  Upload,
  BookOpen,
  Brain,
  Zap,
  Shield,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Star,
  Bot,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Navbar } from "../components/shared/navbar"
import { Footer } from "../components/shared/footer"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const features = [
  {
    icon: Brain,
    title: "AI-Powered Notes",
    description: "Generate comprehensive study notes from your PDFs using advanced RAG-based AI.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find exactly what you need with AI-powered semantic and keyword search across all notes.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Upload,
    title: "Smart Upload",
    description: "Drag & drop your PDFs, books, and PYQs. Our AI processes and indexes them instantly.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: BookOpen,
    title: "Community Notes",
    description: "Browse, upvote, and share notes with students from DU, IPU, and other universities.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "Quick Generation",
    description: "Generate bullet points, summaries, or exam-focused material in seconds.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Shield,
    title: "Private & Public",
    description: "Keep your notes private or share them with the community. Full control over visibility.",
    gradient: "from-purple-500 to-indigo-600",
  },
]

const testimonials = [
  {
    name: "Rahul S.",
    role: "B.Tech CSE, IPU",
    content: "Studify saved my exam prep. The AI-generated notes are incredibly accurate and well-structured.",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "B.Sc, DU",
    content: "The semantic search is a game-changer. I can find exactly what I need across hundreds of documents instantly.",
    rating: 5,
  },
  {
    name: "Arjun K.",
    role: "MBA, IPU",
    content: "I love how I can upload my messy lecture notes and get clean, organized study material back.",
    rating: 5,
  },
]

const stats = [
  { value: "10K+", label: "Notes Generated" },
  { value: "5K+", label: "Active Students" },
  { value: "50+", label: "Universities" },
  { value: "98%", label: "Satisfaction Rate" },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl rounded-full" />

          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <motion.div variants={fadeIn} className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5 text-indigo-400" />
                AI-Powered Study Platform for College Students
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Study Smarter with{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  AI-Generated
                </span>{" "}
                Notes
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
                Upload your PDFs, books, and PYQs. Let our AI generate personalized, high-quality study notes
                using advanced RAG technology. Search, share, and collaborate with fellow students.
              </p>
              <motion.div variants={fadeIn} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="xl" asChild>
                  <Link to="/auth/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link to="/explore">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Explore Notes
                  </Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeIn} className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Free forever
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Unlimited uploads
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold tracking-tight sm:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center"
            >
              <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to ace your exams
              </motion.h2>
              <motion.p variants={fadeIn} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                From AI-powered note generation to semantic search — we've got you covered.
              </motion.p>
            </motion.div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-500/20">
                    <CardContent className="p-6">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Demo Section */}
        <section className="border-y border-border/40 bg-muted/30 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Badge variant="secondary" className="mb-4 px-3 py-1">
                  <Bot className="mr-2 h-3.5 w-3.5 text-indigo-400" />
                  AI Workspace
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Your Personal AI Study Assistant
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Upload any PDF and get instant AI-generated notes in your preferred format — concise,
                  bullet points, exam-focused, or beginner friendly.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Streaming AI responses with markdown formatting",
                    "Semantic chunk references with citations",
                    "Multiple note generation presets",
                    "Export and share your notes",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="mt-8" asChild>
                  <Link to="/auth/signup">
                    Try AI Workspace <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xl">
                  <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-4">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="ml-2 text-xs text-muted-foreground">AI Workspace</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm">
                        Generate notes from my Machine Learning textbook PDF about neural networks
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="space-y-3 rounded-2xl rounded-tl-sm bg-primary/5 px-4 py-3 text-sm">
                        <p className="font-medium text-indigo-400">Generated Notes:</p>
                        <div className="space-y-2">
                          <p><span className="font-semibold">Neural Networks</span> — A neural network is a computational model inspired by biological neural networks...</p>
                          <p className="text-muted-foreground italic">3 key references from: ML_Textbook_Chapter_5.pdf</p>
                          <div className="flex gap-2 pt-1">
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-500">Concise</span>
                            <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400">1 citation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                      AI is thinking...
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center"
            >
              <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by students
              </motion.h2>
              <motion.p variants={fadeIn} className="mt-4 text-lg text-muted-foreground">
                Join thousands of students who are studying smarter.
              </motion.p>
            </motion.div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-medium text-white">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{testimonial.name}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-y border-border/40 bg-gradient-to-b from-indigo-500/5 to-transparent py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <GraduationCap className="mx-auto h-12 w-12 text-indigo-400" />
              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to transform your study routine?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Join Studify today and start generating AI-powered study notes from your materials.
                It's free, forever.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="xl" asChild>
                  <Link to="/auth/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link to="/explore">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse Notes
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required. 100% free for students.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
