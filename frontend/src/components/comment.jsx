import React, { useState ,useEffect } from 'react';
import Popup from 'reactjs-popup';
import { Navigate } from "react-router-dom";
import './comment.css';
import axios from '../axios';
import { jwtVerify, getToken } from '../auth';
import star from '../media/star.png'

function WriteRatingBlock(props) {
    // Inside PopupBlock
    function setRatingBox () {
        var children = [];
        children.push(<div className='ratingTitle' key='ratingTitle'>Rating</div>)
        // There are (props.rating) filled rating icons
        for(let i = 1 ; i <= props.rating ; ++i){
            let cur=i;
            children.push(<div className='button' key={cur}><button 
            onClick={() => props.handleClickRating(cur)}
            className='filledRating'>
                </button></div>);
        }
        // There are (maxRating - props.rating) empty rating icons
        for(let i = props.rating+1 ; i <= props.maxRating ; ++i){
            let cur=i;
            children.push(<div className='button' key={cur}><button 
            onClick={() => props.handleClickRating(cur)}
            className='emptyRating'>
                </button></div>);
        }
        return (
            <div className='ratingBox'>{children}</div>
        );
    }
    return(
        setRatingBox()
    );    
}
function WriteCommentBlock(props){
    // Inside CommentPopup
    function setCommentBox() {
        return (
            <textarea
                placeholder='Write comment'
                value={props.comment}
                onChange={props.handleWriteComment}
                className='commentBox'
            />
        );
    }
    return(
        setCommentBox()
    );
}
function CommentListPopup(props){
    const [comments, setComments] = useState([]);
    useEffect(() => {
        let isMounted = true;
        var apiPath = '';
        if(props.ctid) apiPath = '/map/landmarks/'+props.lmid+'/contents/'+props.ctid+'/comments/';
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
        fetchData();
        return () => {
            isMounted = false;
        };
    }, [props.lmid, props.ctid])
    return(
        <div id='commentList'><Popup trigger={<button className='defaultButton'>Show comments</button>}
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
    const [comment, setComment] = useState('');
    const [apiPath, setApiPath] = useState('');
    useEffect(() => {        
        if(props.ctid) setApiPath('/map/landmarks/'+props.lmid+'/contents/'+props.ctid+'/comments/');
        else setApiPath('/map/landmarks/'+props.lmid+'/comments/');
        setRating(5);
        setComment('');
    }, [props.lmid, props.ctid])
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
                    setComment(res.data['text']);
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
    function handleWriteComment(event){
        setComment(event.target.value);
    }
    function handleSubmit(event){
        jwtVerify()
        .then((is_valid) =>{
            if(is_valid){
                if(isPatch){
                    axios(getToken()).patch(apiPath+props.user.id+'/', JSON.stringify({
                        rating: rating,
                        text: comment
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
                        text: comment
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
    const closeModal = () => setOpen(false);
    return(
        <div id='commentPost'>
            <button className='addCommentButton' onClick={handleOpen}>Write comment</button>
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
                        <WriteCommentBlock
                            comment={comment}
                            handleWriteComment={handleWriteComment}
                        />
                        <button onClick={handleSubmit} className='popupSubmitButton'>
                            Submit
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

export {CommentListPopup, CommentPostPopup};