// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract FractionalToken is ERC1155, ERC1155Holder{

    using Counters for Counters.Counter;
    
    Counters.Counter private tokenID;
    
    Counters.Counter private _salesMade;
    
    address payable owner;
    
    uint256 listPrice = 0.01 ether;

    struct tokenHolders {
        address holder;
        uint256 holding;
    }

    struct tokens {
        uint token_id;
        address creator;
        uint256 price;
        uint balance;
        uint total_supply;
        address[] holders;
    }

    mapping (uint256 => uint256) public totalSupply;
    mapping(uint256 => tokenHolders[]) public holdersWithBalances;
    mapping(uint256 => tokens) public tokensCreated;
    mapping(address => tokens[]) public tokensOf;
    mapping(uint256 => string) public tokenURIs;

    // Event emitted when a new token is created
    event TokenCreated(uint256 tokenId, uint256 totalSupply);

    // Event emitted when a token is transferred
    event TokenTransferred(uint256 tokenId, address from, address to, uint256 amount);

    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price
    );

    event TokenListed(uint256 tokenId);

    constructor() ERC1155("FractionalTokenMarket") {
        owner = payable (msg.sender);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, ERC1155Receiver) returns (bool) {
        return ERC1155.supportsInterface(interfaceId) || ERC1155Receiver.supportsInterface(interfaceId);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        tokenURIs[tokenId] = _tokenURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return tokenURIs[tokenId];
    }

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getTokenTotalSupply(uint _tokenId) public view returns (uint256) {
        return totalSupply[_tokenId];
    }

    function getTokens(uint256 _id) public view returns (tokens memory){
        return tokensCreated[_id];
    }

    function getTokensOf(address _of) public view returns (tokens[] memory){
        return tokensOf[_of];
    }

    function getHoldersWithBalances(uint256 _id) public view returns (tokenHolders[] memory){
        return holdersWithBalances[_id];
    }

    function holdersWithBalUpdate(uint256 _tokenId, uint256 _supply) internal{
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == msg.sender) {
                holdersWithBalances[_tokenId][i].holding -= _supply;
               if(holdersWithBalances[_tokenId][i].holding == 0){
                    // Remove holder from tokensCreated[_tokenId].holders
                    uint256 holderIndex;
                    for (uint256 j = 0; j < tokensCreated[_tokenId].holders.length; j++) {
                        if (tokensCreated[_tokenId].holders[j] == holdersWithBalances[_tokenId][i].holder) {
                            holderIndex = j;
                            break;
                        }
                    }
                    tokensCreated[_tokenId].holders[holderIndex] = tokensCreated[_tokenId].holders[tokensCreated[_tokenId].holders.length - 1];
                    tokensCreated[_tokenId].holders.pop();

                    // Remove holder from holdersWithBalances
                    holdersWithBalances[_tokenId][i] = holdersWithBalances[_tokenId][holdersWithBalances[_tokenId].length - 1];
                    holdersWithBalances[_tokenId].pop();
                }
                break;
            }
        }
    }

    function updateBringMapp(uint256 _tokenId, uint256 _supply) internal{
        // Update tokensOf for msg.sender
        for (uint i = 0; i < tokensOf[msg.sender].length; i++) {
            if (tokensOf[msg.sender][i].token_id == _tokenId) {
                tokensOf[msg.sender][i].balance -= _supply;
                break;
            }
        }

        // Update tokensOf for _to
        bool tokenExists = false;
        for (uint i = 0; i < tokensOf[address(this)].length; i++) {
            if (tokensOf[address(this)][i].token_id == _tokenId) {
                tokensOf[address(this)][i].balance += _supply;
                tokenExists = true;
                break;
            }
        }

        if (tokenExists == false) {
            tokensOf[address(this)].push(tokens(
                _tokenId,
                tokensCreated[_tokenId].creator,
                tokensCreated[_tokenId].price,
                _supply,
                tokensCreated[_tokenId].total_supply,
                new address[](0)
            ));
        }

        // Update holdersWithBalances
        holdersWithBalUpdate(_tokenId, _supply);

        bool holderExists = false;
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == address(this)) {
                holdersWithBalances[_tokenId][i].holding += _supply;
                holderExists = true;
                break;
            }
        }

        if (holderExists == false) {
            holdersWithBalances[_tokenId].push(tokenHolders(
                address(this),
                _supply
            ));
        }

        // Update holders array
        bool holderAddressExists = false;
        for (uint i = 0; i < tokensCreated[_tokenId].holders.length; i++) {
            if (tokensCreated[_tokenId].holders[i] == address(this)) {
                holderAddressExists = true;
                break;
            }
        }

        if (holderAddressExists == false) {
            tokensCreated[_tokenId].holders.push(address(this));
        }
    }

    function updateSaleMapps(uint256 _tokenId, uint256 _amount) internal{
        // Update tokensOf for msg.sender
        for (uint i = 0; i < tokensOf[address(this)].length; i++) {
            if (tokensOf[address(this)][i].token_id == _tokenId) {
                tokensOf[address(this)][i].balance -= _amount;
                break;
            }
        }

        // Update tokensOf for _to
        bool tokenExists = false;
        for (uint i = 0; i < tokensOf[msg.sender].length; i++) {
            if (tokensOf[msg.sender][i].token_id == _tokenId) {
                tokensOf[msg.sender][i].balance += _amount;
                tokenExists = true;
                break;
            }
        }

        if (tokenExists == false) {
            tokensOf[msg.sender].push(tokens(
                _tokenId,
                tokensCreated[_tokenId].creator,
                tokensCreated[_tokenId].price,
                _amount,
                tokensCreated[_tokenId].total_supply,
                new address[](0)
            ));
        }

        // Update holdersWithBalances
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == address(this)) {
                holdersWithBalances[_tokenId][i].holding -= _amount;
                break;
            }
        }

        bool holderExists = false;
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == msg.sender) {
                holdersWithBalances[_tokenId][i].holding += _amount;
                holderExists = true;
                break;
            }
        }

        if (holderExists == false) {
            holdersWithBalances[_tokenId].push(tokenHolders(
                msg.sender,
                _amount
            ));
        }

        // Update holders array
        bool holderAddressExists = false;
        for (uint i = 0; i < tokensCreated[_tokenId].holders.length; i++) {
            if (tokensCreated[_tokenId].holders[i] == msg.sender) {
                holderAddressExists = true;
                break;
            }
        }

        if (holderAddressExists == false) {
            tokensCreated[_tokenId].holders.push(msg.sender);
        }
    }

    // Function to create a new fractional token
    function createToken(string memory tokenURI, uint256 _totalSupply, uint256 _price) public payable returns(uint256){
        require(_totalSupply > 0, "Total supply must be greater than 0");
        require(msg.value == listPrice, "Send the correct price");
        require(_price >= 10000000000000000, "Price should be more than 0.009 eth");

        uint256 _tokenId = tokenID.current();
        address[] memory _holders = new address[](1);

        totalSupply[_tokenId] = _totalSupply;
        _mint(msg.sender, _tokenId, _totalSupply, "");

        payable(owner).transfer(listPrice);

        holdersWithBalances[_tokenId].push(tokenHolders(
            msg.sender,
            _totalSupply
        ));

        _holders[0] = msg.sender;

        tokensCreated[_tokenId] = tokens(
            _tokenId,
            msg.sender,
            _price,
            _totalSupply,
            _totalSupply,
            _holders
        );

        tokensOf[msg.sender].push(tokens(
            _tokenId,
            msg.sender,
            _price,
            _totalSupply,
            _totalSupply,
            _holders
        ));

        emit TokenCreated(_tokenId, _totalSupply);
        uint256 newTokenId = tokenID.current();
        _setTokenURI(newTokenId, tokenURI);
        tokenID.increment();
        

        return newTokenId;
    }

    // Function to transfer fractions of a token
    function transferFraction(uint256 _tokenId, address _to, uint256 _amount) public payable {
        require(msg.sender != _to, "Cannot send to this address ");
        require(balanceOf(msg.sender, _tokenId) >= _amount, "Insufficient balance");

        safeTransferFrom(msg.sender, _to, _tokenId, _amount, "");

        // Update tokensOf for msg.sender
        for (uint i = 0; i < tokensOf[msg.sender].length; i++) {
            if (tokensOf[msg.sender][i].token_id == _tokenId) {
                tokensOf[msg.sender][i].balance -= _amount;
                break;
            }
        }

        // Update tokensOf for _to
        bool tokenExists = false;
        for (uint i = 0; i < tokensOf[_to].length; i++) {
            if (tokensOf[_to][i].token_id == _tokenId) {
                tokensOf[_to][i].balance += _amount;
                tokenExists = true;
                break;
            }
        }

        if (tokenExists == false) {
            tokensOf[_to].push(tokens(
                _tokenId,
                tokensCreated[_tokenId].creator,
                tokensCreated[_tokenId].price,
                _amount,
                tokensCreated[_tokenId].total_supply,
                new address[](0)
            ));
        }

        // Update holdersWithBalances
        holdersWithBalUpdate(_tokenId, _amount);

        bool holderExists = false;
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == _to) {
                holdersWithBalances[_tokenId][i].holding += _amount;
                holderExists = true;
                break;
            }
        }

        if (holderExists == false) {
            holdersWithBalances[_tokenId].push(tokenHolders(
                _to,
                _amount
            ));
        }

        // Update holders array
        bool holderAddressExists = false;
        for (uint i = 0; i < tokensCreated[_tokenId].holders.length; i++) {
            if (tokensCreated[_tokenId].holders[i] == _to) {
                holderAddressExists = true;
                break;
            }
        }

        if (holderAddressExists == false) {
            tokensCreated[_tokenId].holders.push(_to);
        }

        emit TokenTransferred(_tokenId, msg.sender, _to, _amount);
    }

    function getAllTokens() public view returns (tokens[] memory) {
        uint nftCount = tokenID.current();
        tokens[] memory _tokens = new tokens[](nftCount);
        
        for (uint i = 0; i < nftCount; i++) {
            _tokens[i] = tokensCreated[i];
        }

        return _tokens;
    }

    function executeSale(uint256 _tokenId, uint256 _amount) public payable {
        IERC1155(address(this)).setApprovalForAll(msg.sender, true);
        require(balanceOf(address(this), _tokenId) >= _amount, "Insufficient balance");
        uint price = tokensCreated[_tokenId].price;
        require(msg.value >= (price * _amount), "Please submit the asking price in order to complete the purchase");

        //Actually transfer the token to the new owner
        safeTransferFrom(address(this), msg.sender, _tokenId, _amount, "");

        _salesMade.increment();

        payable(owner).transfer(msg.value);

        // update the token's status
        updateSaleMapps(_tokenId, _amount);
    }

    function bringToMarket(uint256 _tokenId, uint256 _supply) public payable {
        require(balanceOf(msg.sender, _tokenId) >= _supply, "Insufficient balance");
        // transfer token back to contract
        safeTransferFrom(msg.sender, address(this), _tokenId, _supply, "");

        // update the token's status
        updateBringMapp(_tokenId, _supply);

        // emit an event
        emit TokenListed(_tokenId);
    }
}