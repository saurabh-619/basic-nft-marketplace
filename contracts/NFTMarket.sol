// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // Stop shady things

// List created NFTs on NFTMarket
contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _itemId;
    Counters.Counter private _itemsSold;

    address payable owner; // owner of the contract
    uint256 listingPrice = .00025 ether; // fees that we will charge to put on our marketplace

    struct MarketItem {
        uint256 itemId;
        address nftContract; // NFT contract address
        uint256 tokenId; // NFT tokenId
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem; // itemId => MarketItem

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // nonReentrant = prevents reentry attacks (modifier)
    function createMarketItem(
        address nftContract, // NFT address where we deploy our NFT
        uint256 tokenId, // tokenId of NFT
        uint256 price // Base Price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        _itemId.increment();

        uint256 itemId = _itemId.current();
        // Create item on blackchain and store it
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)), //emoty address
            price,
            false
        );

        // Transfer ownership of this item from owner to NFTMarket contract so that contract can transfer it to the next buyer.
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asked price in order to complete the purchase"
        );

        // 1. buyer calling this function sends money to seller
        idToMarketItem[itemId].seller.transfer(msg.value);

        // 2. Transfer the ownership marketplace to buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice); // Non-profit marketplace yo😥
    }

    // fetches all market items (NFTs)
    function fetchAllMarketItems() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemId.current();

        uint256 currentIndex = 0;
        MarketItem[] memory items = new MarketItem[](totalItemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentItemId = idToMarketItem[i + 1].itemId;
            MarketItem storage currentItem = idToMarketItem[currentItemId];
            items[currentIndex++] = currentItem;
        }
        return items;
    }

    // fetches unsold market items (NFTs)
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemId.current();
        uint256 unsoldItemsCount = _itemId.current() - _itemsSold.current();

        uint256 currentIndex = 0;
        MarketItem[] memory items = new MarketItem[](unsoldItemsCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentItemId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentItemId];
                items[currentIndex++] = currentItem;
            }
        }
        return items;
    }

    // fetches my bought NFTs (items)
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemId.current();
        uint256 itemCount = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentItemId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentItemId];
                items[currentIndex++] = currentItem;
            }
        }
        return items;
    }

    // fetches my created NFTs (items)
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemId.current();
        uint256 createdItemCount = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                createdItemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](createdItemCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentItemId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentItemId];
                items[currentIndex++] = currentItem;
            }
        }
        return items;
    }
}
