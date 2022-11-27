import React from 'react';
import { Navigate, Link } from "react-router-dom";
import {jwtVerify, logout, getLSItem, getToken} from './auth';
import axios from './axios';
import './user.css';

function User(props){
    function logoutOnClick() {
        logout();
        window.location.reload();
    }
    function activateOnClick() {
        jwtVerify()
        .then(() => {
            if(is_valid){
                axios(getToken()).get('/map/users/send_acc_email/')
                .then(() => {
                    //alert("Activation mail will be sent after verification by the administartor.");
                    alert("Activation mail sent.");
                })
                .catch((e) => {
                    alert(e);
                })
            }
            else{
                alert("Please login again");
                <Navigate to = '/login/'/>;
            }
        })
    }
    if(getLSItem('user')) {
        const user = getLSItem('user');
        return(
            <div className='userPage'>
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
            <Navigate to="/login" replace={true} />
        );
    }
}
export default User;