import React, { Component } from 'react';
import './register.css';
import { login, jwtVerify } from './auth';
import { Link, Navigate } from "react-router-dom";

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            message: '',
            login: '',
        };
    }
    handleSubmit = async (event) => {
        login(this.state.username, this.state.password)
        .then(res => {
            jwtVerify()
            .then(is_valid => {
                if(is_valid){
                    this.setState({login: 'success'});
                    <Navigate to = '/'/>;
                }
                else this.setState({login: 'fail'});
            })
            .catch(e => {
                console.log(e);
            })
        })
        .catch(e => {
            console.log(e);
        });
        event.preventDefault();
    }
    render(){
        return(
            <div id='login'>
                <form onSubmit={this.handleSubmit}>
                    <div className='inpDiv'>
                        <span>Username</span>
                        <input 
                            type='text'
                            value={this.state.username}
                            onChange={(e) => this.setState({username: e.target.value})}
                            className='inpBox'
                        />
                    </div>
                    <div className='inpDiv'>
                        <span>Password</span>
                        <input 
                            type='password'
                            value={this.state.password}
                            onChange={(e) => this.setState({password: e.target.value})}
                            className='inpBox'
                        />
                    </div>
                    <button type="submit" className='submitButton'>
                        Login
                    </button>
                    <Link to="/register">
                        <button>
                            Register
                        </button>
                    </Link>                   
                </form>
                <div className='errDiv'>{this.state.login==='fail' && 'Login fail'}</div>
                {this.state.login==='success' && (
                    <Navigate to="/" replace={true} />
                )}
            </div>
        );
    }
}
export default Login;