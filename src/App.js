import './App.css';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import SellNFT from './components/SellNFT';
import NFTPage from './components/NFTpage';
import Navbar from './components/Navbar.js';
import {
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <>
      <Navbar></Navbar>
      <div className="container">
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/sellNFT" element={<SellNFT />} />
          <Route path="/nftPage/:tokenId" element={<NFTPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
