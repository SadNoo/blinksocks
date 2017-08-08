'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _ip=require('ip');var _ip2=_interopRequireDefault(_ip);var _defs=require('./defs');var _proxies=require('../proxies');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}class ProxyPreset extends _defs.IPreset{constructor(...args){var _temp;return _temp=super(...args),this._proxy=null,_temp}beforeIn({buffer,direct,broadcast}){if(this._proxy===null){this._proxy=new _proxies.Proxifier({onHandshakeDone:(addr,callback)=>{var _ref=[addr.type===_proxies.ATYP_DOMAIN?addr.host.toString():_ip2.default.toString(addr.host),addr.port.readUInt16BE(0)];const host=_ref[0],port=_ref[1];broadcast({type:_defs.SOCKET_CONNECT_TO_DST,payload:{targetAddress:{host,port},onConnected:()=>callback(direct)}})}})}if(!this._proxy.isDone()){this._proxy.makeHandshake(buf=>direct(buf,true),buffer)}else{return buffer}}}exports.default=ProxyPreset;