import React, {useState, useEffect} from 'react';
import { Navigate } from "react-router-dom";
import DatePicker from 'react-date-picker';
import './content.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { jwtVerify, getLSItem } from '../auth';
import { createCoverImageEntry, formatDate } from '../utils';
import axios from '../axios';

function Content(props){
    return(
        <div>
            <button onClick={props.handleToLandmark}>
                Back
            </button>
            <img src={props.content.coverImageSrc} alt="Not found"></img>
            <div className="des">
                <h1>{props.content.name}</h1>
                <p>{props.content.startDate} ~ {props.content.endDate}</p>
                <a href={props.content.link}>
                    <div className="link">{props.content.link}</div>
                </a>      
                <p>Rating: {props.content.avgRating}</p>
            </div>
            <div className='comment'>                
                <div><CommentListPopup
                    lmid={props.curLandmarkId}
                    ctid={props.content.id}
                    name={props.content.name}
                /></div>
                {props.user.is_verified && (
                    // Comment button for activated user                         
                    <div><CommentPostPopup
                        lmid={props.curLandmarkId}
                        ctid={props.content.id}
                        name={props.content.name}
                        user={props.user}
                        handleSetUser={props.handleSetUser}
                    /></div>
                )}
            </div>
            <div className='image'>
                <div><ImageListPopup
                    lmid={props.curLandmarkId}
                    ctid={props.content.id}
                /></div>
                {props.user.is_verified &&      
                <div><ImagePostPopup
                    lmid={props.curLandmarkId}
                    ctid={props.content.id}
                    user={props.user}
                    handleSetUser={props.handleSetUser}
                /></div>}
            </div>
        </div>
    );
}

function AddContent(props){
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [image, setImage] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getLSItem('jwt','access')).post('/map/landmarks/'+props.curLandmarkId+'/contents/', JSON.stringify({
                    name: name,
                    link: link,
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate)
                }),
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                })
                .then((res) => {
                    if(image){
                        jwtVerify()
                        .then(() => {
                            axios(getLSItem('jwt','access')).patch('/map/landmarks/'+props.curLandmarkId+'/contents/'+res.data.id+'/', createCoverImageEntry(image),
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                },
                            })
                            .then(() => {
                                alert("Content added");
                                window.location.reload(false);
                            })
                            .catch((e) => {
                                console.log(e);
                                alert(JSON.stringify(e.response.data));
                            })
                        })
                        .catch((e) => {
                            console.log(e);
                            alert("Please login again");
                            props.handleSetUser(null);
                            <Navigate to = '/login/'/>;
                        })
                    }
                    else{
                        alert("Content added");
                        window.location.reload(false);
                    }
                })
                .catch((e) =>{
                    console.log(e);
                    alert(JSON.stringify(e.response.data));
                });
            }
            else{
                props.handleSetUser(null);
                <Navigate to = '/login/'/>;
            }
        })
        .catch(e => {
            console.log(e);
            alert(JSON.stringify(e.response.data));
        })
    }
    var child;
    if(props.user){
        child = 
            <div>
                <div>Add a new content</div>
                <textarea
                    placeholder='Name'
                    value={name}
                    onChange={(e) => {setName(e.target.value)}}
                    className='nameBox'
                />
                <textarea
                    placeholder='Link'
                    value={link}
                    onChange={(e) => {setLink(e.target.value)}}
                    className='linkBox'
                />                    
                <div>
                    <DatePicker onChange={setStartDate} format='yyyy-MM-dd' value={startDate} />
                    <DatePicker onChange={setEndDate} format='yyyy-MM-dd' value={endDate} />
                </div>
                <input type="file" name="image_url"
                    accept="image/jpeg,image/png,image/gif" onChange={(e) => {setImage(e.target.files[0])}} />
                <div className='buttonDiv'>
                    <button onClick={handleSubmit} className='submitButton'>
                        Upload
                    </button>
                </div>
            </div>;
    }
    else{
        child = <div>Please login to add a content</div>;
    }
    return(
    <div>
        <button onClick={props.handleToLandmark}>
            Back
        </button>
        {child}
     </div>);
}

export {Content, AddContent};