import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Typography, TextField, InputAdornment, Button, Autocomplete, Switch, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { addVasuliTransaction, getOwedAmount } from "../../gateway/vasuli-transaction-apis";
import { getAllItems } from "../../gateway/curdDB";
import Login from "../login/login";
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import styles from "./vasuli-transaction.module.css";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
function VasuliTransaction() {

  const [vyapariList, setVyapariList] = useState([]);
  const [owedAmount, setOwedAmount] = useState("");
  const [loginStatus, setLoginStatus] = useState(true);
  const [open, setOpen] = useState(false);
  const [printTable, setPrintTable] = useState([]);
  const [printData, setPrintData] = useState({
    vyapariName: "",
    mobile: "",
    date: "",
    amount: "",
  });
  const printRef = useRef();

  const vyapariRef = useRef(null); // Create a ref
  const amountRef = useRef(null); // Create a ref
  const remarkRef = useRef(null); // Create a ref

  let oneDaysPrior = new Date();
  oneDaysPrior.setDate(oneDaysPrior.getDate() - 1);
  let priorDate = oneDaysPrior.toLocaleDateString('en-CA').split('T')[0];

  const todaysDate = new Date();
  const currentHour = todaysDate.getHours();

  if (currentHour >= 18) {
    priorDate = todaysDate.toLocaleDateString('en-CA').split('T')[0];
  }

  const { handleSubmit, control, formState: { errors }, getValues, reset, setValue, watch } = useForm({
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
  }

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
  }, []);

  useEffect(() => {
    if (watchedVyapariId) {
      const fetchOwedAmount = async () => {
        try {
          if (watchedVyapariId?.partyId) {
            const partyDetails = await getOwedAmount(watchedVyapariId.partyId);
            setOwedAmount(partyDetails?.data?.responseBody?.owedAmount || "");
          } else {
            setOwedAmount("");
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

  // useEffect(() => {
  // if (window.electron && window.electron.ipcRenderer) {
  //   window.electron.ipcRenderer
  //     .invoke('get-printers')
  //     .then((printerList) => setPrinters(printerList))
  //     .catch((error) => console.error('Error fetching printers:', error));
  // } else {
  //   console.warn('Electron IPC is not available.');
  // }
  // }, []);

  const onSubmit = async (data) => {
    const vasuliTran = {
      ...getValues(),
      vyapariId: getValues().vyapariId.partyId,
    }
    try {
      const dataSaved = await addVasuliTransaction(vasuliTran);
      if (getValues().toggle && dataSaved === 'success') {
        setPrintData({
          vyapariName: getValues().vyapariId.name,
          mobile: getValues().vyapariId.mobile,
          date: getValues().date,
          amount: getValues().amount,
        })
      } else {
        const newItem = {
          name: getValues()?.vyapariId?.name,
          amount: getValues()?.amount,
          mobile: getValues()?.mobile,
          date: getValues()?.date,
          printStatus: 'NO',
        };
        setPrintTable((prevItems) => [...prevItems, newItem]);
      }
      reset({
        vyapariId: null,
        amount: '',
        remark: '',
        toggle: getValues().toggle,
      });
      if (vyapariRef.current) {
        setTimeout(() => {
          vyapariRef.current.focus();
        }, 0);
      }
      setOpen(true);
    } catch (error) {
    }
  };

  useEffect(() => {
    if (printData?.vyapariName) {
      printReceipt();
    }
  }, [printData]);


  const handleEnterPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (remarkRef.current) {
        setTimeout(() => {
          remarkRef.current.focus();
        }, 100);
      }
    }
  };

  const onEnterPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const printReceipt = () => {
    const contentToPrint = printRef.current.innerHTML;

    if (window.electron && window.electron.ipcRenderer) {
      // Invoke a print action
      window.electron.ipcRenderer
        .invoke('print', contentToPrint)
        .then(() => {
          const newItem = {
            name: printData.vyapariName,
            amount: printData.amount,
            mobile: printData.mobile,
            date: printData.date,
            printStatus: 'YES',
          };
          setPrintTable((prevItems) => [...prevItems, newItem]);
        })
        .catch((err) => console.error('Print failed:', err));
    } else {
      console.warn('Electron IPC is not available.');
    }
  }

  const rePrintPrev = (data,index) => {
    setPrintTable((printTable) => printTable.filter((_, i) => i !== index));
    setPrintData({
      vyapariName: data?.name,
      mobile: data?.mobile,
      date: data?.date,
      amount: data?.amount,
    })
  }

  return (
    <>
      {
        loginStatus ? (<Login changeLoginState={changeLoginState} />) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={1} p={1}>
                <Grid item xs={10}>
                  <Typography variant="h4" component="h1" align="left">
                    VASULI TRANSACTION
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Controller
                    name="toggle"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="PRINT ON SUBMIT"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={9}>
                  <Controller
                    name="vyapariId"
                    control={control}
                    rules={{ required: "Enter Vyapari Name" }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        value={field.value || null}
                        options={vyapariList}
                        getOptionLabel={(option) => `${option.idNo} | ${option.name}`}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="VYAPARI"
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
                      />
                    )}
                  />
                  <p className='err-msg'>{errors.vyapariId?.message}</p>
                </Grid>

                <Grid item xs={4}>
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
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}
                  />
                  <p className='err-msg'>{errors.date?.message}</p>
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{ required: "Enter Collected Amount" }}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        inputRef={amountRef}
                        label="COLLECTED AMOUNT"
                        onKeyDown={handleEnterPress} // Add onKeyDown here
                      />
                    )}
                  />
                  <p className='err-msg'>{errors.amount?.message}</p>
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name="remark"
                    control={control}
                    rules={{ required: "Enter Remark" }}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="text"
                        inputRef={remarkRef}
                        onKeyDown={onEnterPress} // Add onKeyDown here
                        label="REMARK"
                      />
                    )}
                  />
                  <p className='err-msg'>{errors.amount?.remark}</p>
                </Grid>

                <Grid item xs={12} container spacing={2}>
                  <Grid item xs={9}>
                    <Typography variant="body1" fontWeight={700} align='left'>
                      Remaining Amount {owedAmount}/-
                    </Typography>
                  </Grid>
                  <Grid item alignItems="right">
                    <Button variant="contained" color="primary" type="submit">
                      Submit
                    </Button>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <div className={styles.tableBody}>
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell align="left">INDEX</TableCell>
                            <TableCell align="right">NAME</TableCell>
                            <TableCell align="right">AMOUNT</TableCell>
                            <TableCell align="right">PRINT STATUS</TableCell>
                            <TableCell align="right">PRINT</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {printTable?.map((row, index) => (
                            <TableRow
                              key={row.name}
                              sx={{ lineHeight: '20px' }}
                            >
                              <TableCell sx={{ padding: "4px 8px", lineHeight: "1.5rem" }} component="th" scope="row">
                                {index + 1}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px", lineHeight: "1.5rem" }} align="right">{row.name}</TableCell>
                              <TableCell sx={{ padding: "4px 8px", lineHeight: "1.5rem" }} align="right">{row.amount}</TableCell>
                              <TableCell sx={{ padding: "4px 8px", lineHeight: "1.5rem" }} align="right">{row.printStatus}</TableCell>
                              <TableCell sx={{ padding: "4px 8px", lineHeight: "1.5rem" }} align="right"><Button onClick={()=>rePrintPrev(row,index)} ><PrintIcon /></Button></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TableContainer>
                </Grid>
              </Grid>
            </form>
            <div>
              <Snackbar
                open={open}
                autoHideDuration={1500}
                onClose={handleClose}
              >
                <Alert
                  onClose={handleClose}
                  severity="success"
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  SUCCESSFULLY ADDED. SYNC TO SAVE.
                </Alert>
              </Snackbar>
            </div>
            <div style={{ display: 'none' }}>
              <div ref={printRef} className={styles.printContainer}>
                <div>Vyapari Name: {printData?.vyapariName}</div>
                <div>Mobile: {printData?.mobile}</div>
                <div>Date: {printData?.date}</div>
                <div>Amount: {printData?.amount}</div>
              </div>
            </div>
          </>
        )}
    </>

  );
}

export default VasuliTransaction;
