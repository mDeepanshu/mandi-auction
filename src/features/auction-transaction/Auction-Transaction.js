import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, InputAdornment, TableRow, Paper, TextField, Button, useMediaQuery } from '@mui/material';
import { addAuctionTransaction } from "../../gateway/auction-transaction-apis";
import { getItems, getAllParties } from "../../gateway/common-apis";
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import { addItem, deleteItem, getAllItems, getItem } from "../../gateway/curdDB";
import "./auction-transaction.css"
import {Delete,AddCircleOutline} from '@mui/icons-material';

function AuctionTransaction() {

  const rows = [];

  const { handleSubmit, control, getValues } = useForm();
  const [itemsList, setItemsList] = useState([]);
  const [kisanList, setKisanList] = useState([]);
  const [vyapariList, setVyapariList] = useState([]);
  const [buyItems, setTableData] = useState(rows);

  const onSubmit = async (data) => {
    console.log(data);
    const buyItemsToSubmit = buyItems.map(obj => {
      const { vyapariName, ...rest } = obj; // Destructure and omit the city property
      return rest; // Return the rest of the object
    });
    const auctionData = {
      "kisanId": data.kisaan.partyId,
      "itemId": data.itemName.itemId,
      buyItemsToSubmit
    }
    try {
      console.log(auctionData);
      // const result = await addAuctionTransaction(auctionData);
      // console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const addToTable = () => {
    const values = getValues();
    console.log(values.vyapariName);
    let newTableData = [
      ...buyItems,
      {
        vyapariName: values.vyapari.name,
        vyapariId: values.vyapari.partyId,
        quantity: Number(values.quantity),
        rate: Number(values.rate),
        bag: Number(values.bag),
      }
    ];
    console.log(newTableData)
    setTableData(newTableData);
  }

  const deleteFromTable = (index) => {
    const newRows = [...buyItems];
    newRows.splice(index, 1);
    setTableData(newRows);
  }

  const fetchList = async (listName) => {
    try {
      const list = await getAllItems(listName);
      console.log(listName, list);
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
      }
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    fetchList("VYAPARI");
    fetchList("KISAN");
    fetchList("items");
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} p={1}>
          <Grid item xs={12} className='hidden-xs'>
            <h1>AUCTION TRANSACTION</h1>
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="kisaan"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
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
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="itemName"
              control={control}
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
          </Grid>
          <Grid container item spacing={2}>
            <Grid item md={4} xs={6}>
              <Controller
                name="vyapari"
                control={control}
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
            </Grid>
            <Grid item md={2} xs={6}>
              <Controller
                name="quantity"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="Quantity" type='number' variant="outlined" />}
              />
            </Grid>
            <Grid item md={2} xs={4}>
              <Controller
                name="rate"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="Rate" type='number' variant="outlined" />}
              />
            </Grid>
            <Grid item md={2} xs={4}>
              <Controller
                name="bag"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="Bag" variant="outlined" />}
              />
            </Grid>
            <Grid item md={2} xs={4}>
              <Button variant="contained" color="primary" sx={{ height: '3.438rem' }} onClick={addToTable}><AddCircleOutline/></Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Vyapari Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Bag</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buyItems.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.vyapariName}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{row.rate}</TableCell>
                      <TableCell>{row.bag}</TableCell>
                      <TableCell>{row.rate*row.quantity}</TableCell>
                      <TableCell onClick={() => deleteFromTable(index)}><Button><Delete/></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} container justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default AuctionTransaction;
