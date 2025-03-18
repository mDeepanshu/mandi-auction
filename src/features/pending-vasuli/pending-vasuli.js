import React, { useEffect, useState, useRef } from "react";
import styles from "./panding-vasuli.module.css";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, InputAdornment } from "@mui/material";
import LeftArrow from "../../assets/arrow-left.svg";
import RightArrow from "../../assets/arrow-right.svg";

function PendingVasuli() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 550);
  const [start, setStart] = useState(0);
  const amountRef = useRef(null); // Create a ref
  const remarkRef = useRef(null); // Create a ref

  const [tempArr, setTempArr] = useState([
    {
      _id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
    },
    {
      _id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
    },
    {
      _id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
    },
    {
      _id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
    },
    {
      _id: "67d4821074e26fa65f37816e",
      index: 0,
      name: "Mcdowell Vega",
      amount: "",
      remark: "",
    },
    {
      _id: "67d48210d43fdad5ffc39665",
      index: 1,
      name: "Cooper Trujillo",
      amount: "",
      remark: "",
    },
    {
      _id: "67d48210597ab5c830afb62f",
      index: 2,
      name: "Barton Daugherty",
      amount: "",
      remark: "",
    },
    {
      _id: "67d4821013ea930664cdef57",
      index: 3,
      name: "Sargent Gilliam",
      amount: "",
      remark: "",
    },
    {
      _id: "67d482102766b37c6bc7b1e5",
      index: 4,
      name: "Olive Velasquez",
      amount: "",
      remark: "",
    },
    {
      _id: "67d4821074e26fa65f37816e",
      index: 5,
      name: "Mcdowell Vega",
      amount: "",
      remark: "",
    },
    {
      _id: "67d4821013ea930664cdef57",
      index: 3,
      name: "Sargent Gilliam",
      amount: "",
      remark: "",
    },
    {
      _id: "67d482102766b37c6bc7b1e5",
      index: 4,
      name: "Olive Velasquez",
      amount: "",
      remark: "",
    },
    {
      _id: "67d4821074e26fa65f37816e",
      index: 5,
      name: "Mcdowell Vega",
      amount: "",
      remark: "",
    },
    {
      _id: "67d48210d43fdad5ffc39665",
      index: 6,
      name: "Cooper Trujillo",
      amount: "",
      remark: "",
    },
    {
      _id: "67d4821074e26fa65f37816e",
      index: 7,
      name: "Mcdowell Vega",
      amount: "",
      remark: "",
    },
    {
      _id: "67d48210d43fdad5ffc39665",
      index: 8,
      name: "Cooper Trujillo",
      amount: "",
      remark: "",
    },
    {
      _id: "67d4821074e26fa65f37816e",
      index: 0,
      name: "Mcdowell Vega",
      amount: "",
      remark: "",
    },
    {
      _id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
    },
    {
      _id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
    },
    {
      _id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
    },
    {
      _id: "",
      index: "",
      name: "",
      amount: "",
      remark: "",
    },
  ]);

  const [list, setList] = useState([]);

  const {
    control,
    getValues,
    formState: { errors },
    register,
    trigger,
    reset,
    setValue,
    setFocus,
    watch,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0], // Format as 'YYYY-MM-DD'
    },
  });

  const fetch_pending_vasuli = () => {};

  const save = () => {
    
  }

  const navigation = (direction) => {
    // setList(tempArr.splice(start + direction, start + 9 + direction));
    // amountChange(amount);
    
    if (direction == 1 && start + 9 <= tempArr.length) {
      setList(tempArr.slice(start + 1, start + 10));
    } else if (start - 1 >= 0) {
      setList(tempArr.slice(start - 1, start + 8));
    }
    setStart((prevCount) => prevCount + direction);
    amountRef.current.focus();
    amountRef.current.value = "";
    remarkRef.current.value = "";
  };

  const amountChange = (amount) => {
    setTempArr((prevArr) => {
      if (!prevArr) return []; 
      return prevArr.map((item, index) =>
        index === start + 4 ? { ...item, amount } : item
      );
    });
  }

  const remarkChange = (remark) => tempArr[start+4].remark = remark;

  useEffect(() => {
    setList(tempArr.slice(0, 9));

    if (amountRef.current) {
      setTimeout(() => {
        amountRef.current.focus();
      }, 0);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.row_one}>
        <div>
          <Controller
            name="date"
            control={control}
            rules={{ required: "Enter selectDate" }}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                size="small"
                label="Select Date"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </div>
        <div>
          <Button variant="contained" color="success" type="button" onClick={() => fetch_pending_vasuli()}>
            GET
          </Button>
          <Button variant="contained" color="success" type="button" onClick={() => save()}>
            SAVE
          </Button>
        </div>
      </div>
      <div className={styles.row_two}>
        <ul className={styles.ul}>
          <li className={`${styles.list_item} ${styles.list_header}`} key={0}>
            <div className={styles.small_column}>{isMobile ? "IDX" : "INDEX"}</div>
            <div className={styles.vyapari_column}>VYAPARI</div>
            <div className={styles.small_column}>{isMobile ? "AMT" : "AMOUNT"}</div>
            <div className={styles.remark_column}>{isMobile ? "RMK" : "REMARK"}</div>
          </li>
          {list.slice(0, 4)?.map((item, index) => {
            return (
              <li className={styles.list_item}>
                <div className={styles.small_column}>{(start+index-3)>0 &&  start+index-3}</div>
                <div className={styles.vyapari_column}>{item?.name?.toUpperCase()}</div>
                <div className={styles.small_column}>{item?.amount}</div>
                <div className={styles.remark_column}>{item?.remark}</div>
              </li>
            );
          })}
          <li className={styles.selected_list_item}>
            <div className={styles.small_column}>{start+1}</div>
            <div className={styles.vyapari_column}>{list[4]?.name?.toUpperCase()}</div>
            <div className={styles.small_column}>
              <input
                type="number"
                placeholder="Amount"
                className={styles.amount_input}
                ref={amountRef}
                value={list[4]?.amount}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    navigation(1);
                  }
                }}
                onInput={(e) => amountChange(e.target.value)}
              />
            </div>
            <div className={styles.remark_column}>
              <input placeholder="Remark" ref={remarkRef} value={list[4]?.remark} className={styles.remark_input} onInput={(e) => remarkChange(e.target.value)} />
            </div>
          </li>
          {list.slice(5, 9)?.map((item, index) => {
            return (
              <li className={styles.list_item}>
                <div className={styles.small_column}>{(start+index+9) < tempArr.length  && start+index+2}</div>
                <div className={styles.vyapari_column}>{item?.name?.toUpperCase()}</div>
                <div className={styles.small_column}>{item?.amount}</div>
                <div className={styles.remark_column}>{item?.remark}</div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.row_three}>
        <div>
          <button className={styles.arrow_btn} onClick={() => navigation(-1)} disabled={start <= 0}>
            <img src={LeftArrow} alt="My SVG Icon" width="40" height="40" />
          </button>
        </div>
        <div>
          <button className={styles.arrow_btn} onClick={() => navigation(1)} disabled={start + 9 >= tempArr.length}>
            <img src={RightArrow} alt="My SVG Icon" width="40" height="40" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendingVasuli;
