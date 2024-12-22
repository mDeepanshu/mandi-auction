import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Typography, TextField, InputAdornment, Button, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { addVasuliTransaction, getOwedAmount } from "../../gateway/vasuli-transaction-apis";
import { getAllItems } from "../../gateway/curdDB";
import Login from "../login/login";
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';


function VasuliTransaction() {



  const [vyapariList, setVyapariList] = useState([]);
  const [owedAmount, setOwedAmount] = useState("");
  const [loginStatus, setLoginStatus] = useState(true);
  const [open, setOpen] = useState(false);

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

  const { handleSubmit, control, formState: { errors }, getValues,reset,setValue,watch } = useForm({
    defaultValues: {
      date: priorDate,
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
          console.error("Error fetching owed amount:", error);
          setOwedAmount(""); // Handle error by resetting owed amount
        }
      };
    
      console.log(watchedVyapariId);
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
    const vasuliTran = {
      ...getValues(),
      vyapariId:getValues().vyapariId.partyId,
    }
    console.log("onSubmit",vasuliTran);
    try {
      await addVasuliTransaction(vasuliTran);
      reset({
        vyapariId:null,
        amount: '',
        remark: '',
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

  const onPartySelect = () => async (value) => {
    console.log("PPPPPPP");
    
    // field.onChange(value?.partyId ?? ""); // Update the form value
    // if (value?.partyId) {
    //   const partyDetails = await getOwedAmount(value?.partyId);
    //   setOwedAmount(partyDetails?.data?.responseBody?.owedAmount);

    // } else setOwedAmount("");
  }

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

  return (
    <>
      {
        loginStatus ? (<Login changeLoginState={changeLoginState} />) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3} p={3}>
                <Grid item xs={12}>
                  <Typography variant="h4" component="h1" align="left">
                    VASULI TRANSACTION
                  </Typography>
                </Grid>

                <Grid item xs={7}>
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
                        onChange={(event, newValue) =>field.onChange(newValue)}                        
                        disablePortal
                        id="combo-box-demo"
                      />
                    )}
                  />
                  <p className='err-msg'>{errors.vyapariId?.message}</p>
                </Grid>

                <Grid item xs={6}>
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
                <Grid item xs={6}>
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
                <Grid item xs={12}>
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
          </>
        )}
    </>

  );
}

export default VasuliTransaction;
