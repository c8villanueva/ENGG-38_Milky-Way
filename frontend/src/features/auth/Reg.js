import React from "react";

import { useState, useEffect } from "react";
import { useAddNewUserMutation } from "../users/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { ROLES } from "../../config/roles";
import { Link } from "react-router-dom";

import milkywayLogo from '../../images/rocket.png';

const NAME_REGEX = /^[A-z]{3,20}$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Reg = () => {
  const [addNewUser, { isLoading, isSuccess, isError, error }] =
    useAddNewUserMutation();

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [validName, setValidName] = useState(false);
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [roles, setRoles] = useState(["User"]);

  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    if (isSuccess) {
      setName("");
      setEmail("");
      setPassword("");
      setRoles([]);
      navigate("/auth"); //goes to /login after creating new user
    }
  }, [isSuccess, navigate]);

  const onNameChanged = (e) => setName(e.target.value);
  const onEmailChanged = (e) => setEmail(e.target.value);
  const onPasswordChanged = (e) => setPassword(e.target.value);
  const onRolesChanged = (e) => {
    const values = Array.from(
      e.target.selectedOptions, //HTMLCollection
      (option) => option.value
    );
    setRoles(values);
  };

  const canSave =
    [roles.length, validName, validEmail, validPassword].every(Boolean) &&
    !isLoading;

  const onSaveUserClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      await addNewUser({ name, email, password, roles });
    }
  };

  const options = Object.values(ROLES).map((role) => {
    return (
      <option key={role} value={role}>
        {" "}
        {role}
      </option>
    );
  });

  const errClass = isError ? "errmsg" : "offscreen";
  const validNameClass = !validName ? "form__input--incomplete" : "";
  const validEmailClass = !validEmail ? "form__input--incomplete" : "";
  const validPwdClass = !validPassword ? "form__input--incomplete" : "";
  const validRolesClass = !Boolean(roles.length)
    ? "form__input--incomplete"
    : "";

  const content = (
    <section>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inclusive+Sans&display=swap"
      ></link>

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

      <p className={errClass}>{error?.data?.message}</p>

      <div className="container">
        <div className="form-box active" id="signup-form">

          <form onSubmit={onSaveUserClicked}>
            <h2>Sign Up</h2>

            <input
              className={`form__input ${validNameClass}`}
              id="name"
              name="name"
              type="text"
              autoComplete="off"
              value={name}
              onChange={onNameChanged}
              placeholder="Name"
            />

            <input
              className={`form__input ${validEmailClass}`}
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={onEmailChanged}
              placeholder="Email"
            />

            <input
              className={`form__input ${validPwdClass}`}
              id="password"
              name="password"
              type="password"
              autoComplete="off"
              value={password}
              onChange={onPasswordChanged}
              placeholder="Password"
            />
            <button
              title="Save"
              disabled={!canSave}
            >Sign Up
            </button>
            <p>
              Already have an account? <Link to="/auth">Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
  return content;
};

export default Reg;
