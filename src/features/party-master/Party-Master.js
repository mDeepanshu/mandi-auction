import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, Typography, TableBody, TableCell, TableHead, TableRow, InputAdornment, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addPartyGlobal } from "../../gateway/party-master-apis";
import SearchIcon from '@mui/icons-material/Search';
import { addItem, deleteItem, getAllItems, getItem } from "../../gateway/curdDB";
import {Delete,AddCircleOutline} from '@mui/icons-material';

const PartyMaster = () => {
  // const { handleSubmit, control, getValues } = useForm();
  const { handleSubmit, control, getValues, formState: { errors } } = useForm({
    defaultValues: {
      partyType: 'KISAN', // Ensure this matches one of the MenuItem values
    },
  });
  const [tableData, setTableData] = useState([]);


  const fetchItems = async () => {
    try {
      const vyapariList = await getAllItems('VYAPARI');
      const kisanList = await getAllItems('KISAN');
      setTableData([...vyapariList, ...kisanList]);

      console.log(vyapariList,kisanList);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addToTable = async (newTableData) => {
    console.log(newTableData);
    addItem(newTableData, newTableData.partyType).then((data) => {
      console.log(data);
      setTableData([...tableData, newTableData]);
    });
  }
  
  const onSubmit = async (data) => {
    const values = getValues();
    let newTableData = [
      {
        partyId: Date.now().toString(16) ,
        ...values
      }
    ];
    try {
      const result = await addPartyGlobal(newTableData);
      console.log(result);
      if (result.responseCode==201) {
        addToTable(newTableData[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };


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
            PARTY MASTER
          </Typography>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Controller
            name="name"
            control={control}
            rules={{required:"Enter Name"}}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="PARTY NAME" variant="outlined" InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }} />}
          />
          <p className='err-msg'>{errors.name?.message}</p>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Controller
            name="partyType"
            control={control}
            rules={{required:"Enter Party Type"}}
            defaultValue="KISAN"
            render={({ field }) => (
              <FormControl variant="outlined" fullWidth>
                <InputLabel>PARTY TYPE</InputLabel>
                <Select
                  {...field}
                  label="Party Type"
                >
                  <MenuItem value="KISAN">KISAAN</MenuItem>
                  <MenuItem value="VYAPARI">VYAPARI</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        <p className='err-msg'>{errors.partyType?.message}</p>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Controller
            name="contact"
            control={control}
            rules={{required:"Enter Contact"}}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="CONTACT" variant="outlined" InputProps={{
            }} />}
          />
          <p className='err-msg'>{errors.contact?.message}</p>
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
                <TableCell>INDEX</TableCell>
                <TableCell>PARTY NAME</TableCell>
                <TableCell>PARTY TYPE</TableCell>
                <TableCell>DELETE</TableCell>
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