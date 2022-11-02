import React, { useState, useRef } from 'react';
import './login.css';
import { login, jwtVerify } from './auth';
import { Link, Navigate } from "react-router-dom";
import { getLSItem } from './auth';
import ClipLoader from "react-spinners/ClipLoader";

function Login(props){
    const usernameRef = useRef();
    const passwordRef = useRef();
    const [loginStatus, setLoginStatus] = useState('');
    const [loading, setLoading] = useState(false);
    function handleSubmit(event){
        setLoading(true);
        login(usernameRef.current.value, passwordRef.current.value)
        .then(() => {
            jwtVerify()
            .then((is_valid) => {
                if(is_valid){
                    window.location.reload();
                    setLoginStatus('success');
                }
                else{
                    setLoginStatus('fail');
                }
            })
            .catch((e) => {
                console.log(e);
            })
        })
        .catch(e => {
            setLoginStatus('fail');
            console.log(e);
        })
        .finally(() => {
            setLoading(false);
        });
        event.preventDefault();
    }
    if(getLSItem('user')){
        return(
            <Navigate to="/map" replace={true} />
        );
    }
    else{
        return(
            <div className='login'>
                <div className="Auth-form-container d-flex justify-content-center login-container">
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
                            <div className="form-group mt-3">
                                <label>Password</label>
                                <input
                                type="password"
                                className="form-control mt-1"
                                placeholder="Enter password"
                                ref={passwordRef}
                                />
                            </div>
                            <div className="d-grid gap-2 mt-3">
                                <button onClick={handleSubmit} className="btn btn-primary">
                                    Login
                                </button>
                            </div>
                            <div className="d-grid gap-2 mt-3">
                                <Link className="btn btn-primary" role="button" to="/register">
                                    Register
                                </Link>
                            </div>
                            {loginStatus==='success' && <p className='text-center text-success mt-2'>Login success</p>}
                            {loginStatus==='fail' && <p className='text-center text-danger mt-2'>Username or password incorrect</p>}
                        </div>
                    </form>
                </div>
                <div className='loader'>
                    <ClipLoader
                        color='blue'
                        loading={loading}
                        size={50}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
            </div>
        );
    }
}
export default Login;