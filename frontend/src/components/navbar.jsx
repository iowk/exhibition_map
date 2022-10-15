import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import './navbar.css';
import '../general.css';

function NavBar(props){
    const [user, setUser] = useState({});
    useEffect(() => {
        setUser(props.user);
    }, [props.user])
    if(user) {
        return(
            <div className="navbar">
                <Link to="/">
                    <button className="navbutton">
                        Map
                    </button>
                </Link>
                <Link to="/user">
                    <button className="navbutton">
                        {user.username}
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