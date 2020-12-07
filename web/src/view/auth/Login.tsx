import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { check } from '../../../../common/src/util'
import { Button } from '../../style/button'
import { Input } from '../../style/input'
import { Spacer } from '../../style/spacer'
import { handleError } from '../toast/error'
import { toastErr } from '../toast/toast'
import { UserContext } from './user'

interface LoginProps {
  onSuccessAuth?: () => void;
}

export function Login(props: LoginProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [err, setError] = useState({ email: false, password: false })
  const { user } = useContext(UserContext)

  // reset error when email/password change
  useEffect(() => setError({ ...err, email: !validateEmail(email) }), [email])
  useEffect(() => setError({ ...err, password: false }), [password])

  function login() {
    if (!validate(email, password, setError)) {
      toastErr('invalid email/password')
      return
    }

    fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(async res => {
        const resObj = await res.json()
        check(res.ok, resObj.error ? resObj.error : 'response status ' + res.status)
        return resObj
      })
      .then(() => props.onSuccessAuth ? props.onSuccessAuth() : window.location.reload())
      .catch(err => {
        console.log(err)
        toastErr(err.toString())
        setError({ email: true, password: true })
      })
  }

  function signup() {
    if(!validate(email, password, setError)) {
      toastErr('invalid email/password')
      return
    }
    if(firstName.length === 0) {
      toastErr('empty first name')
      return
    }
    if(lastName.length === 0) {
      toastErr('empty last name')
      return
    }
    fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, lastName, password }),
    })
      .then(async res => {
        const resObj = await res.json()
        check(res.ok, resObj.error ? resObj.error : 'response status ' + res.status)
        return resObj
      })
      .then(() => props.onSuccessAuth ? props.onSuccessAuth() : window.location.reload())
      .catch(err => {
        console.log(err)
        toastErr(err.toString())
        setError({ email: true, password: true })
      })
    //
  }

  if (user) {
    return (
    <>
      <div className="mt3">
         Hello {user.firstName}. How are you doing today?
      </div>
      <Logout />
    </>
    )
  }
  if (isSigningUp) {
    return (
      <>
        <div className="mt3">
          <label className="db fw4 lh-copy f6" htmlFor="email">
            Email address
          </label>
          <Input $hasError={err.email} $onChange={setEmail} $onSubmit={signup} name="email" type="email" />
        </div>
        <div className="mt3">
          <label className="db fw4 lh-copy f6" htmlFor="firstName">
            First name
          </label>
          <Input $hasError={firstName.length === 0} $onChange={setFirstName} $onSubmit={signup} name="firstName" type="text" />
        </div>
        <div className="mt3">
          <label className="db fw4 lh-copy f6" htmlFor="lastName">
            Last name
          </label>
          <Input $hasError={lastName.length === 0 } $onChange={setLastName} $onSubmit={signup} name="lastName" type="text" />
        </div>
        <div className="mt3">
          <label className="db fw4 lh-copy f6" htmlFor="password">
            Password
          </label>
          <Input $hasError={err.password} $onChange={setPassword} $onSubmit={signup} name="password" type="password" />
        </div>
        <div className="mt3">
          <Button onClick={signup}>Sign Up</Button>
        </div>
        <div className="mt3">
          Already have an account? Click <a style={{ 'cursor': 'pointer', color: 'blue'}} onClick={() => setIsSigningUp(false)}> Here </a> to log in.
        </div>
      </>
    )
  } else {
    return (
      <>
        <div className="mt3">
          <label className="db fw4 lh-copy f6" htmlFor="email">
            Email address
          </label>
          <Input $hasError={err.email} $onChange={setEmail} $onSubmit={login} name="email" type="email" />
        </div>
        <div className="mt3">
          <label className="db fw4 lh-copy f6" htmlFor="password">
            Password
          </label>
          <Input $hasError={err.password} $onChange={setPassword} $onSubmit={login} name="password" type="password" />
        </div>
        <div className="mt3">
          <Button onClick={login}>Log in</Button>
        </div>
        <div className="mt3">
          First time here? Click <a style={{ 'cursor': 'pointer', color: 'blue'}} onClick={() => setIsSigningUp(true)}> Here </a> to create an account!
        </div>
      </>
    )
  }

}

function Logout() {
  function logout() {
    return fetch('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => {
        check(res.ok, 'response status ' + res.status)
        window.location.reload()
      })
      .catch(handleError)
  }

  return (
    <>
      <Spacer $h5 />
      <Button onClick={logout}>Logout</Button>
    </>
  )
}

function validateEmail(email: string) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

function validate(
  email: string,
  password: string,
  setError: React.Dispatch<React.SetStateAction<{ email: boolean; password: boolean }>>
) {
  const validEmail = validateEmail(email)
  const validPassword = Boolean(password)
  console.log('valid', validEmail, validPassword)
  setError({ email: !validEmail, password: !validPassword })
  return validEmail && validPassword
}
