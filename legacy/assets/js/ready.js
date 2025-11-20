const ready=function(cb){
  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",function(){cb();})
    : cb();
};
