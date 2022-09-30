import {React, useState, useEffect} from "react";
import { Link } from "react-router-dom";
import {jwtVerify, getLSItem} from './../auth';
import './navbar.css';

function NavBar(props){
    const [username, setUsername] = useState('');
    useEffect(() => {
        let isMounted = true;
        jwtVerify()
        .then(res => {
            if(isMounted) setUsername(getLSItem('user', 'username'));
        });
        return () => {
            isMounted = false;
        }
    }, [props])
    if(username) {
        return(
            <div className="navbar">
                <Link to="/user">
                    <button className="navbutton">
                        {username}
                    </button>
                </Link>
            </div>
        );
    }
    else{
        return(
            <div className="navbar">
                <Link to="/">
                    <button className="navbutton">
                        Map
                    </button>
                </Link>
                <Link to="/login">
                    <button className="navbutton">
                        Login
                    </button>
                </Link>
                <Link to="/register">
                    <button className="navbutton">
                        Register
                    </button>
                </Link>
            </div>
        );
    }
}
export default NavBar;