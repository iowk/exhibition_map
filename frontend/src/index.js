import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from './main'
import Register from './register'

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  </Router>,

  document.getElementById("root")
);
