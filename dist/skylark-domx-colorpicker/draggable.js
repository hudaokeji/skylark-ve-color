/**
 * skylark-domx-colorpicker - The skylark dom plugin for picking color 
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-colorpicker/
 * @license MIT
 */
define(["skylark-langx/skylark","skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-eventer","skylark-domx-finder","skylark-domx-query"],function(t,n,o,a,e,r,i){return function(t,n,a,e){n=n||function(){},a=a||function(){},e=e||function(){};var r=document,u=!1,s={},l=0,d=0,c="ontouchstart"in window,f={};function g(t){t.stopPropagation&&t.stopPropagation(),t.preventDefault&&t.preventDefault(),t.returnValue=!1}function p(a){if(u){if(o.isIE&&r.documentMode<9&&!a.button)return m();var e=a.originalEvent&&a.originalEvent.touches&&a.originalEvent.touches[0],i=e&&e.pageX||a.pageX,f=e&&e.pageY||a.pageY,p=Math.max(0,Math.min(i-s.left,d)),h=Math.max(0,Math.min(f-s.top,l));c&&g(a),n.apply(t,[p,h,a])}}function m(){u&&(i(r).off(f),i(r.body).removeClass("sp-dragging"),setTimeout(function(){e.apply(t,arguments)},0)),u=!1}f.selectstart=g,f.dragstart=g,f["touchmove mousemove"]=p,f["touchend mouseup"]=m,i(t).on("touchstart mousedown",function(n){(n.which?3==n.which:2==n.button)||u||!1!==a.apply(t,arguments)&&(u=!0,l=i(t).height(),d=i(t).width(),s=i(t).offset(),i(r).on(f),i(r.body).addClass("sp-dragging"),p(n),g(n))})}});
//# sourceMappingURL=sourcemaps/draggable.js.map
