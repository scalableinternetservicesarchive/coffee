import { useQuery, useSubscription } from '@apollo/client'
import { useLocation } from '@reach/router'
import * as React from 'react'
import { Fragment, useContext, useEffect, useState } from 'react'
import { strutil } from '../../../../common/src/util'
import { getApolloClient } from '../../graphql/apolloClient'
import {
  FetchSurvey,
  FetchSurveys,
  FetchSurveyVariables,
  FetchSurvey_survey_currentQuestion,
  FetchSurvey_survey_currentQuestion_answers,
  SurveySubscription,
  SurveySubscriptionVariables,
} from '../../graphql/query.gen'
import { Button } from '../../style/button'
import { H1, H2 } from '../../style/header'
import { Input } from '../../style/input'
import { Spacer } from '../../style/spacer'
import { BodyText, SmallText } from '../../style/text'
import { UserContext } from '../auth/user'
import { link } from '../nav/Link'
import { getSurveyPath } from '../nav/route'
import { handleError } from '../toast/error'
import { toast } from '../toast/toast'
import { fetchSurvey, fetchSurveys, subscribeSurveys } from './fetchSurveys'
import { answerSurveyQuestion, nextSurveyQuestion } from './mutateSurveys'

export function Surveys() {
  const location = useLocation()
  const [, surveyId] = (location.search || '').split('?surveyId=')
  return surveyId ? <Survey surveyId={Number(surveyId)} /> : <SurveyList />
}

function SurveyList() {
  const { loading, data } = useQuery<FetchSurveys>(fetchSurveys)
  if (loading) {
    return <div>loading...</div>
  }
  if (!data || data.surveys.length === 0) {
    return <div>no surveys</div>
  }
  return (
    <div className="mw6">
      {data.surveys.map((s, i) => (
        <div key={i} className="pa3 br2 mb2 bg-black-10 flex items-center">
          <HeaderLink className="link dim pointer" $color="sky" to={getSurveyPath(s.id)}>
            {s.name}
          </HeaderLink>
          <Spacer $w5 />
          <BodyText $color={s.isStarted && !s.isCompleted ? 'coral' : undefined}>{surveyLabel(s)}</BodyText>
        </div>
      ))}
    </div>
  )
}

const HeaderLink = link(H2)

export function Survey({ surveyId }: { surveyId: number }) {
  const user = useContext(UserContext)
  const { loading, data, refetch } = useQuery<FetchSurvey, FetchSurveyVariables>(fetchSurvey, {
    variables: { surveyId },
  })

  const [currQuestion, setCurrQuestion] = useState(data?.survey?.currentQuestion)
  useEffect(() => {
    setCurrQuestion(data?.survey?.currentQuestion)
  }, [data])

  const sub = useSubscription<SurveySubscription, SurveySubscriptionVariables>(subscribeSurveys, {
    variables: { surveyId },
  })
  useEffect(() => {
    if (sub.data?.surveyUpdates) {
      setCurrQuestion(sub.data.surveyUpdates.currentQuestion)
    }
  }, [sub.data])

  if (loading) {
    return <div>loading...</div>
  }
  if (!data || !data.survey) {
    return <div>no survey</div>
  }

  function handleNextQuestion() {
    nextSurveyQuestion(surveyId)
      .then(() => refetch())
      .catch(handleError)
  }

  return (
    <div className="flex flex-column mw6">
      <div className="flex items-center">
        <H1>{data.survey.name}</H1>
        <Spacer $w4 />
        {user.isAdmin() && <Button onClick={handleNextQuestion}>Next</Button>}
      </div>
      <Spacer $h3 />
      {currQuestion ? <SurveyInput currentQuestion={currQuestion} /> : <div>{surveyLabel(data.survey)}</div>}
      <Spacer $h3 />
      {currQuestion && <SurveyHistogram answers={currQuestion.answers} />}
    </div>
  )
}

function SurveyInput(props: { currentQuestion: FetchSurvey_survey_currentQuestion }) {
  const question = props.currentQuestion
  const [{ submitted, submitting }, setSubmitted] = useState({ submitting: false, submitted: false })
  useEffect(() => {
    setSubmitted({ submitting: false, submitted: false })
  }, [question.id])

  function handleSubmit(val: string) {
    setSubmitted({ submitting: true, submitted: false })
    answerSurveyQuestion(getApolloClient(), { answer: val, questionId: question.id })
      .then(() => {
        toast('submitted!')
        setSubmitted({ submitted: true, submitting: false })
      })
      .catch(err => {
        handleError(err)
        setSubmitted({ submitted: false, submitting: false })
      })
  }

  if (submitted) {
    return null
  }

  return (
    <>
      <div>{question.prompt}</div>
      <Spacer $h3 />
      <div className="flex flex-column">
        {question.choices?.map((choice, i) => (
          <Fragment key={i}>
            <Spacer $h3 />
            <Button $block onClick={() => handleSubmit(choice)}>
              {choice}
            </Button>
          </Fragment>
        ))}
      </div>
      {!question.choices && <Input disabled={submitting} $onSubmit={handleSubmit} />}
    </>
  )
}

function SurveyHistogram({ answers }: { answers: FetchSurvey_survey_currentQuestion_answers[] }) {
  const answerBuckets: { [key: string]: number } = {}
  answers.forEach(a => {
    const norm = a.answer.toLowerCase().trim()
    answerBuckets[norm] = answerBuckets[norm] || 0
    answerBuckets[norm]++
  })

  const pairs: { answer: string; count: number }[] = []
  for (const answer of Object.keys(answerBuckets)) {
    pairs.push({ answer, count: answerBuckets[answer] })
  }
  const sorted = pairs.sort((a, b) => b.count - a.count)
  if (sorted.length === 0) {
    return null
  }

  return (
    <div className="flex">
      <div style={{ flex: 1 }} className="tr">
        {sorted.map((pair, i) => (
          <SmallText key={i} $monospace>
            <SmallText title={pair.answer} $monospace>
              {strutil.truncate(pair.answer, 17)}
            </SmallText>
            {new Array(Math.floor(pair.count / 15)).fill(' ').map((str, i) => (
              <SmallText key={i}>{str}</SmallText>
            ))}
          </SmallText>
        ))}
      </div>
      <div>
        {sorted.map((pair, i) => (
          <SmallText key={i} $monospace>
            {new Array(Math.floor(pair.count / 15) + 1).fill(' ║ ').map((str, i) => (
              <SmallText key={i}>{str}</SmallText>
            ))}
          </SmallText>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        {sorted.map((pair, i) => (
          <SmallText key={i} $monospace>
            {new Array(Math.floor(pair.count / 15)).fill(histBar(15)).map((str, i) => (
              <SmallText key={i}>{str}</SmallText>
            ))}
            <SmallText>
              {histBar(pair.count % 15)} {pair.count}
            </SmallText>
          </SmallText>
        ))}
      </div>
    </div>
  )
}

function histBar(n: number) {
  return new Array(Math.min(n, 15)).fill('=').join('')
}

function surveyLabel(s: { isStarted: boolean; isCompleted: boolean }) {
  if (s.isCompleted) {
    return 'completed'
  }
  if (s.isStarted) {
    return 'in progress'
  }
  return 'waiting to begin'
}
