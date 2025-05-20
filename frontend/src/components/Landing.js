import React from 'react'
import '../styles/landing.css'
import { Link } from 'react-router-dom'

import landingPic from '../images/workspace_preview.png';
import milkywayLogo from '../images/rocket.png';

const Landing = () => {
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
                        <Link to="/auth" className="button">Log In</Link>
                    </li>
                </ul>
            </div>
        </nav>

        <div className="main">
            <div className="main__container">
                <div className="main__content">
                    <h1>Milky Way</h1>
                    <h2>Your Personalized Workspace</h2>
                    <button className="main__btn">
                        <li className="navbar__btn">
                            <Link to="/workspace">Open Your Workspace</Link>
                        </li>
                    </button>
                </div>
                <div className="main__img--container">
                    <img src={landingPic} alt="Landing Pic" id="main__img" />
                </div>
            </div>
        </div>
    </section>
  )
  return content
}

export default Landing
