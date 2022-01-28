import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.26/vue.esm-browser.min.js';

const vueApp = {
    data() {
        return {
            url                 : 'https://vue3-course-api.hexschool.io/v2',    // 請加入站點
            path                : 'a-hsien', // 請加入個人 API Path
            token               : '',
            tokenName           : 'hexApiToken',
            products            : [],
            currentItem         : {},
            timer               : null,
            isModelShow         : false,
            modelMode           : 'addNew',
            domModel            : {},
            domModelContent     : {},
            domModelUploadInput : {},
            tweenMaxDefault     : { ease: "power4.inOut" , duration: 1 },
            unitArr             : ['個', '件', '支', '張', '隻', '塊', '本', '顆', '台', '片', '把', '份'],
            isMainPhotoSuccess  : false,
            emptyForm           : {},
            modelProduct        : {
                title           : undefined,
                category        : undefined,
                origin_price    : undefined,
                price           : undefined,
                unit            : '個',
                description     : undefined,
                content         : undefined,
                is_enabled      : 0,
                imageUrl        : '',
                imagesUrl       : [/*'https://images.unsplash.com/photo-1618888007540-2bdead974bbb?auto=format&fit=crop&w=987&q=80'*/],
            },
            checkToActive       : false,
            uploadStatus        : '',
            uploadMessage       : '',
            saveStatus          : 'Save',
            editAddImg          : '',
        }
    },
    methods: {
        getItem(item) { // 取得單一產品資訊
            this.currentItem = Object.assign({}, {
                ...item,
                // slider: [item.imageUrl, ...item.imagesUrl],
                slider: [item.imageUrl],
            });
            item.imagesUrl ? this.currentItem.slider.push(...item.imagesUrl) : null;    
                // prevent from there is no KEY 'imagesUrl' in item Object ⇡ 
            this.runSlider(this.currentItem.slider);
        },
        runSlider(imgArr) {     // 輪播
            clearInterval(this.timer);
            let counter = 0;
            const length = imgArr.length;
            this.timer = setInterval(() => {
                counter++;
                this.currentItem.imageUrl = this.currentItem.slider[counter % length];
            }, 2000);
        },
        apiGetProducts(){  // 取得所有產品列
            axios.get( `${this.url}/api/${ this.path }/admin/products` ).then( response => {
                // console.log('取出產品列表:' , response.data);
                this.products = [ ...response.data.products ];
            }).catch( error => {
                // console.log( '取出產品列表 error:' , error?.response );
            });
        },
        apiCheckLogin(){
            axios.post( `${this.url}/api/user/check` ).then( _response => {
                this.apiGetProducts();
            }).catch( _error => {
                location.href = 'index.html';
            });
        },
        apiDeleteItem(item){   // 刪除
            // console.log('delete:' , item.id);
            axios.delete( `${this.url}/api/${ this.path }/admin/product/${item.id}` ).then( response => {
                // console.log('delete:' , response.data);
                this.apiGetProducts();
            }).catch( error => {
                // console.log( 'delete:' , error?.response );
            });
        },
        apiAddNewProduct(){    // model 內，新增產品上傳
            const newProduct = { data : { ...this.modelProduct } };
            this.saveStatus = 'saving';
            axios.post( `${this.url}/api/${ this.path }/admin/product` , newProduct ).then( response => {
                // console.log('新增產品 success:' , response.data);
                this.saveStatus = 'success';
                this.apiGetProducts();
                this.modelProduct = { ...this.emptyForm };
                this.checkToActive = false;
            }).catch( error => {
                // console.log('新增產品 error:' , error?.response );
            });
        },
        apiEditProduct(){   // 修改產品內容
            const newProduct = { data : { ...this.modelProduct } };
            this.saveStatus = 'saving';
            axios['put']( `${this.url}/api/${ this.path }/admin/product/${this.modelProduct.id}` , newProduct )
            .then( response => {
                // console.log('修改 success:' , response.data);
                this.saveStatus = 'success';
                this.apiGetProducts();
            }).catch( error => {
                // console.log('修改 error:' , error?.response );
            });
        },
        loadPhotoSuccess(event){    // 主圖成功
            this.isMainPhotoSuccess = true;
            // console.log('loadPhotoSuccess' , this.isMainPhotoSuccess , event.target.src);
        },
        loadPhotoError(event){  // 主圖失敗
            this.isMainPhotoSuccess = false;
        },
        apiUploadFile(e){  // 上傳圖片
            this.uploadStatus = 'uploading';
            this.uploadMessage = 'Upload Success!';
            // console.log('file:' , e.target.files[0]);
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append( 'file-to-upload' , file );
            axios.post( `${this.url}/api/${this.path}/admin/upload` , formData )
                .then( response => {
                    // console.log( 'upload success:' , response );
                    this.uploadStatus = 'success';
                    this.modelProduct.imagesUrl.push( response.data.imageUrl );
                })
                .catch( error => {
                    // console.log( 'upload fail:' , error.response );
                    this.uploadStatus = 'fail';
                    this.uploadMessage = `（狀態：${error.response.data.message}）`;
                    
                });
            // Reference
            // <form action="/api/thisismycourse2/admin/upload" enctype="multipart/form-data"  method="post">
            //     <input type="file" name="file-to-upload">
            //     <input type="submit" value="Upload">
            // </form>  
        },
        uploadFakeFile(e){  // 上傳圖片：測試用的
            this.uploadStatus = 'uploading';
            // console.log('file:' , e.target.files[0]);
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener( 'load' , () =>{
                this.uploadStatus = 'nothing';
                this.modelProduct.imagesUrl.push( reader.result );
            });
        },
        editImgToArr(){ // Edit Mode - 新增更多圖片，未驗證是否為正確圖片格式
            if( !this.modelProduct.imagesUrl ){
                this.modelProduct.imagesUrl = [];
            };
            this.modelProduct.imagesUrl.push(this.editAddImg);
            this.editAddImg = '';
        },
        setSample(){    // model 新增時，懶得填資料可以用的樣板
            this.modelProduct = {
                title           : '肋眼牛排',
                category        : '食物',
                origin_price    : 1080,
                price           : 980,
                unit            : '份',
                description     : 'Why go to a steakhouse when you can make the most perfect ribeye right at home? Pan seared with the best garlicky herb butter!',
                content         : 'U.S. Prime or Choice',
                is_enabled      : 0,
                imageUrl        : 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=627&q=80',
                imagesUrl       : [
                    'https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?auto=format&fit=crop&w=1470&q=80',
                    'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1470&q=80',
                    'https://images.unsplash.com/photo-1626790291085-19a27173773c?auto=format&fit=crop&w=687&q=80',
                    'https://images.unsplash.com/photo-1611518040286-9af8ba97ab46?auto=format&fit=crop&w=687&q=80',
                    'https://images.unsplash.com/photo-1612078894671-f11ba41d713e?auto=format&fit=crop&w=687&q=80'],
            }
        },
        removeUpload( index ){  // 上傳圖片：移除
            this.modelProduct.imagesUrl.splice( index , 1 );
            // 無法遠端刪除，僅移除陣列內的圖片網址
        },
        removeModelData(){  // 離開 model，將所有欄位清空，回復初始狀態
            this.modelProduct = { ...this.emptyForm };
            this.checkToActive = false;
            this.saveStatus = 'Save';
            this.uploadStatus = '';
            this.uploadMessage = '';
        },
    },
    computed:{
        priceDiscount(){
            if( this.modelProduct.origin_price && this.modelProduct.price ){
                return Math.round( -(100 - (this.modelProduct.price / this.modelProduct.origin_price) * 100) ) ;
            }else{
                return undefined;
            }
        },
    },
    watch:{
        isModelShow( value ){
            gsap.to( this.domModel , { ...this.tweenMaxDefault , autoAlpha: (value ? 1 : 0) } );
            gsap.to( this.domModelContent , Object.assign( {} , this.tweenMaxDefault , { scale: (value ? 1 : 0) } ) );
            if( !value ) this.removeModelData();
        },
        checkToActive( value ){
            this.modelProduct.is_enabled = this.checkToActive ? 1 : 0;
        },
    },
    created(){ 
        this.token = document.cookie.replace(/(?:(?:^|.*;\s*)hexApiToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        axios.defaults.headers.common['Authorization'] = this.token;

        this.emptyForm = { ...this.modelProduct };  // prepare a format form
        this.apiCheckLogin();
    },
    mounted() {
        this.domModel = document.querySelector('#lightbox');
        this.domModelContent = document.querySelector('#lightbox-content');
        this.domModelUploadInput = document.querySelector('#file');
        // this.isModelShow = true;    // 一開始就跳 Model
    },
};

createApp( vueApp ).mount( '#app' );