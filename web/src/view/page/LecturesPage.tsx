import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { ColorName, Colors } from '../../../../common/src/colors'
import { H2 } from '../../style/header'
import { Spacer } from '../../style/spacer'
import { style } from '../../style/styled'
import { BodyText, IntroText } from '../../style/text'
import { Link } from '../nav/Link'
import { AppRouteParams } from '../nav/route'
import { Page } from './Page'

interface LecturesPageProps extends RouteComponentProps, AppRouteParams {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LecturesPage(props: LecturesPageProps) {
  return (
    <Page>
      <Section>
        <H2>Lectures</H2>
        <Spacer $h4 />
        <IntroText>Lecture slides and code will be posted regularly. Schedule subject to change.</IntroText>
        <Spacer $h4 />
        <Table>
          <tbody>
            <Lecture
              day="Thu Oct 1"
              title="Course intro"
              href="#"
              description="Course overview. Demo: how a web app fails."
            />
            <Lecture
              day="Tue Oct 6"
              title="HTTP, HTML, CSS"
              href="#"
              description="HTTP protocol in depth. Demo: building on the web with HTML and CSS."
              requiredReading={[
                {
                  title: 'High Performance Browser Networking, chapter 1',
                  href: 'https://hpbn.co/primer-on-latency-and-bandwidth/',
                },
                {
                  title: 'High Performance Browser Networking, chapter 2',
                  href: 'https://hpbn.co/building-blocks-of-tcp/',
                },
              ]}
            />
            <Lecture
              day="Thu Oct 8"
              title="Shipping software in real life"
              href="#"
              description="Working with other people & shipping like a pro. Demo: `git` and CI/CD."
            />
            <Lecture
              day="Tue Oct 13"
              title="Application server architecture"
              href="#"
              description="Building an efficient appserver. Demo: survey of appservers."
            />
            <Lecture
              day="Thu Oct 15"
              title="Vertical and horizontal scaling"
              href="#"
              description="Using bigger and more appservers. Demo: scaling the course website."
            />
            <Lecture
              day="Tue Oct 20"
              title="High availability, AWS"
              href="#"
              description="Making sure your server is always online. Demo: using Amazon Web Services."
            />
            <Lecture
              day="Thu Oct 22"
              title="Server and client side caching"
              href="#"
              description="Caching data on the server and client. Demo: adding caching to the course website."
            />
            <Lecture
              day="Tue Oct 27"
              title="Load testing"
              href="#"
              description="Writing load tests. Demo: load testing the course website."
            />
            <Lecture
              day="Thu Oct 29"
              title="Scaling relational databases"
              href="#"
              description="Using sharding, services, and read-slaves to scale MySQL. Demo: scaling RDS."
            />
            <Lecture
              day="Tue Nov 3"
              title="Beyond relational databases"
              href="#"
              description="Scaling databases without SQL. Demo: survey of NoSQL databases."
            />
            <Lecture
              day="Thu Nov 5"
              title="Client-side rendering"
              href="#"
              description="Drawing HTML in the browser. Demo: survey of client-side rendering."
            />
            <Lecture
              day="Tue Nov 10"
              title="API design, GraphQL"
              href="#"
              description="Designing an API. Demo: course website interactive GraphQL explorer."
            />
            <Lecture
              day="Thu Nov 12"
              title="Serverless computing"
              href="#"
              description="Scaling code without servers. Demo: Firebase, AWS Lambda."
            />
            <Lecture
              day="Tue Nov 17"
              title="Monitoring and observability"
              href="#"
              description="Measuring how your server is working. Demo: using Honeycomb."
            />
            <Lecture
              day="Thu Nov 19"
              title="Microservices, containers, and Kubernetes"
              href="#"
              description="Decomposing and deploying services with Docker and Kubernetes. Demo: inside a Kubernetes cluster."
            />
            <Lecture
              day="Tue Nov 24"
              title="Intelligent systems"
              href="#"
              description="Using ML in your internet service. Guest lecture: Andrew Mutz."
            />
            <Lecture day="Thu Nov 26" title="Thanksgiving (no lecture)" />
            <Lecture
              day="Tue Dec 1"
              title="Fetching data, publishing data"
              href="#"
              description="Updating your app with new data in real time. Demo: polling, GraphQL subscriptions."
            />
            <Lecture
              day="Thu Dec 3"
              title="High performance networking"
              href="#"
              description="Using HTTP/2, CDNs, and edge computing. Demo: Next.js, Netlify."
            />
            <Lecture day="Tue Dec 8" title="Course conclusion" href="#" description="Reviewing the scaling toolset." />
            <Lecture day="Thu Dec 10" title="Project Presentations" />
          </tbody>
        </Table>
      </Section>
    </Page>
  )
}

interface RequiredReading {
  title: string
  href: string
}

function Lecture(props: {
  day: string
  title: string
  description?: string
  href?: string
  requiredReading?: RequiredReading[]
}) {
  return (
    <TR>
      <BodyText>
        <TD>{props.day}</TD>
        <TD>
          <b>{props.href ? <Link href={props.href}>{props.title}</Link> : props.title}</b>

          {props.description && (
            <>
              <Spacer $h2 />
              <i>{props.description}</i>
            </>
          )}
          {props.requiredReading && (
            <>
              <Spacer $h4 />
              <b>Reading</b>
              <Spacer $h2 />
              <ul className="ml4">
                {props.requiredReading.map((rr, i) => (
                  <li key={i}>
                    <Link href={rr.href}>{rr.title}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </TD>
      </BodyText>
    </TR>
  )
}

const Table = style('table', 'w-100 ba b--black')

const Section = style('div', 'mb4 mid-gray ba b--mid-gray br2 pa3', (p: { $color?: ColorName }) => ({
  borderLeftColor: Colors[p.$color || 'lemon'] + '!important',
  borderLeftWidth: '3px',
}))

const TR = style('tr', 'ba b--black')

const TD = style('td', 'mid-gray pa3 v-mid', { minWidth: '7em' })
