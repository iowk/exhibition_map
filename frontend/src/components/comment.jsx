import React, { useState ,useEffect, useRef } from 'react';
import Popup from 'reactjs-popup';
import { Navigate } from "react-router-dom";
import './comment.css';
import '../general.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import star from '../media/star.png'
import star_empty from '../media/star_empty.png'

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
    useEffect(() => {
        let isMounted = true;
        var apiPath = '';
        if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/comments/';
        else apiPath = '/map/landmarks/'+props.lmid+'/comments/';
        const fetchData = async () => {            
            try{
                const res = await axios().get(apiPath);
                const res_comments = await res.data;
                if(isMounted) setComments(res_comments);
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
        <div id='commentList'><Popup trigger={<button className='defaultButton'>{props.buttonName}</button>}
        position="right center"
        modal>
            {close => (
            <div className="modal">
                <button className="close" onClick={close}> 
                    &times; 
                </button>
                <div className='name'> {props.name} </div>
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
            </div>)}
        </Popup></div>
    );
}
function CommentPostPopup(props){
    // Pop up when user clicks the comment button for landmark or content
    const maxRating = 5;
    const [open, setOpen] = useState(false);
    const [isPatch, setIsPatch] = useState(false);
    const [rating, setRating] = useState(5);
    const commentRef = useRef();

    let apiPath = '';
    if(props.ctid) apiPath = '/map/contents/'+props.ctid+'/comments/';
    else apiPath = '/map/landmarks/'+props.lmid+'/comments/';

    function handleOpen(){
        setOpen(true);
        fetchComment();
    }
    function fetchComment(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).get(apiPath+props.user.id+'/')
                .then(res => {
                    // This user already had a comment
                    setIsPatch(true);
                    setRating(res.data['rating']);
                    commentRef.current.value = res.data['text'];
                })
                .catch(e => {
                    // New comment
                    console.log("No comment exists for this user");
                    setIsPatch(false);
                })
            }
            else{
                alert("Please login again");
                props.handleSetUser(null);
                <Navigate to = '/login/'/>;
            }
        })
        .catch((e) => {
            console.log(e);
        });
    }
    function handleClickRating(rating){
        setRating(rating);
    }
    function handleSubmit(event){
        jwtVerify()
        .then((is_valid) =>{
            if(is_valid){
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
    function handleDelete(event){
        jwtVerify()
        .then((is_valid) =>{
            if(is_valid){
                if(isPatch){
                    axios(getToken()).delete(apiPath+props.user.id+'/')
                    .then(() => {
                        alert("Comment deleted");
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
    const closeModal = () => setOpen(false);
    return(
        <div id='commentPost'>
            <button className='addCommentButton' onClick={handleOpen}>{props.buttonName}</button>
            <Popup
            open={open}
            position="right center"
            closeOnDocumentClick
            onClose={closeModal}
            modal>
                <div className="modal">
                    <button className="close" onClick={closeModal}>                    
                        &times; 
                    </button>
                    <div className="name">
                        {props.name}
                    </div>
                    <div className='popupForm'>
                        <WriteRatingBlock
                            rating={rating}
                            maxRating={maxRating}
                            handleClickRating={handleClickRating}
                        />
                        <textarea
                            placeholder='Write comment'
                            ref={commentRef}
                            className='commentBox'
                        />
                        <div className='buttonDiv'>
                            <button onClick={handleSubmit} className='popupSubmitButton'>
                                Submit
                            </button>
                            {isPatch && <button onClick={handleDelete} className='popupDeleteButton'>
                                Delete
                            </button>}
                        </div>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

export {CommentListPopup, CommentPostPopup};