/* Lumina Estate — Admin views (society admin / committee) */
window.App = window.App || {};
App.views = App.views || {};
App.act = App.act || function(name, fn){ App.actions = App.actions||{}; App.actions[name]=fn; };

(function(){
  const t=(k)=>App.t(k);
  const S=Store;

  /* ================= ADMIN DASHBOARD ================= */
  App.views.admHome = function(){
    const st=S.get(), u=App.state.user;
    const month=S.nowMonth();
    const coll=S.collectionsByPeriod(month);
    const pct=coll.billed? Math.round(coll.collected/coll.billed*100):0;
    const def=S.defaultersList();
    const openC=st.complaints.filter(c=>c.status==="open"||c.status==="assigned"||c.status==="in_progress");
    const slaRisk=openC.filter(c=>new Date(c.slaDueAt)<new Date());
    const pendingUsers=st.users.filter(x=>x.status==="pending");
    const pendingBks=st.bookings.filter(b=>b.status==="pending_approval");
    const todayVis=st.visitors.filter(v=>new Date(v.inAt).toDateString()===new Date().toDateString()).length;
    const lastNotice=st.notices[0];
    const readRate=lastNotice? Math.round(lastNotice.readBy.length/ Math.max(1,st.residencies.length)*100):0;
    const sosActive=st.sosAlerts? st.sosAlerts.filter(a=>a.status==="active").length:0;

    let html='<div class="page fade"><div class="page-head"><div><h1>'+t("hello")+", "+App.esc(u.name.split(" ")[0])+' 👋</h1><div class="sub">'+t("adminDashSub")+'</div></div></div>';

    if(sosActive){
      html+='<div class="sos-alert"><span class="sa-ic">'+App.icon("sos",22)+'</span><div><div class="bold">'+sosActive+' '+t("sosActive")+'</div><div class="small">'+t("guardResponding")+'</div></div><button class="btn btn-danger btn-sm" data-action="go" data-arg="/emergency">'+t("viewDetails")+'</button></div>';
    }

    // Collection ring
    html+='<div class="card"><div class="card-title">'+t("collectionProgress")+' — '+t("months")[Number(month.split("-")[1])-1]+' '+month.split("-")[0]+'</div>';
    html+='<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">';
    html+='<div class="ring" style="background:conic-gradient(var(--green) '+pct+'%, var(--grey-bg) 0)"><div class="rl"><div class="rv">'+pct+'%</div><div class="rlb">'+t("collected")+'</div></div></div>';
    html+='<div class="legend" style="flex:1;min-width:200px">'+
      '<div class="legend-row"><span class="dot" style="background:var(--green)"></span><span>'+t("collected")+'</span><span class="lv">'+App.fmt(coll.collected)+'</span></div>'+
      '<div class="legend-row"><span class="dot" style="background:var(--grey)"></span><span>'+t("billed")+'</span><span class="lv">'+App.fmt(coll.billed)+'</span></div>'+
      '<div class="legend-row"><span class="dot" style="background:var(--red)"></span><span>'+t("outstanding")+'</span><span class="lv">'+App.fmt(coll.outstanding)+'</span></div></div>';
    html+='<div style="flex:1;min-width:220px"><button class="btn btn-primary btn-block mb" data-action="go" data-arg="/admin/billrun">'+App.icon("bill",16)+t("generateBills")+'</button>'+
      '<button class="btn btn-ghost btn-block" data-action="go" data-arg="/admin/reports">'+App.icon("pie",16)+t("reports")+'</button></div>';
    html+='</div></div>';

    // Stat tiles
    html+='<div class="grid grid-4">'+
      '<div class="stat-tile" data-action="go" data-arg="/admin/defaulters" style="cursor:pointer"><div class="stat-value" style="color:var(--red)">'+def.length+'</div><div class="stat-label">'+t("topDefaulters")+'</div></div>'+
      '<div class="stat-tile" data-action="go" data-arg="/admin/helpdesk" style="cursor:pointer"><div class="stat-value" style="color:'+(slaRisk.length?"var(--amber)":"var(--green)")+'">'+openC.length+'</div><div class="stat-label">'+t("openComplaints")+(slaRisk.length?" ("+slaRisk.length+" "+t("slaRisk")+")":"")+'</div></div>'+
      '<div class="stat-tile" data-action="go" data-arg="/admin/security" style="cursor:pointer"><div class="stat-value">'+todayVis+'</div><div class="stat-label">'+t("todayVisitors")+'</div></div>'+
      '<div class="stat-tile" data-action="go" data-arg="/admin/approvals" style="cursor:pointer"><div class="stat-value" style="color:'+(pendingUsers.length?"var(--amber)":"var(--green)")+'">'+pendingUsers.length+'</div><div class="stat-label">'+t("pendingRequests")+'</div></div></div>';

    // Quick actions
    const qa=[
      ["bill","#E8F0FB","#1565C0","generateBills","/admin/billrun"],
      ["notice","#F0E9F8","#6A3FA0","publishNotice","/admin/notices/new"],
      ["wallet","#E8F3E9","#2E7D32","manualEntry","/admin/manual"],
      ["complaint","#FBEAEA","#C62828","complaintQueue","/admin/helpdesk"],
      ["calendar","#FBF3E4","#C98A2D","pendingBookings","/admin/facilities"],
      ["sos","#FBEAEA","#C62828","sos","/emergency"]
    ];
    html+='<div class="card card-pad-sm"><div class="card-title">'+t("quickActions")+'</div><div class="quick-grid">';
    qa.forEach(q=>{ html+='<button class="quick-item" data-action="go" data-arg="'+q[4]+'"><span class="qico" style="background:'+q[1]+';color:'+q[2]+'">'+App.icon(q[0],21)+'</span>'+t(q[3])+'</button>'; });
    html+='</div></div>';

    html+='<div class="grid grid-2">';
    // Defaulter list
    html+='<div class="card"><div class="card-title">'+t("topDefaulters")+'<span class="link" data-action="go" data-arg="/admin/defaulters">'+t("viewAll")+' →</span></div>';
    if(!def.length) html+=App.empty("allCaughtUp","emptyMsg");
    def.slice(0,4).forEach(d=>{
      html+='<div class="list-row" data-action="go" data-arg="/admin/defaulters"><span class="thumb" style="background:var(--red-bg);color:var(--red)">'+App.icon("bill",19)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(S.flatKey(d.flat))+' — '+(d.residents[0]?App.esc(d.residents[0].user.name):"")+'</div><div class="s">'+d.days+' '+t("daysOverdue")+' · '+d.bills+' '+t("ofFlats")+'</div></div><span class="bold" style="color:var(--red)">'+App.fmt(d.due)+'</span></div>';
    });
    html+='</div>';
    // Complaints
    html+='<div class="card"><div class="card-title">'+t("openComplaints")+'<span class="link" data-action="go" data-arg="/admin/helpdesk">'+t("viewAll")+' →</span></div>';
    if(!openC.length) html+=App.empty("noComplaints","emptyMsg");
    openC.slice(0,4).forEach(c=>{
      const breach=new Date(c.slaDueAt)<new Date();
      html+='<div class="list-row" data-action="go" data-arg="/admin/complaint/'+c.id+'"><span class="thumb" style="background:'+(breach?"var(--red-bg)":"var(--blue-bg)")+';color:'+(breach?"var(--red)":"var(--blue)")+'">'+App.icon(breach?"clock":"complaint",19)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(c.title)+'</div><div class="s">'+App.esc(c.ticketNo)+' · '+(c.assigneeId?"✓ ":"")+App.relTime(c.createdAt)+'</div></div>'+App.chip(c.status)+'</div>';
    });
    html+='</div>';
    // Pending bookings
    html+='<div class="card"><div class="card-title">'+t("pendingBookings")+'<span class="link" data-action="go" data-arg="/admin/facilities">'+t("viewAll")+' →</span></div>';
    if(!pendingBks.length) html+=App.empty("emptyTitle","emptyMsg");
    pendingBks.slice(0,3).forEach(b=>{
      const fa=st.facilities.find(x=>x.id===b.facilityId);
      html+='<div class="list-row" data-action="go" data-arg="/admin/facilities"><span class="thumb" style="background:var(--amber-bg);color:var(--amber)">'+App.icon("calendar",19)+'</span>'+
        '<div class="grow"><div class="t">'+t(fa.nameKey)+'</div><div class="s">'+App.fmtDate(b.date)+' · '+App.esc(b.slot)+'</div></div>'+App.chip("pending_approval")+'</div>';
    });
    html+='</div>';
    // Notice engagement
    html+='<div class="card"><div class="card-title">'+t("noticeEngagement")+'</div>';
    if(lastNotice){
      html+='<div class="small muted mb">'+t("lastNotice")+': “'+App.esc(lastNotice.title.slice(0,60))+'…”</div>';
      html+='<div class="bar-row"><span class="bl">'+t("readRate")+'</span><div class="bar"><div class="fill" style="width:'+readRate+'%"></div></div><span class="bv">'+readRate+'%</span></div>';
    } else html+=App.empty("noNotices","emptyMsg");
    html+='</div></div></div>';
    return html;
  };

  /* ================= FINANCE ================= */
  App.views.admFinance = function(){
    const st=S.get(), month=S.nowMonth();
    const coll=S.collectionsByPeriod(month);
    let html='<div class="page fade"><div class="page-head"><h1>'+t("finance")+'</h1><span class="spacer"></span>'+
      '<button class="btn btn-primary btn-sm" data-action="go" data-arg="/admin/billrun">'+App.icon("bill",15)+t("generateBills")+'</button>'+
      '<button class="btn btn-ghost btn-sm" data-action="go" data-arg="/admin/manual">'+App.icon("wallet",15)+t("manualEntry")+'</button></div>';
    html+='<div class="grid grid-3">'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--green)">'+App.fmt(coll.collected)+'</div><div class="stat-label">'+t("collected")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value">'+App.fmt(coll.billed)+'</div><div class="stat-label">'+t("billed")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--red)">'+App.fmt(coll.outstanding)+'</div><div class="stat-label">'+t("outstanding")+'</div></div></div>';
    html+='<div class="card"><div class="card-title">'+t("billingStructure")+'</div>';
    st.chargeHeads.forEach(h=>{
      html+='<div class="list-row"><span class="thumb" style="background:var(--blue-bg);color:var(--blue)">'+App.icon("bill",19)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(h.name.en)+'</div><div class="s">'+(h.type==="per_sqft"? "₹"+h.rate+" / sq.ft." : t("fixedCharges")+" ₹"+h.rate)+'</div></div>'+
        '<span class="tag">'+t(h.type==="per_sqft"?"perSqft":"fixedCharges")+'</span></div>';
    });
    html+='</div>';
    html+='<div class="card"><div class="card-title">'+t("billsList")+'</div>';
    const monthBills=st.bills.filter(b=>b.period===month);
    monthBills.slice(0,10).forEach(b=>{
      const f=S.flatById(b.flatId);
      html+='<div class="list-row" data-action="go" data-arg="/admin/bill/'+b.id+'"><span class="thumb" style="background:var(--grey-bg)">'+App.icon("bill",18)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(S.flatKey(f))+'</div><div class="s">'+App.esc(b.number)+' · '+t("dueDate")+": "+App.fmtDate(b.dueDate)+'</div></div>'+
        '<div style="text-align:right"><div class="bold">'+App.fmt(S.billTotal(b))+'</div>'+App.chip(b.status==="paid"?"paid":(new Date(b.dueDate)<new Date()?"overdue":"unpaid"))+'</div></div>';
    });
    html+='<div class="center mt"><button class="btn btn-ghost btn-sm" data-action="go" data-arg="/admin/bills">'+t("viewAll")+' →</button></div></div></div>';
    return html;
  };

  /* ---- Bill Run wizard ---- */
  App.views.admBillRun = function(){
    const st=S.get();
    const d=new Date(); d.setMonth(d.getMonth()+1);
    const nextMonth=d.getFullYear()+"-"+S.pad(d.getMonth()+1);
    const sel=App.state.tmp.billRunMonth||nextMonth;
    const exists=st.bills.some(b=>b.period===sel);
    const occupied=st.flats.filter(f=>f.occupancy==="occupied");
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/finance">'+App.icon("back",18)+'</button><h1>'+t("billRunTitle")+'</h1></div>';
    html+='<div class="dash-note">'+App.icon("info",17)+t("billRunDone")+' — 10 '+t("minsAgo")+'</div>';
    html+='<div class="card"><div class="field"><label>'+t("selectPeriod")+'</label><select class="inp" id="brMonth">';
    const months=[]; for(let i=0;i<=2;i++){ const x=new Date(); x.setMonth(x.getMonth()+i); const m=x.getFullYear()+"-"+S.pad(x.getMonth()+1); months.push(m); }
    months.forEach(m=>{ html+='<option value="'+m+'" '+(m===sel?"selected":"")+'>'+t("months")[Number(m.split("-")[1])-1]+" "+m.split("-")[0]+'</option>'; });
    html+='</select></div>';
    if(exists){ html+='<div class="dash-note warn-note">'+App.icon("alert",17)+t("billRunExists")+'</div>'; }
    else{
      // sample preview of 3 flats
      html+='<div class="card-title mt">'+t("sampleBills")+' ('+occupied.length+' '+t("ofFlats")+')</div>';
      let totalBilled=0;
      occupied.slice(0,3).forEach(f=>{
        const c=S.computeBill(f,sel); totalBilled+=c.net;
        html+='<div style="border:1px solid var(--border);border-radius:11px;padding:12px;margin-bottom:9px"><div class="bold small">'+App.esc(S.flatKey(f))+' · '+App.esc(f.type)+' · '+App.esc(String(f.area))+' sq.ft.</div>';
        c.items.forEach(i=>{ html+='<div class="bill-line"><span class="bl small">'+App.esc(i.label.en)+'</span><span class="bv small">'+App.fmt(i.amount)+'</span></div>'; });
        if(c.arrears>0) html+='<div class="bill-line"><span class="bl small" style="color:var(--red)">'+t("arrears")+'</span><span class="bv small" style="color:var(--red)">+'+App.fmt(c.arrears)+'</span></div>';
        html+='<div class="bill-line total" style="padding-top:7px"><span class="bl small">'+t("netPayable")+'</span><span class="bv small">'+App.fmt(c.net)+'</span></div></div>';
      });
      const avg=Math.round(totalBilled/3);
      html+='<div class="small muted mb">≈ '+App.fmt(avg)+' / '+t("flatNo")+' · '+t("total")+' ≈ '+App.fmt(avg*occupied.length)+'</div>';
      html+='<button class="btn btn-gold btn-lg btn-block" data-action="publishBills" data-id="'+sel+'">'+App.icon("bill",18)+t("publishBills")+'</button>';
    }
    html+='</div></div>';
    return html;
  };
  App.act("publishBills", el=>{
    const r=S.generateBills(el.dataset.id);
    if(!r.ok){ App.toast(t("billRunExists"),"error"); return; }
    const allUsers=[]; r.bills.forEach(b=>{ S.residenciesOfFlat(b.flatId).forEach(rs=>{ allUsers.push(rs.userId); }); });
    S.notify(Array.from(new Set(allUsers)), "bill", t("billRunDone"), el.dataset.id+" — "+App.fmt(S.get().bills.filter(b=>b.period===el.dataset.id).reduce((a,b)=>a+b.net,0))+" "+t("total"), "/bills");
    S.log(App.state.user.name,"bills.publish", r.count+" bills — "+el.dataset.id);
    S.save(); App.toast(t("billRunDone")+" ✓","success"); App.go("/admin/finance");
  });

  /* ---- All bills ---- */
  App.views.admBills = function(){
    const st=S.get(), q=(App.state.tmp.billFilter||"").toLowerCase();
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/finance">'+App.icon("back",18)+'</button><h1>'+t("billsList")+'</h1></div>';
    html+='<div class="tabs"><button class="tab '+(q===""?"active":"")+'" data-action="setBillFilter" data-id="">'+t("all")+'</button>'+
      '<button class="tab '+(q==="unpaid"?"active":"")+'" data-action="setBillFilter" data-id="unpaid">'+t("unpaid")+'</button>'+
      '<button class="tab '+(q==="paid"?"active":"")+'" data-action="setBillFilter" data-id="paid">'+t("paid")+'</button></div>';
    html+='<div class="card"><div class="table-wrap"><table><tr><th>'+t("flatNo")+'</th><th>'+t("month")+'</th><th>'+t("billNo")+'</th><th style="text-align:right">'+t("amount")+'</th><th>'+t("status")+'</th></tr>';
    st.bills.filter(b=>{
      if(q==="unpaid") return b.status==="unpaid";
      if(q==="paid") return b.status==="paid";
      return true;
    }).sort((a,b)=>a.period<b.period?1:-1).slice(0,80).forEach(b=>{
      const f=S.flatById(b.flatId);
      const isUnpaid=b.status==="unpaid";
      html+='<tr class="rowclick" data-action="go" data-arg="/admin/bill/'+b.id+'"><td class="bold">'+App.esc(S.flatKey(f))+'</td><td>'+b.period+'</td><td class="small">'+App.esc(b.number)+'</td><td class="bold" style="text-align:right">'+App.fmt(S.billTotal(b))+'</td><td>'+App.chip(isUnpaid?(new Date(b.dueDate)<new Date()?"overdue":"unpaid"):"paid")+'</td></tr>';
    });
    html+='</table></div></div></div>';
    return html;
  };
  App.act("setBillFilter", el=>{ App.state.tmp.billFilter=el.dataset.id; App.render(); });

  App.views.admBillDetail = function(p){
    const st=S.get(), b=st.bills.find(x=>x.id===p.id);
    if(!b) return App.notFoundView();
    const f=S.flatById(b.flatId);
    const lf=S.lateFeeNow(b);
    const pay=st.payments.find(x=>x.billId===b.id && x.status==="success");
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/bills">'+App.icon("back",18)+'</button><h1>'+App.esc(b.number)+'</h1><span class="spacer"></span>'+App.chip(b.status==="paid"?"paid":"unpaid")+'</div>';
    html+='<div class="card"><div class="kv"><span class="k">'+t("flatNo")+'</span><span class="v">'+App.esc(S.flatKey(f))+' ('+App.esc(f.type)+', '+App.esc(String(f.area))+' sq.ft.)</span></div>'+
      '<div class="kv"><span class="k">'+t("dueDate")+'</span><span class="v">'+App.fmtDate(b.dueDate)+'</span></div>'+
      '<div class="kv"><span class="k">'+t("date")+'</span><span class="v">'+App.fmtDate(b.publishedAt)+'</span></div></div>';
    html+='<div class="card"><div class="card-title">'+t("lineItems")+'</div>';
    b.items.forEach(i=>{ html+='<div class="bill-line"><span class="bl">'+App.esc(i.label.en)+'</span><span class="bv">'+App.fmt(i.amount)+'</span></div>'; });
    if(b.arrears>0) html+='<div class="bill-line"><span class="bl">'+t("arrears")+'</span><span class="bv" style="color:var(--red)">+'+App.fmt(b.arrears)+'</span></div>';
    if(lf>0) html+='<div class="bill-line"><span class="bl">'+t("lateFee")+'</span><span class="bv" style="color:var(--red)">+'+App.fmt(lf)+'</span></div>';
    html+='<div class="bill-line total"><span class="bl">'+t("netPayable")+'</span><span class="bv">'+App.fmt(S.billTotal(b))+'</span></div>';
    if(b.status==="unpaid"){
      html+='<div class="mt"><button class="btn btn-success btn-block" data-action="adminMarkPaid" data-id="'+b.id+'">'+App.icon("check",16)+t("markAsPaid")+'</button></div>';
    } else if(pay){
      html+='<div class="mt"><span class="chip chip-green">'+t("paid")+": "+App.fmt(pay.amount)+' · '+App.fmtDateTime(pay.at)+' · '+modeLabel(pay.mode)+'</span> <button class="btn btn-ghost btn-sm" data-action="go" data-arg="/receipt/'+pay.id+'">'+t("viewReceipts")+'</button></div>';
    }
    html+='</div></div>';
    return html;
  };
  App.act("adminMarkPaid", el=>{
    App.confirmModal(t("markAsPaid"), t("approveConfirm"), ()=>{
      const p=S.payBill(el.dataset.id, "cash", "MANUAL-"+S.nowIso().slice(0,10));
      S.log(App.state.user.name,"payment.manual", App.fmt(p.amount)+" — cash");
      S.save(); App.render(); App.toast(t("paymentRecorded")+" ✓","success");
    });
  });

  /* ---- Manual payment ---- */
  App.views.admManual = function(){
    const st=S.get();
    const flats=st.flats.filter(f=>f.occupancy==="occupied");
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/finance">'+App.icon("back",18)+'</button><h1>'+t("manualEntry")+'</h1></div><div class="card">';
    html+='<div class="field"><label>'+t("flatNo")+'</label><select class="inp" id="mpFlat">'+flats.map(f=>{
      const r=S.residentsOfFlat(f.id).find(x=>x.role==="owner"||x.role==="tenant");
      return '<option value="'+f.id+'">'+App.esc(S.flatKey(f))+(r?" — "+App.esc(r.user.name):"")+'</option>';
    }).join("")+'</select></div>';
    html+='<div class="field"><label>'+t("amount")+' (₹)</label><input class="inp" id="mpAmount" inputmode="numeric" placeholder="4250"></div>';
    html+='<div class="field"><label>'+t("mode")+'</label><div style="display:flex;gap:8px;flex-wrap:wrap">'+
      ["cash","cheque","neft"].map(m=>'<button class="btn btn-sm btn-ghost mp-mode" data-action="setMpMode" data-id="'+m+'">'+t(m)+'</button>').join("")+'</div></div>';
    html+='<div class="field"><label>'+t("reference")+'</label><input class="inp" id="mpRef" placeholder="Cheque no / UTR"></div>';
    html+='<button class="btn btn-gold btn-lg btn-block" data-action="saveManualPayment">'+App.icon("check",17)+t("paymentRecorded")+'</button></div></div>';
    App.state.tmp.mpMode="cash";
    return html;
  };
  App.act("setMpMode", el=>{ App.state.tmp.mpMode=el.dataset.id; document.querySelectorAll(".mp-mode").forEach(b=>{ b.className="btn btn-sm "+(b.dataset.id===el.dataset.id?"btn-primary":"btn-ghost"); }); });
  App.act("saveManualPayment", ()=>{
    const flatId=(document.getElementById("mpFlat")||{}).value;
    const amount=Number((document.getElementById("mpAmount")||{}).value||0);
    const ref=(document.getElementById("mpRef")||{}).value||"";
    if(!flatId||amount<=0){ App.toast(t("amount")+" "+t("required"),"error"); return; }
    S.manualPayment(flatId, amount, App.state.tmp.mpMode||"cash", ref);
    const f=S.flatById(flatId);
    S.notify(S.residenciesOfFlat(flatId).map(r=>r.userId), "check", t("paymentRecorded")+": "+App.fmt(amount), S.flatKey(f), "/bills");
    S.log(App.state.user.name,"payment.manual", App.fmt(amount)+" — "+S.flatKey(f)+" ("+(App.state.tmp.mpMode||"cash")+")");
    S.save(); App.toast(t("paymentRecorded")+" ✓","success"); App.go("/admin/finance");
  });

  /* ---- Defaulters ---- */
  App.views.admDefaulters = function(){
    const def=S.defaultersList();
    const buckets={b0:[],b30:[],b60:[],b90:[]};
    def.forEach(d=>{ const b=d.days<=30?"b0":d.days<=60?"b30":d.days<=90?"b60":"b90"; buckets[b].push(d); });
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/finance">'+App.icon("back",18)+'</button><h1>'+t("defaulterList")+'</h1><span class="spacer"></span>'+
      '<button class="btn btn-ghost btn-sm" data-action="exportDefaulters">'+App.icon("download",15)+t("exportCSV")+'</button></div>';
    html+='<div class="grid grid-4">'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--amber)">'+buckets.b0.length+'</div><div class="stat-label">'+t("b0")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--gold)">'+buckets.b30.length+'</div><div class="stat-label">'+t("b30")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--red)">'+buckets.b60.length+'</div><div class="stat-label">'+t("b60")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--red)">'+buckets.b90.length+'</div><div class="stat-label">'+t("b90")+'</div></div></div>';
    html+='<div class="card"><div class="table-wrap"><table><tr><th>'+t("flatNo")+'</th><th>'+t("residentsList")+'</th><th>'+t("totalDue")+'</th><th>'+t("daysOverdue")+'</th><th>'+t("action")+'</th></tr>';
    def.forEach(d=>{
      html+='<tr><td class="bold">'+App.esc(S.flatKey(d.flat))+'</td><td>'+(d.residents[0]?App.esc(d.residents[0].user.name):"—")+'</td>'+
        '<td class="bold" style="color:var(--red)">'+App.fmt(d.due)+'</td><td><span class="chip '+(d.days>60?"chip-red":"chip-amber")+'">'+d.days+' '+t("daysOverdue")+'</span></td>'+
        '<td><button class="btn btn-ghost btn-sm" data-action="remindDefaulter" data-id="'+d.flat.id+'">'+App.icon("send",13)+t("sendReminder")+'</button></td></tr>';
    });
    html+='</table></div></div></div>';
    return html;
  };
  App.act("remindDefaulter", el=>{
    const f=S.flatById(el.dataset.id);
    S.notify(S.residenciesOfFlat(f.id).map(r=>r.userId), "bill", t("sendReminder")+": "+S.flatKey(f), App.fmt(S.totalDueFor(f.id))+" — "+t("dueDate")+" "+App.fmtDate(S.unpaidBillsFor(f.id)[0].dueDate), "/bills");
    S.log(App.state.user.name,"bills.remind", S.flatKey(f));
    S.save(); App.toast(t("reminderSent")+" ✓","success");
  });
  App.act("exportDefaulters", ()=>{
    const rows=[["Flat","Resident","Due","Days Overdue","Bills"]];
    S.defaultersList().forEach(d=>rows.push([S.flatKey(d.flat), d.residents[0]?d.residents[0].user.name:"", d.due, d.days, d.bills]));
    App.download("defaulters.csv", App.csv(rows), "text/csv");
  });

  /* ---- Reports ---- */
  App.views.admReports = function(){
    const rows=[];
    for(let i=0;i<6;i++){ const d=new Date(); d.setMonth(d.getMonth()-i); const m=d.getFullYear()+"-"+S.pad(d.getMonth()+1); const c=S.collectionsByPeriod(m); rows.push({m,c}); }
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/finance">'+App.icon("back",18)+'</button><h1>'+t("collectionReport")+'</h1><span class="spacer"></span>'+
      '<button class="btn btn-ghost btn-sm" data-action="exportReport">'+App.icon("download",15)+t("exportCSV")+'</button></div>';
    html+='<div class="card"><div class="card-title">'+t("lastMonths")+'</div><div class="table-wrap"><table><tr><th>'+t("month")+'</th><th style="text-align:right">'+t("billed")+'</th><th style="text-align:right">'+t("collected")+'</th><th style="text-align:right">'+t("outstanding")+'</th><th>'+t("rate")+'</th></tr>';
    rows.forEach(r=>{
      const pct=r.c.billed? Math.round(r.c.collected/r.c.billed*100):0;
      html+='<tr><td class="bold">'+t("months")[Number(r.m.split("-")[1])-1]+" "+r.m.split("-")[0]+'</td>'+
        '<td style="text-align:right">'+App.fmt(r.c.billed)+'</td><td style="text-align:right" style="color:var(--green)">'+App.fmt(r.c.collected)+'</td>'+
        '<td style="text-align:right" style="color:var(--red)">'+App.fmt(r.c.outstanding)+'</td>'+
        '<td><div class="bar-row" style="margin:0;min-width:120px"><div class="bar" style="height:14px"><div class="fill" style="width:'+pct+'%"></div></div><span class="bv" style="width:40px;flex:0 0 40px">'+pct+'%</span></div></td></tr>';
    });
    html+='</table></div></div></div>';
    return html;
  };
  App.act("exportReport", ()=>{
    const rows=[["Month","Billed","Collected","Outstanding","Rate %"]];
    for(let i=0;i<6;i++){ const d=new Date(); d.setMonth(d.getMonth()-i); const m=d.getFullYear()+"-"+S.pad(d.getMonth()+1); const c=S.collectionsByPeriod(m); rows.push([m,c.billed,c.collected,c.outstanding,c.billed?Math.round(c.collected/c.billed*100):0]); }
    App.download("collection-report.csv", App.csv(rows), "text/csv");
  });

  /* ================= HELPDESK ================= */
  App.views.admHelpdesk = function(){
    const st=S.get();
    const queue=st.complaints.filter(c=>c.status==="open"||c.status==="assigned"||c.status==="in_progress");
    const closed=st.complaints.filter(c=>c.status==="resolved"||c.status==="closed");
    let html='<div class="page fade"><div class="page-head"><h1>'+t("complaintQueue")+'</h1><span class="spacer"></span><button class="btn btn-ghost btn-sm" data-action="go" data-arg="/admin/staffperf">'+App.icon("users",15)+t("staffPerformance")+'</button></div>';
    html+='<div class="card"><div class="card-title">'+t("openComplaints")+' ('+queue.length+')</div>';
    if(!queue.length) html+=App.empty("allCaughtUp","emptyMsg");
    queue.forEach(c=>{
      const breach=new Date(c.slaDueAt)<new Date();
      const assignee=c.assigneeId? st.staffMembers.find(s=>s.id===c.assigneeId):null;
      html+='<div class="list-row" data-action="go" data-arg="/admin/complaint/'+c.id+'"><span class="thumb" style="background:'+(breach?"var(--red-bg)":"var(--blue-bg)")+';color:'+(breach?"var(--red)":"var(--blue)")+'">'+App.icon(breach?"clock":"complaint",19)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(c.title)+'</div><div class="s">'+App.esc(c.ticketNo)+' · '+(assignee?App.esc(assignee.name):t("unassigned"))+' · '+App.relTime(c.createdAt)+'</div></div>'+
        (breach?'<span class="chip chip-red">'+t("slaBreach")+'</span>':App.chip(c.status))+'</div>';
    });
    html+='</div>';
    if(closed.length){
      html+='<div class="card"><div class="card-title">'+t("resolved")+' ('+closed.length+')</div>';
      closed.slice(0,6).forEach(c=>{
        html+='<div class="list-row" data-action="go" data-arg="/admin/complaint/'+c.id+'"><span class="thumb" style="background:var(--green-bg);color:var(--green)">'+App.icon("check",19)+'</span>'+
          '<div class="grow"><div class="t">'+App.esc(c.title)+'</div><div class="s">'+App.esc(c.ticketNo)+' · '+(c.rating?"★"+c.rating:"—")+'</div></div>'+App.chip("closed")+'</div>';
      });
      html+='</div>';
    }
    html+='</div>';
    return html;
  };

  App.views.admComplaintDetail = function(p){
    const st=S.get(), c=st.complaints.find(x=>x.id===p.id);
    if(!c) return App.notFoundView();
    const assignee=c.assigneeId? st.staffMembers.find(s=>s.id===c.assigneeId):null;
    const breach=new Date(c.slaDueAt)<new Date();
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/helpdesk">'+App.icon("back",18)+'</button><h1>'+App.esc(c.ticketNo)+'</h1><span class="spacer"></span>'+App.chip(c.status)+(breach&&c.status!=="closed"&&c.status!=="resolved"?' <span class="chip chip-red">'+t("slaBreach")+'</span>':"")+'</div>';
    html+='<div class="card"><div class="card-title" style="font-size:15.5px">'+App.esc(c.title)+'</div>';
    html+='<div class="small muted mb">'+(c.community?t("commonAreaOnly"):App.esc(S.flatKey(S.flatById(c.flatId))))+' · '+t("filedOn")+": "+App.fmtDateTime(c.createdAt)+' · '+t("slaDueAt")+": "+App.fmtDateTime(c.slaDueAt)+'</div>';
    html+='<div style="font-size:14px">'+App.esc(c.desc)+'</div>';
    if(c.photos&&c.photos.length) html+='<div style="display:flex;gap:9px;margin-top:10px">'+c.photos.map(ph=>'<img src="'+ph+'" style="width:100px;height:100px;object-fit:cover;border-radius:10px">').join("")+'</div>';
    if(c.rating) html+='<div class="mt">'+t("ratingGiven")+": "+App.stars(c.rating)+'</div>';
    html+='</div>';
    if(c.status==="open"||c.status==="assigned"||c.status==="in_progress"){
      html+='<div class="card"><div class="card-title">'+t("assignTo")+'</div><select class="inp" id="assignSel">'+
        '<option value="">'+t("selectStaff")+'...</option>'+
        st.staffMembers.map(s=>'<option value="'+s.id+'" '+(c.assigneeId===s.id?"selected":"")+'>'+App.esc(s.name)+' — '+App.esc(s.role)+'</option>').join("")+'</select>'+
        '<div style="display:flex;gap:9px;margin-top:10px">'+
        '<button class="btn btn-primary btn-sm" style="flex:1" data-action="assignComplaint" data-id="'+c.id+'">'+t("assignTo")+'</button>'+
        '<button class="btn btn-danger-soft btn-sm" style="flex:1" data-action="escalateComplaint" data-id="'+c.id+'">'+t("escalate")+'</button></div></div>';
    }
    html+='<div class="card"><div class="card-title">'+t("statusTimeline")+'</div><div class="timeline">';
    c.timeline.forEach(ev=>{
      html+='<div class="t-item '+(c.status===ev.status?"now":"done")+'"><span class="t-dot"></span><div class="tt">'+t(ev.status)+'</div><div class="td">'+App.fmtDateTime(ev.at)+'</div>'+(ev.note?'<div class="tn">'+App.esc(ev.note)+'</div>':"")+'</div>';
    });
    html+='</div></div></div>';
    return html;
  };
  App.act("assignComplaint", el=>{
    const sel=document.getElementById("assignSel");
    if(!sel||!sel.value){ App.toast(t("selectStaff"),"error"); return; }
    S.assignComplaint(el.dataset.id, sel.value, App.state.user.name);
    const c=S.get().complaints.find(x=>x.id===el.dataset.id);
    const st=S.get().staffMembers.find(s=>s.id===sel.value);
    const staffUser=S.get().users.find(u=>u.name===st.name);
    if(staffUser) S.notify(staffUser.id,"complaint",t("newComplaint")+": "+c.title.slice(0,45), c.ticketNo, "/staff");
    S.log(App.state.user.name,"complaint.assign", c.ticketNo+" → "+st.name);
    S.save(); App.render(); App.toast(t("assigned")+" ✓","success");
  });
  App.act("escalateComplaint", el=>{
    const c=S.get().complaints.find(x=>x.id===el.dataset.id);
    S.notify(S.get().users.filter(x=>x.role==="admin").map(x=>x.id),"alert",t("escalateMsg")+": "+c.ticketNo,"","/admin/helpdesk");
    S.log(App.state.user.name,"complaint.escalate", c.ticketNo);
    S.save(); App.toast(t("escalateMsg"),"info");
  });

  App.views.admStaffPerf = function(){
    const st=S.get();
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/helpdesk">'+App.icon("back",18)+'</button><h1>'+t("staffPerformance")+'</h1></div><div class="card">';
    st.staffMembers.filter(s=>!s.vendor).forEach(s=>{
      const assigned=st.complaints.filter(c=>c.assigneeId===s.id);
      const resolvedC=assigned.filter(c=>c.status==="resolved"||c.status==="closed");
      const rated=resolvedC.filter(c=>c.rating);
      const avg=rated.length? (rated.reduce((a,c)=>a+c.rating,0)/rated.length).toFixed(1):"—";
      html+='<div class="list-row">'+App.avatar(s.name,"av-md")+
        '<div class="grow"><div class="t">'+App.esc(s.name)+'</div><div class="s">'+App.esc(s.role)+'</div></div>'+
        '<div style="text-align:right"><div class="bold">'+assigned.length+' '+t("complaints")+'</div><div class="small muted">'+t("ratingGiven")+": "+avg+' ★</div></div></div>';
    });
    html+='</div></div>';
    return html;
  };

  /* ================= COMMUNICATION ================= */
  App.views.admNotices = function(){
    const st=S.get();
    let html='<div class="page fade"><div class="page-head"><h1>'+t("notices")+'</h1><span class="spacer"></span>'+
      '<button class="btn btn-primary btn-sm" data-action="go" data-arg="/admin/notices/new">'+App.icon("plus",15)+t("publishNotice")+'</button>'+
      '<button class="btn btn-ghost btn-sm" data-action="go" data-arg="/admin/polls">'+App.icon("poll",15)+t("polls")+'</button></div>';
    st.notices.forEach(n=>{
      const audienceCount=S.noticeAudience(n).length;
      const pct=audienceCount? Math.round(n.readBy.length/audienceCount*100):0;
      html+='<div class="list-row" data-action="go" data-arg="/admin/notice/'+n.id+'"><span class="thumb" style="background:'+(n.category==="emergency"?"var(--red-bg)":"var(--blue-bg)")+';color:'+(n.category==="emergency"?"var(--red)":"var(--blue)")+'">'+App.icon("notice",19)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(n.title.slice(0,60))+(n.pinned?" 📌":"")+'</div><div class="s">'+App.relTime(n.createdAt)+' · 👁 '+pct+'% ('+n.readBy.length+'/'+audienceCount+')</div></div>'+App.chip("verified","")+'</div>';
    });
    html+='</div>';
    return html;
  };

  App.views.admNewNotice = function(){
    const tmp=App.state.tmp;
    const selCat=tmp.ntCat||"general";
    const cats=[["general","general","notice"],["emergencyCat","emergency","alert"],["event","event","sparkle"],["maintenance","maintenance","wrench"],["financial","financial","pie"],["meeting","meeting","users"]];
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/notices">'+App.icon("back",18)+'</button><h1>'+t("publishNotice")+'</h1></div><div class="card">';
    html+='<div class="field"><label>'+t("category")+'</label><div style="display:flex;gap:8px;flex-wrap:wrap">';
    cats.forEach(c=>{ html+='<button class="btn btn-sm '+(selCat===c[1]?"btn-primary":"btn-ghost")+'" data-action="setNtCat" data-id="'+c[1]+'">'+App.icon(c[2],14)+t(c[0])+'</button>'; });
    html+='</div></div>';
    html+='<div class="field"><label>'+t("noticeTitle")+'</label><input class="inp" id="ntTitle" placeholder="'+t("noticeTitle")+'..."></div>';
    html+='<div class="field"><label>'+t("noticeBody")+'</label><textarea class="inp" id="ntBody" rows="6"></textarea></div>';
    html+='<div class="field"><label>'+t("audience")+'</label><div style="display:flex;gap:8px;flex-wrap:wrap">'+
      [["all","allResidents"],["towerA","towerA"],["towerB","towerB"],["towerC","towerC"],["owners","ownersOnly"]].map(a=>'<button class="btn btn-sm '+( (tmp.ntAud||"all")===a[0]?"btn-primary":"btn-ghost")+'" data-action="setNtAud" data-id="'+a[0]+'">'+t(a[1])+'</button>').join("")+'</div></div>';
    html+='<label style="display:flex;align-items:center;gap:9px;padding:8px 0"><input type="checkbox" id="ntPin" style="width:18px;height:18px"> <span class="bold small">📌 '+t("pinned")+'</span></label>';
    html+='<button class="btn btn-gold btn-lg btn-block" data-action="publishNoticeAction">'+App.icon("send",17)+t("publishNow")+'</button>';
    html+='<div class="small muted center mt">'+(selCat==="emergency"? t("smsSimulated")+": "+t("sms")+" + "+t("email") : t("email")+" + "+t("inApp"))+'</div></div></div>';
    return html;
  };
  App.act("setNtCat", el=>{ App.state.tmp.ntCat=el.dataset.id; App.render(); });
  App.act("setNtAud", el=>{ App.state.tmp.ntAud=el.dataset.id; App.render(); });
  App.act("publishNoticeAction", ()=>{
    const title=(document.getElementById("ntTitle")||{}).value||"";
    const body=(document.getElementById("ntBody")||{}).value||"";
    const pinned=document.getElementById("ntPin")?.checked;
    if(title.trim().length<4){ App.toast(t("noticeTitle")+" "+t("required"),"error"); return; }
    if(body.trim().length<10){ App.toast(t("noticeBody")+" "+t("minChars"),"error"); return; }
    const cat=App.state.tmp.ntCat||"general";
    const n=S.publishNotice({title:title.trim(), body:body.trim(), category:cat, audience:App.state.tmp.ntAud||"all", pinned});
    const recipients=S.noticeAudience(n);
    S.notify(recipients, cat==="emergency"?"alert":"notice", cat==="emergency"? t("emergencyCat")+": "+title.slice(0,40):t("publishNotice")+": "+title.slice(0,40), body.slice(0,80), "/notices");
    S.log(App.state.user.name,"notice.publish", title.slice(0,50)+(pinned?" (pinned)":""));
    S.save();
    App.state.tmp.ntCat=null; App.state.tmp.ntAud=null;
    App.toast(t("noticePublished")+" ✓","success");
    App.go("/admin/notices");
  });

  App.views.admNoticeDetail = function(p){
    const st=S.get(), n=st.notices.find(x=>x.id===p.id);
    if(!n) return App.notFoundView();
    const audience=S.noticeAudience(n);
    const readers=n.readBy.map(id=>S.userById(id)).filter(Boolean);
    const nonReaders=audience.filter(id=>!n.readBy.includes(id)).map(id=>S.userById(id)).filter(Boolean);
    const pct=audience.length? Math.round(n.readBy.length/audience.length*100):0;
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/notices">'+App.icon("back",18)+'</button><h1>'+t("noticeAnalytics")+'</h1></div>';
    html+='<div class="card"><div class="card-title">'+t("readReceipts")+'</div>';
    html+='<div class="bar-row"><span class="bl">'+t("readRate")+'</span><div class="bar"><div class="fill" style="width:'+pct+'%"></div></div><span class="bv">'+pct+'%</span></div>';
    html+='<div class="small muted mb">'+n.readBy.length+' / '+audience.length+' '+t("people")+'</div></div>';
    html+='<div class="grid grid-2">';
    html+='<div class="card"><div class="card-title">✓ '+t("readBy")+' ('+readers.length+')</div>';
    readers.slice(0,14).forEach(r=>{ html+='<div class="list-row">'+App.avatar(r.name,"av-sm")+'<div class="grow"><div class="t">'+App.esc(r.name)+'</div><div class="s">'+t(r.role==="admin"?"admin":r.role==="owner"?"owner":r.role==="tenant"?"tenant":r.role==="family"?"familyMember":"resident")+'</div></div></div>'; });
    html+='</div>';
    html+='<div class="card"><div class="card-title">✕ '+t("nonReaders")+' ('+nonReaders.length+')</div>';
    if(!nonReaders.length) html+=App.empty("allCaughtUp","emptyMsg");
    nonReaders.slice(0,14).forEach(r=>{ html+='<div class="list-row">'+App.avatar(r.name,"av-sm")+'<div class="grow"><div class="t">'+App.esc(r.name)+'</div><div class="s">'+t(r.role==="admin"?"admin":r.role==="owner"?"owner":r.role==="tenant"?"tenant":r.role==="family"?"familyMember":"resident")+'</div></div></div>'; });
    html+='</div></div></div>';
    return html;
  };

  /* ---- Polls admin ---- */
  App.views.admPolls = function(){
    const st=S.get();
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/admin/notices">'+App.icon("back",18)+'</button><h1>'+t("polls")+'</h1><span class="spacer"></span><button class="btn btn-primary btn-sm" data-action="createPollModal">'+App.icon("plus",15)+t("createPoll")+'</button></div>';
    st.polls.forEach(p=>{
      const total=p.votes.length;
      const top=total? Math.max(...p.options.map((o,i)=>p.votes.filter(v=>v.opt===i).length)):0;
      const winIdx=p.options.findIndex((o,i)=>p.votes.filter(v=>v.opt===i).length===top);
      html+='<div class="card"><div class="card-title">'+App.esc(p.question.slice(0,70))+'</div>';
      p.options.forEach((opt,i)=>{
        const cnt=p.votes.filter(v=>v.opt===i).length;
        const pct=total? Math.round(cnt/total*100):0;
        html+='<div class="bar-row"><span class="bl">'+App.esc(opt)+(i===winIdx&&total?" 🏆":"")+'</span><div class="bar"><div class="fill" style="width:'+pct+'%;'+(i===winIdx&&total?"background:linear-gradient(90deg,var(--gold),var(--gold2))":"")+'"></div></div><span class="bv">'+cnt+' ('+pct+'%)</span></div>';
      });
      html+='<div class="small muted" style="margin-top:6px">'+total+' '+t("votes")+' · '+t("deadline")+": "+App.fmtDate(p.deadline)+' · '+App.chip(p.status==="closed"||new Date(p.deadline)<new Date()?"closed":"active")+'</div></div>';
    });
    html+='</div>';
    return html;
  };
  App.act("createPollModal", ()=>{
    App.modal('<div class="field"><label>'+t("pollQuestion")+'</label><input class="inp" id="plQ"></div>'+
      [0,1,2,3].map(i=>'<div class="field"><label>'+t("option")+' '+(i+1)+'</label><input class="inp" id="plO'+i+'" placeholder="'+(i<2?t("required"):t("optional"))+'"></div>').join("")+
      '<div class="field"><label>'+t("deadline")+'</label><input class="inp" id="plD" type="date"></div>'+
      '<label style="display:flex;align-items:center;gap:9px;padding:8px 0"><input type="checkbox" id="plA" checked style="width:18px;height:18px"><span class="bold small">'+t("anonymous")+' · '+t("oneFlatOneVote")+'</span></label>',
      {title:t("createPoll")});
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button><button class="btn btn-gold" data-action="savePoll">'+t("createPollBtn")+'</button></div>');
  });
  App.act("savePoll", ()=>{
    const q=(document.getElementById("plQ")||{}).value||"";
    const opts=[0,1,2,3].map(i=>(document.getElementById("plO"+i)||{}).value||"").filter(o=>o.trim().length>0);
    const d=(document.getElementById("plD")||{}).value;
    if(q.trim().length<5){ App.toast(t("pollQuestion")+" "+t("required"),"error"); return; }
    if(opts.length<2){ App.toast("2+ "+t("option"),"error"); return; }
    const p=S.createPoll({question:q.trim(), options:opts, deadline:(d? new Date(d+"T20:00:00").toISOString(): new Date(Date.now()+7*86400000).toISOString())});
    S.notify(S.get().users.filter(x=>x.status==="active").map(x=>x.id),"poll",t("activePoll")+": "+q.slice(0,40),"","/polls");
    S.log(App.state.user.name,"poll.create", q.slice(0,40));
    S.save(); App.closeModal(); App.toast(t("pollCreated")+" ✓","success"); App.render();
  });

  /* ================= SECURITY ================= */
  App.views.admSecurity = function(){
    const st=S.get();
    const tab=App.state.tmp.secTab||"logs";
    const todayLogs=st.visitors.filter(v=>new Date(v.inAt).toDateString()===new Date().toDateString());
    const allLogs=st.visitors.slice(0,40);
    let html='<div class="page fade"><div class="page-head"><h1>'+t("securitySec")+'</h1><span class="spacer"></span><button class="btn btn-ghost btn-sm" data-action="exportVisitors">'+App.icon("download",15)+t("exportLog")+'</button></div>';
    html+='<div class="tabs"><button class="tab '+(tab==="logs"?"active":"")+'" data-action="setSecTab" data-id="logs">'+t("visitorLogs")+'</button><button class="tab '+(tab==="att"?"active":"")+'" data-action="setSecTab" data-id="att">'+t("staffAttendance")+'</button></div>';
    if(tab==="logs"){
      html+='<div class="grid grid-2"><div class="stat-tile"><div class="stat-value">'+todayLogs.filter(v=>!v.outAt).length+'</div><div class="stat-label">'+t("stillInside")+'</div></div><div class="stat-tile"><div class="stat-value">'+todayLogs.length+'</div><div class="stat-label">'+t("totalIn")+'</div></div></div>';
      html+='<div class="card"><div class="table-wrap"><table><tr><th>'+t("time")+'</th><th>'+t("visitorName")+'</th><th>'+t("visitorType")+'</th><th>'+t("flatNo")+'</th><th>'+t("status")+'</th></tr>';
      allLogs.forEach(v=>{
        html+='<tr><td class="small">'+App.fmtDateTime(v.inAt)+'</td><td class="bold">'+App.esc(v.name)+'</td><td>'+catLabel(v.category)+'</td><td>'+v.flatIds.map(id=>S.flatKey(S.flatById(id))).join(", ")+'</td><td>'+App.chip(v.approval)+'</td></tr>';
      });
      html+='</table></div></div>';
    } else {
      html+='<div class="card">';
      st.staffMembers.filter(s=>!s.vendor).forEach(s=>{
        const monthEntries=st.visitors.filter(v=>v.category==="daily_staff" && v.name.includes(s.name.split(" ")[0])).length;
        html+='<div class="list-row">'+App.avatar(s.name,"av-md")+
          '<div class="grow"><div class="t">'+App.esc(s.name)+'</div><div class="s">'+App.esc(s.role)+'</div></div>'+
          '<div style="text-align:right"><div class="bold">'+monthEntries+'</div><div class="small muted">'+t("inCount")+'</div></div></div>';
      });
      html+='</div>';
    }
    html+='</div>';
    return html;
  };
  App.act("setSecTab", el=>{ App.state.tmp.secTab=el.dataset.id; App.render(); });
  App.act("exportVisitors", ()=>{
    const rows=[["Time","Name","Type","Flat","Status"]];
    S.get().visitors.forEach(v=>rows.push([App.fmtDateTime(v.inAt), v.name, v.category, v.flatIds.map(id=>S.flatKey(S.flatById(id))).join("|"), v.approval]));
    App.download("visitor-log.csv", App.csv(rows), "text/csv");
  });

  /* ================= FACILITIES (admin) ================= */
  App.views.admFacilities = function(){
    const st=S.get();
    const pending=st.bookings.filter(b=>b.status==="pending_approval");
    let html='<div class="page fade"><div class="page-head"><h1>'+t("facilities")+'</h1></div>';
    if(pending.length){
      html+='<div class="card" style="border:1.5px solid var(--gold)"><div class="card-title">'+t("pendingBookings")+'</div>';
      pending.forEach(b=>{
        const fa=st.facilities.find(x=>x.id===b.facilityId);
        const f=S.flatById(b.flatId);
        const r=S.residentsOfFlat(b.flatId).find(x=>x.role==="owner")||S.residentsOfFlat(b.flatId)[0];
        html+='<div class="approval-card"><span class="ph" style="background:'+fa.color+'20;color:var(--navy)">'+App.icon("calendar",26)+'</span>'+
          '<div class="grow"><div class="bold">'+t(fa.nameKey)+'</div><div class="small muted">'+(r?App.esc(r.user.name):"")+' · '+App.esc(S.flatKey(f))+' · '+App.fmtDate(b.date)+' · '+App.esc(b.slot)+(b.amount>0?" · "+App.fmt(b.amount):"")+'</div></div></div>'+
          '<div class="approval-actions"><button class="btn btn-success" data-action="approveBooking" data-id="'+b.id+'">✓ '+t("approveBooking")+'</button><button class="btn btn-danger-soft" data-action="denyBooking" data-id="'+b.id+'">✕ '+t("denyBooking")+'</button></div>';
      });
      html+='</div>';
    }
    html+='<div class="card"><div class="card-title">'+t("utilizationReport")+'</div><div class="table-wrap"><table><tr><th>'+t("facility")+'</th><th style="text-align:right">'+t("bookingsNav")+'</th><th style="text-align:right">'+t("facilityRevenue")+'</th></tr>';
    st.facilities.forEach(fa=>{
      const bks=st.bookings.filter(b=>b.facilityId===fa.id && b.status!=="cancelled");
      const rev=bks.reduce((a,b)=>a+(b.amount||0),0);
      html+='<tr><td class="bold">'+t(fa.nameKey)+'</td><td style="text-align:right">'+bks.length+'</td><td style="text-align:right">'+App.fmt(rev)+'</td></tr>';
    });
    html+='</table></div></div></div>';
    return html;
  };
  App.act("approveBooking", el=>{
    const b=S.get().bookings.find(x=>x.id===el.dataset.id);
    S.setBookingStatus(b.id,"confirmed");
    const fa=S.get().facilities.find(x=>x.id===b.facilityId);
    S.notify(b.createdBy,"calendar",t("bookingApproved")+"!", t(fa.nameKey)+" — "+App.fmtDate(b.date)+" "+b.slot, "/bookings");
    S.log(App.state.user.name,"booking.approve", t(fa.nameKey)+" — "+b.slot);
    S.save(); App.render(); App.toast(t("bookingApproved")+" ✓","success");
  });
  App.act("denyBooking", el=>{
    const b=S.get().bookings.find(x=>x.id===el.dataset.id);
    S.setBookingStatus(b.id,"cancelled");
    const fa=S.get().facilities.find(x=>x.id===b.facilityId);
    S.notify(b.createdBy,"calendar",t("bookingDenied")+": "+t(fa.nameKey),"","/bookings");
    S.log(App.state.user.name,"booking.deny", t(fa.nameKey)+" — "+b.slot);
    S.save(); App.render(); App.toast(t("bookingDenied"),"info");
  });

  /* ================= SOCIETY / MEMBERS ================= */
  App.views.admMembers = function(){
    const st=S.get(), q=(App.state.tmp.memQ||"").toLowerCase();
    const pending=st.users.filter(u=>u.status==="pending");
    const allRes=st.residencies.slice();
    allRes.sort((a,b)=>{ const f1=S.flatById(a.flatId), f2=S.flatById(b.flatId); return S.flatKey(f1)<S.flatKey(f2)?-1:1; });
    let html='<div class="page fade"><div class="page-head"><h1>'+t("membersMgmt")+'</h1><span class="spacer"></span>'+
      '<button class="btn btn-primary btn-sm" data-action="addResidentModal">'+App.icon("plus",15)+t("addResident")+'</button></div>';
    if(pending.length){
      html+='<div class="card" style="border:1.5px solid var(--gold)"><div class="card-title">'+t("pendingRequests")+' ('+pending.length+')</div>';
      pending.forEach(u=>{
        html+='<div class="approval-card"><span class="ph">'+App.avatar(u.name,"av-md")+'</span>'+
          '<div class="grow"><div class="bold">'+App.esc(u.name)+'</div><div class="small muted">'+App.esc(u.phone)+' · '+t("flatNo")+" "+(u.wantsFlat?App.esc(S.flatKey(S.flatById(u.wantsFlat))):"")+'</div></div></div>'+
          '<div class="approval-actions"><button class="btn btn-success" data-action="approveMember" data-id="'+u.id+'">✓ '+t("approveBtn")+'</button><button class="btn btn-danger-soft" data-action="rejectMember" data-id="'+u.id+'">✕ '+t("rejectBtn")+'</button></div>';
      });
      html+='</div>';
    }
    html+='<div class="card"><div class="card-title">'+t("roster")+' <span class="count">('+allRes.length+' '+t("residentsList")+')</span></div>';
    html+='<div class="search-bar mb"><span>'+App.icon("search",17)+'</span><input id="memQ" placeholder="'+t("searchResidents")+'"></div>';
    let lastFlat="";
    allRes.forEach(r=>{
      const u=S.userById(r.userId); const f=S.flatById(r.flatId);
      const label=(u.name+" "+S.flatKey(f)).toLowerCase();
      if(q && !label.includes(q)) return;
      if(S.flatKey(f)!==lastFlat){ lastFlat=S.flatKey(f); html+='<div class="bold small" style="background:var(--grey-bg);border-radius:8px;padding:6px 10px;margin:10px 0 4px">'+App.esc(S.flatKey(f))+' · '+App.esc(f.type)+' · '+App.esc(String(f.area))+' sq.ft.</div>'; }
      html+='<div class="list-row">'+App.avatar(u.name,"av-sm")+
        '<div class="grow"><div class="t">'+App.esc(u.name)+'</div><div class="s">'+App.esc(u.phone)+'</div></div>'+
        '<span class="tag">'+t(r.role==="owner"?"owner":r.role==="tenant"?"tenant":"familyMember")+'</span>'+
        (u.status!=="active"?'<span class="chip chip-amber">'+t("pending")+'</span>':"")+
        (u.role!=="admin"?'<button class="btn btn-danger-soft btn-sm" data-action="deactivateMember" data-id="'+u.id+'">'+t("deactivate")+'</button>':"")+'</div>';
    });
    html+='<div class="small muted mt center">'+t("importNote")+'</div></div></div>';
    return html;
  };
  App.act("approveMember", el=>{
    const u=S.userById(el.dataset.id);
    S.setUserStatus(u.id,"active");
    if(u.wantsFlat && !S.get().residencies.some(r=>r.userId===u.id)) S.get().residencies.push({id:"rs"+Math.random().toString(36).slice(2), userId:u.id, flatId:u.wantsFlat, role:"owner", since:S.nowIso()});
    S.notify(u.id,"check",t("memberApproved")+"!", t("welcome")+" — Lumina Estate","/home");
    S.log(App.state.user.name,"member.approve", u.name);
    S.save(); App.render(); App.toast(t("memberApproved")+" ✓","success");
  });
  App.act("rejectMember", el=>{
    const u=S.userById(el.dataset.id);
    S.setUserStatus(u.id,"rejected");
    S.log(App.state.user.name,"member.reject", u.name);
    S.save(); App.render(); App.toast(t("rejectBtn")+" ✓","info");
  });
  App.act("deactivateMember", el=>{
    const u=S.userById(el.dataset.id);
    App.confirmModal(t("deactivate"), u.name+" — "+t("deleteConfirm"), ()=>{
      S.setUserStatus(u.id,"inactive");
      S.log(App.state.user.name,"member.deactivate", u.name);
      S.save(); App.render(); App.toast(t("deactivate")+" ✓","info");
    });
  });
  App.act("addResidentModal", ()=>{
    const flats=S.get().flats.filter(f=>f.occupancy==="occupied");
    App.modal('<div class="field"><label>'+t("fullName")+'</label><input class="inp" id="arName"></div>'+
      '<div class="field"><label>'+t("phone")+'</label><input class="inp" id="arPhone" inputmode="numeric"></div>'+
      '<div class="field"><label>'+t("selectFlat")+'</label><select class="inp" id="arFlat">'+flats.map(f=>'<option value="'+f.id+'">'+App.esc(S.flatKey(f))+'</option>').join("")+'</select></div>'+
      '<div class="field"><label>'+t("role")+'</label><div style="display:flex;gap:8px">'+
      '<button class="btn btn-sm btn-primary" data-action="setArRole" data-id="owner">'+t("owner")+'</button>'+
      '<button class="btn btn-sm btn-ghost" data-action="setArRole" data-id="tenant">'+t("tenant")+'</button>'+
      '<button class="btn btn-sm btn-ghost" data-action="setArRole" data-id="family">'+t("familyMember")+'</button></div></div>',
      {title:t("addResident")});
    App.state.tmp.arRole="owner";
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button><button class="btn btn-primary" data-action="saveResident">'+t("save")+'</button></div>');
  });
  App.act("setArRole", el=>{ App.state.tmp.arRole=el.dataset.id; document.querySelectorAll('[data-action="setArRole"]').forEach(b=>{ b.className="btn btn-sm "+(b.dataset.id===el.dataset.id?"btn-primary":"btn-ghost"); }); });
  App.act("saveResident", ()=>{
    const name=(document.getElementById("arName")||{}).value||"";
    const phone=(document.getElementById("arPhone")||{}).value||"";
    const flatId=(document.getElementById("arFlat")||{}).value;
    if(name.trim().length<2||phone.trim().length<10){ App.toast(t("fullName")+" + "+t("phone")+" "+t("required"),"error"); return; }
    const u=S.createUser({name:name.trim(), phone:phone.trim(), role:App.state.tmp.arRole||"owner", status:"active", flatId});
    S.log(App.state.user.name,"member.add", u.name+" — "+S.flatKey(S.flatById(flatId)));
    S.save(); App.closeModal(); App.render(); App.toast(t("saved")+" ✓","success");
  });

  /* ---- Approvals view (alias) ---- */
  App.views.admApprovals = App.views.admMembers;

  /* ================= SETTINGS ================= */
  App.views.admSettings = function(){
    const st=S.get(), s=st.settings;
    let html='<div class="page fade"><div class="page-head"><h1>'+t("settings")+'</h1></div>';
    html+='<div class="dash-note">'+App.icon("info",17)+t("settingsNote")+'</div>';
    html+='<div class="card"><div class="card-title">'+t("billingPolicy")+'</div>'+
      '<div style="display:flex;gap:10px"><div class="field" style="flex:1"><label>'+t("graceDays")+'</label><input class="inp" id="setGrace" type="number" min="0" value="'+(s.lateFee.graceDays)+'"></div>'+
      '<div class="field" style="flex:1"><label>'+t("lateFeeAmount")+'</label><input class="inp" id="setFee" type="number" min="0" value="'+(s.lateFee.amount)+'"></div></div>'+
      '<label style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px dotted var(--border)"><span class="bold small">'+t("tenantBilling")+'</span><label class="switch"><input type="checkbox" id="setTenant" '+(s.tenantBillingVisible?"checked":"")+'><span class="sl"></span></label></label></div>';
    html+='<div class="card"><div class="card-title">'+t("visitorPolicy")+'</div><div class="field"><label>'+t("approvalTimeout")+'</label><select class="inp" id="setTimeout">'+
      '<option value="family_cascade" '+(s.approvalTimeout==="family_cascade"?"selected":"")+'>'+t("familyCascade")+'</option>'+
      '<option value="guard_discretion" '+(s.approvalTimeout==="guard_discretion"?"selected":"")+'>'+t("guardDiscretion")+'</option>'+
      '<option value="auto_deny" '+(s.approvalTimeout==="auto_deny"?"selected":"")+'>'+t("autoDeny")+'</option></select></div></div>';
    html+='<button class="btn btn-gold btn-lg btn-block" data-action="saveSettings">'+App.icon("check",17)+t("saveSettings")+'</button>';
    html+='<div class="card mt"><div class="card-title">'+t("handover")+'</div><div class="small muted">'+t("handoverNote")+'</div>'+
      '<button class="btn btn-ghost btn-sm mt" data-action="handoverDemo">'+App.icon("users",14)+t("handover")+'</button></div></div>';
    return html;
  };
  App.act("saveSettings", ()=>{
    const s=S.get().settings;
    s.lateFee.graceDays=Number((document.getElementById("setGrace")||{}).value||5);
    s.lateFee.amount=Number((document.getElementById("setFee")||{}).value||100);
    s.tenantBillingVisible=(document.getElementById("setTenant")||{}).checked;
    s.approvalTimeout=(document.getElementById("setTimeout")||{}).value;
    S.log(App.state.user.name,"settings.save","Late fee: "+s.lateFee.amount+" / "+s.lateFee.graceDays+"d; timeout: "+s.approvalTimeout);
    S.save(); App.toast(t("settingsSaved")+" ✓","success");
  });
  App.act("handoverDemo", ()=>{
    S.log(App.state.user.name,"committee.handover","Handover packet generated (demo) — zero data loss");
    S.save(); App.toast(t("handoverNote")+" ✓","success");
  });

  /* ================= EXPENSES (admin) ================= */
  App.views.admExpenses = function(){
    const st=S.get(), sel=App.state.tmp.exMonth||S.nowMonth();
    const months=[]; for(let i=0;i<4;i++){ const d=new Date(); d.setMonth(d.getMonth()-i); months.push(d.getFullYear()+"-"+S.pad(d.getMonth()+1)); }
    const exps=st.expenses.filter(e=>S.monthOf(e.date)===sel);
    let html='<div class="page fade"><div class="page-head"><h1>'+t("expenses")+'</h1><span class="spacer"></span>'+
      '<select class="inp" style="width:150px" id="exMonth">'+months.map(m=>'<option value="'+m+'" '+(m===sel?"selected":"")+'>'+t("months")[Number(m.split("-")[1])-1]+" "+m.split("-")[0]+'</option>').join("")+'</select>'+
      '<button class="btn btn-primary btn-sm" data-action="addExpenseModal">'+App.icon("plus",15)+t("addExpense")+'</button></div>';
    html+='<div class="stat-tile mb" style="padding:18px"><div class="stat-value" style="color:var(--red)">'+App.fmt(exps.filter(e=>e.status==="active").reduce((a,e)=>a+e.amount,0))+'</div><div class="stat-label">'+t("expenseTotal")+'</div></div>';
    exps.forEach(e=>{
      html+='<div class="card card-pad-sm" style="display:flex;align-items:center;gap:12px">'+
        '<span class="thumb" style="background:'+catColor(e.category)+'20;color:'+catColor(e.category)+'">'+catIcon(e.category)+'</span>'+
        '<div class="grow"><div class="bold">'+App.esc(e.vendor)+'</div><div class="small muted">'+catLabel(e.category)+' · '+App.fmtDate(e.date)+' · '+modeLabel(e.mode)+(e.receipt?" · 📎":"")+(e.note?" · "+App.esc(e.note):"")+'</div></div>'+
        (e.status==="void"? App.chip("void"):'<span class="bold">'+App.fmt(e.amount)+'</span>')+
        (e.status!=="void"?'<button class="btn btn-danger-soft btn-sm" data-action="voidExpense" data-id="'+e.id+'">'+t("voidExpense")+'</button>':"")+'</div>';
    });
    html+='</div>';
    return html;
  };
  App.act("addExpenseModal", ()=>{
    const cats=[["security","securityCat"],["housekeeping","housekeeping"],["electricity","electrical"],["amc","maintenance"],["repairs","civil"],["events","event"],["other","other"]];
    App.modal('<div class="field"><label>'+t("vendorName")+'</label><input class="inp" id="exVendor"></div>'+
      '<div class="field"><label>'+t("amount")+' (₹)</label><input class="inp" id="exAmount" inputmode="numeric"></div>'+
      '<div class="field"><label>'+t("expenseCat")+'</label><div style="display:flex;gap:7px;flex-wrap:wrap">'+cats.map(c=>'<button class="btn btn-sm btn-ghost ex-cat" data-action="setExCat" data-id="'+c[0]+'">'+t(c[1])+'</button>').join("")+'</div></div>'+
      '<div class="field"><label>'+t("mode")+'</label><div style="display:flex;gap:7px">'+["cash","cheque","neft"].map(m=>'<button class="btn btn-sm btn-ghost ex-mode" data-action="setExMode" data-id="'+m+'">'+t(m)+'</button>').join("")+'</div></div>'+
      '<div class="field"><label>'+t("expenseNote")+'</label><input class="inp" id="exNote"></div>',
      {title:t("addExpense")});
    App.state.tmp.exCat="security"; App.state.tmp.exMode="cash";
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button><button class="btn btn-gold" data-action="saveExpense">'+t("save")+'</button></div>');
  });
  App.act("setExCat", el=>{ App.state.tmp.exCat=el.dataset.id; document.querySelectorAll(".ex-cat").forEach(b=>{ b.className="btn btn-sm "+(b.dataset.id===el.dataset.id?"btn-primary":"btn-ghost"); }); });
  App.act("setExMode", el=>{ App.state.tmp.exMode=el.dataset.id; document.querySelectorAll(".ex-mode").forEach(b=>{ b.className="btn btn-sm "+(b.dataset.id===el.dataset.id?"btn-primary":"btn-ghost"); }); });
  App.act("saveExpense", ()=>{
    const vendor=(document.getElementById("exVendor")||{}).value||"";
    const amount=Number((document.getElementById("exAmount")||{}).value||0);
    if(vendor.trim().length<2||amount<=0){ App.toast(t("vendorName")+" + "+t("amount")+" "+t("required"),"error"); return; }
    S.addExpense({category:App.state.tmp.exCat||"other", amount, vendor:vendor.trim(), mode:App.state.tmp.exMode||"cash", note:(document.getElementById("exNote")||{}).value||""});
    S.log(App.state.user.name,"expense.add", vendor+" — "+App.fmt(amount));
    S.save(); App.closeModal(); App.render(); App.toast(t("expenseAdded")+" ✓","success");
  });
  App.act("voidExpense", el=>{
    const e=S.get().expenses.find(x=>x.id===el.dataset.id);
    App.confirmModal(t("voidExpense"), t("voidConfirm"), ()=>{
      S.voidExpense(e.id);
      S.log(App.state.user.name,"expense.void", e.vendor+" — "+App.fmt(e.amount));
      S.save(); App.render(); App.toast(t("voided")+" ✓","info");
    });
  });

  /* ================= AUDIT ================= */
  App.views.admAudit = function(){
    const st=S.get();
    let html='<div class="page fade"><div class="page-head"><h1>'+t("auditLog")+'</h1></div><div class="card"><div class="table-wrap"><table>'+
      '<tr><th>'+t("time")+'</th><th>'+t("user")+'</th><th>'+t("action")+'</th><th>'+t("details")+'</th></tr>';
    st.auditLog.slice(0,60).forEach(a=>{
      html+='<tr><td class="small nowrap">'+App.fmtDateTime(a.at)+'</td><td class="bold">'+App.esc(a.actor)+'</td><td><span class="tag">'+App.esc(a.action)+'</span></td><td class="small">'+App.esc(a.detail)+'</td></tr>';
    });
    html+='</table></div></div></div>';
    return html;
  };

  /* ---- document upload (admin) ---- */
  App.act("uploadDocModal", ()=>{
    const folders=S.get().folders;
    App.modal('<div class="field"><label>'+t("docTitle")+'</label><input class="inp" id="upTitle"></div>'+
      '<div class="field"><label>'+t("folders")+'</label><select class="inp" id="upFolder">'+folders.map(fd=>'<option value="'+fd.id+'">'+t(fd.nameKey)+'</option>').join("")+'</select></div>'+
      '<div class="field"><label>'+t("accessLevel")+'</label><select class="inp" id="upAccess">'+
      '<option value="all">'+t("allResidents")+'</option><option value="committee">'+t("committeeOnly")+'</option><option value="admin">'+t("adminOnly")+'</option></select></div>'+
      '<div class="field"><label>'+t("attachFile")+'</label><button class="btn btn-ghost btn-block" data-action="pickDocFile">'+App.icon("file",16)+t("chooseFile")+'</button>'+
      '<div class="hint" id="upFileHint"></div></div>',
      {title:t("uploadDoc")});
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button><button class="btn btn-primary" data-action="saveDoc">'+t("upload")+'</button></div>');
  });
  App.act("pickDocFile", ()=>{
    const inp=document.createElement("input");
    inp.type="file";
    inp.onchange=function(){
      const f=inp.files&&inp.files[0];
      App.state.tmp.docFile={name:f?f.name:"file.pdf", size:f?f.size:0};
      const hint=document.getElementById("upFileHint");
      if(hint) hint.textContent="✓ "+t("fileAdded");
    };
    inp.click();
  });
  App.act("saveDoc", ()=>{
    const title=(document.getElementById("upTitle")||{}).value||"";
    if(title.trim().length<3){ App.toast(t("docTitle")+" "+t("required"),"error"); return; }
    const folder=(document.getElementById("upFolder")||{}).value;
    const access=(document.getElementById("upAccess")||{}).value;
    const f=App.state.tmp.docFile;
    S.addDocument({folder, title:title.trim(), access, uploadedBy:App.state.user.name,
      size:f? (f.size>1048576? (f.size/1048576).toFixed(1)+" MB" : Math.round(f.size/1024)+" KB") : "—",
      body:"Uploaded by "+App.state.user.name+" — demo stores metadata only."});
    S.log(App.state.user.name,"doc.upload", title.trim());
    S.save(); App.closeModal(); App.render(); App.toast(t("saved")+" ✓","success");
  });

  /* shared helpers */
  function catIcon(c){
    const m={plumbing:"drop", electrical:"zap", lift:"lift", housekeeping:"broom", security:"shield", civil:"wrench",
      commonArea:"plant", other:"info", maintenance:"wrench", amc:"wrench", repairs:"wrench", events:"sparkle",
      guest:"user", delivery:"delivery", cab:"taxi", daily_staff:"hand", service:"wrench"};
    return App.icon(m[c]||"info",20);
  }
  function catColor(c){
    const m={plumbing:"#1565C0", electrical:"#F9A825", lift:"#6A3FA0", housekeeping:"#2E7D32", security:"#1F3A5F", civil:"#C62828",
      commonArea:"#0F766E", other:"#5E6C80", maintenance:"#B45309", amc:"#6A3FA0", repairs:"#1565C0", events:"#B45309",
      guest:"#1F3A5F", delivery:"#C98A2D", cab:"#1565C0", daily_staff:"#2E7D32", service:"#6A3FA0"};
    return m[c]||"#5E6C80";
  }
  function catLabel(c){
    const m={plumbing:"plumbing", electrical:"electrical", lift:"lift", housekeeping:"housekeeping", security:"securityCat",
      civil:"civil", commonArea:"commonArea", other:"other", maintenance:"maintenance", amc:"maintenance", repairs:"civil",
      events:"event", guest:"guest", delivery:"delivery", cab:"cab", daily_staff:"dailyStaff", service:"serviceVendor"};
    return t(m[c]||c);
  }
  function modeLabel(m){ const mm={upi:"UPI", card:t("card"), netbanking:t("netbanking"), cash:t("cash"), cheque:t("cheque"), neft:"NEFT"}; return mm[m]||m||"—"; }
})();
