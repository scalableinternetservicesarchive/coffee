const beeline = require('honeycomb-beeline')()

export function spanCtx(ctx: any) {
  beeline.addContext(ctx)
}

export function trace<T>(ctx: { op: string }, cb: () => T) {
  const trace = beeline.startTrace()
  try {
    spanCtx(ctx)
    return cb()
  } catch (e) {
    spanCtx({ err: e.stack })
    throw e
  } finally {
    beeline.finishTrace(trace)
  }
}

export function asyncTrace<T>(ctx: { op: string }, cb: () => Promise<T>) {
  const trace = beeline.startTrace()
  return (async () => {
    try {
      spanCtx(ctx)
      return await cb()
    } catch (e) {
      spanCtx({ err: e.stack })
      throw e
    } finally {
      beeline.finishTrace(trace)
    }
  })()
}

export function span<T>(ctx: { op: string }, cb: () => T) {
  const span = beeline.startSpan(ctx)
  try {
    return cb()
  } catch (e) {
    spanCtx({ err: e.stack })
    throw e
  } finally {
    beeline.finishSpan(span)
  }
}

export async function asyncSpan<T>(ctx: { op: string }, cb: () => Promise<T>) {
  const span = beeline.startSpan(ctx)
  try {
    return await cb()
  } catch (e) {
    spanCtx({ err: e.stack })
    throw e
  } finally {
    beeline.finishSpan(span)
  }
}
