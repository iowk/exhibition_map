import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import {jwtVerify, logout, getLSItem, getToken} from './auth';
import axios from './axios';
import NavBar from './components/navbar'
import './user.css';
import './general.css';

function User(props){
    const [user, setUser] = useState({});
    const [verifyDone, setVerifyDone] = useState(false);
    useEffect(() =>{
        let isMounted = true;        
        const verify = async() => {
            try{
                await jwtVerify();
                if(isMounted) setUser(JSON.parse(getLSItem('user')));                
            }
            catch (e) {
                if(isMounted) setUser(null);
            }
        }        
        verify().then(() => {
            setVerifyDone(true);
        });        
        return () => { isMounted = false }; 
    }, [props])
    function logoutOnClick() {
        logout();
        setUser(null);
    }
    function activateOnClick() {
        jwtVerify()
        .then(() => {
            axios(getToken()).get('/map/users/send_acc_email/')
            .then(() => {
                alert("Email sent");
            })
            .catch((e) => {
                alert(e);
            })
        })
    }
    if(!verifyDone){
        return(<></>);
    }
    else if(user) {
        return(
            <div className='userPage'>
                {<NavBar user = {user}/>}
                <div className='userInfo'>
                    <div className='username'>
                        <span className='title'>User</span>
                        <span>{user.username}</span>                        
                    </div>
                    <div className='email'>
                        <span className='title'>Email</span>
                        <span>{user.email}</span>                        
                    </div>
                    {user.is_verified &&
                    <div className='status'>
                        <span className='title'>Status</span>
                        <span>Activated</span>
                    </div>
                    }
                    {!user.is_verified &&
                    <div className='status'>
                        <span className='title'>Status</span>
                        <span>Unactivated</span>
                        <button className='activationButton' onClick={activateOnClick}>
                            Send activation mail
                        </button>
                    </div>                    
                    }
                    <div className='logoutButton'><button className='logoutButton' onClick={logoutOnClick}>
                        Logout
                    </button></div>
                </div>
            </div>
        );
    }
    else{
        return(
            <Navigate to="/login/" replace={true} />
        );
    }
}
export default User;