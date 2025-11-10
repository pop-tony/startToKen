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

    constructor() ERC1155("FractionalToken") {
        owner = payable (msg.sender);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, ERC1155Reciever) returns (bool) {
        return ERC1155.supportsInterface(interfaceId) || ERC1155Reciever.supportsInterface(interfaceId);
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

    function updateTokenPrice(uint256 _tokenId, uint256 _tokenPrice) public payable {
        require(owner == msg.sender, "Only owner can update price");
        tokensCreated[_tokenId].price = _tokenPrice;
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

    function getHoldersWithBalances(uint256 _id) public view returns (tokenHolders[] memory){
        return holdersWithBalances[_id];
    }

    // Update holdersWithBalances
    function holdersWithBalUpdate(uint256 _tokenId, uint256 _supply) internal {
        _removeZeroBalanceHolders(_tokenId, msg.sender, _supply);
    }

    // Remove holders with zero balance
    function _removeZeroBalanceHolders(uint256 _tokenId, address _holder, uint256 _supply) internal {
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == _holder) {
                holdersWithBalances[_tokenId][i].holding -= _supply;
                if (holdersWithBalances[_tokenId][i].holding == 0) {
                    _removeHolder(_tokenId, i);
                }
                break;
            }
        }
    }

    // Remove holder from holdersWithBalances and tokensCreated[_tokenId].holders
    function _removeHolder(uint256 _tokenId, uint256 _index) internal {
        uint256 holderIndex;
        for (uint256 j = 0; j < tokensCreated[_tokenId].holders.length; j++) {
            if (tokensCreated[_tokenId].holders[j] == holdersWithBalances[_tokenId][_index].holder) {
                holderIndex = j;
                break;
            }
        }
        tokensCreated[_tokenId].holders[holderIndex] = tokensCreated[_tokenId].holders[tokensCreated[_tokenId].holders.length - 1];
        tokensCreated[_tokenId].holders.pop();
        holdersWithBalances[_tokenId][_index] = holdersWithBalances[_tokenId][holdersWithBalances[_tokenId].length - 1];
        holdersWithBalances[_tokenId].pop();
    }

    // Update tokensOf and holdersWithBalances when bringing a token to market
    function updateBringMapp(uint256 _tokenId, uint256 _supply) internal {
        _updateTokensOf(address(this), _tokenId, _supply);
        holdersWithBalUpdate(_tokenId, _supply);
        _addHolder(_tokenId, address(this), _supply);
    }

    // Update tokensOf and holdersWithBalances when a sale is made
    function updateSaleMapps(uint256 _tokenId, uint256 _amount) internal {
        _updateTokensOf(msg.sender, _tokenId, _amount);
        updateHoldersWithBalances(_tokenId, address(this), _amount);
        _addHolder(_tokenId, msg.sender, _amount);
    }

    // Update holdersWithBalances
    function updateHoldersWithBalances(uint256 _tokenId, address _holder, uint256 _amount) internal {
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == _holder) {
                holdersWithBalances[_tokenId][i].holding -= _amount;
                break;
            }
        }
    }

    // Add holder to holdersWithBalances and tokensCreated[_tokenId].holders
    function _addHolder(uint256 _tokenId, address _holder, uint256 _amount) internal {
        bool holderExists = false;
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == _holder) {
                holdersWithBalances[_tokenId][i].holding += _amount;
                holderExists = true;
                break;
            }
        }
        if (holderExists == false) {
            holdersWithBalances[_tokenId].push(tokenHolders(_holder, _amount));
            _addHolderToTokensCreated(_tokenId, _holder);
        }
    }

    // Add holder to tokensCreated[_tokenId].holders
    function _addHolderToTokensCreated(uint256 _tokenId, address _holder) internal {
        bool holderAddressExists = false;
        for (uint i = 0; i < tokensCreated[_tokenId].holders.length; i++) {
            if (tokensCreated[_tokenId].holders[i] == _holder) {
                holderAddressExists = true;
                break;
            }
        }
        if (holderAddressExists == false) {
            tokensCreated[_tokenId].holders.push(_holder);
        }
    }

    // Function to create a new fractional token
    // Create a new token
    function createToken(string memory tokenURI, uint256 _totalSupply, uint256 _price) public payable returns(uint256){
        require(_totalSupply > 0, "Total supply must be greater than 0");
        //require(msg.value == listPrice, "Send the correct price");
        require(_price > 0.009 ether, "Price should be more than 0.009 eth");

        uint256 _tokenId = tokenID.current();
        _mintToken(_tokenId, _totalSupply);
        _updateTokenData(_tokenId, tokenURI, _totalSupply, _price);
        _transferListPrice();
        emit TokenCreated(_tokenId, _totalSupply);
        return _tokenId;
    }

    // Mint a new token
    function _mintToken(uint256 _tokenId, uint256 _totalSupply) internal {
        address[] memory _holders = new address[](1);
        _holders[0] = msg.sender;
        _mint(msg.sender, _tokenId, _totalSupply, "");
        totalSupply[_tokenId] = _totalSupply;
        holdersWithBalances[_tokenId].push(tokenHolders(msg.sender, _totalSupply));
    }

    // Update token data
    function _updateTokenData(uint256 _tokenId, string memory tokenURI, uint256 _totalSupply, uint256 _price) internal {
        address[] memory _holders = new address[](1);
        _holders[0] = msg.sender;
        tokensCreated[_tokenId] = tokens(_tokenId, msg.sender, _price, _totalSupply, _totalSupply, _holders);
        _setTokenURI(_tokenId, tokenURI);
        tokenID.increment();
    }

    // Transfer list price to owner
    function _transferListPrice() internal {
        //payable(owner).transfer(listPrice);
    }

    // Transfer fractions of a token
    function transferFraction(uint256 _tokenId, address _to, uint256 _amount) public payable {
        require(msg.sender != _to, "Cannot send to this address");
        require(balanceOf(msg.sender, _tokenId) >= _amount, "Insufficient balance");
        //uint256 requiredPayment = _calculateRequiredPayment(_tokenId, _amount);
        //require(msg.value >= requiredPayment, "Please submit the asking price in order to complete the purchase");
        _transferTokens(_tokenId, _to, _amount);
        //_transferPayment(requiredPayment);
        _updateTokenHolders(_tokenId, _to, _amount);
        emit TokenTransferred(_tokenId, msg.sender, _to, _amount);
    }

    // Calculate required payment
    function _calculateRequiredPayment(uint256 _tokenId, uint256 _amount) internal view returns (uint256) {
        return ((tokensCreated[_tokenId].price * _amount * 5) / 100) + (tokensCreated[_tokenId].price * _amount);
    }

    // Transfer tokens
    function _transferTokens(uint256 _tokenId, address _to, uint256 _amount) internal {
        safeTransferFrom(msg.sender, _to, _tokenId, _amount, "");
    }

    // Transfer payment to owner
    function _transferPayment(uint256 requiredPayment) internal {
        payable(owner).transfer(requiredPayment);
    }

    // Update token holders
    function _updateTokenHolders(uint256 _tokenId, address _to, uint256 _amount) internal {
        _updateTokensOf(msg.sender, _tokenId, _amount);
        _updateTokensOf(_to, _tokenId, _amount);
        holdersWithBalUpdate(_tokenId, _amount);
        _updateHoldersWithBalances(_tokenId, _to, _amount);
        _updateHoldersArray(_tokenId, _to);
    }

    // Update tokensOf
    function _updateTokensOf(address _account, uint256 _tokenId, uint256 _amount) internal {
        for (uint i = 0; i < tokensOf[_account].length; i++) {
            if (tokensOf[_account][i].token_id == _tokenId) {
                if (_account == msg.sender) {
                    tokensOf[_account][i].balance -= _amount;
                } else {
                    tokensOf[_account][i].balance += _amount;
                }
                break;
            }
        }
    }

    // Update holdersWithBalances
    function _updateHoldersWithBalances(uint256 _tokenId, address _to, uint256 _amount) internal {
        bool holderExists = false;
        for (uint i = 0; i < holdersWithBalances[_tokenId].length; i++) {
            if (holdersWithBalances[_tokenId][i].holder == _to) {
                holdersWithBalances[_tokenId][i].holding += _amount;
                holderExists = true;
                break;
            }
        }
        if (holderExists == false) {
            holdersWithBalances[_tokenId].push(tokenHolders(_to, _amount));
        }
    }

    // Update holders array
    function _updateHoldersArray(uint256 _tokenId, address _to) internal {
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
    }

    // Get the price of a token
    function getTokenPrice(uint256 _tokenId) internal view returns (uint256) {
        return tokensCreated[_tokenId].price;
    }

    // Get the creator of a token
    function getTokenCreator(uint256 _tokenId) internal view returns (address) {
        return tokensCreated[_tokenId].creator;
    }

    // Check if a token is available for sale
    function isTokenAvailable(uint256 _tokenId, uint256 _amount) internal view returns (bool) {
        return balanceOf(address(this), _tokenId) >= _amount;
    }

    // Transfer a token to a buyer
    function transferToken(uint256 _tokenId, address _buyer, uint256 _amount) internal {
        safeTransferFrom(address(this), _buyer, _tokenId, _amount, "");
    }

    // Transfer funds to the creator of a token
    function transferFunds(uint256 _tokenId, uint256 _amount) internal {
        address creator = getTokenCreator(_tokenId);
        uint256 price = getTokenPrice(_tokenId);
        uint256 totalCost = price * _amount;
        payable(creator).transfer(totalCost);
    }

    // Update the token's status
    function updateTokenStatus(uint256 _tokenId, uint256 _amount) internal {
        updateSaleMapps(_tokenId, _amount);
    }

    // Bring a token to the market
    function bringTokenToMarket(uint256 _tokenId, uint256 _supply) internal {
        safeTransferFrom(msg.sender, address(this), _tokenId, _supply, "");
        updateBringMapp(_tokenId, _supply);
        emit TokenListed(_tokenId);
    }

    // Get all tokens
    function getAllTokens() public view returns (tokens[] memory) {
        uint nftCount = tokenID.current();
        tokens[] memory _tokens = new tokens[](nftCount);
        for (uint i = 0; i < nftCount; i++) {
            _tokens[i] = tokensCreated[i];
        }
        return _tokens;
    }

    // Execute a sale
    function executeSale(uint256 _tokenId, uint256 _amount) public payable {
        IERC1155(address(this)).setApprovalForAll(msg.sender, true);
        require(isTokenAvailable(_tokenId, _amount), "Insufficient balance");
        //uint256 price = getTokenPrice(_tokenId);
        //uint256 totalCost = price * _amount;
        //require(msg.value > totalCost, "Please submit the asking price in order to complete the purchase");
        transferToken(_tokenId, msg.sender, _amount);
        _salesMade.increment();
        //transferFunds(_tokenId, _amount);
        
        // payable(owner).transfer(msg.value - totalCost);
       
        updateTokenStatus(_tokenId, _amount);
    }

    // Bring a token to the market
    function bringToMarket(uint256 _tokenId, uint256 _supply) public payable {
        require(balanceOf(msg.sender, _tokenId) >= _supply, "Insufficient balance");
        bringTokenToMarket(_tokenId, _supply);
    }
}