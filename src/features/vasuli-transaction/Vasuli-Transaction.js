import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Typography, TextField, InputAdornment, Button, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { addVasuliTransaction } from "../../gateway/vasuli-transaction-apis";


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
    console.log(data);
    // e.preventDefault();
    try {
      const result = await addVasuliTransaction(data);
    } catch (error) {
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} p={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" align="left">
            VASULI TRANSACTION
          </Typography>
        </Grid>

        <Grid item xs={7}>
          <Controller
            name="vyapariName"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="VYAPARI NAME"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={6}>
          <Controller
            name="selectDate"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="Select Date"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            name="collectedAmount"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="COLLECTED AMOUNT"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} container spacing={2}>
          <Grid item xs={9}>
            <Typography variant="body1" fontWeight={700} align='left'>
              Remaining Amount 23000/-
            </Typography>
          </Grid>
          <Grid item alignItems="right">
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

export default VasuliTransaction;
