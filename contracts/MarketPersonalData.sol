// SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


/* -------------------------------------------------------------------------- */
/*                             MarketPersonalData                             */
/* -------------------------------------------------------------------------- */
/* ----------------- Contrato de mercado de datos personales ---------------- */
/**
    Mercado que guarda los NFT emitidos en minterNFT y añade los datos personales a cada uno.
    Hereda de ReentrancyGuard para usar nonReentrant, para evitar llamadas anidadas/simultaneas.
    Atributos:
        Counter _nftsSold: número de NFTS en venta
        Counter _numberOfNtfs: número total de NFTS en el mercado
        mapping(uint256 => NFT) listOfAllNfts: mapa que guarda cada idToken a su NFT con datos
    
    Struct: 
        Representacion de los datos que tiene el NFT
        NFT:
            address nftContract: address del minterNFT
            uint256 tokenId: id del token 
            address payable seller: address del vendedor, no varia ya que el vendedor simpre es el emisor del nft
            address payable owner:  addres del propietario actual del NFT
            uint256 price: precio que establecio el vendedor/minter que no varia.
            bool listed: boolean que dice si se cuentra en venta actualmente o no 
            
            string dataNft: cadena de texto en formato JSON que guarda los datos personales 
                    
                    Contiene:
                        personalData: 
                            name
                            lastnames
                            age
                            gender
                        home_Adrees:
                            city
                            country
                            floor
                            street
                        contactData:
                            email
                            phoneNumber
                        Data_Of_Commercial_Interest: 
                            list_Hobbiets
                            numberOfChilds
                            professional_Career:
                                possition
                                salary
                                studies
    
    Eventos:
        NFTListed: Se emite cuando un NFT se añade al mercado
        NFTSold: Se emite cuando un NFT ha sido vendido
    
     Metodos: 
        add_NFT_to_Market(address _nftContract,uint256 _tokenId, uint256 _price,string memory _data)
        buyNft(address _nftContract, uint256 _tokenId)
        reListNft(address _nftContract, uint256 _tokenId)
        get_List_On_The_Market() public view returns (NFT[] memory)
        getMyNfts() public view returns (NFT[] memory)
        getMyMintedNfts() public view returns (NFT[] memory)
        getMyMintedNfts() public view returns (NFT[] memory)

*/

contract MarketPersonalData is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _nftsSold;
    Counters.Counter private _numberOfNtfs;

    mapping(uint256 => NFT) private listOfAllNfts;
    struct NFT {
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool listed;
        string dataNft;
    }
    event NFTListed(
        address nftContract,
        uint256 tokenId,
        address seller,
        address owner,
        uint256 price
    );
    event NFTSold(
        address nftContract,
        uint256 tokenId,
        address seller,
        address owner,
        uint256 price
    );

    constructor() {}

    /** 
    add_NFT_to_Market:
        Añade un NFT recien emitido al mercado

        @param  _nftContract: address de minterNFT
        @param  _tokenId : id del nuevo NFT
        @param  _price: precio del nuevo NFT
        @param  _data: datos personales en formato string JSON con la estructura citada antes
        
        Requisitos:
            que el precio de venta sea mayor a 1 wei
            Que el minter del NFT sea quien lo liste/añadir al mercado
     */

    function add_NFT_to_Market(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price,
        string memory _data
    ) public payable nonReentrant {
        require(_price > 0, "El precio de venta debe ser mayor a 1 wei");
        require(
            (IERC721(_nftContract).ownerOf(_tokenId)) == msg.sender,
            "Solo el emisor puede listar sus NFTs"
        );

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        _numberOfNtfs.increment();

        listOfAllNfts[_tokenId] = NFT({
            nftContract: _nftContract,
            tokenId: _tokenId,
            seller: payable(msg.sender),
            owner: payable(address(this)),
            price: _price,
            listed: true,
            dataNft: _data
        });

        emit NFTListed(
            _nftContract,
            _tokenId,
            msg.sender,
            address(this),
            _price
        );
    }

    /**
    buyNft:
        Vende el NFT solicitado a que llame al metodo (msg.sender), y realiza una trasferencia al emisor de los datos(seller)

        @param _nftContract: address de minterNFT
        @param _tokenId: id del token que se va a vender

        Requisitos:
            Que el eth ofrecido sea superior o igual al precio de compra del NFT
     */

    function buyNft(address _nftContract, uint256 _tokenId)
        public
        payable
        nonReentrant
    {
        NFT storage nft_to_Buy = listOfAllNfts[_tokenId];
        require(
            msg.value >= nft_to_Buy.price,
            string(
                abi.encodePacked(
                    "No has aportado suficiente eth, precio: ",
                    nft_to_Buy.price
                )
            )
        );

        address payable buyer = payable(msg.sender);
        payable(nft_to_Buy.seller).transfer(msg.value);

        nft_to_Buy.owner = buyer;
        nft_to_Buy.listed = false;

        _nftsSold.increment();
        emit NFTSold(
            _nftContract,
            nft_to_Buy.tokenId,
            nft_to_Buy.seller,
            buyer,
            nft_to_Buy.price
        );
    }

    /**
    reListNft:
        Metodo que devuelve el NFT al mercado para que lo compre otra persona

        @param _nftContract: address de minterNFT
        @param _tokenId: id del token que se va a poner otra vez en venta
     */

    function reListNft(address _nftContract, uint256 _tokenId)
        public
        payable
        //uint256 _price
        nonReentrant
    {
        NFT storage nft_to_reList = listOfAllNfts[_tokenId];

        nft_to_reList.owner = payable(address(this));
        nft_to_reList.listed = true;

        _nftsSold.decrement();
        emit NFTListed(
            _nftContract,
            _tokenId,
            msg.sender,
            address(this),
            nft_to_reList.price
        );
    }

    /**
    get_List_On_The_Market:
        Metodo que devuelve  una lista de todos los NFTs que se encuentran a la venta actualmente en el mercado.
        @return {NFT[] memory}: Retorna una lista de NFTs
     */
    function get_List_On_The_Market() public view returns (NFT[] memory) {
        uint256 lengthNFTs = _numberOfNtfs.current();

        NFT[] memory ListOnMarket = new NFT[](lengthNFTs - _nftsSold.current());
        uint256 jList = 0;
        for (uint256 i = 0; i < lengthNFTs; i++) {
            if (listOfAllNfts[i + 1].listed) {
                ListOnMarket[jList] = listOfAllNfts[i + 1];
                jList++;
            }
        }
        return ListOnMarket;
    }

    /**
        getMyNfts:
            Metodo que devuelve  una lista de todos los NFTs que tiene en su propiedad del solicitante(msg.sender) del metodo
            @return {NFT[] memory}: Retorna una lista de NFTs
    */

    function getMyNfts() public view returns (NFT[] memory) {
        uint256 lengthNFTs = _numberOfNtfs.current();
        uint256 lengthMyNft = 0;
        for (uint256 i = 0; i < lengthNFTs; i++) {
            if (listOfAllNfts[i + 1].owner == msg.sender) {
                lengthMyNft++;
            }
        }

        NFT[] memory myNfts = new NFT[](lengthMyNft);
        uint256 jList = 0;
        for (uint256 i = 0; i < lengthNFTs; i++) {
            if (listOfAllNfts[i + 1].owner == msg.sender) {
                myNfts[jList] = listOfAllNfts[i + 1];
                jList++;
            }
        }
        return myNfts;
    }

    /**
    getMyMintedNfts:
        Metodo que devuelve  una lista de todos los NFTs que ha emito el solicitante(msg.sender) del metodo
        @return {NFT[] memory}: Retorna una lista de NFTs
     */

    function getMyMintedNfts() public view returns (NFT[] memory) {
        uint256 lengthNFTs = _numberOfNtfs.current();
        uint256 lengthMysale = 0;
        for (uint256 i = 0; i < lengthNFTs; i++) {
            if (listOfAllNfts[i + 1].seller == msg.sender) {
                lengthMysale++;
            }
        }

        NFT[] memory mySale = new NFT[](lengthMysale);
        uint256 jList = 0;
        for (uint256 i = 0; i < lengthNFTs; i++) {
            if (listOfAllNfts[i + 1].seller == msg.sender) {
                mySale[jList] = listOfAllNfts[i + 1];
                jList++;
            }
        }
        return mySale;
    }

    /**
    getMyMintedNfts:
        Metodo que devuelve una lista de todos los NFTs que siguen a la venta del solicitante(msg.sender) del metodo
        @return {NFT[] memory}: Retorna una lista de NFTs
     */

    function getMyNftsForsaleNow() public view returns (NFT[] memory) {
        uint256 lengthNFTs = _numberOfNtfs.current();
        uint256 lengthMysale = 0;
        for (uint256 i = 0; i < lengthNFTs; i++) {
            if (
                listOfAllNfts[i + 1].seller == msg.sender &&
                listOfAllNfts[i + 1].listed
            ) {
                lengthMysale++;
            }
        }

        NFT[] memory mySale = new NFT[](lengthMysale);
        uint256 jList = 0;
        for (uint256 i = 0; i < lengthNFTs; i++) {
            if (
                listOfAllNfts[i + 1].seller == msg.sender &&
                listOfAllNfts[i + 1].listed
            ) {
                mySale[jList] = listOfAllNfts[i + 1];
                jList++;
            }
        }
        return mySale;
    }
}
