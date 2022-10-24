import React, { useState } from 'react';
import {jwtVerify, getToken} from './auth';
import Button from 'react-bootstrap/Button';
import axios from './axios';
import { delay } from './utils';

function AdminPostLandmarks(props){
    const [file, setFile] = useState({});
    function handleOnChange(e){
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            const ls = JSON.parse(e.target.result)
            setFile(ls);
            console.log(ls.length,"items");
        }
    }
    async function handleSubmit(){
        for(let i = 0; i < file.length; ++i){
            await delay(10);
            let item = file[i];
            console.log("Posting", item.name);
            let is_valid = await jwtVerify();
            if(is_valid){
                try{
                    await axios(getToken()).post('/map/landmarks/', JSON.stringify(item),
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
                }
                catch(e){
                    console.log(e);
                }
            }
            else{
                console.log("Please login again");
            }
        }
    }
    return(
        <div>
            Upload landmark json file:
            <input type='file' onChange={handleOnChange}/>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </div>
    );
}
function AdminPostContents(props){
    const [file, setFile] = useState({});
    function handleOnChange(e){
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            const ls = JSON.parse(e.target.result)
            setFile(ls);
            console.log(ls.length,"items");
        }
    }

    async function handleSubmit(){
        for(let i = 0; i < file.length; ++i){
            await delay(10);
            let item = file[i];
            console.log("Posting", item.name);
            try{
                const res_lm = await axios(getToken()).post('/map/find_nearest_landmark/', JSON.stringify(
                {lat: parseFloat(item.lat), lng: parseFloat(item.lng), thres: 0.01}),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                const lm = await res_lm.data;
                if(!lm){
                    console.log("-Landmark not found");
                    continue;
                }
                let is_valid = await jwtVerify();
                if(is_valid){
                    try{
                        await axios(getToken()).post('/map/landmarks/'+lm.id+'/contents/', JSON.stringify(item),
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        });
                    }
                    catch(e){
                        console.log(e);
                    }
                }
                else{
                    console.log("Please login again");
                }
            }
            catch(e){
                console.log(e);
                continue;
            }
        }
    }
    return(
        <div>
            Upload content json file:
            <input type='file' onChange={handleOnChange}/>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </div>
    );
}
export {AdminPostLandmarks, AdminPostContents};