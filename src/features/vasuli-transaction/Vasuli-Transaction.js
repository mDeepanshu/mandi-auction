import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Typography, TextField, InputAdornment, Button, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { addVasuliTransaction } from "../../gateway/vasuli-transaction-apis";
import { getAllItems } from "../../gateway/curdDB";


function VasuliTransaction() {


  const { handleSubmit, control, formState: { errors } } = useForm();

  const [vyapariList, setVyapariList] = useState([]);

  const fetchList = async (listName) => {
    try {
      const list = await getAllItems(listName);
      setVyapariList(list);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  useEffect(() => {
    fetchList("VYAPARI");
  }, []);


  const onSubmit = async (data) => {
    console.log(data);
    // e.preventDefault();
    try {
      await addVasuliTransaction(data);
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
            name="vyapariId"
            control={control}
            rules={{ required: "Enter Vyapari Name" }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={vyapariList}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="VYAPARI"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                onChange={(event, value) => field.onChange(value.partyId)}
                disablePortal
                id="combo-box-demo"
              />
            )}
          />
          <p className='err-msg'>{errors.vyapariId?.message}</p>
        </Grid>

        <Grid item xs={6}>
          <Controller
            name="date"
            control={control}
            rules={{ required: "Enter selectDate" }}
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
          <p className='err-msg'>{errors.date?.message}</p>
        </Grid>
        <Grid item xs={6}>
          <Controller
            name="amount"
            control={control}
            rules={{ required: "Enter Collected Amount" }}
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
          <p className='err-msg'>{errors.amount?.message}</p>
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
