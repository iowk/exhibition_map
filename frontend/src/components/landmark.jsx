import React, {useState, useEffect} from 'react';
import './landmark.css';
import { CommentListPopup, CommentPostPopup} from './comment';
import { ImageListPopup, ImagePostPopup } from './image';
import { jwtVerify, getToken } from './../auth';
import axios from './../axios';

function ContentOverview(props){
    function handleOnClick(){
        props.handleToContent(props.content);
    }
    return (
        <div className="contentInfo" onClick={handleOnClick}>
            <div className='contentImage'>
                <img src={props.content.coverImageSrc} alt="Not found"></img>
            </div>            
            <div className="des">
                <h2>{props.content.name}</h2>
                <p>{props.content.startDate} ~ {props.content.endDate}</p>
                {props.content.avgRating && 
                    <p className='rating'>Rating: {props.content.avgRating}</p>}       
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
    }, [props, landmark])
    function handleDeleteLandmark(){
        jwtVerify()
        .then((is_valid) => {
            if(is_valid){
                axios(getToken()).delete('/map/landmarks/'+props.curLandmarkId+'/')
                .then(() => {
                    alert("Landmark deleted");
                    props.handleToInitial();
                })
                .catch((e) => {
                    console.log(e);
                });
            }
            else props.handleSetUser(null);
        })
        .catch((e) => {
            console.log(e);
        });        
    }
    function genLandmark(){
        return (
            <div className="landmarkInfo" key='lm'>
                <h1>{landmark.name}</h1>                
                <img src={landmark.coverImageSrc} alt="Not found"></img>
                <a href={landmark.link}>
                    <div className="link">Website</div>
                </a>
                {landmark.avgRating && 
                    <p className='rating'>Rating: {landmark.avgRating}</p>}
                <div className='comment'>                
                    <CommentListPopup
                        lmid={landmark.id}
                        name={landmark.name}
                    />
                    {props.user && props.user.is_verified && (
                        // Comment button for activated user                         
                        <CommentPostPopup
                            lmid={landmark.id}                            
                            name={landmark.name}
                            user={props.user}
                            handleSetUser={props.handleSetUser}
                        />
                    )}
                </div>
                <div className='image'>
                    <ImageListPopup
                        lmid={landmark.id}
                    />
                    {props.user && props.user.is_verified &&      
                    <ImagePostPopup
                        lmid={landmark.id}
                        user={props.user}
                        handleSetUser={props.handleSetUser}
                    />}
                </div>
            </div>
        );
    }
    
    if(landmark){
        var children = [];
        children.push(genLandmark());
        if(props.user && (props.user.is_staff)){
            children.push(
                <div><button onClick={handleDeleteLandmark}>
                    Delete landmark
                </button></div>)
        }
        if(props.user && (props.user.is_staff || props.user.id===landmark.owner)){
            children.push(
                <div className='addContent'><button onClick={props.handleToAddContent}>
                    Add content
                </button></div>)
        }
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
            </div>
        );
    }
    else{
        return(<></>);
    }
}

export default Landmark;