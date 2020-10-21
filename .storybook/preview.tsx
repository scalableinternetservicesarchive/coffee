import { ApolloProvider } from '@apollo/client'
import { LocationProvider } from '@reach/router'
import * as React from 'react'
import { Provider as StyletronProvider } from 'styletron-react'
import { defaultTheme } from '../common/src/theme'
import { getApolloClient } from '../web/src/graphql/apolloClient'
import { UserType } from '../web/src/graphql/query.gen'
import { ThemeContext } from '../web/src/style/styled'
import { UserContext, UserCtx } from '../web/src/view/auth/user'

const Styletron = require('styletron-engine-monolithic')

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

const engine = new Styletron.Client()

export const decorators = [
  Story => (
    <LocationProvider>
      <ApolloProvider client={getApolloClient()}>
        <UserContext.Provider
          value={
            new UserCtx({
              __typename: 'User',
              id: 1,
              name: 'John Rothfels',
              userType: UserType.ADMIN,
            })
          }
        >
          <StyletronProvider value={engine}>
            <ThemeContext.Provider value={defaultTheme}>
              <div className="sans-serif">
                <Story />
              </div>
            </ThemeContext.Provider>
          </StyletronProvider>
        </UserContext.Provider>
      </ApolloProvider>
    </LocationProvider>
  ),
]
