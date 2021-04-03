// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Fungie is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Fungie", "NFT") {}

    function mintNFT(address destination)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newNFTId = _tokenIds.current();
        _mint(destination, newNFTId);
        return newNFTId;
    }
}
