import React, { Component } from 'react';
import './register.css';
import axios from './axios';

class Register extends Component {
    // Full register page
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            passwordConf: '',
            err: {
                username: '',
                email: '',
                password: '',
                passwordConf: '',
            },
            buttomMessage: '',
        };
    }
    handleOnChangePassword = (e) => {
        let errCopy = this.state.err;
        if(this.state.passwordConf===e.target.value || this.state.passwordConf===''){
            errCopy.passwordConf = '';
            this.setState({err:errCopy});
            this.setState({password:e.target.value});
        }
        else{
            errCopy.passwordConf = 'Confirm password incorrect';
            this.setState({err:errCopy});
            this.setState({password:e.target.value});
        }
    }    
    handleOnChangePasswordConf = (e) => {
        let errCopy = this.state.err;
        if(this.state.password===e.target.value){
            errCopy.passwordConf = '';
            this.setState({err:errCopy});
            this.setState({passwordConf:e.target.value});
        }
        else{
            errCopy.passwordConf = 'Confirm password incorrect';
            this.setState({err:errCopy});
            this.setState({passwordConf:e.target.value});
        }
    }    
    clearErr(){
        let err_cpy = {};
        for(var key in this.state.err){
            err_cpy[key] = '';
        }
        this.setState({err: err_cpy});
    }
    clearInput(){
        this.setState({username: ''});
        this.setState({email: ''});
        this.setState({password: ''});
        this.setState({passwordConf: ''});
    }
    handleSubmit = (event) => {
        // POST username, email and password
        if(this.state.password===this.state.passwordConf){
            axios.post('/map/users/register/', JSON.stringify({
                username: this.state.username,
                email: this.state.email,
                password: this.state.password,
            }),
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then(res => {
                this.clearErr();                  
                this.setState({buttomMessage: 'Registration success. Verification e-mail is sent to ' + this.state.email});
                this.clearInput();
            })
            .catch(e => {
                this.setState({err: e.response.data});
            })
        }
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
                        value={this.state.username}
                        onChange={(e) => this.setState({username: e.target.value})}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{this.state.err.username}</div>
                <div className='inpDiv'>
                    <span>Email</span>
                    <input
                        type='text'
                        value={this.state.email}                     
                        onChange={(e) => this.setState({email: e.target.value})}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{this.state.err.email}</div>
                <div className='inpDiv'>
                    <span>Password</span>
                    <input
                        type='password'
                        value={this.state.password} 
                        onChange={this.handleOnChangePassword}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{this.state.err.password}</div>
                <div className='inpDiv'>
                    <span>Confirm Password</span>
                    <input
                        type='password'
                        value={this.state.passwordConf} 
                        onChange={this.handleOnChangePasswordConf}
                        className='inpBox'
                    />
                </div>
                <div className='errDiv'>{this.state.err.passwordConf}</div>
                <button type="submit" className='submitButton'>
                    Register
                </button>
                </form>
                <div className='buttomMessage'>{this.state.buttomMessage}</div>
            </div>);
    }
}
export default Register;