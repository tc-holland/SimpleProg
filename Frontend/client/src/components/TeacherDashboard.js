import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function TeacherDashboard() {
    const navigate = useNavigate();

    //stores list of students in the teacher's class
    const [students, setStudents] = useState([]);
    const [teacherEmail, setTeacherEmail] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const user = localStorage.getItem("userEmail");
        const token = localStorage.getItem("authToken");
        const userRole = localStorage.getItem("userRole");

        //only allow access if user is logged in and is a teacher
        if (!token || userRole !== "teacher"){
            navigate("/login");
            return;
        }

        if (user) setTeacherEmail(user);

        //get list of students from backend
        fetch("/api/teacher/students", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.students) {
                setStudents(data.students);
            }
        })
        .catch(err => {
            console.error("Failed to fetch students:", err);
        });
    }, [navigate]);

    return (
    <div className="dashboard-container">

      {/* LOGOUT BUTTON */}
      <button
        className="logout-button-top"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        Logout
      </button>

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="avatar-circle">🍎</div>
        <div>
          <h1 className="dashboard-title">Teacher Dashboard</h1>
          <h2 className="dashboard-user">{teacherEmail}</h2>
        </div>
      </div>

      {/* CLASSROOM INFO */}
      <div className="dashboard-card pastel-yellow">
        <h3 className="section-title">🏫 Your Classroom</h3>
        <p>Below is your student progress overview.</p>
      </div>

      {/* STUDENT PROGRESS LIST */}
      <div className="dashboard-card pastel-blue">
        <h3 className="section-title">📊 Student Progress</h3>

        <div className="puzzle-list">
          {students.map((student, index) => (
            <div key={index} className="puzzle-item">
              <h4>{student.email}</h4>
              <span>Highest Level: {student.highestLevel}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default TeacherDashboard;