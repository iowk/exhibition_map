import React, { useState, useEffect } from 'react';
import Landmark from './landmark';
import Content from './content';
import AddLandmark from './addLandmark'
import axios from '../axios';

function InfoBlock(props){
    // Block containing landmark information 
    const [curLandmarkId, setCurLandmarkId] = useState(0); // ID of currently clicked landmark
    const [landmark, setLandmark] = useState({}); // Currently clicked landmark
    const [contents, setContents] = useState({}); // Contents of the currently clicked landmark
    useEffect(() => {
        const fetchData = async() => {
            try{
                // GET landmarks
                const res_lm = await axios().get('/map/landmarks/'+props.curLandmarkId.toString()+'/');            
                const landmark = await res_lm.data;
                // GET contents
                const res_cons = await axios().get('/map/landmarks/'+props.curLandmarkId.toString()+'/contents/');            
                const contents = await res_cons.data;
                // Set state for InfoBlock
                setCurLandmarkId(props.curLandmarkId);
                setLandmark(landmark);
                setContents(contents);
            } catch (e) {
                console.log(e);
            }
        }
        if(props.phase==='landmark' && curLandmarkId!==props.curLandmarkId) fetchData();
    }, [props, curLandmarkId])
    function setLandmarkBox(landmark){
        return <Landmark
            lmid={landmark['id']}
            key={landmark['name']}
            name={landmark['name']}
            link={landmark['link']}
            coverImageSrc={landmark['coverImageSrc']}
            avgRating={landmark['avgRating']}
        />;
    }
    function setContentBox(lmid, content) {
        return <Content
            lmid={lmid}
            ctid={content['id']}
            key={content['name']}
            name={content['name']}
            startDate={content['startDate']}
            endDate={content['endDate']}
            link={content['link']}
            coverImageSrc={content['coverImageSrc']}
            avgRating={content['avgRating']}
        />;
    }
    if(props.phase==='initial'){
        // Initial main page without landmark clicked
        return(
            <div> Click on a landmark </div>
        );
    }
    else if(props.phase==='landmark'){
        var children = [];
        if(Object.keys(landmark).length > 0){
            children.push(setLandmarkBox(landmark));
        }            
        for(var key in contents) {
            if(contents[key]['isGoing']){ 
                // Ongoing event content       
                children.push(setContentBox(curLandmarkId,contents[key]));
            }
        }
        return (
            <div>
                {children}
            </div>
        );   
    }
    else if(props.phase==='add'){
        return <AddLandmark
            latlng = {props.addedMarker}
        />;
    }
    else return(<></>);
}
export default InfoBlock