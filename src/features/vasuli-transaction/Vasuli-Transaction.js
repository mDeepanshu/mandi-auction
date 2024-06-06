import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Typography, TextField, InputAdornment, Button, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


function VasuliTransaction() {


  const { register, handleSubmit, control, formState: { errors } } = useForm();

  const rows = [
    { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
    { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3 },
    { name: 'Eclair', calories: 262, fat: 16.0, carbs: 24, protein: 6.0 },
    { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67, protein: 4.3 },
    { name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9 },
  ];

  const onSubmit = async (data) => {
    const billDetails = {
      ...data,
      rows
    }
    console.log(billDetails);
    // let a = await submitKisanBill(billDetails);
    // console.log("a",a);
  };

  return (
    <>
      <Grid container spacing={3} p={3}>
        {/* 1st Row - Heading */}
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" align="left">
            My Form Heading
          </Typography>
        </Grid>

        {/* 2nd Row - Search TextField */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* 3rd Row - Date and Number TextFields */}
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="date"
            label="Select Date"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            label="Enter Number"
          />
        </Grid>

        {/* 4th Row - Label and Submit Button */}
        <Grid item xs={12} container spacing={2}>
          <Grid item xs={9}>
            <Typography variant="body1" fontWeight={700} align='left'>Remaining Amount 23000/-</Typography>
          </Grid>
          <Grid item alignItems="right">
            <Button variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default VasuliTransaction;
