"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[646],{1441:function(e,n,t){t.d(n,{Z:function(){return C}});var l=t(3827),r=t(8792),i=t(7907),a=t(4090),o=t(5423),c=t(6185),d=t(7404),s=t(5032),h=t(8670),f=t(2071),p=t(6490),u=t(6227),x=t(6382),y=t(9910),g=t(1165),k=t(7898),b=t(1472),Z=t(7366),v=t(1213);let m=[{href:"/dashboard",label:"Dashboard",icon:o.Z},{href:"/journal",label:"Journal",icon:c.Z},{href:"/smc-analysis",label:"SMC Real-Time",icon:d.Z},{href:"/signals",label:"Signals",icon:s.Z},{href:"/screener",label:"Screener",icon:h.Z},{href:"/analysis",label:"Analysis",icon:f.Z},{href:"/killzones",label:"Kill Zones",icon:p.Z},{href:"/fibzones",label:"Fib Zones",icon:u.Z},{href:"/backtest",label:"Backtest",icon:x.Z},{href:"/stats",label:"Statistics",icon:c.Z},{href:"/strategy",label:"Strategy",icon:y.Z},{href:"/sniper",label:"Sniper",icon:g.Z},{href:"/footprint",label:"Footprint",icon:k.Z},{href:"/ml",label:"ML Model",icon:b.Z},{href:"/tradingview",label:"TradingView",icon:k.Z},{href:"/telegram",label:"Telegram",icon:Z.Z},{href:"/profile",label:"Profile",icon:v.Z}],z=()=>{let e=(new Date().getUTCHours()+3)%24;return e>=20||e<8?{name:"Asian",color:"#f59e0b",bgColor:"rgba(245, 158, 11, 0.1)"}:e>=8&&e<16?{name:"London",color:"#3b82f6",bgColor:"rgba(59, 130, 246, 0.1)"}:e>=13&&e<21?{name:"New York",color:"#10b981",bgColor:"rgba(16, 185, 129, 0.1)"}:{name:"Asian",color:"#f59e0b",bgColor:"rgba(245, 158, 11, 0.1)"}},j={container:{display:"flex",minHeight:"100vh",background:"#0a0a0f"},sidebar:{width:"240px",background:"#13131f",borderRight:"1px solid #1c1c2e",display:"flex",flexDirection:"column",position:"fixed",height:"100vh",overflowY:"auto",zIndex:50},logo:{padding:"20px",borderBottom:"1px solid #1c1c2e"},logoLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},logoIcon:{width:"36px",height:"36px",borderRadius:"8px",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"},logoText:{fontWeight:"bold",fontSize:"18px",color:"#fff"},killzone:{padding:"16px",borderBottom:"1px solid #1c1c2e"},killzoneLabel:{fontSize:"12px",color:"#6b7280",marginBottom:"8px"},killzoneBadge:(e,n)=>({padding:"10px 12px",background:n,borderRadius:"8px",border:"1px solid ".concat(e),display:"flex",alignItems:"center",gap:"8px"}),killzoneDot:e=>({width:"8px",height:"8px",borderRadius:"50%",background:e}),killzoneText:e=>({color:e,fontWeight:"bold",fontSize:"14px"}),killzoneSub:{fontSize:"11px",color:"#6b7280",marginTop:"8px"},nav:{flex:1,padding:"12px"},navItem:e=>({display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",marginBottom:"4px",borderRadius:"8px",textDecoration:"none",fontSize:"14px",fontWeight:e?"600":"400",color:e?"#00d4ff":"#9ca3af",background:e?"rgba(0, 212, 255, 0.1)":"transparent",transition:"all 0.2s"}),activeIndicator:{marginLeft:"auto",width:"6px",height:"6px",borderRadius:"50%",background:"#00d4ff"},user:{padding:"16px",borderTop:"1px solid #1c1c2e"},userLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},userAvatar:{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px",color:"#fff"},userName:{fontSize:"14px",fontWeight:"bold",color:"#fff"},userStatus:{fontSize:"12px",color:"#6b7280"},main:{flex:1,marginLeft:"240px",minHeight:"100vh"}};function C(e){let{children:n}=e,t=(0,i.usePathname)(),[o,c]=(0,a.useState)(z());return(0,a.useEffect)(()=>{let e=setInterval(()=>{c(z())},6e4);return()=>clearInterval(e)},[]),(0,l.jsxs)("div",{style:j.container,children:[(0,l.jsxs)("aside",{style:j.sidebar,children:[(0,l.jsx)("div",{style:j.logo,children:(0,l.jsxs)(r.default,{href:"/dashboard",style:j.logoLink,children:[(0,l.jsx)("div",{style:j.logoIcon,children:(0,l.jsx)(d.Z,{size:20,color:"#fff"})}),(0,l.jsx)("span",{style:j.logoText,children:"CryptoTraderAI"})]})}),(0,l.jsxs)("div",{style:j.killzone,children:[(0,l.jsx)("p",{style:j.killzoneLabel,children:"Active Kill Zone"}),(0,l.jsxs)("div",{style:j.killzoneBadge(o.color,o.bgColor),children:[(0,l.jsx)("span",{style:j.killzoneDot(o.color)}),(0,l.jsx)("span",{style:j.killzoneText(o.color),children:o.name.toUpperCase()})]}),(0,l.jsx)("p",{style:j.killzoneSub,children:"High volatility expected"})]}),(0,l.jsx)("nav",{style:j.nav,children:m.map(e=>{let n=t===e.href||(null==t?void 0:t.startsWith(e.href+"/")),i=e.icon;return(0,l.jsxs)(r.default,{href:e.href,style:j.navItem(n),children:[(0,l.jsx)(i,{size:18}),(0,l.jsx)("span",{children:e.label}),n&&(0,l.jsx)("span",{style:j.activeIndicator})]},e.href)})}),(0,l.jsx)("div",{style:j.user,children:(0,l.jsxs)(r.default,{href:"/profile",style:j.userLink,children:[(0,l.jsx)("div",{style:j.userAvatar,children:"U"}),(0,l.jsxs)("div",{children:[(0,l.jsx)("p",{style:j.userName,children:"User"}),(0,l.jsx)("p",{style:j.userStatus,children:"Connected"})]})]})})]}),(0,l.jsx)("main",{style:j.main,children:n})]})}},5032:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]])},2071:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},1472:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Brain",[["path",{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z",key:"1mhkh5"}],["path",{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z",key:"1d6s00"}]])},6490:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},1165:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Crosshair",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"22",x2:"18",y1:"12",y2:"12",key:"l9bcsi"}],["line",{x1:"6",x2:"2",y1:"12",y2:"12",key:"13hhkx"}],["line",{x1:"12",x2:"12",y1:"6",y2:"2",key:"10w3f3"}],["line",{x1:"12",x2:"12",y1:"22",y2:"18",key:"15g9kq"}]])},7898:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]])},5423:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},6382:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("LineChart",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"m19 9-5 5-4-4-3 3",key:"2osh9i"}]])},7366:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]])},6185:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("PieChart",[["path",{d:"M21.21 15.89A10 10 0 1 1 8 2.83",key:"k2fpak"}],["path",{d:"M22 12A10 10 0 0 0 12 2v10z",key:"1rfc4y"}]])},834:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]])},8670:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},9910:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},6227:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]])},1213:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},7404:function(e,n,t){t.d(n,{Z:function(){return l}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,t(7461).Z)("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]])},7907:function(e,n,t){var l=t(5313);t.o(l,"usePathname")&&t.d(n,{usePathname:function(){return l.usePathname}})}}]);