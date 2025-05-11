import React from "react";

import { useState, useEffect } from "react";
import { useAddNewUserMutation } from "../users/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { ROLES } from "../../config/roles";
import { Link } from "react-router-dom";

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
  const [roles, setRoles] = useState(["Employee"]);

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

      <nav class="navbar">
        <div class="navbar__container">
          {/* <a href="landing.html" id="navbar__logo">
            <i class="fa-solid fa-rocket">&nbsp</i> Milky Way
          </a> */}
          <li id="navbar__logo">
              <Link to="/">Milky Way</Link>
          </li>
          <div class="navbar__toggle" id="mobile-menu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
          <ul class="navbar__menu">
            <li class="navbar__btn">
              <Link to="/" class="button">Home</Link>
            </li>
          </ul>
        </div>
      </nav>


      <p className={errClass}>{error?.data?.message}</p>


      <div class="container">
        <div class="form-box active" id="signup-form">





          <form onSubmit={onSaveUserClicked}>
            <h2>Sign Up</h2>
            {/* <input type="text" name="name" placeholder="Name" required /> */}

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

            {/* <input type="email" name="email" placeholder="Email" required /> */}

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

            {/* <input
              type="password"
              name="password"
              placeholder="Password"
              required
            /> */}

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


            <select
              id="roles"
              name="roles"
              className={`form__select ${validRolesClass}`}
              multiple={true}
              size="1"
              value={roles}
              onChange={onRolesChanged}
            >
              {options}
            </select>





            <button
              //className="icon-button"
              title="Save"
              disabled={!canSave}
            >Sign Up
            </button>
            <p>
              Already have an account? <Link to="/auth">Log In</Link>
            </p>
          </form>


          
          {/* <form action="">
            <h2>Sign Up</h2>
            <input type="text" name="name" placeholder="Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit" name="signup">
              Sign Up
            </button>
            <p>
              Already have an account? <a href="login.html">Login</a>
            </p>
          </form> */}




        </div>
      </div>
    </section>
  );
  return content;
};

export default Reg;
