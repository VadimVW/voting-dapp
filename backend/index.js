const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Параметри
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const abi = require("./VotingABI.json");

// Гаманець релеєра
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Для трекінгу nonce (опціонально, можна брати з контракту напряму)
app.get("/nonce/:address", async (req, res) => {
  try {
    const current = await contract.nonces(req.params.address);
    res.json({ nonce: parseInt(current) });
  } catch (err) {
    res.status(500).json({ error: "Помилка при отриманні nonce" });
  }
});

// Обробка голосу
app.post("/vote", async (req, res) => {
  const { candidate, signer, nonce, signature } = req.body;

  try {
    const tx = await contract.voteViaRelayer(candidate, signer, nonce, signature);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("Помилка при надсиланні транзакції:", err);
    res.status(500).json({ error: err.reason || err.message });
  }
});

app.listen(port, () => {
  console.log(`Relayer backend listening on http://localhost:${port}`);
});