/* -------------------------------------------------------------------------- */
/*               Pruebas de acuñar, añadir al mercado y listados              */
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

  it("Desplegado MakertPlace correctamente", async () => {
    console.log("Pruebas de despliegue");
    let marketplace = await MarketPersonalData.deployed();
    const address = await marketplace.address;
    assert.notEqual(address, 0x0,"error de  desplegado market");
    assert.notEqual(address, "","error de  desplegado market");
    assert.notEqual(address, null,"error de  desplegado market");
    assert.notEqual(address, undefined,"error de  desplegado market");
  });

  it("Desplegado minterNFT correctamente", async () => {
    let nfts = await minterNFT.deployed();
    const address = await nfts.address;
    assert.notEqual(address, 0x0,"error de  desplegado minter");
    assert.notEqual(address, "","error de  desplegado minter");
    assert.notEqual(address, null,"error de  desplegado minter");
    assert.notEqual(address, undefined,"error de  desplegado minter");
  });
  it("Mercado vacio", async () => {
    let marketplace = await MarketPersonalData.deployed();
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 0,"error mercado con datos sucios");
  });

  it("Emitir y listar NFT1 con cuenta 1 ", async () => {
    console.log("Prueba de emision y listado con solo 1 NFT en el mercado");
    let address = accounts[1];
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let txn1 = await nfts.mint({ from: address });

    let tokenId1 = txn1.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      tokenId1,
      1,
      JSON.stringify(datos1),
      { from: address }
    );
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 1,"add al mercado erroneo");
  });

  it("NFT1 se ve como en emitido y emitido y todavia en venta desde cuenta 1 ", async () => {
    let address = accounts[1];

    let marketplace = await MarketPersonalData.deployed();

    let listMyNFTSaleNow = await marketplace.getMyNftsForsaleNow.call({
      from: address,
    });
    assert.equal(listMyNFTSaleNow.length, 1);
    let listMinted = await marketplace.getMyMintedNfts.call({ from: address });
    assert.equal(listMinted.length, 1);
  });
  it("NFT1  no se ve en emitido ni emitido y todavia en venta desde cuenta 2 ", async () => {
    let address = accounts[2];

    let marketplace = await MarketPersonalData.deployed();

    let listMyNFTSaleNow = await marketplace.getMyNftsForsaleNow.call({
      from: address,
    });
    assert.equal(listMyNFTSaleNow.length, 0);
    let listMinted = await marketplace.getMyMintedNfts.call({ from: address });
    assert.equal(listMinted.length, 0);
  });
  it("NFT1 no esta en propiedad ni de cuenta 1 ni 2 pero si del marketPlace ", async () => {
    let address1 = accounts[1];
    let address2 = accounts[2];
    let marketplace = await MarketPersonalData.deployed();

    let listMyNfts1 = await marketplace.getMyNfts.call({ from: address1 });
    assert.equal(listMyNfts1.length, 0);
    let listMyNfts2 = await marketplace.getMyNfts.call({ from: address2 });
    assert.equal(listMyNfts2.length, 0);
    let listMyNftsMarket = await marketplace.getMyNfts.call({
      from: marketplace.address,
    });
    assert.equal(listMyNftsMarket.length, 1);
  });

  it("Emitir y listar NFT2 con cuenta 2 ", async () => {
    console.log(
      "Prueba de emision y listado con  2 NFT en el mercado de distintos emisores"
    );
    let address = accounts[2];
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let txn1 = await nfts.mint({ from: address });

    let tokenId1 = txn1.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      tokenId1,
      1,
      JSON.stringify(datos1),
      { from: address }
    );
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 2);
  });

  it("NFT2 se ve como en emitido y emitido y todavia en venta desde cuenta 2 ", async () => {
    let address = accounts[2];

    let marketplace = await MarketPersonalData.deployed();

    let listMyNFTSaleNow = await marketplace.getMyNftsForsaleNow.call({
      from: address,
    });
    assert.equal(listMyNFTSaleNow.length, 1);
    let listMinted = await marketplace.getMyMintedNfts.call({ from: address });
    assert.equal(listMinted.length, 1);
  });
  it("NFT2  no se ve en emitido ni emitido y todavia en venta desde cuenta 1 ", async () => {
    let address1 = accounts[1];
    let address2 = accounts[2];
    let marketplace = await MarketPersonalData.deployed();

    let listMyNFTSaleNow1 = await marketplace.getMyNftsForsaleNow.call({
      from: address1,
    });
    let listMyNFTSaleNow2 = await marketplace.getMyNftsForsaleNow.call({
      from: address2,
    });
    assert.notEqual(listMyNFTSaleNow1[0].tokenId, listMyNFTSaleNow2[0].tokenId);

    let listMinted1 = await marketplace.getMyMintedNfts.call({
      from: address1,
    });
    let listMinted2 = await marketplace.getMyMintedNfts.call({
      from: address2,
    });
    assert.notEqual(listMinted1[0].tokenId, listMinted2[0].tokenId);
  });
  it("NFT2 no esta en propiedad ni de cuenta 1 ni 2 pero si del marketPlace ", async () => {
    let address1 = accounts[1];
    let address2 = accounts[2];
    let marketplace = await MarketPersonalData.deployed();

    let listMyNfts1 = await marketplace.getMyNfts.call({ from: address1 });
    assert.equal(listMyNfts1.length, 0);
    let listMyNfts2 = await marketplace.getMyNfts.call({ from: address2 });
    assert.equal(listMyNfts2.length, 0);
    let listMyNftsMarket = await marketplace.getMyNfts.call({
      from: marketplace.address,
    });
    assert.equal(listMyNftsMarket.length, 2);
  });
});
