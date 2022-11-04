import React, {useRef, useState, useEffect} from 'react';
import './search.css';
import search from '../media/search.png';
import {ContentOverview, LandmarkOverview} from './overview';
import ClipLoader from "react-spinners/ClipLoader";
import axios from '../axios';

function SearchResultList(props){
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState([]);
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        axios().post('/map/search_fast/', JSON.stringify({
            lat: props.center['lat'],
            lng: props.center['lng'],
            pattern: props.searchPattern,
            count: props.count,
            thres: props.thres
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(res => {
            if(isMounted) setSearchResult(res.data);
            axios().post('/map/search/', JSON.stringify({
                lat: props.center['lat'],
                lng: props.center['lng'],
                pattern: props.searchPattern,
                count: props.count,
                thres: props.thres
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(res => {
                if(isMounted) setSearchResult(res.data);

            })
            .catch(e => {
                console.log(e);
            })
        })
        .catch(e => {
            console.log(e);
        })
        .finally(() => {
            if(isMounted) setLoading(false);
        })
        return () => {
            isMounted = false;
        };
    }, [props])
    var children = [];
    for(let key in searchResult) {
        if(searchResult[key]['is_visible']){
            if(searchResult[key]['landmark_id'] && searchResult[key]['isGoing']){
                // Content
                children.push(<ContentOverview
                    key={key}
                    contentOverview={searchResult[key]}
                    handleToContent={props.handleToContent}
                    showLandmarkName={true}/>);
            }
            else{
                // Landmark
                children.push(<LandmarkOverview
                    key={key}
                    landmarkOverview={searchResult[key]}
                    handleToLandmark={props.handleToLandmark}
                />)
            }
        }
    }
    return(
        <>
            <div>
                {children}
            </div>
            <div className='loader'>
            <ClipLoader
                color='blue'
                loading={loading}
                size={50}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
            </div>
        </>
    );
}

function SearchBar(props){
    const patternRef = useRef();
    return(
        <div className='searchBar'>
            <form>
            <input
                className='inputBox'
                placeholder='Search a landmark or content'
                ref={patternRef}
                onKeyPress={event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        props.handleSearch(patternRef.current.value);
                    }
                }}
            />
            <img className='searchImage' src={search} alt='🔍'
            onClick={() => props.handleSearch(patternRef.current.value)}/>
            </form>
        </div>
    );
}

export {SearchBar, SearchResultList}