import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./Landing.css"

function Landing(){
    const navigate = useNavigate();
    
    return(
        <div className="landing-page">
            <h1>SimpleProg</h1>
            <div className="buttons">
                <button type="button" className="to-signup" 
                    onClick={() => navigate("/signup")}
                >Sign Up</button>
                <button type="button" className="to-login" 
                    onClick={() => navigate("/login")}
                >Log In</button>
            </div>
        </div>
    );
}

export default Landing