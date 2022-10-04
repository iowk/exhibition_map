import React, { useState, useEffect } from 'react';
import './user.css';
import { Navigate } from "react-router-dom";
import {jwtVerify, logout, getLSItem} from './auth';

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
    if(!verifyDone){
        return(<></>);
    }
    else if(user) {
        return(
            <div className='userInfo'>
                <span>User: {user.username}</span>
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