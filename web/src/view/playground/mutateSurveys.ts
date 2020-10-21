import { ApolloClient, gql } from '@apollo/client'
import { getApolloClient } from '../../graphql/apolloClient'
import {
  AnswerSurveyQuestion,
  AnswerSurveyQuestionVariables,
  NextSurveyQuestion,
  NextSurveyQuestionVariables,
  SurveyInput,
} from '../../graphql/query.gen'
import { fragmentSurvey, fragmentSurveyQuestion } from './fetchSurveys'

const answerSurveyQuestionMutation = gql`
  mutation AnswerSurveyQuestion($input: SurveyInput!) {
    answerSurvey(input: $input)
  }
`

const nextSurveyQuestionMutation = gql`
  mutation NextSurveyQuestion($surveyId: Int!) {
    nextSurveyQuestion(surveyId: $surveyId) {
      ...Survey
    }
  }
  ${fragmentSurvey}
  ${fragmentSurveyQuestion}
`

export function answerSurveyQuestion(client: ApolloClient<any>, input: SurveyInput) {
  return client.mutate<AnswerSurveyQuestion, AnswerSurveyQuestionVariables>({
    mutation: answerSurveyQuestionMutation,
    variables: { input },
  })
}

export function nextSurveyQuestion(surveyId: number) {
  return getApolloClient().mutate<NextSurveyQuestion, NextSurveyQuestionVariables>({
    mutation: nextSurveyQuestionMutation,
    variables: { surveyId },
  })
}
