import {React, Component} from "react";
import { Link } from "react-router-dom";
import {jwtVerify} from './auth';
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
            if(isMounted) this.setState({username: localStorage.getItem('username')});
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
                        <button>
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
                        <button>
                            Map
                        </button>
                    </Link>
                    <Link to="/login">
                        <button>
                            Login
                        </button>
                    </Link>
                    <Link to="/register">
                        <button>
                            Register
                        </button>
                    </Link>
                </div>
            );
        }
    }
}
export default NavBar;