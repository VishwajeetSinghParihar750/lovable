import { useEffect, useRef, useState, type FormEvent } from 'react'
import { continueChat, startChat, type ChatMessage } from './api'
import './App.css'

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      if (!projectId) {
        const data = await startChat(text)
        setProjectId(data.id)
        setPreviewUrl(data.url)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ])
      } else {
        const data = await continueChat(projectId, text)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ])
        setPreviewKey((k) => k + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
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
            Describe your idea. We&apos;ll spin up a project and stream the live
            site beside your chat.
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
              {messages.map((msg, i) => (
                <div key={i} className={`bubble bubble--${msg.role}`}>
                  <span className="bubble-role">
                    {msg.role === 'user' ? 'You' : 'AI'}
                  </span>
                  <p>{msg.content}</p>
                </div>
              ))}
              {loading && (
                <div className="bubble bubble--assistant bubble--pending">
                  <span className="bubble-role">AI</span>
                  <p>Working on it…</p>
                </div>
              )}
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
              {previewUrl && (
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  {previewUrl}
                </a>
              )}
            </header>
            {previewUrl ? (
              <iframe
                key={`${previewUrl}-${previewKey}`}
                src={previewUrl}
                title="Live website preview"
                className="preview-frame"
              />
            ) : (
              <div className="preview-empty">No preview URL yet</div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}
