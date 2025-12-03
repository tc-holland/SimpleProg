import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function TeacherDashboard() {
  const navigate = useNavigate();
  const [studentList, setStudents] = useState([]);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [classCode, setClassCode] = useState("");

  const fetchStudents = async (code) => {
    try {
      const res = await fetch(`/api/class/${code}/progress`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error("Failed to fetch student progress:", err);
    }
  };

  const handleRemoveStudent = async (studentUsername) => {
    const teacherEmail = localStorage.getItem("userEmail");

    try {
      const res = await fetch("/api/remove-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherEmail, studentUsername })
      });

      const result = await res.json();
      if (result.success) {
        setStudents(result.students);
      } else {
        alert("Failed to remove student");
      }
    } catch (err) {
      console.error("Remove student error:", err);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("userEmail");
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const savedCode = localStorage.getItem("classCode");

    if (!token || userRole !== "teacher") {
      navigate("/login");
      return;
    }

    if (user) setTeacherEmail(user);
    if (savedCode) {
      setClassCode(savedCode);
      fetchStudents(savedCode);
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">

      <button
        className="logout-button-top"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        Logout
      </button>

      <div className="dashboard-header">
        <div className="avatar-circle">🍎</div>
        <div>
          <h1 className="dashboard-title">Teacher Dashboard</h1>
          <h2 className="dashboard-user">{teacherEmail}</h2>
        </div>
      </div>

      <div className="dashboard-card pastel-yellow">
        <h3 className="section-title">🔑 Your Class Code</h3>
        <p style={{ fontSize: "26px", fontWeight: "bold" }}>{classCode}</p>
        <p>Share this code with your students so they can join your class!</p>
      </div>

      <div className="dashboard-card pastel-blue">
        <h3 className="section-title">📊 Students in Your Class</h3>

        {studentList.length === 0 ? (
          <p>No students have joined yet.</p>
        ) : (
          <div className="puzzle-list">
            {studentList.map((student, index) => (
              <div key={index} className="puzzle-item">
                <h4>{student.username}</h4>

                <button
                  className="remove-student-button"
                  onClick={() => handleRemoveStudent(student.username)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-card pastel-blue">
        <h3 className="section-title">📊 Students Progress</h3>

        <div className="puzzle-list">
          {studentList.map((student, index) => (
            <div key={index} className="puzzle-item">
              <h4>{student.username}</h4>

              <p>✅ Puzzles Completed: {student.puzzlesCompleted || 0}</p>

              <p>🧩 Completed:</p>

              {student.completedPuzzles?.length === 0 ? (
                <span>None yet</span>
              ) : (
                <ul>
                  {student.completedPuzzles?.map((puzzle, i) => (
                    <li key={i}>{puzzle}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

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