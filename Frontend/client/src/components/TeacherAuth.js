import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css"; // reuse your landing button styles

function TeacherAuth() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <h1>Teacher Setup</h1>
      <p>Create a teacher account to generate a classroom code.</p>

      <div className="buttons">
        <button
          className="to-signup"
          onClick={() => navigate("/teacher-signup")}
        >
          Create Teacher Account
        </button>
      </div>

      <button onClick={() => navigate("/landing")}>
        ⬅ Back
      </button>
    </div>
  );
}

export default TeacherAuth;
