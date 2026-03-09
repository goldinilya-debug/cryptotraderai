(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[93],{2938:function(e,t,n){Promise.resolve().then(n.bind(n,8871))},8871:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return c}});var i=n(3827),l=n(1441),r=n(6490),o=n(9733),s=n(8998);let a={container:{padding:"24px"},title:{margin:0,fontSize:"28px",fontWeight:"bold"},subtitle:{margin:"8px 0 0 0",color:"#6b7280",marginBottom:"24px"},grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"24px",marginBottom:"24px"},card:{background:"#13131f",padding:"24px",borderRadius:"12px",border:"1px solid #2a2a3e"},cardHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"},cardLeft:{display:"flex",alignItems:"center",gap:"12px"},iconBox:e=>({width:"40px",height:"40px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",background:"".concat(e,"20")}),zoneName:{fontWeight:"bold",fontSize:"16px"},zoneTime:{fontSize:"14px",color:"#6b7280"},badge:e=>({padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"bold",background:e?"rgba(16, 185, 129, 0.2)":"rgba(107, 114, 128, 0.2)",color:e?"#10b981":"#6b7280"}),volatility:{display:"flex",alignItems:"center",gap:"8px",fontSize:"14px"},infoCard:{background:"#13131f",padding:"24px",borderRadius:"12px",border:"1px solid #2a2a3e"},infoHeader:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"},list:{listStyle:"none",padding:0,margin:0},listItem:{display:"flex",alignItems:"flex-start",gap:"8px",marginBottom:"12px",color:"#9ca3af"},bullet:{color:"#00d4ff"}};function c(){return(0,i.jsx)(l.Z,{children:(0,i.jsxs)("div",{style:a.container,children:[(0,i.jsx)("h1",{style:a.title,children:"Kill Zones"}),(0,i.jsx)("p",{style:a.subtitle,children:"High-probability trading sessions"}),(0,i.jsx)("div",{style:a.grid,children:[{name:"Asian",time:"00:00 - 08:00 UTC",status:"Closed",color:"#6b7280",volatility:"Low"},{name:"London",time:"08:00 - 16:00 UTC",status:"Closed",color:"#3b82f6",volatility:"Medium"},{name:"New York",time:"13:00 - 21:00 UTC",status:"Active",color:"#10b981",volatility:"High"},{name:"London Close",time:"14:00 - 16:00 UTC",status:"Closed",color:"#a855f7",volatility:"High"}].map(e=>{let t="Active"===e.status;return(0,i.jsxs)("div",{style:a.card,children:[(0,i.jsxs)("div",{style:a.cardHeader,children:[(0,i.jsxs)("div",{style:a.cardLeft,children:[(0,i.jsx)("div",{style:a.iconBox(e.color),children:(0,i.jsx)(r.Z,{color:e.color,size:20})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{style:a.zoneName,children:e.name}),(0,i.jsx)("p",{style:a.zoneTime,children:e.time})]})]}),(0,i.jsx)("span",{style:a.badge(t),children:e.status})]}),(0,i.jsxs)("div",{style:a.volatility,children:[(0,i.jsx)(o.Z,{size:14,color:"#6b7280"}),(0,i.jsx)("span",{style:{color:"#6b7280"},children:"Volatility:"}),(0,i.jsx)("span",{style:{fontWeight:"bold",color:e.color},children:e.volatility})]})]},e.name)})}),(0,i.jsxs)("div",{style:a.infoCard,children:[(0,i.jsxs)("div",{style:a.infoHeader,children:[(0,i.jsx)(s.Z,{color:"#00d4ff"}),(0,i.jsx)("span",{style:{fontWeight:"bold"},children:"Kill Zone Strategy"})]}),(0,i.jsxs)("ul",{style:a.list,children:[(0,i.jsxs)("li",{style:a.listItem,children:[(0,i.jsx)("span",{style:a.bullet,children:"•"}),(0,i.jsx)("span",{children:"Trade only during high volatility sessions (London, NY, London Close)"})]}),(0,i.jsxs)("li",{style:a.listItem,children:[(0,i.jsx)("span",{style:a.bullet,children:"•"}),(0,i.jsx)("span",{children:"Look for breakouts during session opens"})]}),(0,i.jsxs)("li",{style:a.listItem,children:[(0,i.jsx)("span",{style:a.bullet,children:"•"}),(0,i.jsx)("span",{children:"Avoid trading during Asian session unless scalping"})]}),(0,i.jsxs)("li",{style:a.listItem,children:[(0,i.jsx)("span",{style:a.bullet,children:"•"}),(0,i.jsx)("span",{children:"Best setups: London-NY overlap (13:00-16:00 UTC)"})]})]})]})]})})}},1441:function(e,t,n){"use strict";n.d(t,{Z:function(){return C}});var i=n(3827),l=n(8792),r=n(7907),o=n(4090),s=n(5423),a=n(7404),c=n(5032),d=n(8670),x=n(2071),p=n(6490),f=n(6227),h=n(6382),u=n(6185),y=n(9910),g=n(1165),b=n(7898),m=n(1472),k=n(7366),v=n(1213);let Z=[{href:"/dashboard",label:"Dashboard",icon:s.Z},{href:"/smc-analysis",label:"SMC Real-Time",icon:a.Z},{href:"/signals",label:"Signals",icon:c.Z},{href:"/screener",label:"Screener",icon:d.Z},{href:"/analysis",label:"Analysis",icon:x.Z},{href:"/killzones",label:"Kill Zones",icon:p.Z},{href:"/fibzones",label:"Fib Zones",icon:f.Z},{href:"/backtest",label:"Backtest",icon:h.Z},{href:"/stats",label:"Statistics",icon:u.Z},{href:"/strategy",label:"Strategy",icon:y.Z},{href:"/sniper",label:"Sniper",icon:g.Z},{href:"/footprint",label:"Footprint",icon:b.Z},{href:"/ml",label:"ML Model",icon:m.Z},{href:"/tradingview",label:"TradingView",icon:b.Z},{href:"/telegram",label:"Telegram",icon:k.Z},{href:"/profile",label:"Profile",icon:v.Z}],j=()=>{let e=new Date(new Date().getTime()+108e5).getUTCHours();return e>=20||e<8?{name:"Asian",color:"#f59e0b",bgColor:"rgba(245, 158, 11, 0.1)"}:e>=8&&e<16?{name:"London",color:"#3b82f6",bgColor:"rgba(59, 130, 246, 0.1)"}:e>=13&&e<21?{name:"New York",color:"#10b981",bgColor:"rgba(16, 185, 129, 0.1)"}:{name:"Asian",color:"#f59e0b",bgColor:"rgba(245, 158, 11, 0.1)"}},z={container:{display:"flex",minHeight:"100vh",background:"#0a0a0f"},sidebar:{width:"240px",background:"#13131f",borderRight:"1px solid #1c1c2e",display:"flex",flexDirection:"column",position:"fixed",height:"100vh",overflowY:"auto",zIndex:50},logo:{padding:"20px",borderBottom:"1px solid #1c1c2e"},logoLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},logoIcon:{width:"36px",height:"36px",borderRadius:"8px",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"},logoText:{fontWeight:"bold",fontSize:"18px",color:"#fff"},killzone:{padding:"16px",borderBottom:"1px solid #1c1c2e"},killzoneLabel:{fontSize:"12px",color:"#6b7280",marginBottom:"8px"},killzoneBadge:(e,t)=>({padding:"10px 12px",background:t,borderRadius:"8px",border:"1px solid ".concat(e),display:"flex",alignItems:"center",gap:"8px"}),killzoneDot:e=>({width:"8px",height:"8px",borderRadius:"50%",background:e}),killzoneText:e=>({color:e,fontWeight:"bold",fontSize:"14px"}),killzoneSub:{fontSize:"11px",color:"#6b7280",marginTop:"8px"},nav:{flex:1,padding:"12px"},navItem:e=>({display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",marginBottom:"4px",borderRadius:"8px",textDecoration:"none",fontSize:"14px",fontWeight:e?"600":"400",color:e?"#00d4ff":"#9ca3af",background:e?"rgba(0, 212, 255, 0.1)":"transparent",transition:"all 0.2s"}),activeIndicator:{marginLeft:"auto",width:"6px",height:"6px",borderRadius:"50%",background:"#00d4ff"},user:{padding:"16px",borderTop:"1px solid #1c1c2e"},userLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},userAvatar:{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px",color:"#fff"},userName:{fontSize:"14px",fontWeight:"bold",color:"#fff"},userStatus:{fontSize:"12px",color:"#6b7280"},main:{flex:1,marginLeft:"240px",minHeight:"100vh"}};function C(e){let{children:t}=e,n=(0,r.usePathname)(),[s,c]=(0,o.useState)(j());return(0,o.useEffect)(()=>{let e=setInterval(()=>{c(j())},6e4);return()=>clearInterval(e)},[]),(0,i.jsxs)("div",{style:z.container,children:[(0,i.jsxs)("aside",{style:z.sidebar,children:[(0,i.jsx)("div",{style:z.logo,children:(0,i.jsxs)(l.default,{href:"/dashboard",style:z.logoLink,children:[(0,i.jsx)("div",{style:z.logoIcon,children:(0,i.jsx)(a.Z,{size:20,color:"#fff"})}),(0,i.jsx)("span",{style:z.logoText,children:"CryptoTraderAI"})]})}),(0,i.jsxs)("div",{style:z.killzone,children:[(0,i.jsx)("p",{style:z.killzoneLabel,children:"Active Kill Zone"}),(0,i.jsxs)("div",{style:z.killzoneBadge(s.color,s.bgColor),children:[(0,i.jsx)("span",{style:z.killzoneDot(s.color)}),(0,i.jsx)("span",{style:z.killzoneText(s.color),children:s.name.toUpperCase()})]}),(0,i.jsx)("p",{style:z.killzoneSub,children:"High volatility expected"})]}),(0,i.jsx)("nav",{style:z.nav,children:Z.map(e=>{let t=n===e.href||(null==n?void 0:n.startsWith(e.href+"/")),r=e.icon;return(0,i.jsxs)(l.default,{href:e.href,style:z.navItem(t),children:[(0,i.jsx)(r,{size:18}),(0,i.jsx)("span",{children:e.label}),t&&(0,i.jsx)("span",{style:z.activeIndicator})]},e.href)})}),(0,i.jsx)("div",{style:z.user,children:(0,i.jsxs)(l.default,{href:"/profile",style:z.userLink,children:[(0,i.jsx)("div",{style:z.userAvatar,children:"U"}),(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{style:z.userName,children:"User"}),(0,i.jsx)("p",{style:z.userStatus,children:"Connected"})]})]})})]}),(0,i.jsx)("main",{style:z.main,children:t})]})}},5032:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]])},8998:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},2071:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},1472:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Brain",[["path",{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z",key:"1mhkh5"}],["path",{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z",key:"1d6s00"}]])},6490:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},1165:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Crosshair",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"22",x2:"18",y1:"12",y2:"12",key:"l9bcsi"}],["line",{x1:"6",x2:"2",y1:"12",y2:"12",key:"13hhkx"}],["line",{x1:"12",x2:"12",y1:"6",y2:"2",key:"10w3f3"}],["line",{x1:"12",x2:"12",y1:"22",y2:"18",key:"15g9kq"}]])},7898:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]])},5423:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},6382:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("LineChart",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"m19 9-5 5-4-4-3 3",key:"2osh9i"}]])},7366:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]])},6185:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("PieChart",[["path",{d:"M21.21 15.89A10 10 0 1 1 8 2.83",key:"k2fpak"}],["path",{d:"M22 12A10 10 0 0 0 12 2v10z",key:"1rfc4y"}]])},8670:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},9910:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},6227:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]])},9733:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]])},1213:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},7404:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]])},7907:function(e,t,n){"use strict";var i=n(5313);n.o(i,"usePathname")&&n.d(t,{usePathname:function(){return i.usePathname}})}},function(e){e.O(0,[807,971,69,744],function(){return e(e.s=2938)}),_N_E=e.O()}]);