/* Lumina Estate — Store: data layer + business logic (localStorage-backed, in-memory fallback) */
window.Store = (function(){
  const KEY="lumina:v1";
  let mem=null, useMem=false;
  function storageOk(){ try{ const k="__t"; localStorage.setItem(k,"1"); localStorage.removeItem(k); return true; }catch(e){ return false; } }

  function load(){
    if(!storageOk()){ useMem=true; }
    if(!useMem){ try{ const raw=localStorage.getItem(KEY); if(raw){ mem=JSON.parse(raw); return; } }catch(e){} }
    mem = JSON.parse(JSON.stringify(window.Seed));
  }
  function save(){ if(!useMem){ try{ localStorage.setItem(KEY, JSON.stringify(mem)); }catch(e){ useMem=true; } } }
  function get(){ return mem; }
  function reset(){ try{ localStorage.removeItem(KEY); }catch(e){} mem = JSON.parse(JSON.stringify(window.Seed)); }

  // ---- helpers ----
  function uid(prefix){ return prefix + Math.random().toString(36).slice(2,9); }
  function nowIso(){ return new Date().toISOString(); }
  function monthOf(d){ const x=new Date(d); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0"); }
  function nowMonth(){ return monthOf(new Date()); }
  function pad(n){ return String(n).padStart(2,"0"); }
  function billNumber(period, flat){ return "LE/GVR/"+period.replace("-","/")+"/"+flat.towerName+"-"+flat.no; }

  function flatById(id){ return mem.flats.find(f=>f.id===id); }
  function userById(id){ return mem.users.find(u=>u.id===id); }
  function flatOf(userId){ const r=mem.residencies.find(r=>r.userId===userId); return r? flatById(r.flatId):null; }
  function residenciesOfFlat(flatId){ return mem.residencies.filter(r=>r.flatId===flatId); }
  function residentsOfFlat(flatId){ return residenciesOfFlat(flatId).map(r=>({user:userById(r.userId), role:r.role})); }
  function flatKey(f){ return f.towerName+"-"+f.no; }
  function isCommittee(user){ return user && (user.role==="admin" || user.role==="committee"); }

  // ---- billing ----
  function lateFeeNow(bill){
    if(bill.status!=="unpaid") return 0;
    const s=mem.settings.lateFee; if(!s || !s.amount) return 0;
    const grace=s.graceDays||5;
    const due=new Date(bill.dueDate); due.setDate(due.getDate()+grace);
    const today=new Date();
    if(today<=due) return 0;
    const months=1+Math.floor((today-due)/(30*86400000));
    return s.amount*Math.min(months,12);
  }
  function billTotal(bill){ return bill.net + lateFeeNow(bill); }
  function unpaidBillsFor(flatId){ return mem.bills.filter(b=>b.flatId===flatId && b.status==="unpaid").sort((a,b)=>a.period<b.period?-1:1); }
  function totalDueFor(flatId){ return unpaidBillsFor(flatId).reduce((a,b)=>a+billTotal(b),0); }
  function billsFor(flatId){ return mem.bills.filter(b=>b.flatId===flatId).sort((a,b)=>a.period<b.period?1:-1); }
  function paidBillsFor(flatId){ return mem.bills.filter(b=>b.flatId===flatId && b.status==="paid"); }

  function computeBill(flat, period){
    const items = mem.chargeHeads.map(h=>({headId:h.id, label:h.name, amount: h.type==="per_sqft"? Math.round(h.rate*flat.area) : h.rate}));
    const sum = items.reduce((a,i)=>a+i.amount,0);
    const arrears = mem.bills.filter(b=>b.flatId===flat.id && b.status==="unpaid" && b.period<period).reduce((a,b)=>a+b.net,0);
    return { items, sum, arrears, net: sum+arrears };
  }
  function generateBills(period){
    if(mem.bills.some(b=>b.period===period)) return {ok:false, reason:"exists"};
    const due=new Date(period.split("-")[0], Number(period.split("-")[1])-1, 10, 23, 59);
    const created=[];
    mem.flats.filter(f=>f.occupancy==="occupied").forEach(f=>{
      const c=computeBill(f,period);
      const b={ id:uid("b"), flatId:f.id, period, number:billNumber(period,f), items:c.items, arrears:c.arrears,
        net:c.net, status:"unpaid", dueDate:due.toISOString(), publishedAt:nowIso(), paidAt:null, paidAmount:0, revised:false };
      mem.bills.push(b); created.push(b);
    });
    return {ok:true, count:created.length, bills:created};
  }

  function payBill(billId, mode, ref){
    const bill=mem.bills.find(b=>b.id===billId); if(!bill||bill.status!=="unpaid") return null;
    const amount=billTotal(bill);
    const p={ id:uid("p"), flatId:bill.flatId, billId, amount, mode, ref:ref||("TXN"+Math.floor(100000+Math.random()*899999)),
      at:nowIso(), status:"success", type:"maintenance", receiptNo:"RCP-2026-"+String(1000+mem.payments.length+1) };
    mem.payments.push(p);
    bill.status="paid"; bill.paidAt=p.at; bill.paidAmount=amount;
    return p;
  }
  function manualPayment(flatId, amount, mode, ref){
    let remaining=amount;
    unpaidBillsFor(flatId).forEach(b=>{
      if(remaining<=0) return;
      const need=billTotal(b);
      if(remaining>=need){
        const p={ id:uid("p"), flatId, billId:b.id, amount:need, mode, ref:ref||("MANUAL-"+mode), at:nowIso(),
          status:"success", type:"maintenance", receiptNo:"RCP-2026-"+String(1000+mem.payments.length+1) };
        mem.payments.push(p); b.status="paid"; b.paidAt=p.at; b.paidAmount=need; remaining=Math.round((remaining-need)*100)/100;
      }
    });
    if(remaining>0){
      const p={ id:uid("p"), flatId, billId:null, amount:remaining, mode, ref:ref||("ADV-"+mode), at:nowIso(),
        status:"success", type:"maintenance", receiptNo:"RCP-2026-"+String(1000+mem.payments.length+1), note:"advance" };
      mem.payments.push(p);
    }
    return true;
  }
  function revokePayment(paymentId, reason){
    const p=mem.payments.find(x=>x.id===paymentId); if(!p) return;
    p.status="void"; p.voidReason=reason;
    if(p.billId){ const b=mem.bills.find(x=>x.id===p.billId); if(b){ b.status="unpaid"; b.paidAt=null; b.paidAmount=0; } }
  }

  function ledgerFor(flatId){
    const rows=[];
    mem.bills.filter(b=>b.flatId===flatId).forEach(b=>{
      rows.push({at:b.publishedAt, type:"bill", label:"Bill "+b.period+" ("+b.number+")", amount:b.net, kind:"debit"});
      if(b.status==="paid") rows.push({at:b.paidAt, type:"payment", label:"Payment received", amount:b.paidAmount, kind:"credit", billId:b.id});
    });
    mem.payments.filter(p=>p.flatId===flatId && p.type!=="facility" && !p.billId && p.status==="success").forEach(p=>{
      rows.push({at:p.at, type:"advance", label:"Advance payment", amount:p.amount, kind:"credit"});
    });
    rows.sort((a,b)=>a.at<b.at?-1:1);
    let bal=0; return rows.map(r=>{ bal = r.kind==="debit"? bal+r.amount : bal-r.amount; return Object.assign({},r,{balance:bal}); });
  }

  // ---- collections / reports ----
  function collectionsByPeriod(period){
    const monthBills=mem.bills.filter(b=>b.period===period);
    const billed=monthBills.reduce((a,b)=>a+b.net,0);
    const collected=mem.payments.filter(p=>p.type==="maintenance" && p.status==="success" && monthOf(p.at)===period).reduce((a,p)=>a+p.amount,0);
    return {billed, collected, outstanding: Math.max(0,billed-collected)};
  }
  function defaultersList(){
    const out=[];
    mem.flats.filter(f=>f.occupancy==="occupied").forEach(f=>{
      const unpaid=unpaidBillsFor(f.id);
      if(!unpaid.length) return;
      const due=unpaid.reduce((a,b)=>a+billTotal(b),0);
      const oldest=unpaid[0];
      const days=Math.max(0, Math.floor((new Date()-new Date(oldest.dueDate))/86400000));
      const residents=residentsOfFlat(f.id);
      out.push({flat:f, due, days, bills:unpaid.length, residents});
    });
    return out.sort((a,b)=>b.due-a.due);
  }

  // ---- complaints ----
  function nextTicket(){
    const m=nowMonth().replace("-","");
    const n=mem.complaints.length+1;
    return "CMP-"+m+"-"+String(n).padStart(3,"0");
  }
  function raiseComplaint(o){
    const c={ id:uid("cmp"), ticketNo:nextTicket(), flatId:o.flatId, community:!o.flatId,
      title:o.title, category:o.category, desc:o.desc, status:"open", assigneeId:null,
      createdBy:o.createdBy, createdAt:nowIso(), slaDueAt:new Date(Date.now()+4*3600000).toISOString(),
      photos:o.photos||[], upvotes:[], rating:null, ratingComment:null, resolvedAt:null,
      timeline:[{at:nowIso(), status:"open", note:"Complaint filed by "+o.creatorName+" ("+(o.flatKey||"Common Area")+")"}] };
    mem.complaints.unshift(c);
    return c;
  }
  function assignComplaint(cid, staffId, byName){
    const c=mem.complaints.find(x=>x.id===cid); if(!c) return;
    const st=mem.staffMembers.find(s=>s.id===staffId);
    c.assigneeId=staffId; if(c.status==="open") c.status="assigned";
    c.timeline.push({at:nowIso(), status:"assigned", note:"Assigned to "+ (st?st.name:"—") +" by "+byName});
  }
  function progressComplaint(cid, note){
    const c=mem.complaints.find(x=>x.id===cid); if(!c) return;
    c.status="in_progress"; c.timeline.push({at:nowIso(), status:"in_progress", note:note||"Kaam shuru — in progress"});
  }
  function resolveComplaint(cid, note, photo){
    const c=mem.complaints.find(x=>x.id===cid); if(!c) return;
    c.status="resolved"; c.resolvedAt=nowIso(); if(photo) c.photos.push(photo);
    c.timeline.push({at:nowIso(), status:"resolved", note:note||"Resolved with photo proof"});
  }
  function confirmComplaint(cid, rating, comment){
    const c=mem.complaints.find(x=>x.id===cid); if(!c) return;
    c.status="closed"; c.rating=rating; c.ratingComment=comment||null;
    c.timeline.push({at:nowIso(), status:"closed", note:"Confirmed by resident — "+rating+"★"+(comment? " · "+comment:"")});
  }
  function reopenComplaint(cid, reason){
    const c=mem.complaints.find(x=>x.id===cid); if(!c) return;
    c.status="open"; c.assigneeId=null;
    c.timeline.push({at:nowIso(), status:"open", note:"Reopened by resident — "+reason});
  }
  function upvoteComplaint(cid, flatId){
    const c=mem.complaints.find(x=>x.id===cid); if(!c) return;
    if(c.upvotes.includes(flatId)) return false;
    c.upvotes.push(flatId); return true;
  }
  function addComment(cid, text, authorName, authorRole){
    const c=mem.complaints.find(x=>x.id===cid); if(!c) return;
    if(!c.comments) c.comments=[];
    c.comments.push({at:nowIso(), text, authorName, authorRole});
  }

  // ---- notices ----
  function publishNotice(o){
    const n={ id:uid("nt"), createdAt:nowIso(), title:o.title, body:o.body, category:o.category,
      audience:o.audience||"all", pinned:!!o.pinned, readBy:[], rsvp:{yes:[],no:[],maybe:[]}, attachments:[] };
    mem.notices.unshift(n);
    return n;
  }
  function markRead(nid, userId){
    const n=mem.notices.find(x=>x.id===nid);
    if(n && !n.readBy.includes(userId)) n.readBy.push(userId);
  }
  function noticeAudience(n){
    const flatIds=[];
    mem.flats.filter(f=>f.occupancy==="occupied").forEach(f=>{
      if(n.audience==="all") flatIds.push(f.id);
      else if(n.audience==="towerA" && f.tower==="twA") flatIds.push(f.id);
      else if(n.audience==="towerB" && f.tower==="twB") flatIds.push(f.id);
      else if(n.audience==="towerC" && f.tower==="twC") flatIds.push(f.id);
    });
    const userIds=new Set();
    mem.residencies.forEach(r=>{ if(flatIds.includes(r.flatId)) userIds.add(r.userId); });
    return Array.from(userIds);
  }

  // ---- visitors ----
  function createPreApproval(flatId, name, type, dateIso, window){
    const code=String(Math.floor(100000+Math.random()*899999));
    const pa={ id:uid("pa"), flatId, name, type, date:dateIso, window, code, used:false,
      createdBy:(window.App && window.App.state && window.App.state.user)? window.App.state.user.id:null, createdAt:nowIso() };
    mem.preApprovals.push(pa);
    return pa;
  }
  function guardEntry(o){
    const v={ id:uid("v"), inAt:nowIso(), outAt:null, name:o.name||"—", phone:o.phone||"",
      category:o.category, flatIds:o.flatIds||[], gate:"Gate 1", guardId:o.guardId,
      approval:o.approval||"pending", note:o.note||"", photo:o.photo||null };
    mem.visitors.unshift(v);
    return v;
  }
  function resolveApproval(vid, allow, byName){
    const v=mem.visitors.find(x=>x.id===vid); if(!v) return;
    v.approval=allow?"approved":"denied"; v.approvedBy=byName; v.approvedAt=nowIso();
    if(!allow) v.outAt=nowIso();
  }
  function verifyCode(code, guardId){
    const pa=mem.preApprovals.find(p=>p.code===code && !p.used);
    if(!pa) return null;
    const d=new Date(pa.date); const today=new Date();
    if(d.toDateString()!==today.toDateString() && d<today) return {expired:true};
    pa.used=true;
    const v=guardEntry({name:pa.name, category:pa.type==="guest"?"guest":pa.type, flatIds:[pa.flatId], approval:"verified", note:"Pre-approved code entry", guardId});
    return {ok:true, pa, visitor:v};
  }
  function exitVisitor(vid){ const v=mem.visitors.find(x=>x.id===vid); if(v) v.outAt=nowIso(); }

  // ---- bookings ----
  function slotLabel(fac, i){ return fac.slots[i].s+" – "+fac.slots[i].e; }
  function bookingsForSlot(facId, dateIso, slot){
    return mem.bookings.filter(b=>b.facilityId===facId && b.date===dateIso && b.slot===slot && b.status!=="cancelled");
  }
  function bookFacility(o){
    const fac=mem.facilities.find(f=>f.id===o.facilityId);
    const existing=bookingsForSlot(o.facilityId, o.date, o.slot);
    if(existing.length>=fac.capacity) return {ok:false, reason:"conflict"};
    const b={ id:uid("bk"), facilityId:o.facilityId, flatId:o.flatId, date:o.date, slot:o.slot,
      status:fac.approveRequired?"pending_approval":"confirmed", amount:fac.charges, paymentId:o.paymentId||null,
      createdBy:o.createdBy, createdAt:nowIso() };
    mem.bookings.push(b);
    return {ok:true, booking:b};
  }
  function setBookingStatus(bkid, status){ const b=mem.bookings.find(x=>x.id===bkid); if(b) b.status=status; }

  // ---- expenses ----
  function addExpense(o){
    const e={ id:uid("ex"), category:o.category, amount:Number(o.amount), vendor:o.vendor, date:o.date||nowIso(),
      mode:o.mode, note:o.note||"", status:"active", receipt:!!o.receipt };
    mem.expenses.unshift(e);
    return e;
  }
  function voidExpense(eid, reason){ const e=mem.expenses.find(x=>x.id===eid); if(e){ e.status="void"; e.voidReason=reason||""; } }
  function expensesForMonth(period){ return mem.expenses.filter(e=>monthOf(e.date)===period && e.status==="active"); }
  function incomeForMonth(period){
    return mem.payments.filter(p=>p.status==="success" && p.type==="maintenance" && monthOf(p.at)===period).reduce((a,p)=>a+p.amount,0);
  }

  // ---- polls ----
  function votePoll(pollId, flatId, opt){
    const p=mem.polls.find(x=>x.id===pollId); if(!p || p.status!=="closed" && new Date(p.deadline)<new Date()) return {ok:false};
    const existing=p.votes.find(v=>v.flatId===flatId);
    if(existing){ existing.opt=opt; existing.at=nowIso(); return {ok:true, changed:true}; }
    p.votes.push({flatId, opt, at:nowIso()});
    return {ok:true, changed:false};
  }
  function createPoll(o){
    const p={ id:uid("pl"), question:o.question, options:o.options, mode:o.mode||"flat", anonymous:o.anonymous!==false,
      deadline:o.deadline, createdAt:nowIso(), audience:"all", status:"active", votes:[] };
    mem.polls.unshift(p);
    return p;
  }

  // ---- users / members ----
  function findUserByPhone(phone){ return mem.users.find(u=>u.phone===phone); }
  function createUser(o){
    const u={ id:uid("u"), name:o.name, phone:o.phone, role:o.role||"owner", status:o.status||"pending",
      lang:o.role==="guard"||o.role==="staff"?"hi":"hi", joinedAt:nowIso(), family:[], vehicles:[], notifPrefs:{inApp:true,email:true,sms:true,whatsapp:false} };
    mem.users.push(u);
    if(o.flatId) mem.residencies.push({id:uid("rs"), userId:u.id, flatId:o.flatId, role:u.role==="family"?"family":u.role, since:nowIso()});
    return u;
  }
  function setUserStatus(userId, status){ const u=userById(userId); if(u){ u.status=status; } }
  function addFamily(userId, name, phone, relation){
    const u=userById(userId); if(!u) return;
    u.family.push({id:uid("fm"), name, phone, relation});
  }
  function addVehicle(userId, type, no){ const u=userById(userId); if(u) u.vehicles.push({id:uid("vh"), type, no}); }

  // ---- notifications / audit ----
  function notify(userIds, icon, title, body, link){
    if(!Array.isArray(userIds)) userIds=[userIds];
    userIds.forEach(uidv=>{
      mem.notifications.unshift({id:uid("n"), userId:uidv, icon, title, body, at:nowIso(), read:false, link:link||null});
    });
    if(mem.notifications.length>300) mem.notifications.length=300;
  }
  function log(actor, action, detail){
    mem.auditLog.unshift({id:uid("a"), at:nowIso(), actor, action, detail});
    if(mem.auditLog.length>500) mem.auditLog.length=500;
  }
  function sos(userId, category){
    const u=userById(userId); const f=flatOf(userId);
    const alert={ id:uid("sos"), userId, category, name:u.name, flat:f?flatKey(f):"", at:nowIso(), status:"active" };
    if(!mem.sosAlerts) mem.sosAlerts=[];
    mem.sosAlerts.unshift(alert);
    return alert;
  }
  function sosRespond(alertId, responder){
    const a=mem.sosAlerts.find(x=>x.id===alertId); if(a){ a.status="responding"; a.responder=responder; a.respondedAt=nowIso(); }
  }

  // ---- documents ----
  function addDocument(o){
    const d={ id:uid("d"), folder:o.folder, title:o.title, date:nowIso(), access:o.access||"all",
      version:1, size:o.size||"—", uploadedBy:o.uploadedBy, body:o.body||"" };
    mem.documents.unshift(d);
    return d;
  }

  return { load, save, get, reset, nowIso, monthOf, nowMonth, pad,
    flatById, userById, flatOf, flatKey, residentsOfFlat, residenciesOfFlat, isCommittee,
    lateFeeNow, billTotal, unpaidBillsFor, totalDueFor, billsFor, paidBillsFor, computeBill, generateBills,
    payBill, manualPayment, revokePayment, ledgerFor, collectionsByPeriod, defaultersList,
    nextTicket, raiseComplaint, assignComplaint, progressComplaint, resolveComplaint, confirmComplaint,
    reopenComplaint, upvoteComplaint, addComment,
    publishNotice, markRead, noticeAudience,
    createPreApproval, guardEntry, resolveApproval, verifyCode, exitVisitor,
    bookingsForSlot, bookFacility, setBookingStatus,
    addExpense, voidExpense, expensesForMonth, incomeForMonth,
    votePoll, createPoll,
    findUserByPhone, createUser, setUserStatus, addFamily, addVehicle,
    notify, log, sos, sosRespond, addDocument };
})();
