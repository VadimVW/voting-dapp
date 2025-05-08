const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const contract = await Voting.deploy(["Alice", "Bob", "Charlie"]);
  await contract.waitForDeployment(); // <- новий метод
  console.log("Voting deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});