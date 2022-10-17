import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from "react-router-dom";
import Popup from 'reactjs-popup';
import { Slide } from 'react-slideshow-image';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import { createImageEntry } from '../utils';

import 'react-slideshow-image/dist/styles.css';
import './image.css'
import '../general.css';

function ImageListPopup(props){
    const [images, setImages] = useState([]);
    useEffect(() => {
        let isMounted = true;
        var apiPath = '';
        if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/images/';
        else apiPath = '/map/landmarks/'+props.lmid+'/images/';
        const fetchData = async () => {            
            try{
                const res = await axios().get(apiPath);
                const res_images = await res.data;
                if(isMounted) setImages(res_images);
            }
            catch(e){
                console.log(e);
            }
        }
        if(props.ctid || props.lmid) fetchData();
        return () => {
            isMounted = false;
        };
    }, [props.lmid, props.ctid])
    return(
        <div id='imageList'><Popup trigger={<button className='defaultButton'>{props.buttonName}</button>}
        position="right center"
        modal        
        className='image-list-popup'>
            {close => (
            <div className="slide-container">
                <button className="close" onClick={close}> 
                    &times; 
                </button>
                <Slide>
                {images.map((slideImage, index)=>(
                    <div className="each-slide" key={index}>
                    <div className="image-container" style={{'backgroundImage': `url(${slideImage.src})`}}>
                        <span className='image-name'>{slideImage.name}</span>
                    </div>
                    </div>
                ))}
                </Slide>
            </div>)}
        </Popup></div>
    );
}
function UploadImage(props){
    const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
    function onImageChange(e) {
        const file_size = e.target.files[0].size;
        console.log("Image size:", file_size);
        if(file_size > 10*1024*1024) alert("Image size should not exceed 10 MB");
        else{
            setImagePreviewSrc(URL.createObjectURL(e.target.files[0]));
            props.handleSetImage(e.target.files[0]);
        }
    }
    return(<div className='uploadImage'>
        {imagePreviewSrc && <div className='imagePreview' style={{'backgroundImage': `url(${imagePreviewSrc})`}}/>}
        {!imagePreviewSrc && <div  className='imagePreview'><span>Image preview</span></div>}
        <div className='inputDiv'>
            <input type="file" name="image_url"
                accept="image/jpeg,image/png,image/gif" onChange={onImageChange} />
        </div>        
    </div>);    
}
function ImagePostPopup(props) {
    const [image, setImage] = useState(null);
    const imageTitleRef = useRef();
    let apiPath = '';
    if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/images/';
    else apiPath = '/map/landmarks/'+props.lmid+'/images/';
    function handleSubmit(){
        jwtVerify()
        .then(is_valid => {
            if(is_valid){
                axios(getToken()).post(apiPath, createImageEntry(image, imageTitleRef.current.value),
                {
                    headers: {
                        'Content-type':'multipart/form-data',
                    },
                })
                .then(() => {
                    alert("Image uploaded");
                })
                .catch((e) => {
                    alert(e)
                });                            
            }
            else{
                alert("Please login again");
                props.handleSetUser(null);
                <Navigate to = '/login/'/>;
            }
        })
        .catch(e => {
            console.log(e);
        })       
    }
    return(
        <div id='imagePost'><Popup trigger={<button className='defaultButton'>{props.buttonName}</button>}
        position="right center"
        modal>
            {close => (
            <div className="post-container">
                <button className="close" onClick={close}> 
                    &times; 
                </button>                
                <div>
                    <input
                        placeholder='Title'
                        ref={imageTitleRef}
                        className='titleBox'
                    />
                </div>
                <div id='uploadImageBox'>
                    <UploadImage handleSetImage={setImage}/>
                </div>
                <div className='buttonDiv'>
                    <button onClick={handleSubmit} className='popupSubmitButton'>
                        Upload
                    </button>
                </div>
            </div>
            )}
        </Popup></div>
    );    
}

export { ImageListPopup, ImagePostPopup, UploadImage };