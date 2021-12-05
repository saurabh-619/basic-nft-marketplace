// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Metaverse Tokens", "METT") {
        contractAddress = marketplaceAddress; // we'll deploy market first and then deploy we'll deploy the contract
    }

    // Mint the NFTS
    function createToken(string memory tokenURI) public returns (uint256) {
        // tokenURI is metadata of NFT
        _tokenIds.increment(); // now will start with 1 rather than 0
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true); // gives approval to the marketplace for allowing users to trade NFT among themselves.

        return newItemId;
    }
}
