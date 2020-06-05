/**
 * skylark-domx-colorpicker - The skylark dom plugin for picking color 
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-colorpicker/
 * @license MIT
 */
!function(e,t){var o=t.define,require=t.require,a="function"==typeof o&&o.amd,s=!a&&"undefined"!=typeof exports;if(!a&&!o){var r={};o=t.define=function(e,t,o){"function"==typeof o?(r[e]={factory:o,deps:t.map(function(t){return function(e,t){if("."!==e[0])return e;var o=t.split("/"),a=e.split("/");o.pop();for(var s=0;s<a.length;s++)"."!=a[s]&&(".."==a[s]?o.pop():o.push(a[s]));return o.join("/")}(t,e)}),resolved:!1,exports:null},require(e)):r[e]={factory:null,resolved:!0,exports:o}},require=t.require=function(e){if(!r.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var module=r[e];if(!module.resolved){var o=[];module.deps.forEach(function(e){o.push(require(e))}),module.exports=module.factory.apply(t,o)||null,module.resolved=!0}return module.exports}}if(!o)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(e,require){e("skylark-domx-colorpicker/draggable",["skylark-langx/skylark","skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-eventer","skylark-domx-finder","skylark-domx-query"],function(e,t,o,a,s,r,l){return function(e,t,a,s){t=t||function(){},a=a||function(){},s=s||function(){};var r=document,i=!1,n={},c=0,p=0,d="ontouchstart"in window,f={};function u(e){e.stopPropagation&&e.stopPropagation(),e.preventDefault&&e.preventDefault(),e.returnValue=!1}function h(a){if(i){if(o.isIE&&r.documentMode<9&&!a.button)return g();var s=a.originalEvent&&a.originalEvent.touches&&a.originalEvent.touches[0],l=s&&s.pageX||a.pageX,f=s&&s.pageY||a.pageY,h=Math.max(0,Math.min(l-n.left,p)),v=Math.max(0,Math.min(f-n.top,c));d&&u(a),t.apply(e,[h,v,a])}}function g(){i&&(l(r).off(f),l(r.body).removeClass("sp-dragging"),setTimeout(function(){s.apply(e,arguments)},0)),i=!1}f.selectstart=u,f.dragstart=u,f["touchmove mousemove"]=h,f["touchend mouseup"]=g,l(e).on("touchstart mousedown",function(t){(t.which?3==t.which:2==t.button)||i||!1!==a.apply(e,arguments)&&(i=!0,c=l(e).height(),p=l(e).width(),n=l(e).offset(),l(r).on(f),l(r.body).addClass("sp-dragging"),h(t),u(t))})}}),e("skylark-domx-colorpicker/ColorPicker",["skylark-langx/skylark","skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-finder","skylark-domx-query","skylark-domx-eventer","skylark-domx-styler","skylark-domx-fx","skylark-domx-plugins","skylark-domx-popups","skylark-graphics-color","./draggable"],function(e,t,o,a,s,r,l,i,n,c,p,d,f){"use strict";var u=t.noop,h=[],g=["<div class='sp-replacer'>","<div class='sp-preview'><div class='sp-preview-inner'></div></div>","<div class='sp-dd'>&#9660;</div>","</div>"].join(""),v=function(){var e="";if(o.isIE)for(var t=1;t<=6;t++)e+="<div class='sp-"+t+"'></div>";return["<div class='sp-container sp-hidden'>","<div class='sp-palette-container'>","<div class='sp-palette sp-thumb sp-cf'></div>","<div class='sp-palette-button-container sp-cf'>","<button type='button' class='sp-palette-toggle'></button>","</div>","</div>","<div class='sp-picker-container'>","<div class='sp-top sp-cf'>","<div class='sp-fill'></div>","<div class='sp-top-inner'>","<div class='sp-color'>","<div class='sp-sat'>","<div class='sp-val'>","<div class='sp-dragger'></div>","</div>","</div>","</div>","<div class='sp-clear sp-clear-display'>","</div>","<div class='sp-hue'>","<div class='sp-slider'></div>",e,"</div>","</div>","<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>","</div>","<div class='sp-input-container sp-cf'>","<input class='sp-input' type='text' spellcheck='false'  />","</div>","<div class='sp-initial sp-thumb sp-cf'></div>","<div class='sp-button-container sp-cf'>","<a class='sp-cancel' href='#'></a>","<button type='button' class='sp-choose'></button>","</div>","</div>","</div>"].join("")}();function k(e,t,o,a){for(var s=[],l=0;l<e.length;l++){var i=e[l];if(i){var n=d.parse(i),c=n.toHsl().l<.5?"sp-thumb-el sp-thumb-dark":"sp-thumb-el sp-thumb-light";c+=d.equals(t,i)?" sp-thumb-active":"";var p=n.toString(a.preferredFormat||"rgb"),f="background-color:"+n.toRgbString();s.push('<span title="'+p+'" data-color="'+n.toRgbString()+'" class="'+c+'"><span class="sp-thumb-inner" style="'+f+';" /></span>')}else{s.push(r("<div />").append(r('<span data-color="" style="background-color:transparent;" class="sp-clear-display"></span>').attr("title",a.noColorSelectedText)).html())}}return"<div class='sp-cf "+o+"'>"+s.join("")+"</div>"}var m=c.Plugin.inherit({klassName:"ColorPicker",pluginName:"domx.colorPicker",options:{beforeShow:u,move:u,change:u,show:u,hide:u,color:!1,flat:!1,showInput:!1,allowEmpty:!1,showButtons:!0,clickoutFiresChange:!0,showInitial:!1,showPalette:!1,showPaletteOnly:!1,hideAfterPaletteSelect:!1,togglePaletteOnly:!1,showSelectionPalette:!0,localStorageKey:!1,appendTo:"body",maxSelectionSize:7,cancelText:"cancel",chooseText:"choose",togglePaletteMoreText:"more",togglePaletteLessText:"less",clearText:"Clear Color Selection",noColorSelectedText:"No Color Selected",preferredFormat:!1,className:"",containerClassName:"",replacerClassName:"",showAlpha:!1,theme:"sp-light",palette:[["#ffffff","#000000","#ff0000","#ff8000","#ffff00","#008000","#0000ff","#4b0082","#9400d3"]],selectionPalette:[],disabled:!1,offset:null},_construct:function(e,a){this.overrided(e,a);var s=this.options,i=this._elm,n=s.flat,c=s.showSelectionPalette,u=s.theme,m=t.debounce(Re,10),w=!1,b=!1,C=0,P=0,T=0,S=0,M=0,z=0,E=0,F=0,I=0,O=0,j=1,A=[],N=[],D={},q=s.selectionPalette.slice(0),R=s.maxSelectionSize,_="sp-dragging",L=null,H=s.callbacks={move:y(s.move,e),change:y(s.change,e),show:y(s.show,e),hide:y(s.hide,e),beforeShow:y(s.beforeShow,e)},B=i.ownerDocument,K=(B.body,r(i)),V=!1,X=r(v,B).addClass(u),Y=X.find(".sp-picker-container"),W=X.find(".sp-color"),G=X.find(".sp-dragger"),J=X.find(".sp-hue"),Q=X.find(".sp-slider"),U=X.find(".sp-alpha-inner"),Z=X.find(".sp-alpha"),$=X.find(".sp-alpha-handle"),ee=X.find(".sp-input"),te=X.find(".sp-palette"),oe=X.find(".sp-initial"),ae=X.find(".sp-cancel"),se=X.find(".sp-clear"),re=X.find(".sp-choose"),le=X.find(".sp-palette-toggle"),ie=K.is("input"),ne=ie&&"color"===K.attr("type")&&inputTypeColorSupport(),ce=ie&&!n,pe=ce?r(g).addClass(u).addClass(s.className).addClass(s.replacerClassName):r([]),de=ce?pe:K,fe=pe.find(".sp-preview-inner"),ue=s.color||ie&&K.val(),he=!1,ge=s.preferredFormat,ve=!s.showButtons||s.clickoutFiresChange,ke=!ue,me=s.allowEmpty&&!ne;function xe(){if(s.showPaletteOnly&&(s.showPalette=!0),le.text(s.showPaletteOnly?s.togglePaletteMoreText:s.togglePaletteLessText),s.palette){A=s.palette.slice(0),N=t.isArray(A[0])?A:[A],D={};for(var e=0;e<N.length;e++)for(var o=0;o<N[e].length;o++){var a=d.parse(N[e][o]).toRgbString();D[a]=!0}}X.toggleClass("sp-flat",n),X.toggleClass("sp-input-disabled",!s.showInput),X.toggleClass("sp-alpha-enabled",s.showAlpha),X.toggleClass("sp-clear-enabled",me),X.toggleClass("sp-buttons-disabled",!s.showButtons),X.toggleClass("sp-palette-buttons-disabled",!s.togglePaletteOnly),X.toggleClass("sp-palette-disabled",!s.showPalette),X.toggleClass("sp-palette-only",s.showPaletteOnly),X.toggleClass("sp-initial-disabled",!s.showInitial),X.addClass(s.className).addClass(s.containerClassName),Re()}function ye(e){if(c){var o=d.parse(e).toRgbString();if(!D[o]&&-1===t.inArray(o,q))for(q.push(o);q.length>R;)q.shift()}}function we(){var e=je(),o=t.map(N,function(t,o){return k(t,e,"sp-palette-row sp-palette-row-"+o,s)});q&&o.push(k(function(){var e=[];if(s.showPalette)for(var t=0;t<q.length;t++){var o=d.parse(q[t]).toRgbString();D[o]||e.push(q[t])}return e.reverse().slice(0,s.maxSelectionSize)}(),e,"sp-palette-row sp-palette-row-selection",s)),te.html(o.join(""))}function be(){if(s.showInitial){var e=he,t=je();oe.html(k([e,t],t,"sp-palette-row-initial",s))}}function Ce(){(P<=0||C<=0||S<=0)&&Re(),b=!0,X.addClass(_),L=null,K.trigger("dragstart.ColorPicker",[je()])}function Pe(){b=!1,X.removeClass(_),K.trigger("dragstop.ColorPicker",[je()])}function Te(){var e=ee.val();if(null!==e&&""!==e||!me){var t=d.parse(e);t.isValid()?(Oe(t),Ae(),qe()):ee.addClass("sp-validation-error")}else Oe(null),Ae(),qe()}function Se(e){27===e.keyCode&&Fe()}function Me(e){2!=e.button&&(b||(ve?qe(!0):Ie(),Fe()))}function ze(){w?Fe():Ee()}function Ee(){var e=l.create("beforeShow.ColorPicker");w?Re():(K.trigger(e,[je()]),!1===H.beforeShow(je())||e.isDefaultPrevented()||(!function(){for(var e=0;e<h.length;e++)h[e]&&h[e].hide()}(),w=!0,r(B).on("keydown.ColorPicker",Se),r(B).on("click.ColorPicker",Me),r(window).on("resize.ColorPicker",m),pe.addClass("sp-active"),X.removeClass("sp-hidden"),Re(),Ne(),he=je(),be(),H.show(he),K.trigger("show.ColorPicker",[he])))}function Fe(){w&&!n&&(w=!1,r(B).off("keydown.ColorPicker",Se),r(B).off("click.ColorPicker",Me),r(window).off("resize.ColorPicker",m),pe.removeClass("sp-active"),X.addClass("sp-hidden"),H.hide(je()),K.trigger("hide.ColorPicker",[je()]))}function Ie(){Oe(he,!0),qe(!0)}function Oe(e,t){var o,a;d.equals(e,je())?Ne():(!e&&me?ke=!0:(ke=!1,o=d.parse(e),a=o.toHsv(),F=a.h%360/360,I=a.s,O=a.v,j=a.a),Ne(),o&&o.isValid()&&!t&&(ge=s.preferredFormat||o.getFormat()))}function je(e){return e=e||{},me&&ke?null:d.parse({h:360*F,s:I,v:O,a:Math.round(1e3*j)/1e3})}function Ae(){Ne(),H.move(je()),K.trigger("move.ColorPicker",[je()])}function Ne(){ee.removeClass("sp-validation-error"),De();var e=d.parse({h:360*F,s:1,v:1});W.css("background-color",e.toHexString());var t=ge;j<1&&(0!==j||"name"!==t)&&("hex"!==t&&"hex3"!==t&&"hex6"!==t&&"name"!==t||(t="rgb"));var a=je({format:t}),r="";if(fe.removeClass("sp-clear-display"),fe.css("background-color","transparent"),!a&&me)fe.addClass("sp-clear-display");else{var l=a.toHexString(),i=a.toRgbString();if(fe.css("background-color",i),s.showAlpha){var n=a.toRgb();n.a=0;var c=d.parse(n).toRgbString(),p="linear-gradient(left, "+c+", "+l+")";o.isIE?U.css("filter",d.parse(c).toFilter({gradientType:1},l)):(U.css("background","-webkit-"+p),U.css("background","-moz-"+p),U.css("background","-ms-"+p),U.css("background","linear-gradient(to right, "+c+", "+l+")"))}r=a.toString(t)}s.showInput&&ee.val(r),s.showPalette&&we(),be()}function De(){var e=I,t=O;if(me&&ke)$.hide(),Q.hide(),G.hide();else{$.show(),Q.show(),G.show();var o=e*C,a=P-t*P;o=Math.max(-T,Math.min(C-T,o-T)),a=Math.max(-T,Math.min(P-T,a-T)),G.css({top:a+"px",left:o+"px"});var s=j*M;$.css({left:s-z/2+"px"});var r=F*S;Q.css({top:r-E+"px"})}}function qe(e){var t=je(),o="",a=!d.equals(t,he);t&&(o=t.toString(ge),ye(t)),ie&&K.val(o),e&&a&&(H.change(t),K.trigger("change",[t]))}function Re(){w&&(C=W.width(),P=W.height(),T=G.height(),J.width(),S=J.height(),E=Q.height(),M=Z.width(),z=$.width(),n||(X.css("position","absolute"),s.offset?X.offset(s.offset):X.offset(p.calcOffset(X[0],de[0]))),De(),s.showPalette&&we(),K.trigger("reflow.ColorPicker"))}function _e(){Fe(),V=!0,K.attr("disabled",!0),de.addClass("sp-disabled")}!function(){o.isIE&&X.find("*:not(input)").attr("unselectable","on");xe(),ce&&K.after(pe).hide();me||se.hide();if(n)K.after(X).hide();else{var e="parent"===s.appendTo?K.parent():r(s.appendTo);1!==e.length&&(e=r("body")),e.append(X)}de.on("click.ColorPicker touchstart.ColorPicker",function(e){V||ze(),e.stopPropagation(),r(e.target).is("input")||e.preventDefault()}),(K.is(":disabled")||!0===s.disabled)&&_e();X.click(x),ee.change(Te),ee.on("paste",function(){setTimeout(Te,1)}),ee.keydown(function(e){13==e.keyCode&&Te()}),ae.text(s.cancelText),ae.on("click.ColorPicker",function(e){e.stopPropagation(),e.preventDefault(),Ie(),Fe()}),se.attr("title",s.clearText),se.on("click.ColorPicker",function(e){e.stopPropagation(),e.preventDefault(),ke=!0,Ae(),n&&qe(!0)}),re.text(s.chooseText),re.on("click.ColorPicker",function(e){e.stopPropagation(),e.preventDefault(),o.isIE&&ee.is(":focus")&&ee.trigger("change"),ee.hasClass("sp-validation-error")||(qe(!0),Fe())}),le.text(s.showPaletteOnly?s.togglePaletteMoreText:s.togglePaletteLessText),le.on("click.spectrum",function(e){e.stopPropagation(),e.preventDefault(),s.showPaletteOnly=!s.showPaletteOnly,s.showPaletteOnly||n||X.css("left","-="+(Y.outerWidth(!0)+5)),xe()}),f(Z,function(e,t,o){j=e/M,ke=!1,o.shiftKey&&(j=Math.round(10*j)/10),Ae()},Ce,Pe),f(J,function(e,t){F=parseFloat(t/S),ke=!1,s.showAlpha||(j=1),Ae()},Ce,Pe),f(W,function(e,t,o){if(o.shiftKey){if(!L){var a=I*C,r=P-O*P,l=Math.abs(e-a)>Math.abs(t-r);L=l?"x":"y"}}else L=null;var i=!L||"y"===L;(!L||"x"===L)&&(I=parseFloat(e/C)),i&&(O=parseFloat((P-t)/P)),ke=!1,s.showAlpha||(j=1),Ae()},Ce,Pe),ue?(Oe(ue),Ne(),ge=s.preferredFormat||d.parse(ue).format,ye(ue)):Ne();n&&Ee();function t(e){return e.data&&e.data.ignore?(Oe(r(e.target).closest(".sp-thumb-el").data("color")),Ae()):(Oe(r(e.target).closest(".sp-thumb-el").data("color")),Ae(),s.hideAfterPaletteSelect?(qe(!0),Fe()):qe()),!1}var a=o.isIE?"mousedown.ColorPicker":"click.ColorPicker touchstart.ColorPicker";te.on(a,".sp-thumb-el",t),oe.on(a,".sp-thumb-el:nth-child(1)",{ignore:!0},t)}(),t.mixin(this,{show:Ee,hide:Fe,toggle:ze,reflow:Re,option:function(e,o){if(void 0===e)return t.mixin({},s);if(void 0===o)return s[e];s[e]=o,"preferredFormat"===e&&(ge=s.preferredFormat);xe()},enable:function(){V=!1,K.attr("disabled",!1),de.removeClass("sp-disabled")},disable:_e,offset:function(e){s.offset=e,Re()},set:function(e){Oe(e),qe()},get:je,destroy:function(){K.show(),de.off("click.ColorPicker touchstart.ColorPicker"),X.remove(),pe.remove(),h[spect.id]=null},container:X})}});function x(e){e.stopPropagation()}function y(e,t){var o=Array.prototype.slice,a=o.call(arguments,2);return function(){return e.apply(t,a.concat(o.call(arguments)))}}return c.register(m,"colorPicker"),m.draggable=f,m.localization={},m.palettes={},e.attach("domx.ColorPicker",m)}),e("skylark-domx-colorpicker/i18n/texts_ja",["../ColorPicker"],function(e){var t=e.localization.ja={cancelText:"中止",chooseText:"選択"};return t}),e("skylark-domx-colorpicker/i18n/texts_zh-cn",["../ColorPicker"],function(e){var t=e.localization["zh-cn"]={cancelText:"取消",chooseText:"选择",clearText:"清除",togglePaletteMoreText:"更多选项",togglePaletteLessText:"隐藏",noColorSelectedText:"尚未选择任何颜色"};return t}),e("skylark-domx-colorpicker/i18n/texts_zh-tw",["../ColorPicker"],function(e){var t=e.localization["zh-tw"]={cancelText:"取消",chooseText:"選擇",clearText:"清除",togglePaletteMoreText:"更多選項",togglePaletteLessText:"隱藏",noColorSelectedText:"尚未選擇任何顏色"};return t}),e("skylark-domx-colorpicker/main",["./ColorPicker","./i18n/texts_ja","./i18n/texts_zh-cn","./i18n/texts_zh-tw"],function(e){return e}),e("skylark-domx-colorpicker",["skylark-domx-colorpicker/main"],function(e){return e})}(o),!a){var l=require("skylark-langx-ns");s?module.exports=l:t.skylarkjs=l}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-domx-colorpicker.js.map