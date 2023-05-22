import { useEffect, useState, useRef } from 'react'
import { ethers, providers } from 'ethers';
import Web3Modal from "web3modal";

//Css
import './App.css'

//Pages
import Home from './pages/Home'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'
import NewProduct from './components/NewProduct'
import Dashboard from './components/Dashboard'

// ABIs
import {CONTRACT_ADDRESS, abi} from './constants/index.js'

//Items
import items  from './assets/items.json'

//Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';



function App() {
  const [ramazon, setRamazon] =  useState(null);
  const [electronics, setElectronics] = useState(null);
  const [clothing, setClothing] = useState(null);
  const [toys, setToys] = useState(null);
  const [item, setItem] = useState({});
  const [toggle, setToggle] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(false);
  const [accountSliced, setAccountSliced] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const web3ModalRef = useRef();
 
  const togglePop = (item) => {
    console.log(item.toString())
    setItem(item);
    toggle ? setToggle(false) : setToggle(true) 
  }

  const connectWallet = async() => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true); 
      renderButton();
      loadBlockchainData();
      const provider = await getProviderOrSigner();
      const ramazon = new ethers.Contract(
      CONTRACT_ADDRESS,
      abi,
      provider
    );
      setOwner(await ramazon.owner())
    } catch (error) {
      console.log(error);
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    if (needSigner) {
        const signer = web3Provider.getSigner();
        setSigner(signer);
        return signer;
      }
      setProvider(web3Provider);
      return web3Provider;
  }


  const renderButton = async() => {
    const signer = await getProviderOrSigner(true)  
    const address = await signer.getAddress();
    const accounted = address.slice(0,6)+'...'+address.slice(38,42)
    setAccountSliced(accounted);
    setAccount(true);
  }


  const loadBlockchainData = async()=>{
    const provider = await getProviderOrSigner();
    const ramazon = new ethers.Contract(
      CONTRACT_ADDRESS,
      abi,
      provider
    )
      setRamazon(ramazon);
      const items = [];
      for(let i = 0; i<9; i++){
        const item = await ramazon.items(i+1);
        items.push(item)
      }
      const electronics = items.filter((item)=>item.category === 'electronics');
      const clothing = items.filter((item)=>item.category === 'clothing');
      const toys = items.filter((item)=>item.category === 'toys');
      setElectronics(electronics);
      setClothing(clothing);
      setToys(toys);
  }
 
  useEffect(()=>{
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
            network: "mumbai",
            providerOptions: {},
            disableInjectedProvider: false,
        });
    }
    connectWallet();
  },[walletConnected])


  return (
    <div>
      <BrowserRouter>
        <Navigation accountSliced={accountSliced}/>
        <Routes>
        <Route path="*" element={<Home />} />
         <Route path='/Dashboard' element={<Dashboard getProviderOrSigner={getProviderOrSigner} toggle={toggle} togglePop={togglePop} />}/>
         <Route path='/ramazon' element={<Home />}/>
         <Route path='/NewProduct' element={<NewProduct getProviderOrSigner={getProviderOrSigner}/>}/>
        </Routes>
        </BrowserRouter> 
      </div>
  );
}
export default App;
