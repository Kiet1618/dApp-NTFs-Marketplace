import { ethers } from "hardhat";
const listingPriceInWei = ethers.utils.parseUnits("0.0001", "ether");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy NFTMarketplace contract
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy(listingPriceInWei); // Pass the listing price as an argument
  await nftMarketplace.deployed();
  console.log("NFTMarketplace deployed at address:", nftMarketplace.address);

  // Deploy TestNFT contract and pass the NFTMarketplace address as an argument
  const TestNFT = await ethers.getContractFactory("TestNFT");
  const testNFT = await TestNFT.deploy(nftMarketplace.address);
  await testNFT.deployed();
  console.log("TestNFT deployed at address:", testNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


//NFT 0xAFbBd56B0afC9458FE9dec7ef7c48EF9703d0563
//MARKET 0x1B3a597134e204b7beF0F5731bAA45FC724f5bB4