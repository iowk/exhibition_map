import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import DatePicker from 'react-date-picker';
import './content.css';
import { jwtVerify, getToken } from '../auth';
import { formatDate } from '../utils';
import { UploadImage } from './image'
import axios from '../axios';
import '../general.css';
import './addContent.css';

function AddContent(props){
    const nameRef = useRef();
    const linkRef = useRef();
    const descriptionRef = useRef();
    const [image, setImage] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    function handleBack(){
        props.handleToLandmark(props.landmark);
    }
    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                let form_data = new FormData();
                if(image) form_data.append('coverImageSrc', image, image.name);
                form_data.append('name', nameRef.current.value);
                form_data.append('link', linkRef.current.value);
                form_data.append('description', descriptionRef.current.value);
                form_data.append('startDate', formatDate(startDate));
                form_data.append('endDate', formatDate(endDate));
                axios(getToken()).post('/map/landmarks/'+props.landmark.id+'/contents/', form_data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                })
                .then(() => {
                    alert("Your request will be validated soon.\nThank you for your contribution.");
                    props.handleToLandmark(props.landmark);
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
        })
    }
    var child;
    if(props.user){
        child = 
            <div className='addContent'>
                <div>
                    <textarea
                        placeholder='Name'
                        ref={nameRef}
                        className='nameBox'
                    />
                </div>
                <div>
                    <textarea
                        placeholder='Link'
                        ref={linkRef}
                        className='linkBox'
                    />   
                </div>
                <div>
                    <textarea
                        placeholder='Description'
                        ref={descriptionRef}
                        className='descriptionBox'
                    />   
                </div>
                <div className='dateDiv'>
                    <div><span>Start date: </span><DatePicker onChange={setStartDate} format='yyyy-MM-dd' value={startDate}/></div>
                    <div><span>End date: </span><DatePicker onChange={setEndDate} format='yyyy-MM-dd' value={endDate}/></div>
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
        child = <div>Please login to suggest an exhibition</div>;
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