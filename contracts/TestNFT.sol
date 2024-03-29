// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TestNFT is ERC721 {
    using Strings for uint256;
    mapping(uint256 => string) private _tokenURIs;
    address public owner;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address nftMarketplaceAddress;

    constructor(address _nftMarketplaceAddress) ERC721("TestNFT", "TEST") {
        nftMarketplaceAddress = _nftMarketplaceAddress;
    }

    function _setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) internal virtual {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    function giveAway(address to) public returns (uint256) {
        uint256 tokenId = _tokenIds.current();
        string
            memory mockTokenURI = "https://famousfoxes.com/metadata/7779.json";
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, mockTokenURI);
        setApprovalForAll(nftMarketplaceAddress, true);
        _tokenIds.increment();
        owner = msg.sender;
        return tokenId;
    }

    function mintURI(
        address to,
        string memory tokenURI
    ) public returns (uint256) {
        uint256 tokenId = _tokenIds.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        setApprovalForAll(nftMarketplaceAddress, true);
        _tokenIds.increment();
        owner = msg.sender;
        return tokenId;
    }
}
