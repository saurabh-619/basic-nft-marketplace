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

const CreatorDashbaord = () => {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const data = await nftMarketContract.fetchItemsCreated();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await nftContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        console.log({ tokenUri, meta });
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoading(false);
  };

  useEffect(() => {
    loadNFTs();
  }, []);

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
    <div>
      <div className="p-4">
        <h2 className="py-2 text-2xl">Items Created</h2>
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
      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <h2 className="py-2 text-2xl">Items sold</h2>
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {sold.map((nft, i) => (
                <div
                  key={i}
                  className="overflow-hidden border shadow rounded-xl"
                >
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
        )}
      </div>
    </div>
  );
};

export default CreatorDashbaord;
