(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[93],{2938:function(e,t,s){Promise.resolve().then(s.bind(s,8871))},8871:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return o}});var n=s(3827),i=s(4922),l=s(6490),r=s(9733),a=s(8998);function o(){return(0,n.jsx)(i.Z,{children:(0,n.jsxs)("div",{className:"p-6",children:[(0,n.jsxs)("div",{className:"mb-6",children:[(0,n.jsx)("h1",{className:"text-2xl font-bold",children:"Kill Zones"}),(0,n.jsx)("p",{className:"text-gray-500 mt-1",children:"High-probability trading sessions"})]}),(0,n.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",children:[{name:"Asian",time:"00:00 - 08:00 UTC",status:"Closed",color:"#6b7280",volatility:"Low"},{name:"London",time:"08:00 - 16:00 UTC",status:"Closed",color:"#3b82f6",volatility:"Medium"},{name:"New York",time:"13:00 - 21:00 UTC",status:"Active",color:"#10b981",volatility:"High"},{name:"London Close",time:"14:00 - 16:00 UTC",status:"Closed",color:"#a855f7",volatility:"High"}].map(e=>(0,n.jsxs)("div",{className:"bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e]",children:[(0,n.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[(0,n.jsxs)("div",{className:"flex items-center gap-3",children:[(0,n.jsx)("div",{className:"w-10 h-10 rounded-xl flex items-center justify-center",style:{background:"".concat(e.color,"20")},children:(0,n.jsx)(l.Z,{style:{color:e.color}})}),(0,n.jsxs)("div",{children:[(0,n.jsx)("h2",{className:"font-bold",children:e.name}),(0,n.jsx)("p",{className:"text-sm text-gray-500",children:e.time})]})]}),(0,n.jsx)("span",{className:"px-3 py-1 rounded-full text-sm font-bold ".concat("Active"===e.status?"bg-green-500/20 text-green-500":"bg-gray-500/20 text-gray-500"),children:e.status})]}),(0,n.jsxs)("div",{className:"flex items-center gap-2 text-sm",children:[(0,n.jsx)(r.Z,{size:14,className:"text-gray-500"}),(0,n.jsx)("span",{className:"text-gray-500",children:"Volatility:"}),(0,n.jsx)("span",{className:"font-bold",style:{color:e.color},children:e.volatility})]})]},e.name))}),(0,n.jsxs)("div",{className:"bg-[#13131f] p-6 rounded-xl border border-[#2a2a3e]",children:[(0,n.jsxs)("div",{className:"flex items-center gap-3 mb-4",children:[(0,n.jsx)(a.Z,{className:"text-[#00d4ff]"}),(0,n.jsx)("h2",{className:"font-bold",children:"Kill Zone Strategy"})]}),(0,n.jsxs)("ul",{className:"space-y-3 text-gray-400",children:[(0,n.jsxs)("li",{className:"flex items-start gap-2",children:[(0,n.jsx)("span",{className:"text-[#00d4ff]",children:"•"}),(0,n.jsx)("span",{children:"Trade only during high volatility sessions (London, NY, London Close)"})]}),(0,n.jsxs)("li",{className:"flex items-start gap-2",children:[(0,n.jsx)("span",{className:"text-[#00d4ff]",children:"•"}),(0,n.jsx)("span",{children:"Look for breakouts during session opens"})]}),(0,n.jsxs)("li",{className:"flex items-start gap-2",children:[(0,n.jsx)("span",{className:"text-[#00d4ff]",children:"•"}),(0,n.jsx)("span",{children:"Avoid trading during Asian session unless scalping"})]}),(0,n.jsxs)("li",{className:"flex items-start gap-2",children:[(0,n.jsx)("span",{className:"text-[#00d4ff]",children:"•"}),(0,n.jsx)("span",{children:"Best setups: London-NY overlap (13:00-16:00 UTC)"})]})]})]})]})})}},4922:function(e,t,s){"use strict";s.d(t,{Z:function(){return k}});var n=s(3827),i=s(8792),l=s(5313);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(7461).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);var a=s(5032),o=s(8670),c=s(2071),d=s(6490),x=s(6227),h=s(6382),f=s(1472),p=s(7898),u=s(7366),y=s(1213),g=s(7404);let m=[{href:"/dashboard",label:"Dashboard",icon:r},{href:"/signals",label:"Signals",icon:a.Z},{href:"/screener",label:"Screener",icon:o.Z},{href:"/analysis",label:"Analysis",icon:c.Z},{href:"/killzones",label:"Kill Zones",icon:d.Z},{href:"/fibzones",label:"Fib Zones",icon:x.Z},{href:"/backtest",label:"Backtest",icon:h.Z},{href:"/ml",label:"ML Model",icon:f.Z},{href:"/tradingview",label:"TradingView",icon:p.Z},{href:"/telegram",label:"Telegram",icon:u.Z},{href:"/profile",label:"Profile",icon:y.Z}],b={container:{display:"flex",minHeight:"100vh",background:"#0a0a0f"},sidebar:{width:"240px",background:"#13131f",borderRight:"1px solid #1c1c2e",display:"flex",flexDirection:"column",position:"fixed",height:"100vh",overflowY:"auto",zIndex:50},logo:{padding:"20px",borderBottom:"1px solid #1c1c2e"},logoLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},logoIcon:{width:"36px",height:"36px",borderRadius:"8px",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"},logoText:{fontWeight:"bold",fontSize:"18px",color:"#fff"},killzone:{padding:"16px",borderBottom:"1px solid #1c1c2e"},killzoneLabel:{fontSize:"12px",color:"#6b7280",marginBottom:"8px"},killzoneBadge:{padding:"10px 12px",background:"rgba(16, 185, 129, 0.1)",borderRadius:"8px",border:"1px solid #10b981",display:"flex",alignItems:"center",gap:"8px"},killzoneDot:{width:"8px",height:"8px",borderRadius:"50%",background:"#10b981"},killzoneText:{color:"#10b981",fontWeight:"bold",fontSize:"14px"},killzoneSub:{fontSize:"11px",color:"#6b7280",marginTop:"8px"},nav:{flex:1,padding:"12px"},navItem:e=>({display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",marginBottom:"4px",borderRadius:"8px",textDecoration:"none",fontSize:"14px",fontWeight:e?"600":"400",color:e?"#00d4ff":"#9ca3af",background:e?"rgba(0, 212, 255, 0.1)":"transparent",transition:"all 0.2s"}),activeIndicator:{marginLeft:"auto",width:"6px",height:"6px",borderRadius:"50%",background:"#00d4ff"},user:{padding:"16px",borderTop:"1px solid #1c1c2e"},userLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},userAvatar:{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px",color:"#fff"},userName:{fontSize:"14px",fontWeight:"bold",color:"#fff"},userStatus:{fontSize:"12px",color:"#6b7280"},main:{flex:1,marginLeft:"240px",minHeight:"100vh"}};function k(e){let{children:t}=e,s=(0,l.usePathname)();return(0,n.jsxs)("div",{style:b.container,children:[(0,n.jsxs)("aside",{style:b.sidebar,children:[(0,n.jsx)("div",{style:b.logo,children:(0,n.jsxs)(i.default,{href:"/dashboard",style:b.logoLink,children:[(0,n.jsx)("div",{style:b.logoIcon,children:(0,n.jsx)(g.Z,{size:20,color:"#fff"})}),(0,n.jsx)("span",{style:b.logoText,children:"CryptoTraderAI"})]})}),(0,n.jsxs)("div",{style:b.killzone,children:[(0,n.jsx)("p",{style:b.killzoneLabel,children:"Active Kill Zone"}),(0,n.jsxs)("div",{style:b.killzoneBadge,children:[(0,n.jsx)("span",{style:b.killzoneDot}),(0,n.jsx)("span",{style:b.killzoneText,children:"NEW YORK"})]}),(0,n.jsx)("p",{style:b.killzoneSub,children:"High volatility expected"})]}),(0,n.jsx)("nav",{style:b.nav,children:m.map(e=>{let t=s===e.href||(null==s?void 0:s.startsWith(e.href+"/")),l=e.icon;return(0,n.jsxs)(i.default,{href:e.href,style:b.navItem(t),children:[(0,n.jsx)(l,{size:18}),(0,n.jsx)("span",{children:e.label}),t&&(0,n.jsx)("span",{style:b.activeIndicator})]},e.href)})}),(0,n.jsx)("div",{style:b.user,children:(0,n.jsxs)(i.default,{href:"/profile",style:b.userLink,children:[(0,n.jsx)("div",{style:b.userAvatar,children:"U"}),(0,n.jsxs)("div",{children:[(0,n.jsx)("p",{style:b.userName,children:"User"}),(0,n.jsx)("p",{style:b.userStatus,children:"Connected"})]})]})})]}),(0,n.jsx)("main",{style:b.main,children:t})]})}},5032:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]])},8998:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},2071:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},1472:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("Brain",[["path",{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z",key:"1mhkh5"}],["path",{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z",key:"1d6s00"}]])},6490:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},7898:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]])},6382:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("LineChart",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"m19 9-5 5-4-4-3 3",key:"2osh9i"}]])},7366:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]])},8670:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},6227:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]])},9733:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]])},1213:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},7404:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s(7461).Z)("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]])}},function(e){e.O(0,[807,971,69,744],function(){return e(e.s=2938)}),_N_E=e.O()}]);