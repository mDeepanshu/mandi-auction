import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, Typography, TableBody, TableCell, TableHead, TableRow, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addItemGlobal } from "../../gateway/item-master-apis";
import SearchIcon from '@mui/icons-material/Search';
import { addItem, deleteItem, getAllItems, getItem } from "../../gateway/curdDB";
import "./item-master.css"
import {Delete,AddCircleOutline} from '@mui/icons-material';

const ItemMaster = () => {
  const { handleSubmit, control, getValues, formState: { errors } } = useForm();

  const [tableData, setTableData] = useState([]);

  const fetchItems = async () => {
    try {
      const itemsList = await getAllItems('items');
      console.log("dbRecords", itemsList);
      setTableData([...itemsList]);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);


  const addToTable = (newTableData) => {
    addItem(newTableData, 'items').then((data) => {
      setTableData([...tableData, newTableData])
    });
  }

  const deleteFromTable = (index) => {
    const newRows = [...tableData];
    newRows.splice(index, 1);
    setTableData(newRows);
  }

  const onSubmit = async (data) => {
    const values = getValues();
    let newTableData = [
      {
        itemId: Date.now().toString(16),
        name: values.itemName,
      }
    ];
    try {
      const result = await addItemGlobal(newTableData);
      if (result.responseCode==200) {
        addToTable(newTableData[0]);
        console.log(result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} p={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" align="left">
            ITEM MASTER
          </Typography>
        </Grid>

        <Grid item xs={8}>
          <Controller
            name="itemName"
            control={control}
            rules={{required:"Enter Item Name"}}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="ITEM NAME" variant="outlined" />}
          />
          <p className='err-msg'>{errors.itemName?.message}</p>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="primary" fullWidth type="submit" sx={{ height: '3.438rem' }}>
            <AddCircleOutline /> ADD
          </Button>
        </Grid>

        <Grid item xs={12}>
          <div className='table-container'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>INDEX</TableCell>
                  <TableCell>ITEM NAME</TableCell>
                  <TableCell>DELETE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell onClick={() => deleteFromTable(index)}><Button><Delete /></Button></TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Grid>
      </Grid>
    </form>
  );
};

export default ItemMaster;