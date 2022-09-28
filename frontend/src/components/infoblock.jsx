import React, { Component } from 'react';
import Landmark from './landmark';
import Content from './content';
import axios from './../axios';

class InfoBlock extends Component {
    // Block containing landmark information 
    constructor(props) {
        super(props);
        this.state = {
            isInitial: true, // Initial main page without landmark clicked
            curLandmarkId: 0, // ID of currently clicked landmark
            landmark: {}, // Currently clicked landmark
            contents: {}, // Contents of the currently clicked landmark
        };
    }
    async componentDidUpdate() {
        try{
            if(!(this.props.isInitial) && this.state.curLandmarkId!==this.props.curLandmarkId){
                // GET landmarks
                const res_lm = await axios().get('/map/landmarks/'+this.props.curLandmarkId.toString()+'/');            
                const landmark = await res_lm.data;
                // GET contents
                const res_cons = await axios().get('/map/landmarks/'+this.props.curLandmarkId.toString()+'/contents/');            
                const contents = await res_cons.data;
                // Set state for InfoBlock
                this.setState({curLandmarkId: this.props.curLandmarkId});
                this.setState({isInitial: false});
                this.setState({landmark: landmark});
                this.setState({contents: contents});
            }            
        } catch (e) {
            console.log(e);
        }
    }
    setLandmarkBox(landmark) {
        return <Landmark
            lmid={landmark['id']}
            key={landmark['name']}
            name={landmark['name']}
            link={landmark['link']}
            coverImageSrc={landmark['coverImageSrc']}
            avgRating={landmark['avgRating']}
        />;
    }
    setContentBox(lmid, content) {
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
    render() {
        if(this.state.isInitial){
            // Initial main page without landmark clicked
            return(
                <div> Click a landmark </div>
            );
        }
        else{
            var children = [];
            if(Object.keys(this.state.landmark).length > 0){
                children.push(this.setLandmarkBox(this.state.landmark));
            }            
            for(var key in this.state.contents) {
                if(this.state.contents[key]['isGoing']){ 
                    // Ongoing event content       
                    children.push(this.setContentBox(this.state.curLandmarkId,this.state.contents[key]));
                }
            }
            return (
                <div>
                    {children}
                </div>
            );   
        }         
    }
}
export default InfoBlock