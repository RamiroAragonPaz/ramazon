import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Rating from './Rating'

import close from '../assets/close.svg'

const Product = ({ item, provider, signer, ramazon, owner, togglePop }) => {
  const {id, name, category, image, cost, rating, stock } = item
  const [order, setOrder] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const [buyer, setBuyer] = useState(null);
  const [stocker, setStocker] = useState(null);
  const [profit, setProfit] = useState(null);

  const fetchDetails = async() => {
    const account = await signer.getAddress();
    const latestBlock = await provider.getBlockNumber();
    const events = await ramazon.queryFilter("Buy", latestBlock - 1000, latestBlock);
    const orders = events.filter((event)=>event.args.buyer == account && event.args.itemId == id.toString())
    if(orders.length === 0) return;
    const lastOrder = orders.length;
    const order =  await ramazon.orders(account, orders[lastOrder-1].args.orderId);
    setOrder(order);
    setBuyer(orders[0].args.buyer)
    }

    const fetchSell = async() => {
      const account = await signer.getAddress();
      const latestBlock = await provider.getBlockNumber();
      const events = await ramazon.queryFilter("Sell", latestBlock - 1000, latestBlock);
      const sells = events.filter((event)=>event.args.seller == account && event.args.itemId == id.toString())
      if(sells.length === 0) return;
      const profitMade = (ethers.utils.formatEther((sells[0].args.profit)/1000));
      setProfit(profitMade);
      setBuyer(sells[0].args.buyer);
    
    }

  const buyHandler = async() => {
    const signer = await provider.getSigner();
    const transaction = await ramazon.connect(signer).buy(item.id, {value: item.cost})
    await transaction.wait()
    setHasBought(true)
    const newStock = await ramazon.items(item.id)
    setStocker(newStock.stock.toString())
  }

  const fetchStock = async() => {
    const fetch = await ramazon.items(item.id);
    const fetchInNumber = fetch.stock.toString();
    setStocker(fetchInNumber);
  }

  
  

  useEffect(()=>{
    fetchStock();
    fetchDetails();
    fetchSell();
    setHasBought(false);
  },[hasBought])
  
  return (
    <div className="product">
      <div className='product__details'>
        <div className='product__image'>
          <img src={item.image} alt={item.image}/>
        </div>
        <div className='product__overview'>
          <h1>{item.name}</h1>
          <Rating value={item.rating}/>
          <hr />
          <p>{item.address}</p>
          <h2>{ethers.utils.formatUnits(item.cost.toString(), 'ether')} MATIC</h2>
          <hr />
          <h2>Overview</h2>
          <p>
            {item.description}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nec nisi nec diam mollis hendrerit. Praesent egestas posuere ex, nec blandit ex dapibus posuere. 
          </p>
        </div>
        <div className='product__order'>
            <h1>{ethers.utils.formatUnits(item.cost.toString(), 'ether')} MATIC</h1>
            <p>
              Free Delivery <br />
              <strong>
                {new Date(Date.now()+345600000).toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}  
              </strong>
              </p>
              {stocker && stocker > 0 ? (
                <div>
                  <p>{stocker.toString()} In Stock</p>
                  <button className='product__buy' onClick={buyHandler}>
                    Buy Now
                  </button>
                </div>
              ):(
                <div>
                  <p>Out of Stock</p>
                  <button className='product__buy'>
                    Can't Buy
                  </button>
                </div>
              )}
              
              <p><small>Ships from</small> Ramazon</p>
              <p><small>Sold by</small> {item.seller == owner ? "Ramazon" : item.seller.slice(0,6)+'...'+item.seller.slice(38,42)}</p>
              {order && order.length > 0 ? (
                <div className='product__bought'>
                  Item bought on <br />
                  <strong>
                    {new Date(Number(order.time.toString()+'000')).toLocaleDateString(undefined, {weekday: 'long', hour: 'numeric', minute: 'numeric', second: 'numeric'})}
                  </strong><br />
                  by {buyer.slice(0,6)+'...'+buyer.slice(38,42)}
                </div>
                ):(<></>)}
                { item.seller == owner && profit ? (
                  <div className='product__bought'>
                  Profit <br />
                  <strong>
                    {profit}
                  </strong><br />
                  bougth by {buyer.slice(0,6)+'...'+buyer.slice(38,42)}
                </div>
                ):(
                  <>
                  </>
                )}
              
        </div>
        <button onClick={togglePop} className='product__close'>
          <img src={close} alt={close}/>
        </button>
      </div>
    </div >
  );
}

export default Product;