// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract UpgradedNFT is ERC721 {

    uint256 private LatestTokenID = 0;
    mapping(uint256 => mapping(address => uint256)) private ConnectedTokensAmounts;
    mapping(uint256 => mapping(address => bool)) private ConnectedTokensAddreses;
    mapping(uint256 => address[]) private connections;

    constructor() ERC721("UpgradedNFT", "NFT") {}

    function mint() external returns (uint256) {
        _mint(msg.sender, LatestTokenID);
        return LatestTokenID++;
    }
    
    function connectERC20Token(uint256 NFTID, address tokenAddress, uint amount) external {
        require(ownerOf(NFTID) == msg.sender, "UpgradedNFT: Not an owner");

        IERC20 token = IERC20(tokenAddress);

        require(token.allowance(msg.sender, address(this)) >= amount, "UpgradedNFT: Allowance is too low");
        token.transferFrom(msg.sender, address(this), amount);
        ConnectedTokensAmounts[NFTID][tokenAddress] += amount;
        
        if(!ConnectedTokensAddreses[NFTID][tokenAddress]){
            connections[NFTID].push(tokenAddress);
        }
        
    }

    function withrawToken(uint256 NFTID, address tokenAddress, uint256 amount) external{
        require(ownerOf(NFTID) == msg.sender, "UpgradedNFT: Not an owner");

        IERC20 token = IERC20(tokenAddress);
        require(ConnectedTokensAmounts[NFTID][tokenAddress] >= amount, "UpgradedNFT: NFT balance is too low");
        ConnectedTokensAmounts[NFTID][tokenAddress] -= amount;
        token.transfer(msg.sender, amount);

    }

    function getTokensBalances(uint256 NFTID) public view returns (uint256, address[] memory, uint256[] memory){
        uint256 amount = connections[NFTID].length;
        address[] memory tokens = new address[](amount);
        uint256[] memory balances = new uint256[](amount);

        tokens = connections[NFTID];

        for(uint i = 0; i < amount; i++)
            balances[i] = ConnectedTokensAmounts[NFTID][tokens[i]];  

        return (amount, tokens, balances);
    }


}
