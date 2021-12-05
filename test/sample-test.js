const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Market", function () {
  it("Should create and execute market sales", async function () {
    const NFTMarket = await ethers.getContractFactory("NFTMarket");

    const marketContract = await NFTMarket.deploy();
    await marketContract.deployed();
    const marketContractAddress = marketContract.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nftContract = await NFT.deploy(marketContractAddress);
    await nftContract.deployed();
    const nftContractAddress = nftContract.address;

    const listingPrice = (await marketContract.getListingPrice()).toString();
    const auctionPrice = ethers.utils.parseUnits("100", "ether");

    // Create some NFTs
    await nftContract.createToken("https://www.saurabhbomble.me");
    await nftContract.createToken(
      "https://www.saurabhbomble.me/#section-works"
    );

    // List NFTs on the market
    await marketContract.createMarketItem(nftContractAddress, 1, auctionPrice, {
      value: listingPrice,
    });
    await marketContract.createMarketItem(nftContractAddress, 2, auctionPrice, {
      value: listingPrice,
    });

    // get local test account
    const [contractDeployerAddress, buyerAddress] = await ethers.getSigners(); // 1st address is automatically used while deploying contracts above

    // Buy an NFT
    await marketContract
      .connect(buyerAddress)
      .createMarketSale(nftContractAddress, 1, { value: auctionPrice });

    // Get all NFT items
    let allItems = await marketContract.fetchAllMarketItems();
    allItems = await Promise.all(
      allItems.map(async (i) => {
        const tokenURI = await nftContract.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenURI,
        };
        return item;
      })
    );

    // Get unsold NFT items
    let unsoldItems = await marketContract.fetchMarketItems();
    unsoldItems = await Promise.all(
      unsoldItems.map(async (i) => {
        const tokenURI = await nftContract.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenURI,
        };
        return item;
      })
    );

    console.log({
      marketContractAddress,
      nftContractAddress,
      listingPrice,
      auctionPrice: auctionPrice.toString(),
      allItems,
      unsoldItems,
    });
  });
});
