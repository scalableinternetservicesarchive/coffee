const { pretty } = require('js-object-pretty-print')

function createPropString(props?: any): string {
  if (!props) {
    return ''
  }
  const prettyProps = pretty(props)
  if (prettyProps.length <= 2) {
    return ''
  }
  return prettyProps.substring(1, prettyProps.length - 2)
}
// global singleton
export function log(msg: string, props?: any): void {
  console.log(`${msg}${createPropString(props)}`)
}
