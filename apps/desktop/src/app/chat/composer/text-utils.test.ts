import { describe, expect, it } from 'vitest'

import { detectTrigger, shouldSkipTriggerRefreshOnKeyUp } from './text-utils'

describe('shouldSkipTriggerRefreshOnKeyUp', () => {
  it('skips the trigger refresh for nav/control keys while a menu is open', () => {
    // These keys are fully handled by the open-trigger keydown branch and
    // never edit text. Refreshing on their keyup resets the highlight to the
    // top (breaking ArrowDown/ArrowUp cycling) and re-opens a menu Escape just
    // closed — the exact bugs this guard prevents.
    for (const key of ['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape']) {
      expect(shouldSkipTriggerRefreshOnKeyUp(key, true)).toBe(true)
    }
  })

  it('does not skip the refresh when no trigger menu is open', () => {
    for (const key of ['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape']) {
      expect(shouldSkipTriggerRefreshOnKeyUp(key, false)).toBe(false)
    }
  })

  it('never skips ordinary text-editing keys, so completions still refresh', () => {
    for (const key of ['a', '/', '@', ' ', 'Backspace', 'ArrowLeft', 'ArrowRight']) {
      expect(shouldSkipTriggerRefreshOnKeyUp(key, true)).toBe(false)
    }
  })
})

describe('detectTrigger', () => {
  it('detects a bare slash trigger with an empty query', () => {
    expect(detectTrigger('/')).toEqual({ kind: '/', query: '', tokenLength: 1 })
  })

  it('detects a slash command query', () => {
    expect(detectTrigger('/skill')).toEqual({ kind: '/', query: 'skill', tokenLength: 6 })
  })

  it('detects a bare at-mention trigger with an empty query', () => {
    expect(detectTrigger('@')).toEqual({ kind: '@', query: '', tokenLength: 1 })
  })

  it('detects an at-mention query', () => {
    expect(detectTrigger('@file')).toEqual({ kind: '@', query: 'file', tokenLength: 5 })
  })

  it('returns null for plain text', () => {
    expect(detectTrigger('hello there')).toBeNull()
  })
})


describe('detectTrigger', () => {
  it('detects slash commands at the start of the input', () => {
    const result = detectTrigger('/steer')
    expect(result).toEqual({ kind: '/', query: 'steer', tokenLength: 6 })
  })

  it('detects partial slash commands at the start', () => {
    const result = detectTrigger('/st')
    expect(result).toEqual({ kind: '/', query: 'st', tokenLength: 3 })
  })

  it('detects bare slash at the start', () => {
    const result = detectTrigger('/')
    expect(result).toEqual({ kind: '/', query: '', tokenLength: 1 })
  })

  it('does NOT trigger slash autocomplete mid-message', () => {
    const result = detectTrigger('hello /steer')
    expect(result).toBeNull()
  })

  it('does NOT trigger slash autocomplete after a space mid-message', () => {
    const result = detectTrigger('some text /new')
    expect(result).toBeNull()
  })

  it('detects @ mentions at the start of the input', () => {
    const result = detectTrigger('@user')
    expect(result).toEqual({ kind: '@', query: 'user', tokenLength: 5 })
  })

  it('detects @ mentions mid-sentence after whitespace', () => {
    const result = detectTrigger('hello @user')
    expect(result).toEqual({ kind: '@', query: 'user', tokenLength: 5 })
  })

  it('detects @ mentions at the start of a new line', () => {
    const result = detectTrigger('hello\n@user')
    expect(result).toEqual({ kind: '@', query: 'user', tokenLength: 5 })
  })

  it('returns null for plain text without triggers', () => {
    expect(detectTrigger('hello world')).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(detectTrigger('')).toBeNull()
  })

  it('returns null when / is embedded in a word mid-message', () => {
    expect(detectTrigger('use path/to/file')).toBeNull()
  })
})
