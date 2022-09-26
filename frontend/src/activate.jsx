import { useParams } from 'react-router-dom';
import axios from './axios';

function Activate(){
    const { uidb64, token } = useParams();
    axios().get('/map/activate/'+uidb64+'/'+token+'/')
    .then(res=> {
        if(res.data['is_verified']) alert("Activation success");
        else alert("Activation fail");
    })
    .catch(e => {
        console.log(e.message);
    })
    ;  
    return(<div></div>);
}
export default Activate;