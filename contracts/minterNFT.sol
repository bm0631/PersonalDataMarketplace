// SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/* -------------------------------------------------------------------------- */
/*                                  minterNFT                                 */
/* -------------------------------------------------------------------------- */
/* ---------------------- Contrato de emisor de tokens ---------------------- */
/**
    minterNFT hereda de ERC721 para usar metodos _safeMint(acuñar token) setApprovalForAll(dar permisos para cambiar de propietarios el token)

    Atributos:
      Counters.Counter _tokenIds: contador que asigna los id a los nuevos tokens
      address marketplaceContract: address del mercado  que va a gestionar los NFTs emitidos 

    Eventos
      NFTMinted(uint256): evento que incluye el id del nuevo token
    Metodos:
      constructor(address _marketplaceContract) ERC721("PersonalDNFT", "PD"): metodo de instancia del contrato
      mint(): metodo que emite un nuevo nft
   */

contract minterNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address marketplaceContract;
    event NFTMinted(uint256);

    /**
    constructor
      Como el contrato hereda de ERC721 debe llamarse a su constructor (super() en otros lenguajes)
      @param _marketplaceContract: address del mercado que va a manejar los NFTs 
   */

    constructor(address _marketplaceContract) ERC721("PersonalDNFT", "PD") {
        marketplaceContract = _marketplaceContract;
    }

    /**
    mint:
      Metodo que emite nuevos NFTs, usa _safeMint y setApprovalForAll metodos de ERC721 explicados en la descripcion del contrato.

    */

    function mint() public {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        setApprovalForAll(marketplaceContract, true);

        emit NFTMinted(newTokenId);
    }
}
