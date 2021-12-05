import { useEffect, useState } from "react";
import type { NextPage } from "next";

import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
import {
  nftAddress,
  nftMarketAddress,
  NFT,
  NFTMarket,
} from "./../utils/constants";

const Home: NextPage = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const nftContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarket.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await nftContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");

        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          itemId: i.itemId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    // @ts-ignore
    setNfts(items);
    setLoading(false);
  };

  const buyNFT = async (nft: any) => {
    console.log({ nft });

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftMarketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarket.abi,
      signer
    );
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await nftMarketContract.createMarketSale(
      nftAddress,
      nft.itemId,
      {
        value: price,
      }
    );
    await transaction.wait();

    loadNFTs();
  };

  useEffect(() => {
    loadNFTs();
  }, [loading]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "70vh" }}
      >
        <h2 className="text-xl font-normal">Loading...</h2>
      </div>
    );
  }

  if (!loading && !nfts.length) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "70vh" }}
      >
        <h2 className="text-xl font-normal">No items in marketplace</h2>
      </div>
    );
  }

  console.log({ nfts });

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {nfts.map((nft) => (
            <div
              className="overflow-hidden border shadow rounded-xl"
              key={nft?.itemId}
            >
              <img src={nft.image} alt="image" />
              <div className="p-4">
                <p
                  style={{ height: "64px" }}
                  className="text-2xl font-semibold"
                >
                  {nft.name}
                </p>
                <div style={{ height: "70px", overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="p-4 bg-black">
                <p className="mb-4 text-2xl font-bold text-white">
                  {nft.price} ETH
                </p>
                <button
                  className="w-full px-12 py-2 font-bold text-white bg-pink-500 rounded"
                  onClick={() => buyNFT(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
