
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../FractionalMarket.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage (props) {

    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");
    const [supply, setSupply] = useState(1);
    const [buy, setBuy] = useState(1);

    const params = useParams();
    const tokenId = params.tokenId;

    async function getNFTData(tokenId) {
    
        try {
            const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            //Pull the deployed contract instance
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
            //create an NFT Token
            var tokenURI = await contract.uri(tokenId);
            const listedToken = await contract.getTokens(tokenId);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let item = {
                price: meta.price,
                tokenId: tokenId,
                creator: listedToken.creator,
                holders: listedToken.holders,
                totalSupply: listedToken.totalSupply,
                balance: listedToken.balance,
                image: meta.image,
                name: meta.name,
                description: meta.description,
                onMarket: listedToken.currentlyListed
            }
            console.log(item);
            updateData(item);
            updateDataFetched(true);
            console.log("address", addr)
            updateCurrAddress(addr);
        } catch (error) {
            console.error(error)
        }
    }

    async function buyNFT(_tokenId, _buy) {
        try {
            const ethers = require("ethers");
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            //Pull the deployed contract instance
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ((Number(data.price) * buy) + (Number(data.price) * 0.05))
            const salePriceInWei = ethers.utils.parseUnits(salePrice.toString(), 'ether')
            console.log(salePriceInWei.toString())
            updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
            //run the executeSale function
            let transaction = await contract.executeSale(_tokenId, _buy, {value:salePriceInWei, gasLimit: 200000});
            await transaction.wait();

            alert('You successfully bought the NFT!');
            updateMessage("");
        }
        catch(e) {
            alert("There was an issue, please try again")
            console.error("Upload Error"+e)
        }
    }

    async function putOnmart(_supply){

        if(!_supply){
            console.error("Enter a valid supply");
            alert("Enter a valid supply");
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
            alert("Token put on market successfully")
        } catch (error) {
            console.log(error)
        }
    }

    
    if(!dataFetched)
        getNFTData(tokenId);
    if(typeof data.image == "string")
        data.image = GetIpfsUrlFromPinata(data.image);

    return(
        <div className="min-height-100vh">
            
            <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5" />
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Creator: <span className="text-sm">{data.creator}</span>
                    </div>
                    <div>
                        Total Supply: <span className="text-sm">{data.totalSupply}</span>
                    </div>
                    <div>
                    { currAddress !== data.creator && !data.holders.includes(currAddress) ?
                        <div>
                            <form>
                                <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="totalSupply">Supply Market</label>
                                <input 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    type="number" 
                                    placeholder="Min 1" 
                                    min={1}  
                                    value={buy} 
                                    onChange={e => {
                                        const _buy = parseFloat(e.target.value);
                                        if (!isNaN(_buy) && _buy >= 1) {
                                        setBuy(e.target.value)
                                        }
                                    }}
                                />
                            
                                <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId, buy)}>Buy this Token</button>
                            </form>
                        </div>
                        : 
                        <div className="text-emerald-700">
                            <p>You are a holder of this NFT</p>
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
                                            setSupply(e.target.value)
                                            }
                                        }}
                                    />

                                    <button
                                        className={`mt-2 text-white rounded-lg max-w-fit cursor-pointer ${data.onMarket ? "hover:bg-green-600 bg-green-400": "hover:bg-blue-600 bg-blue-400"}  p-2`}
                                        onClick={()=>putOnmart(supply)}
                                        >
                                        {data.onMarket ? <p>token is in market add more ?</p> : <p>Put on market</p>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    }
                    
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}