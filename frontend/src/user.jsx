import React, { useState, useEffect } from 'react';
import { Navigate, Link } from "react-router-dom";
import {jwtVerify, logout, getLSItem, getToken} from './auth';
import axios from './axios';
import Navigation from './components/navbar'
import './user.css';
;

function User(props){
    const [user, setUser] = useState({});
    const [verifyDone, setVerifyDone] = useState(false);
    useEffect(() =>{
        let isMounted = true;
        const fetchUser = async() => {
            try{
                const is_valid = await jwtVerify();
                if(isMounted){
                    if(is_valid){
                        setUser(getLSItem('user'));
                    }
                    else{
                        setUser(null);
                    }
                }
            }
            catch (e) {
                console.log(e);
                if(isMounted) setUser(null);
            }
        };
        fetchUser().then(() => {
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
                <Navigation user = {user}/>
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
                        <button  className="btn btn-primary ms-2 userInfo-button" onClick={activateOnClick}>
                            Send activation mail
                        </button>
                    </div>
                    }
                    <div><Link className="btn btn-primary userInfo-button" role="button" to="/user/comments/">
                        Your comments
                    </Link></div>
                    {user.is_staff &&
                    <div>
                        <Link className="btn btn-primary userInfo-button" role="button" to="/admin/landmarks/">
                            Manage landmark suggestions
                        </Link>
                        <Link className="btn btn-primary ms-2 userInfo-button" role="button" to="/admin/contents/">
                            Manage content suggestions
                        </Link>
                    </div>}
                    <div><button className="btn btn-primary userInfo-button" onClick={logoutOnClick}>
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