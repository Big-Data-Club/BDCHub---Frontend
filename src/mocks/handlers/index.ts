import { authHandlers } from './auth'
import { lmsHandlers } from './lms'
import { aiHandlers } from './ai'

export const handlers = [
  ...authHandlers,
  ...lmsHandlers,
  ...aiHandlers,
]
