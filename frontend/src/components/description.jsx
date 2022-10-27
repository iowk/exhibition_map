import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './description.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ClipLoader from "react-spinners/ClipLoader";

function DesPostPopup(props){
    // Pop up when user clicks the add description button for landmark or content
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const desRef = useRef();

    let apiPath = '';
    if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/';
    else apiPath = '/map/landmarks/'+props.lmid+'/';

    function handleSubmit(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                setLoading(true);
                axios(getToken()).patch(apiPath,JSON.stringify({description: desRef.current.value}),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then(() => {
                    alert("Description added");
                })
                .catch((e) => {
                    console.log(e);
                    alert(JSON.stringify(e.response.data));
                })
                .finally(() => {
                    setLoading(false);
                })
            }
            else{
                alert("Please login again");
                <Navigate to = '/login/'/>;
            }
        })
        .catch((e) => {
            console.log(e);
        });
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
                    <div className='loader'>
                        <ClipLoader
                            color='blue'
                            loading={loading}
                            size={50}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                    <textarea
                        placeholder='Write description'
                        ref={desRef}
                        defaultValue={props.description}
                        className='desBox'
                    />
                    <div className='buttonDiv'>
                        <Button variant="primary" onClick={handleSubmit} className='mt-2'>
                            Submit
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export {DesPostPopup};