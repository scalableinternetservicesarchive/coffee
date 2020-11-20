import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { ColorName, Colors } from '../../../../common/src/colors'
import { H1, H2, H3 } from '../../style/header'
import { Spacer } from '../../style/spacer'
import { style } from '../../style/styled'
import { BodyText } from '../../style/text'
import { CafeCreator } from '../cafe/CafeCreator'
import { CafeList } from '../cafe/CafeList'
import { AppRouteParams } from '../nav/route'
import { Page } from './Page'

interface HomePageProps extends RouteComponentProps, AppRouteParams {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomePage(props: HomePageProps) {
  return (
    <Page>
      <Hero>
        <H1>COFFEE</H1>
        <H3>discover cafes around the world</H3>
      </Hero>
      <Content style={{ width: '900px' }}>
        <LContent>
          <Section>
            <CafeCreator />
          </Section>
          <Section>
            <CafeList />
          </Section>
        </LContent>
        <RContent>
          <Section>
            <H2>Team Information</H2>
            <Spacer $h4 />
            <BodyText>
              <table>
                <tbody>
                  <tr>
                    <TD>🌻</TD>
                    <TD>Lucy Huo</TD>
                  </tr>
                  <tr>
                    <TD>👨‍🏫</TD>
                    <TD>Wilson Jusuf</TD>
                  </tr>
                  <tr>
                    <TD>👨‍🏫</TD>
                    <TD>Roger Sun</TD>
                  </tr>
                  <tr>
                    <TD>👨‍🏫</TD>
                    <TD>Huy Le</TD>
                  </tr>
                </tbody>
              </table>
            </BodyText>
          </Section>
          <Section>
            <H2>Recent Activity</H2>
            <Spacer $h4 />
            <BodyText>coming soon</BodyText>
          </Section>
        </RContent>
      </Content>
    </Page>
  )
}

const Hero = style('div', 'mb4 w-100 ba b--mid-gray br2 pa3 tc', {
  borderLeftColor: Colors.lemon + '!important',
  borderRightColor: Colors.lemon + '!important',
  borderLeftWidth: '4px',
  borderRightWidth: '4px',
})

const Content = style('div', 'flex-l')

const LContent = style('div', 'flex-grow-0 w-70-l mr4-l')

const RContent = style('div', 'flex-grow-0  w-30-l')

const Section = style('div', 'mb4 mid-gray ba b--mid-gray br2 pa3', (p: { $color?: ColorName }) => ({
  borderLeftColor: Colors[p.$color || 'lemon'] + '!important',
  borderLeftWidth: '3px',
}))

const TD = style('td', 'pa1', p => ({
  color: p.$theme.textColor(),
}))
