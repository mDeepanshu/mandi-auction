import React, { useCallback, useEffect, useState } from "react";
import { getAuctionEntries, setEntrySyncStatus } from "../../gateway/curdDB";
import { syncOneAuction } from "../../gateway/auction-transaction-apis";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  InputAdornment,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import styles from "./all-entries.module.css";

const SYNCED = "SYNCED";

// Mirrors the TOTAL column on the auction-transaction table: nag-type rows carry
// a chungi that is charged per unit, bag-type rows do not.
const rowAmount = (row) => {
  const rate = Number(row.rate) || 0;
  const quantity = Number(row.quantity) || 0;
  const chungi = Number(row.chungi) || 0;
  return (rate + chungi) * quantity;
};

const auctionAmount = (entry) => (entry.buyItems || []).reduce((sum, row) => sum + rowAmount(row), 0);

const statusChip = (syncStatus) => {
  if (syncStatus === SYNCED) return { label: "SYNCED", color: "success" };
  if (syncStatus === "FAILED") return { label: "FAILED", color: "error" };
  return { label: "PENDING", color: "warning" };
};

function AuctionRow({ entry, index, onSync, syncing }) {
  const [open, setOpen] = useState(false);
  const chip = statusChip(entry.syncStatus);
  const isSynced = entry.syncStatus === SYNCED;

  return (
    <>
      <TableRow className={styles.auctionRow}>
        <TableCell className={styles.cell}>
          <IconButton size="small" onClick={() => setOpen((prev) => !prev)} aria-label="show details">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          {index + 1}
        </TableCell>
        <TableCell className={styles.cell}>{entry.kisanName}</TableCell>
        <TableCell className={styles.cell}>{entry.itemName}</TableCell>
        <TableCell className={styles.cell}>
          <Button size="small" onClick={() => setOpen((prev) => !prev)}>
            DETAILS ({entry.buyItems?.length || 0})
          </Button>
        </TableCell>
        <TableCell className={styles.cell}>
          <div className={styles.syncCell}>
            <Chip size="small" label={chip.label} color={chip.color} variant={isSynced ? "filled" : "outlined"} />
            <Button
              size="small"
              variant="contained"
              color={isSynced ? "success" : "primary"}
              disabled={isSynced || syncing}
              onClick={() => onSync(entry)}
              startIcon={
                syncing ? <CircularProgress size={14} color="inherit" /> : isSynced ? <CloudDoneIcon /> : <CloudUploadIcon />
              }
            >
              {isSynced ? "SYNCED" : syncing ? "SYNCING" : "SYNC"}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={styles.detailCell} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className={styles.detailWrap}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className={styles.cell}>
                      <b>VYAPARI</b>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <b>QTY</b>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <b>RATE</b>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <b>BAG</b>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <b>CHUNGI</b>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <b>AMOUNT</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entry.buyItems?.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className={styles.cell}>{row.vyapariName}</TableCell>
                      <TableCell className={styles.cell}>{row.quantity}</TableCell>
                      <TableCell className={styles.cell}>{row.rate}</TableCell>
                      <TableCell className={styles.cell}>{row.bags ?? "-"}</TableCell>
                      <TableCell className={styles.cell}>{row.chungi ?? "-"}</TableCell>
                      <TableCell className={styles.cell}>{rowAmount(row).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className={styles.cell} colSpan={5} align="right">
                      <b>TOTAL</b>
                    </TableCell>
                    <TableCell className={styles.cell}>
                      <b>{auctionAmount(entry).toFixed(0)}</b>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function AllEntries() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [syncingId, setSyncingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const date = new Date();
  const currentDate =
    date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");

  const [dateOptions, setDateOptions] = useState([]);

  const {
    control,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fromDate: currentDate,
    },
  });
  const selectedDate = watch("fromDate");

  const loadEntries = useCallback(async () => {
    const day = getValues("fromDate");
    // trId is the submit timestamp, so an auction entered today for an earlier
    // date would fall outside that day's key range. Scan the retained window and
    // match on auctionDate, which is the date the user actually picked.
    const all = await getAuctionEntries(0, Date.now());
    // Auction-level records only — older per-vyapari-line rows have no buyItems.
    const auctions = (all || []).filter(
      (entry) => Array.isArray(entry.buyItems) && entry.auctionDate?.slice(0, 10) === day
    );
    auctions.sort((a, b) => b.trId - a.trId);
    setEntries(auctions);
  }, [getValues]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries, selectedDate]);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFilteredEntries(entries);
      return;
    }
    setFilteredEntries(
      entries.filter(
        (entry) =>
          entry.kisanName?.toLowerCase().includes(term) ||
          entry.itemName?.toLowerCase().includes(term) ||
          entry.buyItems?.some((row) => row.vyapariName?.toLowerCase().includes(term))
      )
    );
  }, [entries, search]);

  const pendingCount = entries.filter((entry) => entry.syncStatus !== SYNCED).length;
  // Whole-day figure, not the filtered view — searching should not change the total.
  const dayTotal = entries.reduce((sum, entry) => sum + auctionAmount(entry), 0);

  const handleSync = async (entry) => {
    if (entry.syncStatus === SYNCED || syncingId) return;
    setSyncingId(entry.trId);
    const status = await syncOneAuction(entry.auctionData);
    try {
      await setEntrySyncStatus(entry.trId, status);
    } catch (error) {
      console.error("Failed to record sync status:", error);
    }
    setEntries((prev) => prev.map((item) => (item.trId === entry.trId ? { ...item, syncStatus: status } : item)));
    setSyncingId(null);
    setToast({
      open: true,
      message: status === SYNCED ? "AUCTION SYNCED." : "SYNC FAILED. TRY AGAIN.",
      severity: status === SYNCED ? "success" : "error",
    });
  };

  useEffect(() => {
    const tempDateOptions = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      tempDateOptions.push(day.toLocaleDateString("en-CA"));
    }
    setDateOptions(tempDateOptions);
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.search_btns}>
          <div className={styles.date}>
            <Controller
              name="fromDate"
              control={control}
              rules={{ required: "Enter From Date" }}
              render={({ field }) => (
                <Select {...field} size="small">
                  {dateOptions?.map((key) => (
                    <MenuItem value={key} key={key}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <p className="error">{errors.fromDate?.message}</p>
          </div>
          <div className={styles.date}>
            <Button variant="contained" color="primary" onClick={loadEntries}>
              REFRESH
            </Button>
          </div>
          <div className={styles.search}>
            <TextField
              fullWidth
              type="text"
              size="small"
              label="SEARCH"
              variant="outlined"
              inputProps={{ style: { textTransform: "uppercase" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className={styles.auctionTotal}>
          <b className={styles.dayTotal}>TOTAL: {dayTotal.toFixed(0)}</b>
          <span className={styles.counts}>
            AUCTIONS: {entries.length} | PENDING: {pendingCount}
          </span>
        </div>
      </div>

      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell className={styles.cell}>
                <b>IDX</b>
              </TableCell>
              <TableCell className={styles.cell}>
                <b>KISAN NAME</b>
              </TableCell>
              <TableCell className={styles.cell}>
                <b>ITEM NAME</b>
              </TableCell>
              <TableCell className={styles.cell}>
                <b>DETAILS</b>
              </TableCell>
              <TableCell className={styles.cell}>
                <b>SYNC</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEntries.map((entry, index) => (
              <AuctionRow
                key={entry.trId}
                entry={entry}
                index={index}
                onSync={handleSync}
                syncing={syncingId === entry.trId}
              />
            ))}
            {filteredEntries.length === 0 && (
              <TableRow>
                <TableCell className={styles.cell} colSpan={5} align="center">
                  NO AUCTIONS FOR THIS DATE.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AllEntries;
