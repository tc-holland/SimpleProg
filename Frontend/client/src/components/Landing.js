import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./Landing.css"

function Landing(){
    const navigate = useNavigate();
    
    return(
        <div className="landing-page">
            <h1>SimpleProg</h1>
            <div className="buttons">
                {/* STUDENT BUTTON */}
                <button type="button" className="to-signup" 
                    onClick={() => {
            localStorage.setItem("role", "student");
            navigate("/student/auth");
          }}
        >
          Student
        </button>

        {/* TEACHER BUTTON */}
        <button
          type="button"
          className="to-login"
          onClick={() => {
            localStorage.setItem("role", "teacher");
            navigate("/teacher/auth");
          }}
        >
          Teacher
        </button>

      </div>
    </div>
    );
}

export default Landing