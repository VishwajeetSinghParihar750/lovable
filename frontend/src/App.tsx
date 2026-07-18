import { useEffect, useRef, useState, type FormEvent } from 'react'
import { PREVIEW_URL, streamChat, type ChatMessage } from './api'
import './App.css'

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, streaming])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setError(null)

    const id = projectId ?? crypto.randomUUID()
    if (!projectId) setProjectId(id)

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ])
    setLoading(true)
    setStreaming(true)

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    try {
      await streamChat(
        id,
        text,
        (chunk) => {
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last?.role === 'assistant') {
              next[next.length - 1] = {
                ...last,
                content: last.content + chunk,
              }
            }
            return next
          })
        },
        ac.signal,
      )
      setPreviewKey((k) => k + 1)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.role === 'assistant' && !last.content) {
          return prev.slice(0, -1)
        }
        return prev
      })
    } finally {
      setLoading(false)
      setStreaming(false)
    }
  }

  const started = projectId !== null

  return (
    <div className={`app ${started ? 'app--started' : ''}`}>
      {!started ? (
        <section className="landing">
          <p className="brand">Lovable</p>
          <h1>What do you want to build?</h1>
          <p className="subtitle">
            Describe your idea. We&apos;ll stream the agent reply beside a live
            preview of your app.
          </p>
          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="A landing page for a coffee shop with a menu and booking form…"
              rows={3}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSubmit(e)
                }
              }}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Building…' : 'Start'}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>
      ) : (
        <div className="workspace">
          <aside className="chat-panel">
            <header className="chat-header">
              <span className="brand-inline">Lovable</span>
              <span className="project-id">{projectId}</span>
            </header>

            <div className="messages">
              {messages.map((msg, i) => {
                const isEmptyAssistant =
                  msg.role === 'assistant' && !msg.content && streaming
                return (
                  <div key={i} className={`bubble bubble--${msg.role}`}>
                    <span className="bubble-role">
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </span>
                    <p>
                      {isEmptyAssistant
                        ? 'Working on it…'
                        : msg.content || (msg.role === 'assistant' ? '…' : '')}
                    </p>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <form className="composer composer--docked" onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for a change…"
                rows={2}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSubmit(e)
                  }
                }}
              />
              <button type="submit" disabled={loading || !input.trim()}>
                Send
              </button>
            </form>
            {error && <p className="error error--docked">{error}</p>}
          </aside>

          <main className="preview-panel">
            <header className="preview-header">
              <span className="preview-label">Live preview</span>
              <a href={PREVIEW_URL} target="_blank" rel="noreferrer">
                {PREVIEW_URL}
              </a>
              <button
                type="button"
                className="preview-refresh"
                onClick={() => setPreviewKey((k) => k + 1)}
                title="Refresh preview"
              >
                Refresh
              </button>
            </header>
            <iframe
              key={`${PREVIEW_URL}-${previewKey}`}
              src={PREVIEW_URL}
              title="Live website preview"
              className="preview-frame"
            />
          </main>
        </div>
      )}
    </div>
  )
}
