import {React,} from "react";
import { Link } from "react-router-dom";
import './navbar.css';
import '../general.css';

function NavBar(props){
    if(props.user) {
        return(
            <div className="navbar">
                <Link to="/">
                    <button className="navbutton">
                        Map
                    </button>
                </Link>
                <Link to="/user">
                    <button className="navbutton">
                        {props.user.username}
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