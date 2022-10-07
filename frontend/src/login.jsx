import React, { useState } from 'react';
import './register.css';
import { login, jwtVerify, getLSItem } from './auth';
import { Link, Navigate } from "react-router-dom";
import NavBar from './components/navbar'

function Login(props){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState('');
    function handleSubmit(event){
        login(username, password)
        .then(() => {
            jwtVerify()
            .then((is_valid) => {
                if(is_valid){
                    setLoginStatus('success');
                    <Navigate to = '/'/>;
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
        });
        event.preventDefault();
    }
    return(
        <div>
            <NavBar user={getLSItem('user')}/>
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
                    <Link to="/register">
                        <button  className='regbutton'>
                            Register
                        </button>
                    </Link>                   
                </form>
                <div className='bottomMessage'>{loginStatus==='fail' && 'Username or password incorrect'}</div>
                {loginStatus==='success' && (
                    <Navigate to="/" replace={true} />
                )}
            </div>
        </div>);
}
export default Login;