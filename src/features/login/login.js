import React, {useState,useRef,useEffect} from 'react';

import "./login.css"

function Login({ changeLoginState }) {

    const [password, setPassword] = useState("");
    const inputRef = useRef(null); 

    const OnPasswordInput = (value) => {
        setPassword(value.target.value);
        if (value.target.value==="9876") {
            setTimeout(() => {                
                changeLoginState(false);
            }, 100);
        }
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);


    return (
        <>
            <div className='container'>
                <h3 className='login-text'>LOGIN</h3>
                <input ref={inputRef}  onChange={OnPasswordInput} value={password} className='password-input' type='password' maxLength={4}></input>
            </div>
        </>
    );
};

export default Login;