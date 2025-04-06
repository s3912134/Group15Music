import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./HomePage"; // Your login/register component
import Dashboard from "./Dashboard"; // Updated component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
