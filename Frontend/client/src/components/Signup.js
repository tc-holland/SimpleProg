import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./Signup.css"

function Signup(){
    const navigate = useNavigate();
    const[signupFormData, setSignupFormData] = useState({username: "", password: "", confirmpassword: ""});
    
    const [data, setData] = React.useState(null);
        
        React.useEffect(() => {
        fetch("/api")
            .then((res) => res.json())
            .then((data) => setData(data.message));
        }, []);
    
        
    const handleChange = (e) => {
        setSignupFormData({...signupFormData, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        //api call i think
    };

    return(
        // MAIN WRAPPER DIV FOR ENTIRE PAGE
        <div className="signup-page">
            <button type="button" className="login-button" 
                    onClick={() => navigate("/login")}
            >Log In</button>
            
            <div className="signup-container">
                {/* PAGE TITLE */}
                <h1>Student Sign Up</h1>

                {/* LOGIN FORM STARTS HERE */}
                <form className="signup-form">
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

                    <label htmlFor="confirmpassword">Confirm Password:</label> {/* confirm PASSWORD LABEL AND INPUT */}
                    <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    />
                    <button type="submit">Sign Up</button> {/* SUBMIT BUTTON */}
                </form>

                <p>{!data ? "Loading..." : data}</p>
            </div>
        </div>
    );
}

export default Signup;