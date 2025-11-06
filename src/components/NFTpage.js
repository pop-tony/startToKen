
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../FractionalMarket.json";
import { useState } from "react";
import { useContext, useEffect } from 'react';
import { AppContent } from '../contex/TokenContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NFTPage (props) {

    const {data, currAddress, dataId} = useContext(AppContent);

    const [message, updateMessage] = useState("");
    const [supply, setSupply] = useState(1);
    const [buy, setBuy] = useState(1);
    const [newPrice, setNewPrice] = useState(0);
    const [data1, setData1] = useState({})

    const params = useParams();
    const tokenId = params.tokenId;

    async function buyNFT(_tokenId, _buy) {
        try {
            const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            //Pull the deployed contract instance
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ((Number(data1.price) * buy) + (Number(data1.price) * 0.05))
            const salePriceInWei = ethers.utils.parseUnits(salePrice.toString(), 'ether')
            console.log(salePriceInWei.toString())
            updateMessage("Buying the RFT... Please Wait (Upto 5 mins)")
            //run the executeSale function
            let transaction = await contract.executeSale(_tokenId, _buy, {value:salePriceInWei, gasLimit: 2000000});
            await transaction.wait();

            toast.success('You successfully bought the RFT!');
            updateMessage("");
        }
        catch(e) {
            toast.error("There was an issue, please try again")
            console.error("Upload Error"+e)
        }
    }

    async function putOnmart(_supply){

        if(!_supply){
            console.error("Enter a valid supply");
            toast.error("Enter a valid supply");
            return;
        }
    
        const ethers = require("ethers");
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
        try {
            
            //put token on market
            const data = await contract.bringToMarket(tokenId, _supply);
            await data.wait();
            console.log("Token put on market successfully");
            toast.success("Token put on market successfully")
        } catch (error) {
            console.log(error)
            toast.error("An issue occured try again")
        }
    }

    async function updatPrice(_newPrice){
        if(!_newPrice){
            console.error("Enter a valid price");
            toast.error("Enter a valid price");
            return;
        }

        const ethers = require("ethers");
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
        try {

            const newPrice = ethers.utils.parseUnits(_newPrice, 'ether');
            
            //put token on market
            const data = await contract.updateTokenPrice(tokenId, newPrice);
            await data.wait();
            console.log("Token price updated successfully");
            toast.success("Token price updated successfully")
        } catch (error) {
            console.log(error)
            toast.error("An issue occured try again")
        }
    }

    useEffect(()=>{
        async function dataOne(){
            let theOne;
            for(let i = 0; i < data.length; i++){
                if(data[i].tokenId.toString() === dataId.toString()){
                    theOne = data[i];
                    break;
                }
            }

            setData1(theOne);
        }

        dataOne()
        console.log(data1);
        
    },[data1, data, dataId])

    return(
        <div className="min-height-100vh">
            <ToastContainer />
            <div className="flex ml-20 mt-20">
                {   data1 &&

                    <>
                        <img src={data1.image} alt="" className="w-2/5 rounded-lg" />
                        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                            <div>
                                Name: {data1.name}
                            </div>
                            <div>
                                Description: {data1.description}
                            </div>
                            <div>
                                Price: <span className="mb-5">{data1.price + " ETH"}</span>
                                {   currAddress === "0x2845058e29D1F7F5ec38A1DB186EF96b10bCbcCc" ?
                                    <div className="mb-6 mt-4">
                                        <p>Update RFT price</p>
                                        <form>
                                            <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">New Price (in ETH)</label>
                                            <input 
                                                className="mr-10 shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                                type="number" 
                                                placeholder="Min 0.01 ETH" 
                                                min={0.01} 
                                                step="0.01" 
                                                value={newPrice} 
                                                onChange={e => {
                                                    const _newPrice = parseFloat(e.target.value);
                                                    if (!isNaN(_newPrice) && _newPrice >= 0.01) {
                                                        setNewPrice(e.target.value)
                                                    }
                                                }}
                                            />
                                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={(e) => {
                                                e.preventDefault();
                                                updatPrice(newPrice);
                                            } }>
                                                Update Price
                                            </button>
                                        </form>
                                    </div> 
                                    :
                                    ""
                                }
                            </div>
                            <div>
                                Creator: <span className="text-sm">{data1.creator}</span>
                            </div>
                            <div>
                                Total Supply: <span className="text-sm">{data1.totalSupply}</span>
                            </div>
                            <div>
                                Holding: <span className="text-sm">{data1.has}</span>
                            </div>
                            <div>
                                {data1.creator &&
                                    !data1.holders.includes(currAddress) ?
                                    <div className="text-emerald-700">
                                        <p>You currently do not have any holdings</p>

                                        <form>
                                            <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="totalSupply">Purchase Token</label>
                                            <input
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                type="number"
                                                placeholder="Min 1"
                                                min={1}
                                                value={buy}
                                                onChange={e => {
                                                    const _buy = parseFloat(e.target.value);
                                                    if (!isNaN(_buy) && _buy >= 1) {
                                                        setBuy(e.target.value);
                                                    }
                                                } } />

                                            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={(e) => {
                                                e.preventDefault();
                                                buyNFT(tokenId, buy);
                                            } }>
                                                Buy this Token
                                            </button>
                                        </form>
                                    </div>
                                    :
                                    <div className="text-emerald-700">
                                        <p>You are a holder of this RFT</p>
                                        <div className="mb-6 mt-5">
                                            <form>
                                                <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="totalSupply">Supply Market</label>
                                                <input
                                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    type="number"
                                                    placeholder="Min 1"
                                                    min={1}
                                                    value={supply}
                                                    onChange={e => {
                                                        const _supply = parseFloat(e.target.value);
                                                        if (!isNaN(_supply) && _supply >= 1) {
                                                            setSupply(e.target.value);
                                                        }
                                                    } } />

                                                <button
                                                    className={`mt-2 text-white rounded-lg max-w-fit cursor-pointer ${data1.onMarket ? "hover:bg-green-600 bg-green-400" : "hover:bg-blue-600 bg-blue-400"}  p-2`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        putOnmart(supply);
                                                    } }
                                                >
                                                    {data1.onMarket ? <p>token is in market add more ?</p> : <p>Supply</p>}
                                                </button>
                                            </form>
                                            <form>
                                            <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="totalSupply">Purchase More</label>
                                            <input
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                type="number"
                                                placeholder="Min 1"
                                                min={1}
                                                value={buy}
                                                onChange={e => {
                                                    const _buy = parseFloat(e.target.value);
                                                    if (!isNaN(_buy) && _buy >= 1) {
                                                        setBuy(e.target.value);
                                                    }
                                                } } />

                                            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={(e) => {
                                                e.preventDefault();
                                                buyNFT(tokenId, buy);
                                            } }>
                                                Buy this Token
                                            </button>
                                        </form>
                                        </div>
                                    </div>
                                }

                                <div className="text-green text-center mt-3">{message}</div>
                            </div>
                        </div>
                    </>
                }
                
            </div>
        </div>
    )
}