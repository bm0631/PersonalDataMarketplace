
const Migrations = artifacts.require("Migrations");


var minterNFT = artifacts.require("minterNFT.sol");
var MarketPersonalData = artifacts.require("MarketPersonalData.sol");

module.exports = async function(deployer) {


  await deployer.deploy(MarketPersonalData);
  const marketplace = await MarketPersonalData.deployed();
  await deployer.deploy(minterNFT, marketplace.address);
}