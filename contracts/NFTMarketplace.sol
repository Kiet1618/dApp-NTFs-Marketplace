// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace {
    using Counters for Counters.Counter;
    uint256 public listingPrice;

    constructor(uint256 _listingPrice) {
        listingPrice = _listingPrice;
    }

    struct Item {
        address nftContract;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool sold;
    }
    Item[] public items;

    Counters.Counter private _itemIds;
    mapping(address => uint256[]) private itemsBySeller;

    function listNft(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    ) public payable returns (uint256) {
        require(_price > 0, "price must be >0");
        require(
            msg.value == listingPrice,
            "price must be equal to listing price"
        );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        IERC721(_nftAddress).transferFrom(msg.sender, address(this), _tokenId);

        items.push(
            Item(_nftAddress, _tokenId, _price, payable(msg.sender), false)
        );
        itemsBySeller[msg.sender].push(itemId); // Add item to the seller's items
        return itemId;
    }

    function delistNft(uint256 _itemId) public {
        Item storage item = items[_itemId];
        require(item.seller == msg.sender, "Only seller can delist item");
        require(!item.sold, "Item is not sold");
        IERC721(item.nftContract).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        delete items[_itemId];
        uint256[] storage sellerItems = itemsBySeller[msg.sender];
        for (uint256 i = 0; i < sellerItems.length; i++) {
            if (sellerItems[i] == _itemId) {
                sellerItems[i] = sellerItems[sellerItems.length - 1];
                sellerItems.pop();
                break;
            }
        }
    }

    function changeNftPrice(uint256 _itemId, uint256 _price) public {
        Item storage item = items[_itemId];
        require(item.seller == msg.sender, "Only seller can change item price");
        require(!item.sold, "Item is not sold");
        item.price = _price;
    }

    function nftPrice(uint256 _itemId) public view returns (uint256) {
        return items[_itemId].price;
    }

    function buyNft(uint256 _itemId) public payable {
        Item storage item = items[_itemId];
        require(item.price == msg.value, "Price is not correct");
        require(!item.sold, "Item is not sold");
        IERC721(item.nftContract).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        item.seller.transfer(msg.value);
        item.sold = true;
        uint256[] storage sellerItems = itemsBySeller[item.seller];
        for (uint256 i = 0; i < sellerItems.length; i++) {
            if (sellerItems[i] == _itemId) {
                sellerItems[i] = sellerItems[sellerItems.length - 1];
                sellerItems.pop();
                break;
            }
        }
    }

    function isSold(uint256 _itemId) public view returns (bool) {
        return items[_itemId].sold;
    }

    function getAllNfts() public view returns (Item[] memory) {
        return items;
    }

    function getNftsByAddress(
        address _seller
    ) public view returns (Item[] memory) {
        uint256[] memory itemIds = itemsBySeller[_seller];
        Item[] memory result = new Item[](itemIds.length);

        for (uint256 i = 0; i < itemIds.length; i++) {
            uint256 itemId = itemIds[i];
            result[i] = items[itemId];
        }
        return result;
    }
}
