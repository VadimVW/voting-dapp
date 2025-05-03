import { ethers } from "ethers";
import VotingABI from "./VotingABI.json";

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function getContract(signerOrProvider) {
  if (!window.ethereum) throw new Error("MetaMask is not installed");
  return new ethers.Contract(contractAddress, VotingABI, signerOrProvider);
}

export async function vote(candidate) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = getContract(signer);
  const tx = await contract.vote(candidate);
  await tx.wait();
}

export async function getVotes(candidate) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getContract(provider);
  return await contract.getVotes(candidate);
}

export async function getCandidates() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getContract(provider);

  const candidates = [];
  for (let i = 0; ; i++) {
    try {
      const name = await contract.candidates(i);
      candidates.push(name);
    } catch {
      break;
    }
  }
  return candidates;
}

export async function getCurrentAccount() {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}