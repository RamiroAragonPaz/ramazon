import { useEffect, useState } from "react"
import {CONTRACT_ADDRESS, abi} from '../constants/index'
import { ethers } from 'ethers'

const Dashboard = ({ getProviderOrSigner }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [signer, setSigner] = useState(null)
    const [stockSeted, setStockSeted] = useState(false);
    const [newStock, setNewStock] = useState({
        stock: '',
        id: ''
    })
    

    const handleStock = (e) => {
        setNewStock({
            [e.target.name] : e.target.value
        });
        console.log(newStock);
    }


    const uploadProduct = async(e) => {
        e.preventDefault();
        console.log(e.target.id)
        const id = e.target.id;
        newStock.id = id;
        setNewStock({
            [e.target.name] : e.target.value
        })
        const signer = await getProviderOrSigner(true);
        const ramazon = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        signer 
        )
        const tx = await ramazon.setStock(newStock.id, newStock.stock);
        await tx.wait();
        const resetValue = document.getElementById(`${e.target.id}`).elements["stock"];
        console.log(resetValue);
        resetValue.value = "";
        console.log("seteado")
        setStockSeted(true);
    }

    const productsOnSell = async() => {
        const signer = await getProviderOrSigner(true);
        setSigner(signer);
        const ramazon = new ethers.Contract(
            CONTRACT_ADDRESS,
            abi,
            signer
        );
        const address = await signer.getAddress();
        const itemsListed = await ramazon.itemCount();
        const items = [];
        for(let i = 0; i<itemsListed; i++){
            const item = await ramazon.items(i+1);
            items.push(item)
        }
        setLoading(true);
        const owned = items.filter((item)=>item.seller == address);
        setProducts(owned);
        setLoading(false);
    }

    useEffect(()=>{
        productsOnSell();
        setStockSeted(false);
    },[stockSeted])


    return (
        <div className='cards__section'>
            <h3>Your Products On Sell</h3>
            {loading ? (""):(
                <div>
                    <hr />
                    {products.length < 0 ? (
                    <div>
                        <p>You have no items for sell</p>
                    </div>
                    ):(
                    <div>
                        {products.map((product, index)=>(
                            <div key={index}>
                                <hr />
                                <div>
                                    <div className="dashboard__line">
                                        <img  src={product.image} alt={product.image} />
                                        <div className="dashboard__text">
                                            <div>
                                                <h4>{product.name}</h4>
                                            </div>
                                            <div>
                                                <p>{ethers.utils.formatUnits(product.cost.toString(), 'ether')} MATIC</p>
                                            </div>
                                        </div>
                                        <div className="dashboard__text">
                                            <p>Stock: {product.stock.toString()}</p>
                                        </div>
                                        <div>
                                            {product.stock.toString() == 0 && (
                                            <div>
                                            <form id={product.id} onSubmit={uploadProduct}>
                                            <input  type='number' required className='nav__search' name='stock' onChange={handleStock} ></input>
                                            <button type='submit' className='dashboard__text nav__connect'>Add Stock</button>
                                            </form>
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            )}
        </div>
    )
}
export default Dashboard