import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

function StudentAuth() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <h1>Student Access</h1>

      <div className="buttons">
        <button
          className="to-login"
          onClick={() => navigate("/login")}
        >
          Log In
        </button>

        <button
          className="to-signup"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>

      <button onClick={() => navigate("/landing")}>
        ⬅ Back
      </button>
    </div>
  );
}

export default StudentAuth;
