import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, InputAdornment, TableRow, Paper, TextField, Button, useMediaQuery } from '@mui/material';
import { addAuctionTransaction } from "../../gateway/auction-transaction-apis";
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import { getAllItems } from "../../gateway/curdDB";
import styles from "./auction-transaction.css"
import { Delete, AddCircleOutline, Edit } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import { json, useOutletContext } from 'react-router-dom';
import OnGoingAuctions from "../../dialogs/ongoing-auctions/ongoing-auctions";

function AuctionTransaction() {

  const { control, getValues, formState: { errors }, register, trigger, reset, setValue, setFocus } = useForm();
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
        buyItems
      }
      try {
        await addAuctionTransaction(auctionData);
        setSuccessTransactionDialog(true);
        reset();
        setTableData([]);
        let oldLocal = JSON.parse(localStorage.getItem("onGoingAuction"));
        let newLocal = oldLocal;
        delete newLocal[auctionId];
        localStorage.setItem("onGoingAuction", JSON.stringify(newLocal));
        document.title = `Mandi Auction`;
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
    event.preventDefault();

    const result = await trigger(["kisaan", "itemName", "vyapari", "bags"]);
    if (!qtyTotal || qtyTotal <= 0) {
      return;
    }
    if (result) {
      const values = getValues();
      const newAuctionRow = {
        vyapariName: values.vyapari.name,
        vyapariId: values.vyapari.partyId,
        quantity: Number(qtyTotal),
        rate: Number(values.rate),
        bags: Number(values.bags),
      };

      let newTableData = [
        ...buyItemsArr,
        newAuctionRow
      ];

      setTableData(newTableData);
      setQty([]);
      setQtyTotal(0);
      setValue('rate', null);
      setValue('bags', '');
      setValue('vyapari', null);
      setValue('quantity', null);

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
    const defaultOption = vyapariList.find(option =>  option.name == buyItemsArr[index]?.vyapariName);
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
      reset(data.formValues);
      setTableData(data.arrayData);
      setAuctionId(data.id);
      document.title = data?.formValues?.kisaan?.name; 
    } else {
      const newAuctionId = Date.now().toString(16);
      setAuctionId(newAuctionId);
    }
    if (kisanRef.current) {
      setTimeout(() => {
        kisanRef.current.focus();
      }, 0);
    }
  };

  const fieldValueChange = (event, fieldName) => {
    if (fieldName === "kisaan") itemRef.current.focus();
    if (getValues()?.kisaan?.name) {
      document.title = getValues().kisaan.name;
    }else{
      document.title = `Mandi Auction`;
    }
  }

  return (
    <>
      <form>
        <div className='container'>
          <div className='full-grid hidden-xs'>
            <h1>AUCTION TRANSACTION</h1>
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
                  getOptionLabel={(option) => `${option.id} | ${option.name}`}
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
                      InputProps={{
                        ...params.InputProps,
                        inputRef: kisanRef, // Attach the ref here
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, value) => {
                    field.onChange(value); // Updates the React Hook Form state
                    fieldValueChange(event, "kisaan"); // Calls the custom function
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
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ITEM"
                      InputProps={{
                        ...params.InputProps,
                        inputRef: itemRef, // Attach the ref here
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, value) => {
                    field.onChange(value); // Updates the React Hook Form state
                    setFocus('totalBag');
                  }}
                  disablePortal
                  id="combo-box-demo"
                />
              )}
            />
            <p className='err-msg'>{errors.itemName?.message}</p>
          </div>
          <div className="totalBags">
            <TextField
              {...register("totalBag", { required: "Enter Total Bags" })}
              fullWidth
              label="Total Bags"
              type="number"
              variant="outlined"
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
                  renderOption={(props, option) => (
                    <li {...props}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>
                          <strong>ID:</strong> {option.idNo} | <strong>Name:</strong> {option.name}
                        </span>
                        {vasuliDays(option.maxLoanDays, option.lastVasuliDate) && (
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: "red",
                              marginLeft: "8px",
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
                        inputRef: vyapariRef, // Attach the ref here
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
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
                <TextField
                  {...register("quantity", { required: "Enter Quantity" })}
                  fullWidth
                  label="QUANTITY"
                  type="number"
                  variant="outlined"
                />
                <p className='err-msg'>{errors.quantity?.message}</p>
              </div>
              <button className='add-qty-btn' onClick={newQty}>ADD</button>
            </div>
            <div className='quantity-list'>
              <ul className="horizontal-list">
                {qty.map((item, index) => (
                  <li
                    key={index}
                  >{item}<button className='qty-btn' onClick={(event) => removeQty(event, index)}>x</button></li>
                ))}
              </ul>
              <div className='qty-total'>{qtyTotal}</div>
            </div>
          </div>
          <div className='rate'>
            <input
              id="rate"
              className='rate-field'
              type='number'
              placeholder='RATE'
              {...register("rate", { required: "Rate is required" })}
            />
            {errors.rate && <p className='err-msg'>{errors.rate.message}</p>}
          </div>
          <div className='bags-box'>
            <div className='bag'>
              <Controller
                name="bags"
                control={control}
                rules={{ required: "Enter Bags" }}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="BAGS" variant="outlined" type='number' />}
              />
              <p className='err-msg'>{errors.bags?.message}</p>
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow style={{ display: matches ? 'table-row' : 'none' }}>
                    <TableCell align="left">VYAPARI NAME</TableCell>
                    <TableCell align="left">QUANTITY</TableCell>
                    <TableCell align="left">RATE</TableCell>
                    <TableCell align="left">BAGS</TableCell>
                    <TableCell align="left">TOTAL</TableCell>
                    <TableCell align='centre'>EDIT</TableCell>
                    <TableCell align='centre'>DELETE</TableCell>
                  </TableRow>
                  <TableRow style={{ display: matchesTwo ? 'table-row' : 'none' }}>
                    <TableCell align="left">VYAPARI</TableCell>
                    <TableCell align="left">Q</TableCell>
                    <TableCell align="left">R</TableCell>
                    <TableCell align="left">B</TableCell>
                    <TableCell align="left">T</TableCell>
                    <TableCell align='centre'>E</TableCell>
                    <TableCell align='centre'>D</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buyItemsArr.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell align="left">{row.vyapariName}</TableCell>
                      <TableCell align="left">{row.quantity}</TableCell>
                      <TableCell align="left">{row.rate}</TableCell>
                      <TableCell align="left">{row.bags}</TableCell>
                      <TableCell align="left">{row.rate * row.quantity}</TableCell>
                      <TableCell align='centre'><Button onClick={() => editFromTable(index)}><Edit /></Button></TableCell>
                      <TableCell align='centre'><Button onClick={() => deleteFromTable(index)}><Delete /></Button></TableCell>
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
