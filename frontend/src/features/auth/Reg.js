import React from 'react'

const Reg = () => {
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
  
  <div class="container">

    <div class="form-box active" id="signup-form">
      <form action="">
        <h2>Sign Up</h2>
        <input type="text" name="name" placeholder="Name" required/>
        <input type="email" name="email" placeholder="Email" required/>
        <input type="password" name="password" placeholder="Password" required/>
        <button type="submit" name="signup">Sign Up</button>
        <p>Already have an account? <a href="login.html">Login</a></p>
      </form>
    </div>
  </div>
      
    </section>
  )
  return content
}

export default Reg
