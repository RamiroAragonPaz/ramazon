import { useEffect } from "react";
import { Link } from "react-router-dom";


const Navigation = ({ accountSliced }) => {

    return (
        <nav>
            <div className='nav__brand'>
                <h1><Link to={`/`}>Ramazon</Link></h1>
            </div>
            <div className='nav__brand'>
            <h3>THE BEST PLACE TO BUY</h3>
            </div>
            {accountSliced ? (
                <button 
                type='button'
                className='nav__connect'
                >
                    <Link to={`/Dashboard`} className='nav__link'>
                    {accountSliced}
                    </Link>
                </button>
            ):(
                <button className='nav__connect'>
                    Not Connected
                </button>)
                }
            <ul className='nav__links'>
                <li><Link to={`/`}><a href="#Clothing&Jewelry">Clothing & Jewelry</a></Link></li>
                <li><Link to={`/`}><a href="#Electronics & Gadgets">Electronics & Gadgets</a></Link></li>
                <li><Link to={`/`}><a href="/#Toys & Gaming">Toys & Gaming</a></Link></li>
                <li><Link to={`/NewProduct`}>Sell Products</Link></li>
            </ul>

        </nav>
    );
}

export default Navigation;