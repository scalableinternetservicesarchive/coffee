import { StyleObject } from 'styletron-react'
import { ColorName, Colors } from '../../../common/src/colors'
import { Theme } from '../../../common/src/theme'
import { Fonts } from './fonts'
import { style } from './styled'

export interface HeaderProps {
  $color?: ColorName
}

export const H1 = style<'h1', HeaderProps>('h1', p => headerStyle(1, p))
export const H2 = style<'h2', HeaderProps>('h2', p => headerStyle(2, p))
export const H3 = style<'h3', HeaderProps>('h3', 'i', p => headerStyle(3, p))
export const H4 = style<'h4', HeaderProps>('h4', p => headerStyle(4, p))
export const H5 = style<'h5', HeaderProps>('h5', p => headerStyle(5, p))

function headerStyle(level: number, p: HeaderProps & { $theme: Theme }): StyleObject {
  return {
    color: p.$color ? Colors[p.$color] : p.$theme.headerColor(),
    fontFamily: Fonts.sansHeader,
    fontSize: fontSize(level),
    fontWeight: fontWeight(level),
    lineHeight: lineHeight(level),
    textTransform: level === 4 ? 'uppercase' : undefined,
  }
}

function fontSize(level: number) {
  switch (level) {
    case 1:
      return '32px'
    case 2:
      return '24px'
    case 3:
      return '21px'
    default:
      return '16px'
  }
}

function fontWeight(level: number) {
  switch (level) {
    case 1:
      return 800
    case 2:
      return 600
    case 3:
      return 400
    default:
      return 'normal'
  }
}

function lineHeight(level: number) {
  switch (level) {
    case 1:
      return 1.5
    case 2:
      return 1.33
    case 3:
      return '27px'
    case 5:
      return 1.5
    default:
      return undefined
  }
}
