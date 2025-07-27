import React, { useEffect, useState, useRef } from "react";
import styles from "./panding-vasuli.module.css";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, InputAdornment, Switch } from "@mui/material";
import LeftArrow from "../../assets/arrow-left.svg";
import RightArrow from "../../assets/arrow-right.svg";
import { getPendingVasuliList, editVasuli, whatsAppVasuli } from "../../gateway/pending-vasuli";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Login from "../login/login";

function PendingVasuli() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 550);
  const amountRef = useRef(null);
  const [pendingVasuliList, setPendingVasuliList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currAmount, setCurrAmount] = useState(null);
  const [remark, setRemark] = useState(null);
  const [vasuliSection, setVasuliSection] = useState(true);
  const [openSuccessTransactionDialog, setSuccessTransactionDialog] = useState(false);
  const [navigationIndex, setNavigationIndex] = useState(0);
  const [loginStatus, setLoginStatus] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  const {
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const emptyVasuliArr = [
    {
      id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
      vyapariId: "",
    },
    {
      id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
      vyapariId: "",
    },
    {
      id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
      vyapariId: "",
    },
    {
      id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
      vyapariId: "",
    },
    {
      id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
      vyapariId: "",
    },
    {
      id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
      vyapariId: "",
    },
    {
      id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
      vyapariId: "",
    },
  ];

  useEffect(() => {
    fetch_pending_vasuli();
  }, []);

  const changeLoginState = (value) => {
    if (value === "1212") {
      setTimeout(() => {
        setLoginStatus(false);
      }, 100);
    }
  };

  const fetch_pending_vasuli = async () => {
    const PendingVasuli = await getPendingVasuliList(`${vasuliSection}`);
    if (PendingVasuli?.responseBody?.length) {
      const wrapped_arr = [...emptyVasuliArr, ...PendingVasuli?.responseBody, ...emptyVasuliArr];
      setPendingVasuliList(wrapped_arr);

      let startIndex = 0;
      let amount = 0;
      for (let i = 0; i < PendingVasuli?.responseBody.length; i++) {
        if (PendingVasuli?.responseBody?.[i]?.amount) {
          startIndex++;
          amount += Number(PendingVasuli?.responseBody?.[i]?.amount);
        };
      }

      setNavigationIndex(startIndex);
      setCurrAmount(PendingVasuli?.responseBody?.[startIndex]?.amount);
      setRemark(PendingVasuli?.responseBody?.[startIndex]?.remark);
      setTotalAmount(amount);

      if (amountRef.current) {
        setTimeout(() => {
          amountRef.current.focus();
        }, 0);
      }
    }
  };

  const changeSection = () => {
    setVasuliSection((prev) => !prev);
  };

  const navigation = (direction) => {
    const changedIndex = navigationIndex + 7 + direction;

    if (
      (pendingVasuliList[navigationIndex + 7].amount !== currAmount &&
        !(currAmount === "" && pendingVasuliList[navigationIndex + 7].amount === null)) ||
      (pendingVasuliList[navigationIndex + 7].remark !== remark &&
        !(remark === "" && pendingVasuliList[navigationIndex + 7].remark === null))
    ) {
      editEntry();
    }
    setNavigationIndex((prev) => prev + direction);
    setCurrAmount(pendingVasuliList[changedIndex]?.amount ?? "");
    setRemark(pendingVasuliList[changedIndex]?.remark ?? "");

    amountRef.current.focus();
  };

  const amountChange = (amount) => {
    setCurrAmount(amount);
  };

  const remarkChange = (remark) => {
    setRemark(remark);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessTransactionDialog(false);
  };

  const editEntry = async () => {
    const editObject = {
      amount: currAmount,
      vyapariId: pendingVasuliList[navigationIndex + 7].vyapariId,
      remark: remark,
      id: pendingVasuliList[navigationIndex + 7].id,
    };

    const editRes = await editVasuli(editObject);
    if (editRes?.responseBody) {
      setPendingVasuliList((prev) => {
        const updatedList = [...prev];
        const index = navigationIndex + 7;
        updatedList[index] = {
          ...updatedList[index],
          amount: currAmount,
          remark: remark,
        };
        return updatedList;
      });

      const day = String(new Date().getDate()).padStart(2, "0");
      const month = String(new Date().getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const year = new Date().getFullYear();

      const formattedDate = `${day}/${month}/${year}`;
      if (sendWhatsApp) await whatsAppVasuli({
        name: pendingVasuliList[navigationIndex + 7].vyapariName,
        idNo: pendingVasuliList[navigationIndex + 7].idNo || "-",
        contact: pendingVasuliList[navigationIndex + 7].contact,
        message: currAmount,
        date: formattedDate,
        remark: remark || "-",
        templateName: "payment_receipt3"
      });

      setTotalAmount((prev) => prev - Number(pendingVasuliList[navigationIndex + 7].amount) + Number(currAmount));
      setSuccessTransactionDialog(true);
    }
  };

  return (
    <>
      {loginStatus ? (
        <div className={styles.authenticate}>
          <Login changeLoginState={changeLoginState} />
        </div>
      ) : (
        <>
          <div className={styles.container}>
            <div className={styles.row_one}>
              <div>
                <label>TODAYS</label>
                <Switch onChange={() => changeSection()} />
                <label>OLDER</label>
              </div>
              <div>
                <Button variant="contained" color="success" type="button" onClick={() => fetch_pending_vasuli()}>
                  GET
                </Button>
              </div>
              <div>
                <label>SEND WHATSAPP</label>
                <Switch onChange={() => setSendWhatsApp(!sendWhatsApp)} />
              </div>
              <div className={styles.row_one_right}>TOTAL: {totalAmount}</div>
            </div>
            <div className={styles.row_two}>
              <ul className={styles.ul}>
                <li className={`${styles.list_item} ${styles.list_header}`} key={0}>
                  <div className={styles.vyapari_column}>VYAPARI</div>
                  <div className={styles.small_column}>{isMobile ? "AMT" : "AMOUNT"}</div>
                  <div className={styles.remark_column}>{isMobile ? "RMK" : "REMARK"}</div>
                </li>
                {pendingVasuliList.slice(navigationIndex, navigationIndex + 7)?.map((item, index) => {
                  return (
                    <li className={styles.list_item} key={index}>
                      <div className={styles.vyapari_column}>{item?.vyapariName?.toUpperCase()}</div>
                      <div className={styles.small_column}>{item?.amount}</div>
                      <div className={styles.remark_column}>{item?.remark}</div>
                    </li>
                  );
                })}
                <li className={styles.selected_list_item}>
                  <div className={styles.vyapari_column}>{pendingVasuliList[navigationIndex + 7]?.vyapariName?.toUpperCase()}</div>
                  <div className={styles.small_column}>
                    <input
                      type="number"
                      placeholder="Amount"
                      className={styles.amount_input}
                      ref={amountRef}
                      value={currAmount}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          navigation(1);
                        }
                      }}
                      onInput={(e) => amountChange(e.target.value)}
                    />
                  </div>
                  <div className={styles.remark_column}>
                    <input
                      placeholder="Remark"
                      tabIndex={-1}
                      value={remark}
                      className={styles.remark_input}
                      onInput={(e) => remarkChange(e.target.value)}
                    />
                  </div>
                </li>
                {pendingVasuliList.slice(navigationIndex + 8, navigationIndex + 15)?.map((item, index) => {
                  return (
                    <li className={styles.list_item} key={8 + index}>
                      <div className={styles.vyapari_column}>{item?.vyapariName?.toUpperCase()}</div>
                      <div className={styles.small_column}>{item?.amount}</div>
                      <div className={styles.remark_column}>{item?.remark}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className={styles.row_three}>
              <div>
                <button className={styles.arrow_btn} onClick={() => navigation(-1)} disabled={navigationIndex <= 0}>
                  <img src={LeftArrow} alt="My SVG Icon" width="40" height="40" />
                </button>
              </div>
              <div>
                <button
                  className={styles.arrow_btn}
                  onClick={() => navigation(1)}
                  disabled={navigationIndex + 15 >= pendingVasuliList.length}
                >
                  <img src={RightArrow} alt="My SVG Icon" width="40" height="40" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <Snackbar
              open={openSuccessTransactionDialog}
              autoHideDuration={1000}
              onClose={handleClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: "100%" }}>
                SAVED.
              </Alert>
            </Snackbar>
          </div>
        </>
      )}
    </>
  );
}

export default PendingVasuli;
