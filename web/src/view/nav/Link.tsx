import { navigate } from '@reach/router'
import * as React from 'react'
import { ColorName } from '../../../../common/src/colors'
import { style } from '../../style/styled'
import { handleError } from '../toast/error'

export interface LinkProps {
  to?: string
  color?: ColorName
  href?: string | null
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  noTab?: boolean
  children: React.ReactNode
  title?: string | null
  block?: boolean
  className?: string
  Component?: React.ComponentType<any>
}

export class Link extends React.PureComponent<LinkProps> {
  onClick = (e: React.MouseEvent) => {
    const { to } = this.props

    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      if (to) {
        if (to.startsWith('http')) {
          window.open(to)
        } else {
          navigate(to).catch(handleError)
        }
      }
    }
  }

  render() {
    const { to, href, title, onClick, noTab, children, block, Component, ...rest } = this.props
    const hrefUrl = href || to
    const clickHandler = onClick || (to == null ? null : this.onClick)

    const A = Component || DefaultAnchor
    return (
      <A
        target="_blank"
        rel="noopener"
        title={title || undefined}
        href={hrefUrl}
        onClick={clickHandler || undefined}
        tabIndex={noTab ? -1 : undefined}
        style={{ display: block ? 'block' : 'inline-block' }}
        {...rest}
      >
        {children}
      </A>
    )
  }
}

interface LinkWrapProps {
  to?: string
  href?: string
  noTab?: boolean
}

/**
 * "link"-ifies any component.
 */
export function link<P>(Component: React.ComponentType<P>) {
  return function LinkWrap(props: P & LinkWrapProps & { children: React.ReactNode }) {
    const { to, href, noTab, ...rest } = props
    const normalizedTo = to ? (to.startsWith('/') ? to : '/' + to) : undefined

    return (
      <Link Component={Component} to={normalizedTo} href={href} noTab={noTab} {...rest}>
        {props.children}
      </Link>
    )
  }
}

const DefaultAnchor = style('a', 'link dim', p => ({ color: p.$theme.linkColor() }))
