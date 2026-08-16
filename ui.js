/* Lumina Estate — UI helpers: icons, formatting, modal, toast, camera, csv */
window.App = window.App || {};

(function(){
  const I = {
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
    bill:'<circle cx="12" cy="12" r="9"/><path d="M12 6v12M9 9c0-1.5 1.5-2 3-2s3 .5 3 2-1.5 2-3 2-3 .5-3 2 1.5 2 3 2 3-.5 3-2"/>',
    complaint:'<path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.3A8 8 0 1 1 21 12z"/><path d="M8.5 10.5h7M8.5 14h4.5"/>',
    notice:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    gate:'<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01M15 10h.01"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    users:'<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    docs:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    pie:'<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    poll:'<path d="M12 20V10M18 20V4M6 20v-4"/>',
    alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    back:'<path d="m15 18-6-6 6-6"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
    share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    print:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    car:'<path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><path d="M3 16v-5h18v5M5 16v3M19 16v3"/><circle cx="7.5" cy="16" r="1.8"/><circle cx="16.5" cy="16" r="1.8"/>',
    bike:'<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 17.5V14l-3-3 4-3 2 3h2"/>',
    wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    delivery:'<path d="M5 17h-2v-11a1 1 0 0 1 1-1h9v12m-8 0h6m-6 0a2 2 0 1 0-4 0m10 0a2 2 0 1 0 4 0m-4 0h6v-6h-3l-3-3h-2"/>',
    taxi:'<path d="M4 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"/><path d="M3 17h18v-6a3 3 0 0 0-3-3h-3l-2-4H9L7 8H6a3 3 0 0 0-3 3v6z"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
    swim:'<path d="M2 18c1.7-2.5 3.3-2.5 5 0s3.3 2.5 5 0 3.3-2.5 5 0 3.3 2.5 5 0"/><path d="M2 13c1.7-2.5 3.3-2.5 5 0s3.3 2.5 5 0 3.3-2.5 5 0 3.3 2.5 5 0"/><path d="M2 8c1.7-2.5 3.3-2.5 5 0s3.3 2.5 5 0 3.3-2.5 5 0 3.3 2.5 5 0"/>',
    gym:'<path d="M6.5 6.5 17.5 17.5"/><path d="m21 21-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7"/>',
    hall:'<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/><path d="M9 8h.01M15 8h.01"/>',
    fire:'<path d="M12 22c4.4 0 7-2.8 7-6.5 0-2.3-1-4-2.4-5.5C15.4 11 14.5 11.7 14 13c-.3.8-.6 1.2-1.4 1-1-.3-.9-1.7-1-2.7 0-1.5.2-3 .9-4.3.7-1.3 1.8-2.5 3.6-3.3C14 4 12.4 3.5 11 3.5c-5 0-7.5 3.5-7.5 7.5 0 4 2.3 7 5 8.6"/>',
    police:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    medical:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12h6M12 9v6"/>',
    building:'<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    rupee:'<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a4.5 4.5 0 0 0 0-9"/>',
    wallet:'<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    drop:'<path d="M12 2.7 6.3 8.4a8 8 0 1 0 11.4 0z"/>',
    broom:'<path d="m13 11 9-9M13 11l2 2M13 11 4 20a2 2 0 0 0 0 3h0a2 2 0 0 0 3 0l9-9"/>',
    layers:'<path d="m12 2 10 6-10 6L2 8z"/><path d="m2 13 10 6 10-6"/>',
    sos:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-1.1-2.5-2.5-2.5S6 10.6 6 12a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M15.5 14.5A2.5 2.5 0 0 0 18 12c0-1.4-1.1-2.5-2.5-2.5S13 10.6 13 12a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 12V6M4 12a8 8 0 0 1 16 0"/>',
    speaker:'<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="4"/><path d="M12 6h.01"/>',
    hand:'<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.8-6-2.7l-3-4A2 2 0 0 1 4 12h7"/>',
    lift:'<path d="M3 21h18M6 21V3h12v18"/><path d="M10 6h4M10 9h4M10 12h4"/>',
    plant:'<path d="M12 22v-7"/><path d="M12 15a6 6 0 0 0 6-6 6 6 0 0 0-12 0 6 6 0 0 0 6 6z"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/>',
    qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M21 21v.01M18 21v.01"/>',
    lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    refresh:'<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    arrowR:'<path d="M5 12h14M12 5l7 7-7 7"/>',
    chevR:'<path d="m9 18 6-6-6-6"/>',
    up:'<path d="m18 15-6-6-6 6"/>',
    bank:'<path d="m3 9 9-6 9 6"/><path d="M3 9h18v11H3z"/><path d="M3 15h18M6 20v-5M10 20v-5M14 20v-5M18 20v-5"/>',
    sparkle:'<path d="M12 2l2.1 6.9L21 11l-6.9 2.1L12 20l-2.1-6.9L3 11l6.9-2.1z"/>',
    key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>'
  };
  function icon(name, size, cls){
    const s = size||22;
    const path = I[name] || I.info;
    return '<svg class="'+(cls||"")+'" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
  }
  App.icon = icon;

  App.esc = function(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); };

  App.fmt = function(n){ return "₹" + Number(n||0).toLocaleString("en-IN"); };
  App.fmtNum = function(n){ return Number(n||0).toLocaleString("en-IN"); };

  App.fmtDate = function(iso){
    if(!iso) return "—";
    const d=new Date(iso), M=I18N[App.state.lang].months[d.getMonth()];
    return d.getDate()+" "+M+" "+d.getFullYear();
  };
  App.fmtDateShort = function(iso){
    if(!iso) return "—";
    const d=new Date(iso); return d.getDate()+" "+I18N[App.state.lang].months[d.getMonth()].slice(0,3);
  };
  App.fmtTime = function(iso){
    if(!iso) return "";
    const d=new Date(iso); let h=d.getHours(); const m=String(d.getMinutes()).padStart(2,"0"); const ap=h>=12?"PM":"AM"; h=h%12||12;
    return h+":"+m+" "+ap;
  };
  App.fmtDateTime = function(iso){ return App.fmtDate(iso)+", "+App.fmtTime(iso); };
  App.relTime = function(iso){
    const t=App.t;
    const diff=Date.now()-new Date(iso).getTime();
    const m=Math.floor(diff/60000), h=Math.floor(m/60), d=Math.floor(h/24);
    if(m<1) return t("justNow");
    if(m<60) return m+" "+t("minsAgo");
    if(h<24) return h+" "+t("hoursAgo");
    if(d<7) return d+" "+t("daysAgo");
    return App.fmtDate(iso);
  };
  App.todayStr = function(){ const d=new Date(); return d.getFullYear()+"-"+Store.pad(d.getMonth()+1)+"-"+Store.pad(d.getDate()); };
  App.tomorrowStr = function(){ const d=new Date(); d.setDate(d.getDate()+1); return d.getFullYear()+"-"+Store.pad(d.getMonth()+1)+"-"+Store.pad(d.getDate()); };

  App.avatar = function(name, cls){
    const n=String(name||"?").trim();
    const initials = n.split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
    const h=n.charCodeAt(0)+n.length*7;
    return '<span class="avatar '+(cls||"av-md")+' av-'+((h%8)+1)+'">'+App.esc(initials)+'</span>';
  };

  const CHIP_STATUS = {
    paid:["chip-green","paid"], unpaid:["chip-amber","unpaid"], overdue:["chip-red","overdue"],
    open:["chip-grey","open"], assigned:["chip-purple","assigned"], in_progress:["chip-blue","inProgress"],
    resolved:["chip-green","resolved"], closed:["chip-green","closed"],
    pending:["chip-amber","pending"], approved:["chip-green","approved"], denied:["chip-red","denied"],
    verified:["chip-green","approved"], notified:["chip-blue","deliveredMsg"],
    confirmed:["chip-green","bookingConfirmed"], pending_approval:["chip-amber","bookingPending"],
    cancelled:["chip-red","bookingCancelled"], active:["chip-green","present"], void:["chip-grey","voided"],
    responding:["chip-amber","responding"], success:["chip-green","paid"], vacancy:["chip-amber","vacant"]
  };
  App.chip = function(status, extra){
    const c=CHIP_STATUS[status]||["chip-grey",status];
    return '<span class="chip '+c[0]+' '+(extra||"")+'">'+App.esc(App.t(c[1]))+'</span>';
  };

  App.stars = function(rating){
    let out='<span class="star-read">';
    for(let i=1;i<=5;i++) out += icon("star", i<=rating?16:0, i<=rating?"":"hide");
    return out+"</span>";
  };

  App.empty = function(titleKey, msgKey, actionHtml){
    return '<div class="empty"><div class="ei">'+icon("sparkle",30)+'</div><div class="et">'+App.esc(App.t(titleKey))+'</div><div class="es">'+App.esc(App.t(msgKey))+'</div>'+(actionHtml||"")+'</div>';
  };

  // ---- toast ----
  App.toast = function(msg, type){
    let wrap=document.querySelector(".toast-wrap");
    if(!wrap){ wrap=document.createElement("div"); wrap.className="toast-wrap"; document.body.appendChild(wrap); }
    const el=document.createElement("div");
    el.className="toast toast-"+(type||"info");
    el.innerHTML = icon(type==="success"?"check":type==="error"?"alert":"info",18) + "<span>"+App.esc(msg)+"</span>";
    wrap.appendChild(el);
    setTimeout(()=>{ el.style.opacity="0"; el.style.transition="opacity .3s"; setTimeout(()=>el.remove(),320); }, 3200);
  };

  // ---- modal ----
  App.modal = function(html, opts){
    const o=opts||{};
    const ov=document.createElement("div");
    ov.className="modal-overlay";
    ov.innerHTML = '<div class="modal '+(o.wide?"modal-wide":"")+'">'+
      (o.title!==false ? '<div class="modal-head"><h3>'+App.esc(o.title||"")+'</h3><button class="modal-close" data-action="modalClose">'+icon("x",16)+'</button></div>':'')+
      '<div class="modal-body">'+html+'</div></div>';
    ov.addEventListener("mousedown", function(e){ if(e.target===ov && o.closeable!==false) ov.remove(); });
    document.body.appendChild(ov);
    return ov;
  };
  App.closeModal = function(){ const m=document.querySelector(".modal-overlay"); if(m) m.remove(); };

  App.confirmModal = function(title, msg, onYes, yesLabel){
    App.modal('<div class="center" style="padding:4px 0"><div style="font-size:15px;font-weight:700;margin-bottom:8px">'+App.esc(msg)+'</div></div>',{title:title});
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",
      '<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+App.esc(App.t("cancel"))+'</button>'+
      '<button class="btn btn-danger" data-action="modalYes">'+App.esc(yesLabel||App.t("confirm"))+'</button></div>');
    const yesBtn=ov.querySelector('[data-action="modalYes"]');
    yesBtn.addEventListener("click", function(){ ov.remove(); if(onYes) onYes(); });
  };

  // ---- photo capture ----
  App.capture = function(key){
    const inp=document.createElement("input");
    inp.type="file"; inp.accept="image/*"; inp.capture="environment";
    inp.onchange=function(){
      const f=inp.files && inp.files[0];
      if(!f) return;
      const rd=new FileReader();
      rd.onload=function(){
        const img=new Image();
        img.onload=function(){
          const maxW=720; let w=img.width, h=img.height;
          if(w>maxW){ h=Math.round(h*maxW/w); w=maxW; }
          const c=document.createElement("canvas"); c.width=w; c.height=h;
          c.getContext("2d").drawImage(img,0,0,w,h);
          try{
            App.state.tmp.photos = App.state.tmp.photos||{};
            App.state.tmp.photos[key]=c.toDataURL("image/jpeg",0.72);
          }catch(e){ App.state.tmp.photos[key]=rd.result; }
          App.render();
        };
        img.onerror=function(){ App.toast(App.t("camFail"),"error"); };
        img.src=rd.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  };

  // ---- download helpers ----
  App.download = function(filename, content, mime){
    try{
      const blob=new Blob([content],{type:mime||"text/plain;charset=utf-8"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob); a.download=filename;
      document.body.appendChild(a); a.click();
      setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },400);
    }catch(e){ App.toast(App.t("error")+": "+e.message, "error"); }
  };
  App.csv = function(rows){
    return rows.map(r=>r.map(c=>{ c=String(c==null?"":c); return /[",\n]/.test(c)? '"'+c.replace(/"/g,'""')+'"' : c; }).join(",")).join("\n");
  };
})();
