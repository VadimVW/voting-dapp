const path    = require("path");
const express = require("express");
const cors    = require("cors");
const { ethers } = require("ethers");
const fs      = require("fs");
require("dotenv").config();

const ABI_PATH = path.resolve(
  __dirname,
  "../artifacts/contracts/Voting.sol/Voting.json"
);
const { abi } = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));

const PORT             = 4000;
const PRIVATE_KEY      = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("❌ Не задан PRIVATE_KEY или CONTRACT_ADDRESS в backend/.env");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

const nonces = {};
app.get("/nonce/:addr", (req, res) => {
  const addr = req.params.addr.toLowerCase();
  if (nonces[addr] == null) nonces[addr] = 0;
  res.json({ nonce: nonces[addr] });
});

app.post("/vote", async (req, res) => {
  const { candidate, signer, nonce, signature } = req.body;
  try {
    const hash = ethers.solidityPackedKeccak256(
      ["string","address","uint256"],
      [candidate, signer, nonce]
    );
    const recovered = ethers.verifyMessage(ethers.getBytes(hash), signature);
    if (recovered.toLowerCase() !== signer.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }
    if (nonces[signer.toLowerCase()] !== nonce) {
      return res.status(400).json({ error: "Invalid nonce" });
    }

    const tx = await contract.voteViaRelayer(candidate, signer, nonce, signature);
    await tx.wait();
    nonces[signer.toLowerCase()] += 1;
    res.json({ txHash: tx.hash });
  } catch (err) {
    console.error("Relay error:", err);
    res.status(500).json({ error: err.reason || err.message });
  }
});

app.get("/results", async (req, res) => {
  try {
    const names = ["Alice","Bob","Charlie"];
    const results = [];
    for (const name of names) {
      const raw = await contract.votes(name);
      // ethers v6 возвращает BigInt, поэтому конвертируем в JS number
      const count = Number(raw);
      results.push({ name, votes: count });
    }
    res.json(results);
  } catch (err) {
    console.error("Failed to fetch results:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Relay server listening at http://localhost:${PORT}`);
});