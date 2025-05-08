import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import VotingPage from "./VotingPage";
import BlockExplorer from "./BlockExplorer";
import Simulator from "./Simulation";

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <nav style={{ marginBottom: "1.5rem" }}>
        <Link to="/">Голосування</Link>{" | "}
        <Link to="/blocks">Інспектор блоків</Link>{" | "}
        <Link to="/simulate">Симуляція</Link>
      </nav>

      <Routes>
        {/* VotingPage */}
        <Route path="/" element={<VotingPage />} />

        {/* Перегляд блоків */}
        <Route path="/blocks" element={<BlockExplorer />} />

        {/* Сторінка для тестової симуляції */}
        <Route path="/simulate" element={<Simulator />} />
      </Routes>
    </div>
  );
}

export default App;