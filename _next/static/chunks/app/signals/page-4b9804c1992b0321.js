(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[302],{5749:function(e,t,n){Promise.resolve().then(n.bind(n,4267))},4267:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return c}});var i=n(3827),r=n(4922),l=n(7211),s=n(3345),a=n(5032);function c(){return(0,i.jsx)(r.Z,{children:(0,i.jsxs)("div",{className:"p-6",children:[(0,i.jsxs)("div",{className:"flex justify-between items-center mb-6",children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("h1",{className:"text-2xl font-bold",children:"Trading Signals"}),(0,i.jsx)("p",{className:"text-gray-500 mt-1",children:"AI-generated buy/sell signals"})]}),(0,i.jsxs)("div",{className:"flex gap-3",children:[(0,i.jsxs)("button",{className:"px-4 py-2 bg-[#13131f] rounded-lg flex items-center gap-2 hover:bg-[#1c1c2e]",children:[(0,i.jsx)(l.Z,{size:16}),"Filter"]}),(0,i.jsxs)("button",{className:"px-4 py-2 bg-[#13131f] rounded-lg flex items-center gap-2 hover:bg-[#1c1c2e]",children:[(0,i.jsx)(s.Z,{size:16}),"Alerts"]})]})]}),(0,i.jsx)("div",{className:"grid grid-cols-1 gap-4",children:[{pair:"BTC/USDT",direction:"LONG",entry:71235,tp:74403,sl:69651,confidence:88,time:"2h ago"},{pair:"ETH/USDT",direction:"SHORT",entry:1989,tp:1836,sl:2036,confidence:92,time:"4h ago"},{pair:"SOL/USDT",direction:"LONG",entry:145.2,tp:158.5,sl:138.9,confidence:85,time:"6h ago"}].map((e,t)=>(0,i.jsxs)("div",{className:"bg-[#13131f] p-5 rounded-xl border border-[#2a2a3e] flex items-center justify-between",children:[(0,i.jsxs)("div",{className:"flex items-center gap-4",children:[(0,i.jsx)("div",{className:"w-12 h-12 rounded-xl flex items-center justify-center ".concat("LONG"===e.direction?"bg-green-500/20":"bg-red-500/20"),children:(0,i.jsx)(a.Z,{className:"LONG"===e.direction?"text-green-500":"text-red-500"})}),(0,i.jsxs)("div",{children:[(0,i.jsxs)("div",{className:"flex items-center gap-2",children:[(0,i.jsx)("span",{className:"font-bold text-lg",children:e.pair}),(0,i.jsx)("span",{className:"px-2 py-0.5 rounded text-xs font-bold ".concat("LONG"===e.direction?"bg-green-500/20 text-green-500":"bg-red-500/20 text-red-500"),children:e.direction})]}),(0,i.jsxs)("p",{className:"text-sm text-gray-500",children:["Entry: $",e.entry.toLocaleString()," \xb7 TP: $",e.tp.toLocaleString()," \xb7 SL: $",e.sl.toLocaleString()]})]})]}),(0,i.jsxs)("div",{className:"text-right",children:[(0,i.jsxs)("p",{className:"text-2xl font-bold",children:[e.confidence,"%"]}),(0,i.jsx)("p",{className:"text-sm text-gray-500",children:e.time})]})]},t))})]})})}},4922:function(e,t,n){"use strict";n.d(t,{Z:function(){return k}});var i=n(3827),r=n(8792),l=n(5313);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,n(7461).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);var a=n(5032),c=n(8670),o=n(2071),d=n(6490),x=n(6227),h=n(6382),f=n(1472),p=n(7898),u=n(7366),g=n(1213),y=n(7404);let b=[{href:"/dashboard",label:"Dashboard",icon:s},{href:"/signals",label:"Signals",icon:a.Z},{href:"/screener",label:"Screener",icon:c.Z},{href:"/analysis",label:"Analysis",icon:o.Z},{href:"/killzones",label:"Kill Zones",icon:d.Z},{href:"/fibzones",label:"Fib Zones",icon:x.Z},{href:"/backtest",label:"Backtest",icon:h.Z},{href:"/ml",label:"ML Model",icon:f.Z},{href:"/tradingview",label:"TradingView",icon:p.Z},{href:"/telegram",label:"Telegram",icon:u.Z},{href:"/profile",label:"Profile",icon:g.Z}],m={container:{display:"flex",minHeight:"100vh",background:"#0a0a0f"},sidebar:{width:"240px",background:"#13131f",borderRight:"1px solid #1c1c2e",display:"flex",flexDirection:"column",position:"fixed",height:"100vh",overflowY:"auto",zIndex:50},logo:{padding:"20px",borderBottom:"1px solid #1c1c2e"},logoLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},logoIcon:{width:"36px",height:"36px",borderRadius:"8px",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"},logoText:{fontWeight:"bold",fontSize:"18px",color:"#fff"},killzone:{padding:"16px",borderBottom:"1px solid #1c1c2e"},killzoneLabel:{fontSize:"12px",color:"#6b7280",marginBottom:"8px"},killzoneBadge:{padding:"10px 12px",background:"rgba(16, 185, 129, 0.1)",borderRadius:"8px",border:"1px solid #10b981",display:"flex",alignItems:"center",gap:"8px"},killzoneDot:{width:"8px",height:"8px",borderRadius:"50%",background:"#10b981"},killzoneText:{color:"#10b981",fontWeight:"bold",fontSize:"14px"},killzoneSub:{fontSize:"11px",color:"#6b7280",marginTop:"8px"},nav:{flex:1,padding:"12px"},navItem:e=>({display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",marginBottom:"4px",borderRadius:"8px",textDecoration:"none",fontSize:"14px",fontWeight:e?"600":"400",color:e?"#00d4ff":"#9ca3af",background:e?"rgba(0, 212, 255, 0.1)":"transparent",transition:"all 0.2s"}),activeIndicator:{marginLeft:"auto",width:"6px",height:"6px",borderRadius:"50%",background:"#00d4ff"},user:{padding:"16px",borderTop:"1px solid #1c1c2e"},userLink:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},userAvatar:{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg, #00d4ff, #7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px",color:"#fff"},userName:{fontSize:"14px",fontWeight:"bold",color:"#fff"},userStatus:{fontSize:"12px",color:"#6b7280"},main:{flex:1,marginLeft:"240px",minHeight:"100vh"}};function k(e){let{children:t}=e,n=(0,l.usePathname)();return(0,i.jsxs)("div",{style:m.container,children:[(0,i.jsxs)("aside",{style:m.sidebar,children:[(0,i.jsx)("div",{style:m.logo,children:(0,i.jsxs)(r.default,{href:"/dashboard",style:m.logoLink,children:[(0,i.jsx)("div",{style:m.logoIcon,children:(0,i.jsx)(y.Z,{size:20,color:"#fff"})}),(0,i.jsx)("span",{style:m.logoText,children:"CryptoTraderAI"})]})}),(0,i.jsxs)("div",{style:m.killzone,children:[(0,i.jsx)("p",{style:m.killzoneLabel,children:"Active Kill Zone"}),(0,i.jsxs)("div",{style:m.killzoneBadge,children:[(0,i.jsx)("span",{style:m.killzoneDot}),(0,i.jsx)("span",{style:m.killzoneText,children:"NEW YORK"})]}),(0,i.jsx)("p",{style:m.killzoneSub,children:"High volatility expected"})]}),(0,i.jsx)("nav",{style:m.nav,children:b.map(e=>{let t=n===e.href||(null==n?void 0:n.startsWith(e.href+"/")),l=e.icon;return(0,i.jsxs)(r.default,{href:e.href,style:m.navItem(t),children:[(0,i.jsx)(l,{size:18}),(0,i.jsx)("span",{children:e.label}),t&&(0,i.jsx)("span",{style:m.activeIndicator})]},e.href)})}),(0,i.jsx)("div",{style:m.user,children:(0,i.jsxs)(r.default,{href:"/profile",style:m.userLink,children:[(0,i.jsx)("div",{style:m.userAvatar,children:"U"}),(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{style:m.userName,children:"User"}),(0,i.jsx)("p",{style:m.userStatus,children:"Connected"})]})]})})]}),(0,i.jsx)("main",{style:m.main,children:t})]})}},5032:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]])},2071:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},3345:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]])},1472:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Brain",[["path",{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z",key:"1mhkh5"}],["path",{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z",key:"1d6s00"}]])},6490:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},7211:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Filter",[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]])},7898:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]])},6382:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("LineChart",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"m19 9-5 5-4-4-3 3",key:"2osh9i"}]])},7366:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]])},8670:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},6227:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]])},1213:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},7404:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n(7461).Z)("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]])}},function(e){e.O(0,[807,971,69,744],function(){return e(e.s=5749)}),_N_E=e.O()}]);