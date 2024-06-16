import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table,Typography ,TableBody, TableCell, TableHead, TableRow, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addParty } from "../../gateway/party-master-apis";
import SearchIcon from '@mui/icons-material/Search';

const PartyMaster = () => {
  const { handleSubmit, control, getValues } = useForm();
  const rows = [
    { index: 'Frozen yoghurt', name: 159, partyType: 6.0,contact: "@mui/material",delete: 24 },
    { index: 'Ice cream sandwich', name: 237, partyType: 9.0,contact: "@mui/material",delete: 37 },
  ];
  const [tableData, setTableData] = useState(rows);

  const onSubmit = async (data) => {
    console.log(data);
    // e.preventDefault();
    try {
      // const result = await addParty(data);
      // console.log(result);

    } catch (error) {
    }
  };

  
  const addToTable = async () => {
    const values = getValues();
    // let newTableData = [
    //   ...tableData,
    //   {
    //     name: values.name,
    //     partyType: values.partyType,
    //     contact:values.contact
    //   }
    // ]
    const newParty = [{
      ...values,
      partyId:Math.floor(Math.random()*1000).toString()
    }]
    console.log(newParty);
    setTableData(newParty);
    const result = await addParty(newParty);
    console.log(result);

  }

  const deleteFromTable = (index) => {
    const newRows = [...tableData];
    newRows.splice(index, 1);
    setTableData(newRows);  
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} p={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" align="left">
            Party Master
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="Party Name" variant="outlined" InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}/>}
          />
        </Grid>
        <Grid item xs={3}>
          <Controller
            name="partyType"
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="Party Type" variant="outlined" InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}/>}
          />
        </Grid>
        <Grid item xs={3}>
          <Controller
            name="contact"
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="Contact" variant="outlined" InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}/>}
          />
        </Grid>
        <Grid item xs={1}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} fullWidth type="submit" sx={{ height: '3.438rem' }}  onClick={addToTable}>
            Add
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Index</TableCell>
                <TableCell>Party Name</TableCell>
                <TableCell>Party Type</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {rows.map((row,index) => (
                  <TableRow key={index}>
                    <TableCell>{index+1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.partyType}</TableCell>
                    <TableCell onClick={() => deleteFromTable(index)}>D</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </form>
  );
};

export default PartyMaster;