import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './report.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ClipLoader from "react-spinners/ClipLoader";

function ReportPostPopup(props){
    // Pop up when user clicks the report button for landmark or content
    const [isPatch, setIsPatch] = useState(false);
    const [oldReport, setOldReport] = useState('');
    const reportRef = useRef();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    let apiPath = '';
    if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/reports/';
    else apiPath = '/map/landmarks/'+props.lmid+'/reports/';

    const handleClose = () => setShow(false);
    const handleShow = () => {
        if(props.ctid || props.lmid) fetchReport();
        setShow(true);
    };

    function fetchReport(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                setLoading(true);
                axios(getToken()).get(apiPath+props.user.id+'/')
                .then(res => {
                    // This user already had a report
                    setIsPatch(true);
                    setOldReport(res.data['text']);
                })
                .catch(e => {
                    // New report
                    console.log("No report exists for this user");
                    setIsPatch(false);
                })
                .finally(() => {
                    setLoading(false);
                });
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
    function handleSubmit(event){
        jwtVerify()
        .then((is_valid) =>{
            if(is_valid){
                if(isPatch){
                    axios(getToken()).patch(apiPath+props.user.id+'/', JSON.stringify({
                        text: reportRef.current.value
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                    .then(() => {
                        alert("Report updated");
                    })
                    .catch((e) =>{
                        console.log(e);
                        alert(e);
                    });
                }
                else{
                    axios(getToken()).post(apiPath, JSON.stringify({
                        text: reportRef.current.value
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                    .then(() => {
                        alert("Report submitted");
                    })
                    .catch((e) =>{
                        console.log(e);
                        alert(e);
                    });
                }
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
    function handleDelete(event){
        jwtVerify()
        .then((is_valid) =>{
            if(is_valid){
                if(isPatch){
                    axios(getToken()).delete(apiPath+props.user.id+'/')
                    .then(() => {
                        alert("Report deleted");
                    })
                    .catch((e) =>{
                        console.log(e);
                        alert(e);
                    });
                }
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
                    <div className='popupForm'>
                        <textarea
                            placeholder='Report message'
                            ref={reportRef}
                            defaultValue={oldReport}
                            className='reportBox'
                        />
                        <div className='buttonDiv'>
                            <Button onClick={handleSubmit} className='primary'>
                                Submit
                            </Button>
                            {isPatch && <Button onClick={handleDelete} className='primary'>
                                Delete
                            </Button>}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export {ReportPostPopup};