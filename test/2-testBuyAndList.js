/* -------------------------------------------------------------------------- */
/*                        Pruebas de venta y propiedad                        */
/* -------------------------------------------------------------------------- */
var minterNFT = artifacts.require("minterNFT");
var MarketPersonalData = artifacts.require("MarketPersonalData");

contract("MarketPersonalData", (accounts) => {
  let _pesonalData = {
    name: "Alguien",
    lastnames: "Perez",
    age: 35,
    gender: 0,
  };
  let _home_Adrees = {
    city: "Madrid",
    country: "Spain",
    floor: "C/ mayor",
    street: "12",
  };
  let _contactData = {
    email: "algo@dasd.com",
    phoneNumber: "9652364",
  };
  let _professional_Career = {
    possition: "Super boss",
    salary: 2000,
    studies: "ESO",
  };
  let _Data_Of_Commercial_Interest = {
    list_Hobbiets: "Studing, walking",
    numberOfChilds: 5,
    professional_Career: _professional_Career,
  };
  let datos1 = {
    personalData: _pesonalData,
    home_Adrees: _home_Adrees,
    contactData: _contactData,
    Data_Of_Commercial_Interest: _Data_Of_Commercial_Interest,
  };
  it("Mercado vacio", async () => {
    console.log("Pruebas de cambio de propiedad con venta");
    let marketplace = await MarketPersonalData.deployed();
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 0);
  });
  it("Emitir NFT1 con cuenta 1 y comprar con cuenta 2 ", async () => {

    console.log("Pruebas de cambio de propiedad con venta solo con 1 NFT en el mercado y de ingreso de ether ");
    let address1 = accounts[1];
    let address2 = accounts[2];
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let txn1 = await nfts.mint({ from: address1 });

    let idTokenBuy = txn1.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      idTokenBuy,
      100000000,
      JSON.stringify(datos1),
      { from: address1 }
    );

    let listMyNFTSaleNow = await marketplace.getMyNftsForsaleNow.call({
      from: address1,
    });
    assert.equal(listMyNFTSaleNow.length, 1);
   
    let listMyNfts = await marketplace.getMyNfts.call({ from: address2 });
    assert.equal(listMyNfts.length, 0);

    let balanceBefore= parseInt(await web3.eth.getBalance(address1));
    await marketplace.buyNft(nfts.address, idTokenBuy, { value: listMyNFTSaleNow[0].price, from: address2});
    let balanceAfter= parseInt(await web3.eth.getBalance(address1));
    assert(balanceAfter>=balanceBefore,"transferencia fallida");

    let listMyNftsAfterBuy = await marketplace.getMyNfts.call({ from: address2 });
    assert.equal(listMyNftsAfterBuy.length, 1);
    assert.equal(listMyNftsAfterBuy[0].tokenId, idTokenBuy);
  });


  it("NFT1 no es visible como emision y todavia en venta, pero si en como emitido para cuenta 1", async () => {
    let address = accounts[1];
    
    let marketplace = await MarketPersonalData.deployed();



    let listMyNFTSaleNow = await marketplace.getMyNftsForsaleNow.call({
      from: address,
    });
    assert.equal(listMyNFTSaleNow.length, 0);

    let listMinted = await marketplace.getMyMintedNfts.call({ from: address });
    assert.equal(listMinted.length, 1);

  });
  it("NFT1 no esta en propiedad del mercado", async () => {
    
    let marketplace = await MarketPersonalData.deployed();
    let address = marketplace.address;
    

    let listMyNfts = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNfts.length, 0);

  });


  it("Emitir NFT2 desde cuenta 2 y comprar desde cuenta 2", async () => {
    console.log("Pruebas de cambio de propiedad con venta varios NFTs en el Mercado ");
    let address = accounts[2];
  
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let txn1 = await nfts.mint({ from: address });

    let idTokenBuy = txn1.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      idTokenBuy,
      2,
      JSON.stringify(datos1),
      { from: address }
    );

    let listMyNFTSaleNow = await marketplace.getMyNftsForsaleNow.call({
      from: address,
    });
    assert.equal(listMyNFTSaleNow.length, 1);
   
    let listMyNfts = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNfts.length, 1);

    await marketplace.buyNft(nfts.address, idTokenBuy, { value: listMyNFTSaleNow[0].price, from: address});

    
    let listMyNftsAfterBuy = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNftsAfterBuy[1].tokenId, idTokenBuy);
    assert.equal(listMyNftsAfterBuy.length, 2);
    

  });
  it("NFT2 no esta en propiedad del mercado", async () => {
    
    let marketplace = await MarketPersonalData.deployed();
    let address = marketplace.address;
    

    let listMyNfts = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNfts.length, 0);

  });
  it("NFT3 emitido y todos los emitidos por cuenta 1 ", async () => {
    
    let address = accounts[1];
  
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let txn1 = await nfts.mint({ from: address });

    let tokenId1 = txn1.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      tokenId1,
      3,
      JSON.stringify(datos1),
      { from: address }
    );

    let listMinted = await marketplace.getMyMintedNfts.call({
      from: address,
    });
    assert.equal(listMinted.length, 2);

  });
  it("NFT3 esta en propiedad del mercado", async () => {
    
    let marketplace = await MarketPersonalData.deployed();
    let address = marketplace.address;
    

    let listMyNfts = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNfts.length, 1);

  });

});
