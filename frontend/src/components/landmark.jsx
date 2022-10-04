import React, {useState, useEffect} from 'react';
import './landmark.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { jwtVerify } from './../auth';
import axios from './../axios';

function ContentOverview(props){
    return (
        <div className="contentInfo">
            <img src={props.content.coverImageSrc} alt="Not found"></img>
            <div className="des">
                <h1>{props.content.name}</h1>
                <p>{props.content.startDate} ~ {props.content.endDate}</p>
                <a href={props.content.link}>
                    <div className="link">{props.content.link}</div>
                </a>      
                <p>Rating: {props.content.avgRating}</p>
                <button onClick={props.handleToContent(props.content)}>
                    Detail
                </button>          
            </div>
        </div>
    );
}

function Landmark(props){
    const [landmark, setLandmark] = useState(null); // Currently clicked landmark
    const [contents, setContents] = useState(null); // Contents of the currently clicked landmark
    useEffect(() => {
        const fetchData = async() => {
            try{
                // GET landmark                
                const res_lm = await axios().get('/map/landmarks/'+props.curLandmarkId+'/');            
                const lm = await res_lm.data;
                // GET contents
                const res_cons = await axios().get('/map/landmarks/'+props.curLandmarkId+'/contents/');            
                const ct = await res_cons.data;
                // Set state
                setLandmark(lm);
                setContents(ct);
            } catch (e) {
                console.log(e);
            }
        }
        if(!landmark || landmark.id!==props.curLandmarkId) fetchData();
        if(props.user){
            jwtVerify()
            .then((is_valid) => {
                if(!is_valid) props.handleSetUser(null);
            })
            .catch((e) => {
                console.log(e);
            });
        }        
    }, [props])
    function genLandmark(){
        return (
            <div className="landmarkInfo" key='lm'>
                <h1>{landmark.name}</h1>                
                <img src={landmark.coverImageSrc} alt="Not found"></img>
                <a href={landmark.link}>
                    <div className="link">{landmark.link}</div>
                </a>
                <div className='rating'>
                    <p>Rating: {landmark.avgRating}</p>
                </div>
                <div className='comment'>                
                    <div><CommentListPopup
                        lmid={landmark.id}
                        name={landmark.name}
                    /></div>
                    {props.user && props.user.is_verified && (
                        // Comment button for activated user                         
                        <div><CommentPostPopup
                            lmid={landmark.id}                            
                            name={landmark.name}
                            user={props.user}
                            handleSetUser={props.handleSetUser}
                        /></div>
                    )}
                </div>
                <div className='image'>
                    <div><ImageListPopup
                        lmid={landmark.id}
                    /></div>
                    {props.user && props.user.is_verified &&      
                    <div><ImagePostPopup
                        lmid={landmark.id}
                        user={props.user}
                        handleSetUser={props.handleSetUser}
                    /></div>}
                </div>
            </div>
        );
    }
    
    if(landmark){
        var children = [];
        children.push(genLandmark());
        for(var key in contents) {
            if(contents[key]['isGoing']){ 
                // Ongoing event content       
                children.push(<ContentOverview 
                    key={contents[key].id}
                    content={contents[key]}
                    handleToContent={props.handleToContent}/>);
            }
        }
        return (
            <div>
                {children}
                <button onClick={props.handleToAddContent}>
                    Add content
                </button>
            </div>
        );
    }
    else{
        return(<></>);
    }
}

export default Landmark;