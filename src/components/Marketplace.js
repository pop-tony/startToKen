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

    const handleAddToCart = async (productAdd)=>{
    
        try {

        } catch (error) {
            console.log(error.message)
        }
    }
    

    useEffect(() => {
    const intervalId = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [data]);

    return (
        <div className='mt-8'>
            <main id="main-content mb-25">
                <div className="w-fit h-fit relative flex grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4">

                    {data.length ?
                    <>
                        <div className=''>
                        <section id="featured-section" className="featured-section z-10 mr-30 ml-5 mb-15 w-fit h-fit rounded-xl">
                            <h2 className="text-2xl font-bold mb-4">Featured Collections</h2>
                            <div className="w-60 sm:w-fit h-fit relative shadow-lg shadow-gray-400 flex">
                                <div className="card-container flex overflow-hidden">
                                    {data.length && data.map((value, index) => (

                                        <div key={index} className={`cardf w-100 h-100 transition duration-1000 ease-in-out ${index === slideIndex ? 'opacity-100' : 'opacity-0 hidden'}`}>

                                            <div className="absolute">

                                                <NFTTile data={value} key={index} ></NFTTile>
                                                <button className="absolute cursor-pointer top-1/2 left-12 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full" onClick={prevSlide}>&#10094;</button>
                                                <button className="absolute cursor-pointer top-1/2 right-0 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full" onClick={nextSlide}>&#10095;</button>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                                
                            </div>

                        </section>
                        </div>
                        <div className='shadow-lg shadow-gray-400 ml-60 rounded-lg'>
                            <h2 className="text-2xl font-bold mb-4">Top Selling</h2>
                            <div className="w-fit shadow-lg shadow-gray-700 card-container h-90 bg-transparent flex gap-4 overflow-hidden rounded-xl">
                            <div className="w-50 border marquee overflow-hidden">
                                <div className="flex items-wrapper gap-3">
                                {data.map((value, index) => (
                                    <div
                                        key={index}
                                        className="card bg-white rounded-lg shadow-md transition duration-300 hover:opacity-100 hover:scale-110 hover:z-10 hover:shadow-lg shadow-gray-700"
                                    >
                                        <NFTTile data={value} key={index} ></NFTTile>

                                    </div>
                                    

                                ))}
                                </div>
                                </div>
                            
                            </div>
                        </div>
                    </>
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