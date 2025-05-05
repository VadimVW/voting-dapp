import { ethers } from "ethers";
import fs         from "fs";
import path       from "path";
import { fileURLToPath } from "url";

// эмуляция __dirname в ESM-модуле
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Абсолютный путь к ABI контракта
const ABI_PATH = path.resolve(
  __dirname,
  "../artifacts/contracts/Voting.sol/Voting.json"
);

// Читаем ABI из файла
const { abi } = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Подключаемся к локальному Hardhat RPC
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Создаём объект контракта
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

async function main() {
  console.log("🔍 Перевіряємо підії Voted…");

  // Событие Voted(address voter, string candidate)
  const events = await contract.queryFilter(
    contract.filters.Voted(), 
    0, 
    "latest"
  );

  console.log(`Знайдено подій Voted: ${events.length}`);
  for (const e of events) {
    console.log(
      `• Блок ${e.blockNumber}, tx ${e.transactionHash}\n` +
      `    Voter:    ${e.args.voter}\n` +
      `    Candidate: "${e.args.candidate}"`
    );
  }

  console.log("\n📊 Лічильники голосів:");
  // Итоговые голосования по каждому кандидату
  const candidates = ["Alice","Bob","Charlie"];
  for (const name of candidates) {
    // public mapping votes(string)=>uint
    const rawCount = await contract.votes(name);
    const count    = Number(rawCount);  // BigInt → Number
    console.log(`  ${name}: ${count} голосів`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Помилка в check.js:", err);
    process.exit(1);
  });