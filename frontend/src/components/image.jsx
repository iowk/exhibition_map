import React, { Component } from 'react';
import axios from './../axios';
import Popup from 'reactjs-popup';
import './image.css'
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { jwtVerify, getLSItem } from '../auth';

class ImageListPopup extends Component {
    constructor(props){
        super(props);
        this.state = {
            images: [],          
        };
    }
    async componentDidMount(){
        const res = await axios().get('/map/landmarks/'+this.props.lmid+'/images/');
        const images = await res.data;
        console.log(images);
        this.setState({images: images});
    }
    render() {
        return(
            <Popup trigger={<button className='defaultButton'>Show photos</button>}
            position="right center"
            modal>
                {close => (
                <div className="slide-container">
                    <Slide>
                    {this.state.images.map((slideImage, index)=>(
                        <div className="each-slide" key={index}>
                        <div className="image-container" style={{'backgroundImage': `url(${slideImage.src})`}}>
                            <span className='image-name'>{slideImage.name}</span>
                        </div>
                        </div>
                    ))}
                    </Slide>
                </div>)}
            </Popup>
        );
    }
}
class ImagePostPopup extends Component {
    constructor(props){
        super(props);
        this.state = {
            images: {},          
        };
    }
    async componentDidMount(){
        const res = await axios().get('/map/landmarks/'+this.props.lmid+'/images/');
        const images = await res.data;
        console.log(images);
        this.setState({images: images});
    }
    render() {
        return(
            <Popup trigger={<button className='defaultButton'>Write comment</button>}
            position="right center"
            modal>
                {close => (
                <div className="post-container">
                </div>)}
            </Popup>
        );
    }
}

export { ImageListPopup, ImagePostPopup };