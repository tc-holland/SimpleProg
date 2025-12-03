import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    //const [puzzles, setPuzzles] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);

    const [puzzles] = useState([
            { id: 1, title: "Puzzle 1", route: "/puzzle1", name: "puzzle1" },
            { id: 2, title: "Puzzle 2", route: "/puzzle2", name: "puzzle2" },
            { id: 3, title: "Puzzle 3", route: "/puzzle3", name: "puzzle3" },   
        ]);

    useEffect(() => {
        const user = localStorage.getItem("userEmail");
        const token = localStorage.getItem("authToken");

        if (!token){
            navigate("/login");
            return;
        }

        if (user) setEmail(user);

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
        
        {/* Puzzles */}
        <div className="dashboard-card">
          <h3 className="section-title">Your Puzzles</h3>

          <div className="puzzle-list">
            {puzzles.map((puzzle) => (
              <div key={puzzle.id} className="puzzle-item">
                <h4>{puzzle.title}</h4>
                <div className="puzzle-actions">
                  
                  <button onClick={() => navigate(puzzle.route)}>
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

    </div>
  );
}

export default Dashboard;