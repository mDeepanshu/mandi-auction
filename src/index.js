import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Home from "./features/home/Home";
import AuctionTransaction from "./features/auction-transaction/Auction-Transaction";
import ItemMaster from "./features/item-master/Item-Master";
import PartyMaster from "./features/party-master/Party-Master";
import VasuliTransaction from "./features/vasuli-transaction/Vasuli-Transaction";
import AllEntries from "./features/all-entries/all-entries";
import PendingVasuli from "./features/pending-vasuli/pending-vasuli";

import * as serviceWorkerRegistration from './serviceWorkerRegistration';


import { RouterProvider, createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
				element: <AuctionTransaction />
			},
			{
				path: 'auction-transaction',
				element: <AuctionTransaction />
			},
			{
				path: 'item-master',
				element: <ItemMaster />
			},
			{
				path: 'party-master',
				element: <PartyMaster />
			},
			{
				path: 'vasuli-transaction',
				element: <VasuliTransaction />
			},
			{
				path: 'all-entries',
				element: <AllEntries />
			},
			{
				path: 'pending-vasuli',
				element: <PendingVasuli />
			},
		],
		// errorElement: <Error />
	}
])
// Import the functions you need from the SDKs you need


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);

serviceWorkerRegistration.register();
