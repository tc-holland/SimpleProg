/*import logo from './logo.svg';
import './App.css';

//including some changes bc github wants to be stupid
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App; */

import React from "react";
import "./App.css";

function App() {
  return (
    // MAIN WRAPPER DIV FOR ENTIRE PAGE
    <div className="login-container">
      {/* PAGE TITLE */}
      <h1>Student Login</h1>

      {/* LOGIN FORM STARTS HERE */}
      <form className="login-form">
        <label htmlFor="email">Email:</label> {/* EMAIL LABEL AND INPUT */}
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <label htmlFor="password">Password:</label> {/* PASSWORD LABEL AND INPUT */}
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit">Log In</button> {/* SUBMIT BUTTON */}
      </form>

      {/* FORGOT PASSWORD LINK */}
      <p className="forgot-password">
        <a href="#">Forgot your password?</a>
      </p>
    </div>
  );
}

export default App;
