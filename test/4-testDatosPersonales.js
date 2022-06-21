/* -------------------------------------------------------------------------- */
/*   Prueba de integridad de datos, al realizar emision, compra y relistado   */
/* -------------------------------------------------------------------------- */
var minterNFT = artifacts.require("minterNFT");
var MarketPersonalData = artifacts.require("MarketPersonalData");

contract("MarketPersonalData", (accounts) => {
  let _pesonalData1 = {
    name: "Ivan",
    lastnames: "Pulido",
    age: 25,
    gender: 0,
  };
  let _home_Adrees1 = {
    city: "Madrid",
    country: "Spain",
    floor: "C/ mayor",
    street: "12",
  };
  let _contactData1 = {
    email: "algo@dasd.com",
    phoneNumber: "9652364",
  };
  let _professional_Career1 = {
    possition: "Super boss",
    salary: 2000,
    studies: "Bach",
  };
  let _Data_Of_Commercial_Interest1 = {
    list_Hobbiets: "Walking",
    numberOfChilds: 0,
    professional_Career: _professional_Career1,
  };
  let datos1 = {
    personalData: _pesonalData1,
    home_Adrees: _home_Adrees1,
    contactData: _contactData1,
    Data_Of_Commercial_Interest: _Data_Of_Commercial_Interest1,
  };


  let _pesonalData2 = {
    name: "Laura",
    lastnames: "Diaz Ramos",
    age: 51,
    gender: 2,
  };
  let _home_Adrees2 = {
    city: "Paris",
    country: "Francia",
    floor: "C/ grande",
    street: "10",
  };
  let _contactData2 = {
    email: "laura@hola.com",
    phoneNumber: "111111111",
  };
  let _professional_Career2 = {
    possition: "Only Boss",
    salary: 0,
    studies: "ESO",
  };
  let _Data_Of_Commercial_Interest2 = {
    list_Hobbiets: "Dancing",
    numberOfChilds: 3,
    professional_Career: _professional_Career2,
  };
  let datos2 = {
    personalData: _pesonalData2,
    home_Adrees: _home_Adrees2,
    contactData: _contactData2,
    Data_Of_Commercial_Interest: _Data_Of_Commercial_Interest2,
  };
  it("Mercado vacio", async () => {
    console.log("Pruebas de consistencia en los datos personales");
    let marketplace = await MarketPersonalData.deployed();
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 0);
  });
  it("Emitir,listar y comprobar datos correctos NFT1 con cuenta 1 y NFT2 con cuenta 2 ", async () => {
    let address1 = accounts[1];
    let address2 = accounts[2];
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let txn1 = await nfts.mint({ from: address1 });

    let tokenId1 = txn1.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      tokenId1,
      1000000,
      JSON.stringify(datos1),
      { from: address1 }
    );
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 1);
    assert.equal(listOnMarket[0].dataNft,  JSON.stringify(datos1));

    let txn2 = await nfts.mint({ from: address2 });

    let tokenId2 = txn2.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      tokenId2,
      2000000,
      JSON.stringify(datos2),
      { from: address2 }
    );
    let listOnMarket2 = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket2.length, 2);
    assert.equal(listOnMarket2[1].dataNft,  JSON.stringify(datos2));

    let listMinted1= await marketplace.getMyMintedNfts.call({ from: address1 });
    assert.equal(listMinted1[0].dataNft,JSON.stringify(datos1));
    let listMinted2=await marketplace.getMyMintedNfts.call({ from: address2 });
    assert.equal(listMinted2[0].dataNft,JSON.stringify(datos2));;

  });
  it("Comprar NFT1 y NFT2 con cuenta 1 y datos correctos ", async () => {

    let address = accounts[1];
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 2);

    let listMyNfts = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNfts.length, 0);
    
    

    await marketplace.buyNft(nfts.address, listOnMarket[0].tokenId, { value: listOnMarket[0].price, from: address});

    
    let listMyNftsAfterBuy1 = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNftsAfterBuy1[0].tokenId, listOnMarket[0].tokenId);
    assert.equal(listMyNftsAfterBuy1.length, 1);

    let balanceBefore= parseInt(await web3.eth.getBalance(accounts[2]));
    await marketplace.buyNft(nfts.address, listOnMarket[1].tokenId, { value: listOnMarket[1].price, from: address});
    let balanceAfter= parseInt(await web3.eth.getBalance(accounts[2]));
    assert(balanceAfter>=balanceBefore,"transferencia fallida");
    
    let listMyNftsAfterBuy2 = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNftsAfterBuy2[1].tokenId, listOnMarket[1].tokenId);
    assert.equal(listMyNftsAfterBuy2.length, 2);

    assert.equal(listMyNftsAfterBuy2[0].dataNft,  JSON.stringify(datos1));
    
    assert.equal(listMyNftsAfterBuy2[1].dataNft,  JSON.stringify(datos2));


  });
  it("Relistar NFT1 y NFT2 con cuenta 1 y datos correctos ", async () => {

    let address = accounts[1];
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 0);

    let listMyNfts = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNfts.length, 2);

    await marketplace.reListNft(nfts.address, listMyNfts[0].tokenId, { from: address });
    let listMyNftsAfterreList1 = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNftsAfterreList1.length, 1);

    await marketplace.reListNft(nfts.address, listMyNftsAfterreList1[0].tokenId, { from: address });
    let listMyNftsAfterreList2 = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNftsAfterreList2.length, 0);

    let listOnMarketAfterRelist = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarketAfterRelist.length, 2);
    assert.equal(listOnMarketAfterRelist[0].dataNft,  JSON.stringify(datos1));
    
    assert.equal(listOnMarketAfterRelist[1].dataNft,  JSON.stringify(datos2));


  });

});
