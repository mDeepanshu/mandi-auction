import React from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table,Typography ,TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function ItemMaster() {
  return (
    <>
      <Grid container spacing={2} p={3}>
        {/* Header Row */}
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" align="left">
            My Header
          </Typography>
        </Grid>

        {/* TextField and Button Row */}
        <Grid item xs={8}>
          <TextField fullWidth label="Enter Text" variant="outlined" />
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} fullWidth>
            Add
          </Button>
        </Grid>

        {/* Table Row */}
        <Grid item xs={12}>
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
              {/* Add more TableRow components as needed */}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </>
  );
}

export default ItemMaster;
