var L=Object.defineProperty;var R=(r,t,i)=>t in r?L(r,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):r[t]=i;var h=(r,t,i)=>(R(r,typeof t!="symbol"?t+"":t,i),i);import{r as x,u as _,j as e,L as j,B as O,P as U,l,b as a,M,a as z,R as Y,c as I,O as F,o as W,d as q,i as V,e as X,f as G,g as $,h as J,k as K,m as Q}from"./vendor-640d4978.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function i(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerpolicy&&(o.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?o.credentials="include":n.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(n){if(n.ep)return;n.ep=!0;const o=i(n);fetch(n.href,o)}})();const Z="modulepreload",ee=function(r){return"/"+r},T={},E=function(t,i,s){if(!i||i.length===0)return t();const n=document.getElementsByTagName("link");return Promise.all(i.map(o=>{if(o=ee(o),o in T)return;T[o]=!0;const c=o.endsWith(".css"),d=c?'[rel="stylesheet"]':"";if(!!s)for(let u=n.length-1;u>=0;u--){const f=n[u];if(f.href===o&&(!c||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${o}"]${d}`))return;const m=document.createElement("link");if(m.rel=c?"stylesheet":Z,c||(m.as="script",m.crossOrigin=""),m.href=o,document.head.appendChild(m),c)return new Promise((u,f)=>{m.addEventListener("load",u),m.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${o}`)))})})).then(()=>t())},H=x.createContext(void 0),te="/assets/Logo_colored-d78b4c05.svg";function P(){const r=x.useContext(H),{t}=_();return e.jsxs("div",{className:"m-12 flex flex-col lg:flex-row items-center justify-between",children:[e.jsx(j,{to:"/",children:e.jsx("img",{alt:"Matrix Art",src:te})}),e.jsxs("div",{className:"flex items-center mt-8 lg:mt-0 flex-col sm:flex-row",children:[e.jsxs("div",{className:"flex items-center lg:justify-between w-80 mx-6 ease-in-out hover:scale-105 transition-transform duration-300",children:[e.jsx("div",{className:"absolute ml-4",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",fill:"#AAB3CF",children:[e.jsx("path",{d:"M0 0h24v24H0V0z",fill:"none"}),e.jsx("path",{d:"M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"})]})}),e.jsx("input",{className:"search-bg shadow rounded-2xl border-0 py-3 px-4 pl-12 text-data",placeholder:t("Search")})]}),r!=null&&r.isLoggedIn()?e.jsx(j,{to:"/",className:"text-white font-bold logo-bg rounded-2xl py-3 px-12 shadow mt-4 sm:mt-0 transition-transform ease-in-out duration-300 hover:scale-105",children:t("Post")}):e.jsx(j,{to:"/join",className:"text-white font-bold logo-bg rounded-2xl py-3 px-12 shadow mt-4 sm:mt-0 transition-transform ease-in-out duration-300 hover:scale-105",children:t("Join")})]})]})}function ie(r){let t="pending",i;const s=r().then(n=>{t="success",i=n},n=>{t="error",i=n});return{read(){switch(t){case"pending":throw s;case"error":throw i;case"success":return i}}}}const A=new Map;function se(r){let t=A.get(r);return t||(t=ie(()=>new Promise((i,s)=>{const n=new window.Image;n.src=r,n.addEventListener("load",()=>i(r)),n.addEventListener("error",()=>s(new Error(`Failed to load image ${r}`)))})),A.set(r,t),t)}function ne(r){return se(r.src??"undefined").read(),e.jsx("img",{...r})}function p({user:r,post:t}){return e.jsx(x.Suspense,{fallback:e.jsx("div",{className:"flex flex-col w-full",children:e.jsx(O,{color:"#FEA500"})}),children:e.jsxs("div",{className:"flex flex-col",children:[e.jsx(j,{"aria-label":`Open post by ${r.display_name}`,to:`/post/${t.event_id}`,className:"w-full",children:e.jsx(ne,{className:"rounded-3xl shadow object-cover transition-transform ease-in-out duration-300 hover:scale-105",src:t.content.file.url})}),e.jsxs("div",{className:"flex items-center justify-between py-4",children:[e.jsxs(j,{className:"flex items-center",to:`/profile/${r.mxid}`,children:[e.jsx("img",{className:"w-11 h-11 rounded-full mr-4 border-2 border-[#AAB3CF] hover:border-indigo-300 ease-in-out duration-150",src:r.avatar_url}),e.jsx("p",{className:"text-data text-lg font-medium",children:r.display_name})]}),e.jsxs("div",{className:"flex text-data text-lg items-center",children:[e.jsxs("a",{className:"mr-4 flex items-center",href:"#",children:[e.jsx("span",{className:"mr-2 hover:fill-red-600 fill-[#AAB3CF] ease-in-out duration-150",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",children:[e.jsx("path",{d:"M0 0h24v24H0V0z",fill:"none"}),e.jsx("path",{d:"M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"})]})}),e.jsx("span",{children:"5"})]}),e.jsxs("a",{className:"flex items-center",href:"#",children:[e.jsx("span",{className:"mr-2 fill-[#AAB3CF] ease-in-out duration-150 hover:fill-orange-400",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",height:"24px",viewBox:"0 0 24 24",width:"24px",children:[e.jsx("path",{d:"M0 0h24v24H0V0z",fill:"none"}),e.jsx("path",{d:"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"})]})}),e.jsx("span",{children:"11"})]})]})]})]})})}class g{constructor(t,i,s){h(this,"mxid");h(this,"display_name");h(this,"avatar_url");this.mxid=t,this.display_name=i,this.avatar_url=s}}class y{constructor(t,i){h(this,"event_id");h(this,"content");this.event_id=t,this.content=i}}const re=[{size:500,columns:1},{size:800,columns:2},{size:1400,columns:3},{size:1401,columns:4}];function oe(){const{t:r}=_();return e.jsxs("div",{className:"flex flex-col",children:[e.jsx("header",{children:e.jsx(P,{})}),e.jsxs("main",{className:"m-12 mt-6",children:[e.jsx("h1",{className:"text-3xl font-bold mb-4 text-white",children:r("Explore")}),e.jsx("div",{className:"flex justify-center",id:"gallery",children:e.jsxs(U,{gap:"24px",breakpoints:re,children:[e.jsx(p,{user:new g("a","Person A","https://images.unsplash.com/photo-1519699047748-de8e457a634e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3NzYyNA&ixlib=rb-4.0.3&q=80&w=922"),post:new y("a",{file:{url:"https://images.unsplash.com/photo-1648773009733-1eab564f3330?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3Nzk0MA&ixlib=rb-4.0.3&q=80&w=614"}})}),e.jsx(p,{user:new g("b","Person B","https://images.unsplash.com/photo-1485893086445-ed75865251e0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3Nzc2Ng&ixlib=rb-4.0.3&q=80&w=80"),post:new y("b",{file:{url:"https://images.unsplash.com/photo-1648775933902-f633de370964?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODE1OQ&ixlib=rb-4.0.3&q=80&w=1383"}})}),e.jsx(p,{user:new g("c","Person C","https://images.unsplash.com/photo-1584997159889-8bb96d0a2217?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODAxNw&ixlib=rb-4.0.3&q=80&w=80"),post:new y("c",{file:{url:"https://images.unsplash.com/photo-1648793633175-f3635585014b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODIwNA&ixlib=rb-4.0.3&q=80&w=614"}})}),e.jsx(p,{user:new g("d","Person D","https://images.unsplash.com/photo-1543123820-ac4a5f77da38?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODA0Ng&ixlib=rb-4.0.3&q=80&w=80"),post:new y("d",{file:{url:"https://images.unsplash.com/photo-1648775170273-dcbe48fb12a0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODI1Ng&ixlib=rb-4.0.3&q=80&w=1229"}})}),e.jsx(p,{user:new g("e","Person E","https://images.unsplash.com/photo-1595687825617-10c4d36566e7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODA3Mw&ixlib=rb-4.0.3&q=80&w=80"),post:new y("e",{file:{url:"https://images.unsplash.com/photo-1648769244858-6e20b5999a6b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODI5Nw&ixlib=rb-4.0.3&q=80&w=651"}})}),e.jsx(p,{user:new g("f","Person E","https://images.unsplash.com/photo-1609010586352-ce4e725aa565?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODA5Mg&ixlib=rb-4.0.3&q=80&w=80"),post:new y("f",{file:{url:"https://images.unsplash.com/photo-1648750690732-f6eb85984ff8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=921&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODM1NQ&ixlib=rb-4.0.3&q=80&w=614"}})})]})})]})]})}const b=new l.UnstableValue("m.image","org.matrix.msc1767.image"),B=new l.UnstableValue("m.file","org.matrix.msc1767.file"),C=new l.UnstableValue("m.thumbnail","org.matrix.msc1767.thumbnail"),N=new l.UnstableValue("blurhash","xyz.amorgan.blurhash"),ae=new l.NamespacedValue("matrixart.description"),le=new l.NamespacedValue("matrixart.tags"),ce=new l.NamespacedValue("matrixart.nsfw"),de=new l.NamespacedValue("matrixart.license");class me extends l.ExtensibleEvent{constructor(i){super(i);h(this,"image");h(this,"text");h(this,"thumbnails");h(this,"blurhash");h(this,"file");h(this,"description");h(this,"tags");h(this,"nsfw",!1);h(this,"license");const s=b.findIn(this.wireContent),n=l.M_TEXT.findIn(this.wireContent),o=B.findIn(this.wireContent),c=C.findIn(this.wireContent),d=N.findIn(this.wireContent),w=ae.findIn(this.wireContent),m=le.findIn(this.wireContent),u=ce.findIn(this.wireContent),f=de.findIn(this.wireContent);if(l.isProvided(s)){if(!s)throw new l.InvalidEventError("m.image is required to be present");this.image=s}if(l.isProvided(o)){if(!o)throw new l.InvalidEventError("m.file is required to be present");this.file=o}if(l.isOptionalAString(n)){if(!s)throw new l.InvalidEventError("m.text is required to be present");this.text=n}if(l.isProvided(c)){if(!Array.isArray(c))throw new l.InvalidEventError("m.thumbnail contents must be an array");this.thumbnails=c}if(l.isOptionalAString(d)&&(this.blurhash=d),l.isOptionalAString(w)&&(this.description=w),l.isProvided(m)){if(!Array.isArray(m))throw new l.InvalidEventError("matrixart.tags contents must be an array");this.tags=m}if(l.isProvided(u)){if(typeof u!="boolean")throw new l.InvalidEventError("matrixart.tags contents must be an boolean");this.nsfw=u}l.isOptionalAString(f)&&(this.license=f)}isEquivalentTo(i){return l.isEventTypeSame(i,b)}serialize(){return{type:"m.image",content:{[l.M_TEXT.name]:this.text,[B.name]:this.file,[b.name]:this.image,[C.name]:this.thumbnails,[N.name]:this.blurhash,["matrixart.description"]:this.description,["matrixart.tags"]:this.tags,["matrixart.nsfw"]:this.nsfw,["matrixart.license"]:this.license}}}}function he(r){const t=r;return new me(t)}l.ExtensibleEvents.registerInterpreter(b,he);l.ExtensibleEvents.unknownInterpretOrder.push(b);function v(){return new Worker("/assets/indexeddb.worker-d9606cee.js")}class D{constructor(t){h(this,"events",[]);h(this,"currentUserDirectory");h(this,"rootDirectory");this.client=t}static async new(){global.Olm||console.error("global.Olm does not seem to be present. Did you forget to add olm in the out directory?");let t;if(window.localStorage.getItem("server")===null?t="https://matrix.art.midnightthoughts.space":t=window.localStorage.getItem("server"),!t)throw new Error("No matrix server URL defined");let i;if(window.localStorage.getItem("mxid_guest")!==null){const n=window.localStorage.getItem("mxid_guest")??void 0,o=window.localStorage.getItem("access_token_guest")??void 0,c=window.localStorage.getItem("device_id_guest")??void 0;i=a.createClient({useAuthorizationHeader:!0,baseUrl:t,userId:n,accessToken:o,deviceId:c,store:new a.IndexedDBStore({indexedDB:window.indexedDB,dbName:"matrix-art-sync:guest",localStorage:window.localStorage,workerFactory:()=>new v}),cryptoStore:new a.IndexedDBCryptoStore(window.indexedDB,"matrix-art:crypto")}),i.setGuest(!0)}{const n=a.createClient({baseUrl:"https://matrix.art.midnightthoughts.space"}),{user_id:o,device_id:c,access_token:d}=await n.registerGuest();i=a.createClient({useAuthorizationHeader:!0,baseUrl:t,userId:o,accessToken:d,deviceId:c,store:new a.IndexedDBStore({indexedDB:window.indexedDB,dbName:"matrix-art-sync:guest",localStorage:window.localStorage,workerFactory:()=>new v}),cryptoStore:new a.IndexedDBCryptoStore(window.indexedDB,"matrix-art:crypto")}),i.setGuest(!0),window.localStorage.setItem("mxid_guest",o),window.localStorage.setItem("access_token_guest",d),window.localStorage.setItem("device_id_guest",c),window.localStorage.setItem("server",t)}let s;if(window.localStorage.getItem("mxid")!==null){const n=window.localStorage.getItem("mxid")??void 0,o=window.localStorage.getItem("access_token")??void 0,c=window.localStorage.getItem("device_id")??void 0;s=a.createClient({useAuthorizationHeader:!0,baseUrl:t,userId:n,accessToken:o,deviceId:c,store:new a.IndexedDBStore({indexedDB:window.indexedDB,dbName:"matrix-art-sync:guest",localStorage:window.localStorage,workerFactory:()=>new v}),cryptoStore:new a.IndexedDBCryptoStore(window.indexedDB,"matrix-art:crypto")}),s.setGuest(!1)}return new D(s??i)}isLoggedIn(){return this.client.isLoggedIn()&&!this.client.isGuest()}async start(){this.client.on(a.MatrixEventEvent.Decrypted,(i,s)=>{const n=i.unstableExtensibleEvent;n!=null&&n.isEquivalentTo(b)&&this.events.push(i)}),console.log("start"),await this.client.store.startup(),await this.client.initCrypto(),await this.client.startClient();const t=await this.client.joinRoom("");await k(1e3),this.rootDirectory=new M.MSC3089TreeSpace(this.client,t.roomId),console.log("started")}async register(t="https://matrix.art.midnightthoughts.space",i,s,n=!1){var o,c;if(this.client.stopClient(),this.client=a.createClient({useAuthorizationHeader:!0,baseUrl:t,userId:i,deviceId:"Matrix Art",store:new a.IndexedDBStore({indexedDB:window.indexedDB,dbName:"matrix-art-sync:loggedin",localStorage:window.localStorage,workerFactory:()=>new v}),cryptoStore:new a.IndexedDBCryptoStore(window.indexedDB,"matrix-art:crypto")}),await this.client.register(i,s,null,{type:"m.login.dummy"}),window.localStorage.setItem("server",t),window.localStorage.setItem("mxid",i),window.localStorage.setItem("access_token",this.client.getAccessToken()??"unknown"),window.localStorage.setItem("device_id","Matrix Art"),await this.start(),n){const d=(o=this.rootDirectory)==null?void 0:o.getDirectories(),w=(c=this.client.getUserId())==null?void 0:c.replace(":","_");d!=null&&d.some(m=>m.room.name===w)?this.rootDirectory=d==null?void 0:d.find(m=>m.room.name===w):await this.createProfileFolder()}}async login(t,i,s,n=!1){var o,c;if(this.client.stopClient(),this.client=a.createClient({useAuthorizationHeader:!0,baseUrl:t,userId:i,deviceId:"Matrix Art",store:new a.IndexedDBStore({indexedDB:window.indexedDB,dbName:"matrix-art-sync:loggedin",localStorage:window.localStorage,workerFactory:()=>new v}),cryptoStore:new a.IndexedDBCryptoStore(window.indexedDB,"matrix-art:crypto")}),await this.client.loginWithPassword(i,s),window.localStorage.setItem("server",t),window.localStorage.setItem("mxid",i),window.localStorage.setItem("access_token",this.client.getAccessToken()??"unknown"),window.localStorage.setItem("device_id","Matrix Art"),await this.start(),n){const d=(o=this.rootDirectory)==null?void 0:o.getDirectories();console.log(d);const w=(c=this.client.getUserId())==null?void 0:c.replace(":","_");d!=null&&d.some(m=>m.room.name===w)?this.rootDirectory=d==null?void 0:d.find(m=>m.room.name===w):await this.createProfileFolder()}}async createProfileFolder(){var s;if(this.client.isGuest())throw new Error("Cannot create a file tree space as a guest");const t=await this.client.joinRoom("");await k(1e3),this.rootDirectory=new M.MSC3089TreeSpace(this.client,t.roomId);const i=(s=this.client.getUserId())==null?void 0:s.replace(":","_");this.currentUserDirectory=await this.createPublicSubDirectory(this.rootDirectory,i??"unknown"),await this.createPublicSubDirectory(this.currentUserDirectory,"Timeline")}async createPublicFileTree(t){var o;if(this.client.isGuest())throw new Error("Cannot create a file tree space as a guest");const{room_id:i}=await this.client.createRoom({name:t,preset:a.Preset.PublicChat,power_level_content_override:{...M.DEFAULT_TREE_POWER_LEVELS_TEMPLATE,users:{["@administrator:art.midnightthoughts.space"]:100,[this.client.getUserId()??"broken"]:100}},invite:["@administrator:art.midnightthoughts.space"],creation_content:{[a.RoomCreateTypeField]:a.RoomType.Space},initial_state:[{type:a.UNSTABLE_MSC3088_PURPOSE.name,state_key:a.UNSTABLE_MSC3089_TREE_SUBTYPE.name,content:{[a.UNSTABLE_MSC3088_ENABLED.name]:!0}},{type:a.EventType.RoomEncryption,state_key:"",content:{algorithm:z}},{type:a.EventType.RoomGuestAccess,state_key:"",content:{guest_access:"can_join"}},{type:a.EventType.RoomHistoryVisibility,state_key:"",content:{history_visibility:"world_readable"}}]}),s=this.client.getRoom(i),n=(o=s==null?void 0:s.getLiveTimeline().getState(a.EventTimeline.FORWARDS))==null?void 0:o.getStateEvents(a.EventType.RoomPowerLevels,"");if(!n)throw new Error("Failed to find PL event");return await this.client.setPowerLevel(i,this.client.getUserId()??"unknown",50,n),new M.MSC3089TreeSpace(this.client,i)}async createPublicSubDirectory(t,i){const s=await this.createPublicFileTree(i);return await this.client.sendStateEvent(t.roomId,a.EventType.SpaceChild,{via:[this.client.getDomain()]},s.roomId),await this.client.sendStateEvent(s.roomId,a.EventType.SpaceParent,{via:[this.client.getDomain()]},t.roomId),s}}function k(r){return new Promise(t=>setTimeout(t,r))}const xe=x.lazy(()=>E(()=>import("./Join-b3fdbe45.js"),["assets/Join-b3fdbe45.js","assets/vendor-640d4978.js"])),we=x.lazy(()=>E(()=>import("./Post-622e0ea3.js"),["assets/Post-622e0ea3.js","assets/vendor-640d4978.js"])),ue=x.lazy(()=>E(()=>import("./Profile-ab7ab629.js"),["assets/Profile-ab7ab629.js","assets/vendor-640d4978.js"])),fe=()=>F.init({locateFile:()=>W}).then(()=>{console.log("Using WebAssembly Olm")}).catch(r=>(console.log("Failed to load Olm: trying legacy version",r),new Promise((t,i)=>{const s=document.createElement("script");s.src=q,s.addEventListener("load",t),s.addEventListener("error",i),document.body.append(s)}).then(()=>window.Olm.init()).then(()=>{console.log("Using legacy Olm")}).catch(t=>{console.log("Both WebAssembly and asm.js Olm failed!",t)})));function pe(){const[r,t]=x.useState(void 0),i=async()=>{const s=await D.new();t(s),console.log("Client loaded"),await(s==null?void 0:s.start()),console.log("Client started")};return x.useEffect(()=>{async function s(){try{await fe(),console.log("Olm loaded")}catch{console.log("Olm not loaded")}await i()}r==null&&s()},[]),e.jsx(H.Provider,{value:r,children:e.jsxs(Y,{children:[e.jsx(I,{path:"/",element:e.jsx(oe,{})}),e.jsx(I,{path:"join",element:e.jsx(x.Suspense,{fallback:e.jsx(S,{}),children:e.jsx(xe,{})})}),e.jsx(I,{path:"/post/:postId",element:e.jsx(x.Suspense,{fallback:e.jsx(S,{}),children:e.jsx(we,{})})}),e.jsx(I,{path:"/profile/:userId",element:e.jsx(x.Suspense,{fallback:e.jsx(S,{}),children:e.jsx(ue,{})})})]})})}function S(){const{t:r}=_();return e.jsxs("div",{className:"flex flex-col",children:[e.jsx("header",{children:e.jsx(P,{})}),e.jsx("main",{className:"m-12 mt-6 flex items-center justify-center",children:e.jsx("p",{className:"text-lg text-data font-bold",children:r("Loading…")})})]})}V.use(X).use(G).use($).init({fallbackLng:"en",debug:!0,interpolation:{escapeValue:!1}});J.createRoot(document.querySelector("#app")).render(e.jsx(K.StrictMode,{children:e.jsx(Q,{basename:"/",children:e.jsx(pe,{})})}));export{H as C,P as H};
