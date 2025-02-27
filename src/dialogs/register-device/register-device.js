import React, { useState,useEffect } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import styles from "./register-device.module.css";
import { getDevices,addDevice,updateStatus } from "../../gateway/devices";

const RegisterDevice = ({ open, onClose }) => {

    const steps = ['Register Device', 'Submit Request', 'Registration Status'];

    const [activeStep, setActiveStep] = useState(0);
    const [registrationStatus, setRegistrationStatus] = useState('');
    const [selectedValue, setSelectedValue] = useState(1);

    const [deviceName, setDeviceName] = useState(null);
    const [oldDeviceId, setOldDeviceId] = useState('');
    const [oldDeviceList, setOldDeviceList] = useState([]);

    const changeStep = (direction) => {
        setActiveStep((prevActiveStep) => prevActiveStep + direction);
    }

    const handleRadioChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const registerDevice = async() => {
        setRegistrationStatus('Registration Request Submitted');
        if (selectedValue==0) {
            const data = {
                name:deviceName
            }
            const res = await addDevice(data);
            localStorage.setItem(`deviceId`,`${res.responseBody?.id}`);
        } else {
            const res = await updateStatus(oldDeviceId);
            localStorage.setItem(`deviceId`,`${oldDeviceId}`);
        }
        changeStep(1);
    };

    const closeDialog = () => {
        onClose();
        setActiveStep(0);
    };

    useEffect(() => {
        if (activeStep == 1&& selectedValue == 1) {
            getDevices().then((response) => {
                setOldDeviceList(response?.responseBody);
            });
        }
    }, [activeStep]);

    return (
        <Dialog open={open} onClose={onClose}>
            <Box sx={{ width: '100%' }}>
                <DialogTitle>
                    <div>
                        <Stepper activeStep={activeStep}>
                            {steps?.map((label, index) => {
                                const stepProps = {};
                                const labelProps = {};
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                    </div>
                </DialogTitle>
                <hr style={{padding:0,margin:0}} />
                <DialogContent className={styles.dialogContent}>
                    {
                        activeStep == 0 &&
                        <div>
                            <h2>REGISTER DEVICE</h2>
                            <div className={`${styles.InputContainer} ${styles.InputContainerRadio}`}>
                                <label>SELECT OLD DEVICE:</label>
                                <input type="radio" name='deviceCategory' value={1} onChange={handleRadioChange} checked={selectedValue == 1} />
                                <label>REGISTER NEW ONE:</label>
                                <input type="radio" name='deviceCategory' value={0} onChange={handleRadioChange} checked={selectedValue == 0} />
                            </div>
                        </div>}
                    {
                        activeStep == 1 &&
                        <div>
                            {selectedValue == 0 && <div className={styles.InputContainer}>
                                <label>DEVICE NAME:</label>
                                <input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} type="text" />
                            </div>}
                            {selectedValue == 1 && <div className={styles.InputContainer}>
                                <label>SELECT DEVICE NAME:</label>
                                <select value={oldDeviceId} onChange={(e) => setOldDeviceId(e.target.value)} className={styles.select_dropdown}>
                                    <option key="" value="" disabled> Please select a device </option>
                                    {
                                        oldDeviceList.map((device, index) => {
                                            return <option key={index} value={device.id}>{device.name}</option>
                                        })
                                    }
                                </select>
                            </div>}
                        </div>}
                    {
                        activeStep == 2 &&
                        <div>
                            STATUS: {registrationStatus}
                        </div>
                    }
                </DialogContent>
                <hr style={{padding:0,margin:0}} />
                <DialogActions>
                    <div>
                        {
                            activeStep == 0 &&
                            <div>
                                <Button variant='contained' onClick={() => changeStep(1)}>NEXT</Button>
                            </div>
                        }
                        {
                            activeStep == 1 &&
                            <div>
                                <Button className={styles.footerBtns} variant='contained' onClick={() => changeStep(-1)}>BACK</Button>
                                <Button className={styles.footerBtns} variant='contained' onClick={registerDevice}>REGISTER</Button>
                            </div>
                        }
                        {
                            activeStep == 2 &&
                            <div>
                                <Button variant='contained' onClick={closeDialog}>CLOSE</Button>
                            </div>
                        }
                    </div>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default RegisterDevice;