import React, {useEffect,useState} from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { addAuctionTransaction } from "../../gateway/auction-transaction-apis";
import { getItems,getKisan,getVyapari } from "../../gateway/common-apis";

function AuctionTransaction() {

  const { handleSubmit, control } = useForm();
  const [itemsList, setItemsList] = useState([]);
  const [kisanList, setKisanList] = useState([]);
  const [vyapariList, setVyapariList] = useState([]);

  const onSubmit = async (data) => {
    console.log(data);
    // e.preventDefault();
    try {
      const result = await addAuctionTransaction(data);
    } catch (error) {
    }
  };


  useEffect(() => {
    // let ItemsList = await getItems();
    // setItemsList(ItemsList);
  }, []);

  useEffect(() => {
    // let KisanList = await getKisan();
    // setKisanList(KisanList);
  }, []);
  
  useEffect(() => {
    // let VyapariList = await getVyapari();
    // setVyapariList(VyapariList);
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} p={1}>
          <Grid item xs={12}>
            <h1>AUCTION TRANSACTION</h1>
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="kisaan"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} fullWidth label="KISAAN" variant="outlined" />}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="item"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField {...field} fullWidth label="ITEM" variant="outlined" />}
            />
          </Grid>
          <Grid container item spacing={2}>
            <Grid item xs={4}>
              <Controller
                name="vyapari"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="VYAPARI" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={2}>
              <Controller
                name="quantity"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="Quantity" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={2}>
              <Controller
                name="rate"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="Rate" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={2}>
              <Controller
                name="bag"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} fullWidth label="Bag" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={2}>
              <Button variant="contained" color="primary">+</Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Index</TableCell>
                    <TableCell>Vyapari Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Bag</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Vyapari Name</TableCell>
                    <TableCell>40</TableCell>
                    <TableCell>40</TableCell>
                    <TableCell>40</TableCell>
                    <TableCell>40</TableCell>
                    <TableCell>D</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Submit Button Row */}
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
