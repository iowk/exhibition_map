import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import ClipLoader from "react-spinners/ClipLoader";
import 'react-slideshow-image/dist/styles.css';
import './image.css';

function ImageListPopup(props){
    const [images, setImages] = useState([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => {
        var apiPath = '';
        if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/images/';
        else apiPath = '/map/landmarks/'+props.lmid+'/images/';
        const fetchData = async () => {
            setLoading(true);
            try{
                const res = await axios().get(apiPath);
                const res_images = await res.data;
                setImages(res_images);
            }
            catch(e){
                console.log(e);
            }
            finally{
                setLoading(false);
            }
        }
        if(props.ctid || props.lmid) fetchData();
        setShow(true);
    }
    return(
        <>
            <Button variant="primary" onClick={handleShow}>
                {props.buttonName}
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='popup-loader'>
                        <ClipLoader
                            color='blue'
                            loading={loading}
                            size={50}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                    <Carousel className="carousel-dark">
                        {images.map((slideImage, key)=>
                            <Carousel.Item key={key}>
                                <img src={slideImage.src} className="d-flex mw-100 mh-100 carousel-image-center" alt="..."/>
                                <Carousel.Caption>
                                    <p>{slideImage.name}</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                        )}
                    </Carousel>
                </Modal.Body>
            </Modal>
        </>
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
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const imageTitleRef = useRef();
    let apiPath = '';
    if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/images/';
    else apiPath = '/map/landmarks/'+props.lmid+'/images/';
    function handleSubmit(){
        jwtVerify()
        .then(is_valid => {
            if(is_valid){
                setLoading(true);
                let form_data = new FormData();
                form_data.append('src', image, image.name);
                form_data.append('name', imageTitleRef.current.value);
                axios(getToken()).post(apiPath, form_data,
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
                })
                .finally(()=>{
                    setLoading(false);
                });
            }
            else{
                alert("Please login again");
                <Navigate to = '/login/'/>;
            }
        })
        .catch(e => {
            console.log(e);
        })
    }
    return(
        <>
            <Button variant="primary" onClick={handleShow}>
                {props.buttonName}
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='popup-loader'>
                        <ClipLoader
                            color='blue'
                            loading={loading}
                            size={50}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                    <div className='w-100'>
                        <input
                            placeholder='Title'
                            ref={imageTitleRef}
                            className='w-100'
                        />
                    </div>
                    <div className='mt-3 imagePreviewBox'>
                        <UploadImage handleSetImage={setImage}/>
                    </div>
                    <div className='buttonDiv'>
                        <Button variant="primary" onClick={handleSubmit} className='mt-2'>
                            Upload
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export { ImageListPopup, ImagePostPopup, UploadImage };