import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login"
import Signup from "./components/Signup";
import Landing from "./components/Landing";

import FirstPuzzle from "./components/puzzle1";
import SecondPuzzle from "./components/puzzle2";
import ThirdPuzzle from "./components/puzzle3";
import AdminPuzzles from "./components/AdminPuzzles";
import Dashboard from "./components/Dashboard";
import TeacherSignup from "./components/TeacherSignup";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentAuth from "./components/StudentAuth";
import TeacherAuth from "./components/TeacherAuth";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/landing" element={<Landing />}/>
        <Route path="/puzzle1" element={<FirstPuzzle />}/>
        <Route path="/puzzle2" element={<SecondPuzzle />}/>
        <Route path="/puzzle3" element={<ThirdPuzzle />}/>
        <Route path="/admin/puzzles" element={<AdminPuzzles />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/teacher-signup" element={<TeacherSignup />}/>
        <Route path="/teacher-dashboard" element={<TeacherDashboard />}/>
        <Route path="/student/auth" element={<StudentAuth />}/>
        <Route path="/teacher/auth" element={<TeacherAuth />}/>
        {/*Default route login*/}
        <Route path="*" element={<Navigate to="/landing" />} />
      </Routes>
    </Router>
  );
}

export default App;

