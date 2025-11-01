
import { useParams } from 'react-router-dom';
import { useContext, useState, useEffect } from "react";
import NFTTile from "./NFTTile";
import { AppContent } from '../contex/TokenContext';

export default function Profile () {

    const {data, currAddress} = useContext(AppContent);
    
    const [totalPrice, updateTotalPrice] = useState("0");
    const [data1, setData1] = useState([]);
    const [tokenHold, setTokenHold] = useState([]);

    const params = useParams();
    const tokenId = params.tokenId;

    useEffect(()=>{
        let token_hold_price = 0;
        let holdingsFor = 0;
        async function dataOne(){
            let theOnesFor = [];
            for(let i = 0; i < data.length; i++){
                if(data[i].holders.includes(currAddress)){
                    theOnesFor.push(data[i]);
                }
            }
            for (let b = 0; b < theOnesFor.length; b++) {
                holdingsFor += Number(theOnesFor[b].has);
            }

            setData1(theOnesFor);

        }

        dataOne()
        
        let totalSum;
        for(let j = 0; j < data1.length; j++){
            token_hold_price += Number(data1[j].price);
        }

        totalSum = holdingsFor * token_hold_price;
    
        updateTotalPrice(totalSum.toPrecision(3));
        
    },[data, currAddress])

    return (
        <div className="profileClass min-height-100vh">
            <div className="profileClass">
            <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                <div className="mb-5">
                    <h2 className="font-bold">Wallet Address</h2>  
                    {currAddress}
                </div>
            </div>
            <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data1.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {isNaN(totalPrice) ? 0.00 : totalPrice} ETH
                    </div>
            </div>
            <div className="flex flex-col text-center items-center mt-11 text-white">
                <h2 className="font-bold">Your NFTs</h2>
                <div className="flex justify-center flex-wrap max-w-screen-xl">
                    {data1.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                    })}
                </div>
                <div className="mt-10 text-xl">
                    {data1.length === 0 ? "Oops, No NFT data to display (Log in and make some purchase!)":""}
                </div>
            </div>
            </div>
        </div>
    )
};