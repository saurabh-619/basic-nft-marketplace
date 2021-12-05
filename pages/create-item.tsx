import React, { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import { create as ipfsHttpClient } from "ipfs-http-client";
import {
  nftAddress,
  nftMarketAddress,
  NFT,
  NFTMarket,
} from "./../utils/constants";

const IFPS_BASE_URL = "https://ipfs.infura.io:5001/api/v0";
const IFPS_VIEW_BASE_URL = "https://ipfs.infura.io/ipfs";
const client = ipfsHttpClient({ url: IFPS_BASE_URL });

const CreateItem = () => {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState("");
  const [formInput, setFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });

  const updateFormInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormInput((prev) => ({ ...prev, [name]: value }));
  };

  const onChange = async (e: React.ChangeEvent) => {
    //   @ts-ignore()
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog: any) => console.log(`progress -> ${prog} ....`),
      });
      const uploadedUrl = `${IFPS_VIEW_BASE_URL}/${added.path}`;
      setFileUrl(uploadedUrl);
    } catch (e) {
      console.log({ e });
    }
  };

  const createItem = async () => {
    const { name, price, description } = formInput;
    if (!name || !price || !description || !fileUrl) {
      console.log("Fill every field");
      return;
    }
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      const url = `${IFPS_VIEW_BASE_URL}/${added.path}`;

      createSale(url);
    } catch (e: any) {
      console.log({ error: "Error while uploading the image - " + e.message });
    }
  };

  const createSale = async (url: string) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await nftContract.createToken(url);
    let tx = await transaction.wait();

    console.log({ tx });

    const event = tx.events[0];
    const value = event.args[2];
    const tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");
    const nftMarketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarket.abi,
      signer
    );

    const listingPrice = (await nftMarketContract.getListingPrice()).toString();
    transaction = await nftMarketContract.createMarketItem(
      nftAddress,
      tokenId,
      price,
      { value: listingPrice }
    );
    tx = await transaction.wait();
    console.log({ tx });
    router.push("/");
  };

  return (
    <div>
      <h2 className="text-xl">Create new NFT</h2>
      <div className="flex justify-center">
        <div className="flex flex-col w-1/2 pb-12">
          <input
            placeholder="Asset Name"
            className="p-4 mt-8 border rounded"
            name="name"
            onChange={updateFormInput}
          />
          <textarea
            placeholder="Asset Description"
            className="p-4 mt-2 border rounded"
            name="description"
            onChange={updateFormInput}
          />
          <input
            placeholder="Asset Price in Eth"
            className="p-4 mt-2 border rounded"
            name="price"
            onChange={updateFormInput}
          />
          <input
            type="file"
            name="Asset"
            className="my-4"
            onChange={onChange}
          />
          {fileUrl && (
            <img className="mt-4 rounded" width="350" src={fileUrl} />
          )}
          <button
            onClick={createItem}
            className="p-4 mt-4 font-bold text-white bg-pink-500 rounded shadow-lg"
          >
            Create Digital Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateItem;
