export enum ToastType {
  INFO,
  ERROR,
}

export interface Toast {
  type: ToastType
  message: string
}

let latest = undefined as Toast | undefined
const listeners = [] as ((feedback: Toast) => void)[]

function addToast(message: string, type?: ToastType) {
  type = type || ToastType.INFO
  latest = { message, type }
  for (const listener of listeners) {
    listener(latest)
  }
}

export function toast(message: string) {
  addToast(message)
}

export function toastErr(message: string) {
  addToast(message, ToastType.ERROR)
}

export function addToastListener(func: (feedback: Toast) => void) {
  listeners.push(func)
}

export function removeToastListener(func: (feedback: Toast) => void) {
  const ix = listeners.indexOf(func)
  if (ix < 0) {
    throw new Error('Listener not found')
  }
  listeners.splice(ix, 1)
}
