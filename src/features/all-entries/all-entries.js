import React, { useEffect, useState, useRef } from "react";
import MasterTable from "../../shared/ui/master-table/master-table";
import { getAuctionEntries } from "../../gateway/curdDB";
import { getAuctionEntriesList } from "../../gateway/all-entries-apis";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, InputAdornment, Switch, FormControlLabel, Select, MenuItem, InputLabel } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import styles from "./all-entries.module.css";

function AllEntries() {
  const [auctionEntriesColumns, setAuctionEntriesColumns] = useState([
    "IDX",
    "KISANNAME",
    "ITEMNAME",
    "VYAPARINAME",
    "RATE",
    "QTY",
    "BAGS W.",
    "CNG",
    "AMOUNT",
    "BAG",
    "DATE",
  ]);
  const [keyArray, setKeyArray] = useState([
    "entryIdx",
    "kisanName",
    "itemName",
    "vyapariName",
    "rate",
    "quantity",
    "bagWiseQuantity",
    "chungi",
    "amount",
    "bag",
    "auctionDate",
  ]);
  const [tabletList, setTabletList] = useState([]);
  const [tableDataFiltered, setTableDataFiltered] = useState([]);

  const currentDate = new Date(new Date().getTime() + 19800000).toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

  const [dateOptions, setDateOptions] = useState([]);
  const [total, setTotal] = useState([]);

  const {
    control,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fromDate: currentDate,
      syncedData: true,
    },
  });
  const showSyncedData = watch("syncedData");

  const fetchData = async () => {
    const data = await getAuctionEntriesList(currentDate, currentDate);
    let total = 0;
    data?.responseBody.forEach((element, index) => {
      element.entryIdx = index + 1;
      total += element.amount;
    });
    setTotal(total);
    setTabletList(data?.responseBody);
    setTableDataFiltered(data?.responseBody);
  };

  const setLocalData = async (date) => {
    const selectedDate = getValues("fromDate");
    const to = Number(new Date(selectedDate));
    const from = Number(new Date(selectedDate)) - 86400000;

    const localData = await getAuctionEntries(from, to);
    if (localData) {
      setTabletList(localData);
      setTableDataFiltered(localData);
    }
  };

  useEffect(() => {
    setTabletList([]);
    setTableDataFiltered([]);
    setTimeout(() => {
      if (showSyncedData) fetchData();
      else setLocalData(currentDate);
    }, 0);
  }, [showSyncedData]);

  useEffect(() => {
    let tempDateOptions = [currentDate];
    for (let i = 1; i < 7; i++) {
      const twoDaysPrior = new Date(new Date().getTime() + 19800000);
      twoDaysPrior.setDate(twoDaysPrior.getDate() - i);
      const priorDate = twoDaysPrior.toISOString().split("T")[0];
      tempDateOptions.push(priorDate);
    }
    setDateOptions(tempDateOptions);
  }, []);

  const find = (event) => {
    const search = event.target.value;
    setTableDataFiltered(
      tabletList.filter(
        (elem) =>
          elem?.vyapariName?.toLowerCase().includes(search.toLowerCase()) ||
          elem?.kisanName?.toLowerCase().includes(search.toLowerCase()) ||
          elem?.itemName?.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const findById = (event) => {
    const search = event.target.value;
    if (search === "") setTableDataFiltered(tabletList);
    else {
      const match = tabletList.find((elem) => Number(elem?.txnNo) === Number(search));
      setTableDataFiltered(match ? [match] : []);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.search_btns}>
          <div className={styles.date} hidden={showSyncedData}>
            <Controller
              name="fromDate"
              control={control}
              rules={{ required: "Enter From Date" }}
              render={({ field }) => (
                <Select defaultValue={currentDate} {...field} size="small">
                  {dateOptions?.map((key, i) => {
                    return <MenuItem value={key}>{key}</MenuItem>;
                  })}
                </Select>
              )}
            />
            <p className="error">{errors.fromDate?.message}</p>
          </div>
          <div className={styles.date} hidden={showSyncedData}>
            <Button variant="contained" color="primary" onClick={setLocalData}>
              FETCH
            </Button>
          </div>
          <div className={styles.search}>
            <TextField
              fullWidth
              type="number"
              size="small"
              label="SEARCH BY IDX"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={findById}
            />
          </div>
          <div className={styles.search}>
            <TextField
              fullWidth
              type="text"
              size="small"
              label="SEARCH"
              variant="outlined"
              inputProps={{
                style: {
                  textTransform: "uppercase", // Ensure the input content is transformed
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={find}
            />
          </div>
          {showSyncedData && (
            <div className={styles.auctionTotal}>
              <b>TOTAL:{Number(total).toFixed(0)}</b>
            </div>
          )}
        </div>
        <div>
          <Controller
            name="syncedData"
            control={control}
            render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="SYNCED DATA" />}
          />
        </div>
      </div>
      <MasterTable columns={auctionEntriesColumns} tableData={tableDataFiltered} keyArray={keyArray} height={"78vh"} />
    </>
  );
}

export default AllEntries;
