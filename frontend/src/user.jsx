import React, { useState, useEffect } from 'react';
import { Navigate, Link } from "react-router-dom";
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
        const fetchUser = async() => {
            try{
                const is_valid = await jwtVerify();
                if(isMounted){
                    if(is_valid){
                        setUser(JSON.parse(getLSItem('user')));
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
                <NavBar user = {user}/>
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
                    <div><Link to="/user/comments/"><button className='toCommentButton'>
                        Your comments
                    </button></Link></div>
                    {user.is_staff &&
                    <div>
                        <Link to="/admin/landmarks/"><button className='toLandmarkRequestButton'>
                            Manage landmark suggestions
                        </button></Link>
                        <Link to="/admin/contents/"><button className='toContentRequestButton'>
                            Manage content suggestions
                        </button></Link>
                    </div>}
                    <div><button onClick={logoutOnClick} className='logoutButton'>
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