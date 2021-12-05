export const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS as string;
export const nftMarketAddress = process.env
  .NEXT_PUBLIC_NFT_MARKET_ADDRESS as string;

import NFT from "./NFT.json";
import NFTMarket from "./NFTMarket.json";

export { NFT, NFTMarket };
