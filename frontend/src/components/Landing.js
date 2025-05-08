//import { Link } from 'react-router-dom'

import React from 'react'
import '../styles/landing.css'

const Landing = () => {
  const content = (
    <section>
        {/* <script src="https://kit.fontawesome.com/3f153ad2ee.js" crossorigin="anonymous"></script> */}
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
                        <a href="login.html" class="button">login</a>
                    </li>
                </ul>
            </div>
        </nav>

        <div class="main">
            <div class="main__container">
                <div class="main__content">
                    <h1>Milky Way</h1>
                    <h2>Your Personalized Workspace</h2>
                    <button class="main__btn"><a href="workspace.html">Create New Workspace</a></button>
                </div>
                <div class="main__img--container">
                    {/* <img src="images/workspace_preview.png" alt="pic" id="main__img"></img> */}
                </div>
            </div>
        </div>
    </section>
  )
  return content
}

export default Landing
