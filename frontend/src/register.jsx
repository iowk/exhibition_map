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
    _handleSubmit = (event) => {
        // POST username, email and password
        console.log("UserName:",this.state.username);
        console.log("Email:",this.state.email);
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
        }).then(res => {
            if(!res.ok){
                console.log(res.text());
            }
        }).catch(err => {
            console.log(err);
        });
        event.preventDefault();
        console.log("Registered");
    }
    render() {
        return(
            <div id="register">
                <form onSubmit={this._handleSubmit.bind(this)}>
                <div className='taDiv'>
                    <textarea
                        placeholder='Username'
                        value={this.state.username}
                        onChange={this.handleWriteUsername}
                        className='taBox'
                    />
                </div>
                <div className='taDiv'>
                    <textarea
                        placeholder='Email'
                        value={this.state.email}
                        onChange={this.handleWriteEmail}
                        className='taBox'
                    />
                </div>
                <div className='taDiv'>
                    <textarea
                        placeholder='Password'
                        value={this.state.password}
                        onChange={this.handleWritePassword}
                        className='taBox'
                    />
                </div>
                <button type="submit" className='submitButton'>
                    Register
                </button>
                </form>
            </div>);
    }
}
export default Register;