import { RouteComponentProps } from '@reach/router'
import { AppRouteParams } from '../nav/route'
import * as React from 'react'
import { Page } from './Page'
import { Login } from '../auth/Login'

interface LoginPageProps extends RouteComponentProps, AppRouteParams {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LoginPage(props: LoginPageProps) {
  return (
    <Page>
      <Login
        onSuccessAuth={()=>window.location.href='/app/index'}
      />
    </Page>
  )
}

