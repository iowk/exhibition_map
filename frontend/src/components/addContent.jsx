import React, {useState} from 'react';
import { Navigate } from "react-router-dom";
import DatePicker from 'react-date-picker';
import './content.css';
import { jwtVerify, getToken } from '../auth';
import { createCoverImageEntry, formatDate } from '../utils';
import { UploadImage } from './image'
import axios from '../axios';
import '../general.css';
import './addContent.css';

function AddContent(props){
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    function handleBack(){
        props.handleToLandmark(props.landmark);
    }
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).post('/map/landmarks/'+props.landmark.id+'/contents/', JSON.stringify({
                    name: name,
                    link: link,
                    description: description,
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
                            axios(getToken()).patch('/map/contents/'+res.data.id+'/', createCoverImageEntry(image),
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                },
                            })
                            .then(() => {
                                alert("Content added");
                                props.handleToLandmark(props.landmark);
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
                        props.handleToLandmark(props.landmark);
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
            <div className='addContent'>
                <div>
                    <textarea
                        placeholder='Name'
                        value={name}
                        onChange={(e) => {setName(e.target.value)}}
                        className='nameBox'
                    />
                </div>
                <div>
                    <textarea
                        placeholder='Link'
                        value={link}
                        onChange={(e) => {setLink(e.target.value)}}
                        className='linkBox'
                    />   
                </div>
                <div>
                    <textarea
                        placeholder='Description'
                        value={description}
                        onChange={(e) => {setDescription(e.target.value)}}
                        className='descriptionBox'
                    />   
                </div>
                <div className='dateDiv'>
                    <div><span>Start date: </span><DatePicker onChange={setStartDate} format='yyyy-MM-dd' value={startDate} /></div>
                    <div><span>End date: </span><DatePicker onChange={setEndDate} format='yyyy-MM-dd' value={endDate} /></div>
                </div>
                <div id='uploadImageBox'>
                    <UploadImage handleSetImage={setImage}/>
                </div>
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
    <div className='addContentParent'>
        <button onClick={handleBack} className='backButton'>
            {props.landmark.name}
        </button>
        {child}
     </div>);
}

export default AddContent;