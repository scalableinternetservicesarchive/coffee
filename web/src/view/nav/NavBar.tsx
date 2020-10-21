import { useLocation } from '@reach/router'
import * as React from 'react'
import { useContext, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useMediaQuery } from 'react-responsive'
import { breakpoints } from '../../style/breakpoints'
import { MenuIcon } from '../../style/icons'
import { style } from '../../style/styled'
import { UserContext } from '../auth/user'
import { addToastListener, removeToastListener, Toast, ToastType } from '../toast/toast'
import { link } from './Link'
import { getLoginPath, getPath, getSurveyPath, Route } from './route'

const title = {
  name: 'CS188',
  path: getPath(Route.HOME),
  title: true,
}

const otherTabs = [
  {
    name: 'lectures',
    path: getPath(Route.LECTURES),
  },
  {
    name: 'projects',
    path: getPath(Route.PROJECTS),
  },
  {
    name: 'playground',
    path: getPath(Route.PLAYGROUND),
  },
]

export function NavBar() {
  const location = useLocation()
  const isSmall = useMediaQuery(breakpoints.small)
  const [showMenu, setShowMenu] = React.useState(false)
  const [toast, setToast] = React.useState<Toast | null>(null)

  function onToast(feedback: Toast) {
    setToast(feedback)
  }

  useEffect(() => {
    addToastListener(onToast)
    return () => removeToastListener(onToast)
  }, []) // only call on mount and unmount

  // clear toast after 3 secs whenever it changes to a non-empty value
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timeout)
    }
    return void 0
  }, [toast])

  const tabs = isSmall ? [otherTabs.find(t => location.pathname.startsWith(t.path)) || otherTabs[0]] : otherTabs

  return (
    <>
      <div className="fixed top-0 left-0 w-100 avenir">
        {/* mount point for NavMenu */}
        <div id="nav-modal" />
        <Nav>
          <NavItem {...title} />

          {/* push tab to the right on small screens */}
          {isSmall && <div style={{ flex: 1 }} />}

          {/* layout additional tabs (possibly hidden for small screens) */}
          {tabs.map((tab, i) => (
            <NavItem key={i} {...tab} />
          ))}

          {isSmall && <NavMenu show={showMenu} onClick={() => setShowMenu(!showMenu)} />}
        </Nav>
        <SubNav />
      </div>
      {toast && <ToastContainer $isError={toast.type === ToastType.ERROR}>{toast.message}</ToastContainer>}
    </>
  )
}

function NavMenu(props: { show: boolean; onClick: () => void }) {
  return (
    <NavMenuButton onClick={props.onClick}>
      <MenuIcon />
      {props.show && (
        <Modal>
          <NavMenuModal>
            {otherTabs.map((tab, i) => (
              <NavItem key={i} {...tab} />
            ))}
          </NavMenuModal>
        </Modal>
      )}
    </NavMenuButton>
  )
}

function SubNav() {
  const location = useLocation()
  const { user } = useContext(UserContext)
  if (!location.pathname.startsWith(getPath(Route.PLAYGROUND))) {
    // only playground has subnav
    return null
  }
  return (
    <Nav $isSubNav>
      <NavItem name="surveys" path={getSurveyPath()} />
      <NavItem name={user ? 'logout' : 'login'} path={getLoginPath()} />
    </Nav>
  )
}

const Nav = style(
  'nav',
  'flex white items-center list pa2 ph4 ph5-ns ph7-l avenir f4',
  (p: { $isSubNav?: boolean }) => ({
    background: `linear-gradient(90deg, ${'#005587'} 0%, ${'#2774AE'} 100%)`,
    opacity: '0.9',
    paddingTop: p.$isSubNav ? 0 : undefined,
    paddingBottom: p.$isSubNav ? 0 : undefined,
    justifyContent: p.$isSubNav ? 'flex-end' : 'space-between',
  })
)

function NavItem(props: { name: string; path: string; title?: boolean }) {
  const location = useLocation()
  return (
    <NavLink $title={props.title} $bold={props.title || location.pathname.startsWith(props.path)} to={props.path}>
      {props.name}
    </NavLink>
  )
}

const NavAnchor = style(
  'a',
  'link near-white hover-bg-black-10 pa2 br2',
  (p: { $bold?: boolean; $title?: boolean }) => ({
    fontWeight: p.$bold ? 600 : 200,
    fontSize: p.$title ? '1.5em' : undefined,
  })
)
const NavLink = link(NavAnchor)

const NavMenuButton = style('div', 'ml3 pa2 hover-bg-black-10 pointer')

const NavMenuModal = style(
  'div',
  'avenir f4 fixed flex flex-column items-center top-0 br3 pa3 right-0 bg-black-90 mt5 mr4 mr5-ns',
  { zIndex: 100 }
)

const ToastContainer = style<'div', { $isError?: boolean }>(
  'div',
  'avenir f5 fixed bottom-0 white right-0 br3 pa3 bg-black-90 mb3 mr4 mr5-ns mr7-l',
  () => ({
    // color: p.$theme.textColor(p.$isError),
    zIndex: 100,
  })
)

function Modal(props: { children: React.ReactNode }) {
  return ReactDOM.createPortal(props.children, document.querySelector('#nav-modal')!)
}
