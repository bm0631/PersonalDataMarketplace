/* -------------------------------------------------------------------------- */
/*             Pruebas de re-listado/desecho de venta y re-compra             */
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
    console.log("Pruebas de relistado/ desechar datos");
    let marketplace = await MarketPersonalData.deployed();
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 0);
  });
  it("Emitir NFT1 con cuenta 1 y comprar con cuenta 2 y relistar ", async () => {
    console.log("Pruebas relistado con 1 NFT en el mercado ");
    let address1 = accounts[1];
    let address2 = accounts[2];
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let txn1 = await nfts.mint({ from: address1 });

    let idTokenBuy = txn1.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      idTokenBuy,
      1000000,
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
    await marketplace.buyNft(nfts.address, idTokenBuy, {
      value: listMyNFTSaleNow[0].price,
      from: address2,
    });

    let balanceAfter= parseInt(await web3.eth.getBalance(address1));
    assert(balanceAfter>=balanceBefore,"transferencia fallida");

    let listMyNftsAfterBuy = await marketplace.getMyNfts.call({
      from: address2,
    });
    assert.equal(listMyNftsAfterBuy[0].tokenId, idTokenBuy);

    await marketplace.reListNft(nfts.address, idTokenBuy, { from: address2 });

    let listMyNftsAfterRelist = await marketplace.getMyNfts.call({
      from: address2,
    });
    assert.equal(listMyNftsAfterRelist.length, 0);

    let listMarketNow = await marketplace.getMyNfts.call({
      from: marketplace.address,
    });
    assert.equal(listMarketNow.length, 1);
  });

  it("NFT1 comprado por cuenta 1 despues de haber sido relistado/ desechado", async () => {
    let marketplace = await MarketPersonalData.deployed();
    let nfts = await minterNFT.deployed();
    let address = accounts[1];
    
    let listMyNfts = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNfts.length, 0);
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    let idTokenBuy = listOnMarket[0].tokenId;
    let priceToken=listOnMarket[0].price;
   

    await marketplace.buyNft(nfts.address, idTokenBuy, { value: priceToken, from: address});
    let listMyNftsAfterBuy = await marketplace.getMyNfts.call({
      from: address,
    });
    assert.equal(listMyNftsAfterBuy.length, 1);
    assert.equal(listMyNftsAfterBuy[0].tokenId, idTokenBuy);
    
    let listOnMarketAfter = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarketAfter.length, 0);
  });   
  it("NFT2 emitido y compredo por cuenta 1 y relistado despues", async () => {
    console.log("Prueba relistado con varios NFTs");
    let address = accounts[1];
    let nfts = await minterNFT.deployed();
    let marketplace = await MarketPersonalData.deployed();

    let txn1 = await nfts.mint({ from: address });

    let tokenIdAux = txn1.logs[2].args[0].toNumber();
    await marketplace.add_NFT_to_Market(
      nfts.address,
      tokenIdAux,
      2,
      JSON.stringify(datos1),
      { from: address }
    );
    let listOnMarket = await marketplace.get_List_On_The_Market.call();
    assert.equal(listOnMarket.length, 1);
    let listMyNFTSaleNow = await marketplace.getMyNftsForsaleNow.call({
        from: address,
      });
      assert.equal(listMyNFTSaleNow.length, 1);

    await marketplace.buyNft(nfts.address, tokenIdAux, { value: listMyNFTSaleNow[0].price, from: address});
    let listMyNftsAfterBuy = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNftsAfterBuy[1].tokenId, tokenIdAux);
    assert.equal(listMyNftsAfterBuy.length, 2);

    await marketplace.reListNft(nfts.address, tokenIdAux, { from: address });
    
    let listMyNftsAfterRelist = await marketplace.getMyNfts.call({ from: address });
    assert.equal(listMyNftsAfterRelist.length, 1);

  });

});
