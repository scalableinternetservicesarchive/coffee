import * as React from 'react'
import { Theme } from '../../../common/src/theme'
import { style } from './styled'

export interface SpacerProps {
  $w1?: boolean
  $w2?: boolean
  $w3?: boolean
  $w4?: boolean
  $w5?: boolean
  $w6?: boolean
  $w7?: boolean
  $w8?: boolean
  $w9?: boolean

  $h1?: boolean
  $h2?: boolean
  $h3?: boolean
  $h4?: boolean
  $h5?: boolean
  $h6?: boolean
  $h7?: boolean
  $h8?: boolean
  $h9?: boolean
}

export function Spacer(props: SpacerProps) {
  return <Div {...props} />
}

const Div = style<'div', SpacerProps>('div', p => ({
  width: getWidth(p) ? getWidth(p) + 'px' : 'auto',
  height: getHeight(p) ? getHeight(p) + 'px' : 'auto',
  display: getWidth(p) ? 'inline-block' : 'block',
}))

function getWidth(p: SpacerProps & { $theme: Theme }) {
  if (p.$w1) {
    return p.$theme.layout.space[1]
  }
  if (p.$w2) {
    return p.$theme.layout.space[2]
  }
  if (p.$w3) {
    return p.$theme.layout.space[3]
  }
  if (p.$w4) {
    return p.$theme.layout.space[4]
  }
  if (p.$w5) {
    return p.$theme.layout.space[5]
  }
  if (p.$w6) {
    return p.$theme.layout.space[6]
  }
  if (p.$w7) {
    return p.$theme.layout.space[7]
  }
  if (p.$w8) {
    return p.$theme.layout.space[8]
  }
  if (p.$w9) {
    return p.$theme.layout.space[9]
  }
  return 0
}

function getHeight(p: SpacerProps & { $theme: Theme }) {
  if (p.$h1) {
    return p.$theme.layout.space[1]
  }
  if (p.$h2) {
    return p.$theme.layout.space[2]
  }
  if (p.$h3) {
    return p.$theme.layout.space[3]
  }
  if (p.$h4) {
    return p.$theme.layout.space[4]
  }
  if (p.$h5) {
    return p.$theme.layout.space[5]
  }
  if (p.$h6) {
    return p.$theme.layout.space[6]
  }
  if (p.$h7) {
    return p.$theme.layout.space[7]
  }
  if (p.$h8) {
    return p.$theme.layout.space[8]
  }
  if (p.$h9) {
    return p.$theme.layout.space[9]
  }
  return 0
}
