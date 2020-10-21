/**
 * Generates a numeric hashCode from a string content. Identical to Java .hashCode() implementation.
 * https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */
export function hashCode(contents: string) {
  let hash = 0
  for (let i = 0; i < contents.length; i++) {
    const chr = contents.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export function check<T>(val: T | null | undefined, msg?: string) {
  if (!Boolean(val)) {
    throw new Error(msg || `expected truthy value but got ${val}`)
  }
  return val!
}

export function checkEqual<T>(expected: any, val: T, msg?: string) {
  if (val !== expected) {
    throw new Error(msg || `expected ${expected} but got ${val}`)
  }
  return val!
}

export function wait(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

export const strutil = {
  /**
   * Truncates a thing!
   */
  truncate(str: string, maxLen?: number) {
    const len = maxLen || 100
    if (str.length <= len) {
      return str
    }
    return str.substr(0, len) + '…'
  },
}

/**
 * Extracts the inner type of a Promise.
 *
 * E.g. `ThenArg<Promise<number>>` is `number`
 */
export type Unpromise<T> = T extends PromiseLike<infer U> ? U : T
