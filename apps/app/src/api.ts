export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type StartChatResponse = {
  id: string
  url: string
  response: string
}

type ContinueChatResponse = {
  response: string
}

export async function startChat(message: string): Promise<StartChatResponse> {
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) {
    throw new Error(`Failed to start chat (${res.status})`)
  }

  return res.json()
}

export async function continueChat(
  id: string,
  message: string,
): Promise<ContinueChatResponse> {
  const res = await fetch(`/chat?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) {
    throw new Error(`Failed to send message (${res.status})`)
  }

  return res.json()
}
