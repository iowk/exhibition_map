import {React, Component} from "react";
import { Link } from "react-router-dom";
import {jwtVerify, getLSItem} from './../auth';
import './navbar.css'

class NavBar extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: ''
        }
    }
    componentDidMount(){
        let isMounted = true;
        jwtVerify()
        .then(res => {
            if(isMounted) this.setState({username: getLSItem('user', 'username')});
        });
        return () => {
            isMounted = false;
        }
    }
    render(){
        if(this.state.username) {
            return(
                <div className="navbar">
                    <Link to="/user">
                        <button className="navbutton">
                            {this.state.username}
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
}
export default NavBar;