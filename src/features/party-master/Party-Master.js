import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, Typography, TableBody, TableCell, TableHead, TableRow, InputAdornment, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addParty } from "../../gateway/party-master-apis";
import SearchIcon from '@mui/icons-material/Search';
import { addItem, deleteItem, getAllItems, getItem } from "../../gateway/curdDB";
import {Delete,AddCircleOutline} from '@mui/icons-material';

const PartyMaster = () => {
  // const { handleSubmit, control, getValues } = useForm();
  const { handleSubmit, control, getValues } = useForm({
    defaultValues: {
      partyType: 'Kisan', // Ensure this matches one of the MenuItem values
    },
  });
  const [tableData, setTableData] = useState([]);


  const fetchItems = async () => {
    try {
      const itemsList = await getAllItems('vyapari');
      console.log("dbRecords", itemsList);
      setTableData(itemsList);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onSubmit = async (data) => {
    addToTable();
   };


  const addToTable = async () => {
    const values = getValues();

    const newParty = {
      ...values,
      partyId: Math.floor(Math.random() * 1000).toString()
    };
    console.log(newParty);
 
    console.log(newParty.partyType);
    addItem(newParty, newParty.partyType).then((data) => {
      console.log(data);
      setTableData([...tableData, newParty]);
    });
  }

  const deleteFromTable = (index) => {
    const newRows = [...tableData];
    newRows.splice(index, 1);
    setTableData(newRows);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} p={3}>
        <Grid item xs={0} md={12}>
          <Typography variant="h4" component="h1" align="left">
            Party Master
          </Typography>
        </Grid>

        <Grid item xs={6} sm={3}>
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
            }} />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Controller
            name="partyType"
            control={control}
            defaultValue="kisan"
            render={({ field }) => (
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Party Type</InputLabel>
                <Select
                  {...field}
                  label="Party Type"
                >
                  <MenuItem value="kisan">KISAAN</MenuItem>
                  <MenuItem value="vyapari">VYAPARI</MenuItem>
                </Select>
              </FormControl>
            )}
          />

        </Grid>
        <Grid item xs={6} sm={3}>
          <Controller
            name="contact"
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="Contact" variant="outlined" InputProps={{
            }} />}
          />
        </Grid>
        <Grid item xs={1}>
          <Button variant="contained" color="primary" fullWidth type="submit" sx={{ height: '3.438rem' }}>
            <AddCircleOutline/> ADD
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
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.partyType}</TableCell>
                  <TableCell onClick={() => deleteFromTable(index)}><Button><Delete /></Button></TableCell>
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