import React, { useEffect, useState, useMemo } from "react";
import { Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { addPartyGlobal, getPartyGlobal } from "../../gateway/party-master-apis";
// import { addItem, deleteItem, getAllItems, getItem } from "../../gateway/curdDB";
import { Delete, AddCircleOutline } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
import styles from "./party-master.module.css";
import Alert from "@mui/material/Alert";

const PartyMaster = () => {
  // const { handleSubmit, control, getValues } = useForm();
  const [partyList, setPartyList] = useState([]);
  const [sync, setSync] = useState({ status: false, message: "Loading...", syncSeverity: "success" });
  const [partyListFiltered, setPartyListFiltered] = useState([]);
  const {
    handleSubmit,
    control,
    watch,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      partyType: "KISAN", // Ensure this matches one of the MenuItem values
    },
  });

  const currentPartyType = watch("partyType", "KISAN");
  const partyType = watch("partyType", "KISAN");

  // Conditionally set the validation rules based on partyType
  const vasuliDayLimitValidation = partyType === "VYAPARI" ? { required: "Enter Vasuli Day Limit" } : {}; // No validation for "KISAN"

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await getPartyGlobal();
      if (result.responseCode == 200) {
        setPartyList(result.responseBody);
        setPartyListFiltered(result.responseBody);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onPartyInput = (e) => {
    const handler = setTimeout(() => {
      let filteredData = partyList.filter((data) => {
        return data.name.toLowerCase().includes(e.target.value.toLowerCase());
      });
      setPartyListFiltered(filteredData);
    }, 1000); // Adjust the delay as needed (300ms here)

    return () => {
      clearTimeout(handler);
    };
  };

  const onSubmit = async (data) => {
    const values = getValues();
    let newTableData = [
      {
        partyId: Date.now().toString(16),
        ...values,
      },
    ];
    // if (partyList.find(party => (party.name === values.name && party.partyType === values.partyType))) {
    //   setSync({ status: true, message: "Party Already Exists", syncSeverity: "error" });
    //   return;
    // }
    try {
      const result = await addPartyGlobal(newTableData);
      if (result.responseCode == 201) {
        reset();
        fetchData();
        setSync({ status: true, message: "Party Added Successfully", syncSeverity: "success" });
      }
    } catch (error) {
      setSync({ status: true, message: "Some Error Occured", syncSeverity: "error" });
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSync({ status: false, message: "", syncSeverity: "" });
  };

  const action = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} p={3}>
          <Grid item xs={12} md={12}>
            <Typography variant="h4" component="h1" align="left">
              PARTY MASTER
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Enter Party Name" }}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="text"
                  label="Party Name"
                  variant="outlined"
                  inputProps={{
                    style: {
                      textTransform: "uppercase", // Ensure the input content is transformed
                    },
                  }}
                  onChange={(e) => {
                    field.onChange(e); // Update the form state
                    onPartyInput(e); // Call the debounced function
                  }}
                />
              )}
            />
            <p className="err-msg">{errors.name?.message}</p>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Controller
              name="partyType"
              control={control}
              rules={{ required: "Enter Party Type" }}
              defaultValue="KISAN"
              render={({ field }) => (
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>PARTY TYPE</InputLabel>
                  <Select {...field} label="PARTY TYPE">
                    <MenuItem value="KISAN">KISAAN</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <p className="err-msg">{errors.partyType?.message}</p>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Controller
              name="maxLoanDays"
              control={control}
              rules={vasuliDayLimitValidation}
              defaultValue=""
              render={({ field }) => <TextField {...field} fullWidth type="number" label="VASULI DAY LIMIT" variant="outlined" disabled={currentPartyType == "KISAN"} />}
            />
            <p className="err-msg">{errors.maxLoanDays?.message}</p>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Controller
              name="contact"
              control={control}
              rules={{ required: "Enter Contact" }}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="CONTACT"
                  variant="outlined"
                  type="text"
                  inputProps={{
                    maxLength: 10, // Limits the length of input to 10 characters
                    inputMode: "numeric", // Ensures the input is a number
                  }}
                />
              )}
            />
            <p className="err-msg">{errors.contact?.message}</p>
          </Grid>
          <Grid item xs={1}>
            <Button variant="contained" color="primary" fullWidth type="submit" sx={{ height: "3.438rem" }}>
              <AddCircleOutline /> ADD
            </Button>
          </Grid>
          <Grid item xs={12} md={12}>
            <Grid item xs={6} sm={3}>
              <ul>
                {partyListFiltered.slice(0, 5).map((party, index) => (
                  <li key={index}>{party.name}</li>
                ))}
              </ul>
            </Grid>
          </Grid>
        </Grid>
        <div>
          <Snackbar open={sync.status} autoHideDuration={5000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={sync.syncSeverity} variant="filled" sx={{ width: "100%" }}>
              {sync.message}
            </Alert>
          </Snackbar>
        </div>
      </form>
    </div>
  );
};

export default PartyMaster;
