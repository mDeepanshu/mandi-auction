import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, InputAdornment, TableRow, Paper, TextField, Button, useMediaQuery } from '@mui/material';
import { addAuctionTransaction } from "../../gateway/auction-transaction-apis";
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import { getAllItems } from "../../gateway/curdDB";
import "./auction-transaction.css"
import { Delete, AddCircleOutline } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import { useOutletContext } from 'react-router-dom';

function AuctionTransaction() {

  const { control, getValues, formState: { errors }, register, trigger, reset, setValue, setFocus } = useForm();
  const [itemsList, setItemsList] = useState([]);
  const [kisanList, setKisanList] = useState([]);
  const [vyapariList, setVyapariList] = useState([]);
  const [buyItemsArr, setTableData] = useState([]);
  const [open, setOpen] = useState(false);
  const [qtyTotal, setQtyTotal] = useState(0);
  const [openSuccessTransactionDialog, setSuccessTransactionDialog] = useState(false);
  const { loading } = useOutletContext();

  const matches = useMediaQuery('(min-width:600px)');
  const matchesTwo = useMediaQuery('(max-width:599px)');
  const [qty, setQty] = useState([]);

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

    const result = await trigger(["kisaan", "itemName", "vyapari", "rate", "bags"]);
    if (!qtyTotal || qtyTotal<=0) {
      return;
    }
    if (result) {
      const values = getValues();
      let newTableData = [
        ...buyItemsArr,
        {
          vyapariName: values.vyapari.name,
          vyapariId: values.vyapari.partyId,
          quantity: Number(qtyTotal),
          rate: Number(values.rate),
          bags: Number(values.bags),
        }
      ];
      setTableData(newTableData);
      setQty([]);
      setQtyTotal(0);
      setValue('rate',null);
      setValue('bags','');
    } else {
      console.log('Validation failed');
    }
  }

  const deleteFromTable = (index) => {
    const newRows = [...buyItemsArr];
    newRows.splice(index, 1);
    setTableData(newRows);
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

    // qtyRef.current.focus();
    // setFocus('rate');


  };

  const removeQty = (event, index) => {
    event.preventDefault();
    const newQty = [...qty];
    newQty.splice(index, 1);
    setQty(newQty);
    const currentVal = getValues('bags');
    setValue('bags', Number(currentVal) - 1, { shouldValidate: true, shouldDirty: true });

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
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="KISAAN"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, value) => field.onChange(value)}
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
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, value) => field.onChange(value)}
                  disablePortal
                  id="combo-box-demo"
                />
              )}
            />
            <p className='err-msg'>{errors.itemName?.message}</p>
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
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="VYAPARI"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, value) => field.onChange(value)}
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
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ required: "Enter Quantity" }}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="QUANTITY"
                      type="number"
                      variant="outlined"
                    />
                  )}
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
            {/* <Controller
              name="rate"
              control={control}
              rules={{ required: "Enter Rate" }}
              defaultValue=""
              render={({ field }) => <TextField {...field} useRef={rateRef} fullWidth label="RATE" type='number' variant="outlined" />}
            />
            <p className='err-msg'>{errors.rate?.message}</p> */}
            {/* <label htmlFor="rate">Rate</label> */}
            <input
              id="rate"
              className='rate-field'
              placeholder='RATE'
              {...register("rate", { required: "First name is required" })}
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
                    <TableCell>VYAPARI NAME</TableCell>
                    <TableCell>QUANTITY</TableCell>
                    <TableCell>RATE</TableCell>
                    <TableCell>BAGS</TableCell>
                    <TableCell>TOTAL</TableCell>
                    <TableCell>DELETE</TableCell>
                  </TableRow>
                  <TableRow style={{ display: matchesTwo ? 'table-row' : 'none' }}>
                    <TableCell>VYAPARI</TableCell>
                    <TableCell>Q</TableCell>
                    <TableCell>R</TableCell>
                    <TableCell>B</TableCell>
                    <TableCell>T</TableCell>
                    <TableCell>D</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buyItemsArr.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.vyapariName}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{row.rate}</TableCell>
                      <TableCell>{row.bags}</TableCell>
                      <TableCell>{row.rate * row.quantity}</TableCell>
                      <TableCell onClick={() => deleteFromTable(index)}><Button><Delete /></Button></TableCell>
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
    </>
  );
}

export default AuctionTransaction;
