import { cn } from './utils'
import { expect, test } from 'vitest'

test('cn merges tailwind classes correctly', () => {
  expect(cn('px-2', 'py-2')).toBe('px-2 py-2')
  expect(cn('px-2', 'px-4')).toBe('px-4')
  expect(cn('px-2', undefined, 'py-2')).toBe('px-2 py-2')
  expect(cn('bg-red-500', { 'bg-blue-500': true })).toBe('bg-blue-500')
})
