import { beforeEach, describe, expect, it } from 'vitest'

import { parseTodoItems, turnController } from '../app/turnController.js'
import { getTurnState, resetTurnState } from '../app/turnStore.js'

// turnController.recordTodos() parses the raw `todo` tool payload into
// TodoItem[]. Nested subtasks (apps/desktop's `parent` field) must survive
// this parse — the TUI todo panel renders hierarchy from it via todoTree().
describe('turnController.recordTodos — preserves the parent field', () => {
  beforeEach(() => {
    resetTurnState()
    turnController.fullReset()
  })

  it('keeps parent on a valid nested subtask', () => {
    turnController.recordTodos([
      { content: 'Ship feature', id: 'wp1', status: 'in_progress' },
      { content: 'Write tests', id: 't1', parent: 'wp1', status: 'pending' }
    ])

    expect(getTurnState().todos).toEqual([
      { content: 'Ship feature', id: 'wp1', status: 'in_progress' },
      { content: 'Write tests', id: 't1', parent: 'wp1', status: 'pending' }
    ])
  })

  it('drops a self-referential parent instead of keeping a self-loop', () => {
    turnController.recordTodos([{ content: 'x', id: 'a', parent: 'a', status: 'pending' }])

    expect(getTurnState().todos).toEqual([{ content: 'x', id: 'a', status: 'pending' }])
  })

  it('omits parent entirely when absent, matching pre-nesting payloads', () => {
    turnController.recordTodos([{ content: 'x', id: 'a', status: 'pending' }])

    expect(getTurnState().todos).toEqual([{ content: 'x', id: 'a', status: 'pending' }])
  })
})

describe('parseTodoItems', () => {
  it('keeps valid rows from a mixed snapshot and rejects malformed rows without coercion', () => {
    const parsed = parseTodoItems([
      null,
      [],
      'not a record',
      { content: 'numeric id', id: 1, status: 'pending' },
      { content: 'object id', id: {}, status: 'pending' },
      { content: 1, id: 'numeric-content', status: 'pending' },
      { content: {}, id: 'object-content', status: 'pending' },
      { content: 'numeric parent', id: 'numeric-parent', parent: 1, status: 'pending' },
      { content: 'object parent', id: 'object-parent', parent: {}, status: 'pending' },
      { content: 'empty id', id: '   ', status: 'pending' },
      { content: '   ', id: 'empty-content', status: 'pending' },
      { content: 'bad status', id: 'bad-status', status: 'unknown' },
      { content: ' Root task ', id: ' root ', status: 'in_progress' },
      { content: ' Child task ', id: ' child ', parent: ' root ', status: 'pending' },
      { content: ' Parent omitted ', id: ' no-parent ', parent: '   ', status: 'completed' }
    ])

    expect(parsed).toEqual([
      { content: 'Root task', id: 'root', status: 'in_progress' },
      { content: 'Child task', id: 'child', parent: 'root', status: 'pending' },
      { content: 'Parent omitted', id: 'no-parent', status: 'completed' }
    ])
  })

  it.each([null, undefined, {}, 'not an array', 1])('rejects malformed top-level input: %j', value => {
    expect(parseTodoItems(value)).toBeNull()
  })
})
