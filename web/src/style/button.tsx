import * as React from 'react'
import { ColorName, Colors } from '../../../common/src/colors'
import { style } from './styled'

export interface ButtonProps {
  $color?: ColorName
  $filled?: boolean
  $width?: number
  $small?: boolean
  $block?: boolean
}

type Props = ButtonProps & JSX.IntrinsicElements['a']

export const Button: React.FC<Props> = (props: Props) => {
  return <ButtonBase {...props} />
}

const ButtonBase = style<'a', ButtonProps>('a', 'pointer link dim br3 ph3 pv2 black', p => {
  // return {}
  // const { $color, $filled, $width, onClick, $small, $block } = p

  // const fgName = $color || 'sky'
  // const fg = Colors[fgName]
  // const fgRgb = ColorsRGB[fgName]
  // const fgLight = LightColors[fgName]
  // const fgDark = DarkColors[fgName]

  // const colBorder = fg
  // const col = $filled ? Colors.ink : fg
  // const colBg = $filled ? fg : 'transparent'

  return {
    backgroundColor: Colors[p.$color || 'lemon'],
    // display: p.$block ? 'block' : 'inline',
    //   backgroundColor: colBg,
    //   border: `1px solid ${colBorder}`,
    //   borderRadius: '4px',
    //   cursor: onClick ? 'pointer' : 'default',
    //   padding: $small ? '8px 12px 8px 12px' : '11px 24px 9px 24px',
    //   width: $width + 'px',
    //   fontSize: $small ? '14px' : '16px',
    //   fontFamily: Fonts.sansHeader,
    //   ':focus': {
    //     color: $filled ? Colors.ink : fgLight,
    //     border: `1px solid ${fgLight}`,
    //     borderRadius: '4px',
    //     backgroundColor: $filled ? fgLight : `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, 0.1)`,
    //   },
    //   ':hover': {
    //     color: $filled ? Colors.ink : fgLight,
    //     backgroundColor: $filled ? fgLight : `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, 0.1)`,
    //     border: `1px solid ${fgLight}`,
    //     borderRadius: '4px',
    //   },
    //   ':active': {
    //     color: $filled ? Colors.ink : fgDark,
    //     backgroundColor: fgDark,
    //     border: `1px solid ${fgDark}`,
    //     borderRadius: '4px',
    //     opacity: $filled ? 0.9 : 1,
    //   },
    //   ':disabled': {
    //     color: col,
    //     backgroundColor: colBg,
    //     border: `1px solid ${colBorder}`,
    //     borderRadius: '4px',
    //     opacity: 0.4,
    //     cursor: 'default',
    //   },
  }
})
