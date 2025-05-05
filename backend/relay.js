const path    = require("path");
const express = require("express");
const cors    = require("cors");
const { ethers } = require("ethers");
const fs      = require("fs");
require("dotenv").config(); // зчитує змінні з backend/.env

// Шлях до ABI
const ABI_PATH = path.resolve(
  __dirname,
  "../artifacts/contracts/Voting.sol/Voting.json"
);
const { abi } = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));

const PORT             = 4000;
const PRIVATE_KEY      = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("❌ Вкажіть PRIVATE_KEY та CONTRACT_ADDRESS у файлі backend/.env");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// Прості в пам’яті nonces для кожного адреса
const nonces = {};

// ----------------------
// Мок-ендпоінт для емуляції авторизації через BankID/Дію
app.get("/auth/mock", (req, res) => {
  res.json({
    userId:   "demo-user-123",
    fullName: "Іван Іваненко",
  });
});
// ----------------------

// Повертає nonce для підпису
app.get("/nonce/:addr", (req, res) => {
  const addr = req.params.addr.toLowerCase();
  if (nonces[addr] == null) nonces[addr] = 0;
  res.json({ nonce: nonces[addr] });
});

// Обробка голосування з підписом
app.post("/vote", async (req, res) => {
  const { candidate, signer, nonce, signature } = req.body;
  try {
    // Обчислюємо той самий hash, що в контракті
    const hash = ethers.solidityPackedKeccak256(
      ["string","address","uint256"],
      [candidate, signer, nonce]
    );

    // Відновлюємо адресу підписанта
    const recovered = ethers.verifyMessage(ethers.getBytes(hash), signature);
    if (recovered.toLowerCase() !== signer.toLowerCase()) {
      return res.status(400).json({ error: "Невірний підпис" });
    }

    // Перевіряємо nonce
    if (nonces[signer.toLowerCase()] !== nonce) {
      return res.status(400).json({ error: "Невірний nonce" });
    }

    // Викликаємо мета-транзакцію в контракті
    const tx = await contract.voteViaRelayer(candidate, signer, nonce, signature);
    await tx.wait();

    // Збільшуємо nonce для цього адреса
    nonces[signer.toLowerCase()] += 1;

    res.json({ txHash: tx.hash });
  } catch (err) {
    console.error("Помилка relay:", err);
    res.status(500).json({ error: err.reason || err.message });
  }
});

// Повертає результати голосування
app.get("/results", async (req, res) => {
  try {
    const candidates = ["Alice","Bob","Charlie"];
    const out = [];

    for (const name of candidates) {
      // mapping votes(string) => uint
      const raw = await contract.votes(name);
      const count = Number(raw);
      out.push({ name, votes: count });
    }

    res.json(out);
  } catch (err) {
    console.error("Не вдалося отримати результати:", err);
    res.status(500).json({ error: "Не вдалося отримати результати" });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Relay-сервер слухає на http://localhost:${PORT}`);
});