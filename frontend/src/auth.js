import axios from './axios';

export async function login(username, password){
    return new Promise((resolve, reject) => {
        logout();
        axios().post('/map/login/', JSON.stringify({
            username: username,
            password: password,
        }),
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => {        
            localStorage.setItem('jwt', JSON.stringify(res.data));
            axios(res.data['access']).get('/map/current_user/')
            .then(res => {
                localStorage.setItem('user', JSON.stringify(res.data));
                resolve();
            })
            .catch(e => {
                console.log(e);
                alert(e);
                reject();
            })
        })
        .catch (e => {
            reject();
        });
    });    
}

export function logout(){
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
}
export function getLSItem(key1, key2){
    return JSON.parse(localStorage.getItem(key1))[key2];
}
export async function jwtRefresh(){
    console.log("Refresh");
    return new Promise((resolve) => {        
        let r_jwt = getLSItem('jwt', 'refresh');
        if(!r_jwt) resolve(false);
        axios().post('/map/token/refresh/', JSON.stringify({
            refresh: r_jwt,
        }),
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            console.log("Refresh success");
            localStorage.setItem('jwt', JSON.stringify(res.data));            
            resolve(true);
        })
        .catch (e => {
            console.log("Refresh fail");
            logout();
            resolve(false);
        })
    });
}
export async function jwtVerify(){
    return new Promise((resolve) => {
        let a_jwt = getLSItem('jwt', 'access');
        if(!a_jwt) resolve(false);
        axios(a_jwt).post('/map/token/verify/', JSON.stringify({
            token: a_jwt,
        }),
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            resolve(true);
        })
        .catch (e => {
            resolve(jwtRefresh());
        });
    });    
}
