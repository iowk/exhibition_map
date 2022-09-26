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
            localStorage.setItem('access_jwt', res.data['access']);
            localStorage.setItem('refresh_jwt', res.data['refresh']);
            localStorage.setItem('username', username);    
            resolve();
        })
        .catch (e => {
            reject();
        });
    });    
}

export function logout(){
    localStorage.setItem('access_jwt', '');
    localStorage.setItem('refresh_jwt', '');
    localStorage.setItem('username', '');
}

export async function jwtRefresh(){
    console.log("Refresh");
    return new Promise((resolve) => {        
        let r_jwt = localStorage.getItem('refresh_jwt');
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
            localStorage.setItem('access_jwt', res.data['access']);            
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
        let a_jwt = localStorage.getItem('access_jwt');
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
