import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./Signup.css"
import landingIcon from "../assets/testlogo.png"

function Signup(){
    const navigate = useNavigate();

    const[signupFormData, setSignupFormData] = useState({
        username: "", 
        password: "", 
        confirmpassword: ""
    });
    
    const [data, setData] = React.useState(null);
    const [responseMessage, setResponseMessage] = useState("");
        
    // API message test
    React.useEffect(() => {
    fetch("/api")
        .then((res) => res.json())
        .then((data) => setData(data.message));
    }, []);

       
    const handleChange = (e) => {
        setSignupFormData({
            ...signupFormData, 
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {username, password, confirmpassword} = signupFormData;

        if (password !== confirmpassword) {
            setResponseMessage("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password})
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || "Signup failed");

            // Persist token if provided and navigate
            if (result.token) {
                localStorage.setItem('authToken', result.token);
            }
            setResponseMessage(`${result.message}`);
            navigate('/');
        }
        catch (err) {
            console.error("Signup error:", err);
            //FIXME err.message might expose server internals
            // setResponseMessage(`${err.message}`);
            setResponseMessage("Signup failed. Check if this email is already registered or try another email.");
        }
    };

    return(
        // MAIN WRAPPER DIV FOR ENTIRE PAGE
        <div className="signup-page">
            <button type="button" className="login-button" 
                    onClick={() => navigate("/login")}
            >Log In</button>

	{/* HOME BUTTON */}
	<button type="button" className="home-button"
		    onClick={() => navigate("/")}
	    >Home</button>
            
            <div className="signup-container">
                {/* PAGE TITLE */}
                <h1>Student Sign Up</h1>

                {/* LOGIN FORM STARTS HERE */}
                <form className="signup-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label> {/* EMAIL LABEL AND INPUT */}
                    <input
                    id="email"
                    name="username"
                    type="email"
                    placeholder="Enter your email"
                    value={signupFormData.username}
                    onChange={handleChange}
                    required
                    />

                    <label htmlFor="password">Password:</label> {/* PASSWORD LABEL AND INPUT */}
                    <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={signupFormData.password}
                    onChange={handleChange}
                    required
                    />

                    <label htmlFor="confirmpassword">Confirm Password:</label> {/* confirm PASSWORD LABEL AND INPUT */}
                    <input
                    id="confirmpassword"
                    name="confirmpassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupFormData.confirmpassword}
                    onChange={handleChange}
                    required
                    />
                    <button type="submit">Sign Up</button> {/* SUBMIT BUTTON */}
                </form>

                {responseMessage && <p>{responseMessage}</p>}
                {/* Message test */}
                {/* <p>{!data ? "Loading..." : data}</p> */}
            </div>
        </div>
    );
}

export default Signup;