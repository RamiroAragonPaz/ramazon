import { ethers } from 'ethers'
import { useState } from 'react'
import {CONTRACT_ADDRESS, abi} from '../constants/index'

// Components
import Rating from './Rating'


const NewProduct = ({ getProviderOrSigner }) => {
    const [product, setProduct] = useState();
    const [stock, setStock] = useState(0);
    const [item, setItem] = useState({
        name: '',
        category: '',
        image: '',
        cost: '',
        rating: '',
        stock: ''
    })

    const tokens = (n) => {
        return ethers.utils.parseUnits(n.toString(), 'ether')
      }
      

    const getListed = async(product) => {
        const signer = await getProviderOrSigner(true);
        const ramazon = new ethers.Contract(
            CONTRACT_ADDRESS,
            abi,
            signer 
        )
        const listProduct  = await ramazon.list(
            product.name,
            product.category,
            `https://ipfs.io/ipfs/${product.image}`,
            tokens(product.cost),
            product.rating,
            product.stock
            );
        await listProduct.wait();
        console.log("listado");
    }


    const uploadProduct = (e) => {
        e.preventDefault();
        setProduct(item);
        console.log(product);
        product.stock = item.stock;
        console.log(item.stock)
        console.log("New Product: ",product);
        getListed(product);
    }

    const handleChange = (e) => {
        setItem({
            ...item,
            [e.target.name] : e.target.value
        });
        console.log(item);
    }


    return (
        <div className='cards__section'>
            <h3>Sell Your Product</h3>
            <hr />
            <div >
            <form onSubmit={uploadProduct}>
                <label>Name of your Product</label>
                <div>
                    <input type='text' className='nav__search'  required placeholder='MacBook Air' onChange={handleChange} name='name' value={item.name} ></input>
                </div>
                <label>Category of your Product</label>
                <div>
                <select className='nav__search' name='category' required value={item.category} onChange={handleChange}>
                    <option value="">Select a category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="toys">Toys</option>
                </select>
                </div>
                <label>IPFS direction of an image of Product</label>
                <div>
                    <input  type='text' className='nav__search' required placeholder='Qka3123rkafkasidwAf2' onChange={handleChange} name='image' value={item.image} ></input>
                </div>
                <label>Cost of your Product</label>
                <div>
                    <input type='number' className='nav__search'  required placeholder='0.2'  onChange={handleChange}name='cost' value={item.cost} ></input>
                </div>
                <label>Rate of your Product</label>
                <div>
                    <input type='text' className='nav__search'  required placeholder='5' onChange={handleChange} name='rating' value={item.rating} ></input>
                </div>
                <label>Stock of your Product</label>
                <div>
                    <input type='number' min='1' className='nav__search' required placeholder='5' onChange={handleChange} name='stock' value={item.stock} ></input>
                </div>
                <div className="connect__button">
                    <button type='submit' className='nav__connect'>Upload!</button>
                </div>
            </form>
            </div>
        </div>
    );
}

export default NewProduct; 