import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    //const [puzzles, setPuzzles] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const user = localStorage.getItem("userEmail");
        const token = localStorage.getItem("authToken");

        if (!token){
            navigate("/login");
            return;
        }

        if (user) setEmail(user);

        //setPuzzles([
          //  { id: 1, title: "Puzzle 1", status: "In Progress" },
            //{ id: 2, title: "Puzzle 2", status: "Completed" },
            //{ id: 3, title: "Puzzle 3", status: "Not Started" }   
        //]);

        setNotifications([
            "Your puzzle 'Puzzle 1' is due tomorrow.",
            "New puzzle 'Puzzle 4' has been added."
        ]);

        setMessages([
            { from: "System", text: "Welcome back to SimpleProg!" },
        ]);
}, []);

return (
    <div className="dashboard-container">
        <button className="logout-button" onClick={() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("username");
            navigate("/");
        }}>
            Logout
        </button>
        
        {/* Header Area */}
      <div className="dashboard-header">
        <div className="avatar-circle">
          <span role="img" aria-label="sparkles">✨</span>
        </div>
        <div>
          <h1 className="dashboard-title">Welcome,</h1>
          <h2 className="dashboard-user">{email}</h2>
        </div>
      </div>

        {/* Notifications */}
      <div className="dashboard-card pastel-yellow">
        <h3 className="section-title">🔔 Notifications</h3>
        <ul className="styled-list">
          {notifications.map((note, index) => (
            <li key={index}> {note}</li>
          ))}
        </ul>
      </div>

         {/* Messages */}
      <div className="dashboard-card pastel-blue">
        <h3 className="section-title">💬 Messages</h3>
        {messages.map((msg, index) => (
          <div key={index} className="message-box">
            <strong>{msg.from}:</strong>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
        
        {/*}
        <div className="dashboard-card">
        <div className="puzzle-header">
          <h3>Your Puzzles</h3>
          <button onClick={() => navigate("/puzzles")}>
            View All
          </button>
        </div>

        <div className="puzzle-list">
          {puzzles.map((puzzle) => (
            <div key={puzzle.id} className="puzzle-item">
              <div>
                <h4>{puzzle.title}</h4>
                <span className={`progress ${puzzle.progress.toLowerCase().replace(" ", "-")}`}>
                  {puzzle.progress}
                </span>
              </div>

              <button onClick={() => navigate(`/puzzle/${puzzle.id}`)}>
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
      */}
    </div>
  );
}

export default Dashboard;