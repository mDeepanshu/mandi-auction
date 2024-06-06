import React from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function AuctionTransaction() {
  return (
    <>
      <Grid container spacing={2} p={1}>
        {/* Header Row */}
        <Grid item xs={12}>
          <h1>AUCTION TRANSACTION</h1>
        </Grid>

        {/* First Row with Two TextFields */}
        <Grid item xs={6}>
          <TextField fullWidth label="KISAAN" variant="outlined" />
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth label="ITEM" variant="outlined" />
        </Grid>

        {/* Second Row with Four TextFields and Plus Button */}
        <Grid container item spacing={2}>
          <Grid item xs={4}>
            <TextField fullWidth label="VYAPARI" variant="outlined" />
          </Grid>
          <Grid item xs={2}>
            <TextField fullWidth label="Quantity" variant="outlined" />
          </Grid>
          <Grid item xs={2}>
            <TextField fullWidth label="Rate" variant="outlined" />
          </Grid>
          <Grid item xs={2}>
            <TextField fullWidth label="Bag" variant="outlined" />
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" color="primary">+</Button>
          </Grid>
        </Grid>

        {/* Table Row */}
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
          <Button variant="contained" color="primary">
            Submit
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default AuctionTransaction;
