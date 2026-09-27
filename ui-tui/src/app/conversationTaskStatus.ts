import type { TodoItem } from '../types.js'

export type ConversationTaskStatus = 'blocked' | 'done' | 'in_progress' | 'waiting_for_you'

interface ConversationTaskStatusInput {
  backgroundCount: number
  busy: boolean
  failed: boolean
  hasUserPrompt: boolean
  todos: readonly TodoItem[]
}

interface ConversationPromptOverlay {
  approval?: unknown
  billing?: unknown
  clarify?: unknown
  confirm?: unknown
  connection?: unknown
  secret?: unknown
  subscription?: unknown
  sudo?: unknown
  vaultUnlock?: unknown
}

const hasActiveTodo = (todos: readonly TodoItem[]) =>
  todos.some(todo => todo.status === 'pending' || todo.status === 'in_progress')

export const conversationHasUserPrompt = (overlay: ConversationPromptOverlay) =>
  Boolean(
    overlay.approval ||
      overlay.billing ||
      overlay.clarify ||
      overlay.confirm ||
      overlay.connection ||
      overlay.secret ||
      overlay.subscription ||
      overlay.sudo ||
      overlay.vaultUnlock
  )

export const conversationTaskStatus = ({
  backgroundCount,
  busy,
  failed,
  hasUserPrompt,
  todos
}: ConversationTaskStatusInput): ConversationTaskStatus => {
  if (hasUserPrompt) {
    return 'waiting_for_you'
  }

  if (busy || backgroundCount > 0) {
    return 'in_progress'
  }

  if (failed) {
    return 'blocked'
  }

  if (hasActiveTodo(todos)) {
    return 'in_progress'
  }

  return 'done'
}
