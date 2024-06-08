import React from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table,Typography ,TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addParty } from "../../gateway/party-master-apis";

const PartyMaster = () => {
  const { handleSubmit, control } = useForm();
  
  const onSubmit = async (data) => {
    console.log(data);
    // e.preventDefault();
    try {
      const result = await addParty(data);
    } catch (error) {
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} p={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" align="left">
            Party Master
          </Typography>
        </Grid>

        <Grid item xs={5}>
          <Controller
            name="partyName"
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="Party Name" variant="outlined" />}
          />
        </Grid>
        <Grid item xs={5}>
          <Controller
            name="partyType"
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="Party Type" variant="outlined" />}
          />
        </Grid>
        <Grid item xs={1}>
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

export default PartyMaster;