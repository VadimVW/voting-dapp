// import logo from './logo.svg';
// import './App.css';
import React, { useEffect, useState } from "react";
import { vote, getVotes, getCandidates } from "./VotingInterface";

function App() {
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);

  const loadCandidates = async () => {
    try {
      const list = await getCandidates();
      setCandidates(list);

      const votesObj = {};
      for (const name of list) {
        const v = await getVotes(name);
        votesObj[name] = v.toString();
      }
      setVotes(votesObj);
    } catch (err) {
      console.error("Не вдалося отримати кандидатів:", err);
      alert("Перевірте MetaMask і підключення до локальної мережі");
    }
  };

  const handleVote = async (candidate) => {
    try {
      setLoading(true);
      setStatus(`Голосування за ${candidate}...`);
      await vote(candidate);
      setStatus(`✅ Голос за ${candidate} прийнято`);
      await loadCandidates();
    } catch (err) {
      console.error(err);
      setStatus("❌ Помилка при голосуванні або вже голосували.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const [selected] = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(selected);
        await loadCandidates();
      } catch (err) {
        console.error("Помилка при ініціалізації:", err);
      }
    }

    init();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accs) => {
        setAccount(accs[0]);
        loadCandidates();
      });
    }
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🗳️ Електронне голосування</h2>
      {account && (
        <p>👤 Акаунт: <strong>{account}</strong></p>
      )}
      {candidates.length === 0 && <p>Завантаження кандидатів...</p>}
      {candidates.map((name) => (
        <div key={name} style={{ marginBottom: "1rem" }}>
          <strong>{name}</strong>: {votes[name] || 0} голосів
          <br />
          <button
            onClick={() => handleVote(name)}
            disabled={loading}
            style={{ marginTop: "0.5rem" }}
          >
            Голосувати
          </button>
        </div>
      ))}
      {status && <p><em>{status}</em></p>}
    </div>
  );
}

export default App;
