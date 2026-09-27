import { describe, expect, it } from 'vitest'

import { conversationHasUserPrompt, conversationTaskStatus } from './conversationTaskStatus.js'

describe('conversationTaskStatus', () => {
  it('shows waiting for you while an input prompt is open, even if the turn is still busy', () => {
    expect(
      conversationTaskStatus({
        backgroundCount: 1,
        busy: true,
        failed: false,
        hasUserPrompt: true,
        todos: []
      })
    ).toBe('waiting_for_you')
  })

  it('shows blocked after a failed turn', () => {
    expect(
      conversationTaskStatus({
        backgroundCount: 0,
        busy: false,
        failed: true,
        hasUserPrompt: false,
        todos: []
      })
    ).toBe('blocked')
  })

  it('shows in progress while retrying a previously failed turn', () => {
    expect(
      conversationTaskStatus({
        backgroundCount: 0,
        busy: true,
        failed: true,
        hasUserPrompt: false,
        todos: []
      })
    ).toBe('in_progress')
  })

  it('shows in progress while work or an unfinished task list remains', () => {
    const base = { failed: false, hasUserPrompt: false }

    expect(conversationTaskStatus({ ...base, backgroundCount: 0, busy: true, todos: [] })).toBe('in_progress')
    expect(conversationTaskStatus({ ...base, backgroundCount: 1, busy: false, todos: [] })).toBe('in_progress')
    expect(
      conversationTaskStatus({
        ...base,
        backgroundCount: 0,
        busy: false,
        todos: [{ content: 'Ship it', id: 'ship', status: 'pending' }]
      })
    ).toBe('in_progress')
  })

  it('does not require transcript history to decide durable work', () => {
    expect(
      conversationTaskStatus({
        backgroundCount: 0,
        busy: false,
        failed: false,
        hasUserPrompt: false,
        todos: []
      })
    ).toBe('done')
  })

  it('treats a connection setup response as a user prompt', () => {
    expect(
      conversationTaskStatus({
        backgroundCount: 1,
        busy: true,
        failed: true,
        hasUserPrompt: conversationHasUserPrompt({ connection: { opId: 'op-1' } }),
        todos: []
      })
    ).toBe('waiting_for_you')
  })

  it('shows done when no work remains', () => {
    expect(
      conversationTaskStatus({
        backgroundCount: 0,
        busy: false,
        failed: false,
        hasUserPrompt: false,
        todos: []
      })
    ).toBe('done')
  })
})
