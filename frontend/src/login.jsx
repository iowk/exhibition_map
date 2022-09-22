import React, { Component } from 'react';
import './register.css';
import { login, jwtVerify } from './auth';

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            message: '',
        };
    }
    handleSubmit = async (event) => {
        login(this.state.username, this.state.password)
        .then(res => {
            jwtVerify()
            .then(is_valid => {
                if(is_valid) this.setState({message: "Login success"});
                else this.setState({message: "Login fail"}); 
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
                </form>
                <div className='errDiv'>{this.state.message}</div>
            </div>
        );
    }
}
export default Login;