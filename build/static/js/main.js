(this.webpackJsonporderbook=this.webpackJsonporderbook||[]).push([[0],{11:function(e,t,a){e.exports=a(19)},16:function(e,t,a){},19:function(e,t,a){"use strict";a.r(t),a.d(t,"useWebSocket",(function(){return b})),a.d(t,"connectStatusName",(function(){return m})),a.d(t,"useDeribitConnect",(function(){return x})),a.d(t,"useBitmexConnect",(function(){return g})),a.d(t,"useBinanceConnect",(function(){return y}));var n,r=a(0),c=a.n(r),i=a(9),o=a.n(i),s=(a(16),a(5)),l=a(2),u=a(1),d=a(6),f=(n={},Object(d.a)(n,WebSocket.CONNECTING,"Connecting"),Object(d.a)(n,WebSocket.OPEN,"Open"),Object(d.a)(n,WebSocket.CLOSING,"Closing"),Object(d.a)(n,WebSocket.CLOSED,"Closed"),n),m=function(e){return-1===e?"Uninitiated":f[e]};function b(e,t){var a=c.a.useRef(null),n=c.a.useRef([]),r=c.a.useState(null),i=Object(u.a)(r,2),o=i[0],s=i[1],l=c.a.useState(-1),d=Object(u.a)(l,2),f=d[0],m=d[1],b=c.a.useCallback((function(e){a.current&&a.current.readyState===WebSocket.OPEN?"string"!==typeof e?a.current.send(JSON.stringify(e)):a.current.send(e):n.current.push(e)}),[]),p=c.a.useCallback((function(){var r=new WebSocket(e);return m(WebSocket.CONNECTING),r.onopen=function(e){m(WebSocket.OPEN),(null===t||void 0===t?void 0:t.onOpen)&&t.onOpen(e)},r.onclose=function(e){m(WebSocket.CLOSED),a.current=null,n.current=[],(null===t||void 0===t?void 0:t.onClose)&&t.onClose(e),a.current=p()},r.onerror=function(e){m(WebSocket.CLOSED),(null===t||void 0===t?void 0:t.onError)&&t.onError(e)},r.onmessage=function(e){var t=JSON.parse(e.data);s(t)},r}),[e,t]);return c.a.useEffect((function(){null==a.current||a.current.readyState===WebSocket.CLOSED?a.current=p():a.current.readyState===WebSocket.OPEN&&n.current.splice(0).forEach(b)}),[a,p,b]),{readyState:f,lastMessage:o,sendMessage:b}}var p,S=a(10),v=a(7);!function(e){e.BIDS="bids",e.ASKS="asks"}(p||(p={}));var E=function(e){var t=e.orderbook,a=e.lastPrice,n=e.depth,r=e.step,i=e.isSkipEmpty,o=c.a.useState([]),s=Object(u.a)(o,2),d=s[0],f=s[1],m=c.a.useState([]),b=Object(u.a)(m,2),S=b[0],v=b[1],E=c.a.useState(null),h=Object(u.a)(E,2),O=h[0],x=h[1],g=r.toString().split(".")[1].length||0;return c.a.useEffect((function(){if(null!=t){var e=t.entries,a=t.asks,c=t.bids;if(0!==a.length&&0!==c.length){var o=[],s=[];if(i)o=a.slice(0,n),s=c.slice(0,n);else for(var l=a[0],u=c[0],d=0;d<n;d++)s.push(u-d*r),o.push(l+d*r);var m=0,b=0;v(o.map((function(t){var a=e.get(t),n=a?a.size:0;return m+=n,{side:p.ASKS,price:t,size:n,total:m}}))),f(s.map((function(t){var a=e.get(t),n=a?a.size:0;return b+=n,{side:p.BIDS,price:t,size:n,total:b}}))),x(Math.max(m,b))}}}),[t,n,i,r]),t&&a&&O?c.a.createElement("div",null,Object(l.a)(S).reverse().map((function(e,t){var a=e.price,n=e.size,r=e.total;return c.a.createElement(k,{key:"a-".concat(a,"-").concat(n),isTop:0===t,decimals:g,side:p.ASKS,price:a,size:n,total:r,maxTotal:O})})),c.a.createElement("div",{className:"flex py-1"},c.a.createElement("div",{className:"flex-1 text-right"},a.toFixed(g)),c.a.createElement("div",{className:"",style:{flex:"2 2 0%"}})),d.map((function(e,t){var a=e.price,n=e.size,r=e.total;return c.a.createElement(k,{key:"b-".concat(a,"-").concat(n),isTop:0===t,decimals:g,side:p.BIDS,price:a,size:n,total:r,maxTotal:O})}))):null},k=function(e){var t=e.price,a=e.size,n=e.total,r=e.side,i=e.decimals,o=e.isTop,s=e.maxTotal,l=r===p.ASKS?"text-red-500":"text-green-500",u=r===p.ASKS?"bg-red-600":"bg-green-700",d=Math.round(n/s*95);return c.a.createElement("div",{className:"font-mono flex text-xs flex border-gray-700 border-b ".concat(o?"border-t":""," border-dashed text-right")},c.a.createElement("div",{className:"w-16 ".concat(l)},t.toFixed(i)),c.a.createElement("div",{className:"flex-1 text-gray-600"},a.toLocaleString()),c.a.createElement("div",{className:"flex-1 relative"},c.a.createElement("div",{className:"z-10 absolute w-full",style:{top:0,right:0}},n.toLocaleString()),c.a.createElement("div",{className:"".concat(u," opacity-50 h-full"),style:{width:"".concat(d,"%"),float:"right"}})))};function h(e,t){var a,n=null!=e?e:{entries:new Map,asks:[],bids:[]},r=n.entries,c=n.asks,i=n.bids,o=Object(S.a)(t);try{for(o.s();!(a=o.n()).done;){var s=a.value,l=s.side,u=s.edit,d=u.price,f=u.size,m=u.id;if(0===f)if(r.delete(d),l===p.ASKS){var b=c.indexOf(d);-1!==b&&delete c[b]}else{var v=i.indexOf(d);-1!==v&&delete i[v]}else r.set(d,{side:l,price:d,size:f,total:0,id:m}),l===p.ASKS?-1===c.indexOf(d)&&(c=O(d,c,!0)):-1===i.indexOf(d)&&(i=O(d,i,!1))}}catch(E){o.e(E)}finally{o.f()}return{entries:r,asks:c.filter((function(e){return e})),bids:i.filter((function(e){return e}))}}function O(e,t,a){var n=Object(l.a)(t);return a?n.splice(Object(v.sortedIndex)(t,e),0,e):n.splice(Object(v.sortedIndexBy)(t,e,(function(e){return-e})),0,e),n}var x=function(){var e=c.a.useState(null),t=Object(u.a)(e,2),a=t[0],n=t[1],r=c.a.useState(null),i=Object(u.a)(r,2),o=i[0],s=i[1],d=b("wss://www.deribit.com/ws/api/v2",{onOpen:function(){S(JSON.stringify({jsonrpc:"2.0",id:3600,method:"public/subscribe",params:{channels:["book.BTC-PERPETUAL.raw","ticker.BTC-PERPETUAL.raw"]}}))},onClose:function(){n(null),s(null)}}),f=d.readyState,m=d.lastMessage,S=d.sendMessage;return c.a.useEffect((function(){var e;if(null===m||void 0===m||null===(e=m.params)||void 0===e?void 0:e.data)switch(m.params.channel){case"book.BTC-PERPETUAL.raw":var t=m.params.data,a=t.bids,r=t.asks,c=t.change_id,i=function(e){var t=Object(u.a)(e,3),a=t[1],n=t[2];return{id:c,price:a,size:n}};n((function(e){return h(e,[].concat(Object(l.a)(r.map((function(e){return{side:p.ASKS,edit:i(e)}}))),Object(l.a)(a.map((function(e){return{side:p.BIDS,edit:i(e)}})))))}));break;case"ticker.BTC-PERPETUAL.raw":s(m.params.data.last_price);break;default:console.log("deribit",m)}}),[m]),{readyState:f,orderbook:a,lastPrice:o}},g=function(){var e=c.a.useState(null),t=Object(u.a)(e,2),a=t[0],n=t[1],r=c.a.useState(null),i=Object(u.a)(r,2),o=i[0],s=i[1],l=c.a.useRef(new Map),d=b("wss://www.bitmex.com/realtime?subscribe=orderBookL2:XBTUSD,trade:XBTUSD",{onClose:function(){n(null),s(null),l.current=new Map}}),f=d.readyState,m=d.lastMessage;return c.a.useEffect((function(){if(m)switch(m.table){case"orderBookL2":if("partial"===m.action||"insert"===m.action){var e=m.data.map((function(e){var t=e.id,a=e.side,n=e.size,r=e.price;return l.current.set(t,r),{side:"Buy"===a?p.BIDS:p.ASKS,edit:{id:t,size:n,price:r}}}));n((function(t){return h("partial"===m.action?null:t,e)}))}else if("update"===m.action||"delete"===m.action){var t=m.data.map((function(e){var t=e.id,a=e.side,n=l.current.get(t)||0,r="update"===m.action?e.size:0;return{side:"Buy"===a?p.BIDS:p.ASKS,edit:{id:t,size:r,price:n}}}));n((function(e){return h(e,t)}))}break;case"trade":m.data.forEach((function(e){return s(e.price)}));break;default:console.log("bitmex",m)}}),[m]),{readyState:f,orderbook:a,lastPrice:o}},y=function(){var e=c.a.useState(null),t=Object(u.a)(e,2),a=t[0],n=t[1],r=c.a.useState(null),i=Object(u.a)(r,2),o=i[0],s=i[1],l=b("wss://stream.binance.com/ws",{onOpen:function(){m(JSON.stringify({method:"SUBSCRIBE",params:["btcusdt@depth","btcusdt@ticker"],id:1}))},onClose:function(){n(null),s(null)}}),d=l.readyState,f=l.lastMessage,m=l.sendMessage;return c.a.useEffect((function(){var e=new XMLHttpRequest;e.addEventListener("load",(function(e){var t=JSON.parse(e.currentTarget.response),a=t.lastUpdateId,r=t.bids,c=t.asks;n((function(){return h(null,N(c,r,a),.01)}))})),e.open("GET","https://www.binance.com/api/v1/depth?symbol=BTCUSDT&limit=1000"),e.send()}),[]),c.a.useEffect((function(){if(f)switch(f.e){case"depthUpdate":var e=f.u,t=f.a,a=f.b;n((function(n){return null==n?null:h(n,N(t,a,e),.01)}));break;case"24hrTicker":var r=parseFloat(f.c);s(r);break;default:console.log("binance",f)}}),[f]),{readyState:d,orderbook:a,lastPrice:o}},w=function(e){return function(t){var a=Object(u.a)(t,2),n=a[0],r=a[1],c=parseFloat(n)||0;return{id:e,price:c,size:Math.round(r*c)}}},N=function(e,t,a){return[].concat(Object(l.a)(e.map((function(e){return{side:p.ASKS,edit:w(a)(e)}}))),Object(l.a)(t.map((function(e){return{side:p.BIDS,edit:w(a)(e)}}))))};var C=function(e){var t=e.children;return c.a.createElement("div",{className:"h-full w-full border border-gray-700 rounded-sm flex flex-col"},t)},j=function(){var e=g(),t=e.readyState,a=e.orderbook,n=e.lastPrice,r=x(),i=r.readyState,o=r.orderbook,l=r.lastPrice,u=y(),d=u.readyState,f=u.orderbook,b=u.lastPrice;return c.a.createElement(s.a,{columns:3,rows:1,layout:{bitmex:{x:1,y:1,w:1,h:1},deribit:{x:2,y:1,w:1,h:1},binance:{x:3,y:1,w:1,h:1}},gap:"5pt"},c.a.createElement(s.a.Item,{id:"bitmex"},c.a.createElement(C,null,c.a.createElement("div",{className:"p-2 pt-1 flex-1 flex flex-col"},c.a.createElement("div",{className:"pb-1"},"BitMEX:"," ",c.a.createElement("span",{className:"font-semibold"},m(t))),a&&n&&c.a.createElement(E,{orderbook:a,lastPrice:n,depth:20,step:.5})))),c.a.createElement(s.a.Item,{id:"deribit"},c.a.createElement(C,null,c.a.createElement("div",{className:"p-2 pt-1 flex-1 flex flex-col"},c.a.createElement("div",{className:"pb-1"},"Deribit:"," ",c.a.createElement("span",{className:"font-semibold"},m(i))),o&&l&&c.a.createElement(E,{orderbook:o,lastPrice:l,depth:20,step:.5})))),c.a.createElement(s.a.Item,{id:"binance"},c.a.createElement(C,null,c.a.createElement("div",{className:"p-2 pt-1 flex-1 flex flex-col"},c.a.createElement("div",{className:"pb-1"},"Binance:"," ",c.a.createElement("span",{className:"font-semibold"},m(d))),f&&b&&c.a.createElement(E,{orderbook:f,lastPrice:b,depth:20,step:.01,isSkipEmpty:!0})))))},B=function(){return c.a.createElement("div",{className:"h-screen bg-gray-900 text-gray-200 p-1 flex flex-col"},c.a.createElement(j,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(c.a.createElement(c.a.StrictMode,null,c.a.createElement(B,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[11,1,2]]]);
//# sourceMappingURL=main.6590d921.chunk.js.map