import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import Popup from 'reactjs-popup';
import { Slide } from 'react-slideshow-image';
import axios from '../axios';
import { jwtVerify, getLSItem } from '../auth';
import { createImageEntry } from '../utils';
import 'react-slideshow-image/dist/styles.css';
import './image.css'

function ImageListPopup(props){
    const [images, setImages] = useState([]);
    useEffect(() => {
        let isMounted = true;
        var apiPath = '';
        if(props.ctid) apiPath = '/map/landmarks/'+props.lmid+'/contents/'+props.ctid+'/images/';
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
        fetchData();
        return () => {
            isMounted = false;
        };
    }, [props])
    return(
        <Popup trigger={<button className='defaultButton'>Show photos</button>}
        position="right center"
        modal>
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
        </Popup>
    );
}
function ImagePostPopup(props) {
    const [apiPath, setApiPath] = useState(null);
    const [image, setImage] = useState(null);
    const [imageTitle, setImageTitle] = useState('');
    useEffect(() => {
        if(props.ctid) setApiPath('/map/landmarks/'+props.lmid+'/contents/'+props.ctid+'/images/');
        else setApiPath('/map/landmarks/'+props.lmid+'/images/');      
    }, [props])
    function onImageChange(e) {
        setImage(e.target.files[0]);
    }
    function onImageTitleChange(e) {
        setImageTitle(e.target.value);
    }
    function handleSubmit(){
        jwtVerify()
        .then(is_valid => {
            if(is_valid){
                axios(getLSItem('jwt','access')).post(apiPath, createImageEntry(image, imageTitle),
                {
                    headers: {
                        'Content-type':'multipart/form-data',
                    },
                })
                .then(() => {
                    alert("Image uploaded");
                    window.location.reload(false);
                })
                .catch((e) => alert(e));                            
            }
            else{
                alert("Please login to upload image");
                <Navigate to = '/login/'/>;
            }
        })
        .catch(e => {
            alert(e);
        })       
    }
    return(
        <Popup trigger={<button className='defaultButton'>Upload photo</button>}
        position="right center"
        modal>
            {close => (
            <div className="post-container">
                <button className="close" onClick={close}> 
                    &times; 
                </button>
                <div>
                    <textarea
                        placeholder='Title'
                        value={imageTitle}
                        onChange={onImageTitleChange}
                        className='titleBox'
                    />
                </div>
                <div>
                    <input type="file" name="image_url"
                        accept="image/jpeg,image/png,image/gif" onChange={onImageChange} />
                </div>
                <div className='buttonDiv'>
                    <button onClick={handleSubmit} className='popupSubmitButton'>
                        Upload
                    </button>
                </div>
            </div>
            )}
        </Popup>
    );    
}

export { ImageListPopup, ImagePostPopup };