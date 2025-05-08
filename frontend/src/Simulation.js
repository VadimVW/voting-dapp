import React, { useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";

export default function Simulation() {
  const [count, setCount]     = useState(100);
  const [candidate, setCand]  = useState("Alice");
  const [log, setLog]         = useState([]);
  const [running, setRunning] = useState(false);
  const API = "http://localhost:4000";

  // Один виклик на бек-енд
  async function sendVote(wallet, candidate) {
    // 1. nonce за адресою
    const { nonce } = await fetch(`${API}/nonce/${wallet.address}`)
                          .then(r => r.json());
    // 2. формуємо хеш
    const hash = ethers.solidityPackedKeccak256(
      ["string","address","uint256"],
      [candidate, wallet.address, nonce]
    );
    // 3. підписуємо тим самим wallet
    const signature = await wallet.signMessage(ethers.getBytes(hash));

    // 4. шлемо на relay
    const resp = await fetch(`${API}/vote`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        candidate,
        signer:    wallet.address,
        nonce,
        signature
      })
    });
    if (!resp.ok) {
      const { error } = await resp.json();
      return `ERR:${error}`;
    }
    return "OK";
  }

  async function run() {
    setRunning(true);
    setLog([]);

    for (let i = 0; i < count; i++) {
      const wallet = ethers.Wallet.createRandom();
      try {
        const result = await sendVote(wallet, candidate);
        setLog(l => [...l, `#${i+1} ${result}`]);
      } catch {
        setLog(l => [...l, `#${i+1} FAIL`]);
      }
    }

    setRunning(false);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>⚙️ Симуляція голосування</h2>
      <Link to="/">← До голосування</Link>
      <div style={{ margin: "1rem 0" }}>
        <label>Кількість голосів:{" "}
          <input type="number" value={count}
                 onChange={e => setCount(+e.target.value)}
                 disabled={running}
                 style={{ width: "4em" }}/>
        </label>{" "}
        <label>Кандидат:{" "}
          <select value={candidate}
                  onChange={e => setCand(e.target.value)}
                  disabled={running}>
            <option>Alice</option>
            <option>Bob</option>
            <option>Charlie</option>
          </select>
        </label>{" "}
        <button onClick={run} disabled={running}>
          {running ? "Працює…" : "Старт"}
        </button>
      </div>
      <div style={{
        maxHeight: "50vh",
        overflow:   "auto",
        border:     "1px solid #ccc",
        padding:    "0.5rem"
      }}>
        {log.map((line, idx) => <div key={idx}>{line}</div>)}
      </div>
    </div>
  );
}