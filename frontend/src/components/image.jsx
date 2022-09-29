import React, { Component, useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import Popup from 'reactjs-popup';
import { Slide } from 'react-slideshow-image';
import axios from './../axios';
import { jwtVerify, getLSItem } from '../auth';
import 'react-slideshow-image/dist/styles.css';
import './image.css'

class ImageListPopup extends Component {
    constructor(props){
        super(props);
        this.state = {
            images: [],          
        };
    }
    async componentDidMount(){
        var res;
        if(this.props.ctid){
            res = await axios().get('/map/landmarks/'+this.props.lmid+'/contents/'+this.props.ctid+'/images/');            
        }
        else{
            res = await axios().get('/map/landmarks/'+this.props.lmid+'/images/');
        }
        const images = await res.data;
        this.setState({images: images});
    }
    render() {
        return(
            <Popup trigger={<button className='defaultButton'>Show photos</button>}
            position="right center"
            modal>
                {close => (
                <div className="slide-container">
                    <Slide>
                    {this.state.images.map((slideImage, index)=>(
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
    function createImageEntry(){
        let form_data = new FormData();
        form_data.append('src', image, image.name);
        form_data.append('name', imageTitle);
        return form_data;
    }
    function handleSubmit(){
        jwtVerify()
        .then(is_valid => {
            if(is_valid){
                axios(getLSItem('jwt','access')).post(apiPath, createImageEntry(image),
                {
                    headers: {
                        'Content-type':'multipart/form-data',
                    },
                })
                .then(() => {alert("Uploaded");})
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