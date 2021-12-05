export const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS as string;
export const nftMarketAddress = process.env
  .NEXT_PUBLIC_NFT_MARKET_ADDRESS as string;

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export { NFT, NFTMarket };
