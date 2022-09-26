import React, { Component } from 'react';
import { Navigate } from "react-router-dom";
import './user.css';
import {jwtVerify, logout} from './auth';

class User extends Component {
    constructor(props){
        super(props);
        this.state = {
            isMounted: false,
            verified: false,
            username: '',
        };
    }
    componentDidMount(){
        this.setState({isMounted: true});
        jwtVerify()
        .then(res => {
            if(this.state.isMounted){                
                this.setState({username: localStorage.getItem('username')});
                this.setState({verified: true});
            }
        });
        return () => {
            this.setState({isMounted: false});
        }        
    }
    logoutOnClick() {
        logout();
        this.setState({username: ''});
    }
    render() {
        if(this.state.username || !this.state.verified) {
            return(
                <div className='userInfo'>
                    <span>User: {this.state.username}</span>
                    <button onClick={this.logoutOnClick.bind(this)}>
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
}
export default User;