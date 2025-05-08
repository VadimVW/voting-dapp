import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

export default function BlockExplorer() {
  const [blocks, setBlocks] = useState([]);
  const [error,  setError]  = useState("");

  useEffect(() => {
    async function load() {
      try {
        // !!! Обов’язково вказуємо порт бек-енда !!!
        const res = await fetch(`${API_URL}/blocks`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setBlocks(data);
      } catch (e) {
        console.error("Error fetching blocks:", e);
        setError("Не вдалося завантажити блоки");
      }
    }
    load();
  }, []);

  if (error) {
    return <p>Помилка: {error}</p>;
  }
  if (blocks.length === 0) {
    return <p>Завантаження блоків…</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🔍 Інспектор блоків</h2>
      <ul>
        {blocks.map(b => (
          <li key={b.number}>
            <strong>Block #{b.number}</strong>{" "}
            ({new Date(b.timestamp * 1000).toLocaleString()}) —
            {b.transactions.length} tx
            <ul>
              {b.transactions.map(tx => (
                <li key={tx}><code>{tx}</code></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}