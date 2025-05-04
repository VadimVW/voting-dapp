import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const API = "http://localhost:4000";

function App() {
  const [account, setAccount] = useState("");
  const [nonce,   setNonce]   = useState(0);
  const [results, setResults] = useState({});
  const [status,  setStatus]  = useState("");
  const [busy,    setBusy]    = useState(false);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) return;
      const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(addr);
      const r1 = await fetch(`${API}/nonce/${addr}`);
      const { nonce } = await r1.json();
      setNonce(nonce);
      await fetchResults();
    }
    init();
    window.ethereum?.on("accountsChanged", () => window.location.reload());
  }, []);

  async function fetchResults() {
    try {
      const r = await fetch(`${API}/results`);
      const data = await r.json();
      const map = {};
      data.forEach(({name,votes}) => map[name] = votes);
      setResults(map);
    } catch (e) {
      console.error("fetchResults:", e);
    }
  }

  async function vote(candidate) {
    setBusy(true);
    setStatus("🔏 Підпис...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const hash = ethers.solidityPackedKeccak256(
        ["string","address","uint256"], [candidate, account, nonce]
      );
      const signature = await signer.signMessage(ethers.getBytes(hash));
      setStatus("📡 Надсилаю...");
      const res = await fetch(`${API}/vote`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ candidate, signer: account, nonce, signature })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setStatus(`✅ Прийнято tx: ${json.txHash}`);
      setNonce(nonce + 1);
      await fetchResults();
    } catch (err) {
      console.error(err);
      setStatus(`❌ ${err.reason||err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding:20, fontFamily:"sans-serif" }}>
      <h2>🗳️ Голосування (meta-tx)</h2>
      <p>Ваш акаунт: <code>{account}</code></p>
      {["Alice","Bob","Charlie"].map(name => (
        <div key={name} style={{ margin: "1em 0" }}>
          <b>{name}</b>: {results[name] ?? 0} голосів
          <button
            disabled={busy}
            onClick={()=>vote(name)}
            style={{ marginLeft: 10 }}
          >Голосувати</button>
        </div>
      ))}
      <p><em>{status}</em></p>
    </div>
  );
}

export default App;