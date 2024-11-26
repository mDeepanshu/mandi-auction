import React, { useEffect, useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, Typography, TableBody, TableCell, TableHead, TableRow, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addItemGlobal, getItem } from "../../gateway/item-master-apis";
// import SearchIcon from '@mui/icons-material/Search';
// import { addItem, deleteItem, getAllItems, getItem } from "../../gateway/curdDB";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import "./item-master.module.css"
import { Delete, AddCircleOutline } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import MasterTable from "../../shared/ui/master-table/master-table";


const ItemMaster = () => {
  const [open, setOpen] = useState(false);
  const { handleSubmit, control, getValues, formState: { errors } } = useForm();

  const [tableData, setTableData] = useState([]);
  const [tableDataFiltered, setTableDataFiltered] = useState([]);

  const [itemsColumns, setItemsColumns] = useState(["INDEX", "ITEM NAME"]);
  const [keyArray, setKeyArray] = useState(["index", "name"]);

  const fetchItems = async () => {
    try {
      const itemsList = await getItem();
      setTableData([...itemsList.responseBody]);
      setTableDataFiltered([...itemsList.responseBody]);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onItemInput = (event, field) => {
    field.onChange(event);  // Update the value in react-hook-form
    setTableDataFiltered(tableData.filter(elem => elem.name.includes(event.target.value)));
  }

  const deleteFromTable = (index) => {
    const newRows = [...tableData];
    newRows.splice(index, 1);
    setTableData(newRows);
  }

  const onSubmit = async () => {
    const values = getValues();
    if (tableData.some(elem => elem.name == values.itemName)) {
      setOpen(true);
      return;
    }

    let newTableData = [
      {
        itemId: Date.now().toString(16),
        name: values.itemName,
      }
    ];
    try {
      const result = await addItemGlobal(newTableData);
      if (result.responseCode == 200) {
        setTableData([...tableData, newTableData[0]]);
        setTableDataFiltered([...tableDataFiltered, newTableData[0]]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

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
            rules={{ required: "Enter Item Name" }}
            defaultValue=""
            render={({ field }) => <TextField {...field} fullWidth label="ITEM NAME" variant="outlined" onChange={(e) => onItemInput(e, field)} />}

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
            <MasterTable columns={itemsColumns} tableData={tableData} keyArray={keyArray} />
          </div>
        </Grid>
      </Grid>
      <div>
        <Snackbar
          open={open}
          autoHideDuration={4000}
          message="ITEM ALREADY EXISTS"
          action={action}
          onClose={handleClose}
        />
      </div>
    </form>
  );
};

export default ItemMaster;