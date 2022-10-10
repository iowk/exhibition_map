import {React} from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from './main'
import Register from './register'
import Activate from './activate'
import Login from './login'
import User from './user'
import UserComment from './userComment'

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Main />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/activate/:uidb64/:token" element={<Activate/>}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/user" element={<User />}></Route>
            <Route path="/user/comments" element={<UserComment />}></Route>
        </Routes>
    </BrowserRouter>,

    document.getElementById("root")
);
