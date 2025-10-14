import React from "react";
import "./App.css";

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

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
      <p>{!data ? "Loading..." : data}</p>
    </div>
  );
}

export default App;
