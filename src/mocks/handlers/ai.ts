import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'

// ─── MOCK DATABASE IN-MEMORY ────────────────────────────────────────────────
const db = {
  sessions: new Map(),
  knowledgeMap: {
    nodes: Array.from({ length: 12 }).map((_, i) => ({
      id: `node-${i}`,
      label: faker.science.chemicalElement().name,
      type: faker.helpers.arrayElement(['CONCEPT', 'TECH', 'TOOL'])
    })),
    edges: Array.from({ length: 15 }).map(() => ({
      from: `node-${faker.number.int({ min: 0, max: 11 })}`,
      to: `node-${faker.number.int({ min: 0, max: 11 })}`
    }))
  },
  flashcards: Array.from({ length: 8 }).map(() => ({
    id: faker.string.uuid(),
    front_text: faker.lorem.sentence(),
    back_text: faker.lorem.sentence(),
    deck_name: "General Knowledge",
    last_reviewed: faker.date.recent().toISOString(),
    next_review: faker.date.future().toISOString()
  }))
}

export const aiHandlers = [
  // 1. Chat Session
  http.post('*/lmsapiv1/ai/chat/session', () => {
    const sessionId = faker.string.uuid()
    db.sessions.set(sessionId, []) // Lưu lịch sử chat nếu cần
    return HttpResponse.json({
      session_id: sessionId,
      model: 'gpt-4o',
      created_at: new Date().toISOString()
    })
  }),

  // 2. Chat Message
  http.post('*/lmsapiv1/ai/chat/message', async ({ request }) => {
    const { message, session_id } = await request.json() as any
    await new Promise(resolve => setTimeout(resolve, 800))

    const response = {
      id: faker.string.uuid(),
      role: 'assistant',
      content: `[Mock AI] Đã nhận tin nhắn từ session ${session_id}: "${message}"`,
      created_at: new Date().toISOString()
    }

    return HttpResponse.json(response)
  }),

  // 3. Knowledge Map
  http.get('*/lmsapiv1/ai/knowledge-map', () => {
    return HttpResponse.json(db.knowledgeMap)
  }),

  // 4. Flashcards
  http.get('*/lmsapiv1/ai/flashcards', () => {
    return HttpResponse.json(db.flashcards)
  })
]
