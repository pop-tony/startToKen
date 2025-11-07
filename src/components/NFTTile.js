
import {
    Link,
  } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";
import { useContext } from "react";
import { AppContent } from "../contex/TokenContext";

function NFTTile (data, key) {

    const {setDataId} = useContext(AppContent)

    const newTo = {
        pathname:"/nftPage/"+data.data.tokenId
    }

    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

    function setSetDataId(_id){
        setDataId(_id)
    }

    return (
        <Link to={newTo}>
        <div className="sm:border-2 ml-3 sm:ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 sm:shadow-2xl"
        onClick={()=>setSetDataId(data.data.tokenId)}>
            <img src={IPFSUrl} alt="" className="w-72 h-25 sm:h-80 rounded-full sm:rounded-lg object-cover" />
            <div className= "text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                <strong className="sm:text-xl text-sm">{data.data.name}</strong>
                <p className="text-xs display-inline">
                    {data.data.description}
                </p>
            </div>
        </div>
        </Link>
    )
}

export default NFTTile;
