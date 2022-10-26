// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UpgratedNFT is ERC721 {
    
    uint256 LatestTokenID = 0;
    mapping(uint256 => mapping(address => uint256)) private ConnectedTokensAmounts;
    mapping(uint256 => uint8) private ConnectedTokensCounts;
    mapping(uint256 => mapping(uint256 => address)) private tokenAddressByID;
    mapping(uint256 => mapping(address => bool)) private ConnectedTokensAddreses;

    constructor() ERC721("UpgratedNFT", "NFT") { }

    function mint() external returns (uint256) {
        _mint(msg.sender, LatestTokenID);
        return LatestTokenID++;
    }
    
    function connectERC20Token(uint256 NFTID, address tokenAddress, uint amount) external {
        require(ownerOf(NFTID) == msg.sender, "UpgratedNFT: Not an owner");

        IERC20 token = IERC20(tokenAddress);

        require(token.allowance(msg.sender, address(this)) >= amount, "UpgratedNFT: Allowance is too low");
        token.transferFrom(msg.sender, address(this), amount);

        ConnectedTokensAmounts[NFTID][tokenAddress] += amount;
        if(!ConnectedTokensAddreses[NFTID][tokenAddress]){
            tokenAddressByID[NFTID][ConnectedTokensCounts[NFTID]] = tokenAddress;
            ConnectedTokensCounts[NFTID]++;
            ConnectedTokensAddreses[NFTID][tokenAddress] = true;
        }
        
    }

    function withrawToken(uint256 NFTID, address tokenAddress, uint256 amount) external{
        require(ownerOf(NFTID) == msg.sender, "UpgratedNFT: Not an owner");

        IERC20 token = IERC20(tokenAddress);
        require(ConnectedTokensAmounts[NFTID][tokenAddress] >= amount, "UpgratedNFT: NFT balance is too low");
        ConnectedTokensAmounts[NFTID][tokenAddress] -= amount;
        token.transfer(msg.sender, amount);

    }

    function getTokensBalances(uint256 NFTID) public view returns (uint8, address[] memory, uint256[] memory){
        uint8 count = ConnectedTokensCounts[NFTID];
        address[] memory tokens = new address[](count);
        uint256[] memory balances = new uint256[](count);

        for(uint i = 0; i < count; i++){
            tokens[i] = tokenAddressByID[NFTID][i];
            balances[i] = ConnectedTokensAmounts[NFTID][tokens[i]];
        }

        return (count, tokens, balances);
    }


}
