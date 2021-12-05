const hre = require("hardhat");

async function main() {
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarketContract = await NFTMarket.deploy();
  await nftMarketContract.deployed();
  console.log("NFTMarket deployed to:", nftMarketContract.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nftContract = await NFT.deploy(nftMarketContract.address);
  await nftContract.deployed();
  console.log("NFT deployed to:", nftContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error({ e: error.message });
    process.exit(1);
  });
