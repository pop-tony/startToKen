import logo from '../main_logo_ransparent.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Link,} from "react-router-dom";
import { useContext } from 'react';
import { useLocation } from 'react-router';
import { AppContent } from '../contex/TokenContext';

function Navbar() {

  const {connected, currAddress} = useContext(AppContent);

  const location = useLocation();
  
  async function connectWebsite() {

    if(connected){
      return;
    }
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if(chainId !== '0xaa36a7')
      {
        //alert('Incorrect network! Switch your metamask network to Rinkeby');
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        })
      }  
      await window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(() => {
          window.location.replace(location.pathname)
      });
      
    } catch (error) {
      console.log(error)
      toast.error("There was an issue, make sure youre loggedin")
    }
  
  }

  return (
    <div className="">
      <ToastContainer />
      <nav className="w-screen">
        <ul className='flex items-end justify-between py-3 bg-transparent text-white pr-5'>
        <li className='flex items-end ml-5 pb-2'>
          <Link to="/">
          <img src={logo} alt="logo" width={120} height={120} className="inline-block -mt-2"/>
          <div className='inline-block font-bold text-xl ml-2'>
            RFT Marketplace
          </div>
          </Link>
        </li>
        <li className='w-2/6'>
          <ul className='lg:flex justify-between font-bold mr-10 text-lg'>
            {location.pathname === "/" ? 
            <li className='border-b-2 hover:pb-0 p-2 text-sm sm:text-lg'>
              <Link to="/">Marketplace</Link>
            </li>
            :
            <li className='hover:border-b-2 hover:pb-0 p-2 text-sm sm:text-lg'>
              <Link to="/">Marketplace</Link>
            </li>              
            }
            {location.pathname === "/sellNFT" ? 
            <li className='border-b-2 hover:pb-0 p-2 text-xs sm:text-lg'>
              <Link to="/sellNFT">List RFT</Link>
            </li>
            :
            <li className='hover:border-b-2 hover:pb-0 p-2 text-xs sm:text-lg'>
              <Link to="/sellNFT">List RFT</Link>
            </li>              
            }              
            {location.pathname === "/profile" ? 
            <li className='border-b-2 hover:pb-0 p-2 text-sm sm:text-lg'>
              <Link to="/profile">Profile</Link>
            </li>
            :
            <li className='hover:border-b-2 hover:pb-0 p-2 text-sm sm:text-lg'>
              <Link to="/profile">Profile</Link>
            </li>              
            }  
            <li>
              <button className={`enableEthereumButton ${connected ? 'bg-green-500 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded text-sm`} onClick={connectWebsite}>{connected? "Connected":"Connect Wallet"}</button>
            </li>
          </ul>
        </li>
        </ul>
      </nav>
      <div className='text-white text-bold text-right sm:mr-10 text-sm ml-10 rounded-lg shadow-lg bg-black bg-opacity-70 shadow-black w-fit p-2'>
        {currAddress !== "0x" ? "Connected to":"Not Connected. Please login to view NFTs"} {currAddress !== "0x" ? (currAddress.substring(0,15)+'...'):""}
      </div>
    </div>
  );
}

export default Navbar;