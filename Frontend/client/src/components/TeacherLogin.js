import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./Login.css"
import landingIcon from "../assets/testlogo.png"

function TeacherLogin(){
    const navigate = useNavigate();
    const[loginFormData, setLoginFormData] = useState({
        username: "",
        password: "",
    });

    const [data, setData] = React.useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    
      React.useEffect(() => {
        fetch("/api")
          .then((res) => res.json())
          .then((data) => setData(data.message));
      }, []);

    
    const handleChange = (e) => {
        setLoginFormData({...loginFormData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {username, password, classCode} = loginFormData;

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password, userRole: "teacher", classCode})
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || "Login failed");

            // persist token if provided and navigate to protected page
            if (result.token) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('userEmail', username);
                localStorage.setItem('userRole', 'teacher');
                localStorage.setItem('classCode', result.classCode);
                localStorage.setItem('studentList', JSON.stringify(result.studentList || []));
            }
            setResponseMessage(`${result.message}`);
            navigate('/teacher-dashboard');
            //FIXME navigate somewhere after successful login
        }
        catch (err) {
            console.error("Teacher login error:", err);
            //FIXME err.message might expose server internals
            // setResponseMessage(`${err.message}`);
            setResponseMessage("Login failed. Check if your username and password are correct.");
        }
    };

    return(
        // MAIN WRAPPER DIV FOR ENTIRE PAGE
        <div className="login-page">
            <button type="button" className="signup-button" 
                    onClick={() => navigate("/teacher-signup")}
            >Sign Up</button>

	{/* HOME BUTTON */}
	    <button type="button" className="home-button"
		    onClick={() => navigate("/")}
	    >Home</button>            

            <div className="login-container">
                {/* PAGE TITLE */}
                <h1>Teacher Login</h1>

                {/* LOGIN FORM STARTS HERE */}
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label> {/* EMAIL LABEL AND INPUT */}
                    <input
                    id="email"
                    name="username"
                    type="email"
                    placeholder="Enter your email"
                    value={loginFormData.username}
                    onChange={handleChange}
                    required
                    />

                    <label htmlFor="password">Password:</label> {/* PASSWORD LABEL AND INPUT */}
                    <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginFormData.password}
                    onChange={handleChange}
                    required
                    />

                    <button type="submit">Log In</button> {/* SUBMIT BUTTON */}
                </form>

                {/* FORGOT PASSWORD LINK */}
                <p className="forgot-password">
                    <a href="#">Forgot your password?</a>
                </p>
                {responseMessage && <p>{responseMessage}</p>}
                {/* Message test */}
                {/* <p>{!data ? "Loading..." : data}</p> */}
            </div>
        </div>
    );
}
export default TeacherLogin;