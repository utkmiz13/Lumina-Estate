/* Lumina Estate — App shell, router, auth */
window.App = window.App || {};
(function(){
  const S=Store;

  /* ---------- state ---------- */
  App.state = {
    lang: "hi",
    user: null,
    route: window.location.hash.replace("#","") || "/",
    tmp: { photos:{} },
    pay: null,
    bellOpen: false,
    profOpen: false,
    login: { step:"phone", phone:"", otp:"" }
  };

  App.t = function(key){
    const lang = App.state.lang;
    if(I18N[lang] && I18N[lang][key]) return I18N[lang][key];
    if(I18N.en[key]) return I18N.en[key];
    return key;
  };

  /* ---------- storage init ---------- */
  App.init = function(){
    S.load();
    const st=S.get();
    App.state.lang = st.settings && st.settings.defaultLang ? st.settings.defaultLang : "hi";
    App.state.user = st.users.find(u=>u.id===st.session) || null;
    bindGlobal();
    window.addEventListener("hashchange", ()=>App.render());
    App.render();
  };

  /* ---------- router ---------- */
  const R = {
    "/login": {v:()=>loginView(), public:true},
    // resident
    "/home": {v:()=> App.state.user.role==="admin" ? App.views.admHome() : App.views.resHome(), roles:["owner","tenant","admin","family"]},
    "/bills": {v:()=>App.views.resBills(), roles:["owner","tenant","admin"]},
    "/ledger": {v:()=>App.views.resLedger(), roles:["owner","tenant","admin"]},
    "/complaints": {v:()=>App.views.resComplaints({}), roles:["owner","tenant","family","admin"]},
    "/complaints/community": {v:()=>App.views.resComplaints({tab:"community"}), roles:["owner","tenant","family","admin"]},
    "/complaints/new": {v:()=>App.views.resNewComplaint(), roles:["owner","tenant","family","admin"]},
    "/notices": {v:()=>App.views.resNotices(), roles:["owner","tenant","family","admin"]},
    "/gate": {v:()=>App.views.resGate(), roles:["owner","tenant","family","admin"]},
    "/bookings": {v:()=>App.views.resBookings(), roles:["owner","tenant","admin"]},
    "/directory": {v:()=>App.views.resDirectory(), roles:["owner","tenant","family","admin"]},
    "/documents": {v:()=>App.views.resDocuments(), roles:["owner","tenant","family","admin"]},
    "/transparency": {v:()=>App.views.resTransparency(), roles:["owner","tenant","family","admin"]},
    "/polls": {v:()=>App.views.resPolls(), roles:["owner","tenant","family","admin"]},
    "/emergency": {v:()=>App.views.resEmergency(), roles:["owner","tenant","family","admin"]},
    "/profile": {v:()=>App.views.resProfile(), roles:["owner","tenant","family","admin","guard","staff"]},
    "/more": {v:()=>App.views.resMore(), roles:["owner","tenant","family","admin"]},
    // admin
    "/admin/finance": {v:()=>App.views.admFinance(), roles:["admin"]},
    "/admin/billrun": {v:()=>App.views.admBillRun(), roles:["admin"]},
    "/admin/bills": {v:()=>App.views.admBills(), roles:["admin"]},
    "/admin/manual": {v:()=>App.views.admManual(), roles:["admin"]},
    "/admin/defaulters": {v:()=>App.views.admDefaulters(), roles:["admin"]},
    "/admin/reports": {v:()=>App.views.admReports(), roles:["admin"]},
    "/admin/helpdesk": {v:()=>App.views.admHelpdesk(), roles:["admin"]},
    "/admin/staffperf": {v:()=>App.views.admStaffPerf(), roles:["admin"]},
    "/admin/notices": {v:()=>App.views.admNotices(), roles:["admin"]},
    "/admin/notices/new": {v:()=>App.views.admNewNotice(), roles:["admin"]},
    "/admin/polls": {v:()=>App.views.admPolls(), roles:["admin"]},
    "/admin/security": {v:()=>App.views.admSecurity(), roles:["admin"]},
    "/admin/facilities": {v:()=>App.views.admFacilities(), roles:["admin"]},
    "/admin/members": {v:()=>App.views.admMembers(), roles:["admin"]},
    "/admin/approvals": {v:()=>App.views.admMembers(), roles:["admin"]},
    "/admin/expenses": {v:()=>App.views.admExpenses(), roles:["admin"]},
    "/admin/settings": {v:()=>App.views.admSettings(), roles:["admin"]},
    "/admin/audit": {v:()=>App.views.admAudit(), roles:["admin"]},
    "/admin/more": {v:()=>App.views.admMore(), roles:["admin"]},
    // guard
    "/guard": {v:()=>App.views.grdHome(), roles:["guard"]},
    "/guard/entry": {v:()=>App.views.grdEntry(), roles:["guard"]},
    "/guard/verify": {v:()=>App.views.grdVerify(), roles:["guard"]},
    "/guard/logs": {v:()=>App.views.grdLogs(), roles:["guard"]},
    // staff
    "/staff": {v:()=>App.views.stfHome(), roles:["staff"]}
  };
  // parametrized routes
  const PR = [
    [/^\/bill\/(\w+)$/, (m)=>({v:()=>App.views.resBillDetail({id:m[1]}), roles:["owner","tenant","admin"]})],
    [/^\/receipt\/(\w+)$/, (m)=>({v:()=>App.views.resReceipt({id:m[1]}), roles:["owner","tenant","admin"]})],
    [/^\/complaint\/(\w+)$/, (m)=>({v:()=>App.views.resComplaintDetail({id:m[1]}), roles:["owner","tenant","family","admin"]})],
    [/^\/notice\/(\w+)$/, (m)=>({v:()=>App.views.resNoticeDetail({id:m[1]}), roles:["owner","tenant","family","admin"]})],
    [/^\/booking\/(\w+)$/, (m)=>({v:()=>App.views.resBookingDetail({id:m[1]}), roles:["owner","tenant","admin"]})],
    [/^\/documents\/(\w+)$/, (m)=>({v:()=>App.views.resFolderDetail({id:m[1]}), roles:["owner","tenant","family","admin"]})],
    [/^\/admin\/bill\/(\w+)$/, (m)=>({v:()=>App.views.admBillDetail({id:m[1]}), roles:["admin"]})],
    [/^\/admin\/complaint\/(\w+)$/, (m)=>({v:()=>App.views.admComplaintDetail({id:m[1]}), roles:["admin"]})],
    [/^\/admin\/notice\/(\w+)$/, (m)=>({v:()=>App.views.admNoticeDetail({id:m[1]}), roles:["admin"]})],
    [/^\/staff\/complaint\/(\w+)$/, (m)=>({v:()=>App.views.stfComplaint({id:m[1]}), roles:["staff"]})]
  ];

  function resolve(path){
    if(R[path]) return R[path];
    for(let i=0;i<PR.length;i++){ const m=path.match(PR[i][0]); if(m) return PR[i][1](m); }
    return null;
  }
  function roleHome(role){
    if(role==="guard") return "/guard";
    if(role==="staff") return "/staff";
    return "/home";
  }

  App.go = function(path){
    if(!path) return;
    if(window.location.hash === "#"+path){ App.render(); }
    else window.location.hash = "#"+path;
  };

  App.render = function(){
    const st=S.get();
    const path=window.location.hash.replace("#","") || "/";
    App.state.route=path;

    // auth gate
    if(!App.state.user){
      App.state.user=null;
      document.getElementById("app").innerHTML = loginView();
      postRender();
      return;
    }
    // session user refresh from store
    const fresh=st.users.find(u=>u.id===App.state.user.id);
    if(!fresh || fresh.status!=="active"){ App.state.user=null; App.state.bellOpen=false; document.getElementById("app").innerHTML=loginView(); postRender(); return; }
    App.state.user=fresh;

    let r=resolve(path);
    if(!r){ r={v:()=>App.notFoundView(), roles:null}; }
    if(!r.public && r.roles && !r.roles.includes(App.state.user.role)){
      App.go(roleHome(App.state.user.role));
      return;
    }

    const content = '<div id="view">'+r.v()+'</div>';
    document.getElementById("app").innerHTML = shell() + content + "</main></div>";
    postRender();
  };

  App.notFoundView = function(){
    return '<div class="page fade"><div class="empty" style="padding:60px 16px"><div class="ei">'+App.icon("alert",28)+'</div><div class="et">'+App.t("notFound")+'</div>'+
      '<button class="btn btn-primary btn-sm mt" data-action="go" data-arg="'+(App.state.user? roleHome(App.state.user.role):"/login")+'">'+App.t("goHome")+'</button></div></div>';
  };

  /* ---------- shell ---------- */
  function navConfig(role){
    if(role==="admin") return [
      {g:"", items:[["home","/home","home"],["finance","/admin/finance","bill"],["helpdesk","/admin/helpdesk","complaint"],["comm","/admin/notices","notice"]]},
      {g:"", items:[["securitySec","/admin/security","shield"],["facilities","/admin/facilities","calendar"],["members","/admin/members","users"],["expenses","/admin/expenses","wallet"]]},
      {g:"", items:[["reports","/admin/reports","pie"],["settings","/admin/settings","gear"],["auditLog","/admin/audit","docs"],["more","/admin/more","more"]]}
    ];
    if(role==="guard") return [
      {g:"", items:[["guardHome","/guard","home"],["newEntry","/guard/entry","camera"],["verifyCode","/guard/verify","key"],["gateLog","/guard/logs","docs"]]},
      {g:"", items:[["profile","/profile","user"]]}
    ];
    if(role==="staff") return [
      {g:"", items:[["staffHome","/staff","home"],["profile","/profile","user"]]}
    ];
    const base=[
      {g:"", items:[["home","/home","home"],["bills","/bills","bill"],["complaints","/complaints","complaint"],["notices","/notices","notice"]]},
      {g:"community", items:[["gate","/gate","gate"],["bookings","/bookings","calendar"],["directory","/directory","users"],["polls","/polls","poll"]]},
      {g:"moreOptions", items:[["documents","/documents","docs"],["transparency","/transparency","pie"],["emergency","/emergency","alert"],["profile","/profile","user"]]}
    ];
    if(role==="family") return [
      {g:"", items:[["home","/home","home"],["notices","/notices","notice"]]},
      {g:"", items:[["gate","/gate","gate"],["emergency","/emergency","alert"],["profile","/profile","user"]]}
    ];
    const canBill = role==="tenant" ? (S.get().settings.tenantBillingVisible!==false) : true;
    if(!canBill) base[0].items = base[0].items.filter(i=>i[0]!=="bills");
    return base;
  }

  function shell(){
    const u=App.state.user, st=S.get();
    const nav=navConfig(u.role);
    const unread=st.notifications.filter(n=>n.userId===u.id && !n.read).length;
    const active=(path)=>{ const cur=App.state.route; if(path==="/home") return cur==="/home"; return cur===path||cur.startsWith(path); };

    let html='<header class="app-header"><div class="brand" data-action="go" data-arg="'+(u.role==="guard"?"/guard":u.role==="staff"?"/staff":"/home")+'">'+App.logoSvg()+
      '<div><div class="brand-name">Lumina Estate</div><div class="brand-sub">'+App.esc(st.settings&&st.settings.societyName? st.settings.societyName:"Green Valley Residency")+'</div></div></div>'+
      '<div class="hdr-society">'+App.esc(st.settings&&st.settings.societyName? st.settings.societyName:"")+' · '+App.t(u.role==="admin"?"admin":u.role==="owner"?"owner":u.role==="tenant"?"tenant":u.role==="family"?"familyMember":u.role==="guard"?"guard":"staff")+'</div>'+
      '<div class="hdr-actions">'+
      '<button class="lang-btn" data-action="toggleLang">'+(App.state.lang==="hi"?"EN":"हिंदी")+'</button>'+
      '<div class="bell-wrap"><button class="icon-btn" data-action="toggleBell">'+App.icon("notice",21)+(unread?'<span class="badge-dot">'+unread+'</span>':"")+'</button>'+bellDrop()+'</div>'+
      '<div class="prof-wrap"><button class="icon-btn" data-action="toggleProf">'+App.avatar(u.name,"av-sm")+'</button>'+profDrop()+'</div></div></header>';

    html+='<div class="layout"><aside class="app-side">';
    nav.forEach(grp=>{
      if(grp.g) html+='<div class="side-group">'+App.t(grp.g)+'</div>';
      grp.items.forEach(it=>{
        html+='<div class="side-item '+(active(it[1])?"active":"")+'" data-action="go" data-arg="'+it[1]+'">'+App.icon(it[2],19)+'<span>'+App.t(it[0])+'</span></div>';
      });
    });
    html+='</aside>';

    // bottom nav: first 4 groups' items flattened, take up to 5
    const bottomItems=nav.flatMap(g=>g.items).slice(0,5);
    html+='<nav class="app-nav">';
    bottomItems.forEach(it=>{
      html+='<div class="nav-item '+(active(it[1])?"active":"")+'" data-action="go" data-arg="'+it[1]+'">'+App.icon(it[2],21)+'<span>'+App.t(it[0])+'</span></div>';
    });
    html+='</nav><main class="main" id="main">';
    return html;
  }

  function bellDrop(){
    if(!App.state.bellOpen) return "";
    const u=App.state.user, st=S.get();
    const notifs=st.notifications.filter(n=>n.userId===u.id).slice(0,15);
    const icons={bill:"bill",alert:"alert",gate:"gate",complaint:"complaint",poll:"poll",check:"check",calendar:"calendar",notice:"notice",sos:"sos"};
    const colors={bill:"#1565C0",alert:"#C62828",gate:"#2E7D32",complaint:"#C62828",poll:"#6A3FA0",check:"#2E7D32",calendar:"#C98A2D",notice:"#6A3FA0",sos:"#C62828"};
    let html='<div class="bell-drop">';
    if(!notifs.length) html+='<div class="empty" style="padding:22px"><div class="et">'+App.t("emptyTitle")+'</div></div>';
    notifs.forEach(n=>{
      html+='<div class="notif-item '+(n.read?"":"unread")+'" data-action="openNotif" data-id="'+n.id+'">'+
        '<span class="ni" style="background:'+(colors[n.icon]||"#1F3A5F")+'20;color:'+(colors[n.icon]||"#1F3A5F")+'">'+App.icon(icons[n.icon]||"info",17)+'</span>'+
        '<div class="grow"><div class="nt">'+App.esc(n.title)+'</div><div class="nb">'+App.esc(n.body)+'</div><div class="na">'+App.relTime(n.at)+'</div></div></div>';
    });
    html+='<div class="prof-item center" data-action="markAllRead" style="justify-content:center;color:var(--navy)">'+App.icon("check",15)+App.t("done")+'</div>';
    html+='</div>';
    return html;
  }
  function profDrop(){
    if(!App.state.profOpen) return "";
    const u=App.state.user;
    const st=S.get();
    let html='<div class="prof-drop">';
    html+='<div class="prof-item">'+App.avatar(u.name,"av-sm")+'<div><div class="bold small">'+App.esc(u.name)+'</div><div class="muted" style="font-size:10.5px">'+App.esc(u.phone)+'</div></div></div>';
    html+='<button class="prof-item" data-action="go" data-arg="/profile">'+App.icon("user",16)+App.t("profile")+'</button>';
    if(u.role!=="guard"&&u.role!=="staff") html+='<button class="prof-item" data-action="go" data-arg="/emergency">'+App.icon("alert",16)+App.t("emergency")+'</button>';
    html+='<button class="prof-item" data-action="logout">'+App.icon("logout",16)+App.t("logout")+'</button></div>';
    return html;
  }

  /* ---------- logo ---------- */
  App.logoSvg = function(){
    return '<svg class="brand-logo" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#1F3A5F"/><rect x="12" y="30" width="9" height="20" rx="2.5" fill="#C98A2D"/><rect x="27.5" y="20" width="9" height="30" rx="2.5" fill="#E0A84E"/><rect x="43" y="26" width="9" height="24" rx="2.5" fill="#F5D9A8"/><circle cx="32" cy="11" r="4" fill="#C98A2D"/></svg>';
  };

  /* ---------- login ---------- */
  function loginView(){
    const st=S.get();
    const step=App.state.login.step;
    let html='<div class="login-wrap"><div class="login-card">';
    html+='<div style="display:flex;justify-content:flex-end;margin-bottom:6px"><button class="lang-btn" style="border-color:var(--border);color:var(--navy)" data-action="toggleLang">'+(App.state.lang==="hi"?"EN":"हिंदी")+'</button></div>';
    html+='<div class="login-brand"><span class="lg">'+App.logoSvg()+'</span><div><div class="lt">'+App.t("appName")+'</div><div class="ls">'+App.t("tagline")+' · '+App.esc(st.settings.societyName||"Green Valley Residency")+'</div></div></div>';

    if(step==="phone"){
      html+='<div class="field mt"><label>'+App.t("phone")+'</label><div class="phone-row"><span class="inp phone-code center bold">+91</span><input class="inp" id="lgPhone" inputmode="numeric" maxlength="10" placeholder="9999XXXXXX" value="'+App.esc(App.state.login.phone)+'"></div></div>';
      html+='<button class="btn btn-primary btn-lg btn-block" data-action="sendOtp">'+App.t("sendOtp")+'</button>';
      html+='<div class="divider"></div><div class="bold small center mb">'+App.t("demoAccounts")+'</div><div class="demo-grid">';
      const demoUsers=st.users.filter(x=>["9999000001","9999000002","9999000003","9999000004","9999000005","9999000006"].includes(x.phone) && x.status==="active");
      const roleIcons={admin:"shield",owner:"user",tenant:"user",guard:"shield",staff:"broom",family:"users"};
      demoUsers.forEach(x=>{
        html+='<button class="demo-card" data-action="loginAs" data-id="'+x.id+'">'+App.avatar(x.name,"av-md")+
          '<span class="dc-g"><span class="dc-n">'+App.esc(x.name)+'</span><span class="dc-r">'+App.t(x.role==="admin"?"admin":x.role==="owner"?"owner":x.role==="tenant"?"tenant":x.role==="family"?"familyMember":x.role==="guard"?"guard":"staff")+' · '+App.esc(x.phone)+'</span></span>'+
          '<span class="dc-go">'+App.icon("chevR",18)+'</span></button>';
      });
      html+='</div>';
    }
    else if(step==="otp"){
      html+='<div class="small muted mb">'+App.t("otpSent")+': <b>+91 '+App.esc(App.state.login.phone)+'</b> <button class="btn btn-ghost btn-sm" data-action="backToPhone" style="padding:3px 8px;font-size:11px">'+App.t("edit")+'</button></div>';
      html+='<div class="otp-banner">'+App.icon("key",17)+'<span>'+App.t("demoOtp")+': <span class="oc">'+App.state.login.otp+'</span></span><button class="btn btn-sm" style="background:#fff;margin-left:auto;color:var(--blue)" data-action="autofillOtp">'+App.t("autofill")+'</button></div>';
      html+='<div class="otp-row">'+[0,1,2,3,4,5].map(i=>'<input class="otp-box" data-otp="'+i+'" maxlength="1" inputmode="numeric">').join("")+'</div>';
      html+='<div class="small muted center mb">'+App.t("enterOtp")+'</div>';
      html+='<button class="btn btn-primary btn-lg btn-block" data-action="verifyOtp">'+App.t("verifyLogin")+'</button>';
      html+='<div class="center mt"><button class="btn btn-ghost btn-sm" data-action="resendOtp">'+App.t("resendOtp")+'</button> <button class="btn btn-ghost btn-sm" data-action="backToPhone">'+App.t("back")+'</button></div>';
    }
    else if(step==="register"){
      const flats=st.flats.filter(f=>f.occupancy==="occupied");
      html+='<div class="small muted mb">+91 '+App.esc(App.state.login.phone)+' — '+App.t("userNotFound")+'</div>';
      html+='<div class="field"><label>'+App.t("fullName")+'</label><input class="inp" id="rgName"></div>';
      html+='<div class="field"><label>'+App.t("selectFlat")+'</label><select class="inp" id="rgFlat">'+flats.map(f=>'<option value="'+f.id+'">'+App.esc(S.flatKey(f))+' — '+App.esc(f.type)+'</option>').join("")+'</select></div>';
      html+='<div class="field"><label>'+App.t("role")+'</label><div style="display:flex;gap:8px">'+
        '<button class="btn btn-sm btn-primary" data-action="setRgRole" data-id="owner">'+App.t("owner")+'</button>'+
        '<button class="btn btn-sm btn-ghost" data-action="setRgRole" data-id="tenant">'+App.t("tenant")+'</button></div></div>';
      html+='<button class="btn btn-gold btn-lg btn-block" data-action="submitRegister">'+App.t("submitRequest")+'</button>';
      html+='<div class="center mt"><button class="btn btn-ghost btn-sm" data-action="backToPhone">'+App.t("back")+'</button></div>';
      App.state.login.rgRole="owner";
    }
    else if(step==="pending"){
      html+='<div class="center" style="padding:14px 0"><div class="pending-illus">'+App.icon("clock",42)+'</div><h3 style="font-size:17px">'+App.t("pendingApproval")+'</h3>'+
        '<div class="small muted mt">'+App.t("pendingApprovalMsg")+'</div>'+
        '<button class="btn btn-ghost btn-block mt" data-action="remindAdminAgain">'+App.icon("send",15)+App.t("remindAdmin")+'</button>'+
        '<button class="btn btn-primary btn-block" data-action="backToPhone">'+App.t("goLogin")+'</button></div>';
    }
    html+='<div class="footer-note">🔒 '+App.t("dataLocal2")+' · '+App.t("privacy")+'</div>';
    html+='</div></div>';
    return html;
  }

  /* ---------- auth actions ---------- */
  App.act("sendOtp", ()=>{
    const phone=(document.getElementById("lgPhone")||{}).value||"";
    if(!/^\d{10}$/.test(phone)){ App.toast(App.t("phone")+" — 10 "+App.t("required"),"error"); return; }
    const otp=String(Math.floor(100000+Math.random()*899999));
    App.state.login={step:"otp", phone, otp};
    App.render();
    setTimeout(()=>{
      const boxes=document.querySelectorAll(".otp-box");
      if(boxes.length) boxes[0].focus();
    },50);
  });
  App.act("backToPhone", ()=>{ App.state.login.step="phone"; App.render(); });
  App.act("resendOtp", ()=>{ App.state.login.otp=String(Math.floor(100000+Math.random()*899999)); App.render(); App.toast(App.t("otpSent")+" ✓","success"); });
  App.act("autofillOtp", ()=>{
    document.querySelectorAll(".otp-box").forEach((b,i)=>{ b.value=App.state.login.otp[i]; });
  });
  App.act("verifyOtp", ()=>{
    const boxes=document.querySelectorAll(".otp-box");
    let entered="";
    boxes.forEach(b=>entered+=b.value||"");
    if(entered.length!==6){ App.toast(App.t("enterOtp"),"error"); return; }
    if(entered!==App.state.login.otp && entered!=="123456"){ App.toast(App.t("wrongOtp"),"error"); return; }
    const st=S.get();
    const u=S.findUserByPhone(App.state.login.phone);
    if(u){
      if(u.status==="active"){ doLogin(u.id); }
      else if(u.status==="pending"){ App.state.login.step="pending"; App.state.login.pendingUserId=u.id; App.render(); }
      else { App.toast(App.t("accountDeactivated"),"error"); App.state.login.step="phone"; App.render(); }
    } else {
      App.state.login.step="register";
      App.render();
    }
  });
  App.act("setRgRole", el=>{ App.state.login.rgRole=el.dataset.id; document.querySelectorAll('[data-action="setRgRole"]').forEach(b=>{ b.className="btn btn-sm "+(b.dataset.id===el.dataset.id?"btn-primary":"btn-ghost"); }); });
  App.act("submitRegister", ()=>{
    const name=(document.getElementById("rgName")||{}).value||"";
    const flatId=(document.getElementById("rgFlat")||{}).value;
    if(name.trim().length<2){ App.toast(App.t("fullName")+" "+App.t("required"),"error"); return; }
    const u=S.createUser({name:name.trim(), phone:App.state.login.phone, role:App.state.login.rgRole||"owner", status:"pending", flatId});
    u.wantsFlat=flatId;
    S.notify(S.get().users.filter(x=>x.role==="admin").map(x=>x.id),"alert",App.t("newRequest")+": "+u.name, App.t("flatNo")+" "+S.flatKey(S.flatById(flatId)),"/admin/approvals");
    S.log(u.name,"auth.request", u.phone+" → "+S.flatKey(S.flatById(flatId)));
    S.save();
    App.state.login.step="pending"; App.state.login.pendingUserId=u.id;
    App.render();
  });
  App.act("remindAdminAgain", ()=>{
    S.notify(S.get().users.filter(x=>x.role==="admin").map(x=>x.id),"alert",App.t("remindAdmin")+" (resend)","","/admin/approvals");
    S.save(); App.toast(App.t("remindAdmin")+" ✓","success");
  });

  function doLogin(userId){
    const st=S.get();
    st.session=userId;
    S.save();
    App.state.user=S.userById(userId);
    App.state.login={step:"phone",phone:"",otp:""};
    App.state.bellOpen=false; App.state.profOpen=false;
    App.go(roleHome(App.state.user.role));
  }
  App.act("loginAs", el=>{
    const u=S.userById(el.dataset.id);
    if(u && u.status==="active") doLogin(u.id);
    else App.toast(App.t("accountDeactivated"),"error");
  });
  App.act("logout", ()=>{
    const st=S.get(); st.session=null; S.save();
    App.state.user=null; App.state.bellOpen=false; App.state.profOpen=false;
    App.go("/login");
  });
  App.act("toggleLang", ()=>{ App.state.lang = App.state.lang==="hi"?"en":"hi"; S.save(); App.render(); });
  App.act("toggleBell", ()=>{ App.state.bellOpen=!App.state.bellOpen; App.state.profOpen=false; App.render(); });
  App.act("toggleProf", ()=>{ App.state.profOpen=!App.state.profOpen; App.state.bellOpen=false; App.render(); });
  App.act("openNotif", el=>{
    const n=S.get().notifications.find(x=>x.id===el.dataset.id);
    if(n){ n.read=true; S.save(); }
    App.state.bellOpen=false;
    App.render();
    if(n && n.link) App.go(n.link);
  });
  App.act("markAllRead", ()=>{
    S.get().notifications.forEach(n=>{ if(n.userId===App.state.user.id) n.read=true; });
    S.save(); App.state.bellOpen=false; App.render();
  });

  /* ---------- more pages ---------- */
  App.views.resMore = function(){
    const u=App.state.user;
    const items=[
      ["notices","/notices","notice","#F0E9F8","#6A3FA0"],
      ["bookings","/bookings","calendar","#FBF3E4","#C98A2D"],
      ["directory","/directory","users","#E8F0FB","#1565C0"],
      ["documents","/documents","docs","#E8F3E9","#2E7D32"],
      ["transparency","/transparency","pie","#E8F0FB","#1F3A5F"],
      ["polls","/polls","poll","#F0E9F8","#6A3FA0"],
      ["emergency","/emergency","alert","#FBEAEA","#C62828"],
      ["profile","/profile","user","#EEF1F5","#5E6C80"]
    ].filter(i=>!(u.role==="family" && ["bookings","directory","transparency","polls"].includes(i[0])));
    let html='<div class="page fade"><div class="page-head"><h1>'+App.t("moreOptions")+'</h1></div><div class="grid grid-2">';
    items.forEach(it=>{
      html+='<button class="facility-card" data-action="go" data-arg="'+it[1]+'"><div class="facility-cover" style="height:74px;background:'+it[3]+';color:'+it[4]+'">'+App.icon(it[2],30)+'</div><div class="fc-body" style="text-align:center"><div class="fc-name">'+App.t(it[0])+'</div></div></button>';
    });
    html+='</div></div>';
    return html;
  };
  App.views.admMore = function(){
    const items=[
      ["securitySec","/admin/security","shield"],["facilities","/admin/facilities","calendar"],["members","/admin/members","users"],
      ["expenses","/admin/expenses","wallet"],["documents","/documents","docs"],["transparency","/transparency","pie"],
      ["polls","/admin/polls","poll"],["emergency","/emergency","alert"],["settings","/admin/settings","gear"],["auditLog","/admin/audit","docs"],["profile","/profile","user"]
    ];
    let html='<div class="page fade"><div class="page-head"><h1>'+App.t("moreOptions")+'</h1></div><div class="grid grid-2">';
    items.forEach(it=>{
      html+='<button class="facility-card" data-action="go" data-arg="'+it[1]+'"><div class="facility-cover" style="height:74px;background:var(--navy)">'+App.icon(it[2],30)+'</div><div class="fc-body" style="text-align:center"><div class="fc-name">'+App.t(it[0])+'</div></div></button>';
    });
    html+='</div></div>';
    return html;
  };

  /* ---------- global bindings ---------- */
  function bindGlobal(){
    document.addEventListener("click", function(e){
      const el=e.target.closest("[data-action]");
      if(!el) return;
      const fn=App.actions[el.dataset.action];
      if(fn){ e.preventDefault(); fn(el, e); }
    });
    document.addEventListener("input", function(e){
      const id=e.target.id;
      if(id==="dirQ"){ App.state.tmp.dirQ=e.target.value; debounceRender(); }
      if(id==="memQ"){ App.state.tmp.memQ=e.target.value; debounceRender(); }
      if(id==="brMonth"){ App.state.tmp.billRunMonth=e.target.value; App.render(); }
      if(id==="trMonth"){ App.state.tmp.trMonth=e.target.value; App.render(); }
      if(id==="exMonth"){ App.state.tmp.exMonth=e.target.value; App.render(); }
      if(e.target.classList.contains("otp-box")){
        if(e.target.value && e.target.nextElementSibling && e.target.nextElementSibling.classList.contains("otp-box")) e.target.nextElementSibling.focus();
      }
    });
    document.addEventListener("change", function(e){
      if(e.target.dataset && e.target.dataset.pref){
        App.state.user.notifPrefs[e.target.dataset.pref]=e.target.checked;
        S.save();
      }
    });
    document.addEventListener("keydown", function(e){
      if(e.key==="Escape"){ App.closeModal(); App.state.bellOpen=false; App.state.profOpen=false; }
    });
  }
  let dbTimer=null;
  function debounceRender(){ clearTimeout(dbTimer); dbTimer=setTimeout(()=>App.render(),250); }

  /* ---------- post render hooks ---------- */
  function postRender(){
    // SOS slide
    const slide=document.getElementById("sosSlide");
    if(slide){
      const knob=document.getElementById("sosKnob");
      let dragging=false, moved=false;
      const maxX=()=> slide.clientWidth-knob.clientWidth-8;
      const reset=()=>{ knob.style.left="4px"; App.state.tmp.sosDone=false; };
      reset();
      const move=(clientX)=>{
        const rect=slide.getBoundingClientRect();
        let x=clientX-rect.left-knob.clientWidth/2;
        x=Math.max(4,Math.min(maxX(),x));
        knob.style.left=x+"px";
        if(x>=maxX()-6 && !App.state.tmp.sosDone){
          App.state.tmp.sosDone=true;
          triggerSos();
        }
      };
      slide.addEventListener("mousedown", e=>{ dragging=true; move(e.clientX); });
      window.addEventListener("mousemove", e=>{ if(dragging) move(e.clientX); });
      window.addEventListener("mouseup", ()=>{ dragging=false; if(!App.state.tmp.sosDone) reset(); });
      slide.addEventListener("touchstart", e=>{ dragging=true; move(e.touches[0].clientX); }, {passive:true});
      slide.addEventListener("touchmove", e=>{ if(dragging){ e.preventDefault(); move(e.touches[0].clientX); } }, {passive:false});
      slide.addEventListener("touchend", ()=>{ dragging=false; if(!App.state.tmp.sosDone) reset(); });
    }
    // focus first otp box
    if(App.state.login && App.state.login.step==="otp" && !App.state.user){
      const boxes=document.querySelectorAll(".otp-box");
      if(boxes.length && !document.activeElement.classList.contains("otp-box")) boxes[0].focus();
    }
  }

  function triggerSos(){
    const cats=[["medical",t("medical")],["fireCat",t("fireCat")],["securityAlert",t("securityAlert")]];
    App.modal('<div class="center"><div class="bold mb">'+t("sosCategory")+'</div><div style="display:flex;flex-direction:column;gap:9px">'+
      cats.map(c=>'<button class="btn btn-danger btn-lg btn-block" data-action="sosTrigger" data-id="'+c[0]+'">'+c[1]+'</button>').join("")+
      '<button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button></div></div>',{title:t("sosButton")});
  }
  App.act("sosTrigger", el=>{
    const u=App.state.user;
    const alert=S.sos(u.id, el.dataset.id);
    const f=S.flatOf(u.id);
    const targets=S.get().users.filter(x=>x.role==="guard"||x.role==="admin").map(x=>x.id);
    S.notify(targets,"sos","🚨 SOS: "+u.name+" ("+(f?S.flatKey(f):"")+")", t(el.dataset.id==="medical"?"medical":el.dataset.id==="fireCat"?"fireCat":"securityAlert"), "/guard");
    S.log(u.name,"sos.trigger", (f?S.flatKey(f):"")+" — "+el.dataset.id);
    S.save();
    App.closeModal(); App.render();
    App.toast(t("sosSent")+" 🚨","error");
  });
})();

/* boot */
if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", function(){ App.init(); });
} else {
  App.init();
}
