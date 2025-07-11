import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid, Typography, TextField, InputAdornment, Button, Autocomplete, Switch, FormControlLabel } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { addVasuliTransaction, getOwedAmount } from "../../gateway/vasuli-transaction-apis";
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
  const [open, setOpen] = useState(false);
  const [printTable, setPrintTable] = useState([]);
  
  const isSmallScreen = useMediaQuery("(max-width:495px)");
  const [columns, setColumns] = useState(["INDEX", "NAME", "AMOUNT", "PRINT STATUS", "PRINT"]);
  const [keyArray, setKeyArray] = useState(["index", "name", "amount", "printStatus", "print"]);

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
    if (isSmallScreen){
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

    const existingDate = new Date(); // Existing Date object for time
    const datePart = new Date(getValues().date);
    datePart.setHours(existingDate.getHours(), existingDate.getMinutes(), existingDate.getSeconds());

    const vasuliTran = {
      ...getValues(),
      vyapariId: getValues().vyapariId?.partyId,
      name: getValues()?.vyapariId?.name,
      date: datePart,
    };
    try {
      const dataSaved = await addVasuliTransaction(vasuliTran);
      if (getValues().toggle && dataSaved === "success") {
        setPrintData({
          vyapariName: getValues().vyapariId.name,
          idNo: getValues().vyapariId.idNo,
          date: getValues().date,
          amount: getValues().amount,
          remark: getValues().remark,
        });
      } else {
        const newItem = {
          name: getValues()?.vyapariId?.name,
          idNo: getValues()?.vyapariId?.idNo,
          amount: getValues()?.amount,
          date: getValues()?.date,
          printStatus: "NO",
        };
        setPrintTable((prevItems) => [newItem, ...prevItems]);
      }
      reset({
        vyapariId: null,
        idNo: null,
        amount: "",
        remark: "",
        toggle: getValues().toggle,
      });
      if (vyapariRef.current) {
        setTimeout(() => {
          vyapariRef.current.focus();
        }, 0);
      }
      setOpen(true);
    } catch (error) {}
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
    setOpen(false);
  };

  const printReceipt = () => {
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
      console.warn("Electron IPC is not available.");
    }
    const newItem = {
      name: printData.vyapariName,
      idNo: printData.idNo,
      amount: printData.amount,
      date: printData.date,
      remark: printData.remark,
      printStatus: "YES",
    };
    setPrintTable((prevItems) => [...prevItems, newItem]);
  };

  const rePrintPrev = (data, index) => {
    setPrintTable((printTable) => printTable.filter((_, i) => i !== index));
    setPrintData({
      vyapariName: data?.name,
      idNo: data?.idNo,
      date: data?.date,
      amount: data?.amount,
      remark: data?.remark,
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
              <Grid item xs={10} className={styles.heading}>
                <Typography variant="h4" component="h1" align="left">
                  VASULI TRANSACTION
                </Typography>
              </Grid>
              <Grid item xs={2} className={styles.toggle}>
                <Controller name="toggle" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="PRINT ON SUBMIT" />} />
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
                        options.filter((option) => option.name.toUpperCase().includes(state.inputValue.toUpperCase()) || option.idNo.includes(state.inputValue)).slice(0, 5)
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
                  render={({ field }) => <TextField {...field} fullWidth type="text" inputRef={remarkRef} onKeyDown={onEnterPress} helperText=" " label="REMARK" size={isSmallScreen ? "small" : "medium"}/>}
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
                    <ReactToPrint trigger={() => <button style={{ display: "none" }} ref={triggerRef}></button>} content={() => printRef.current} onAfterPrint={handleAfterPrint} />
                  </div>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <MasterTable columns={columns} tableData={printTable} keyArray={keyArray} rePrintPrev={rePrintPrev} editFromTable={editFromTable} />
              </Grid>
            </Grid>
          </form>
          <div>
            <Snackbar open={open} autoHideDuration={1500} onClose={handleClose}>
              <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: "100%" }}>
                SUCCESSFULLY ADDED. SYNC TO SAVE.
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
