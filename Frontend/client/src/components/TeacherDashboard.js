import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function TeacherDashboard() {
    const navigate = useNavigate();

    //stores list of students in the teacher's class
    const [studentList, setStudents] = useState([]);
    const [teacherEmail, setTeacherEmail] = useState("");
    const [classCode, setClassCode] = useState("");
    //const [notifications, setNotifications] = useState([]);
    //const [messages, setMessages] = useState([]);
    
    const fetchStudents = (code) => {
      if (!code) return;
      fetch(`/api/class/${code}/progress`)
        .then(res => res.json())
        .then(data => {
          setStudents(data.students || []);
        })
        .catch(err => {
          console.error("Failed to fetch student progress:", err);
        });
    };

useEffect(() => {
  const user = localStorage.getItem("userEmail");
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");
  const savedCode = localStorage.getItem('classCode');

  // only allow access if user is logged in and is a teacher
  if (!token || userRole !== "teacher") {
    navigate("/login");
    return;
  }

  if (user) setTeacherEmail(user);

  // Try an immediate local value first so the UI shows the code instantly
  //const savedCode = localStorage.getItem('classCode');
  if (savedCode) {
    setClassCode(savedCode);
    fetchStudents(savedCode);
  
  } //else {
    // fallback: fetch the class info from the backend
    //fetch(`/api/teacher-dashboard/${user}`, {
    //  headers: { Authorization: `Bearer ${token}` } // if your route requires auth
    //})
     // .then(res => res.json())
     // .then(data => {
     //   setClassCode(data.classCode || "");
      //  setStudents(data.students || []);
      //  if (data.classCode) localStorage.setItem('classCode', String(data.classCode));
      //})
      //.catch(err => {
      //  console.error("Failed to fetch students:", err);
     // });
 // }
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

      {/* CLASS CODE */}
      <div className="dashboard-card pastel-yellow">
        <h3 className="section-title">🔑 Your Class Code</h3>
        <p style={{fontSize: "26px", fontWeight: "bold"}}>{classCode}</p>
        <p>Share this code with your students so they can join your class!</p>
      </div>

      {/* STUDENT LIST */}
      <div className="dashboard-card pastel-blue">
        <h3 className="section-title">📊 Students in Your Class</h3>

        {studentList.length === 0 ? (
          <p>No students have joined yet.</p>
        ) : (
          <div className="puzzle-list">
            {studentList.map((student, index) => (
              <div key={index} className="puzzle-item">
                <h4>{student.username}</h4>
                {/* <span>Progress: Not tracked yet</span> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STUDENT PROGRESS */}
      <div className="dashboard-card pastel-blue">
        <h3 className="section-title">📊 Students Progress</h3>
          <div className="puzzle-list">
            {studentList.map((student, index) => (
              <div key={index} className="puzzle-item">
                <h4>{student.username}</h4>
                <p>
                ✅ Puzzles Completed: {student.puzzlesCompleted}
                </p>

                <p>🧩 Completed:</p>

                {student.completedPuzzles.length === 0 ? (
                  <span>None yet</span>
                ) : (
                  <ul>
                    {student.completedPuzzles.map((puzzle, i) => (
                     <li key={i}>{puzzle}</li>
                    ))}
                </ul>
                )}
            </div>
            ))}
        </div>
      </div>

      {/* PUZZLE EDITOR BUTTON */}
      <div className="dashboard-card">
        <h3 className="section-title">🧩 Puzzle Editor</h3>
        <button
          className="dashboard-button"
          onClick={() => navigate("/admin/puzzles")}
        >
          Go to Puzzle Editor
        </button>
      </div>

    </div>
  );
}

export default TeacherDashboard;