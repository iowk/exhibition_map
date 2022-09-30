import React, { useState } from 'react';
import './register.css';
import { login, jwtVerify } from './auth';
import { Link, Navigate } from "react-router-dom";

function Login(props){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState('');
    function handleSubmit(event){
        login(username, password)
        .then(() => {
            jwtVerify()
            .then(is_valid => {
                if(is_valid){
                    setLoginStatus('success');
                    <Navigate to = '/'/>;
                }
                else setLoginStatus('fail');
            })
            .catch(e => {
                console.log(e);
                alert(e);
            })
        })
        .catch(e => {
            console.log(e);
            alert(e);
        });
        event.preventDefault();
    }
    return(
        <div id='login'>
            <form className='regform' onSubmit={handleSubmit}>
                <div className='inpDiv'>
                    <span  className='regspan'>Username</span>
                    <input 
                        type='text'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className='inpBox'
                    />
                </div>
                <div className='inpDiv'>
                    <span  className='regspan'>Password</span>
                    <input 
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='inpBox'
                    />
                </div>
                <button type="submit" className='regbutton'>
                    Login
                </button>
                <Link to="/register" className='regbutton'>
                    <button  className='regbutton'>
                        Register
                    </button>
                </Link>                   
            </form>
            <div className='errDiv'>{loginStatus==='fail' && 'Login fail'}</div>
            {loginStatus==='success' && (
                <Navigate to="/" replace={true} />
            )}
        </div>
    );
}
export default Login;