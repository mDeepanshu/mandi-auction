import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav>
            <ul>
                <li><Link to="">Home</Link></li>
                <li><Link to="auction-transaction">Auction Transaction</Link></li>
                <li><Link to="item-master">Item Master</Link></li>
                <li><Link to="party-master">Party Master</Link></li>
                <li><Link to="vasuli-transaction">Vasuli Transaction</Link></li>
            </ul>
        </nav>
    );
}

export default NavBar;
