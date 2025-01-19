import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@mui/material";
import styles from "./ongoing_auctions.module.css";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

function OnGoingAuctions({ open, onClose }) {
    const [table, setTable] = useState();
    const [selectedRadio, setSelectedRadio] = useState(null);

    const handleRadioChange = (index) => {
        setSelectedRadio(index);
    };
    useEffect(() => {
        const onGoingAuctionData = JSON.parse(localStorage.getItem("onGoingAuction"));
        if (onGoingAuctionData) {
            const globalArray = [].concat(...Object.values(onGoingAuctionData));
            setTable(globalArray);
        }
    }, [])

    const auctionSelected = (oldAUction) => {
        if (oldAUction) {
            const onGoingAuctionData = JSON.parse(localStorage.getItem("onGoingAuction"));
            onClose(onGoingAuctionData[selectedRadio]);
        } else {
            const onGoingAuctionData = JSON.parse(localStorage.getItem("onGoingAuction"));
            Object.keys(onGoingAuctionData).forEach((key) => {
                if (Object.keys(onGoingAuctionData[key]).length === 0) {
                    delete onGoingAuctionData[key];
                }
            });
            localStorage.setItem("onGoingAuction",JSON.stringify(onGoingAuctionData));
            onClose();
        }
    }


    return (
        <Dialog open={open} onClose={() => auctionSelected(false)} PaperProps={{
            style: {
                maxWidth: '95%', // Optional: To make it responsive
            },
        }}>
            <DialogContent>
                <div>
                    <div className={styles.btn_group}>
                        <div><Button variant="contained" onClick={() => auctionSelected(true)}>Load Auction</Button></div>
                        <div><Button variant="contained" onClick={() => auctionSelected(false)}>Create New</Button></div>
                    </div>
                    <div><b>UNCOMPLETE AUCTIONS</b></div>
                    <ul className={styles.horizontal_list}>
                        <li className={styles.radio_section}></li>
                        <li className={styles.kisan_name}><b>Kisan Name</b></li>
                        <li className={styles.item_name}><b>Item Name</b></li>
                    </ul>
                    {table?.map((elem, index) => (
                        <div key={index} className={styles.auctions}>
                            <ul className={styles.horizontal_list}>
                                <li className={styles.radio_section}>
                                    <input
                                        type="radio"
                                        name="auction" // Ensures only one radio is selected at a time
                                        value={elem.id}
                                        checked={selectedRadio === elem.id}
                                        onChange={() => handleRadioChange(elem.id)}
                                    />
                                </li>
                                <li className={styles.kisan_name}>{elem?.formValues?.kisaan?.name}</li>
                                <li className={styles.item_name}>{elem?.formValues?.itemName?.name}</li>
                            </ul>
                            {/* Uncomment if needed */}
                            {/* {elem?.arrayData?.length > 0 && (
                                <div>
                                    <ul>
                                        {elem?.arrayData?.map((row, rowIndex) => (
                                            <div key={rowIndex}>
                                                <li>{row?.vyapariName}</li>
                                                <li>{row?.rate}</li>
                                                <li>{row?.quantity}</li>
                                                <li>{row?.bags}</li>
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                            )} */}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default OnGoingAuctions;