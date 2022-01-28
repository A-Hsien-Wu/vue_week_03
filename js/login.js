import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.26/vue.esm-browser.min.js';


createApp({
    data: function () {
        return {
            url         : 'https://vue3-course-api.hexschool.io/v2',    // 請加入站點
            path        : 'a-hsien', // 請加入個人 API Path
            loginUser   : { username: '' , password: '' }, 
            token       : '',
            tokenName   : 'hexApiToken',
            warning     : '',
            showPassword: false,
            btnText     : 'Login',
        };
    },
    methods: {
        clickLogin(){
            this.btnText = 'connecting...';
            if( this.loginUser.username === '' || this.loginUser.password === '' ){
                this.warning = 'Neither of the text fields can be blank!'
                this.btnText = 'Login';
            }else{
                axios.post( `${this.url}/admin/signin` , this.loginUser )
                    .then( response => {
                        this.btnText = 'Login';
                        console.log('response:' , response);
                        const { token , expired } = response.data;
    
                        document.cookie = `${ this.tokenName }=${ token }; expires=${ new Date(expired) }; path=/;`;   
                        // 把 token 存到網頁 cookie
                        this.token = token;
                        axios.defaults.headers.common['Authorization'] = token; // 把 token 存在 headers
                        console.log('token:' , this.token);
                        location.href = '/html/new-products.html';    // 前往下一頁
                    }).catch( error => {
                        const errorMessage = error?.response?.data?.error;
                        console.log('error:' , errorMessage);

                        if( errorMessage.code === 'auth/invalid-email' ){
                            this.warning = '登入失敗! Email 格式錯誤';
                        }else if( errorMessage.code === 'auth/user-not-found' ){
                            this.warning = '登入失敗! 查無此帳號';
                        }else if( errorMessage.code === 'auth/wrong-password' ){
                            this.warning = '登入失敗! 密碼不正確，請再重新輸入一次';
                        }else if( errorMessage.code === 'auth/too-many-requests' ){
                            this.warning = '登入失敗! 嘗試登入失敗次數過多，目前無法再登入，請稍後再回來';
                        }
                        this.btnText = 'Login';
                    });
            }
        },
        focusInput(){
            this.warning = '';
        },
    },
    created(){ 
        this.token = document.cookie.replace(/(?:(?:^|.*;\s*)hexApiToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        console.log('token:' , this.token);
    }
}).mount("#app");

// code:auth/invalid-email
// message:The email address is badly formatted
// email 格式錯誤

// code:auth/user-not-found
// message:There is no user record corresponding to this identifier. The user may have been deleted.
// 查無此帳號

// code:auth/wrong-password
// message:The password is invalid or the user does not have a password.
// 密碼不正確

// code:auth/too-many-requests
// message:Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.
// 嘗試登入失敗次數過多目前無法再登入請稍後再回來