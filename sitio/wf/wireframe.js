(function(){
  function run(){
    // Logo original de Agos
    document.querySelectorAll('img[src*="Logo.svg"]').forEach(function(i){i.src='/wf/logo.png';i.classList.add('wf-logo');});
    // Fotos e ilustraciones → placeholder (no íconos ni banderas)
    document.querySelectorAll('img').forEach(function(i){
      var s=i.getAttribute('src')||'';
      if(i.classList.contains('wf-logo')||/banderas|phosphor|icono/i.test(s))return;
      i.classList.add('wf-ph');
      var r=getComputedStyle(i).borderRadius;
      if(!r||r==='0px'){var p=i.parentElement;var pr=p&&getComputedStyle(p).borderRadius;i.style.borderRadius=(pr&&pr!=='0px')?pr:'var(--radio)';}
    });
    // Videos → img placeholder con la misma clase
    document.querySelectorAll('video').forEach(function(v){
      var i=document.createElement('img');i.className=v.className+' wf-ph';
      i.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      v.replaceWith(i);
    });
    // Fondos con foto
    document.querySelectorAll('body *').forEach(function(e){
      var b=getComputedStyle(e).backgroundImage;
      if(b&&/url\(/.test(b)&&!/data:image\/svg/.test(b))e.classList.add('wf-ph-bg');
    });
    // Agenda: se muestra como imagen
    document.querySelectorAll('.agenda').forEach(function(a){a.classList.add('wf-ph-bg');a.style.borderRadius='var(--radio)';});
    // Mapa embebido
    document.querySelectorAll('iframe').forEach(function(f){f.removeAttribute('src');f.classList.add('wf-ph-bg');});
    document.documentElement.classList.add('wf-listo');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
