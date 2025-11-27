import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login"
import Signup from "./components/Signup";
import Landing from "./components/Landing";

import FirstPuzzle from "./components/puzzle1";
import SecondPuzzle from "./components/puzzle2";
import ThirdPuzzle from "./components/puzzle3";
import Dashboard from "./components/Dashboard";

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
        <Route path="/dashboard" element={<Dashboard />}/>
        {/*Default route login*/}
        <Route path="*" element={<Navigate to="/puzzle3" />} />
      </Routes>
    </Router>
  );
}

export default App;
