import React from 'react';
import './content.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';

function Content(props){
    return(
        <div>
            <button onClick={props.handleToLandmark}>
                Back
            </button>
            <img src={props.content.coverImageSrc} alt="Not found"></img>
            <div className="des">
                <h1>{props.content.name}</h1>
                <p>{props.content.startDate} ~ {props.content.endDate}</p>
                <a href={props.content.link}>
                    <div className="link">{props.content.link}</div>
                </a>      
                <p>Rating: {props.content.avgRating}</p>
                <button onClick={props.toContent}>
                    Detail
                </button>          
            </div>
            <div className='comment'>                
                <div><CommentListPopup
                    lmid={props.curLandmarkId}
                    ctid={props.content.id}
                    name={props.content.name}
                /></div>
                {props.user.is_verified && (
                    // Comment button for activated user                         
                    <div><CommentPostPopup
                        lmid={props.curLandmarkId}
                        ctid={props.content.id}
                        name={props.content.name}
                        user={props.user}
                        handleSetUser={props.handleSetUser}
                    /></div>
                )}
            </div>
            <div className='image'>
                <div><ImageListPopup
                    lmid={props.curLandmarkId}
                    ctid={props.content.id}
                /></div>
                {props.user.is_verified &&      
                <div><ImagePostPopup
                    lmid={props.curLandmarkId}
                    ctid={props.content.id}
                    user={props.user}
                    handleSetUser={props.handleSetUser}
                /></div>}
            </div>
        </div>
    );
}

function AddContent(props){
    return(
        <div>
            <button onClick={props.handleToLandmark}>
                Back
            </button>
        </div>
    );
}

export {Content, AddContent};