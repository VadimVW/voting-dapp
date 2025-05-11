import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import VotingPage       from "./VotingPage";
import BlockExplorer    from "./BlockExplorer";
import Simulation       from "./Simulation";

function App() {
  return (
    <>
      {/* <nav>
        <Link to="/">Голосование</Link>{" | "}
        <Link to="/blocks">Инспектор блоков</Link>{" | "}
        <Link to="/simulate">Симуляция</Link>
      </nav>

      <hr /> */}

      <Routes>
        <Route path="/"          element={<VotingPage />} />
        <Route path="/blocks"    element={<BlockExplorer />} />
        <Route path="/simulate"  element={<Simulation />} />
      </Routes>
    </>
  );
}

export default App;