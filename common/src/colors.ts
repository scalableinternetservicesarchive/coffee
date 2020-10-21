export const Colors = {
  sky: '#2774AE',
  mint: '#00e08f',
  lemon: '#FFD100',
  coral: '#ff5c8d',

  black: '#000000',
  ink: '#101011',
  charcoal: '#242426',
  steel: '#3d3d40',
  midway: '#6d6c73',
  silver: '#a4a3a8',
  snow: '#f5f5f6',
  white: '#ffffff',
}

export type ColorName = keyof typeof Colors

export const ColorsRGB = {
  sky: hexToRgb(Colors.sky)!,
  mint: hexToRgb(Colors.mint)!,
  lemon: hexToRgb(Colors.lemon)!,
  coral: hexToRgb(Colors.coral)!,

  black: hexToRgb(Colors.black)!,
  ink: hexToRgb(Colors.ink)!,
  charcoal: hexToRgb(Colors.charcoal)!,
  steel: hexToRgb(Colors.steel)!,
  midway: hexToRgb(Colors.midway)!,
  silver: hexToRgb(Colors.snow)!,
  snow: hexToRgb(Colors.snow)!,
  white: hexToRgb(Colors.white)!,
}

export const LightColors = {
  sky: '#41d7ff',
  mint: '#0fffa7',
  lemon: '#ffea5e',
  coral: '#ff749e',

  black: Colors.ink,
  ink: Colors.charcoal,
  charcoal: Colors.steel,
  steel: Colors.midway,
  midway: Colors.silver,
  silver: Colors.snow,
  snow: Colors.white,
  white: Colors.white,
}

export const DarkColors = {
  sky: '#007e9e',
  mint: '#009d64',
  lemon: '#b0a508',
  coral: '#c14a6e',

  black: Colors.black,
  ink: Colors.black,
  charcoal: Colors.ink,
  steel: Colors.charcoal,
  midway: Colors.steel,
  silver: Colors.midway,
  snow: Colors.silver,
  white: Colors.snow,
}

export const ContrastColors = {
  sky: Colors.black,
  mint: Colors.black,
  lemon: Colors.black,
  coral: Colors.black,

  black: Colors.silver,
  ink: Colors.silver,
  charcoal: Colors.silver,
  steel: Colors.black,
  midway: Colors.black,
  silver: Colors.black,
  snow: Colors.ink,
  white: Colors.ink,
}

/**
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * String name for UI level.
 */
export type LevelString = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'

/**
 * Represents a semantic UI level, modeled after Bootstrap.
 */
export class Level {
  public static primary = new Level('primary')
  public static secondary = new Level('secondary')
  public static success = new Level('success')
  public static danger = new Level('danger')
  public static warning = new Level('warning')
  public static info = new Level('info')
  public static light = new Level('light')
  public static dark = new Level('dark')

  public static levelStringToColor(level: LevelString): Color {
    switch (level) {
      case 'primary':
        return Color.blue
      case 'secondary':
        return Color.gray
      case 'success':
        return Color.green
      case 'danger':
        return Color.red
      case 'warning':
        return Color.yellow
      case 'info':
        return Color.blue
      case 'light':
        return Color.gray
      case 'dark':
        return Color.black
      default:
        throw new Error('unexpected ui level: ' + level)
    }
  }

  public static from(level: UILevel): Level {
    if (typeof level === 'string') {
      return new Level(level)
    }
    return level
  }

  constructor(private level: LevelString) {}

  /**
   * The Color object associated with this level.
   */
  public get color(): Color {
    return Level.levelStringToColor(this.level)
  }
}

/**
 * Convenience type used for React components, it allows
 * users to pass the class or string representation to
 * components freely without compiler warning. Components
 * that want a level should declare UILevel prop, rather
 * than Level or LevelString.
 */
export type UILevel = LevelString | Level

export interface GetStyles {
  color(): any
  contrastColor(): any
  bg(): any
  border(): any
}

// Enumeration of color values for switches.
export class Color implements GetStyles {
  public static blue = new Color('sky')
  public static green = new Color('mint')
  public static yellow = new Color('lemon')
  public static red = new Color('coral')
  public static black = new Color('black')
  public static gray = new Color('silver')
  public static white = new Color('white')
  public static all = [Color.blue, Color.green, Color.yellow, Color.red, Color.black, Color.gray, Color.white]

  private getStyle?: GetStyles = undefined

  constructor(public colorName: ColorName) {}

  get colorHex() {
    return Colors[this.colorName]
  }

  get contrastColorHex() {
    return ContrastColors[this.colorName]
  }

  setStyle(getStyle: GetStyles) {
    this.getStyle = getStyle
  }

  color() {
    return this.getStyle?.color() || { color: this.colorHex }
  }

  contrastColor() {
    return this.getStyle?.contrastColor() || { color: this.contrastColorHex }
  }

  bg() {
    return this.getStyle?.bg() || { backgroundColor: this.colorHex }
  }

  border() {
    return this.getStyle?.border() || { borderColor: this.colorHex }
  }
}

const tintColorLight = '#2f95dc'
const tintColorDark = '#fff'

export const ThemeColors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
}
