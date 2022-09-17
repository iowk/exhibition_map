import React, { Component } from 'react';
import './register.css';

const backendPath = 'http://localhost:8000'

class Register extends Component {
    // Full register page
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            passwordConf: '',
            regSuccess: false,
            err: {
                username: '',
                email: '',
                password: '',
                passwordConf: '',
            },
        };
    }
    handleWriteUsername = (event) => {
        this.setState({username: event.target.value});
        //console.log("UserName:",this.state.username);
    }
    handleWriteEmail = (event) => {
        this.setState({email: event.target.value});
        //console.log("Email:",this.state.email);
    }
    handleWritePassword = (event) => {
        this.setState({password: event.target.value});
    }
    handleWritePasswordConf = (event) => {
        this.setState({passwordConf: event.target.value});
    }
    checkPasswordConf(){
        if(this.state.password===this.state.passwordConf) return true;
        let errCopy = this.state.err;
        errCopy.passwordConf = "Confirm password incorrect";
        this.setState({err:errCopy});
        return false;
    }
    clearErr(){
        let err_cpy = {};
        for(var key in this.state.err){
            err_cpy[key] = '';
        }
        this.setState({err: err_cpy});
    }
    handleSubmit = (event) => {
        // POST username, email and password
        // TODO: email verification 
        fetch(backendPath+'/map/users/register/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
                email: this.state.email,
                password: this.state.password,
            })
        })
        .then(res => {
            if(!res.ok){
                return res.json()
                .then(res_json => {
                    this.setState({err:res_json});
                    this.checkPasswordConf();
                })
                .catch(err => {
                    alert(err);
                });;
            }
            else{
                if(this.checkPasswordConf()) this.setState({regSuccess: true});
                this.clearErr();
                console.log('Registration success'); // TODO: redirect page
            }
        })
        event.preventDefault();
    }
    render() {
        return(
            <div id="register">
                <form onSubmit={this.handleSubmit.bind(this)}>
                <div className='inpDiv'>
                    <span>Username</span>
                    <input
                        type='text'
                        onChange={this.handleWriteUsername}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{this.state.err.username}</div>
                <div className='inpDiv'>
                    <span>Email</span>
                    <input
                        type='text'
                        onChange={this.handleWriteEmail}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{this.state.err.email}</div>
                <div className='inpDiv'>
                    <span>Password</span>
                    <input
                        type='password'
                        onChange={this.handleWritePassword}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{this.state.err.password}</div>
                <div className='inpDiv'>
                    <span>Confirm Password</span>
                    <input
                        type='password'
                        onChange={this.handleWritePasswordConf}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{this.state.err.passwordConf}</div>
                <button type="submit" className='submitButton'>
                    Register
                </button>
                </form>
            </div>);
    }
}
export default Register;