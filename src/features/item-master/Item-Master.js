import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, Typography, TableBody, TableCell, TableHead, TableRow, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addItemGlobal } from "../../gateway/item-master-apis";
import SearchIcon from '@mui/icons-material/Search';
import { addItem, deleteItem, getAllItems, getItem } from "../../gateway/curdDB";

const ItemMaster = () => {
  const { handleSubmit, control, getValues } = useForm();

  const [tableData, setTableData] = useState([]);

  const fetchItems = async () => {
    try {
      const itemsList = await getAllItems('items');
      console.log("dbRecords", itemsList);
      setTableData(itemsList);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);


  const addToTable = () => {
    console.log("reaching here");
    const values = getValues();
    let newTableData =
    // ...tableData,
    {
      itemId: Math.floor(Math.random() * 1000).toString(),
      itemName: values.itemName,
    }
      ;
    // setTableData(newTableData);
    addItem(newTableData, 'items').then((data) => {
      console.log(data);
      setTableData([...tableData, newTableData])
    });
  }

  const deleteFromTable = (index) => {
    const newRows = [...tableData];
    newRows.splice(index, 1);
    setTableData(newRows);
  }

  const onSubmit = async (data) => {
    console.log(data);
    // e.preventDefault();
    const values = getValues();
    let newTableData = [
      {
        itemId: Math.floor(Math.random() * 1000).toString(),
        itemName: values.itemName,
      }
    ];
    try {
      // const result = await addItemGlobal(newTableData);
      addToTable();
      // console.log(result);

    } catch (error) {
      console.log(error);
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
            render={({ field }) => <TextField {...field} fullWidth label="Item Name" variant="outlined" InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }} />}
          />
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} fullWidth type="submit" sx={{ height: '3.438rem' }}>
            Add
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Index</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.itemName}</TableCell>
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

export default ItemMaster;