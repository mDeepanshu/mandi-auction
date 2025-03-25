import React, { useEffect, useState, useRef } from "react";
import styles from "./panding-vasuli.module.css";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, InputAdornment, Switch } from "@mui/material";
import LeftArrow from "../../assets/arrow-left.svg";
import RightArrow from "../../assets/arrow-right.svg";
import { getPendingVasuliList, editVasuli } from "../../gateway/pending-vasuli";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Login from "../login/login";

function PendingVasuli() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 550);
  const [start, setStart] = useState(0);
  const amountRef = useRef(null); // Create a ref
  const remarkRef = useRef(null); // Create a ref

  const [pendingVasuliList, setPendingVasuliList] = useState([]);
  const [list, setList] = useState([]);
  const [vasuliSection, setVasuliSection] = useState(true);
  const [openSuccessTransactionDialog, setSuccessTransactionDialog] = useState(false);
  const [currentNavigatedValue, setCurrentNavigatedValue] = useState();

  // let perform_edit = false;
  const [performEdit, setPerformEdit] = useState();
  const [loginStatus, setLoginStatus] = useState(true);

  const {
    control,
    getValues,
    formState: { errors },
    register,
    trigger,
    reset,
    setValue,
    setFocus,
    watch,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0], // Format as 'YYYY-MM-DD'
    },
  });

  const changeLoginState = (value) => {
    if (value === "1212") {
      setTimeout(() => {
        setLoginStatus(false);
      }, 100);
    }
  };

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

  const fetch_pending_vasuli = async () => {
    const PendingVasuli = await getPendingVasuliList(`${vasuliSection}`);
    if (PendingVasuli?.responseBody) {
      const wrapped_arr = [...emptyVasuliArr, ...PendingVasuli?.responseBody, ...emptyVasuliArr];
      if (PendingVasuli?.responseBody?.length) setPendingVasuliList(wrapped_arr);
      setList(wrapped_arr.slice(0, 15));
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
    if (performEdit && currentNavigatedValue != list[7]?.amount) editEntry();
    if (direction == 1 && start + 15 <= pendingVasuliList.length) {
      setList(pendingVasuliList.slice(start + 1, start + 16));
    } else if (direction != 1 && start - 1 >= 0) {
      setList(pendingVasuliList.slice(start - 1, start + 14));
    }
    setStart((prevCount) => prevCount + direction);
    amountRef.current.focus();
    amountRef.current.value = "";
    remarkRef.current.value = "";
  };

  const amountChange = (amount) => {
    let updatedList = [...list];
    updatedList[7].amount = amount;
    setList(updatedList);
    setPerformEdit(true);
  };

  const remarkChange = (remark) => (pendingVasuliList[start + 7].remark = remark);

  useEffect(() => {
    fetch_pending_vasuli();
  }, []);

  useEffect(() => {
    setCurrentNavigatedValue(list[7]?.amount);
  }, [start]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessTransactionDialog(false);
  };

  const editEntry = async () => {
    setPerformEdit(false);
    let amount = Number(amountRef.current.value) > 0 ? amountRef.current.value : null;
    const editObject = {
      amount: amount,
      vyapariId: pendingVasuliList[start + 7].vyapariId,
      remark: pendingVasuliList[start + 7].remark,
      id: pendingVasuliList[start + 7].id,
    };

    const editRes = await editVasuli(editObject);
    if (editRes?.responseBody) {
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
                {/* <Button variant="contained" color="success" type="button" onClick={() => save()}>
            SAVE
          </Button> */}
              </div>
            </div>
            <div className={styles.row_two}>
              <ul className={styles.ul}>
                <li className={`${styles.list_item} ${styles.list_header}`} key={0}>
                  {/* <div className={styles.small_column}>{isMobile ? "IDX" : "INDEX"}</div> */}
                  <div className={styles.vyapari_column}>VYAPARI</div>
                  <div className={styles.small_column}>{isMobile ? "AMT" : "AMOUNT"}</div>
                  <div className={styles.remark_column}>{isMobile ? "RMK" : "REMARK"}</div>
                </li>
                {list.slice(0, 7)?.map((item, index) => {
                  return (
                    <li className={styles.list_item}>
                      {/* <div className={styles.small_column}>{start + index - 3 > 0 && start + index - 3}</div> */}
                      <div className={styles.vyapari_column}>{item?.vyapariName?.toUpperCase()}</div>
                      <div className={styles.small_column}>{item?.amount}</div>
                      <div className={styles.remark_column}>{item?.remark}</div>
                    </li>
                  );
                })}
                <li className={styles.selected_list_item}>
                  {/* <div className={styles.small_column}>{start + 1}</div> */}
                  <div className={styles.vyapari_column}>{list[7]?.vyapariName?.toUpperCase()}</div>
                  <div className={styles.small_column}>
                    <input
                      type="number"
                      placeholder="Amount"
                      className={styles.amount_input}
                      ref={amountRef}
                      value={list[7]?.amount}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          navigation(1);
                          // temp(e);
                        }
                      }}
                      onInput={(e) => amountChange(e.target.value)}
                    />
                  </div>
                  <div className={styles.remark_column}>
                    <input placeholder="Remark" tabIndex={-1} ref={remarkRef} value={list[7]?.remark} className={styles.remark_input} onInput={(e) => remarkChange(e.target.value)} />
                  </div>
                </li>
                {list.slice(8, 15)?.map((item, index) => {
                  return (
                    <li className={styles.list_item}>
                      {/* <div className={styles.small_column}>{start + index + 9 < pendingVasuliList.length && start + index + 2}</div> */}
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
                <button className={styles.arrow_btn} onClick={() => navigation(-1)} disabled={start <= 0}>
                  <img src={LeftArrow} alt="My SVG Icon" width="40" height="40" />
                </button>
              </div>
              <div>
                <button className={styles.arrow_btn} onClick={() => navigation(1)} disabled={start + 15 >= pendingVasuliList.length}>
                  <img src={RightArrow} alt="My SVG Icon" width="40" height="40" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <Snackbar open={openSuccessTransactionDialog} autoHideDuration={1000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
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
