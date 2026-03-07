(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[93],{2938:function(e,t,i){Promise.resolve().then(i.bind(i,8871))},8871:function(e,t,i){"use strict";i.r(t),i.d(t,{default:function(){return d}});var n=i(3827),l=i(4922),r=i(6490),s=i(9733),o=i(8998);let a={container:{padding:"24px"},title:{margin:0,fontSize:"28px",fontWeight:"bold"},subtitle:{margin:"8px 0 0 0",color:"#6b7280",marginBottom:"24px"},grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"24px",marginBottom:"24px"},card:{background:"#13131f",padding:"24px",borderRadius:"12px",border:"1px solid #2a2a3e"},cardHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"},cardLeft:{display:"flex",alignItems:"center",gap:"12px"},iconBox:e=>({width:"40px",height:"40px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",background:"".concat(e,"20")}),zoneName:{fontWeight:"bold",fontSize:"16px"},zoneTime:{fontSize:"14px",color:"#6b7280"},badge:e=>({padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"bold",background:e?"rgba(16, 185, 129, 0.2)":"rgba(107, 114, 128, 0.2)",color:e?"#10b981":"#6b7280"}),volatility:{display:"flex",alignItems:"center",gap:"8px",fontSize:"14px"},infoCard:{background:"#13131f",padding:"24px",borderRadius:"12px",border:"1px solid #2a2a3e"},infoHeader:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"},list:{listStyle:"none",padding:0,margin:0},listItem:{display:"flex",alignItems:"flex-start",gap:"8px",marginBottom:"12px",color:"#9ca3af"},bullet:{color:"#00d4ff"}};function d(){return(0,n.jsx)(l.Z,{children:(0,n.jsxs)("div",{style:a.container,children:[(0,n.jsx)("h1",{style:a.title,children:"Kill Zones"}),(0,n.jsx)("p",{style:a.subtitle,children:"High-probability trading sessions"}),(0,n.jsx)("div",{style:a.grid,children:[{name:"Asian",time:"00:00 - 08:00 UTC",status:"Closed",color:"#6b7280",volatility:"Low"},{name:"London",time:"08:00 - 16:00 UTC",status:"Closed",color:"#3b82f6",volatility:"Medium"},{name:"New York",time:"13:00 - 21:00 UTC",status:"Active",color:"#10b981",volatility:"High"},{name:"London Close",time:"14:00 - 16:00 UTC",status:"Closed",color:"#a855f7",volatility:"High"}].map(e=>{let t="Active"===e.status;return(0,n.jsxs)("div",{style:a.card,children:[(0,n.jsxs)("div",{style:a.cardHeader,children:[(0,n.jsxs)("div",{style:a.cardLeft,children:[(0,n.jsx)("div",{style:a.iconBox(e.color),children:(0,n.jsx)(r.Z,{color:e.color,size:20})}),(0,n.jsxs)("div",{children:[(0,n.jsx)("p",{style:a.zoneName,children:e.name}),(0,n.jsx)("p",{style:a.zoneTime,children:e.time})]})]}),(0,n.jsx)("span",{style:a.badge(t),children:e.status})]}),(0,n.jsxs)("div",{style:a.volatility,children:[(0,n.jsx)(s.Z,{size:14,color:"#6b7280"}),(0,n.jsx)("span",{style:{color:"#6b7280"},children:"Volatility:"}),(0,n.jsx)("span",{style:{fontWeight:"bold",color:e.color},children:e.volatility})]})]},e.name)})}),(0,n.jsxs)("div",{style:a.infoCard,children:[(0,n.jsxs)("div",{style:a.infoHeader,children:[(0,n.jsx)(o.Z,{color:"#00d4ff"}),(0,n.jsx)("span",{style:{fontWeight:"bold"},children:"Kill Zone Strategy"})]}),(0,n.jsxs)("ul",{style:a.list,children:[(0,n.jsxs)("li",{style:a.listItem,children:[(0,n.jsx)("span",{style:a.bullet,children:"•"}),(0,n.jsx)("span",{children:"Trade only during high volatility sessions (London, NY, London Close)"})]}),(0,n.jsxs)("li",{style:a.listItem,children:[(0,n.jsx)("span",{style:a.bullet,children:"•"}),(0,n.jsx)("span",{children:"Look for breakouts during session opens"})]}),(0,n.jsxs)("li",{style:a.listItem,children:[(0,n.jsx)("span",{style:a.bullet,children:"•"}),(0,n.jsx)("span",{children:"Avoid trading during Asian session unless scalping"})]}),(0,n.jsxs)("li",{style:a.listItem,children:[(0,n.jsx)("span",{style:a.bullet,children:"•"}),(0,n.jsx)("span",{children:"Best setups: London-NY overlap (13:00-16:00 UTC)"})]})]})]})]})})}},4922:function(e,t,i){"use strict";i.d(t,{Z:function(){return k}});var n=i(3827),l=i(8792),r=i(5313);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,i(7461).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);var o=i(5032),a=i(8670),d=i(2071),c=i(6490),x=i(6227),p=i(6382),h=i(1472),f=i(7898),u=i(7366),y=i(1213),g=i(7404);let b=[{href:"/dashboard",label:"Dashboard",icon:s},{href:"/signals",label:"Signals",icon:o.Z},{href:"/screener",label:"Screener",icon:a.Z},{href:"/analysis",label:"Analysis",icon:d.Z},{href:"/killzones",label:"Kill Zones",icon:c.Z},{href:"/fibzones",label:"Fib Zones",icon:x.Z},{href:"/backtest",label:"Backtest",icon:p.Z},{href:"/ml",label:"ML Model",icon:h.Z},{href:"/tradingview",label:"TradingView",icon:f.Z},{href:"/telegram",label:"Telegram",icon:u.Z},{href:"/profile",label:"Profile",icon:y.Z}],m={container:{display:"flex",minHeight:"100vh",background:"#0a0a0f"},sidebar:{width:"240px",background:"#13131f",borderRight:"1px solid #1c1c2e",display:"flex",flexDirection:"column",position:"fixed",height:"100vh",overflowY:"auto",zIndex:50},logo:{padding:"20px",borderBottom:"1px solid #1c1c2e"},logoLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},logoIcon:{width:"36px",height:"36px",borderRadius:"8px",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"},logoText:{fontWeight:"bold",fontSize:"18px",color:"#fff"},killzone:{padding:"16px",borderBottom:"1px solid #1c1c2e"},killzoneLabel:{fontSize:"12px",color:"#6b7280",marginBottom:"8px"},killzoneBadge:{padding:"10px 12px",background:"rgba(16, 185, 129, 0.1)",borderRadius:"8px",border:"1px solid #10b981",display:"flex",alignItems:"center",gap:"8px"},killzoneDot:{width:"8px",height:"8px",borderRadius:"50%",background:"#10b981"},killzoneText:{color:"#10b981",fontWeight:"bold",fontSize:"14px"},killzoneSub:{fontSize:"11px",color:"#6b7280",marginTop:"8px"},nav:{flex:1,padding:"12px"},navItem:e=>({display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",marginBottom:"4px",borderRadius:"8px",textDecoration:"none",fontSize:"14px",fontWeight:e?"600":"400",color:e?"#00d4ff":"#9ca3af",background:e?"rgba(0, 212, 255, 0.1)":"transparent",transition:"all 0.2s"}),activeIndicator:{marginLeft:"auto",width:"6px",height:"6px",borderRadius:"50%",background:"#00d4ff"},user:{padding:"16px",borderTop:"1px solid #1c1c2e"},userLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},userAvatar:{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px",color:"#fff"},userName:{fontSize:"14px",fontWeight:"bold",color:"#fff"},userStatus:{fontSize:"12px",color:"#6b7280"},main:{flex:1,marginLeft:"240px",minHeight:"100vh"}};function k(e){let{children:t}=e,i=(0,r.usePathname)();return(0,n.jsxs)("div",{style:m.container,children:[(0,n.jsxs)("aside",{style:m.sidebar,children:[(0,n.jsx)("div",{style:m.logo,children:(0,n.jsxs)(l.default,{href:"/dashboard",style:m.logoLink,children:[(0,n.jsx)("div",{style:m.logoIcon,children:(0,n.jsx)(g.Z,{size:20,color:"#fff"})}),(0,n.jsx)("span",{style:m.logoText,children:"CryptoTraderAI"})]})}),(0,n.jsxs)("div",{style:m.killzone,children:[(0,n.jsx)("p",{style:m.killzoneLabel,children:"Active Kill Zone"}),(0,n.jsxs)("div",{style:m.killzoneBadge,children:[(0,n.jsx)("span",{style:m.killzoneDot}),(0,n.jsx)("span",{style:m.killzoneText,children:"NEW YORK"})]}),(0,n.jsx)("p",{style:m.killzoneSub,children:"High volatility expected"})]}),(0,n.jsx)("nav",{style:m.nav,children:b.map(e=>{let t=i===e.href||(null==i?void 0:i.startsWith(e.href+"/")),r=e.icon;return(0,n.jsxs)(l.default,{href:e.href,style:m.navItem(t),children:[(0,n.jsx)(r,{size:18}),(0,n.jsx)("span",{children:e.label}),t&&(0,n.jsx)("span",{style:m.activeIndicator})]},e.href)})}),(0,n.jsx)("div",{style:m.user,children:(0,n.jsxs)(l.default,{href:"/profile",style:m.userLink,children:[(0,n.jsx)("div",{style:m.userAvatar,children:"U"}),(0,n.jsxs)("div",{children:[(0,n.jsx)("p",{style:m.userName,children:"User"}),(0,n.jsx)("p",{style:m.userStatus,children:"Connected"})]})]})})]}),(0,n.jsx)("main",{style:m.main,children:t})]})}},5032:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]])},8998:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},2071:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},1472:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("Brain",[["path",{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z",key:"1mhkh5"}],["path",{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z",key:"1d6s00"}]])},6490:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},7898:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]])},6382:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("LineChart",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"m19 9-5 5-4-4-3 3",key:"2osh9i"}]])},7366:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]])},8670:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},6227:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]])},9733:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]])},1213:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},7404:function(e,t,i){"use strict";i.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,i(7461).Z)("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]])}},function(e){e.O(0,[807,971,69,744],function(){return e(e.s=2938)}),_N_E=e.O()}]);