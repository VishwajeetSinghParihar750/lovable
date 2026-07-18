export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

/** Preview of the generated USER_APP (assumed running locally). */
export const PREVIEW_URL = 'http://localhost:5173'

/**
 * POST /chat?id=… and stream the assistant reply as plain text chunks
 * (backend proxies the AI agent's text/event-stream).
 */
export async function streamChat(
  id: string,
  message: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`/chat?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ message }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Chat failed (${res.status})`)
  }

  if (!res.body) {
    throw new Error('No response body from /chat')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) onChunk(chunk)
  }
}
