import { useContext, useEffect, useState } from 'react';
import { AppContent } from '../contex/TokenContext';
import {useNavigate} from 'react-router-dom'

import NFTTile from "./NFTTile";

export default function Marketplace() {
    const navigate = useNavigate()

    const {data} = useContext(AppContent);
    const [slideIndex, setSlideIndex] = useState(0);

    const sampleData = [
        {
            "name": "NFT#1",
            "description": "Alchemy's First NFT",
            "website":"http://axieinfinity.io",
            "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
            "price":"0.03ETH",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
        },
        {
            "name": "NFT#2",
            "description": "Alchemy's Second NFT",
            "website":"http://axieinfinity.io",
            "image":"https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
            "price":"0.03ETH",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        },
        {
            "name": "NFT#3",
            "description": "Alchemy's Third NFT",
            "website":"http://axieinfinity.io",
            "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
            "price":"0.03ETH",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        },
    ];

    const prevSlide = () => {
        setSlideIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
    };

    const nextSlide = () => {
        setSlideIndex((prevIndex) => (prevIndex + 1) % data.length);
    };

    useEffect(() => {
    const intervalId = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [data]);

    return (
        <div className='mt-8'>
            <main id="main-content mb-25">
                <div className="w-120 h-fit flex">

                    {data.length ?
        
                        <div className='flex gap-20 overflow-hidden rounded-lg grid grid-cols-1 sm:grid-cols-2'>
                            <div className="p-4 bg-blue-400 rounded-lg">
                                <h2 className="sm:text-2xl text-sm font-bold mb-4">Featured Collections</h2>
                                
                                <div className="sm:mr-8 card-container overflow-hidden">
                                    {data.length && data.map((value, index) => (

                                        <div key={index} className={`cardf w-100 h-100 transition duration-1000 ease-in-out ${index === slideIndex ? 'opacity-100' : 'opacity-0 hidden'}`}>

                                            <NFTTile data={value} key={index} ></NFTTile>
                                            
                                        </div>
                                    ))}

                                </div>

                                <div className='flex gap-5 absolute top-1/2 mb-5'>
                                    <button className="relative ml-12 sm:ml-20 mr-7 sm:mr-20 cursor-pointer top-1/2 left-0 transform -translate-y-1/2 bg-black bg-opacity-90 text-white p-2 rounded-full" onClick={prevSlide}>&#10094;</button>
                                    <button className="relative sm:ml-20 ml-5 cursor-pointer top-1/2 right-0 transform -translate-y-1/2 bg-black bg-opacity-90 text-white p-2 rounded-full" onClick={nextSlide}>&#10095;</button>
                                </div>
                            </div>

                            <div className='ml-1 h-70 sm:h-70 sm:ml-20 bg-black bg-opacity-90 rounded-lg'>
                                <h2 className="text-white sm:text-2xl text-sm font-bold mb-4">Top selling</h2>
                                <div className='relative flex mt-15 marquee shadow-lg shadow-gray-400 rounded-lg overflow-hidden'>
                                    <div className="h-30 sm:h-90 relative flex animate-marquee gap-3">
                                        {data.map((value, index) => (
                                            
                                            <NFTTile data={value} key={index} ></NFTTile>
                                            
                                        ))}
                                        {data.map((value, index) => (
                                            
                                            <NFTTile data={value} key={index} ></NFTTile>
                                            
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    : ""}

                
                </div>
            </main>
            <div className="flex flex-col place-items-center mt-20">
                <div className="md:text-xl font-bold text-white">
                    All RFTs
                </div>
                <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                    {   data.length &&
                        data.map((value, index) => {
                            return <NFTTile data={value} key={index} ></NFTTile>;
                        })
                    }
                </div>
            </div>    
                    
        </div>
    );

}