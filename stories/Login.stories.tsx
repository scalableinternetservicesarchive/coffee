import { Meta, Story } from '@storybook/react'
import * as React from 'react'
import { Login as LoginComponent } from '../web/src/view/auth/Login'

export default {
  title: 'Login',
} as Meta

const LoginTemplate: Story = args => <LoginComponent {...args} />

export const Login = LoginTemplate.bind({})
Login.args = {
  surveyId: 1,
}
