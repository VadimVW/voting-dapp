import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

export default function BlockExplorer() {
  const [blocks, setBlocks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const resp = await fetch(`${API_URL}/blocks`);
        if (!resp.ok) throw new Error("Network response was not ok");
        const data = await resp.json();
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

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🔍 Інспектор блоків</h2>
      <ul>
        {blocks.map((b) => {
          const num     = parseInt(b.number,     16);
          const ts      = new Date(parseInt(b.timestamp, 16) * 1000)
                            .toLocaleString("uk-UA");
          const txCount = b.transactions.length;

          return (
            <li key={b.hash} style={{ marginBottom: "1.5rem" }}>
              <strong>Block #{num}</strong> ({ts}) — {txCount} tx
              <ul>
                <li><code>hash:</code> {b.hash}</li>
                <li><code>parentHash:</code> {b.parentHash}</li>
                <li><code>miner:</code> {b.miner}</li>
                <li>
                  <code>gasUsed / gasLimit:</code>{" "}
                  {parseInt(b.gasUsed, 16)} / {parseInt(b.gasLimit, 16)}
                </li>
                {!!txCount && (
                  <li>
                    <details>
                      <summary>Транзакції</summary>
                      <ul>
                        {b.transactions.map((tx) => (
                          <li key={tx.hash}>
                            <code>hash:</code> {tx.hash} —{" "}
                            <code>from:</code> {tx.from} →{" "}
                            <code>to:</code> {tx.to || "contract"} —{" "}
                            <code>value:</code>{" "}
                            {parseInt(tx.value, 16)} wei
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                )}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}