import React, { useState } from 'react';
import './register.css';
import './general.css';
import axios from './axios';
import {login, getToken, getLSItem} from './auth';
import NavBar from './components/navbar'

function Register(props){
    // Full register page
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
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
        setUsername('');
        setEmail('');
        setPassword('');
        setPasswordConf('');
    }
    function handleSubmit(event){
        // POST username, email and password
        if(password===passwordConf){
            axios().post('/map/users/register/', JSON.stringify({
                username: username,
                email: email,
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
                login(username, password)
                .then(() => {
                    axios(getToken()).get('/map/users/send_acc_email/')
                    .then(() => {
                        setBottomMessage("Registration success. Activation mail is sent to " + email);
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
        <div>
            <NavBar user={getLSItem('user')}/>
            <div id="register">                
                <form className='regform' onSubmit={handleSubmit}>
                <div className='inpDiv'>
                    <span className='regspan'>Username</span>
                    <input
                        type='text'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{err.username}</div>
                <div className='inpDiv'>
                    <span className='regspan'>Email</span>
                    <input
                        type='text'
                        value={email}                     
                        onChange={(e) => setEmail(e.target.value)}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{err.email}</div>
                <div className='inpDiv'>
                    <span className='regspan'>Password</span>
                    <input
                        type='password'
                        value={password} 
                        onChange={handleOnChangePassword}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{err.password}</div>
                <div className='inpDiv'>
                    <span className='regspan'>Confirm Password</span>
                    <input
                        type='password'
                        value={passwordConf} 
                        onChange={handleOnChangePasswordConf}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{err.passwordConf}</div>
                <button className='regbutton' type="submit">
                    Register
                </button>
                </form>
                <div className='bottomMessage'>{bottomMessage}</div>
            </div>
        </div>);
}
export default Register;