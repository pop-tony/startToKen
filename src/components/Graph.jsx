
import { useParams } from 'react-router-dom';
import { useContext, useState, useEffect } from "react";
import { AppContent } from '../contex/TokenContext';
import ChartJS from './Chart';
import { RealTimeChart } from './RealTimeChart';

export default function Profile () {

    const {data, MadeData, startChart} = useContext(AppContent);
    const [selected, setSelected] = useState({});
    const [buy, setBuy] = useState(0);
    const [sell, setSell] = useState(0);
    const [tokenId, setTokenId] = useState(0);
    const [chartsToDisplay, setChartsToDisplay] = useState([]);


    useEffect(() => {

    }, []);

    const params = useParams();

    function sellRFT(id, amount){

    }

    function buyRFT(id, amount){
        
    }

    useEffect(()=>{

        
        
    },[data])

    return (
        <div>
            <div className="p-3 ml-2 mt-5 border w-fit h-fit flex gap-10 sm:gap-20">
                <div className="border p-4 w-auto">
                    <p className="border">profit-...........</p>
                    <p className="border">loss-.............</p>
                </div>

                <div className="border w-auto">
                    <RealTimeChart mdata={MadeData} key={MadeData.length} />
                </div>

                <div className="border overflow-auto w-auto p-2" style={{ height: "12rem" }}>
                    <div className="text-center p-4 h-100 w-full">
                        {data.length ? (
                        data.map(v => (
                            <p key={v.tokenId} className="border cursor-pointer"
                            onClick={async () => {
                                setSelected(v);
                                setTokenId(v.tokenId);
                                await startChart(v.tokenId);
                                console.log(MadeData)
                            }}>
                            {v.name}
                            </p>
                        ))
                        ) : "No data available"}
                    </div>
                </div>
                
            </div>

            <div className="border mt-7 p-5 flex gap-5">
                <form>
                    <div>
                        <input
                            className="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                    </div>

                    <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={(e) => {
                        e.preventDefault();
                        buyRFT(tokenId, buy);
                    } }>
                        Buy
                    </button>
                </form>

                <form>
                    <div>
                        <input
                            className="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="number"
                            placeholder="Min 1"
                            min={1}
                            value={sell}
                            onChange={e => {
                                const _sell = parseFloat(e.target.value);
                                if (!isNaN(_sell) && _sell >= 1) {
                                    setSell(e.target.value);
                                }
                            } } />
                    </div>

                    <button
                        className="enableEthereumButton bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                        onClick={async (e) => {
                            e.preventDefault();
                            sellRFT(tokenId, sell);
                        } }
                    >
                     Sell
                    </button>
                </form>
            </div>
        </div>
    )
};