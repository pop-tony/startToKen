import { createContext, useState, useEffect, React } from "react";
import axios from 'axios';
import MarketplaceJSON from "../FractionalMarket.json";
import { GetIpfsUrlFromPinata } from "../utils";
import { useLocation } from 'react-router';

export const AppContent = createContext()
export const AppContextProvider = (props)=>{

    const location = useLocation();

    const [data, updateData] = useState({});
    const [dataFetched, updateFetched] = useState(false);
    const [currAddress, updateAddress] = useState('0x');
    const [connected, toggleConnect] = useState(false);
    const [dataId, setDataId] = useState(0);

    async function getAddress() {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        updateAddress(addr);
    }

    async function getAllNFTs() {
        try {
          const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            //Pull the deployed contract instance
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
            //create an NFT Token
            let transaction = await contract.getAllTokens()
        
            //Fetch all the details of every NFT from the contract and display
            const items = await Promise.all(transaction.map(async i => {
                var tokenURI = await contract.uri(i.token_id);
                let holdersWithBance = await contract.getHoldersWithBalances(i.token_id);
                console.log("getting this tokenUri", tokenURI);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;
        
                let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                let totalSupply = i.total_supply.toString();
                let balance = i.balance.toString();
                let tokenId = i.token_id.toString();
                let has;
                for(let a = 0; a < holdersWithBance.length; a++){
                    const hasAddr = await holdersWithBance.find((holder) => holder[0] === currAddress);
                    if(hasAddr){
                        if(hasAddr.length)
                        has = hasAddr[1].toString();
                        break
                    }
                    
                }
                
                let item = {
                    price,
                    tokenId,
                    creator: i.creator,
                    holders: i.holders,
                    totalSupply,
                    balance,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                    onMarket: i.currentlyListed,
                    holdersWithBances: holdersWithBance,
                    has
                }
                return item;
            }))
        
            updateData(items);  
            updateFetched(true);
        } catch (error) {
            console.error(error)
            alert("There was an issue, please try again")
        }
    }

    useEffect(()=>{

        try {
            
            const func = async ()=>{
                const chk = await window.ethereum;
                if(chk === undefined){
                    return;
                }
        
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                const chk1 = accounts.length > 0;
        
                if(chk1){
                    toggleConnect(true);
                    getAddress();
                    window.ethereum.on('accountsChanged', function(accounts){
                    window.location.replace(location.pathname)
                    })
                }else{
                    toggleConnect(false);
                }
            }
            func()

            async function exe(){
                if(dataFetched){
                    return;
                }

                await getAllNFTs();
            }
            exe();
            if(typeof data.image == "string"){
                data.image = GetIpfsUrlFromPinata(data.image);
            }
            
        } catch (error) {
            console.log(error)
            alert("There was an issue, please try again")
        }
        
    })

    const value = {
        data, updateData,
        dataFetched, updateFetched,
        currAddress, updateAddress, getAddress,
        connected, toggleConnect,
        dataId, setDataId,
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}
