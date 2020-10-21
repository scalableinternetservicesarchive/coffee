import { Color, Colors } from './colors'

export interface ITheme {
  colors: {
    primary: Color
    secondary: Color
    success: Color
    danger: Color
    warning: Color
    info: Color
    light: Color
    dark: Color

    background: Color
    border: Color
  }
  layout: {
    space: {
      // each index represents a number of pixels for that level
      1: number
      2: number
      3: number
      4: number
      5: number
      6: number
      7: number
      8: number
      9: number
    }
  }
}

export class Theme implements ITheme {
  constructor(public colors: ITheme['colors'], public layout: ITheme['layout']) {}

  primary(isError?: boolean) {
    return isError ? this.colors.danger.colorHex : this.colors.primary.colorHex
  }

  textColor(isError?: boolean) {
    return isError ? Colors.coral : '#555'
  }

  headerColor() {
    return Colors.charcoal
  }

  linkColor() {
    return '#2774AE'
    // return this.colors.primary.colorHex
  }
}

export const defaultTheme = new Theme(
  {
    primary: Color.blue,
    secondary: Color.gray,
    success: Color.green,
    danger: Color.red,
    warning: Color.yellow,
    info: Color.blue,
    light: Color.gray,
    dark: Color.black,

    background: Color.white,
    border: Color.gray,
  },
  {
    space: {
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 24,
      6: 32,
      7: 48,
      8: 64,
      9: 96,
    },
  }
)
