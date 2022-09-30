import React from 'react';
import './landmark.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { getLSItem } from '../auth';

function Landmark(props){
    return (
        <div className="landmarkInfo">
            <h1>{props.name}</h1>                
            <img src={props.coverImageSrc} alt="Not found"></img>
            <a href={props.link}>
                <div className="link">{props.link}</div>
            </a>
            <div className='rating'>
                <p>Rating: {props.avgRating}</p>
            </div>
            <div className='comment'>                
                <div><CommentListPopup
                    lmid={props.lmid}
                    name={props.name}
                /></div>
                {getLSItem('user','is_verified') && (
                    // Comment button for activated user                         
                    <div><CommentPostPopup
                        lmid={props.lmid}
                        name={props.name}
                    /></div>
                )}
            </div>
            <div className='image'>
                <div><ImageListPopup
                    lmid={props.lmid}
                /></div>
                {getLSItem('user','is_verified') &&      
                <div><ImagePostPopup
                    lmid={props.lmid}
                /></div>}
            </div>  
        </div>
    );
}

export default Landmark;