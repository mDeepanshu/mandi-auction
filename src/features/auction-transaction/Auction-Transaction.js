import React, { useEffect, useState } from 'react';
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

  const { control, getValues, formState: { errors }, trigger } = useForm();
  const [itemsList, setItemsList] = useState([]);
  const [kisanList, setKisanList] = useState([]);
  const [vyapariList, setVyapariList] = useState([]);
  const [buyItemsArr, setTableData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSuccessTransactionDialog, setSuccessTransactionDialog] = useState(false);
  const { loading } = useOutletContext();

  const matches = useMediaQuery('(min-width:600px)');
  const matchesTwo = useMediaQuery('(max-width:599px)');

  const onSubmit = async () => {
    const data = getValues();
    const isValid = await trigger(['kisaan', 'vyapari', 'itemName']);
    if (isValid && buyItemsArr.length) {
      const buyItems = buyItemsArr.map(obj => {
        const { vyapariName, ...rest } = obj; // Destructure and omit the city property
        return rest; // Return the rest of the object
      });
      const auctionData = {
        "kisanId": data.kisaan.partyId,
        "itemId": data.itemName.itemId,
        buyItems
      }
      try {
        await addAuctionTransaction(auctionData);
        setSuccessTransactionDialog(true);
      } catch (error) {
        console.log(error);
      }
    } else {
      if (!buyItemsArr.length) {
        setOpen(true);
      }
    }
  };

  const addToTable = async () => {
    const result = await trigger(["kisaan", "itemName", "vyapari", "quantity", "rate", "bag"]);
    if (result) {
      const values = getValues();
      let newTableData = [
        ...buyItemsArr,
        {
          vyapariName: values.vyapari.name,
          vyapariId: values.vyapari.partyId,
          quantity: Number(values.quantity),
          rate: Number(values.rate),
          bag: Number(values.bag),
        }
      ];
      setTableData(newTableData);
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
      // console.log(listName, list);
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

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setSuccessTransactionDialog(false);
  };

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
        <Grid container spacing={2} p={1}>
          <Grid item xs={12} className='hidden-xs'>
            <h1>AUCTION TRANSACTION</h1>
          </Grid>
          <Grid item xs={6}>
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
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="itemName"
              control={control}
              rules={{ required: "Enter Item" }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
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
          </Grid>
          <Grid container item spacing={2}>
            <Grid item md={4} xs={6}>
              <Controller
                name="vyapari"
                control={control}
                rules={{ required: "Enter Vyapari Name" }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
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
            </Grid>
            <Grid item md={2} xs={6}>
              <Controller
                name="quantity"
                control={control}
                rules={{ required: "Enter Quantity" }}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="QUANTITY" type='number' variant="outlined" />}
              />
              <p className='err-msg'>{errors.quantity?.message}</p>
            </Grid>
            <Grid item md={2} xs={4}>
              <Controller
                name="rate"
                control={control}
                rules={{ required: "Enter Rate" }}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="RATE" type='number' variant="outlined" />}
              />
              <p className='err-msg'>{errors.rate?.message}</p>
            </Grid>
            <Grid item md={2} xs={4}>
              <Controller
                name="bag"
                control={control}
                rules={{ required: "Enter Bag" }}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="BAG" variant="outlined" />}
              />
              <p className='err-msg'>{errors.bag?.message}</p>
            </Grid>
            <Grid item md={2} xs={4}>
              <Button variant="contained" color="primary" sx={{ height: '3.438rem' }} onClick={addToTable}><AddCircleOutline /></Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow style={{ display: matches ? 'table-row' : 'none' }}>
                    <TableCell>VYAPARI NAME</TableCell>
                    <TableCell>QUANTITY</TableCell>
                    <TableCell>RATE</TableCell>
                    <TableCell>BAG</TableCell>
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
                      <TableCell>{row.bag}</TableCell>
                      <TableCell>{row.rate * row.quantity}</TableCell>
                      <TableCell onClick={() => deleteFromTable(index)}><Button><Delete /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
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
          <Grid item xs={12} container justifyContent="flex-end">
            <Button type="button" variant="contained" color="primary" onClick={onSubmit}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default AuctionTransaction;
