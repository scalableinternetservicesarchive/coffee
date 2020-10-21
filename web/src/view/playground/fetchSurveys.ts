import { gql } from '@apollo/client'

export const fragmentSurvey = gql`
  fragment Survey on Survey {
    id
    name
    isStarted
    isCompleted
    currentQuestion {
      ...SurveyQuestion
    }
  }
`

export const fragmentSurveyQuestion = gql`
  fragment SurveyQuestion on SurveyQuestion {
    id
    prompt
    choices
    answers {
      answer
    }
  }
`

export const fetchSurveys = gql`
  query FetchSurveys {
    surveys {
      ...Survey
    }
  }
  ${fragmentSurvey}
  ${fragmentSurveyQuestion}
`

export const subscribeSurveys = gql`
  subscription SurveySubscription($surveyId: Int!) {
    surveyUpdates(surveyId: $surveyId) {
      ...Survey
    }
  }
  ${fragmentSurvey}
  ${fragmentSurveyQuestion}
`

export const fetchSurvey = gql`
  query FetchSurvey($surveyId: Int!) {
    survey(surveyId: $surveyId) {
      ...Survey
    }
  }
  ${fragmentSurvey}
  ${fragmentSurveyQuestion}
`
