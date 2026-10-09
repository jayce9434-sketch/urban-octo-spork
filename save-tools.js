'use strict';
window.MelodicSaveTools={
 encodeSave(s){return btoa(unescape(encodeURIComponent(JSON.stringify(s))));},
 decodeSave(code){return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));}
};
