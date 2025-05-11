import React from 'react'
//import '../../styles/reg.css'

import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'

const Login = () => {

  const userRef = useRef()
  const errRef = useRef()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [login, { isLoading }] = useLoginMutation()

  useEffect(() => {
      userRef.current.focus()
  }, [])

  useEffect(() => {
      setErrMsg('');
  }, [email, password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { accessToken } = await login({ email, password }).unwrap()
      dispatch(setCredentials({ accessToken }))
      setEmail('')
      setPassword('')
      navigate('/workspace')
    } catch (err) {
      if (!err.status) {
        setErrMsg('No Server Response');
      } else if (err.status === 400) {
        setErrMsg('Missing Email or Password');
      } else if (err.status === 401) {
        setErrMsg('Unauthorized');
      } else {
        setErrMsg(err.data?.message);
      }
      errRef.current.focus();
    }
  }

  const handleEmailInput = (e) => setEmail(e.target.value)
  const handlePwdInput = (e) => setPassword(e.target.value)

  const errClass = errMsg ? "errmsg" : "offscreen"

  if (isLoading) return <p>Loading...</p>



  const content = (
    <section>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inclusive+Sans&display=swap"></link>
        
      <nav class="navbar">
        <div class="navbar__container">
          <a href="landing.html" id="navbar__logo">
            <i class="fa-solid fa-rocket">&nbsp</i> Milky Way
          </a>
          <div class="navbar__toggle" id="mobile-menu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
          <ul class="navbar__menu">
            <li class="navbar__btn">
              <a href="landing.html" class="button">home</a>
            </li>
          </ul>
        </div>
      </nav>


      <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>


      <div class="container">
        <div class="form-box active" id="login-form">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              ref={userRef}
              value={email}
              onChange={handleEmailInput}
              autoComplete="off"
              required
            />

            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              onChange={handlePwdInput}
              value={password}
              required
            />


            <button type="submit" name="login">Login</button>
            <p>Don't have an account? <a href="reg.html">Sign Up</a></p>
          </form>
        </div>
      </div>
    </section>
  )
  return content
}

export default Login
