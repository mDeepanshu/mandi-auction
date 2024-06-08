import React from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table,Typography ,TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addItem } from "../../gateway/item-master-apis";

const ItemMaster = () => {
  const { handleSubmit, control } = useForm();
  
  const onSubmit = async (data) => {
    console.log(data);
    // e.preventDefault();
    try {
      const result = await addItem(data);
    } catch (error) {
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} p={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" align="left">
            Item Master
          </Typography>
        </Grid>

        <Grid item xs={8}>
          <Controller
            name="itemName"
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="Item Name" variant="outlined" />}
          />
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} fullWidth type="submit">
            Add
          </Button>
        </Grid>

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
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </form>
  );
};

export default ItemMaster;