import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid, Typography, TextField, InputAdornment, Button, Autocomplete, Switch, FormControlLabel } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { addVasuliTransaction, getOwedAmount, whatsAppVasuli, sendNotification } from "../../gateway/vasuli-transaction-apis";
import { getAllItems } from "../../gateway/curdDB";
import Login from "../login/login";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import styles from "./vasuli-transaction.module.css";
import ReactToPrint from "react-to-print";

import MasterTable from "../../shared/ui/master-table/master-table";
import { useMediaQuery } from "@mui/material";

const VasuliTransaction = () => {
  const printRef = useRef();

  const vyapariRef = useRef(null);
  const amountRef = useRef(null);
  const remarkRef = useRef(null);
  const triggerRef = useRef();

  const [vyapariList, setVyapariList] = useState([]);
  const [owedAmount, setOwedAmount] = useState("");
  const [loginStatus, setLoginStatus] = useState(true);
  const [open, setOpen] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [whatsappOpen, setWhatsappOpen] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [printTable, setPrintTable] = useState([]);

  const isSmallScreen = useMediaQuery("(max-width:495px)");
  const [columns, setColumns] = useState(["INDEX", "NAME", "AMOUNT", "PRINT STATUS", "PRINT", "WHATSAPP", "APP", "RESEND"]);
  const [keyArray, setKeyArray] = useState(["index", "name", "amount", "printStatus", "print", "whatsapp", "appNotification", "resend"]);

  const [printData, setPrintData] = useState();

  let oneDaysPrior = new Date();
  oneDaysPrior.setDate(oneDaysPrior.getDate() - 1);
  let priorDate = oneDaysPrior.toLocaleDateString("en-CA");

  const todaysDate = new Date();
  const currentHour = todaysDate.getHours();

  if (currentHour >= 18) {
    priorDate = todaysDate.toLocaleDateString("en-CA");
  }

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    getValues,
    reset,
    setValue,
    watch,
    trigger,
  } = useForm({
    defaultValues: {
      date: priorDate,
      toggle: false,
      whatsappToggle: false,
    },
  });
  const watchedVyapariId = watch("vyapariId");

  const changeLoginState = (value) => {
    if (value === "1212") {
      setTimeout(() => {
        setLoginStatus(false);
      }, 100);
    }
  };

  const fetchList = async (listName) => {
    try {
      const list = await getAllItems(listName);
      setVyapariList(list);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    fetchList("VYAPARI");
    if (isSmallScreen) {
      setColumns(["INDEX", "NAME", "AMOUNT"]);
      setKeyArray(["index", "name", "amount"]);
    }
    const anyPreviousAuctions = JSON.parse(localStorage.getItem("localObj"));
    if (anyPreviousAuctions.vasuli && Object.keys(anyPreviousAuctions.vasuli)?.length > 0) setPrintTable(anyPreviousAuctions?.vasuli);
  }, []);

  useEffect(() => {
    if (watchedVyapariId) {
      const fetchOwedAmount = async () => {
        try {
          if (watchedVyapariId?.partyId) {
            const partyDetails = vyapariList.find((item) => item.partyId === watchedVyapariId.partyId);
            setOwedAmount(partyDetails?.owedAmount || "");
          }
        } catch (error) {
          setOwedAmount(""); // Handle error by resetting owed amount
        }
      };
      fetchOwedAmount();
    }
  }, [watchedVyapariId]);

  useEffect(() => {
    if (vyapariRef.current) {
      setTimeout(() => {
        vyapariRef.current.focus();
      }, 100);
    }
  }, [loginStatus]);

  useEffect(() => {
    if (amountRef.current) {
      setTimeout(() => {
        amountRef.current.focus();
      }, 100);
    }
  }, [owedAmount]);

  const onSubmit = async (data) => {
    if (!isValid) {
      return;
    }

    const formValue = getValues();

    const existingDate = new Date(); // Existing Date object for time
    const datePart = new Date(formValue.date);
    datePart.setHours(existingDate.getHours(), existingDate.getMinutes(), existingDate.getSeconds());

    const vasuliTran = {
      ...formValue,
      vyapariId: formValue.vyapariId?.partyId,
      idNo: formValue.vyapariId?.idNo,
      name: formValue?.vyapariId?.name,
      date: datePart,
      contact: formValue?.vyapariId?.contact,
      remark: formValue?.remark,
    };

    const whatsappStatus = !formValue.whatsappToggle
      ? "NO"
      : !formValue?.vyapariId?.contact || formValue?.vyapariId?.contact.length !== 10
      ? "INVALID NUMBER"
      : "pending";

    const dataSaved = await addVasuliTransaction(vasuliTran);
    if (formValue.toggle && dataSaved === "success") {
      setPrintData({
        vyapariName: formValue.vyapariId?.name,
        vyapariId: formValue?.vyapariId?.partyId,
        idNo: formValue.vyapariId?.idNo,
        date: formValue?.date,
        amount: formValue?.amount,
        remark: formValue?.remark,
      });
    } else if (dataSaved === "success") {
      const newItem = {
        name: formValue?.vyapariId?.name,
        vyapariId: formValue?.vyapariId?.partyId,
        idNo: formValue?.vyapariId?.idNo,
        remark: formValue?.remark,
        contact: formValue?.vyapariId?.contact,
        amount: formValue?.amount,
        date: formValue?.date,
        printStatus: "NO",
        whatsapp: whatsappStatus,
      };
      setPrintTable((prevItems) => [newItem, ...prevItems]);
    }

    if (formValue.whatsappToggle) sendWhatsAppReceipt(vasuliTran);
    reset({
      vyapariId: null,
      idNo: null,
      amount: "",
      remark: "",
      toggle: formValue.toggle,
      whatsappToggle: formValue.whatsappToggle,
    });
    if (vyapariRef.current) {
      setTimeout(() => {
        vyapariRef.current.focus();
      }, 0);
    }
    setOpen({
      open: true,
      message: "Successfully Added. Sync to Save.",
      severity: "success",
    });
  };

  const sendWhatsAppReceipt = async (vasuliTran, index = 0) => {
    if (!vasuliTran.contact.length || vasuliTran.contact.length != 10) {
      setWhatsappOpen({
        open: true,
        message: "WhatsApp number - NOT CORRECT.",
        severity: "error",
      });
      setPrintTable((prev) => {
        const updatedArray = [...prev];
        updatedArray[index] = {
          ...updatedArray[index],
          whatsapp: "INVALID NUMBER",
        };
        return updatedArray;
      });
      return;
    }

    const day = String(new Date(vasuliTran.date).getDate()).padStart(2, "0");
    const month = String(new Date(vasuliTran.date).getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = new Date(vasuliTran.date).getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    let whatsAppResponse = "pending";
    try {
      let res = await whatsAppVasuli({
        name: vasuliTran.name,
        idNo: vasuliTran.idNo || "-",
        contact: vasuliTran.contact,
        message: vasuliTran.amount,
        date: formattedDate,
        remark: vasuliTran.remark || "-",
        templateName: "payment_receipt3",
      });
      console.log("WhatsApp response:", res);
      

      const unescapedStr = res?.data?.responseBody?.replace(/\\"/g, '"');
      whatsAppResponse = JSON.parse(unescapedStr || "{}")?.messages?.[0]?.message_status;
    } catch (error) {
      whatsAppResponse = "FAILED";
      setWhatsappOpen({
        open: true,
        message: "WhatsApp message failed to send.",
        severity: "error",
      });
    }

    setPrintTable((prev) => {
      const updatedArray = [...prev];
      updatedArray[index] = {
        ...updatedArray[index],
        whatsapp: whatsAppResponse || "FAILED",
      };
      return updatedArray;
    });
  };

  useEffect(() => {
    if (!printData) return;
    if (printData?.vyapariName) printReceipt();
  }, [printData]);

  const handleEnterPress = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault("Enter");
      const amountValid = await trigger(`amount`);
      if (remarkRef.current && amountValid) {
        setTimeout(() => {
          remarkRef.current.focus();
        }, 100);
      }
    }
  };

  const onEnterPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen({
      open: false,
      message: "",
      severity: "",
    });
    setWhatsappOpen({
      open: false,
      message: "",
      severity: "",
    });
  };

  const printReceipt = async () => {
    const contentToPrint = printRef.current.innerHTML;

    if (window.electron && window.electron.ipcRenderer) {
      // Invoke a print action
      window.electron.ipcRenderer
        .invoke("print-content", contentToPrint)
        .then(() => {
          console.log(`printed`);
        })
        .catch((err) => console.error("Print failed:", err));
    } else {
      triggerRef.current.click();
    }
    const whatsappStatus = !getValues().whatsappToggle
      ? "NO"
      : !printData?.contact || printData.contact.length !== 10
      ? "INVALID NUMBER"
      : "pending";
    const newItem = {
      name: printData.vyapariName,
      contact: printData.contact,
      idNo: printData.idNo,
      amount: printData.amount,
      date: printData.date,
      whatsapp: whatsappStatus,
      remark: printData.remark,
      printStatus: "YES",
    };
    setPrintTable((prevItems) => [...prevItems, newItem]);
  };

  const rePrintPrev = (data, index) => {
    setPrintTable((printTable) => printTable.filter((_, i) => i !== index));
    setPrintData({
      vyapariName: data?.name,
      vyapariId: data?.vyapariId,
      idNo: data?.idNo,
      date: data?.date,
      amount: data?.amount,
      remark: data?.remark,
      contact: data?.contact,
    });
  };

  const editFromTable = (rowData, index) => {};

  const handleAfterPrint = () => {
    reset();
    if (vyapariRef.current) {
      setTimeout(() => {
        vyapariRef.current.focus();
      }, 0);
    }
  };

  const resend = (rowData, index) => {
    const vasuliTran = {
      name: rowData?.name,
      idNo: rowData?.idNo,
      contact: rowData?.contact,
      amount: rowData?.amount,
      date: rowData?.date,
      remark: rowData?.remark,
    };
    sendWhatsAppReceipt(vasuliTran, index);
  };

  const appNotification = (rowData, index) => {
    const vasuliTran = {
      vyapariId: rowData?.vyapariId,
      name: rowData?.name,
      idNo: rowData?.idNo,
      contact: rowData?.contact,
      amount: rowData?.amount,
      date: rowData?.date,
      remark: rowData?.remark,
    };
    sendNotification(vasuliTran, index);
  };

  return (
    <>
      {loginStatus ? (
        <div className={styles.authenticate}>
          <Login changeLoginState={changeLoginState} />
        </div>
      ) : (
        <div className={styles.wrapper}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={1} p={1} alignItems="center">
              <Grid item xs={8} className={styles.heading}>
                <Typography variant="h4" component="h1" align="left">
                  VASULI TRANSACTION
                </Typography>
              </Grid>
              <Grid item xs={2} className={styles.toggle}>
                <Controller
                  name="whatsappToggle"
                  control={control}
                  render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="SEND WHATSAPP" />}
                />
              </Grid>
              <Grid item xs={2} className={styles.toggle}>
                <Controller
                  name="toggle"
                  control={control}
                  render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="PRINT ON SUBMIT" />}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="vyapariId"
                  control={control}
                  rules={{ required: "Enter Vyapari Name" }}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      value={field.value || null}
                      options={vyapariList}
                      getOptionLabel={(option) => `${option.idNo} | ${option.name}`}
                      filterOptions={(options, state) =>
                        options
                          .filter(
                            (option) =>
                              option.name.toUpperCase().includes(state.inputValue.toUpperCase()) || option.idNo.includes(state.inputValue)
                          )
                          .slice(0, 5)
                      }
                      isOptionEqualToValue={(option, value) => option.idNo === value.idNo}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="VYAPARI"
                          error={!!error} // Highlight field in red if there's an error
                          helperText={error ? error.message : " "} // Show error message
                          InputProps={{
                            ...params.InputProps,
                            inputRef: vyapariRef, // Attach the ref here
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      disablePortal
                      id="combo-box-demo"
                      size={isSmallScreen ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: "Enter Collected Amount" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      inputRef={amountRef}
                      label="COLLECTED AMOUNT"
                      onKeyDown={handleEnterPress} // Add onKeyDown here
                      error={!!error} // Highlight field in red if there's an error
                      helperText={error?.message || " "} // Show error message
                      size={isSmallScreen ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="remark"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="text"
                      inputRef={remarkRef}
                      onKeyDown={onEnterPress}
                      helperText=" "
                      label="REMARK"
                      size={isSmallScreen ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1" fontWeight={700} align="left">
                  REMAINING AMOUNT {owedAmount}/-
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Enter selectDate" }}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Select Date"
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
                <p className="err-msg">{errors.date?.message}</p>
              </Grid>
              <Grid item xs={3} sm={1} container alignItems="center">
                <Grid item>
                  <Button variant="contained" color="primary" type="submit" onClick={onSubmit} style={{ marginBottom: `20px` }}>
                    Submit
                  </Button>
                  <div>
                    <ReactToPrint
                      trigger={() => <button style={{ display: "none" }} ref={triggerRef}></button>}
                      content={() => printRef.current}
                      onAfterPrint={handleAfterPrint}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <MasterTable
                  columns={columns}
                  tableData={printTable}
                  keyArray={keyArray}
                  resend={resend}
                  rePrintPrev={rePrintPrev}
                  editFromTable={editFromTable}
                  appNotification={appNotification}
                />
              </Grid>
            </Grid>
          </form>
          <div>
            <Snackbar open={open.open} autoHideDuration={3000} onClose={handleClose}>
              <Alert onClose={handleClose} severity={open.severity} variant="filled" sx={{ width: "100%" }}>
                {open.message}
              </Alert>
            </Snackbar>
          </div>
          <div>
            <Snackbar
              open={whatsappOpen.open}
              autoHideDuration={5000}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert onClose={handleClose} severity={whatsappOpen.severity} variant="filled" sx={{ width: "100%" }}>
                {whatsappOpen.message}
              </Alert>
            </Snackbar>
          </div>
          <div style={{ display: "none" }}>
            <div ref={printRef} className={styles.printContainer}>
              <div className={styles.printHeadings}>
                <div>****H.I.S ---- MOBILE: 9826306406****</div>
              </div>
              <hr className={styles.line} />
              <div className={styles.printData}>
                <div>
                  NAME: {printData?.vyapariName} | {printData?.idNo}{" "}
                </div>
                <div>DATE: {printData?.date}</div>
                <div>AMOUNT: {printData?.amount}</div>
                <div>REMARK: {printData?.remark}</div>
              </div>
              <b>
                <hr className={styles.line} />
              </b>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VasuliTransaction;
