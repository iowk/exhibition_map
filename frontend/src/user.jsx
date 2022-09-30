import React, { useState, useEffect } from 'react';
import './user.css';
import { Navigate } from "react-router-dom";
import {jwtVerify, logout, getLSItem} from './auth';

function User(props){
    const [verified, setVerified] = useState(false);
    const [username, setUsername] = useState('');
    useEffect(() =>{
        jwtVerify()
        .then(() => {             
            setUsername(getLSItem('user','username'));
            setVerified(true);
        })
        .catch(e => {
            console.log(e);
            setUsername('');
        });    
    }, [props])
    function logoutOnClick() {
        logout();
        setUsername('');
    }
    if(username || !verified) {
        return(
            <div className='userInfo'>
                <span>User: {username}</span>
                <button className='logoutButton' onClick={logoutOnClick}>
                    Logout
                </button>
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