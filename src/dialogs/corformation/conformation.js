import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import styles from "./confirmation.module.css";

export default function AlertDialog(props) {
  return (
    <React.Fragment>
      <Dialog
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div className={styles.text}>{props?.title ? <div>{props.title}</div> : <div>!! CONFIRM DELETE !!</div>}</div>
          </DialogContentText>
        </DialogContent>
        <hr style={{ padding: 0, margin: 0 }} />
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => props.handleClose(true)}>
            {props?.btnText ? <div>{props.btnText}</div> : <div>Delete</div>}
          </Button>
          <Button variant="contained" color="primary" onClick={() => props.handleClose(false)} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
