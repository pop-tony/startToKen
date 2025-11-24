import { createContext, useState, useEffect, React } from "react";
import axios from 'axios';
import MarketplaceJSON from "../FractionalMarket.json";
import { GetIpfsUrlFromPinata } from "../utils";
import { useLocation } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import Mdata from "../components/Data.js"
import 'react-toastify/dist/ReactToastify.css';

export const AppContent = createContext()

export const AppContextProvider = (props)=>{

    const location = useLocation();
    const backendUrl = "http://localhost:5000";

    const [data, updateData] = useState({});
    const [dataFetched, updateFetched] = useState(false);
    const [currAddress, updateAddress] = useState('0x');
    const [connected, toggleConnect] = useState(false);
    const [dataId, setDataId] = useState(0);
    const [MadeData, setMadeData] = useState(Mdata);

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

    //I call to get price info and create entry in DB
    async function fetchAndSaveTokenPrice(_tokenId) {
        try {
            const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            //Pull the deployed contract instance
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
          
            const response = await contract.getTokens(_tokenId);

            const tokenPrice = response.price;
            const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');

            const priceData = {
            date: currentDate.toString(),
            price: Number(ethers.utils.formatUnits(tokenPrice.toString(), 'ether')),
            forId: _tokenId,
            };

            // Save the price data to database
            await cretaePrice(priceData);
            
            console.log(`Saved token price for ${_tokenId} on ${currentDate}: $${tokenPrice}`);
            return priceData;
        } catch (error) {
            console.error(`Error fetching or saving token price: ${error}`);
        }
    }

    const cretaePrice = async (_priceData) => {

        const price = _priceData.price;
        const date = _priceData.date;
        const forId = _priceData.forId;

        try {
            const {data} = await axios.post(backendUrl + "/api/price/create-price", {date, price, forId})

            if(data.success){
                console.log(data)
                toast.success("price Created")
            }else{
                console.log(data.message);
                toast.error("Could not create price...try again")
            };

        } catch (error) {
            console.log(error.message)
            toast.error("Could not create price... try again")
        }
    }
    //done

    //User calls to set data for selected token and create graph
    const getPriceData = async (_tokenId)=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/price/data', {params: { _tokenId: _tokenId }})
            if(data.success){ 
                return data.prices
            }else{
                console.log(data.message) 
                toast.error("Could not get data...try again")
            }
        } catch (error) {
            console.log(error.message)
            toast.error("Could not get data...try again")
        }

    }


    function aggregatePriceData(prices, interval) {
        const aggregatedPrices = {};
    
        prices.forEach((price) => {
            const timestamp = new Date(price.date).getTime();
            const intervalStart = Math.floor(timestamp / interval) * interval;
            if (!aggregatedPrices[intervalStart]) {
            aggregatedPrices[intervalStart] = {
                date: new Date(intervalStart).toISOString(),
                open: price.price,
                high: price.price,
                low: price.price,
                close: price.price,
                volume: 594858493,
            };
            } else {
            aggregatedPrices[intervalStart].high = Math.max(aggregatedPrices[intervalStart].high, price.price);
            aggregatedPrices[intervalStart].low = Math.min(aggregatedPrices[intervalStart].low, price.price);
            aggregatedPrices[intervalStart].close = price.price;
            }
        });

        const setData = Object.values(aggregatedPrices).sort((a, b) => new Date(a.date) - new Date(b.date));

        return setData

    }

    async function startChart(_cid){
        //api to get prices
        try {
            const pric = [];
            const prices = await getPriceData(_cid);
            if(prices.length){
                for(let i=0; i < prices.length-1; i++){
                    let { price, date } = prices[i];
                    let pricess = { date: new Date(date).toDateString(), price };
                    pric.push(pricess);
                    
                }
            }
            
            const interval = 2 * 60 * 1000; // 2 minutes
            const aggregatedPrices = aggregatePriceData(pric, interval);

            setMadeData(aggregatedPrices);
            
        } catch (error) {
            console.log(error)
        }
    }
    //Done


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
        fetchAndSaveTokenPrice, startChart, MadeData,
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}
