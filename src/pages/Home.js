import { useEffect, useState, useRef } from 'react'
import { ethers, providers } from 'ethers';
import Web3Modal from "web3modal";

//Css
import '../App.css'

// Components
import Navigation from '../components/Navigation'
import Section from '../components/Section'
import Product from '../components/Product'
import NewProduct from '../components/NewProduct'

// ABIs
import {CONTRACT_ADDRESS, abi} from '../constants/index'

//Items
import items  from '../assets/items.json'

//Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';



function Home() {
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
    setItem(item);
    toggle ? setToggle(false) : setToggle(true);
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
      const tx = await ramazon.owner();
      setOwner(tx)
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

  const refill = async() => {
    const signer = await getProviderOrSigner(true);
    if (owner == account) {
      setIsOwner(true)
      const ramazon = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        signer 
      )
      const details  = await ramazon.items(3)
      console.log(details)
      const tx = await ramazon.setStock(6, 10);
      await tx.wait();
      console.log("seteado")
    }
  }
  const checkItems = async() => {
    const provider = await getProviderOrSigner();
    const ramazon = new ethers.Contract(
      CONTRACT_ADDRESS,
      abi,
      provider
    )
    const itemsList = await ramazon.items(12);
    console.log(itemsList);
  }

  const loadBlockchainData = async()=>{
    const provider = await getProviderOrSigner();
    const ramazon = new ethers.Contract(
      CONTRACT_ADDRESS,
      abi,
      provider
    )
      setRamazon(ramazon);
      const itemsListed = await ramazon.itemCount();
      const items = [];
      for(let i = 0; i<itemsListed; i++){
        const item = await ramazon.items(i+1);
        items.push(item)
      }
      const electronics = items.filter((item)=>item.category === 'electronics' || item.category === 'Electronics & Gadgets');
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

  useEffect(()=>{
    loadBlockchainData();
  },[item])


  return (
    <div>
        <h2>Welcome to Ramazon</h2>
        {walletConnected ? (
          <div>
          {electronics && clothing && toys && (
            <>
              <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop}/>
              <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop}/>
              <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop}/>
              {isOwner ? <button onClick={refill}>Refill</button> : ("")}
            </>
          )}
            {toggle && ( 
              <Product item={item} provider={provider} signer={signer} ramazon={ramazon} owner={owner} togglePop={togglePop}/>
            )}
        </div>
        ):(
          <div className='connect__section'>
            <h3>Please Connect Your Wallet</h3>
            <hr />
            <button onClick={connectWallet}  className='connect__button'>Connect</button>
          </div>
        )}
      </div>
  );
}

export default Home;
