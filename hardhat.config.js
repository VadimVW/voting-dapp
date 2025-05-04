require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
};
task("copy-abi", "Copy ABI to backend").setAction(async () => {
  require("./scripts/post-compile");
});
