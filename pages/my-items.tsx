import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import {
  NFT,
  nftAddress,
  NFTMarket,
  nftMarketAddress,
} from "../utils/constants";
import axios from "axios";

const MyItems = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftMarketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarket.abi,
      signer
    );
    const nftContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const data = await nftMarketContract.fetchMyNFTs();
    console.log({ data });
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await nftContract.tokenURI(i.tokenId);
        console.log({ tokenURI });
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

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {nfts.map((nft, i) => (
            <div key={i} className="overflow-hidden border shadow rounded-xl">
              <img src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Eth
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyItems;
