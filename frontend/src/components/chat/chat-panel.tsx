import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Send,
  User,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Button } from "../ui/button"
import { useQueryAI } from "../../hooks/use-workspace"
import { cn } from "../../lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Array<{ pageContent: string; metadata: Record<string, unknown> }>
}

interface ChatPanelProps {
  docIds?: string[]
  showHeader?: boolean
  onSend?: (query: string) => Promise<{ answer: string; sources?: any[] }>
}

export default function ChatPanel({ docIds, showHeader = true, onSend }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const queryMutation = useQueryAI()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || pending) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: q }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setPending(true)

    try {
      if (onSend) {
        const data = await onSend(q)
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        queryMutation.mutate(
          { query: q, docIds: docIds?.length ? docIds : undefined },
          {
            onSuccess: (data) => {
              setPending(false)
              const aiMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.answer,
                sources: data.sources,
              }
              setMessages((prev) => [...prev, aiMsg])
            },
            onError: () => {
              setPending(false)
              const errMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Sorry, I couldn't process your question. Please try again.",
              }
              setMessages((prev) => [...prev, errMsg])
            },
          },
        )
        return
      }
      setPending(false)
    } catch {
      setPending(false)
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't process your question. Please try again.",
      }
      setMessages((prev) => [...prev, errMsg])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleSource = (msgId: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev)
      if (next.has(msgId)) next.delete(msgId)
      else next.add(msgId)
      return next
    })
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      {showHeader && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Ask AI</h2>
          <p className="text-sm text-muted-foreground">
            Ask questions about this document.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border bg-muted/30 p-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold">Ask anything about this document</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Summarize, explain concepts, or ask questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Summarize this document",
                "Explain the key concepts",
                "What are the main takeaways?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                    inputRef.current?.focus()
                  }}
                  className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border bg-card",
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 border-t pt-1.5">
                        <button
                          onClick={() => toggleSource(msg.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expandedSources.has(msg.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""}
                        </button>
                        {expandedSources.has(msg.id) && (
                          <div className="mt-1.5 space-y-1.5">
                            {msg.sources.map((source, i) => (
                              <div
                                key={i}
                                className="rounded-lg bg-muted/50 p-2 text-xs"
                              >
                                <p className="line-clamp-3 text-muted-foreground">
                                  {source.pageContent}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {pending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="rounded-2xl border bg-card px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows={1}
            className="flex min-h-[2.25rem] w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ maxHeight: "100px" }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = "auto"
              el.style.height = `${Math.min(el.scrollHeight, 100)}px`
            }}
          />
          <Button
            size="icon"
            onClick={handleSend}
              disabled={!input.trim() || pending}
            className="absolute bottom-1.5 right-1.5 h-6 w-6"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}