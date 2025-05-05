import React, { useEffect, useState } from "react";
import { loginAndInitWallet, getStoredWallet } from "./AuthService";
import { ethers } from "ethers";

const API_URL = "http://localhost:4000";

function App() {
  const [wallet,  setWallet]  = useState(null);
  const [nonce,   setNonce]   = useState(0);
  const [votes,   setVotes]   = useState({});
  const [status,  setStatus]  = useState("");
  const [busy,    setBusy]    = useState(false);

  // Ініціалізація: авторизація і завантаження nonce + результатів
  useEffect(() => {
    async function init() {
      let w = getStoredWallet();
      if (!w) {
        try {
          w = await loginAndInitWallet();
        } catch (e) {
          setStatus("❌ Не вдалося авторизуватися");
          return;
        }
      }
      setWallet(w);

      // Отримуємо nonce для підпису
      const r1 = await fetch(`${API_URL}/nonce/${w.address}`);
      const { nonce } = await r1.json();
      setNonce(nonce);

      // Завантажуємо результати
      await fetchResults();
    }
    init();
  }, []);

  // Завантажити результати голосування
  async function fetchResults() {
    try {
      const resp = await fetch(`${API_URL}/results`);
      const data = await resp.json();
      const map = {};
      data.forEach(({ name, votes }) => map[name] = votes);
      setVotes(map);
    } catch (e) {
      console.error("Помилка завантаження результатів:", e);
    }
  }

  // Обробка натискання кнопки «Голосувати»
  async function handleVote(candidate) {
    setBusy(true);
    setStatus("🔏 Підпис повідомлення…");
    try {
      // Формуємо hash так само, як у контракті
      const hash = ethers.solidityPackedKeccak256(
        ["string","address","uint256"],
        [candidate, wallet.address, nonce]
      );

      // Підписуємо hash локальним гаманцем
      const signature = await wallet.signMessage(ethers.getBytes(hash));

      setStatus("📡 Надсилаємо голос на реле…");
      const resp = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate,
          signer:    wallet.address,
          nonce,
          signature
        })
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error);

      setStatus(`✅ Голос прийнято, txHash: ${json.txHash}`);
      setNonce(nonce + 1);
      await fetchResults();
    } catch (err) {
      console.error(err);
      setStatus(`❌ Помилка: ${err.reason || err.message}`);
    } finally {
      setBusy(false);
    }
  }

  if (!wallet) {
    return <div>Авторизація…</div>;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🗳️ Електронне голосування без MetaMask</h2>
      <p>Ваш адрес: <code>{wallet.address}</code></p>

      {["Alice","Bob","Charlie"].map(name => (
        <div key={name} style={{ margin: "1em 0" }}>
          <strong>{name}</strong>: {votes[name] || 0} голосів&nbsp;
          <button onClick={() => handleVote(name)} disabled={busy}>
            Голосувати
          </button>
        </div>
      ))}

      {status && <p><em>{status}</em></p>}
    </div>
  );
}

export default App;