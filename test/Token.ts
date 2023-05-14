const { expect } = require("chai");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
describe("Token contract", function () {

  async function deployTokenFixture() {

    const Token = await ethers.getContractFactory("TestNFT");
    const Marketplace = await ethers.getContractFactory("NFTMarketplace");
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const marketplace = await Marketplace.deploy(
      ethers.utils.parseEther("0.01")
    );
    const hardhatToken = await Token.deploy(marketplace.address);

    await hardhatToken.deployed();
    await marketplace.deployed();
    return { Token, hardhatToken, Marketplace, marketplace, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {

    it("Should set the right owner", async function () {

      const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);

      await hardhatToken.giveAway(addr1.address);

      expect(await hardhatToken.owner()).to.equal(owner.address);
    });
  });

  describe("List NFT", function () {

    it("Should list/delist NFT", async function () {

      const { hardhatToken, marketplace, addr1 } = await loadFixture(deployTokenFixture);

      await hardhatToken.giveAway(addr1.address);
      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(1);

      const listingPrice = await marketplace.listingPrice();

      await hardhatToken.connect(addr1).approve(marketplace.address, 0);
      await marketplace.connect(addr1).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.1"), { value: listingPrice });
      expect(await hardhatToken.ownerOf(0)).to.equal(marketplace.address);

      await marketplace.connect(addr1).delistNft(0);
      expect(await hardhatToken.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should change price NFT", async function () {
      const { hardhatToken, marketplace, addr1 } = await loadFixture(deployTokenFixture);
      await hardhatToken.giveAway(addr1.address);

      const listingPrice = await marketplace.listingPrice();
      await hardhatToken.connect(addr1).approve(marketplace.address, 0);
      await marketplace.connect(addr1).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.1"), { value: listingPrice });


      await marketplace.connect(addr1).changeNftPrice(0, ethers.utils.parseEther("0.2"));

      expect(await marketplace.nftPrice(0)).to.equal(ethers.utils.parseEther("0.2"));
    });
    it("Should buy NFT", async function () {
      const { hardhatToken, marketplace, addr1, addr2, addr3 } = await loadFixture(deployTokenFixture);
      await hardhatToken.giveAway(addr1.address);

      const listingPrice = await marketplace.listingPrice();
      await hardhatToken.connect(addr1).approve(marketplace.address, 0);
      await marketplace.connect(addr1).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.1"), { value: listingPrice });

      await marketplace.connect(addr2).buyNft(0, { value: ethers.utils.parseEther("0.1") });

      expect(await hardhatToken.ownerOf(0)).to.equal(addr2.address);
      expect(await marketplace.isSold(0)).to.equal(true);

      await marketplace.connect(addr3).buyNft(0, { value: ethers.utils.parseEther("0.1") })
        .catch(() => { }).then(() => {
          // throw Error("Should not be able to buy sold NFT")
        });
      await hardhatToken.connect(addr2).approve(marketplace.address, 0);

      await marketplace.connect(addr2).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.1"), { value: listingPrice });
      expect(await hardhatToken.ownerOf(0)).to.equal(marketplace.address);
      expect((await marketplace.items(1)).tokenId).to.equal(0);


    })
  });

});
