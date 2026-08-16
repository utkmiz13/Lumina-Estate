/* Lumina Estate — Resident views (owner/tenant/family) */
window.App = window.App || {};
App.views = App.views || {};
App.act = App.act || function(name, fn){ App.actions = App.actions||{}; App.actions[name]=fn; };

(function(){
  const t = (k)=>App.t(k);
  const S = Store;

  function flatOfUser(){ return S.flatOf(App.state.user.id); }
  function myFlatKey(){ const f=flatOfUser(); return f? S.flatKey(f):""; }
  function myResidency(){ const r=S.get().residencies.find(r=>r.userId===App.state.user.id); return r; }

  /* ================= DASHBOARD ================= */
  App.views.resHome = function(){
    const u=App.state.user, st=S.get();
    const f=flatOfUser();
    const unpaid = f? S.unpaidBillsFor(f.id):[];
    const due = f? S.totalDueFor(f.id):0;
    const hour=new Date().getHours();
    const greet = hour<5?t("goodEvening"):hour<12?t("goodMorning"):hour<17?t("goodAfternoon"):t("goodEvening");

    let html = '<div class="page fade">';
    html += '<div class="page-head"><div><h1>'+t("hello")+", "+App.esc(u.name.split(" ")[0])+'! 👋</h1><div class="sub">'+t("dashSub")+'</div></div></div>';

    // Pending approvals banner
    const pendingApprovals = myVisitorRequests();
    if(pendingApprovals.length){
      html += '<div class="dash-note" data-action="go" data-arg="/gate" style="cursor:pointer">'+App.icon("gate",17)+
        '<span><b>'+pendingApprovals.length+'</b> '+t("approveRequest")+" — "+App.esc(pendingApprovals[0].name)+'</span></div>';
    }

    // Dues hero (owner/tenant only — family members have no billing)
    if(f && u.role!=="family"){
      if(unpaid.length){
        const nextDue = unpaid[0];
        const days = Math.max(0, Math.floor((Date.now()-new Date(nextDue.dueDate))/86400000));
        html += '<div class="dues-hero"><span class="kicker">'+t("pendingDues")+'</span>'+
          '<div class="amount">'+App.fmt(due)+'</div>'+
          '<div class="due-date">'+t("dueDate")+": "+App.fmtDate(nextDue.dueDate)+
          (days>0? ' · <b style="color:#FFD6A5">'+days+' '+t("daysOverdue")+'</b>':"")+'</div>'+
          '<button class="btn" data-action="go" data-arg="/bills">'+App.icon("rupee",17)+t("payNow")+'</button></div>';
      } else {
        html += '<div class="dues-hero green"><span class="kicker">'+t("noDues")+'</span>'+
          '<div class="amount">'+App.icon("check",30)+'</div><div class="due-date">'+t("noDuesMsg")+'</div></div>';
      }
    } else {
      html += '<div class="dash-note warn-note">'+App.icon("info",17)+t("pendingApprovalMsg")+'</div>';
    }

    // Quick actions
    if(u.role!=="family"){
      const qa = [
        ["rupee","#E8F0FB","#1565C0","payNow","/bills"],
        ["complaint","#FBEAEA","#C62828","raiseComplaint","/complaints/new"],
        ["gate","#E8F3E9","#2E7D32","preApprove","/gate"],
        ["calendar","#FBF3E4","#C98A2D","bookFacility","/bookings"],
        ["notice","#F0E9F8","#6A3FA0","viewNotices","/notices"],
        ["sos","#FBEAEA","#C62828","sos","/emergency"]
      ];
      html += '<div class="card card-pad-sm"><div class="card-title">'+t("quickActions")+'</div><div class="quick-grid">';
      qa.forEach(q=>{
        html += '<button class="quick-item" data-action="go" data-arg="'+q[4]+'"><span class="qico" style="background:'+q[1]+';color:'+q[2]+'">'+App.icon(q[0],21)+'</span>'+t(q[3])+'</button>';
      });
      html += '</div></div>';
    }

    // Active SOS status
    if(st.sosAlerts){
      const mine=st.sosAlerts.find(a=>a.userId===u.id && a.status!=="responding" );
      if(mine) html += '<div class="sos-alert"><span class="sa-ic">'+App.icon("sos",22)+'</span><div><div class="bold">'+t("helpComing")+'</div><div class="small muted">'+t("sosSentMsg")+'</div></div></div>';
    }

    // 2-col grid
    html += '<div class="grid grid-2">';

    // Latest notices
    html += '<div class="card"><div class="card-title">'+t("latestNotices")+'<span class="link" data-action="go" data-arg="/notices">'+t("viewAll")+' →</span></div>';
    const notices=st.notices.slice(0,3);
    if(!notices.length) html += App.empty("noNotices","emptyMsg");
    notices.forEach(n=>{ html += noticeCard(n, false); });
    html += '</div>';

    // My complaints
    html += '<div class="card"><div class="card-title">'+t("activeComplaints")+'<span class="link" data-action="go" data-arg="/complaints">'+t("viewAll")+' →</span></div>';
    const myComplaints=st.complaints.filter(c=>c.flatId===f?.id || c.createdBy===u.id).slice(0,2);
    if(!myComplaints.length) html += App.empty("noComplaints","emptyMsg");
    myComplaints.forEach(c=>{ html += complaintRow(c); });
    html += '</div>';

    // Today's visitors
    html += '<div class="card"><div class="card-title">'+t("todaysVisitors")+'<span class="link" data-action="go" data-arg="/gate">'+t("viewAll")+' →</span></div>';
    const todays=st.visitors.filter(v=>f && v.flatIds.includes(f.id) && new Date(v.inAt).toDateString()===new Date().toDateString()).slice(0,3);
    if(!todays.length) html += App.empty("noVisitors","emptyMsg");
    todays.forEach(v=>{ html += visitorRow(v); });
    html += '</div>';

    // Active poll
    const activePoll=st.polls.find(p=>p.status==="active");
    html += '<div class="card"><div class="card-title">'+t("activePoll")+'<span class="link" data-action="go" data-arg="/polls">'+t("viewAll")+' →</span></div>';
    if(activePoll) html += pollCard(activePoll, f?.id);
    else html += App.empty("emptyTitle","emptyMsg");
    html += '</div>';

    html += '</div></div>';
    return html;
  };

  function noticeCard(n, showCat){
    const catKey = "cat-"+n.category;
    return '<div class="notice-card '+catKey+'" data-action="go" data-arg="/notice/'+n.id+'">'+
      '<div class="nm">'+(n.pinned?'<span class="pin-ic">'+App.icon("notice",13)+'</span>':"")+
      '<span class="tag">'+t(n.category==="emergency"?"emergencyCat":n.category==="meeting"?"meeting":n.category==="financial"?"financial":n.category==="event"?"event":n.category==="maintenance"?"maintenance":"general")+'</span>'+
      (n.category==="emergency"?'<span class="tag" style="background:var(--red-bg);color:var(--red)">⚠</span>':"")+
      '<span class="small muted" style="margin-left:auto">'+App.relTime(n.createdAt)+'</span></div>'+
      '<div class="nt">'+App.esc(n.title)+'</div>'+
      '<div class="np">'+App.esc(n.body.slice(0,110))+'</div></div>';
  }
  function complaintRow(c){
    return '<div class="list-row" data-action="go" data-arg="/complaint/'+c.id+'">'+
      '<span class="thumb" style="background:'+catColor(c.category)+'20;color:'+catColor(c.category)+'">'+catIcon(c.category)+'</span>'+
      '<div class="grow"><div class="t">'+App.esc(c.title)+'</div><div class="s">'+App.esc(c.ticketNo)+' · '+App.relTime(c.createdAt)+'</div></div>'+
      App.chip(c.status)+'</div>';
  }
  function visitorRow(v){
    return '<div class="list-row"><span class="thumb" style="background:'+catColor(v.category)+'20;color:'+catColor(v.category)+'">'+catIcon(v.category)+'</span>'+
      '<div class="grow"><div class="t">'+App.esc(v.name)+'</div><div class="s">'+App.fmtTime(v.inAt)+(v.outAt? " → "+App.fmtTime(v.outAt):" · "+t("stillInside"))+'</div></div>'+
      App.chip(v.approval)+'</div>';
  }

  function catIcon(c){
    const m={plumbing:"drop", electrical:"zap", lift:"lift", housekeeping:"broom", security:"shield", civil:"wrench",
      commonArea:"plant", other:"info", maintenance:"wrench", guest:"user", delivery:"delivery", cab:"taxi",
      daily_staff:"hand", service:"wrench"};
    return App.icon(m[c]||"info", 20);
  }
  function catColor(c){
    const m={plumbing:"#1565C0", electrical:"#F9A825", lift:"#6A3FA0", housekeeping:"#2E7D32", security:"#1F3A5F", civil:"#C62828",
      commonArea:"#0F766E", other:"#5E6C80", maintenance:"#B45309", guest:"#1F3A5F", delivery:"#C98A2D", cab:"#1565C0",
      daily_staff:"#2E7D32", service:"#6A3FA0"};
    return m[c]||"#5E6C80";
  }
  function catLabel(c){
    const m={plumbing:"plumbing", electrical:"electrical", lift:"lift", housekeeping:"housekeeping", security:"securityCat",
      civil:"civil", commonArea:"commonArea", other:"other", maintenance:"maintenance", guest:"guest", delivery:"delivery",
      cab:"cab", daily_staff:"dailyStaff", service:"serviceVendor", amc:"maintenance", events:"event", repairs:"civil"};
    return t(m[c]||c);
  }

  /* ================= BILLS ================= */
  App.views.resBills = function(){
    const u=App.state.user, st=S.get(), f=flatOfUser();
    if(!f) return '<div class="page">'+App.empty("noBills","emptyMsg")+'</div>';
    const bills=S.billsFor(f.id);
    const unpaid=S.unpaidBillsFor(f.id);
    const due=S.totalDueFor(f.id);
    const paid=S.paidBillsFor(f.id);
    const paidTotal=paid.reduce((a,b)=>a+(b.paidAmount||0),0);

    let html='<div class="page fade"><div class="page-head"><h1>'+t("bills")+'</h1><span class="spacer"></span></div>';
    if(unpaid.length){
      html+='<div class="dues-hero"><span class="kicker">'+t("pendingDues")+'</span><div class="amount">'+App.fmt(due)+'</div>'+
        '<div class="due-date">'+unpaid.length+' '+t("ofFlats")+' · '+t("overdue")+': '+App.fmt(unpaid.filter(b=>new Date(b.dueDate)<new Date()).reduce((a,b)=>a+S.billTotal(b),0))+'</div>'+
        '<button class="btn" data-action="payTopBill">'+App.icon("rupee",17)+t("payNow")+'</button></div>';
    } else {
      html+='<div class="dues-hero green"><span class="kicker">'+t("noDues")+'</span><div class="amount">'+App.icon("check",30)+'</div><div class="due-date">'+t("noDuesMsg")+'</div></div>';
    }
    html+='<div class="card"><div class="card-title">'+t("myBill")+'</div>';
    if(!bills.length) html+=App.empty("noBills","emptyMsg");
    bills.forEach(b=>{
      const total=S.billTotal(b);
      html+='<div class="list-row" data-action="go" data-arg="/bill/'+b.id+'">'+
        '<span class="thumb" style="background:var(--blue-bg);color:var(--blue)">'+App.icon("bill",20)+'</span>'+
        '<div class="grow"><div class="t">'+b.period+" — "+t("maintenance")+'</div><div class="s">'+App.esc(b.number)+' · '+t("dueDate")+": "+App.fmtDate(b.dueDate)+'</div></div>'+
        '<div style="text-align:right"><div class="bold">'+App.fmt(total)+'</div>'+App.chip(b.status==="paid"?"paid":(new Date(b.dueDate)<new Date()?"overdue":"unpaid"))+'</div></div>';
    });
    html+='</div>';

    html+='<div class="card"><div class="card-title">'+t("paymentHistory")+' · <span class="muted small">'+t("totalCollected")+": "+App.fmt(paidTotal)+'</span></div>';
    const pays=st.payments.filter(p=>p.flatId===f.id && p.status==="success").sort((a,b)=>a.at<b.at?1:-1);
    if(!pays.length) html+=App.empty("emptyTitle","emptyMsg");
    pays.forEach(p=>{
      html+='<div class="list-row" data-action="go" data-arg="/receipt/'+p.id+'">'+
        '<span class="thumb" style="background:var(--green-bg);color:var(--green)">'+App.icon("check",20)+'</span>'+
        '<div class="grow"><div class="t">'+App.fmt(p.amount)+'</div><div class="s">'+App.esc(p.receiptNo)+' · '+modeLabel(p.mode)+' · '+App.fmtDateTime(p.at)+'</div></div>'+
        App.chip("success")+'</div>';
    });
    html+='</div>';
    html+='<div class="center"><button class="btn btn-ghost btn-sm" data-action="go" data-arg="/ledger">'+App.icon("docs",15)+t("ledger")+'</button></div></div>';
    return html;
  };

  function modeLabel(m){ const mm={upi:"UPI", card:t("card"), netbanking:t("netbanking"), cash:t("cash"), cheque:t("cheque"), neft:"NEFT"}; return mm[m]||m||"—"; }

  App.views.resBillDetail = function(p){
    const b=S.get().bills.find(x=>x.id===p.id);
    if(!b) return App.notFoundView();
    const f=S.flatById(b.flatId);
    const isOwnerFlat = flatOfUser()?.id===b.flatId;
    if(!isOwnerFlat) return App.notFoundView();
    const total=S.billTotal(b);
    const lf=S.lateFeeNow(b);
    const paid = b.status==="paid";
    const daysOver = Math.max(0, Math.floor((Date.now()-new Date(b.dueDate))/86400000));

    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/bills">'+App.icon("back",18)+'</button><h1>'+t("billDetails")+'</h1></div>';
    html+='<div class="card"><div class="bill-total"><div class="small muted">'+t("netPayable")+'</div><div class="amt">'+App.fmt(total)+'</div>'+
      '<div style="margin-top:8px">'+App.chip(paid?"paid":(daysOver>0?"overdue":"unpaid"))+(lf>0?' <span class="chip chip-red">'+t("lateFeeApplied")+': '+App.fmt(lf)+'</span>':"")+'</div></div>';
    html+='<div class="kv"><span class="k">'+t("billNo")+'</span><span class="v">'+App.esc(b.number)+'</span></div>';
    html+='<div class="kv"><span class="k">'+t("flatNo")+'</span><span class="v">'+App.esc(S.flatKey(f))+' · '+App.esc(f.type)+' · '+App.esc(String(f.area))+' sq.ft.</span></div>';
    html+='<div class="kv"><span class="k">'+t("date")+'</span><span class="v">'+App.fmtDate(b.publishedAt)+'</span></div>';
    html+='<div class="kv"><span class="k">'+t("dueDate")+'</span><span class="v">'+App.fmtDate(b.dueDate)+'</span></div></div>';

    html+='<div class="card"><div class="card-title">'+t("lineItems")+'</div>';
    b.items.forEach(i=>{
      html+='<div class="bill-line"><span class="bl">'+App.esc(i.label.en)+'</span><span class="bv">'+App.fmt(i.amount)+'</span></div>';
    });
    if(b.arrears>0) html+='<div class="bill-line"><span class="bl">'+t("arrears")+'</span><span class="bv" style="color:var(--red)">+'+App.fmt(b.arrears)+'</span></div>';
    if(lf>0) html+='<div class="bill-line"><span class="bl">'+t("lateFee")+'</span><span class="bv" style="color:var(--red)">+'+App.fmt(lf)+'</span></div>';
    if(paid){
      html+='<div class="bill-line"><span class="bl">'+t("paid")+'</span><span class="bv" style="color:var(--green)">−'+App.fmt(b.paidAmount)+'</span></div>';
    }
    html+='<div class="bill-line total"><span class="bl">'+t("netPayable")+'</span><span class="bv">'+App.fmt(paid?0:total)+'</span></div>';
    if(paid){
      const pay=S.get().payments.find(x=>x.billId===b.id && x.status==="success");
      if(pay) html+='<div style="margin-top:10px"><button class="btn btn-ghost btn-sm" data-action="go" data-arg="/receipt/'+pay.id+'">'+App.icon("print",15)+t("viewReceipts")+'</button></div>';
    }
    html+='</div>';
    if(!paid){
      html+='<div class="pay-sticky"><button class="btn btn-gold btn-lg btn-block" data-action="startPay" data-id="'+b.id+'">'+App.icon("rupee",19)+t("payInFull")+" — "+App.fmt(total)+'</button></div>';
    }
    html+='</div>';
    return html;
  };

  App.views.resLedger = function(){
    const f=flatOfUser();
    if(!f) return App.notFoundView();
    const rows=S.ledgerFor(f.id);
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/bills">'+App.icon("back",18)+'</button><h1>'+t("ledger")+'</h1><span class="spacer"></span><button class="btn btn-ghost btn-sm" data-action="exportLedger">'+App.icon("download",15)+'CSV</button></div><div class="card"><div class="table-wrap"><table>'+
      '<tr><th>'+t("date")+'</th><th>'+t("action")+'</th><th style="text-align:right">'+t("debit")+'</th><th style="text-align:right">'+t("credit")+'</th><th style="text-align:right">'+t("runningBalance")+'</th></tr>';
    rows.slice().reverse().forEach(r=>{
      html+='<tr><td class="small">'+App.fmtDate(r.at)+'</td><td>'+App.esc(r.label)+'</td>'+
        '<td style="text-align:right">'+(r.kind==="debit"?App.fmt(r.amount):"—")+'</td>'+
        '<td style="text-align:right">'+(r.kind==="credit"?App.fmt(r.amount):"—")+'</td>'+
        '<td style="text-align:right" class="bold">'+App.fmt(r.balance)+'</td></tr>';
    });
    html+='</table></div></div></div>';
    return html;
  };

  /* ================= RECEIPT ================= */
  App.views.resReceipt = function(p){
    const pay=S.get().payments.find(x=>x.id===p.id);
    if(!pay) return App.notFoundView();
    const f=S.flatById(pay.flatId);
    const residents=S.residentsOfFlat(pay.flatId);
    const owner=residents.find(r=>r.role==="owner");
    const u=App.state.user;
    if(f?.id!==flatOfUser()?.id && u.role!=="admin") return App.notFoundView();
    let html='<div class="page fade no-print"><div class="page-head"><button class="back-btn" data-action="historyBack">'+App.icon("back",18)+'</button><h1>'+t("receipt")+'</h1><span class="spacer"></span>'+
      '<button class="btn btn-ghost btn-sm" data-action="printReceipt">'+App.icon("print",15)+t("printReceipt")+'</button></div></div>';
    html+='<div class="page"><div class="receipt print-area">'+
      '<div class="r-head"><div><div class="r-title">'+App.esc(S.get().settings?.societyName||"Green Valley Residency")+'</div>'+
      '<div class="small muted">Gomti Nagar Extension, Lucknow — Reg. No. UPSA/2010/LKO/4821</div>'+
      '<div class="small muted bold" style="margin-top:6px">'+t("receipt")+' · '+App.esc(pay.receiptNo)+'</div></div>'+
      '<div class="r-ok">'+App.icon("check",26)+'</div></div>'+
      '<div class="kv"><span class="k">'+t("receiptNo")+'</span><span class="v">'+App.esc(pay.receiptNo)+'</span></div>'+
      '<div class="kv"><span class="k">'+t("date")+'</span><span class="v">'+App.fmtDateTime(pay.at)+'</span></div>'+
      '<div class="kv"><span class="k">'+t("flatNo")+'</span><span class="v">'+App.esc(S.flatKey(f))+'</span></div>'+
      '<div class="kv"><span class="k">'+t("ownerName")+'</span><span class="v">'+(owner?App.esc(owner.user.name):"—")+'</span></div>'+
      '<div class="kv"><span class="k">'+t("method")+'</span><span class="v">'+modeLabel(pay.mode)+' · '+App.esc(pay.ref||"—")+'</span></div>'+
      '<div class="kv"><span class="k">'+t("transactionId")+'</span><span class="v">'+App.esc(pay.ref||"—")+'</span></div>'+
      '<div class="bill-line total"><span class="bl">'+t("amount")+'</span><span class="bv">'+App.fmt(pay.amount)+'</span></div>'+
      '<div class="small muted center" style="margin-top:14px">'+t("paySuccessMsg")+'<br>Computer-generated receipt — signature not required</div></div></div>';
    return html;
  };

  /* ================= COMPLAINTS ================= */
  App.views.resComplaints = function(p){
    const st=S.get(), f=flatOfUser();
    const tab=p.tab||"mine";
    let html='<div class="page fade"><div class="page-head"><h1>'+t("complaints")+'</h1><span class="spacer"></span>'+
      '<button class="btn btn-primary btn-sm" data-action="go" data-arg="/complaints/new">'+App.icon("plus",15)+t("newComplaint")+'</button></div>';
    html+='<div class="tabs"><button class="tab '+(tab==="mine"?"active":"")+'" data-action="go" data-arg="/complaints">'+t("myComplaints")+'</button>'+
      '<button class="tab '+(tab==="community"?"active":"")+'" data-action="go" data-arg="/complaints/community">'+t("communityComplaints")+'</button></div>';
    html+='<div class="card">';
    if(tab==="mine"){
      const mine=st.complaints.filter(c=>c.flatId===f?.id || c.createdBy===App.state.user.id);
      if(!mine.length) html+=App.empty("noComplaints","emptyMsg");
      mine.forEach(c=>html+=complaintRow(c));
    } else {
      const comm=st.complaints.filter(c=>c.community);
      if(!comm.length) html+=App.empty("noComplaints","emptyMsg");
      comm.forEach(c=>{ html+=complaintRow(c); });
    }
    html+='</div></div>';
    return html;
  };

  App.views.resNewComplaint = function(){
    const tmp=App.state.tmp; const f=flatOfUser();
    const cats=[["plumbing","drop"],["electrical","zap"],["lift","lift"],["housekeeping","broom"],["security","shield"],["civil","wrench"],["commonArea","plant"],["other","info"]];
    const sel=tmp.cmpCat||"plumbing";
    const loc=tmp.cmpLoc||(f?"flat":"common");
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/complaints">'+App.icon("back",18)+'</button><h1>'+t("newComplaint")+'</h1></div>';
    html+='<div class="card"><div class="field"><label>'+t("complaintCategory")+'</label><div class="cat-grid">';
    cats.forEach(c=>{
      html+='<button class="cat-item '+(sel===c[0]?"sel":"")+'" data-action="setCmpCat" data-id="'+c[0]+'" style="color:'+(sel===c[0]?"var(--navy)":catColor(c[0]))+'">'+App.icon(c[1],22)+'<span>'+catLabel(c[0])+'</span></button>';
    });
    html+='</div></div>';
    html+='<div class="field"><label>'+t("describeIssue")+' *</label><textarea class="inp" id="cmpDesc" placeholder="'+t("minChars")+'...">'+App.esc(tmp.cmpDesc||"")+'</textarea></div>';
    html+='<div class="field"><label>'+t("location")+'</label><div style="display:flex;gap:9px">'+
      (f?'<button class="btn '+(loc==="flat"?"btn-primary":"btn-ghost")+' btn-sm" data-action="setCmpLoc" data-id="flat">'+t("myFlatOnly")+(f?" ("+App.esc(S.flatKey(f))+")":"")+'</button>':"")+
      '<button class="btn '+(loc==="common"?"btn-primary":"btn-ghost")+' btn-sm" data-action="setCmpLoc" data-id="common">'+t("commonAreaOnly")+'</button></div></div>';
    html+='<div class="field"><label>'+t("photoProof")+'</label><div class="photo-pick">';
    for(let i=0;i<2;i++){
      const ph=tmp.photos&&tmp.photos["cmp"+i];
      html+= ph
        ? '<span class="photo-box"><img src="'+ph+'"><span class="rm" data-action="clearPhoto" data-id="cmp'+i+'">×</span></span>'
        : '<button class="photo-box" data-action="capture" data-id="cmp'+i+'">'+App.icon("camera",20)+'<span>'+t("addPhoto")+'</span></button>';
    }
    html+='</div></div>';
    html+='<button class="btn btn-gold btn-lg btn-block" data-action="submitComplaint">'+App.icon("send",17)+t("submitComplaint")+'</button></div></div>';
    return html;
  };

  App.views.resComplaintDetail = function(p){
    const st=S.get(), c=st.complaints.find(x=>x.id===p.id);
    if(!c) return App.notFoundView();
    const u=App.state.user, f=flatOfUser();
    const mine = c.flatId===f?.id || c.createdBy===u.id;
    const isStaffOrAdmin = u.role==="staff"||u.role==="admin";
    if(!mine && !isStaffOrAdmin && !c.community) return App.notFoundView();
    const assignee = c.assigneeId? st.staffMembers.find(s=>s.id===c.assigneeId):null;
    const voted = f && c.upvotes.includes(f.id);

    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="historyBack">'+App.icon("back",18)+'</button><h1>'+App.esc(c.ticketNo)+'</h1><span class="spacer"></span>'+App.chip(c.status)+'</div>';
    html+='<div class="card"><div class="card-title" style="font-size:16px">'+App.esc(c.title)+'</div>';
    html+='<div class="small muted" style="margin-bottom:10px">'+catLabel(c.category)+' · '+(c.community?t("commonAreaOnly"):App.esc(S.flatKey(S.flatById(c.flatId))))+' · '+t("filedOn")+": "+App.fmtDateTime(c.createdAt)+'</div>';
    html+='<div style="font-size:14px;line-height:1.6">'+App.esc(c.desc)+'</div>';
    if(c.photos && c.photos.length){
      html+='<div style="display:flex;gap:9px;margin-top:12px;flex-wrap:wrap">'+c.photos.map(ph=>'<img src="'+ph+'" style="width:110px;height:110px;object-fit:cover;border-radius:11px">').join("")+'</div>';
    }
    if(c.community){
      html+='<div style="margin-top:13px;display:flex;align-items:center;gap:9px"><button class="btn '+(voted?"btn-primary":"btn-ghost")+' btn-sm" data-action="upvote" data-id="'+c.id+'">'+App.icon("up",15)+t(voted?"upvoted":"upvote")+' ('+c.upvotes.length+')</button>'+
        (assignee?'<span class="chip chip-blue">'+t("assignedTo")+": "+App.esc(assignee.name)+'</span>':"")+'</div>';
    } else if(assignee){
      html+='<div style="margin-top:13px"><span class="chip chip-blue">'+t("assignedTo")+": "+App.esc(assignee.name)+'</span></div>';
    }
    if(c.rating){ html+='<div style="margin-top:10px">'+t("ratingGiven")+": "+App.stars(c.rating)+(c.ratingComment?' <span class="small muted">“'+App.esc(c.ratingComment)+'”</span>':"")+'</div>'; }
    html+='</div>';

    // timeline
    html+='<div class="card"><div class="card-title">'+t("statusTimeline")+'</div><div class="timeline">';
    const steps=["open","assigned","in_progress","resolved","closed"];
    c.timeline.forEach(ev=>{
      const cls = c.status===ev.status? "now":"done";
      html+='<div class="t-item '+cls+'"><span class="t-dot"></span><div class="tt">'+t(ev.status)+'</div><div class="td">'+App.fmtDateTime(ev.at)+'</div>'+(ev.note?'<div class="tn">'+App.esc(ev.note)+'</div>':"")+'</div>';
    });
    html+='</div></div>';

    // comments
    html+='<div class="card"><div class="card-title">'+t("comments")+' ('+((c.comments||[]).length)+')</div>';
    (c.comments||[]).slice(-6).forEach(cm=>{
      html+='<div style="padding:8px 0;border-bottom:1px dotted var(--border)"><div class="bold small">'+App.esc(cm.authorName)+' <span class="tag">'+App.esc(cm.authorRole)+'</span> <span class="muted" style="font-weight:400">'+App.relTime(cm.at)+'</span></div><div style="font-size:13.5px;margin-top:2px">'+App.esc(cm.text)+'</div></div>';
    });
    html+='<div style="display:flex;gap:8px;margin-top:10px"><input class="inp" id="cmpComment" placeholder="'+t("comments")+'..."><button class="btn btn-ghost btn-sm" data-action="addComment" data-id="'+c.id+'">'+App.icon("send",14)+'</button></div></div>';

    // actions
    if(mine && c.status==="resolved"){
      const within72 = Date.now()-new Date(c.resolvedAt) < 72*3600000;
      html+='<button class="btn btn-success btn-lg btn-block mb" data-action="rateComplaint" data-id="'+c.id+'">'+App.icon("star",17)+t("confirmResolve")+'</button>';
      if(within72) html+='<button class="btn btn-danger-soft btn-block" data-action="reopenComplaint" data-id="'+c.id+'">'+t("reopen")+'</button>';
      html+='<div class="small muted center mt">'+t("autoCloseNote")+'</div>';
    }
    html+='</div>';
    return html;
  };

  /* ================= NOTICES ================= */
  App.views.resNotices = function(){
    const st=S.get();
    const pinned=st.notices.filter(n=>n.pinned);
    const rest=st.notices.filter(n=>!n.pinned);
    let html='<div class="page fade"><div class="page-head"><h1>'+t("notices")+'</h1></div>';
    pinned.forEach(n=>html+=noticeCard(n));
    rest.forEach(n=>html+=noticeCard(n));
    if(!st.notices.length) html+='<div class="card">'+App.empty("noNotices","emptyMsg")+'</div>';
    html+='</div>';
    return html;
  };

  App.views.resNoticeDetail = function(p){
    const n=S.get().notices.find(x=>x.id===p.id);
    if(!n) return App.notFoundView();
    S.markRead(n.id, App.state.user.id); S.save();
    const catKey = {emergency:"emergencyCat",meeting:"meeting",financial:"financial",event:"event",maintenance:"maintenance",general:"general"}[n.category]||"general";
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="historyBack">'+App.icon("back",18)+'</button><h1>'+t("notices")+'</h1></div>';
    html+='<div class="article"><div class="meta"><span class="chip '+(n.category==="emergency"?"chip-red":"chip-grey")+'">'+t(catKey)+'</span>'+
      (n.pinned?'<span class="small" style="color:var(--gold)">📌 '+t("pinned")+'</span>':"")+
      '<span>'+App.fmtDateTime(n.createdAt)+'</span><span class="small muted">👁 '+n.readBy.length+'</span></div>';
    html+='<h2>'+App.esc(n.title)+'</h2><div class="body">'+App.esc(n.body)+'</div>';
    if(n.category==="meeting"){
      html+='<div class="divider"></div><div class="center"><div class="bold mb">'+t("rsvpCount")+'</div><div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">'+
        '<button class="btn btn-success btn-sm" data-action="rsvp" data-id="'+n.id+'" data-v="yes">✓ '+t("rsvpYes")+' ('+n.rsvp.yes.length+')</button>'+
        '<button class="btn btn-ghost btn-sm" data-action="rsvp" data-id="'+n.id+'" data-v="maybe">'+t("rsvpMaybe")+' ('+n.rsvp.maybe.length+')</button>'+
        '<button class="btn btn-danger-soft btn-sm" data-action="rsvp" data-id="'+n.id+'" data-v="no">✕ '+t("rsvpNo")+' ('+n.rsvp.no.length+')</button></div></div>';
    }
    html+='</div></div>';
    return html;
  };

  /* ================= GATE / VMS ================= */
  function myVisitorRequests(){
    const f=flatOfUser(); if(!f) return [];
    return S.get().visitors.filter(v=>v.flatIds.includes(f.id) && v.approval==="pending" && !v.outAt);
  }

  App.views.resGate = function(){
    const st=S.get(), f=flatOfUser();
    if(!f) return '<div class="page">'+App.empty("emptyTitle","emptyMsg")+'</div>';
    const pending=myVisitorRequests();
    const myPas=st.preApprovals.filter(pa=>pa.flatId===f.id && !pa.used);
    const dailyStaff=st.visitors.filter(v=>v.category==="daily_staff" && v.flatIds.includes(f.id) && new Date(v.inAt)>=new Date(Date.now()-30*86400000));
    const dailyNames={}; dailyStaff.forEach(v=>{ dailyNames[v.name]=dailyNames[v.name]||0; if(v.inAt) dailyNames[v.name]++; });
    const history=st.visitors.filter(v=>v.flatIds.includes(f.id) && v.category!=="daily_staff").slice(0,12);

    let html='<div class="page fade"><div class="page-head"><h1>'+t("gate")+'</h1><span class="spacer"></span>'+
      '<button class="btn btn-primary btn-sm" data-action="preApproveModal">'+App.icon("plus",15)+t("preApproveGuest")+'</button></div>';

    if(pending.length){
      html+='<div class="card" style="border:1.5px solid var(--gold)"><div class="card-title">🔔 '+t("approveRequest")+'</div>';
      pending.forEach(v=>{
        html+='<div class="approval-card">'+
          (v.photo?'<div class="ph"><img src="'+v.photo+'"></div>':'<div class="ph">'+App.icon("user",26)+'</div>')+
          '<div class="grow"><div class="bold">'+App.esc(v.name)+'</div><div class="small muted">'+catLabel(v.category)+' · '+t("atGate")+' · '+App.fmtTime(v.inAt)+'</div></div></div>'+
          '<div class="approval-actions"><button class="btn btn-success" data-action="allowVisitor" data-id="'+v.id+'">✓ '+t("allow")+'</button>'+
          '<button class="btn btn-danger-soft" data-action="denyVisitor" data-id="'+v.id+'">✕ '+t("deny")+'</button></div>';
      });
      html+='</div>';
    }

    if(myPas.length){
      html+='<div class="card"><div class="card-title">'+t("activeCodes")+'</div>';
      myPas.forEach(pa=>{
        html+='<div class="list-row"><span class="thumb" style="background:var(--blue-bg);color:var(--blue)">'+App.icon("key",20)+'</span>'+
          '<div class="grow"><div class="t">'+App.esc(pa.name)+'</div><div class="s">'+App.fmtDate(pa.date)+' · '+App.esc(pa.window)+'</div></div>'+
          '<div class="code-display" style="padding:6px 12px;margin:0"><span class="cd" style="font-size:19px;letter-spacing:4px">'+pa.code+'</span></div>'+
          '<button class="btn btn-ghost btn-sm" data-action="copyCode" data-id="'+pa.id+'">'+App.icon("copy",14)+'</button></div>';
      });
      html+='</div>';
    }

    html+='<div class="grid grid-2">';
    html+='<div class="card"><div class="card-title">'+t("dailyStaffList")+'</div>';
    const names=Object.keys(dailyNames);
    if(!names.length) html+=App.empty("emptyTitle","emptyMsg");
    names.forEach(n=>{ html+='<div class="list-row"><span class="thumb" style="background:var(--green-bg);color:var(--green)">'+App.icon("hand",20)+'</span><div class="grow"><div class="t">'+App.esc(n)+'</div><div class="s">'+dailyNames[n]+' '+t("inCount")+'</div></div></div>'; });
    html+='</div>';

    html+='<div class="card"><div class="card-title">'+t("visitorHistory")+'</div>';
    if(!history.length) html+=App.empty("noVisitors","emptyMsg");
    history.forEach(v=>html+=visitorRow(v));
    html+='</div></div></div>';
    return html;
  };

  /* ================= BOOKINGS ================= */
  App.views.resBookings = function(){
    const st=S.get(), f=flatOfUser();
    const facIcons={f1:"hall",f2:"gym",f3:"sparkle",f4:"swim"};
    let html='<div class="page fade"><div class="page-head"><h1>'+t("bookings")+'</h1></div>';
    html+='<div class="grid grid-2">';
    st.facilities.forEach(fa=>{
      html+='<div class="facility-card" data-action="go" data-arg="/booking/'+fa.id+'">'+
        '<div class="facility-cover" style="background:'+fa.color+'">'+App.icon(facIcons[fa.id]||"calendar",44)+'</div>'+
        '<div class="fc-body"><div class="fc-name">'+t(fa.nameKey)+'</div>'+
        '<div class="fc-meta">'+(fa.charges>0? App.fmt(fa.charges)+" / "+t("slot"): t("free"))+(fa.approveRequired?' · '+t("approveRequired"):"")+'</div></div></div>';
    });
    html+='</div>';
    html+='<div class="card mt"><div class="card-title">'+t("bookingsMine")+'</div>';
    const mine=st.bookings.filter(b=>f && b.flatId===f.id).sort((a,b)=>a.date<b.date?1:-1);
    if(!mine.length) html+=App.empty("emptyTitle","emptyMsg");
    mine.forEach(b=>{
      const fa=st.facilities.find(x=>x.id===b.facilityId);
      html+='<div class="list-row"><span class="thumb" style="background:'+fa.color+'20;color:var(--navy)">'+App.icon(facIcons[fa.id]||"calendar",20)+'</span>'+
        '<div class="grow"><div class="t">'+t(fa.nameKey)+'</div><div class="s">'+App.fmtDate(b.date)+' · '+App.esc(b.slot)+(b.amount>0?" · "+App.fmt(b.amount):"")+'</div></div>'+
        App.chip(b.status)+
        (b.status!=="cancelled" && new Date(b.date)>new Date()? '<button class="btn btn-danger-soft btn-sm" data-action="cancelBooking" data-id="'+b.id+'" style="margin-left:6px">'+t("cancelBooking")+'</button>':"")+'</div>';
    });
    html+='</div></div>';
    return html;
  };

  App.views.resBookingDetail = function(p){
    const st=S.get(), f=flatOfUser();
    const fa=st.facilities.find(x=>x.id===p.id);
    if(!fa) return App.notFoundView();
    const tmp=App.state.tmp;
    const selDate=tmp.bkDate||App.todayStr();
    const selSlot=tmp.bkSlot||null;
    const dates=[]; for(let i=0;i<7;i++){ const d=new Date(); d.setDate(d.getDate()+i); dates.push(d); }
    const facIcons={f1:"hall",f2:"gym",f3:"sparkle",f4:"swim"};
    const bkOn=st.bookings.filter(b=>b.facilityId===fa.id && b.date===selDate && b.status!=="cancelled");

    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/bookings">'+App.icon("back",18)+'</button><h1>'+t(fa.nameKey)+'</h1></div>';
    html+='<div class="card"><div class="small muted" style="margin-bottom:8px">'+App.esc(fa.desc)+'</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
      '<span class="chip chip-gold">'+(fa.charges>0? t("chargesF")+": "+App.fmt(fa.charges): t("free"))+'</span>'+
      (fa.deposit>0?'<span class="chip chip-grey">'+t("deposit")+": "+App.fmt(fa.deposit)+'</span>':"")+
      (fa.approveRequired?'<span class="chip chip-amber">'+t("approveRequired")+'</span>':"")+
      '<span class="chip chip-blue">'+t("rules")+': '+App.esc(fa.rules.slice(0,80))+'</span></div></div>';

    html+='<div class="card"><div class="card-title">'+t("chooseDate")+'</div><div class="week-strip">';
    dates.forEach(d=>{
      const ds=d.getFullYear()+"-"+Store.pad(d.getMonth()+1)+"-"+Store.pad(d.getDate());
      const today = ds===App.todayStr();
      html+='<button class="day-pill '+(ds===selDate?"sel":"")+(today?" today":"")+'" data-action="setBkDate" data-id="'+ds+'">'+
        '<div class="dw">'+t("days")[d.getDay()]+'</div><div class="dd">'+d.getDate()+'</div><div class="dm">'+t("months")[d.getMonth()]+'</div></button>';
    });
    html+='</div></div>';

    html+='<div class="card"><div class="card-title">'+t("slots")+'</div><div class="slot-grid">';
    fa.slots.forEach((sl,i)=>{
      const label=sl.s+" – "+sl.e;
      const count=bkOn.filter(b=>b.slot===label).length;
      const mine=bkOn.some(b=>b.slot===label && f && b.flatId===f.id);
      const busy=count>=fa.capacity;
      const cls = mine?"mine":busy?"busy":(selSlot===label?"sel":"avail");
      html+='<button class="slot '+cls+'" data-action="setBkSlot" data-id="'+App.esc(label)+'">'+label+'<div class="small" style="font-weight:600;margin-top:2px">'+(busy? t("slotsLeft")+": 0": (fa.capacity>1? t("slotsLeft")+": "+(fa.capacity-count): (mine?t("bookedByMe"):t("bookSlot"))))+'</div></button>';
    });
    html+='</div>';
    if(selSlot){
      html+='<div class="pay-sticky"><button class="btn btn-gold btn-lg btn-block" data-action="confirmBooking" data-id="'+fa.id+'">'+App.icon("calendar",18)+t("confirmBooking")+(fa.charges>0? " — "+App.fmt(fa.charges):"")+'</button></div>';
    }
    html+='</div></div>';
    return html;
  };

  /* ================= DIRECTORY & EMERGENCY ================= */
  App.views.resDirectory = function(){
    const st=S.get(), q=(App.state.tmp.dirQ||"").toLowerCase();
    let html='<div class="page fade"><div class="page-head"><h1>'+t("directory")+'</h1></div>';
    html+='<div class="card"><div class="card-title">'+t("committeeMembers")+'</div>';
    st.committee.forEach(m=>{
      html+='<div class="list-row"><span class="thumb" style="background:var(--navy);color:var(--gold2)">'+App.icon("shield",20)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(m.name)+' <span class="tag" style="background:var(--gold);color:#fff;border:none">'+App.esc(m.role)+'</span></div><div class="s">'+App.esc(m.flat)+'</div></div>'+
        '<a class="btn btn-ghost btn-sm" href="tel:'+App.esc(m.phone)+'">'+App.icon("phone",14)+App.esc(m.phone)+'</a></div>';
    });
    html+='</div>';
    html+='<div class="card"><div class="card-title">'+t("residents")+'</div><div class="search-bar mb"><span>'+App.icon("search",17)+'</span><input id="dirQ" placeholder="'+t("searchResidents")+'" value="'+App.esc(App.state.tmp.dirQ||"")+'"></div>';
    const rows=[];
    S.get().residencies.forEach(r=>{
      const u=S.userById(r.userId); if(!u) return;
      const f=S.flatById(r.flatId);
      const label=(u.name+" "+S.flatKey(f)+" "+r.role).toLowerCase();
      if(q && !label.includes(q)) return;
      rows.push({u,f,r});
    });
    rows.sort((a,b)=>S.flatKey(a.f)<S.flatKey(b.f)?-1:1);
    rows.slice(0,60).forEach(x=>{
      const isComm=S.isCommittee(x.u);
      html+='<div class="list-row">'+App.avatar(x.u.name,"av-md")+
        '<div class="grow"><div class="t">'+App.esc(x.u.name)+'</div><div class="s">'+App.esc(S.flatKey(x.f))+' · '+t(x.r.role)+'</div></div>'+
        (isComm?'<a class="btn btn-ghost btn-sm" href="tel:'+App.esc(x.u.phone)+'">'+App.icon("phone",14)+'</a>':'<span class="small muted" title="'+t("privacyHint")+'">'+App.icon("lock",14)+'</span>')+'</div>';
    });
    html+='</div></div>';
    return html;
  };

  App.views.resEmergency = function(){
    const contacts=[
      ["ambulance","102 / 108","medical","#C62828"],["fire","101","fire","#C62828"],["police","100","police","#C62828"],
      ["building","98390 11223","societyOffice","#1F3A5F"],["lift","1800-123-456","liftHelpline","#6A3FA0"],
      ["zap","1912","electricHelpline","#F9A825"],["wrench","98765 44321","plumber","#2E7D32"]
    ];
    const st=S.get();
    const myAlert=st.sosAlerts? st.sosAlerts.find(a=>a.userId===App.state.user.id && a.status!=="responding" && Date.now()-new Date(a.at)<30*60000):null;
    let html='<div class="page fade"><div class="page-head"><h1>'+t("emergency")+'</h1></div>';
    html+='<div class="dash-note">'+App.icon("info",17)+t("emgNote")+'</div>';
    if(myAlert){
      html+='<div class="sos-alert"><span class="sa-ic">'+App.icon("sos",22)+'</span><div><div class="bold">'+t("helpComing")+'</div><div class="small">'+t("sosSentMsg")+'</div></div></div>';
    }
    html+='<div class="sos-panel mb"><h3>'+t("sosButton")+'</h3><p>'+t("sosHelp")+'</p>'+
      '<div class="sos-slide" id="sosSlide"><div class="sos-knob" id="sosKnob">'+App.icon("sos",22)+'</div><div class="sos-label">'+t("slideToActivate")+'</div></div></div>';
    contacts.forEach(c=>{
      html+='<a class="emg-card" href="tel:'+App.esc(c[1])+'"><span class="emg-ic" style="background:'+c[3]+'">'+App.icon(c[0],22)+'</span>'+
        '<span><span class="emg-n">'+t(c[2])+'</span><br><span class="emg-p">'+App.esc(c[1])+'</span></span>'+
        '<span class="emg-c">'+App.icon("phone",20)+'</span></a>';
    });
    html+='</div>';
    return html;
  };

  /* ================= DOCUMENTS ================= */
  App.views.resDocuments = function(){
    const st=S.get(), u=App.state.user;
    const isAdmin=u.role==="admin";
    const folderIcons={fd1:"shield",fd2:"users",fd3:"pie",fd4:"notice",fd5:"file",fd6:"shield",fd7:"docs"};
    let html='<div class="page fade"><div class="page-head"><h1>'+t("documentsRepo")+'</h1><span class="spacer"></span>'+
      (isAdmin?'<button class="btn btn-primary btn-sm" data-action="uploadDocModal">'+App.icon("plus",15)+t("uploadDoc")+'</button>':"")+'</div>';
    html+='<div class="grid grid-3">';
    st.folders.forEach(fd=>{
      const docs=st.documents.filter(d=>d.folder===fd.id && (d.access==="all"||isAdmin));
      html+='<div class="facility-card" data-action="go" data-arg="/documents/'+fd.id+'"><div class="facility-cover" style="background:linear-gradient(135deg,#5E6C80,#8A99AE)">'+App.icon(folderIcons[fd.id]||"docs",38)+'</div>'+
        '<div class="fc-body"><div class="fc-name">'+t(fd.nameKey)+'</div><div class="fc-meta">'+docs.length+' '+t("docs")+'</div></div></div>';
    });
    html+='</div></div>';
    return html;
  };

  App.views.resFolderDetail = function(p){
    const st=S.get(), u=App.state.user;
    const fd=st.folders.find(x=>x.id===p.id);
    if(!fd) return App.notFoundView();
    const isAdmin=u.role==="admin";
    const docs=st.documents.filter(d=>d.folder===fd.id && (d.access==="all"||isAdmin));
    let html='<div class="page fade"><div class="page-head"><button class="back-btn" data-action="go" data-arg="/documents">'+App.icon("back",18)+'</button><h1>'+t(fd.nameKey)+'</h1></div><div class="card">';
    if(!docs.length) html+=App.empty("emptyTitle","emptyMsg");
    docs.forEach(d=>{
      html+='<div class="list-row" data-action="viewDoc" data-id="'+d.id+'"><span class="thumb" style="background:var(--blue-bg);color:var(--blue)">'+App.icon("file",20)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(d.title)+'</div><div class="s">'+App.fmtDate(d.date)+' · v'+d.version+' · '+App.esc(d.size)+'</div></div>'+
        (d.access!=="all"?'<span class="chip chip-gold">'+t(d.access==="committee"?"committeeOnly":"adminOnly")+'</span>':"")+'</div>';
    });
    html+='</div></div>';
    return html;
  };

  /* ================= TRANSPARENCY ================= */
  App.views.resTransparency = function(){
    const st=S.get(), u=App.state.user;
    const sel=App.state.tmp.trMonth||S.nowMonth();
    const months=[]; const d=new Date();
    for(let i=0;i<6;i++){ const x=new Date(d.getFullYear(), d.getMonth()-i,1); months.push(x.getFullYear()+"-"+Store.pad(x.getMonth()+1)); }
    const income=S.incomeForMonth(sel);
    const exps=S.expensesForMonth(sel);
    const expTotal=exps.reduce((a,e)=>a+e.amount,0);
    const diff=income-expTotal;
    const cats={};
    exps.forEach(e=>{ cats[e.category]=(cats[e.category]||0)+e.amount; });
    const catColors={security:"#1F3A5F", electricity:"#C98A2D", housekeeping:"#2E7D32", amc:"#6A3FA0", repairs:"#1565C0", events:"#B45309", other:"#5E6C80"};
    let pieStops=[]; let acc=0;
    Object.keys(cats).forEach(k=>{ const deg=Math.round(cats[k]/expTotal*360); if(deg>0) pieStops.push(catColors[k]+" "+acc+"deg "+(acc+deg)+"deg"); acc+=deg; });
    const pie = expTotal>0? "conic-gradient("+pieStops.join(",")+")" : "conic-gradient(#E3E8EF 0deg 360deg)";

    let html='<div class="page fade"><div class="page-head"><h1>'+t("transparency")+'</h1><span class="spacer"></span>'+
      '<select class="inp" style="width:150px" id="trMonth">'+months.map(m=>'<option value="'+m+'" '+(m===sel?"selected":"")+'>'+t("months")[Number(m.split("-")[1])-1]+" "+m.split("-")[0]+'</option>').join("")+'</select></div>';
    html+='<div class="dash-note">'+App.icon("eye",17)+t("whereMoney")+' — '+t("monthlySummary")+' ('+t("months")[Number(sel.split("-")[1])-1]+" "+sel.split("-")[0]+')</div>';
    html+='<div class="grid grid-3">'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--green)">'+App.fmt(income)+'</div><div class="stat-label">'+t("income")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:var(--red)">'+App.fmt(expTotal)+'</div><div class="stat-label">'+t("expenseTotal")+'</div></div>'+
      '<div class="stat-tile"><div class="stat-value" style="color:'+(diff>=0?"var(--green)":"var(--red)")+'">'+App.fmt(Math.abs(diff))+'</div><div class="stat-label">'+(diff>=0?t("surplus"):t("deficit"))+'</div></div></div>';
    html+='<div class="card"><div class="card-title">'+t("whereMoney")+'</div><div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><div class="pie" style="background:'+pie+'"></div><div class="legend">';
    if(!exps.length) html+='<div class="muted small">'+t("emptyTitle")+'</div>';
    Object.keys(cats).sort((a,b)=>cats[b]-cats[a]).forEach(k=>{
      html+='<div class="legend-row"><span class="dot" style="background:'+catColors[k]+'"></span><span>'+catLabel(k)+'</span><span class="lv">'+App.fmt(cats[k])+' ('+Math.round(cats[k]/expTotal*100)+'%)</span></div>';
    });
    html+='</div></div></div>';
    html+='<div class="card"><div class="card-title">'+t("expenses")+'</div>';
    if(!exps.length) html+=App.empty("emptyTitle","emptyMsg");
    exps.forEach(e=>{
      html+='<div class="list-row"><span class="thumb" style="background:'+catColors[e.category]+'20;color:'+catColors[e.category]+'">'+catIcon(e.category)+'</span>'+
        '<div class="grow"><div class="t">'+App.esc(e.vendor)+'</div><div class="s">'+catLabel(e.category)+' · '+App.fmtDate(e.date)+' · '+modeLabel(e.mode)+(e.receipt?' · 📎':"")+(e.note?' · '+App.esc(e.note):"")+'</div></div>'+
        '<span class="bold">'+App.fmt(e.amount)+'</span></div>';
    });
    html+='</div></div>';
    return html;
  };

  /* ================= POLLS ================= */
  function pollCard(p, flatId){
    const totalVotes=p.votes.length;
    const mine=p.votes.find(v=>v.flatId===flatId);
    const isClosed=p.status==="closed" || new Date(p.deadline)<new Date();
    let out='<div style="padding:6px 0"><div class="bold" style="font-size:14.5px">'+App.esc(p.question)+'</div>'+
      '<div class="small muted mt" style="margin-top:4px">'+t(p.mode==="flat"?"oneFlatOneVote":"oneFlatOneVote")+(p.anonymous?" · "+t("anonymous"):"")+' · '+t("deadline")+": "+App.fmtDate(p.deadline)+'</div>';
    if(isClosed || mine){
      out+='<div style="margin-top:10px">';
      const total=p.votes.length;
      p.options.forEach((opt,i)=>{
        const cnt=p.votes.filter(v=>v.opt===i).length;
        const pct=total? Math.round(cnt/total*100):0;
        out+='<div class="bar-row"><span class="bl">'+App.esc(opt)+(mine&&mine.opt===i?' ✓':"")+'</span><div class="bar"><div class="fill" style="width:'+pct+'%"></div></div><span class="bv">'+pct+'%</span></div>';
      });
      out+='<div class="small muted center" style="margin-top:6px">'+t("participation")+": "+total+" "+t("votes")+'</div></div>';
    } else {
      out+='<div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">';
      p.options.forEach((opt,i)=>{
        out+='<button class="btn btn-ghost" data-action="votePoll" data-id="'+p.id+'" data-opt="'+i+'">'+App.esc(opt)+'</button>';
      });
      out+='</div>';
    }
    return out+'</div>';
  }
  App.views.resPolls = function(){
    const st=S.get(), f=flatOfUser();
    const active=st.polls.filter(p=>p.status==="active" && new Date(p.deadline)>=new Date());
    const closed=st.polls.filter(p=>!(p.status==="active" && new Date(p.deadline)>=new Date()));
    let html='<div class="page fade"><div class="page-head"><h1>'+t("polls")+'</h1></div>';
    html+='<div class="card"><div class="card-title">'+t("activePoll")+'</div>';
    if(!active.length) html+=App.empty("emptyTitle","emptyMsg");
    active.forEach(p=>html+=pollCard(p, f?.id));
    html+='</div>';
    if(closed.length){
      html+='<div class="card"><div class="card-title">'+t("closedPolls")+'</div>';
      closed.forEach(p=>html+=pollCard(p, f?.id));
      html+='</div>';
    }
    html+='</div>';
    return html;
  };

  /* ================= PROFILE ================= */
  App.views.resProfile = function(){
    const u=App.state.user, st=S.get(), f=flatOfUser();
    const roleDesc={admin:"adminAccess",owner:"ownerAccess",tenant:"tenantAccess",family:"familyAccess",guard:"guardAccess",staff:"staffAccess"}[u.role];
    const demoUsers=st.users.filter(x=>["admin","owner","tenant","guard","staff","family"].includes(x.role) && ["9999000001","9999000002","9999000003","9999000004","9999000005","9999000006"].includes(x.phone));
    let html='<div class="page fade"><div class="page-head"><h1>'+t("myProfile")+'</h1></div>';
    html+='<div class="card"><div style="display:flex;gap:14px;align-items:center">'+App.avatar(u.name,"av-lg")+
      '<div class="grow"><div class="bold" style="font-size:17px">'+App.esc(u.name)+'</div><div class="small muted">'+App.esc(u.phone)+(f?" · "+t("flatNo")+" "+App.esc(S.flatKey(f)):"")+'</div>'+
      '<div style="margin-top:5px"><span class="chip chip-gold">'+t(u.role==="admin"?"admin":u.role==="owner"?"owner":u.role==="tenant"?"tenant":u.role==="family"?"familyMember":u.role==="guard"?"guard":"staff")+'</span></div></div></div>';
    html+='<div class="divider"></div><div class="small muted mb">'+t(roleDesc)+'</div>';
    html+='<div class="kv"><span class="k">'+t("memberSince")+'</span><span class="v">'+App.fmtDate(u.joinedAt)+'</span></div>';
    html+='<div class="kv"><span class="k">'+t("societyPlan")+'</span><span class="v">'+t("planStandard")+'</span></div></div>';

    if(u.role!=="guard" && u.role!=="staff"){
      html+='<div class="card"><div class="card-title">'+t("myFamily")+'<button class="btn btn-ghost btn-sm" data-action="addFamilyModal">'+App.icon("plus",14)+t("addFamily")+'</button></div>';
      if(!u.family.length) html+='<div class="small muted">'+t("emptyTitle")+'</div>';
      u.family.forEach(fm=>{
        html+='<div class="list-row"><span class="thumb">'+App.avatar(fm.name,"av-sm")+'</span><div class="grow"><div class="t">'+App.esc(fm.name)+'</div><div class="s">'+App.esc(fm.relation)+' · '+App.esc(fm.phone)+'</div></div><span class="tag">'+t("familyMember")+'</span></div>';
      });
      html+='</div>';
      html+='<div class="card"><div class="card-title">'+t("vehicles")+'<button class="btn btn-ghost btn-sm" data-action="addVehicleModal">'+App.icon("plus",14)+t("addVehicle")+'</button></div>';
      if(!u.vehicles.length) html+='<div class="small muted">'+t("emptyTitle")+'</div>';
      u.vehicles.forEach(v=>{
        html+='<div class="list-row"><span class="thumb" style="background:var(--grey-bg);color:var(--grey)">'+App.icon(v.type==="car"?"car":"bike",20)+'</span><div class="grow"><div class="t">'+App.esc(v.no)+'</div><div class="s">'+t(v.type==="car"?"car":"bike")+'</div></div></div>';
      });
      html+='</div>';
    }

    html+='<div class="card"><div class="card-title">'+t("settings")+'</div>';
    html+='<div class="field"><label>'+t("language")+'</label><div class="tabs" style="margin:0"><button class="tab '+(App.state.lang==="hi"?"active":"")+'" data-action="setLang" data-id="hi">हिंदी</button><button class="tab '+(App.state.lang==="en"?"active":"")+'" data-action="setLang" data-id="en">English</button></div></div>';
    html+='<div class="field"><label>'+t("notifPrefs")+'</label>';
    [["inApp","inApp"],["email","email"],["sms","sms"],["whatsapp","whatsapp"]].forEach(nf=>{
      const on=u.notifPrefs?.[nf[0]]!==false;
      html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px dotted var(--border)"><span class="bold small">'+t(nf[1])+'</span>'+
        '<label class="switch"><input type="checkbox" data-pref="'+nf[0]+'" '+(on?"checked":"")+'><span class="sl"></span></label></div>';
    });
    html+='</div></div>';

    html+='<div class="card"><div class="card-title">'+t("privacy")+'</div><div class="small muted mb">'+t("dataLocal")+'</div>'+
      '<button class="btn btn-ghost btn-sm" data-action="downloadMyData">'+App.icon("download",14)+t("downloadMyData")+'</button></div>';

    html+='<div class="card"><div class="card-title">'+t("switchAccount")+'</div>';
    demoUsers.forEach(x=>{
      if(x.id===u.id) return;
      html+='<button class="demo-card" data-action="loginAs" data-id="'+x.id+'" style="border:none;box-shadow:none;background:transparent;width:100%">'+
        App.avatar(x.name,"av-md")+'<span class="dc-g"><span class="dc-n">'+App.esc(x.name)+'</span><br><span class="dc-r">'+t(x.role==="admin"?"admin":x.role==="owner"?"owner":x.role==="tenant"?"tenant":x.role==="family"?"familyMember":x.role==="guard"?"guard":"staff")+'</span></span>'+
        '<span class="dc-go">'+App.icon("chevR",16)+'</span></button>';
    });
    html+='</div>';

    html+='<div style="display:flex;gap:10px"><button class="btn btn-danger-soft btn-sm" style="flex:1" data-action="resetDemo">'+App.icon("refresh",14)+t("resetDemo")+'</button>'+
      '<button class="btn btn-danger btn-sm" style="flex:1" data-action="logout">'+App.icon("logout",14)+t("logout")+'</button></div>';
    html+='</div>';
    return html;
  };

  /* ================= ACTIONS ================= */
  // payment flow
  function openPayModal(billId, opts){
    const b=S.get().bills.find(x=>x.id===billId);
    const total=S.billTotal(b);
    App.state.pay={billId, step:"method", method:null, total, opts:opts||{}};
    App.modal('<div class="pay-amt"><div class="small muted">'+t("amount")+'</div><div class="pa">'+App.fmt(total)+'</div></div>'+
      '<div class="pay-methods">'+
      '<button class="pay-method" data-action="payMethod" data-id="gpay"><span class="pm" style="background:#4285F4">G</span>GPay</button>'+
      '<button class="pay-method" data-action="payMethod" data-id="phonepe"><span class="pm" style="background:#5F259F">पे</span>PhonePe</button>'+
      '<button class="pay-method" data-action="payMethod" data-id="paytm"><span class="pm" style="background:#00BAF2">P</span>Paytm</button>'+
      '<button class="pay-method" data-action="payMethod" data-id="upi"><span class="pm" style="background:var(--navy)">'+App.icon("rupee",18)+'</span>'+t("upi")+' ID</button>'+
      '<button class="pay-method" data-action="payMethod" data-id="card"><span class="pm" style="background:#C62828">'+App.icon("card",18)+'</span>'+t("card")+'</button>'+
      '<button class="pay-method" data-action="payMethod" data-id="netbanking"><span class="pm" style="background:#2E7D32">'+App.icon("bank",18)+'</span>'+t("netbanking")+'</button></div>',
      {title:t("method")});
  }
  App.act("startPay", el=>{ openPayModal(el.dataset.id); });
  App.act("payTopBill", ()=>{ const f=flatOfUser(); const unpaid=S.unpaidBillsFor(f.id); if(unpaid.length) openPayModal(unpaid[0].id); });
  App.act("payMethod", el=>{
    const m=el.dataset.id; App.state.pay.method=m; App.state.pay.step="detail";
    let html="";
    if(m==="gpay"||m==="phonepe"||m==="paytm") html='<div class="field"><label>'+t("upiId")+'</label><input class="inp" id="payUpi" placeholder="name@okhdfcbank"></div>';
    if(m==="upi") html='<div class="field"><label>'+t("upiId")+'</label><input class="inp" id="payUpi" placeholder="yourname@upi"></div>';
    if(m==="card") html='<div class="field"><label>'+t("cardNo")+'</label><input class="inp" id="payCard" inputmode="numeric" placeholder="4111 1111 1111 1111"></div>'+
      '<div style="display:flex;gap:10px"><div class="field" style="flex:1"><label>'+t("expiry")+'</label><input class="inp" placeholder="MM/YY"></div><div class="field" style="flex:1"><label>'+t("cvv")+'</label><input class="inp" type="password" placeholder="•••"></div></div>';
    if(m==="netbanking") html='<div class="field"><label>'+t("bank")+'</label><select class="inp"><option>HDFC Bank</option><option>ICICI Bank</option><option>State Bank of India</option><option>Bank of Baroda</option><option>Punjab National Bank</option></select></div>';
    const ov=document.querySelector(".modal-overlay");
    const total=App.state.pay.total;
    ov.querySelector(".modal-body").innerHTML='<div class="pay-amt"><div class="small muted">'+t("amount")+'</div><div class="pa">'+App.fmt(total)+'</div></div>'+html+
      '<button class="btn btn-gold btn-lg btn-block" data-action="payExecute">'+App.icon("lock",16)+t("payNowBtn")+'</button>';
  });
  App.act("payExecute", el=>{
    const p=App.state.pay;
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal-body").innerHTML='<div class="pay-success"><div class="check"><span class="spin" style="width:34px;height:34px;border:4px solid #C8E0CA;border-top-color:var(--green);border-radius:50%"></span></div><div class="bold">'+t("processing")+'</div><div class="small muted mt">'+App.fmt(p.total)+'</div></div>';
    setTimeout(()=>{
      const ref = p.method==="upi"||p.method==="gpay"||p.method==="phonepe"||p.method==="paytm"
        ? "UPI/"+p.method+"/"+Math.floor(100000000+Math.random()*899999999)
        : (p.method==="card"?"CARD/"+Math.floor(100000+Math.random()*899999):"NEFT/"+Math.floor(100000000+Math.random()*899999999));
      const pay=S.payBill(p.billId, p.method, ref);
      const u=App.state.user, f=S.flatById(pay.flatId);
      S.notify(u.id,"check",t("paySuccess")+" — "+App.fmt(pay.amount), t("paySuccessMsg"), "/receipt/"+pay.id);
      S.log(u.name,"payment.success", App.fmt(pay.amount)+" — "+S.flatKey(f)+" ("+p.method+")");
      S.save();
      ov.querySelector(".modal-body").innerHTML='<div class="pay-success"><div class="check">'+App.icon("check",36)+'</div><div class="bold" style="font-size:16px">'+t("paySuccess")+'</div>'+
        '<div class="small muted mt">'+App.fmt(pay.amount)+' · '+App.esc(pay.receiptNo)+'</div>'+
        '<div style="display:flex;gap:9px;margin-top:14px"><button class="btn btn-ghost btn-sm" style="flex:1" data-action="modalClose">'+t("close")+'</button>'+
        '<button class="btn btn-primary btn-sm" style="flex:1" data-action="go" data-arg="/receipt/'+pay.id+'">'+t("viewReceipts")+'</button></div></div>';
      App.toast(t("paySuccess")+" ✓","success");
      App.render();
    }, 1700);
  });

  App.act("modalClose", ()=>App.closeModal());
  App.act("modalYes", ()=>{});
  App.act("go", el=>{ App.closeModal(); App.go(el.dataset.arg); });
  App.act("historyBack", ()=>{ history.back(); });

  // complaints
  App.act("setCmpCat", el=>{ App.state.tmp.cmpCat=el.dataset.id; App.render(); });
  App.act("setCmpLoc", el=>{ App.state.tmp.cmpLoc=el.dataset.id; App.render(); });
  App.act("capture", el=>{ App.capture(el.dataset.id); });
  App.act("clearPhoto", el=>{ if(App.state.tmp.photos) delete App.state.tmp.photos[el.dataset.id]; App.render(); });
  App.act("submitComplaint", ()=>{
    const desc=(document.getElementById("cmpDesc")||{}).value||"";
    if(desc.trim().length<10){ App.toast(t("minChars"),"error"); return; }
    const u=App.state.user, f=flatOfUser();
    const loc=App.state.tmp.cmpLoc||(f?"flat":"common");
    const c=S.raiseComplaint({ title:desc.trim().split("\n")[0].slice(0,70), category:App.state.tmp.cmpCat||"other", desc:desc.trim(),
      flatId:loc==="flat"? f.id:null, createdBy:u.id, creatorName:u.name, flatKey:f?S.flatKey(f):null,
      photos:[App.state.tmp.photos?.["cmp0"],App.state.tmp.photos?.["cmp1"]].filter(Boolean) });
    S.notify(S.get().users.filter(x=>x.role==="admin").map(x=>x.id), "complaint", t("newComplaint")+": "+c.title.slice(0,50), c.ticketNo+" — "+S.flatKey(f||{}) , "/admin/helpdesk");
    S.log(u.name,"complaint.create", c.ticketNo+" — "+c.title.slice(0,40));
    S.save();
    App.state.tmp.cmpCat=null; App.state.tmp.cmpDesc=""; App.state.tmp.cmpLoc=null; if(App.state.tmp.photos){delete App.state.tmp.photos.cmp0; delete App.state.tmp.photos.cmp1;}
    App.toast(t("complaintFiled")+" — "+c.ticketNo,"success");
    App.go("/complaints");
  });
  App.act("upvote", el=>{
    const f=flatOfUser();
    const ok=S.upvoteComplaint(el.dataset.id, f.id);
    S.save(); App.render();
    if(ok) App.toast(t("upvoted")+" ✓","success");
  });
  App.act("addComment", el=>{
    const inp=document.getElementById("cmpComment");
    const text=(inp?inp.value:"").trim();
    if(!text) return;
    const u=App.state.user;
    S.addComment(el.dataset.id, text, u.name, t(u.role==="admin"?"admin":u.role==="staff"?"staff":"resident"));
    S.save(); App.render();
  });
  App.act("rateComplaint", el=>{
    const cid=el.dataset.id;
    App.state.tmp.rate={cid, stars:0};
    App.modal('<div class="center"><div class="bold mb">'+t("yourRating")+'</div><div class="stars">'+
      [1,2,3,4,5].map(i=>'<button class="star-btn" data-action="setStars" data-id="'+i+'">'+App.icon("star",30)+'</button>').join("")+
      '</div><div class="field mt"><textarea class="inp" id="rateComment" placeholder="'+t("rateComment")+'"></textarea></div></div>',{title:t("confirmResolve")});
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button><button class="btn btn-success" data-action="submitRating">'+t("submitRating")+'</button></div>');
  });
  App.act("setStars", el=>{
    App.state.tmp.rate.stars=Number(el.dataset.id);
    document.querySelectorAll(".star-btn").forEach(b=>{ b.classList.toggle("on", Number(b.dataset.id)<=App.state.tmp.rate.stars); });
  });
  App.act("submitRating", ()=>{
    const r=App.state.tmp.rate;
    if(!r.stars){ App.toast(t("select")+" ★","error"); return; }
    const comment=(document.getElementById("rateComment")||{}).value||"";
    S.confirmComplaint(r.cid, r.stars, comment);
    const c=S.get().complaints.find(x=>x.id===r.cid);
    S.log(App.state.user.name,"complaint.confirm", c.ticketNo+" — "+r.stars+"★");
    S.save(); App.closeModal();
    App.toast(t("thanksRating"),"success"); App.render();
  });
  App.act("reopenComplaint", el=>{
    const reason=prompt(t("reopen")+" — "+t("action")+"?");
    if(reason===null) return;
    S.reopenComplaint(el.dataset.id, reason||"");
    const c=S.get().complaints.find(x=>x.id===el.dataset.id);
    S.notify(S.get().users.filter(x=>x.role==="admin").map(x=>x.id),"complaint",t("reopenMsg")+": "+c.ticketNo,"","/admin/helpdesk");
    S.log(App.state.user.name,"complaint.reopen", c.ticketNo);
    S.save(); App.render(); App.toast(t("reopenMsg"),"info");
  });

  // notices
  App.act("rsvp", el=>{
    const n=S.get().notices.find(x=>x.id===el.dataset.id);
    if(!n) return;
    const v=el.dataset.v; const u=App.state.user.id;
    ["yes","no","maybe"].forEach(k=>{ const i=n.rsvp[k].indexOf(u); if(i>=0) n.rsvp[k].splice(i,1); });
    n.rsvp[v].push(u);
    S.save(); App.render(); App.toast(t("voted")+" ✓","success");
  });

  // gate
  App.act("allowVisitor", el=>{
    const v=S.get().visitors.find(x=>x.id===el.dataset.id);
    S.resolveApproval(v.id,true,App.state.user.name);
    S.notify(v.guardId,"gate",t("approvedMsg")+": "+v.name, S.flatKey(S.flatById(v.flatIds[0]))||"","/guard");
    S.log(App.state.user.name,"visitor.approve", v.name+" — allowed");
    S.save(); App.render(); App.toast(t("approvedMsg")+" ✓","success");
  });
  App.act("denyVisitor", el=>{
    const v=S.get().visitors.find(x=>x.id===el.dataset.id);
    S.resolveApproval(v.id,false,App.state.user.name);
    S.notify(v.guardId,"gate",t("deniedMsg")+": "+v.name,"","/guard");
    S.log(App.state.user.name,"visitor.deny", v.name+" — denied");
    S.save(); App.render(); App.toast(t("deniedMsg"),"info");
  });
  App.act("preApproveModal", ()=>{
    const tmp=App.state.tmp;
    tmp.pa={name:"",type:"guest"};
    App.modal('<div class="field"><label>'+t("guestName")+'</label><input class="inp" id="paName" placeholder="Sharma Ji"></div>'+
      '<div class="field"><label>'+t("visitorType")+'</label><div style="display:flex;gap:8px">'+
      '<button class="btn btn-sm '+(tmp.pa.type==="guest"?"btn-primary":"btn-ghost")+'" data-action="setPaType" data-id="guest">'+t("guest")+'</button>'+
      '<button class="btn btn-sm '+(tmp.pa.type==="cab"?"btn-primary":"btn-ghost")+'" data-action="setPaType" data-id="cab">'+t("cab")+'</button>'+
      '<button class="btn btn-sm '+(tmp.pa.type==="delivery"?"btn-primary":"btn-ghost")+'" data-action="setPaType" data-id="delivery">'+t("delivery")+'</button></div></div>'+
      '<div class="field"><label>'+t("visitDate")+'</label><div style="display:flex;gap:8px">'+
      '<button class="btn btn-sm '+(tmp.pa.date===App.todayStr()?"btn-primary":"btn-ghost")+'" data-action="setPaDate" data-id="today">'+t("today")+'</button>'+
      '<button class="btn btn-sm '+(tmp.pa.date===App.tomorrowStr()?"btn-primary":"btn-ghost")+'" data-action="setPaDate" data-id="tomorrow">'+t("tomorrow")+'</button></div></div>'+
      '<div class="field"><label>'+t("timeWindow")+'</label><select class="inp" id="paWindow">'+
      ["06:00 – 09:00","09:00 – 12:00","12:00 – 15:00","15:00 – 18:00","17:00 – 19:00","18:00 – 21:00"].map(w=>'<option>'+w+'</option>').join("")+'</select></div>',
      {title:t("preApproveGuest")});
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button><button class="btn btn-gold" data-action="createPreApproval">'+t("generateCode")+'</button></div>');
  });
  App.act("setPaType", el=>{ App.state.tmp.pa.type=el.dataset.id; App.render(); });
  App.act("setPaDate", el=>{ App.state.tmp.pa.date = el.dataset.id==="today"? App.todayStr() : App.tomorrowStr(); App.render(); });
  App.act("createPreApproval", ()=>{
    const name=(document.getElementById("paName")||{}).value||"";
    const win=(document.getElementById("paWindow")||{}).value||"17:00 – 19:00";
    if(name.trim().length<2){ App.toast(t("guestName")+" "+t("required"),"error"); return; }
    const f=flatOfUser(); const tmp=App.state.tmp.pa;
    const dateIso=new Date((tmp.date||App.todayStr())+"T"+(win.split("–")[0].trim().split(":")[0])+":00:00");
    const pa=S.createPreApproval(f.id, name.trim(), tmp.type, dateIso.toISOString(), win);
    S.log(App.state.user.name,"visitor.preapprove", pa.name+" — code "+pa.code);
    S.save(); App.closeModal();
    App.modal('<div class="center"><div class="bold">'+t("entryCode")+'</div><div class="code-display"><span class="cd">'+pa.code+'</span></div>'+
      '<div class="small muted mb">'+t("codeNote")+'</div>'+
      '<button class="btn btn-success btn-block mb" data-action="shareCode" data-id="'+pa.id+'">'+App.icon("share",16)+t("shareWhatsApp")+'</button>'+
      '<button class="btn btn-ghost btn-block" data-action="copyCode" data-id="'+pa.id+'">'+App.icon("copy",16)+t("copyCode")+'</button></div>',{title:t("preApprovals")});
    App.render();
  });
  App.act("shareCode", el=>{
    const pa=S.get().preApprovals.find(x=>x.id===el.dataset.id);
    const msg=encodeURIComponent("Lumina Estate — Gate Entry Code: "+pa.code+"\nGuest: "+pa.name+"\n"+App.fmtDate(pa.date)+" "+pa.window);
    window.open("https://wa.me/?text="+msg,"_blank");
  });
  App.act("copyCode", el=>{
    const pa=S.get().preApprovals.find(x=>x.id===el.dataset.id);
    try{ navigator.clipboard.writeText(pa.code).then(()=>App.toast(t("copied")+" ✓","success")); }
    catch(e){ App.toast(pa.code,"info"); }
  });

  // bookings
  App.act("setBkDate", el=>{ App.state.tmp.bkDate=el.dataset.id; App.state.tmp.bkSlot=null; App.render(); });
  App.act("setBkSlot", el=>{ App.state.tmp.bkSlot=el.dataset.id; App.render(); });
  App.act("confirmBooking", el=>{
    const f=flatOfUser(); const fa=S.get().facilities.find(x=>x.id===el.dataset.id);
    const date=App.state.tmp.bkDate, slot=App.state.tmp.bkSlot;
    if(!date||!slot) return;
    const run=()=>{
      let paymentId=null;
      if(fa.charges>0){
        const p=S.get().payments;
        const pay={ id:"p-"+Math.random().toString(36).slice(2), flatId:f.id, billId:null, amount:fa.charges, mode:"upi",
          ref:"UPI/booking/"+Math.floor(100000000+Math.random()*899999999), at:S.nowIso(), status:"success", type:"facility",
          receiptNo:"RCP-2026-"+String(1000+p.length+1) };
        S.get().payments.push(pay); paymentId=pay.id;
      }
      const r=S.bookFacility({facilityId:fa.id, flatId:f.id, date, slot, paymentId, createdBy:App.state.user.id});
      if(!r.ok){ App.toast(t("noSlots"),"error"); return; }
      if(fa.approveRequired){
        S.notify(S.get().users.filter(x=>x.role==="admin").map(x=>x.id),"calendar",t("newComplaint")+": "+App.state.user.name, t(fa.nameKey)+" — "+App.fmtDate(date)+" "+slot, "/admin/facilities");
        S.log(App.state.user.name,"booking.create", t(fa.nameKey)+" — "+slot+" (pending)");
        App.toast(t("bookingPending"),"info");
      } else {
        S.notify(App.state.user.id,"calendar",t("bookingConfirmed")+"!", t(fa.nameKey)+" — "+App.fmtDate(date)+" "+slot, "/bookings");
        S.log(App.state.user.name,"booking.create", t(fa.nameKey)+" — "+slot);
        App.toast(t("bookingConfirmed")+" ✓","success");
      }
      S.save(); App.state.tmp.bkSlot=null; App.go("/bookings");
    };
    if(fa.charges>0){
      App.confirmModal(t("confirmBooking"), t(fa.nameKey)+" · "+App.fmtDate(date)+" · "+slot+" — "+App.fmt(fa.charges), run, t("payNowBtn"));
    } else run();
  });
  App.act("cancelBooking", el=>{
    const b=S.get().bookings.find(x=>x.id===el.dataset.id);
    App.confirmModal(t("cancelBooking"), t("cancelConfirm"), ()=>{
      S.setBookingStatus(b.id,"cancelled");
      const fa=S.get().facilities.find(x=>x.id===b.facilityId);
      S.log(App.state.user.name,"booking.cancel", t(fa.nameKey)+" — "+b.slot);
      S.save(); App.render(); App.toast(t("bookingCancelled"),"info");
    });
  });

  // polls
  App.act("votePoll", el=>{
    const f=flatOfUser(); if(!f){ App.toast(t("noResults"),"error"); return; }
    const r=S.votePoll(el.dataset.id, f.id, Number(el.dataset.opt));
    S.save(); App.render();
    App.toast(r.changed? t("flatAlreadyVoted") : t("voteRecorded")+" ✓","success");
  });

  // documents
  App.act("viewDoc", el=>{
    const d=S.get().documents.find(x=>x.id===el.dataset.id);
    if(!d) return;
    App.modal('<div class="kv"><span class="k">'+t("date")+'</span><span class="v">'+App.fmtDate(d.date)+'</span></div>'+
      '<div class="kv"><span class="k">'+t("uploadedBy")+'</span><span class="v">'+App.esc(d.uploadedBy)+'</span></div>'+
      '<div class="kv"><span class="k">'+t("fileSize")+'</span><span class="v">'+App.esc(d.size)+'</span></div>'+
      '<div class="kv"><span class="k">'+t("version")+'</span><span class="v">v'+d.version+'</span></div>'+
      '<div class="divider"></div><div class="small muted mb">'+t("docNotAvailable")+'</div>'+
      '<div style="background:var(--grey-bg);border-radius:11px;padding:13px;font-size:13px;line-height:1.6">'+App.esc(d.body)+'</div>'+
      '<div class="mt"><button class="btn btn-ghost btn-block" data-action="downloadDoc" data-id="'+d.id+'">'+App.icon("download",16)+t("download")+'</button></div>',
      {title:d.title});
  });
  App.act("downloadDoc", el=>{
    const d=S.get().documents.find(x=>x.id===el.dataset.id);
    App.download(d.title.replace(/[^\w\- ]+/g,"")+".txt", d.title+"\n\n"+d.body);
  });

  // profile
  App.act("addFamilyModal", ()=>{
    App.modal('<div class="field"><label>'+t("fullName")+'</label><input class="inp" id="fmName"></div>'+
      '<div class="field"><label>'+t("phone")+'</label><input class="inp" id="fmPhone" inputmode="numeric" placeholder="9999XXXXXX"></div>'+
      '<div class="field"><label>'+t("relation")+'</label><input class="inp" id="fmRel" placeholder="'+(App.state.lang==="hi"?"पत्नी / बेटा / बेटी":"Wife / Son / Daughter")+'"></div>',
      {title:t("addFamily")});
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button><button class="btn btn-primary" data-action="saveFamily">'+t("save")+'</button></div>');
  });
  App.act("saveFamily", ()=>{
    const name=(document.getElementById("fmName")||{}).value||"";
    const phone=(document.getElementById("fmPhone")||{}).value||"";
    const rel=(document.getElementById("fmRel")||{}).value||t("familyMember");
    if(name.trim().length<2){ App.toast(t("fullName")+" "+t("required"),"error"); return; }
    S.addFamily(App.state.user.id, name.trim(), phone.trim(), rel.trim());
    S.save(); App.closeModal(); App.render(); App.toast(t("familyAdded")+" ✓","success");
  });
  App.act("addVehicleModal", ()=>{
    App.modal('<div class="field"><label>'+t("vehicleNo")+'</label><input class="inp" id="vhNo" placeholder="UP32 XX 1234"></div>'+
      '<div class="field"><label>'+t("vehicleType")+'</label><div style="display:flex;gap:8px">'+
      '<button class="btn btn-sm btn-primary" data-action="setVhType" data-id="car">'+App.icon("car",15)+t("car")+'</button>'+
      '<button class="btn btn-sm btn-ghost" data-action="setVhType" data-id="bike">'+App.icon("bike",15)+t("bike")+'</button></div></div>',
      {title:t("addVehicle")});
    App.state.tmp.vhType="car";
    const ov=document.querySelector(".modal-overlay");
    ov.querySelector(".modal").insertAdjacentHTML("beforeend",'<div class="modal-foot"><button class="btn btn-ghost" data-action="modalClose">'+t("cancel")+'</button><button class="btn btn-primary" data-action="saveVehicle">'+t("save")+'</button></div>');
  });
  App.act("setVhType", el=>{ App.state.tmp.vhType=el.dataset.id; document.querySelectorAll('[data-action="setVhType"]').forEach(b=>{ b.className="btn btn-sm "+(b.dataset.id===el.dataset.id?"btn-primary":"btn-ghost"); }); });
  App.act("saveVehicle", ()=>{
    const no=(document.getElementById("vhNo")||{}).value||"";
    if(no.trim().length<4){ App.toast(t("vehicleNo")+" "+t("required"),"error"); return; }
    S.addVehicle(App.state.user.id, App.state.tmp.vhType||"car", no.trim().toUpperCase());
    S.save(); App.closeModal(); App.render(); App.toast(t("saved")+" ✓","success");
  });
  App.act("setLang", el=>{ App.state.lang=el.dataset.id; S.save(); App.render(); });
  App.act("downloadMyData", ()=>{ App.download("lumina-my-data.json", JSON.stringify({user:App.state.user},null,2), "application/json"); });
  App.act("resetDemo", ()=>{
    App.confirmModal(t("resetDemo"), t("resetConfirm"), ()=>{ S.reset(); App.state.user=null; App.state.tmp={photos:{}}; S.save(); App.go("/login"); App.toast(t("resetDemo")+" ✓","success"); });
  });
  App.act("loginAs", el=>{
    const u=S.userById(el.dataset.id);
    if(u && u.status==="active"){ App.state.user=u; App.state.tmp={photos:{}}; S.save(); App.go("/home"); }
  });

  /* print */
  App.act("printReceipt", ()=>{ window.print(); });
  App.act("exportLedger", ()=>{
    const f=flatOfUser();
    const rows=[["Date","Type","Details","Debit","Credit","Balance"]];
    S.ledgerFor(f.id).forEach(r=>rows.push([App.fmtDate(r.at), r.type, r.label, r.kind==="debit"?r.amount:"", r.kind==="credit"?r.amount:"", r.balance]));
    App.download("ledger-"+S.flatKey(f)+".csv", App.csv(rows), "text/csv");
  });

  /* SOS slide */
  App.act("initSosSlide", ()=>{ /* handled in app.js after render */ });
})();
