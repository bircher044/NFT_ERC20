import { ethers } from "hardhat";
import { Contract, BigNumber, ContractFactory, Signer } from "ethers"; 
import { expect } from "chai";

describe("Testing", async () => {
    
    let name : string;
    let symbol : string;

    let holder : Signer;
    let user1 : Signer;
    let user2 : Signer;
    let user3 : Signer;

    let UpgradedNFT : Contract;
    let USDC1 : Contract;
    let USDC2 : Contract;
    let USDC3 : Contract;

    let USDC1Amount : BigNumber;
    let USDC2Amount : BigNumber;
    let USDC3Amount : BigNumber;

    describe("UpgradedNFT contract", async () => {

        beforeEach(async () => {

            [holder, user1, user2, user3] = await ethers.getSigners();

            let UpgratedNFTContractFactory : ContractFactory = await ethers.getContractFactory('UpgradedNFT');
            let ERC20ContractFactory1 : ContractFactory = await ethers.getContractFactory('USDC', user1);
            let ERC20ContractFactory2 : ContractFactory = await ethers.getContractFactory('USDC', user2);
            let ERC20ContractFactory3 : ContractFactory = await ethers.getContractFactory('USDC', user3);

            name = "UpgradedNFT";
            symbol = "NFT";
            
            USDC1Amount = ethers.utils.parseUnits("15", 18);
            USDC2Amount = ethers.utils.parseUnits("30", 18);
            USDC3Amount = ethers.utils.parseUnits("45", 18);

            UpgradedNFT = await UpgratedNFTContractFactory.deploy();
            USDC1 = await ERC20ContractFactory1.deploy();
            USDC2 = await ERC20ContractFactory2.deploy();
            USDC3 = await ERC20ContractFactory3.deploy();

            await USDC1.transfer(await holder.getAddress(), USDC1Amount);
            await USDC2.transfer(await holder.getAddress(), USDC2Amount);
            await USDC3.transfer(await holder.getAddress(), USDC3Amount);


        });



        describe("Deployment", async () => {

            it("Should set the correct contract name", async () => {
    
                expect(await UpgradedNFT.name()).to.equal(name);
            });

            it("Should set the correct contract symbol", async () => {
    
                expect(await UpgradedNFT.symbol()).to.equal(symbol);
            });

        });



        describe("mint function", async () => {

            it("Should set the correct owner of the NFT after mint", async () => {
                
                let tokenId : BigNumber = await UpgradedNFT.connect(holder).callStatic.mint();
                await UpgradedNFT.connect(holder).mint();

                expect(await UpgradedNFT.ownerOf(tokenId)).to.equal(await holder.getAddress());

            });

            it("Should encrease token id after minting", async () => {
                
                let tokenId : BigNumber = await UpgradedNFT.connect(holder).callStatic.mint();
                await UpgradedNFT.connect(holder).mint();

                expect(await UpgradedNFT.connect(holder).callStatic.mint()).to.equal(tokenId.add(BigNumber.from(1)));
                
            });
            
        });



        describe("connectERC20Token & getTokensBalances functions", async () => {

            let holdersTokenId : BigNumber;

            beforeEach(async () => {

                holdersTokenId = await UpgradedNFT.connect(holder).callStatic.mint();
                await UpgradedNFT.connect(holder).mint();

            });

            it("Should revert when not the owner is thying to connect the token", async () => {

               await expect(UpgradedNFT.connect(user1).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount))
                    .to.be.revertedWith("UpgradedNFT: Not an owner");
            });

            it("Should revert when allowance is lower than amount to connect", async () => {

                await expect(UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount))
                    .to.be.revertedWith("UpgradedNFT: Allowance is too low");
            });

            it("Should connect a token to an NFT and set the right connected tokens amount", async () => {

                await USDC1.connect(holder).approve(UpgradedNFT.address, USDC1Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount);

                let result = await UpgradedNFT.getTokensBalances(holdersTokenId);
                let connectedTokensAmount = result[0];
                
                expect(connectedTokensAmount).to.be.equal(1);
            });

            it("Should connect a few tokens to an NFT and set the right connected tokens amount", async () => {

                await USDC1.connect(holder).approve(UpgradedNFT.address, USDC1Amount);
                await USDC2.connect(holder).approve(UpgradedNFT.address, USDC2Amount);
                await USDC3.connect(holder).approve(UpgradedNFT.address, USDC3Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC2.address, USDC2Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC3.address, USDC3Amount);

                let result = await UpgradedNFT.getTokensBalances(holdersTokenId);
                let connectedTokensAmount = result[0];
                
                expect(connectedTokensAmount).to.be.equal(3);
            });

            it("Should connect a token to an NFT and set the right token address", async () => {

                await USDC1.connect(holder).approve(UpgradedNFT.address, USDC1Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount);

                let result = await UpgradedNFT.getTokensBalances(holdersTokenId);
                let connectedTokenAddresses = result[1];
                
                expect(connectedTokenAddresses[0]).to.be.equal(USDC1.address);
            });

            it("Should connect a few tokens to an NFT and set the right tokens addresses", async () => {

                await USDC1.connect(holder).approve(UpgradedNFT.address, USDC1Amount);
                await USDC2.connect(holder).approve(UpgradedNFT.address, USDC2Amount);
                await USDC3.connect(holder).approve(UpgradedNFT.address, USDC3Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC2.address, USDC2Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC3.address, USDC3Amount);

                let result = await UpgradedNFT.getTokensBalances(holdersTokenId);
                let connectedTokenAddresses = result[1];
                expect(connectedTokenAddresses[0]).to.be.equal(USDC1.address);
                expect(connectedTokenAddresses[1]).to.be.equal(USDC2.address);
                expect(connectedTokenAddresses[2]).to.be.equal(USDC3.address);
            });

            it("Should connect a token to an NFT and set the right token amount connected", async () => {

                await USDC1.connect(holder).approve(UpgradedNFT.address, USDC1Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount);

                let result = await UpgradedNFT.getTokensBalances(holdersTokenId);
                let connectedTokenAmounts = result[2];
                
                expect(connectedTokenAmounts[0]).to.be.equal(USDC1Amount);
            });

            it("Should connect a token to an NFT and set the right tokens amounts connected", async () => {

                await USDC1.connect(holder).approve(UpgradedNFT.address, USDC1Amount);
                await USDC2.connect(holder).approve(UpgradedNFT.address, USDC2Amount);
                await USDC3.connect(holder).approve(UpgradedNFT.address, USDC3Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC2.address, USDC2Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC3.address, USDC3Amount);

                let result = await UpgradedNFT.getTokensBalances(holdersTokenId);
                let connectedTokenAmounts = result[2];
                
                expect(connectedTokenAmounts[0]).to.be.equal(USDC1Amount);
                expect(connectedTokenAmounts[1]).to.be.equal(USDC2Amount);
                expect(connectedTokenAmounts[2]).to.be.equal(USDC3Amount);
            });

        });



        describe("withdrawToken function", async () => {

            let holdersTokenId : BigNumber;

            beforeEach(async () => {

                holdersTokenId = await UpgradedNFT.connect(holder).callStatic.mint();

                await UpgradedNFT.connect(holder).mint();
                await USDC1.connect(holder).approve(UpgradedNFT.address, USDC1Amount);
                await UpgradedNFT.connect(holder).connectERC20Token(holdersTokenId, USDC1.address, USDC1Amount);

            });

            it("Should revert when not the owner of NFT is trying to withdraw token balance", async () => {

                await expect(UpgradedNFT.connect(user1).withrawToken(holdersTokenId, USDC1.address, USDC1Amount))
                    .to.be.revertedWith("UpgradedNFT: Not an owner");
            });

            it("Should revert when NFT balance is lower than withdraw amount", async () => {

                await expect(UpgradedNFT.connect(holder).withrawToken(holdersTokenId, USDC1.address, USDC1Amount.mul(BigNumber.from(2))))
                    .to.be.revertedWith("UpgradedNFT: NFT balance is too low");
            });

            it("Should withdraw token balance to holders balances", async () => {

                let holdersUSDC1StartBalance : BigNumber = await USDC1.balanceOf(await holder.getAddress());

                await UpgradedNFT.connect(holder).withrawToken(holdersTokenId, USDC1.address, USDC1Amount);

                expect(await USDC1.balanceOf(await holder.getAddress())).to.equal(holdersUSDC1StartBalance.add(USDC1Amount));
            });

        });

    });
    
});