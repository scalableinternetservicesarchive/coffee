import { Meta, Story } from '@storybook/react'
import * as React from 'react'
import { Survey as SurveyComponent, Surveys as SurveysComponent } from '../web/src/view/playground/Surveys'

export default {
  title: 'Survey',
} as Meta

const SurveyTemplate: Story<{ surveyId: number }> = args => <SurveyComponent {...args} />
const SurveysTemplate: Story = () => <SurveysComponent />

export const Survey = SurveyTemplate.bind({})
Survey.args = {
  surveyId: 1,
}

export const SurveyList = SurveysTemplate.bind({})
SurveyList.args = {}
