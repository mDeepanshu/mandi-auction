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
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AlertDialog from "../../dialogs/corformation/conformation";

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
  const [openConformationDialog, setOpenConformationDialog] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  const {
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const handleConformationClose = (action) => {
    if (action) send_whatsapp_to_all();
    setOpenConformationDialog(false);
  };

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
      let wrapped_arr = [...PendingVasuli?.responseBody];
      wrapped_arr.forEach((obj) => (obj.isChecked = false));
      setPendingVasuliList(wrapped_arr);

      let startIndex = 0;
      let amount = 0;
      for (let i = 0; i < PendingVasuli?.responseBody.length; i++) {
        if (PendingVasuli?.responseBody?.[i]?.amount) {
          startIndex++;
          amount += Number(PendingVasuli?.responseBody?.[i]?.amount);
        }
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
    const changedIndex = navigationIndex + direction;

    editEntry();
    setNavigationIndex((prev) => prev + direction);
    setVariablesOnNavigation(changedIndex);
    if (amountRef.current) {
      setTimeout(() => {
        amountRef.current.focus();
      }, 0);
    }
  };

  const setVariablesOnNavigation = (index) => {
    setCurrAmount(pendingVasuliList[index]?.amount ?? "");
    setRemark(pendingVasuliList[index]?.remark ?? "");
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessTransactionDialog(false);
  };

  const editEntry = async () => {

    if (!(
      (pendingVasuliList[navigationIndex].amount !== currAmount &&
        !(currAmount === "" && pendingVasuliList[navigationIndex].amount === null)) ||
      (pendingVasuliList[navigationIndex].remark !== remark &&
        !(remark === "" && pendingVasuliList[navigationIndex].remark === null))
    )) return;
    const editObject = {
      amount: currAmount,
      vyapariId: pendingVasuliList[navigationIndex].vyapariId,
      remark: remark,
      id: pendingVasuliList[navigationIndex].id,
    };

    const editRes = await editVasuli(editObject);
    if (editRes?.responseBody) {
      setPendingVasuliList((prev) => {
        const updatedList = [...prev];
        const index = navigationIndex;
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
      if (sendWhatsApp)
        await whatsAppVasuli({
          name: pendingVasuliList[navigationIndex].vyapariName,
          vyapariId: pendingVasuliList[navigationIndex].vyapariId,
          idNo: pendingVasuliList[navigationIndex].idNo || "-",
          contact: pendingVasuliList[navigationIndex].contact,
          message: currAmount,
          date: formattedDate,
          remark: remark || "-",
          templateName: "payment_receipt3",
        });

      setTotalAmount((prev) => prev - Number(pendingVasuliList[navigationIndex].amount) + Number(currAmount));
      setSuccessTransactionDialog(true);
    }
  };

  const send_whatsapp_to_all = async () => {
    const day = String(new Date().getDate()).padStart(2, "0");
    const month = String(new Date().getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = new Date().getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    for (let i = 0; i < pendingVasuliList.length; i++) {
      if (!pendingVasuliList[i]?.isChecked || !pendingVasuliList[i]?.amount) continue;

      const item = pendingVasuliList[i];
      await whatsAppVasuli({
        name: item.vyapariName,
        vyapariId: item.vyapariId,
        idNo: item.idNo || "-",
        contact: item.contact,
        message: item.amount,
        date: formattedDate,
        remark: item.remark || "-",
        templateName: "payment_receipt3",
      });
    }
  };

  const all_whatsapp_confirm = () => {
    setOpenConformationDialog(true);
  };

  const commonCheckAll = (checked) => {
    setAllChecked(checked);
    setPendingVasuliList((prev) => {
      if (checked)
        return prev?.map((item) => ({ ...item, isChecked: item.amount != null && item.amount != "0" && item.amount != "0.00" && item.amount != item.lastNotifiedAmount }));
      else
        return prev?.map((item) => ({ ...item, isChecked: false }));
    });
  };

  const toggleSelectItem = (index, checked) => {
    setPendingVasuliList((prev) => {
      const updatedList = [...prev];
      updatedList[index].isChecked = checked;
      return updatedList;
    });
  };

  const handleActivate = (index) => {
    editEntry();
    setNavigationIndex(index);
    setVariablesOnNavigation(index);
  };

  const handleAmountChange = (val) => setCurrAmount(val);
  const handleRemarkChange = (val) => setRemark(val);

  return (
    <>
      {loginStatus ? (
        <div className={styles.authenticate}>
          <Login changeLoginState={changeLoginState} />
        </div>
      ) : (
        <>
          <div className={styles.container}>
            <div className={styles.row_one_one}>
              <div>
                <label>TODAYS</label>
                <Switch onChange={() => changeSection()} />
                <label>OLDER</label>
              </div>
              <div>
                <Button variant="contained" color="success" type="button" onClick={() => fetch_pending_vasuli()} className={styles.get_btn}>
                  GET
                </Button>
              </div>
            </div>
            <div className={styles.row_one_two}>
              <div className={styles.whatsAppSend}>
                <WhatsAppIcon />
                <Switch onChange={() => setSendWhatsApp(!sendWhatsApp)} />
              </div>
              <div className={styles.row_one_right}>TOTAL: {totalAmount}</div>
              <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={() => all_whatsapp_confirm()}
                className={styles.whatsappAllBtn}
              >
                <WhatsAppIcon /> ALL
              </Button>
            </div>
            <div className={styles.row_two}>
              <ul className={styles.ul}>
                <li className={`${styles.list_item} ${styles.list_header}`} key="header">
                  <div className={styles.checkbox_column}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        commonCheckAll(checked);
                      }}
                    />
                  </div>
                  <div className={styles.vyapari_column}>VYAPARI</div>
                  <div className={styles.small_column}>AMOUNT</div>
                  <div className={styles.remark_column}>REMARK</div>
                </li>
                {pendingVasuliList.map((item, index) => (
                  <li
                    key={index}
                    className={`${styles.list_item} ${styles.selectable_item} ${navigationIndex === index ? styles.selected_list_item : ""}`}
                    onClick={() => handleActivate(index)}
                  >
                    <div className={styles.checkbox_column}>
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        onChange={(e) => {
                          toggleSelectItem(index, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()} // don't activate when clicking checkbox
                      />
                    </div>
                    <div className={styles.vyapari_column}>
                      {item.vyapariName?.toUpperCase()}
                    </div>
                    <div className={styles.small_column}>
                      {navigationIndex === index ? (
                        <input
                          type="number"
                          className={styles.amount_input}
                          ref={amountRef}
                          value={currAmount}
                          placeholder="Amount"
                          onKeyDownCapture={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              navigation(1);
                            }
                          }}
                          onInput={(e) => handleAmountChange(e.target.value)}
                          onClick={(e) => e.stopPropagation()} // prevent row activation re-trigger
                        />
                      ) : (
                        <span>{item.amount}</span>
                      )}
                    </div>
                    <div className={styles.remark_column}>
                      {navigationIndex === index ? (
                        <input
                          type="text"
                          tabIndex={-1}
                          className={styles.remark_input}
                          value={remark}
                          placeholder="Remark"
                          onInput={(e) => handleRemarkChange(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span>{item.remark}</span>
                      )}
                    </div>
                  </li>
                ))}
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
            <AlertDialog
              open={openConformationDialog}
              handleClose={handleConformationClose}
              title="Send WhatsApp Receipt To All?"
              btnText="Send"
            />
          </div>
        </>
      )}
    </>
  );
}

export default PendingVasuli;
