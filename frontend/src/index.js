import {React} from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import About from "./about";
import Main from './main';
import Register from './register';
import Activate from './activate';
import Login from './login';
import User from './user';
import UserComment from './userComment';
import Navigation from './components/navbar'
import {AdminLandmark, AdminContent} from './admin';
import {AdminPostLandmarks, AdminPostContents} from './adminPostJson';
import { getLSItem } from "./auth";
import 'bootstrap/dist/css/bootstrap.min.css';
import './general.css';

ReactDOM.render(
    <BrowserRouter>
        {<Navigation user = {getLSItem('user')}/>}
        <Routes>
            <Route path="/" element={<Navigate to="/map" />} />
            <Route path="/about" element={<About />}></Route>
            <Route path="/map" element={<Main />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/activate/:uidb64/:token" element={<Activate/>}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/user" element={<User />}></Route>
            <Route path="/user/comments" element={<UserComment />}></Route>
            <Route path="/admin/landmarks" element={<AdminLandmark />}></Route>
            <Route path="/admin/contents" element={<AdminContent />}></Route>
            <Route path="/admin/post_landmarks" element={<AdminPostLandmarks />}></Route>
            <Route path="/admin/post_contents" element={<AdminPostContents />}></Route>
        </Routes>
    </BrowserRouter>,

    document.getElementById("root")
);
