import React from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function AuctionTransaction() {
  return (
    <>
      <Grid container spacing={2} p={3}>
      {/* Header Row */}
      <Grid item xs={12}>
        <h1>My Form Header</h1>
      </Grid>

      {/* First Row with Two TextFields */}
      <Grid item xs={6}>
        <TextField fullWidth label="Text Field 1" variant="outlined" />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth label="Text Field 2" variant="outlined" />
      </Grid>

      {/* Second Row with Four TextFields and Plus Button */}
      <Grid container item spacing={2}>
        <Grid item xs={4}>
          <TextField fullWidth label="Text Field 3" variant="outlined" />
        </Grid>
        <Grid item xs={2}>
          <TextField fullWidth label="Text Field 4" variant="outlined" />
        </Grid>
        <Grid item xs={2}>
          <TextField fullWidth label="Text Field 5" variant="outlined" />
        </Grid>
        <Grid item xs={2}>
          <TextField fullWidth label="Text Field 6" variant="outlined" />
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
                <TableCell>Header 1</TableCell>
                <TableCell>Header 2</TableCell>
                <TableCell>Header 3</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Data 1</TableCell>
                <TableCell>Data 2</TableCell>
                <TableCell>Data 3</TableCell>
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
