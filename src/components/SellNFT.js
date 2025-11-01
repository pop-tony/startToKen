
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import FractionalMarket from '../FractionalMarket.json';
//import { AppContent } from "../contex/TokenContext";

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '', totalSupply: '', dontApproveSell: false});
    const [fileURL, setFileURL] = useState(null);
    const [file, setFile] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    //const {listingPrice} = useContext(AppContent);

    function UploadFileDone(){
        if(!fileURL){
            alert("Pleace upload file image first")
            return
        }
       
        listNFT()
    }

    async function UploadFile(){

        try {
            const res = await uploadFileToIPFS(file);
            if(res.success){
                console.log("Image succefully uploaded to pinata:", res.pinataURL)
                setFileURL(res.pinataURL);
            }
        } catch (error) {
            console.log("Error during file upload",)
            alert("There was an issue, please try again")
            
        }
    }

    async function uploadMetadataToIPFS(){
        const {name, description, price, dontApproveSell, totalSupply} = formParams;
        console.log(fileURL)

        if(!name || !description || !price || !fileURL || !totalSupply){
            return;
        }

        const nftJSON = {
            name, description, price, image: fileURL, dontApproveSell, totalSupply
        };

        try {
            const res = await uploadJSONToIPFS(nftJSON);
            if(res.success){
                console.log("JSON uploaded to pinata: ", res.pinataURL);
                return res.pinataURL;
            }
            
        } catch (error) {
            console.log(error)
            alert("There was an issue, please try again")
        }
    }

    async function listNFT(){
        console.log("Please wait..... uploading(upto 5 mins)")

        try {
            const metaDataURL = await uploadMetadataToIPFS();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            updateMessage("Please wait..... uploading(upto 5 mins)");

            const contract = new ethers.Contract(FractionalMarket.address, FractionalMarket.abi, signer);

            const price = ethers.utils.parseUnits(formParams.price, 'ether');
            const { dontApproveSell } = formParams;
            const { totalSupply } = formParams;
            let listingPrice = await contract.getListPrice();
            listingPrice = listingPrice.toString();

            let transaction = await contract.createToken(metaDataURL, totalSupply, price, {value: listingPrice});
            await transaction.wait();
            
            alert("NFT sucessfully listed");
            updateMessage("");
            updateFormParams({name: '', description: '', price: '', totalSupply: ''});
            window.location.replace("/");
        }catch(error){
            alert("Upload unsucessful; There was an issue, please try again");
            updateMessage("");
            console.error(error);
        }
    }

    return (
        <div className="">
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
            <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                <div className="mb-4">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                    <input 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        type="number" 
                        placeholder="Min 0.01 ETH" 
                        min={0.01} 
                        step="0.01" 
                        value={formParams.price} 
                        onChange={e => {
                            const price = parseFloat(e.target.value);
                            if (!isNaN(price) && price >= 0.01) {
                            updateFormParams({...formParams, price: e.target.value})
                            }
                        }}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="totalSupply">Total Supply</label>
                    <input 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                        type="number" 
                        placeholder="Min 1" 
                        min={1}  
                        value={formParams.totalSupply} 
                        onChange={e => {
                            const totalSupply = parseFloat(e.target.value);
                            if (!isNaN(totalSupply) && totalSupply >= 1) {
                            updateFormParams({...formParams, totalSupply: e.target.value})
                            }
                        }}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="approveal">Don't allow contract approval</label>
                    <input 
                        className="" 
                        type="checkbox" 
                        checked={formParams.dontApproveSell} 
                        onChange={e =>{updateFormParams({...formParams, dontApproveSell: e.target.checked})}}
                    />
                </div>
                <div>
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                    <input type={"file"} onChange={(e)=>setFile(e.target.files[0])}></input>
                    <p className="mt-2 cursor-pointer hover:bg-blue-600 rounded-lg p-2 bg-blue-400 max-w-fit" onClick={UploadFile}>Upload Image</p>
                </div>
                <br></br>
                <div className="text-red-500 text-center">{message}</div>
                <button onClick={(e)=>{e.preventDefault(); UploadFileDone()}} className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg" id="list-button">
                    List NFT
                </button>
            </form>
        </div>
        </div>
    )
}