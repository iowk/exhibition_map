import React, { useState, useRef } from 'react';
import './register.css';
import axios from './axios';
import {login, getToken} from './auth';

function Register(props){
    // Full register page
    const usernameRef = useRef();
    const emailRef = useRef();
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');
    const [err, setErr] = useState({
        username: '',
        email: '',
        password: '',
        passwordConf: '',
    });
    const [bottomMessage, setBottomMessage] = useState('');
    function handleOnChangePassword(e){
        let errCopy = err;
        if(passwordConf===e.target.value || passwordConf===''){
            errCopy.passwordConf = '';
        }
        else{
            errCopy.passwordConf = 'Confirm password incorrect';
        }
        setErr(errCopy);
        setPassword(e.target.value);
    }
    function handleOnChangePasswordConf(e){
        let errCopy = err;
        if(password===e.target.value){
            errCopy.passwordConf = '';
        }
        else{
            errCopy.passwordConf = 'Confirm password incorrect';
        }
        setErr(errCopy);
        setPasswordConf(e.target.value);
    }
    function clearErr(){
        let err_cpy = {};
        for(var key in err){
            err_cpy[key] = '';
        }
        setErr(err_cpy);
    }
    function clearInput(){
        usernameRef.current.value = '';
        emailRef.current.value = '';
        setPassword('');
        setPasswordConf('');
    }
    function handleSubmit(event){
        // POST username, email and password
        if(password===passwordConf){
            axios().post('/map/users/register/', JSON.stringify({
                username: usernameRef.current.value,
                email: emailRef.current.value,
                password: password,
            }),
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then(() => {
                clearErr();
                login(usernameRef.current.value, password)
                .then(() => {
                    while(!getToken());
                    axios(getToken()).get('/map/users/send_acc_email/')
                    .then(() => {
                        setBottomMessage("Registration success. Activation mail is sent to " + emailRef.current.value);
                        //setBottomMessage("Registration success. Activation mail will be sent after verification by the administartor.");
                    })
                    .catch(e => {
                        console.log(e);
                        setBottomMessage("Registration success. Activation mail is not sent due to server error.");
                    })
                    .finally(() => {
                        clearInput();
                    })
                })
                .catch(e => {
                    console.log(e);
                    alert(e);
                    clearInput();
                })
            })
            .catch(e => {
                console.log(e);
                setErr(e.response.data);
            })
        }
        event.preventDefault();
    }
    return(
        <div className='register'>
            <div className="Auth-form-container d-flex justify-content-center register-container">
                <form className="Auth-form w-25">
                    <div className="Auth-form-content">
                        <div className="form-group mt-3">
                            <label>Username</label>
                            <input
                            type="username"
                            className="form-control mt-1"
                            placeholder="Enter username"
                            ref={usernameRef}
                            />
                        </div>
                        <p className='text-center text-danger mt-2' style={{height: '24px'}}>{err.username}</p>
                        <div className="form-group mt-3">
                            <label>Email</label>
                            <input
                            type="emaile"
                            className="form-control mt-1"
                            placeholder="Enter email address"
                            ref={emailRef}
                            />
                        </div>
                        <p className='text-center text-danger mt-2' style={{height: '24px'}}>{err.email}</p>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input
                            type="password"
                            className="form-control mt-1"
                            placeholder="Enter password"
                            value={password}
                            onChange={handleOnChangePassword}
                            />
                        </div>
                        <p className='text-center text-danger mt-2' style={{height: '24px'}}>{err.password}</p>
                        <div className="form-group mt-3">
                            <label>Confirm password</label>
                            <input
                            type="password"
                            className="form-control mt-1"
                            placeholder="Confirm password"
                            value={passwordConf}
                            onChange={handleOnChangePasswordConf}
                            />
                        </div>
                        <p className='text-center text-danger mt-2' style={{height: '24px'}}>{err.passwordConf}</p>
                        <div className="d-grid gap-2 mt-3">
                            <button onClick={handleSubmit} className="btn btn-primary">
                                Register
                            </button>
                        </div>
                        <p className='text-center text-success mt-2'>{bottomMessage}</p>
                    </div>
                </form>
            </div>
        </div>);
}
export default Register;