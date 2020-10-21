/* eslint-disable @typescript-eslint/ban-types */

import * as React from 'react'
import { forwardRef } from 'react'
import { createStyled, StyleObject, StyletronComponent, withStyleDeep } from 'styletron-react'
import { driver, getInitialStyle } from 'styletron-standard'
import { defaultTheme, Theme } from '../../../common/src/theme'

export const ThemeContext = React.createContext(defaultTheme)

const wrapper = (StyledComponent: any) =>
  forwardRef(function WithTheme(props: any, ref: any) {
    return (
      <ThemeContext.Consumer>{theme => <StyledComponent ref={ref} {...props} $theme={theme} />}</ThemeContext.Consumer>
    )
  })

const styled = createStyled({ wrapper, getInitialStyle, driver })

const fn = (tag: any, classOrStyle: any, style: any) => {
  const className = typeof classOrStyle === 'string' ? classOrStyle : undefined
  const Component = styled(tag, className ? style || {} : classOrStyle)
  Component.displayName = 'styl.' + tag.toString()
  if (className) {
    Component.defaultProps = { className }
  }
  return Component
}

export const style = (fn as any) as StyledFn

const extendFn = (component: any, classOrStyle: any, style: any) => {
  const className = typeof classOrStyle === 'string' ? classOrStyle : undefined
  const Component = withStyleDeep(component, className ? style || {} : classOrStyle)
  Component.displayName = 'styl.extend.' + component.displayName || 'anonynmous'
  Component.defaultProps = { className: className || component.defaultProps?.className }
  return Component
}

export const withStyl = (extendFn as any) as StyledFn

/**
 * This is the original StyledFn export of `styletron-react`, but with the overload option to pass `className`
 * e.g. for tachyons.
 */
interface StyledFn {
  <C extends keyof JSX.IntrinsicElements | React.ComponentType<any>, P extends object>(
    component: C,
    style: (props: P & { $theme: Theme }) => StyleObject
  ): StyletronComponent<
    Pick<React.ComponentProps<C>, Exclude<keyof React.ComponentProps<C>, { className: string }>> & P
  >
  <C extends keyof JSX.IntrinsicElements | React.ComponentType<any>>(
    component: C,
    style: StyleObject
  ): StyletronComponent<Pick<React.ComponentProps<C>, Exclude<keyof React.ComponentProps<C>, { className: string }>>>

  <C extends keyof JSX.IntrinsicElements | React.ComponentType<any>, P extends object>(
    component: C,
    className: string,
    style: (props: P & { $theme: Theme }) => StyleObject
  ): StyletronComponent<
    Pick<React.ComponentProps<C>, Exclude<keyof React.ComponentProps<C>, { className: string }>> & P
  >
  <C extends keyof JSX.IntrinsicElements | React.ComponentType<any>>(
    component: C,
    className: string,
    style: StyleObject
  ): StyletronComponent<Pick<React.ComponentProps<C>, Exclude<keyof React.ComponentProps<C>, { className: string }>>>

  <C extends keyof JSX.IntrinsicElements | React.ComponentType<any>, P extends object>(
    component: C,
    className: string
  ): StyletronComponent<
    Pick<React.ComponentProps<C>, Exclude<keyof React.ComponentProps<C>, { className: string }>> & P
  >
  <C extends keyof JSX.IntrinsicElements | React.ComponentType<any>>(
    component: C,
    className: string
  ): StyletronComponent<Pick<React.ComponentProps<C>, Exclude<keyof React.ComponentProps<C>, { className: string }>>>
}
