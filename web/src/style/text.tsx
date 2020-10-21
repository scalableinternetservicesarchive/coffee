import * as React from 'react'
import { StyleObject } from 'styletron-react'
import { ColorName, Colors } from '../../../common/src/colors'
import { Theme } from '../../../common/src/theme'
import { Fonts } from './fonts'
import { style } from './styled'

type TextHTMLProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>

export interface TextProps extends TextHTMLProps {
  $color?: ColorName
  $inline?: boolean
  $monospace?: boolean
}

type TextType = 'intro' | 'body' | 'small' | 'error'

export const IntroText = style<'div', TextProps>('div', 'lh-title sans-serif f5', p => textStyle('intro', p))
export const BodyText = style<'div', TextProps>('div', 'lh-copy sans-serif f5', p => textStyle('body', p))
export const SmallText = style<'div', TextProps>('div', 'lh-copy sans-serif f6', p => textStyle('small', p))
export const ErrorText = style<'div', TextProps>('div', 'lh-copy sans-serif f5', p => textStyle('error', p))

function textStyle(type: TextType, p: TextProps & { $theme: Theme }): StyleObject {
  return {
    color: p.$color ? Colors[p.$color] : p.$theme.textColor(type === 'error'),
    fontFamily: p.$monospace ? Fonts.mono : Fonts.sansBody,
    display: p.$inline ? 'inline-block' : 'block',
    fontWeight: 'normal',
    fontFeatureSettings: 'inherit',
    whiteSpace: p.$monospace ? 'pre-wrap' : undefined,
  }
}
