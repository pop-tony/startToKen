import { createContext, useState, useEffect, React } from "react";
import axios from 'axios';
import MarketplaceJSON from "../FractionalMarket.json";
import { GetIpfsUrlFromPinata } from "../utils";
import { useLocation } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AppContent = createContext()
export const AppContextProvider = (props)=>{

    const location = useLocation();

    const [data, updateData] = useState({});
    const [dataFetched, updateFetched] = useState(false);
    const [currAddress, updateAddress] = useState('0x');
    const [connected, toggleConnect] = useState(false);
    const [dataId, setDataId] = useState(0);
    
    getAddress();

    async function getAddress() {
        try{
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            if(addr){
                updateAddress(addr);
            }else{
                console.log('no add')
                toast.error("Issue with connecting... connect metamask again")
            }
        }catch(error){
            console.log(error)
            toast.error("Issue with connecting... connect metamask")
        }
        
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
           const fetchItem = async (i) => {
            try {
                const tokenURI = GetIpfsUrlFromPinata(await contract.uri(i.token_id));
                const meta = (await axios.get(tokenURI)).data;
                const holdersWithBance = await contract.getHoldersWithBalances(i.token_id);
                const hasAddr = holdersWithBance.find((_data) => _data.holder === currAddress);
                const has = hasAddr ? hasAddr.holding.toString() : null;

                return {
                price: ethers.utils.formatUnits(i.price.toString(), 'ether'),
                tokenId: i.token_id.toString(),
                creator: i.creator,
                holders: i.holders,
                totalSupply: i.total_supply.toString(),
                balance: i.balance.toString(),
                image: meta.image,
                name: meta.name,
                description: meta.description,
                onMarket: i.currentlyListed,
                holdersWithBances: holdersWithBance,
                has
                };
            } catch (error) {
                console.error(`Error fetching item ${i.token_id}:`, error);
                return null;
            }
            };

            const items = await Promise.all(transaction.map(fetchItem));
        
            updateData(items);  
            updateFetched(true);
            
        } catch (error) {
            console.error(error)
            toast.error("There was an issue getting tokens, are you loggedin?")
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
            toast.error("There was an issue, make sure you are loggedin")
        }
        
    },[currAddress, data])

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
