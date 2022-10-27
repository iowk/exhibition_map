import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import './comment.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ClipLoader from "react-spinners/ClipLoader";
import star from '../media/star.png';
import star_empty from '../media/star_empty.png';

function WriteRatingBlock(props) {
    // Inside PopupBlock
    function setRatingBox () {
        var children = [];
        // There are (props.rating) filled rating icons
        for(let i = 1 ; i <= props.rating ; ++i){
            let cur=i;
            children.push(<img key={i} src={star} alt='☆'
            onClick={() => props.handleClickRating(cur)}
            className='starImage'></img>);
        }
        // There are (maxRating - props.rating) empty rating icons
        for(let i = props.rating+1 ; i <= props.maxRating ; ++i){
            let cur=i;
            children.push(<img key={i} src={star_empty} alt='★'
            onClick={() => props.handleClickRating(cur)}
            className='starImage'></img>);
        }
        return (
            <div className='ratingBox'>{children}</div>
        );
    }
    return(
        setRatingBox()
    );
}
function CommentListPopup(props){
    const [comments, setComments] = useState([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => {
        let apiPath = '';
        if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/comments/';
        else apiPath = '/map/landmarks/'+props.lmid+'/comments/';
        const fetchData = async () => {
            setLoading(true);
            try{
                const res = await axios().get(apiPath);
                const res_comments = await res.data;
                setComments(res_comments);
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
                    <div className='loader'>
                        <ClipLoader
                            color='blue'
                            loading={loading}
                            size={50}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                    {comments.map((comment, index)=>(
                        <div className="each-comment" key={index}>
                            <div className='title'>
                                <div className='owner'>{comment.owner}</div>
                                <div className='rating'>
                                    <img className='starImage' src={star} alt='Rating:'></img>
                                    <div className='ratingNum'>{comment.rating}</div>
                                </div>
                            </div>
                            <div className='text'>{comment.text}</div>
                        </div>
                    ))}
                </Modal.Body>
            </Modal>
        </>
    );
}
function CommentPostPopup(props){
    // Pop up when user clicks the comment button for landmark or content
    const maxRating = 5;
    const [isPatch, setIsPatch] = useState(false);
    const [rating, setRating] = useState(maxRating);
    const [oldComment, setOldComment] = useState('');
    const commentRef = useRef();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    let apiPath = '';
    if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/comments/';
    else apiPath = '/map/landmarks/'+props.lmid+'/comments/';

    const handleClose = () => setShow(false);
    const handleShow = () => {
        if(props.ctid || props.lmid) fetchComment();
        setShow(true);
    };

    function fetchComment(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                setLoading(true);
                axios(getToken()).get(apiPath+props.user.id+'/')
                .then(res => {
                    // This user already had a comment
                    setIsPatch(true);
                    setRating(res.data['rating']);
                    setOldComment(res.data['text']);
                })
                .catch(e => {
                    // New comment
                    console.log("No comment exists for this user");
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
        })
    }
    function handleClickRating(rating){
        setRating(rating);
    }
    function handleSubmit(event){
        jwtVerify()
        .then((is_valid) =>{
            if(is_valid){
                setLoading(true);
                if(isPatch){
                    axios(getToken()).patch(apiPath+props.user.id+'/', JSON.stringify({
                        rating: rating,
                        text: commentRef.current.value
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                    .then(() => {
                        alert("Comment updated");
                    })
                    .catch((e) =>{
                        console.log(e);
                        alert(e);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
                }
                else{
                    axios(getToken()).post(apiPath, JSON.stringify({
                        rating: rating,
                        text: commentRef.current.value
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                    .then(() => {
                        alert("Comment submitted");
                    })
                    .catch((e) =>{
                        console.log(e);
                        alert(e);
                    })
                    .finally(() => {
                        setLoading(false);
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
                setLoading(true);
                if(isPatch){
                    axios(getToken()).delete(apiPath+props.user.id+'/')
                    .then(() => {
                        alert("Comment deleted");
                    })
                    .catch((e) =>{
                        console.log(e);
                        alert(e);
                    })
                    .finally(() => {
                        setLoading(false);
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
                    <div className='popupForm'>
                        <div className='loader'>
                            <ClipLoader
                                color='blue'
                                loading={loading}
                                size={50}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                        <WriteRatingBlock
                            rating={rating}
                            maxRating={maxRating}
                            handleClickRating={handleClickRating}
                        />
                        <textarea
                            placeholder='Write comment'
                            ref={commentRef}
                            defaultValue={oldComment}
                            className='commentBox'
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

export {CommentListPopup, CommentPostPopup};