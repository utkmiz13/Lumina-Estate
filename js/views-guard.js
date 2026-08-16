/* Lumina Estate — Guard (VMS) + Staff views */
window.App = window.App || {};
App.views = App.views || {};
App.act = App.act || function(name, fn){ App.actions = App.actions||{}; App.actions[name]=fn; };

(function(){
  const t=(k)=>App.t(k);
  const S=Store;

  function catIcon(c){
    const m={guest:"user", delivery:"delivery", cab:"taxi", daily_staff:"hand", service:"wrench"};
    return App.icon(m[c]||"user",20);
  }
  function catColor(c){
    const m={guest:"#1F3A5F", delivery:"#C98A2D", cab:"#1565C0", daily_staff:"#2E7D32", service:"#6A3FA0"};
    return m[c]||"#5E6C80";
  }
  function catLabel(c){
    const m={guest:"guest", delivery:"delivery", cab:"cab", daily_staff:"dailyStaff", service:"serviceVendor"};
    return t(m[c]||"guest");
  }

  /* ================= GUARD HOME ================= */
  App.views.grdHome = function(){
    const st=S.get(), u=App.state.user;
    const today=App.todayStr();
    const todayEntries=st.visitors.filter(v=>new Date(v.inAt).toDateString()===new Date().toDateString());
    const expected=st.preApprovals.filter(pa=>!pa.used && new Date(pa.date).toDateString()===new Date().toDateString());
    const pendingApprovals=todayEntries.filter(v=>v.approval==="pending" && !v.outAt);
    const pendingExits=st.visitors.filter(v=>!v.outAt && new Date(v.inAt).toDateString()!==new Date().toDateString());
    const activeSos=st.sosAlerts? st.sosAlerts.filter(a=>a.status==="active"):[];

    let html='<div class="page fade"><div class="guard-hero"><h2>'+t("goodMorning")+", "+App.esc(u.name.split(" ")[0])+' 👮</h2><p>'+t("guardDashSub")+' · '+App.fmtDate(new Date().toISOString())+'</p>'+
      '<div class="mt"><button class="giant-btn" data-action="go" data-arg="/guard/entry">'+App.icon("camera",26)+t("newEntry")+'</button></div>'+
      '<div style="display:flex;gap:10px;margin-top:10px">'+
      '<button class="btn" style="flex:1;background:rgba(255,255,255,.14);color:#fff" data-action="go" data-arg="/guard/verify">'+App.icon("key",18)+t("verifyCode")+'</button>'+
      '<button class="btn" style="flex:1;background:rgba(255,255,255,.14);color:#fff" data-action="go" data-arg="/guard/logs">'+App.icon("docs",18)+t("gateLog")+'</button></div></div>';

    if(activeSos.length){
      activeSos.forEach(a=>{
        html+='<div class="sos-alert"><span class="sa-ic">'+App.icon("sos",22)+'</span><div class="grow"><div class="bold">🚨 '+App.esc(a.name)+' · '+App.esc(a.flat)+'</div><div class="small">'+t(a.category==="medical"?"medical":a.category==="fireCat"?"fireCat":"securityAlert")+' · '+App.fmtTime(a.at)+'</div></div>'+
          '<button class="btn btn-danger btn-sm" data-action="sosRespond" data-id="'+a.id+'">'+t("responding")+'</button></div>';
      });
    }

    html+='<div class="grid grid-3">'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--blue)">'+expected.length+'</div><div class="stat-label">'+t("expectedToday")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--amber)">'+pendingApprovals.length+'</div><div class="stat-label">'+t("pendingApprovals")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--green)">'+todayEntries.filter(v=>!v.outAt).length+'</div><div class="stat-label">'+t("stillInside")+'</div></div></div>';

    html+='<div class="card"><div class="card-title">'+t("expectedToday")+'</div>';
    if(!expected.length) html+=App.empty("noVisitors","emptyMsg");
    expected.forEach(pa=>{
      const f=S.flatById(pa.flatId);
      html+='<div class="list-row"><span class="thumb" style="background:var(--blue-bg);color:var(--blue)">'+catIcon(pa.type)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(pa.name)+'</div><div class="s">'+App.esc(S.flatKey(f))+' · '+App.esc(pa.window)+' · '+t("entryCode")+': <b>'+pa.code+'</b></div></div>'+
        '<span class="chip chip-blue">'+t("preApprovals")+'</span></div>';
    });
    html+='</div>';

    if(pendingApprovals.length){
      html+='<div class="card" style="border:1.5px solid var(--amber)"><div class="card-title">⏳ '+t("waitingApproval")+'</div>';
      pendingApprovals.forEach(v=>{
        html+='<div class="list-row">'+(v.photo?'<span class="thumb"><img src="'+v.photo+'"></span>':'<span class="thumb">'+App.icon("user",20)+'</span>')+
          '<div class="grow"><div class="t">'+App.esc(v.name)+'</div><div class="s">'+v.flatIds.map(id=>S.flatKey(S.flatById(id))).join(", ")+' · '+App.fmtTime(v.inAt)+'</div></div>'+
          '<span class="chip chip-amber">'+t("pending")+'</span></div>';
      });
      html+='<div class="small muted mt">💡 '+t("demoGuidesMsg")+'</div></div>';
    }

    if(pendingExits.length){
      html+='<div class="card" style="border:1.5px solid var(--red)"><div class="card-title">'+t("pendingExits")+' ('+pendingExits.length+')</div>';
      pendingExits.slice(0,5).forEach(v=>{
        html+='<div class="list-row"><span class="thumb" style="background:var(--red-bg);color:var(--red)">'+catIcon(v.category)+'</span>'+
          '<div class="grow"><div class="t">'+App.esc(v.name)+'</div><div class="s">'+t("loggedAt")+": "+App.fmtDateTime(v.inAt)+'</div></div>'+
          '<button class="btn btn-success btn-sm" data-action="markOut" data-id="'+v.id+'">'+t("markOut")+'</button></div>';
      });
      html+='</div>';
    }

    html+='<div class="card"><div class="card-title">'+t("todayEntries")+' ('+todayEntries.length+')</div>';
    todayEntries.slice(0,10).forEach(v=>{
      html+='<div class="list-row">'+(v.photo?'<span class="thumb"><img src="'+v.photo+'"></span>':'<span class="thumb" style="background:'+catColor(v.category)+'20;color:'+catColor(v.category)+'">'+catIcon(v.category)+'</span>')+
        '<div class="grow"><div class="t">'+App.esc(v.name)+'</div><div class="s">'+catLabel(v.category)+' · '+v.flatIds.map(id=>S.flatKey(S.flatById(id))).join(", ")+' · '+App.fmtTime(v.inAt)+'</div></div>'+
        (v.outAt? App.chip("approved"): '<button class="btn btn-ghost btn-sm" data-action="markOut" data-id="'+v.id+'">'+t("markOut")+'</button>')+'</div>';
    });
    html+='</div></div>';
    return html;
  };

  App.act("sosRespond", el=>{
    S.sosRespond(el.dataset.id, App.state.user.name);
    const a=S.get().sosAlerts.find(x=>x.id===el.dataset.id);
    S.notify(a.userId,"sos",t("guardResponding")+": "+App.state.user.name, App.fmtTime(S.nowIso()),"/emergency");
    S.log(App.state.user.name,"sos.respond", a.flat);
    S.save(); App.render(); App.toast(t("responding")+" ✓","success");
  });
  App.act("markOut", el=>{
    S.exitVisitor(el.dataset.id);
    S.log(App.state.user.name,"visitor.exit","Entry "+el.dataset.id+" marked OUT");
    S.save(); App.render(); App.toast(t("gatedOut")+" ✓","success");
  });

  /* ================= GUARD NEW ENTRY ================= */
  App.views.grdEntry = function(){
    const tmp=App.state.tmp;
    const step=tmp.geStep||1;
    const cats=[["guest","guest","user"],["delivery","delivery","delivery"],["cab","cab","taxi"],["daily_staff","dailyStaff","hand"],["service","serviceVendor","wrench"]];
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/guard">'+App.icon("back",18)+'</button><h1>'+t("newEntry")+'</h1></div>';
    html+='<div class="stepper">'+
      '<div class="step '+(step===1?"active":"done")+'"><span class="sn">1</span>'+t("visitorType")+'</div><div class="step-line"></div>'+
      '<div class="step '+(step===2?"active":(step===3?"done":""))+'"><span class="sn">2</span>'+t("takePhoto")+'</div><div class="step-line"></div>'+
      '<div class="step '+(step===3?"active":"")+'"><span class="sn">3</span>'+t("flatNo")+'</div></div>';

    if(step===1){
      html+='<div class="card"><div class="cat-grid" style="grid-template-columns:repeat(2,1fr)">';
      cats.forEach(c=>{
        html+='<button class="cat-item '+(tmp.geCat===c[1]?"sel":"")+'" data-action="setGeCat" data-id="'+c[1]+'" style="color:'+catColor(c[1])+';padding:16px 8px">'+App.icon(c[2],28)+'<span style="font-size:13px">'+t(c[0])+'</span></button>';
      });
      html+='</div><button class="btn btn-primary btn-lg btn-block mt" data-action="geNext" data-id="2">'+t("takePhoto")+' →</button></div>';
    } else if(step===2){
      const ph=tmp.photos&&tmp.photos.ge;
      html+='<div class="card center">'+
        (ph?'<div style="margin:0 auto 12px;width:150px;height:150px;border-radius:16px;overflow:hidden"><img src="'+ph+'" style="width:100%;height:100%;object-fit:cover"></div>':'<div class="empty ei" style="margin:0 auto 12px;width:120px;height:120px;border-radius:24px">'+App.icon("user",44)+'</div>')+
        '<button class="btn btn-gold btn-lg" data-action="capture" data-id="ge">'+App.icon("camera",19)+t(ph?"retake":"takePhoto")+'</button>'+
        '<div class="small muted mt">'+(ph? "✓ "+t("fileAdded"): t("photoOptional"))+'</div></div>'+
        '<div class="card"><div class="field"><label>'+t("visitorName")+'</label><input class="inp" id="geName" placeholder="Amit Kumar"></div></div>'+
        '<div style="display:flex;gap:10px"><button class="btn btn-ghost" style="flex:1" data-action="geNext" data-id="1">← '+t("back")+'</button><button class="btn btn-primary" style="flex:1" data-action="geNext" data-id="3">'+t("flatNo")+' →</button></div>';
    } else if(step===3){
      const typed=tmp.geFlat||"";
      const matches=S.get().flats.filter(f=>f.occupancy==="occupied" && (S.flatKey(f).replace("-","")).includes(typed)).slice(0,6);
      html+='<div class="card"><div class="num-display">'+(typed||t("enterFlat"))+'</div><div class="numpad">';
      [1,2,3,4,5,6,7,8,9,"C",0,"⌫"].forEach(k=>{
        html+='<button class="num-key" data-action="geKey" data-id="'+k+'">'+k+'</button>';
      });
      html+='</div>';
      if(matches.length){
        html+='<div class="sugg-row">'+matches.map(f=>'<button class="sugg" data-action="gePickFlat" data-id="'+S.flatKey(f)+'">'+App.esc(S.flatKey(f))+'</button>').join("")+'</div>';
      }
      html+='</div>';
      const flatId=typed? S.get().flats.find(f=>f.occupancy==="occupied" && S.flatKey(f).replace("-","")===typed):null;
      html+='<div style="display:flex;gap:10px"><button class="btn btn-ghost" style="flex:1" data-action="geNext" data-id="2">← '+t("back")+'</button>'+
        '<button class="btn btn-gold btn-lg" style="flex:2" data-action="geSubmit" '+(flatId?"":"disabled")+'>'+App.icon("send",18)+t("sendApproval")+'</button></div>';
      if(flatId){
        const residents=S.residentsOfFlat(flatId);
        html+='<div class="small muted center mt">→ '+t("flatNo")+" "+App.esc(S.flatKey(S.flatById(flatId)))+" · "+(residents[0]?App.esc(residents[0].user.name):"")+'</div>';
      }
    }
    html+='</div>';
    return html;
  };
  App.act("setGeCat", el=>{ App.state.tmp.geCat=el.dataset.id; App.render(); });
  App.act("geNext", el=>{ App.state.tmp.geStep=Number(el.dataset.id); App.render(); });
  App.act("geKey", el=>{
    const k=el.dataset.id; const cur=App.state.tmp.geFlat||"";
    if(k==="⌫") App.state.tmp.geFlat=cur.slice(0,-1);
    else if(k==="C") App.state.tmp.geFlat="";
    else if(cur.length<4) App.state.tmp.geFlat=cur+k;
    App.render();
  });
  App.act("gePickFlat", el=>{ App.state.tmp.geFlat=el.dataset.id.replace("-",""); App.render(); });
  App.act("geSubmit", ()=>{
    const tmp=App.state.tmp;
    const flatId=S.get().flats.find(f=>f.occupancy==="occupied" && S.flatKey(f).replace("-","")===tmp.geFlat);
    if(!flatId) return;
    const cat=tmp.geCat||"guest";
    const name=(document.getElementById("geName")||{}).value||catLabel(cat);
    const v=S.guardEntry({name:name.trim()||catLabel(cat), category:cat, flatIds:[flatId], approval: cat==="delivery"?"notified":"pending",
      note: cat==="delivery"? "Delivery quick-mode":(cat==="daily_staff"?"Daily pass":"Walk-in — approval required"), guardId:App.state.user.id,
      photo:tmp.photos&&tmp.photos.ge});
    const f=S.flatById(flatId);
    const recipients=S.residenciesOfFlat(flatId).map(r=>r.userId);
    S.notify(recipients, "gate", v.name+" "+t("atGate"), t("wantsEntry")+" — "+S.flatKey(f), "/gate");
    S.log(App.state.user.name,"visitor.entry", v.name+" — "+S.flatKey(f)+" ("+cat+")");
    S.save();
    tmp.geStep=1; tmp.geFlat=""; if(tmp.photos) delete tmp.photos.ge;
    App.toast(t("entryLogged")+" ✓","success");
    if(cat!=="delivery"){
      App.modal('<div class="center"><div class="pending-illus">'+App.icon("clock",40)+'</div><div class="bold" style="font-size:16px">'+t("waitingApproval")+'</div>'+
        '<div class="small muted mt">'+App.esc(v.name)+' · '+App.esc(S.flatKey(f))+'</div>'+
        '<div class="small mt" style="background:var(--amber-bg);border-radius:9px;padding:8px">💡 '+t("demoGuidesMsg")+'</div></div>',{title:t("approveRequest")});
    } else {
      App.toast(t("deliveryLogged")+" ✓","success");
    }
    App.go("/guard");
  });

  /* ================= GUARD VERIFY CODE ================= */
  App.views.grdVerify = function(){
    const tmp=App.state.tmp;
    const typed=tmp.geCode||"";
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/guard">'+App.icon("back",18)+'</button><h1>'+t("verifyCode")+'</h1></div>';
    html+='<div class="card"><div class="code-display" style="background:var(--grey-bg);color:var(--text)"><span class="cd">'+(typed||"••••••")+'</span></div><div class="numpad">';
    [1,2,3,4,5,6,7,8,9,"C",0,"⌫"].forEach(k=>{ html+='<button class="num-key" data-action="geCodeKey" data-id="'+k+'">'+k+'</button>'; });
    html+='</div>';
    html+='<button class="btn btn-gold btn-lg btn-block mt" data-action="geVerifySubmit" '+(typed.length===6?"":"disabled")+'>'+App.icon("key",18)+t("verifyCode")+'</button></div>';
    html+='<div class="card"><div class="card-title">'+t("expectedToday")+'</div>';
    const expected=S.get().preApprovals.filter(pa=>!pa.used);
    if(!expected.length) html+=App.empty("noVisitors","emptyMsg");
    expected.forEach(pa=>{
      const f=S.flatById(pa.flatId);
      html+='<div class="list-row"><span class="thumb" style="background:var(--blue-bg);color:var(--blue)">'+catIcon(pa.type)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(pa.name)+'</div><div class="s">'+App.esc(S.flatKey(f))+' · '+App.fmtDate(pa.date)+' '+App.esc(pa.window)+'</div></div>'+
        '<button class="btn btn-ghost btn-sm" data-action="geUseCode" data-id="'+pa.code+'">'+pa.code+'</button></div>';
    });
    html+='</div></div>';
    return html;
  };
  App.act("geCodeKey", el=>{
    const k=el.dataset.id; const cur=App.state.tmp.geCode||"";
    if(k==="⌫") App.state.tmp.geCode=cur.slice(0,-1);
    else if(k==="C") App.state.tmp.geCode="";
    else if(cur.length<6) App.state.tmp.geCode=cur+k;
    App.render();
  });
  App.act("geUseCode", el=>{ App.state.tmp.geCode=el.dataset.id; App.render(); });
  App.act("geVerifySubmit", ()=>{
    const code=App.state.tmp.geCode;
    const r=S.verifyCode(code, App.state.user.id);
    if(!r){
      App.state.tmp.geCode="";
      App.toast(t("codeInvalid"),"error"); App.render();
      return;
    }
    if(r.expired){ App.toast(t("codeInvalid"),"error"); return; }
    const f=S.flatById(r.visitor.flatIds[0]);
    S.notify(S.residenciesOfFlat(f.id).map(x=>x.userId),"gate",t("visitorArrived")+": "+r.pa.name, S.flatKey(f),"/gate");
    S.log(App.state.user.name,"visitor.verify", r.pa.name+" — code "+code+" — "+S.flatKey(f));
    S.save();
    App.state.tmp.geCode="";
    App.modal('<div class="pay-success"><div class="check" style="background:var(--green-bg)">'+App.icon("check",36)+'</div><div class="bold" style="font-size:16px;color:var(--green)">'+t("codeVerified")+'</div>'+
      '<div class="small muted mt">'+App.esc(r.pa.name)+' · '+App.esc(S.flatKey(f))+'</div></div>',{title:t("verifyCode"),closeable:false});
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-primary" data-action="modalClose">'+t("done")+'</button></div>');
    App.go("/guard");
  });

  /* ================= GUARD LOGS ================= */
  App.views.grdLogs = function(){
    const st=S.get();
    const today=st.visitors.filter(v=>new Date(v.inAt).toDateString()===new Date().toDateString());
    const older=st.visitors.filter(v=>new Date(v.inAt).toDateString()!==new Date().toDateString());
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/guard">'+App.icon("back",18)+'</button><h1>'+t("gateLog")+'</h1></div>';
    html+='<div class="card"><div class="card-title">'+t("today")+' ('+today.length+')</div>';
    if(!today.length) html+=App.empty("noVisitors","emptyMsg");
    today.forEach(v=>{
      html+='<div class="list-row">'+(v.photo?'<span class="thumb"><img src="'+v.photo+'"></span>':'<span class="thumb" style="background:'+catColor(v.category)+'20;color:'+catColor(v.category)+'">'+catIcon(v.category)+'</span>')+
        '<div class="grow"><div class="t">'+App.esc(v.name)+'</div><div class="s">'+catLabel(v.category)+' · '+v.flatIds.map(id=>S.flatKey(S.flatById(id))).join(", ")+'</div></div>'+
        '<div style="text-align:right"><div class="small">'+App.fmtTime(v.inAt)+(v.outAt? " → "+App.fmtTime(v.outAt):"")+'</div>'+App.chip(v.approval)+'</div></div>';
    });
    html+='</div>';
    if(older.length){
      html+='<div class="card"><div class="card-title">'+t("visitorHistory")+'</div>';
      older.slice(0,12).forEach(v=>{
        html+='<div class="list-row"><span class="thumb" style="background:'+catColor(v.category)+'20;color:'+catColor(v.category)+'">'+catIcon(v.category)+'</span>'+
          '<div class="grow"><div class="t">'+App.esc(v.name)+'</div><div class="s">'+catLabel(v.category)+' · '+v.flatIds.map(id=>S.flatKey(S.flatById(id))).join(", ")+'</div></div>'+
          '<div style="text-align:right"><div class="small">'+App.fmtDateTime(v.inAt)+'</div>'+App.chip(v.approval)+'</div></div>';
      });
      html+='</div>';
    }
    html+='</div>';
    return html;
  };

  /* ================= STAFF ================= */
  App.views.stfHome = function(){
    const st=S.get(), u=App.state.user;
    const mine=st.complaints.filter(c=>c.assigneeId && st.staffMembers.find(s=>s.id===c.assigneeId && s.name===u.name));
    const active=mine.filter(c=>c.status==="assigned"||c.status==="in_progress");
    const done=mine.filter(c=>c.status==="resolved"||c.status==="closed");
    let html='<div class="page fade"><div class="page-head"><h1>'+t("staffHome")+'</h1></div>';
    html+='<div class="guard-hero" style="background:linear-gradient(135deg,#2E7D32,#4CAF50)"><h2>'+t("goodMorning")+", "+App.esc(u.name.split(" ")[0])+' 🧹</h2><p>'+t("staffDashSub")+'</p></div>';
    html+='<div class="grid grid-2">'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--amber)">'+active.length+'</div><div class="stat-label">'+t("myTasks")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--green)">'+done.length+'</div><div class="stat-label">'+t("resolved")+'</div></div></div>';
    html+='<div class="card"><div class="card-title">'+t("myTasks")+'</div>';
    if(!active.length) html+=App.empty("allCaughtUp","emptyMsg");
    active.forEach(c=>{
      const breach=new Date(c.slaDueAt)<new Date();
      html+='<div class="list-row" data-action="go" data-arg="/staff/complaint/'+c.id+'"><span class="thumb" style="background:'+(breach?"var(--red-bg)":"var(--blue-bg)")+';color:'+(breach?"var(--red)":"var(--blue)")+'">'+catIcon(c.category)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(c.title)+'</div><div class="s">'+App.esc(c.ticketNo)+' · '+(c.community?t("commonAreaOnly"):App.esc(S.flatKey(S.flatById(c.flatId))))+'</div></div>'+
        (breach?'<span class="chip chip-red">'+t("slaBreach")+'</span>':App.chip(c.status))+'</div>';
    });
    html+='</div>';
    if(done.length){
      html+='<div class="card"><div class="card-title">'+t("resolved")+'</div>';
      done.slice(0,5).forEach(c=>{
        html+='<div class="list-row" data-action="go" data-arg="/staff/complaint/'+c.id+'"><span class="thumb" style="background:var(--green-bg);color:var(--green)">'+App.icon("check",19)+'</span>'+
          '<div class="grow"><div class="t">'+App.esc(c.title)+'</div><div class="s">'+(c.rating?"★"+c.rating+" · ":"")+App.relTime(c.resolvedAt)+'</div></div>'+App.chip(c.status)+'</div>';
      });
      html+='</div>';
    }
    html+='</div>';
    return html;
  };

  App.views.stfComplaint = function(p){
    const st=S.get(), c=st.complaints.find(x=>x.id===p.id);
    if(!c) return App.notFoundView();
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/staff">'+App.icon("back",18)+'</button><h1>'+App.esc(c.ticketNo)+'</h1><span class="spacer"></span>'+App.chip(c.status)+'</div>';
    html+='<div class="card"><div class="card-title" style="font-size:16px">'+App.esc(c.title)+'</div>'+
      '<div class="small muted mb">'+catLabel(c.category)+' · '+(c.community?t("commonAreaOnly"):App.esc(S.flatKey(S.flatById(c.flatId))))+' · '+App.fmtDateTime(c.createdAt)+'</div>'+
      '<div style="font-size:14.5px">'+App.esc(c.desc)+'</div>';
    if(c.photos&&c.photos.length) html+='<div style="display:flex;gap:9px;margin-top:10px">'+c.photos.map(ph=>'<img src="'+ph+'" style="width:100px;height:100px;object-fit:cover;border-radius:10px">').join("")+'</div>';
    html+='</div>';
    if(c.status==="assigned"){
      html+='<button class="btn btn-primary btn-lg btn-block mb" data-action="startWork" data-id="'+c.id+'">'+App.icon("wrench",19)+t("startWork")+'</button>';
    } else if(c.status==="in_progress"){
      const ph=App.state.tmp.photos&&App.state.tmp.photos.stf;
      html+='<div class="card"><div class="card-title">'+t("photoProof")+'</div><div class="photo-pick" style="justify-content:center">'+
        (ph?'<span class="photo-box"><img src="'+ph+'"><span class="rm" data-action="clearPhoto" data-id="stf">×</span></span>':'<button class="photo-box" data-action="capture" data-id="stf">'+App.icon("camera",20)+'<span>'+t("addPhoto")+'</span></button>')+'</div></div>';
      html+='<button class="btn btn-success btn-lg btn-block" data-action="doneWork" data-id="'+c.id+'">'+App.icon("check",19)+t("markDone")+'</button>';
    }
    html+='<div class="card mt"><div class="card-title">'+t("statusTimeline")+'</div><div class="timeline">';
    c.timeline.forEach(ev=>{
      html+='<div class="t-item '+(c.status===ev.status?"now":"done")+'"><span class="t-dot"></span><div class="tt">'+t(ev.status)+'</div><div class="td">'+App.fmtDateTime(ev.at)+'</div>'+(ev.note?'<div class="tn">'+App.esc(ev.note)+'</div>':"")+'</div>';
    });
    html+='</div></div></div>';
    return html;
  };
  App.act("startWork", el=>{
    S.progressComplaint(el.dataset.id);
    const c=S.get().complaints.find(x=>x.id===el.dataset.id);
    if(c.flatId) S.notify(S.residenciesOfFlat(c.flatId).map(r=>r.userId),"complaint",t("workStarted")+": "+c.ticketNo,"","/complaints");
    S.log(App.state.user.name,"complaint.progress", c.ticketNo);
    S.save(); App.render(); App.toast(t("workStarted")+" ✓","success");
  });
  App.act("doneWork", el=>{
    const ph=App.state.tmp.photos&&App.state.tmp.photos.stf;
    S.resolveComplaint(el.dataset.id, "Resolved with photo proof by "+App.state.user.name, ph);
    const c=S.get().complaints.find(x=>x.id===el.dataset.id);
    if(c.flatId) S.notify(S.residenciesOfFlat(c.flatId).map(r=>r.userId),"check",t("workDone")+": "+c.ticketNo, t("confirmResolve"),"/complaint/"+c.id);
    else if(c.createdBy) S.notify(c.createdBy,"check",t("workDone")+": "+c.ticketNo, t("confirmResolve"),"/complaint/"+c.id);
    S.log(App.state.user.name,"complaint.resolve", c.ticketNo+(ph?" (photo)":""));
    S.save();
    if(App.state.tmp.photos) delete App.state.tmp.photos.stf;
    App.render(); App.toast(t("workDone")+" ✓","success");
  });

  function catIcon(c){
    const m={plumbing:"drop", electrical:"zap", lift:"lift", housekeeping:"broom", security:"shield", civil:"wrench",
      commonArea:"plant", other:"info", maintenance:"wrench", guest:"user", delivery:"delivery", cab:"taxi",
      daily_staff:"hand", service:"wrench"};
    return App.icon(m[c]||"info",20);
  }
  function catLabel(c){
    const m={plumbing:"plumbing", electrical:"electrical", lift:"lift", housekeeping:"housekeeping", security:"securityCat",
      civil:"civil", commonArea:"commonArea", other:"other", maintenance:"maintenance", guest:"guest", delivery:"delivery",
      cab:"cab", daily_staff:"dailyStaff", service:"serviceVendor"};
    return t(m[c]||c);
  }
})();
