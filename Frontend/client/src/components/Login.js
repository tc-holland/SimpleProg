import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./Login.css"

function Login(){
    const navigate = useNavigate();
    const[loginFormData, setLoginFormData] = useState({username: "", password: ""});

    const [data, setData] = React.useState(null);
    
      React.useEffect(() => {
        fetch("/api")
          .then((res) => res.json())
          .then((data) => setData(data.message));
      }, []);

    
    const handleChange = (e) => {
        setLoginFormData({...loginFormData, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        //call login API here
    };

    return(
        // MAIN WRAPPER DIV FOR ENTIRE PAGE
        <div className="login-page">
            <button type="button" className="signup-button" 
                    onClick={() => navigate("/signup")}
            >Sign Up</button>
            
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
        </div>
    );
}

export default Login;