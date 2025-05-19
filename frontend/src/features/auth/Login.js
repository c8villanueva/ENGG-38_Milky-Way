import React from 'react'
//import '../../styles/reg.css'

import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'

import usePersist from '../../hooks/usePersist'

import '../../styles/login.css'

import milkywayLogo from '../../images/rocket.png';

const Login = () => {

  const userRef = useRef()
  const errRef = useRef()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [persist, setPersist] = usePersist()

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
  const handleToggle = () => setPersist(prev => !prev)

  const errClass = errMsg ? "errmsg" : "offscreen"

  if (isLoading) return <p>Loading...</p>



  const content = (
    <section>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inclusive+Sans&display=swap"></link>
        
      <nav className="navbar">
        <div className="navbar__container">
          <div className="navbar__logo">
              <img src={milkywayLogo} alt="Logo" className="navbar__logo-img" />
              <Link to="/" className="navbar__logo-text">Milky Way</Link>
          </div>
          <div className="navbar__toggle" id="mobile-menu">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <ul className="navbar__menu">
            <li className="navbar__btn">
              <Link to="/" className="button">Home</Link>
            </li>
          </ul>
        </div>
      </nav>

      
      <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>


      {/* <div className="container">
        <div className="form-box active" id="login-form">
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

            <label htmlFor="persist" className="form__persist">
              <input
                type="checkbox"
                className="form__checkbox"
                id="persist"
                onChange={handleToggle}
                checked={persist}
              />
              Trust This Device
            </label>

            <p>
              Don't have an account? <Link to="/users">Sign Up</Link>
            </p>
          </form>
        </div>
      </div> */}

<div className="container">
  <div className="form-box active" id="login-form">
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

      <label htmlFor="persist" className="form__persist">
        <input
          type="checkbox"
          className="form__checkbox"
          id="persist"
          onChange={handleToggle}
          checked={persist}
        />
        Trust This Device
      </label>

      <p>
        Don't have an account? <Link to="/users">Sign Up</Link>
      </p>
    </form>
  </div>
</div>



    </section>
  )
  return content
}

export default Login
