import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, InputAdornment, TableRow, Paper, Button, useMediaQuery, Switch, FormControlLabel } from '@mui/material';
import { addAuctionTransaction } from "../../gateway/auction-transaction-apis";
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import { getAllItems } from "../../gateway/curdDB";
import styles from "./auction-transaction.css"
import { Delete, AddCircleOutline, Edit } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import { useOutletContext } from 'react-router-dom';
import OnGoingAuctions from "../../dialogs/ongoing-auctions/ongoing-auctions";
import { StyledTableCell } from "../../shared/ui/elements/Table-Cell";

function AuctionTransaction() {

  const { control, getValues, formState: { errors }, register, trigger, reset, setValue, setFocus, watch } = useForm();
  const [itemsList, setItemsList] = useState([]);
  const [kisanList, setKisanList] = useState([]);
  const [vyapariList, setVyapariList] = useState([]);
  const [buyItemsArr, setTableData] = useState([]);
  const [open, setOpen] = useState(false);
  const [isOnGoingAuctionOpen, setIsOnGoingAuctionOpen] = useState(false);
  const [qtyTotal, setQtyTotal] = useState(0);
  const [openSuccessTransactionDialog, setSuccessTransactionDialog] = useState(false);
  const { loading } = useOutletContext();
  const vyapariRef = useRef(null); // Create a ref

  const matches = useMediaQuery('(min-width:600px)');
  const matchesTwo = useMediaQuery('(max-width:599px)');
  const [qty, setQty] = useState([]);
  const [auctionId, setAuctionId] = useState([]);
  const kisanRef = useRef(null);
  const itemRef = useRef(null);
  const totalBagInputRef = useRef(null);
  const auctionType = watch("auctionType");
  // const auctionType = false;

  const onSubmit = async () => {

    const data = getValues();
    const isValid = await trigger(['kisaan', 'itemName']);


    if (isValid && buyItemsArr.length) {
      const buyItems = buyItemsArr.map(obj => {
        const { vyapariName, ...rest } = obj;
        return rest;
      });
      const auctionData = {
        "kisanId": data.kisaan.partyId,
        "itemId": data.itemName.itemId,
        buyItems,
        auctionDate: new Date(new Date(new Date().getTime() + 19800000))
      }
      try {
        await addAuctionTransaction(auctionData);
        setSuccessTransactionDialog(true);
        reset();
        setValue('kisaan', null);
        setValue('itemName', null);
        setValue('totalBag', null);
        setTableData([]);
        let oldLocal = JSON.parse(localStorage.getItem("onGoingAuction"));
        let newLocal = oldLocal;
        delete newLocal[auctionId];
        localStorage.setItem("onGoingAuction", JSON.stringify(newLocal));
        document.title = `Mandi Auction`;
        if (kisanRef.current) {
          setTimeout(() => {
            kisanRef.current.focus();
          }, 0);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      if (!buyItemsArr.length) {
        setOpen(true);
      }
    }
  };


  const addBag = (event, adding) => {
    event.preventDefault();
    const currentVal = getValues('bags');
    if (adding) {
      setValue('bags', Number(currentVal) + 1, { shouldValidate: true, shouldDirty: true });
    } else {
      setValue('bags', Number(currentVal) - 1, { shouldValidate: true, shouldDirty: true });
    }

  }

  const addToTable = async (event) => {
    if (event) {
      event.preventDefault();
    }
    const result = await trigger(["kisaan", "itemName", "vyapari", "bags"]);
    if (!auctionType && (!qtyTotal || qtyTotal <= 0)) {
      return;
    }
    if (result) {
      const values = getValues();
      const newAuctionRow = {
        vyapariName: values.vyapari.name,
        vyapariId: values.vyapari.partyId,
        rate: Number(values.rate),
        auctionDate: new Date()
      };

      if (auctionType) {
        newAuctionRow.quantity = Number(values.nag);
        newAuctionRow.chungi = Number(values.chungi);
      } else {
        newAuctionRow.quantity = Number(qtyTotal);
        newAuctionRow.bags = Number(values.bags);
      }

      let newTableData = [
        newAuctionRow,
        ...buyItemsArr
      ];

      setTableData(newTableData);
      setQty([]);
      setQtyTotal(0);
      setValue('rate', null);
      setValue('vyapari', null);
      if (auctionType) {
        setValue('nag', null);
      } else {
        setValue('bags', '');
        setValue('quantity', null);
      }

      const currAuctionSate = {
        formValues: getValues(),
        arrayData: newTableData,
        id: auctionId
      }
      let oldLocal = JSON.parse(localStorage.getItem("onGoingAuction"));
      oldLocal[auctionId] = currAuctionSate;
      localStorage.setItem("onGoingAuction", JSON.stringify(oldLocal));

      vyapariRef.current.focus();
    } else {
      console.log('Validation failed');
    }
  }

  const editFromTable = (index) => {
    const defaultOption = vyapariList.find(option => option.name == buyItemsArr[index]?.vyapariName);
    reset({
      ...getValues(),
      ...buyItemsArr[index],
      vyapari: defaultOption
    });
    setQtyTotal(buyItemsArr[index]?.quantity);
    const newRows = [...buyItemsArr];
    newRows.splice(index, 1);
    setTableData(newRows);
  }

  const deleteFromTable = (index) => {
    const newRows = [...buyItemsArr];
    newRows.splice(index, 1);
    setTableData(newRows);

    const currAuctionSate = {
      formValues: getValues(),
      arrayData: newRows,
      id: auctionId
    }
    let oldLocal = JSON.parse(localStorage.getItem("onGoingAuction"));
    oldLocal[auctionId] = currAuctionSate;
    localStorage.setItem("onGoingAuction", JSON.stringify(oldLocal));
  }

  const fetchList = async (listName) => {
    try {
      const list = await getAllItems(listName);
      switch (listName) {
        case "VYAPARI":
          setVyapariList(list);
          break;
        case "KISAN":
          setKisanList(list);
          break;
        case "items":
          setItemsList(list);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    const anyPreviousAuctions = JSON.parse(localStorage.getItem("onGoingAuction"));
    if (anyPreviousAuctions && Object.keys(anyPreviousAuctions)?.length > 0) setIsOnGoingAuctionOpen(true);
    else {
      const newAuction = {}
      localStorage.setItem("onGoingAuction", JSON.stringify(newAuction));

      const newAuctionId = Date.now().toString(16);
      setAuctionId(newAuctionId);
      kisanRef.current.focus();
    }

  }, []);

  useEffect(() => {
    fetchList("VYAPARI");
    fetchList("KISAN");
    fetchList("items");
  }, [loading]);

  useEffect(() => {
    const sum = qty.reduce((accumulator, currentValue) => {
      return accumulator + Number(currentValue);
    }, 0);
    setQtyTotal(sum);
  }, [qty]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setSuccessTransactionDialog(false);
  };

  const newQty = (event) => {
    event.preventDefault();
    const value = getValues('quantity');
    if (!value) {
      setFocus('rate');
      return;
    }
    setQty([...qty, value]);
    const currentVal = getValues('bags');
    setValue('bags', Number(currentVal) + 1, { shouldValidate: true, shouldDirty: true });
    setValue('quantity', '', { shouldValidate: false, shouldDirty: true });
  };

  const removeQty = (event, index) => {
    event.preventDefault();
    const newQty = [...qty];
    newQty.splice(index, 1);
    setQty(newQty);
    const currentVal = getValues('bags');
    setValue('bags', Number(currentVal) - 1, { shouldValidate: true, shouldDirty: true });

  }

  const vasuliDays = (maxLoanDays, lastVasuliDateString) => {
    const todaysDate = new Date();
    const lastVasuliDate = new Date(lastVasuliDateString);
    const diffInMs = Math.abs(todaysDate - lastVasuliDate);
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays > maxLoanDays;
  }

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const handleCloseDialog = (data) => {
    setIsOnGoingAuctionOpen(false);
    if (data) {
      // setValue('kisaan', data?.formValues?.kisaan);
      // setValue('itemName', data?.formValues?.itemName);
      // setValue('totalBag', data?.formValues?.totalBag);
      reset(data?.formValues);
      setTableData(data.arrayData);
      setAuctionId(data.id);
      document.title = data?.formValues?.kisaan?.name;
    } else {
      const newAuctionId = Date.now().toString(16);
      setAuctionId(newAuctionId);
    }
    if (vyapariRef.current) {
      setTimeout(() => {
        vyapariRef.current.focus();
      }, 0);
    }
  };

  const fieldValueChange = (event, fieldName) => {
    if (fieldName === "kisaan") itemRef.current.focus();
    if (getValues()?.kisaan?.name) {
      document.title = getValues().kisaan.name;
    } else {
      document.title = `Mandi Auction`;
    }
  }

  const handleEnterKeyPress = (val) => {
    if (val === 'submit' || auctionType) addToTable();
    else setFocus('bags');
  }
  const debounceTimeout = useRef(null);

  const autoSetVyapari = (event) => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setValue('vyapari', vyapariList.find(option => {
        const val = event.target.value.toLowerCase();
        if (option.name.toLowerCase() == val || option.idNo == val) {
          setFocus('quantity');
        }
        return option.name.toLowerCase() == val || option.idNo == val;
      }
      ));
    }, 100);
  }

  useEffect(() => {
    return () => clearTimeout(debounceTimeout.current);
  }, []);

  const changeAuctionType = () => {
    // setAuctionType((prevState) => !prevState);
  }

  return (
    <>
      <form>
        <div className='container'>
          <div className='full-grid-heading hidden-xs'>
            <h1>AUCTION TRANSACTION</h1>
          </div>
          <div className='switch'>
            <FormControlLabel
              control={
                <Controller
                  name="auctionType"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.checked);
                        changeAuctionType(event.target.checked);
                      }}
                      disabled={buyItemsArr.length > 0}
                    />
                  )}
                />
              }
              label="TYPE"
            />
          </div>
          <div className='kisan'>
            <Controller
              name="kisaan"
              control={control}
              rules={{ required: "Enter Kisaan Name" }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  value={field.value || null}
                  options={kisanList}
                  disabled={getValues()?.kisaan?.name && buyItemsArr.length > 0}
                  getOptionLabel={(option) => `${option.id} | ${option.name}`}
                  filterOptions={(options, state) =>
                    options
                      .filter((option) =>
                        option.name.toUpperCase().includes(state.inputValue.toUpperCase()) || option.idNo.includes(state.inputValue)
                      )
                      .slice(0, 5)
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>
                          <strong>ID:</strong> {option.id} | <strong>Name:</strong> {option.name}
                        </span>
                      </div>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="KISAAN"
                      disabled={getValues()?.kisaan?.name && buyItemsArr.length > 0}
                      InputProps={{
                        ...params.InputProps,
                        inputRef: kisanRef, // Attach the ref here
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        ...params.inputProps,
                        style: {
                          textTransform: "uppercase", // Ensure uppercase transformation here
                        },
                      }}
                    />
                  )}
                  onChange={(event, value) => {
                    field.onChange(value);
                    fieldValueChange(event, "kisaan");
                  }}
                  disablePortal
                  id="combo-box-demo"
                />
              )}
            />
            <p className='err-msg'>{errors.kisaan?.message}</p>
          </div>
          <div className='item'>
            <Controller
              name="itemName"
              control={control}
              rules={{ required: "Enter Item" }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  value={field.value || null}
                  options={itemsList}
                  disabled={getValues()?.itemName && buyItemsArr.length > 0}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.itemId === value.itemId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ITEM"
                      disabled={getValues()?.itemName && buyItemsArr.length > 0}
                      InputProps={{
                        ...params.InputProps,
                        inputRef: itemRef,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        ...params.inputProps,
                        style: {
                          textTransform: "uppercase", // Ensure uppercase transformation here
                        },
                      }}
                    />
                  )}
                  onChange={(event, value) => {
                    field.onChange(value); // Updates the React Hook Form state
                    totalBagInputRef.current.focus();
                  }}
                  disablePortal
                  id="combo-box-demo"
                />
              )}
            />
            <p className='err-msg'>{errors.itemName?.message}</p>
          </div>
          <div className="totalBags">
            <Controller
              name="totalBag"
              control={control}
              defaultValue=""
              rules={{ required: "Enter Total Bags" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Total Bags"
                  placeholder="Total Bags"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  error={!!error}
                  inputRef={totalBagInputRef}
                />
              )}
            />
            <p className="err-msg">{errors.totalBag?.message}</p>
          </div>
          <div className='vyapari'>
            <Controller
              name="vyapari"
              control={control}
              rules={{ required: "Enter Vyapari Name" }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  value={field.value || null}
                  options={vyapariList}
                  getOptionLabel={(option) => `${option.idNo} | ${option.name}`}
                  filterOptions={(options, state) =>
                    options
                      .filter((option) =>
                        option.name.toUpperCase().includes(state.inputValue.toUpperCase()) || option.idNo.includes(state.inputValue)
                      )
                      .slice(0, 5)
                  }
                  isOptionEqualToValue={(option, value) => option.idNo === value.idNo}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>
                          {option.idNo} <strong>|</strong> {option.name}
                        </span>
                        {vasuliDays(option.maxLoanDays, option.lastVasuliDate) && (
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: "red",
                              marginLeft: "4px",
                              borderRadius: "50%", // Makes it a circle
                              display: "inline-block", // Ensures it stays inline
                            }}
                          ></div>
                        )}
                      </div>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="VYAPARI"
                      InputProps={{
                        ...params.InputProps,
                        inputRef: vyapariRef,
                      }}
                      inputProps={{
                        ...params.inputProps,
                        style: {
                          textTransform: "uppercase", // Ensure uppercase transformation here
                        },
                      }}
                      onInput={autoSetVyapari}
                    />
                  )}
                  onChange={(event, value) => {
                    field.onChange(value); // Updates the React Hook Form state
                    setFocus('quantity');
                  }}
                  disablePortal
                  id="combo-box-demo"
                />
              )}
            />
            <p className='err-msg'>{errors.vyapari?.message}</p>
          </div>
          <div className='quantity'>
            <div className='qty-input'>
              <div>
                {auctionType ? (
                  <>
                    <TextField
                      {...register("nag", { required: "ENTER NAG" })}
                      fullWidth
                      label="NAG"
                      type="number"
                      variant="outlined"
                    />
                    <p className="err-msg">{errors.nag?.message}</p>
                  </>
                ) : (
                  <>
                    <TextField
                      {...register("quantity", { required: "Enter Quantity" })}
                      fullWidth
                      label="QUANTITY"
                      type="number"
                      variant="outlined"
                    />
                    <p className="err-msg">{errors.quantity?.message}</p>
                  </>
                )}
              </div>
              <button className='add-qty-btn' onClick={newQty}>A</button>
            </div>
            {!auctionType && <div className='quantity-list'>
              <ul className="horizontal-list">
                {qty.map((item, index) => (
                  <li
                    key={index}
                  >{item}<button className='qty-btn' onClick={(event) => removeQty(event, index)}>x</button></li>
                ))}
              </ul>
              <div className='qty-total'>{qtyTotal}</div>
            </div>}
          </div>
          <div className='rate'>
            <TextField
              {...register("rate", { required: "Rate is required" })}
              fullWidth
              label="RATE"
              type="number"
              variant="outlined"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEnterKeyPress(``);
                }
              }}
            />
            {errors.rate && <p className='err-msg'>{errors.rate.message}</p>}
          </div>
          <div className='bags-box'>
            <div className='bag'>
              {
                !auctionType ? (
                  <>
                    <TextField
                      {...register("bags", { required: "Bags is required" })}
                      fullWidth
                      label="Bags"
                      placeholder='Bags'
                      type="number"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleEnterKeyPress(`submit`);
                        }
                      }}
                    />
                    <p className='err-msg'>{errors.bags?.message}</p>
                  </>
                ) : (
                  <>
                    <TextField
                      {...register("chungi", { required: "CHUNGI is required" })}
                      fullWidth
                      label="CHUNGI"
                      placeholder='CHUNGI'
                      type="number"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleEnterKeyPress(`submit`);
                        }
                      }}
                    />
                    <p className='err-msg'>{errors.chungi?.message}</p>
                  </>)
              }

            </div>
            <div className='btn-1 count-btn'>
              <button onClick={(event) => addBag(event, true)} className='add-btn secondary-btn one'>
                +
              </button>
              <button onClick={(event) => addBag(event, false)} className='add-btn secondary-btn one two'>
                -
              </button>
            </div>
          </div>
          <div className='btn-2'>
            <button onClick={(event) => addToTable(event)} className='add-btn'>Add Entry  <AddCircleOutline fontSize='small' /></button>
          </div>
          <div className='full-grid'>
            <TableContainer component={Paper} className='table_container'>
              <Table stickyHeader>
                <TableHead>
                  <TableRow style={{ display: matches ? 'table-row' : 'none' }}>
                    <TableCell align="left"><b>VYAPARI NAME</b></TableCell>
                    {auctionType ? (
                      <>
                        <TableCell align="left"><b>NAG</b></TableCell>
                        <TableCell align="left"><b>RATE</b></TableCell>
                        <TableCell align="left"><b>CHUNGI</b></TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align="left"><b>QUANTITY</b></TableCell>
                        <TableCell align="left"><b>RATE</b></TableCell>
                        <TableCell align="left"><b>BAGS</b></TableCell>
                      </>
                    )}
                    <TableCell><b>TOTAL</b></TableCell>
                    <TableCell align="centre"><b>EDIT</b></TableCell>
                    <TableCell align="centre"><b>DELETE</b></TableCell>
                  </TableRow>
                  <TableRow style={{ display: matchesTwo ? 'table-row' : 'none' }}>
                    <TableCell align="left">VYAPARI</TableCell>
                    {auctionType ? (
                      <>
                        <TableCell align="left">N</TableCell>
                        <TableCell align="left">R</TableCell>
                        <TableCell align="left">C</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align="left">Q</TableCell>
                        <TableCell align="left">R</TableCell>
                        <TableCell align="left">B</TableCell>
                      </>
                    )}
                    <TableCell align="left">T</TableCell>
                    <TableCell align="centre">E</TableCell>
                    <TableCell align="centre">D</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buyItemsArr.map((row, index) => (
                    <TableRow key={index}>
                      <StyledTableCell sx={{ width: "45%" }} align="left">{row.vyapariName}</StyledTableCell>
                      <StyledTableCell align="left">{row.quantity}</StyledTableCell>
                      {auctionType ? (
                        <>
                          <StyledTableCell align="left">{row.rate}</StyledTableCell>
                          <StyledTableCell align="left">{row.chungi}</StyledTableCell>
                          <StyledTableCell align="left">{row.rate * row.quantity + row.chungi}</StyledTableCell>

                        </>
                      ) : (
                        <>
                          <StyledTableCell align="left">{row.rate}</StyledTableCell>
                          <StyledTableCell align="left">{row.bags}</StyledTableCell>
                          <StyledTableCell align="left">{row.rate * row.quantity}</StyledTableCell>
                        </>
                      )}
                      <StyledTableCell align='centre'><Button onClick={() => editFromTable(index)}><Edit /></Button></StyledTableCell>
                      <StyledTableCell align='centre'><Button onClick={() => deleteFromTable(index)}><Delete /></Button></StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div className='full-grid submit-area'>
            <Button type="button" variant="contained" color="primary" onClick={onSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </form>
      <div>
        <Snackbar
          open={open}
          autoHideDuration={1000}
          message="ADD ATLEST ONE TRANSACTION"
          action={action}
          onClose={handleClose}
        />
      </div>
      <div>
        <Snackbar
          open={openSuccessTransactionDialog}
          autoHideDuration={1000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            TRANSACTION SUCCESSFULLY ADDED.
          </Alert>
        </Snackbar>
      </div>
      <OnGoingAuctions open={isOnGoingAuctionOpen} onClose={handleCloseDialog} />
    </>
  );
}

export default AuctionTransaction;
