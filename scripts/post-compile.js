const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../artifacts/contracts/Voting.sol/Voting.json");
const dst = path.join(__dirname, "../backend/VotingABI.json");

const abi = JSON.parse(fs.readFileSync(src)).abi;
fs.writeFileSync(dst, JSON.stringify(abi, null, 2));

console.log("✅ ABI скопійовано у backend/");