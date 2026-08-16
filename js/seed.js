/* Lumina Estate — Demo seed data (Green Valley Residency, Lucknow)
   Dates are generated relative to "today" so the demo always feels live. */
window.Seed = (function(){
  function daysAgo(n,h,m){ const d=new Date(); d.setDate(d.getDate()-n); d.setHours(h||10,m||0,0,0); return d.toISOString(); }
  function daysAhead(n,h,m){ const d=new Date(); d.setDate(d.getDate()+n); d.setHours(h||10,m||0,0,0); return d.toISOString(); }
  function todayAt(h,m){ const d=new Date(); d.setHours(h||10,m||0,0,0); return d.toISOString(); }
  function nowIso(){ return new Date().toISOString(); }
  function mk(y,m){ return y+"-"+String(m).padStart(2,"0"); }
  function mkNow(){ const d=new Date(); return mk(d.getFullYear(), d.getMonth()+1); }
  function mkPrev(n){ const d=new Date(); d.setMonth(d.getMonth()-n); return mk(d.getFullYear(), d.getMonth()+1); }
  function dueDateOf(period){ // 10th of the period month, 23:59
    const [y,m]=period.split("-").map(Number); const d=new Date(y,m-1,10,23,59,0); return d.toISOString(); }

  const month = mkNow(), prev = mkPrev(1);

  // ---- Society / settings ----
  const settings = { lateFee:{graceDays:5, amount:100}, tenantBillingVisible:true,
    approvalTimeout:"family_cascade", defaultLang:"hi", societyPlan:"standard" };

  // ---- Charge heads (billing structure) ----
  const chargeHeads = [
    {id:"ch1", name:{en:"Maintenance (CAM)", hi:"रखरखाव शुल्क (CAM)"}, type:"per_sqft", rate:2.50, gst:false},
    {id:"ch2", name:{en:"Sinking Fund", hi:"सिंकिंग फंड"}, type:"per_sqft", rate:0.50, gst:false},
    {id:"ch3", name:{en:"Water Charges", hi:"जल शुल्क"}, type:"fixed", rate:300, gst:false},
    {id:"ch4", name:{en:"Common & Parking", hi:"सामान्य एवं पार्किंग"}, type:"fixed", rate:150, gst:false}
  ];

  // ---- Towers & Flats ----
  const towerDefs = [
    {id:"twA", name:"A", floors:5},
    {id:"twB", name:"B", floors:4},
    {id:"twC", name:"C", floors:4}
  ];
  const flatSpecs = [];
  function addFlats(tower, nums, area, type){ nums.forEach(n=>flatSpecs.push({tower:tower, no:n, area:area, type:type})); }
  addFlats("twA",[101,102,201,202,301,302,303,304,401,402,501,502],1300,"3BHK");
  addFlats("twB",[101,102,201,202,301,302,401,402],1000,"2BHK");
  addFlats("twC",[101,102,201,202,301,302,401,402],1050,"2BHK");

  let fid=0, uid=0;
  const flats = flatSpecs.map(s=>({ id:"fl"+(++fid), tower:s.tower, no:String(s.no), area:s.area, type:s.type,
    towerName:s.tower==="twA"?"A":s.tower==="twB"?"B":"C", occupancy:"occupied" }));
  flats.find(f=>f.no==="402"&&f.tower==="twC").occupancy="vacant";

  const genericNames = [
    ["Suresh Gupta","9999100011"],["Anita Sharma","9999100012"],["Ravi Agarwal","9999100013"],["Meena Mishra","9999100014"],
    ["Vikas Srivastava","9999100015"],["Pooja Tiwari","9999100016"],["Amit Singh","9999100017"],["Neha Yadav","9999100018"],
    ["Sanjay Kapoor","9999100019"],["Kiran Mehta","9999100020"],["Deepak Joshi","9999100021"],["Rekha Chauhan","9999100022"],
    ["Manoj Bhatia","9999100023"],["Shalini Saxena","9999100024"],["Arun Tripathi","9999100025"],["Divya Rastogi","9999100026"],
    ["Harish Pandey","9999100027"],["Sunita Nigam","9999100028"],["Gaurav Asthana","9999100029"],["Priyanka Khera","9999100030"],
    ["Nitin Bansal","9999100031"],["Rashmi Khanna","9999100032"],["Alok Jain","9999100033"],["Vandana Seth","9999100034"]
  ];

  const users = [];
  const residencies = [];
  function makeUser(name, phone, role, status){ const u={id:"u"+(++uid), name, phone, role, status:status||"active", lang:"hi", joinedAt:daysAgo(200), family:[], vehicles:[], notifPrefs:{inApp:true,email:true,sms:true,whatsapp:false}}; users.push(u); return u; }
  function res(user, flat, role, since){ residencies.push({id:"rs"+residencies.length, userId:user.id, flatId:flat.id, role:role, since:since||daysAgo(300)}); }

  // Personas
  const admin = makeUser("Col. (Retd.) A.K. Singh","9999000001","admin");
  const rajesh = makeUser("Rajesh Verma","9999000002","owner");
  const priya = makeUser("Priya Sharma","9999000003","tenant");
  const ramesh = makeUser("Ramesh Kumar","9999000004","guard");
  const sunita = makeUser("Sunita Devi","9999000005","staff");
  const ritu = makeUser("Ritu Verma","9999000006","family");
  const vikram = makeUser("Vikram Malhotra","9999000007","owner");
  const pendingUser = makeUser("Ankit Kumar","9999100040","owner","pending");
  admin.lang="hi"; ramesh.lang="hi"; sunita.lang="hi";

  const fA101 = flats[0], fA304 = flats[7], fB201 = flats.find(f=>f.tower==="twB"&&f.no==="201");
  const fB302 = flats.find(f=>f.tower==="twB"&&f.no==="302");
  res(admin, fA101, "owner"); res(rajesh, fA304, "owner"); res(ritu, fA304, "family");
  res(vikram, fB201, "owner"); res(priya, fB201, "tenant");
  pendingUser.wantsFlat = fB302.id;

  // Generic residents for remaining occupied flats
  let gi=0;
  flats.forEach(f=>{
    if(f.occupancy==="vacant") return;
    if(["fl1","fl8","fl15"].includes(f.id)) return; // A-101 admin, A-304 rajesh, B-201 vikram/priya
    const [nm,ph]=genericNames[gi++];
    const u=makeUser(nm,ph,"owner"); res(u,f,"owner");
  });

  const staffMembers = [
    {id:"st1", name:"Sunita Devi", role:"Housekeeping Supervisor", phone:"9999000005"},
    {id:"st2", name:"Ramesh Kumar", role:"Security Guard (Gate 1)", phone:"9999000004"},
    {id:"st3", name:"Mahesh Pal", role:"Electrician", phone:"9999100051"},
    {id:"st4", name:"Lift AMC", role:"Vendor — Lift Maintenance", phone:"1800123456", vendor:true}
  ];

  const committee = [
    {name:"Mrs. Kavita Malhotra", role:"President", flat:"A-201", phone:"9999100061"},
    {name:"Col. (Retd.) A.K. Singh", role:"Secretary", flat:"A-101", phone:"9999000001"},
    {name:"Mr. Sanjay Kapoor", role:"Treasurer", flat:"B-301", phone:"9999100019"}
  ];

  // ---- Bills ----
  function calcBill(flat, period){
    const items = chargeHeads.map(h=>({headId:h.id, label:h.name, amount: h.type==="per_sqft" ? Math.round(h.rate*flat.area) : h.rate}));
    return { items, sum: items.reduce((a,i)=>a+i.amount,0) };
  }
  const bills=[]; let bid=0;
  function createBill(flat, period, dueIso, publishedAt){
    const c=calcBill(flat,period);
    const prevUnpaid = bills.filter(b=>b.flatId===flat.id && b.status==="unpaid" && b.period<period).reduce((a,b)=>a+b.net,0);
    const net = c.sum + prevUnpaid;
    const b={ id:"b"+(++bid), flatId:flat.id, period, number:"LE/GVR/"+period.replace("-","/")+"/"+(flat.towerName)+"-"+flat.no,
      items:c.items, arrears:prevUnpaid, net, status:"unpaid", dueDate:dueIso, publishedAt, paidAt:null, paidAmount:0, revised:false };
    bills.push(b); return b;
  }

  // July bills (all generated 1st July, due 10th July)
  flats.filter(f=>f.occupancy==="occupied").forEach(f=>createBill(f, prev, dueDateOf(prev), daysAgo(45)));
  // August bills (generated 1st Aug, due 10th Aug)
  flats.filter(f=>f.occupancy==="occupied").forEach(f=>createBill(f, month, dueDateOf(month), daysAgo(15)));

  // ---- Payments ----
  const payments=[]; let pid=0, rcp=1000;
  function pay(billId, flatId, amount, mode, ref, at, type){
    const p={ id:"p"+(++pid), flatId, billId, amount, mode, ref, at, status:"success", type:type||"maintenance", receiptNo:"RCP-2026-"+(++rcp) };
    payments.push(p); return p;
  }
  // July: all paid (except A-502 -> arrears)
  bills.filter(b=>b.period===prev).forEach(b=>{
    const f=flats.find(x=>x.id===b.flatId);
    if(f.tower==="twA" && f.no==="502") return; // defaulter
    const at=daysAgo(30 + (f.no.charCodeAt(0)%5), 12+ (f.no.length%8), 30);
    pay(b.id, b.flatId, b.net, ["upi","upi","card","netbanking","upi"][f.no.length%5], "UPI:"+(f.no)+"@upi", at);
    b.status="paid"; b.paidAt=at; b.paidAmount=b.net;
  });
  // August: ~62% paid
  bills.filter(b=>b.period===month).forEach((b,i)=>{
    if(i%3===0) return; // unpaid
    if(b.flatId===rajesh.flatId||false){}
    const f=flats.find(x=>x.id===b.flatId);
    if(f.id===fA304.id || f.tower==="twA"&&f.no==="502" || f.tower==="twB"&&f.no==="302") return;
    const at=daysAgo(14 - (i%12), 10+(i%9), 15);
    pay(b.id, b.flatId, b.net, ["upi","upi","upi","card","netbanking"][i%5], "TXN"+String(700000+i), at);
    b.status="paid"; b.paidAt=at; b.paidAmount=b.net;
  });
  // Facility payment (Priya badminton)
  const facPay = pay(null, priya.residencyFlatId || fB201.id, 100, "upi", "UPI:priya@upi", daysAgo(1,19,5), "facility");

  // ---- Complaints ----
  const complaints=[]; let cid=0;
  function timeline(){ return []; }
  const cmp1={ id:"cmp"+(++cid), ticketNo:"CMP-"+month.replace("-","")+"-0"+cid, flatId:null, community:true,
    title:"Lift B band hai — subah se", category:"lift", desc:"Tower B ki lift subah 7 baje se band hai. Baarish ke baad kuch awaaz aa rahi thi.",
    status:"in_progress", assigneeId:"st4", createdBy:rajesh.id, createdAt:daysAgo(1,7,40), slaDueAt:daysAgo(1,11,40),
    photos:[], upvotes:["fl1","fl2","fl3","fl4","fl5","fl6"], rating:null, ratingComment:null,
    timeline:[ {at:daysAgo(1,7,40), status:"open", note:"Complaint filed by Rajesh Verma (A-304)"},
      {at:daysAgo(1,8,10), status:"assigned", note:"Assigned to Lift AMC vendor"},
      {at:daysAgo(1,9,0), status:"in_progress", note:"Technician informed — ETA 2 hours"} ] };
  const cmp2={ id:"cmp"+(++cid), ticketNo:"CMP-"+month.replace("-","")+"-0"+cid, flatId:fA304.id, community:false,
    title:"Bathroom ki chhat se seepage", category:"civil", desc:"Master bathroom ki chhat se paani tapak raha hai. Upar wale flat se a raha hai lagta hai.",
    status:"assigned", assigneeId:"st3", createdBy:rajesh.id, createdAt:daysAgo(2,18,20), slaDueAt:daysAgo(2,22,20),
    photos:[], upvotes:[], rating:null, ratingComment:null,
    timeline:[ {at:daysAgo(2,18,20), status:"open", note:"Complaint filed by Rajesh Verma (A-304)"},
      {at:daysAgo(2,20,5), status:"assigned", note:"Assigned to Mahesh Pal (Electrician/Civil)"} ] };
  const cmp3={ id:"cmp"+(++cid), ticketNo:"CMP-"+month.replace("-","")+"-0"+cid, flatId:null, community:true,
    title:"Park ki lights band hain", category:"electrical", desc:"Garden area ki 4 lights band hain. Sham ko andhera ho jata hai.",
    status:"closed", assigneeId:"st3", createdBy:priya.id, createdAt:daysAgo(6,19,0), slaDueAt:daysAgo(6,23,0),
    photos:[], upvotes:["fl1","fl2"], rating:5, ratingComment:"Bahut jaldi thik kar diya. Great work!",
    resolvedAt:daysAgo(4,11,30),
    timeline:[ {at:daysAgo(6,19,0), status:"open", note:"Complaint filed by Priya Sharma (B-201)"},
      {at:daysAgo(6,20,0), status:"assigned", note:"Assigned to Mahesh Pal"},
      {at:daysAgo(5,10,0), status:"in_progress", note:"Kaam shuru — bulbs change kiye ja rahe hain"},
      {at:daysAgo(4,11,30), status:"resolved", note:"Resolved with photo proof"},
      {at:daysAgo(4,12,0), status:"closed", note:"Confirmed by resident — 5 star rating"} ] };
  const cmp4={ id:"cmp"+(++cid), ticketNo:"CMP-"+month.replace("-","")+"-0"+cid, flatId:null, community:true,
    title:"B block ke paas kachra collect nahi hua", category:"housekeeping", desc:"Kal ka garbage pickup miss ho gaya. B block ke paas dustbins full hain.",
    status:"open", assigneeId:null, createdBy:victimUser(vikram).id, createdAt:daysAgo(0,8,30), slaDueAt:daysAgo(0,12,30),
    photos:[], upvotes:["fl1"], rating:null, ratingComment:null,
    timeline:[ {at:daysAgo(0,8,30), status:"open", note:"Complaint filed by Vikram Malhotra (B-201)"} ] };
  const cmp5={ id:"cmp"+(++cid), ticketNo:"CMP-"+month.replace("-","")+"-0"+cid, flatId:null, community:true,
    title:"Gym ka AC thanda nahi kar raha", category:"maintenance", desc:"Gym ke dono AC kamzor chal rahe hain. Garmi mein workout mushkil ho raha hai.",
    status:"open", assigneeId:null, createdBy:priya.id, createdAt:daysAgo(0,9,15), slaDueAt:daysAgo(0,13,15),
    photos:[], upvotes:[], rating:null, ratingComment:null,
    timeline:[ {at:daysAgo(0,9,15), status:"open", note:"Complaint filed by Priya Sharma (B-201)"} ] };
  function victimUser(u){ return u; }
  complaints.push(cmp1,cmp2,cmp3,cmp4,cmp5);

  // ---- Notices ----
  const notices=[]; let nid=0;
  function notice(o){ const n={ id:"nt"+(++nid), createdAt:o.createdAt, title:o.title, body:o.body, category:o.category,
    audience:o.audience||"all", pinned:!!o.pinned, readBy:o.readBy||[], rsvp:{yes:[],no:[],maybe:[]}, attachments:o.attachments||[] };
    notices.push(n); return n; }
  notice({ createdAt:daysAgo(0,9,0), title:"पानी की सप्लाई कल सुबह 10–2 बजे बंद रहेगी | Water supply shut tomorrow 10am–2pm",
    body:"सभी निवासियों को सूचित किया जाता है कि टैंक की सफाई के कारण कल सुबह 10 बजे से दोपहर 2 बजे तक पानी की सप्लाई बंद रहेगी। कृपया पानी पहले से भर कर रखें।\n\nDear residents, due to tank cleaning, water supply will remain shut tomorrow 10 AM to 2 PM. Please store water in advance.\n\n— प्रबंध समिति / Managing Committee",
    category:"emergency", pinned:true, readBy:["u1","u2","u4"] });
  notice({ createdAt:daysAgo(1,18,30), title:"स्वतंत्रता दिवस समारोह की झलकियाँ — धन्यवाद! | Independence Day celebration",
    body:"कल हुए ध्वजारोहण और सांस्कृतिक कार्यक्रम में शामिल होने वाले सभी परिवारों का धन्यवाद! बच्चों की प्रस्तुतियाँ शानदार रहीं। फोटो जल्द ही दस्तावेज़ अनुभाग में उपलब्ध होंगी।\n\nThanks to all families who joined yesterday's flag hoisting and cultural program! Photos will be uploaded in the Documents section soon.",
    category:"event", readBy:["u1","u2","u3","u4"] });
  notice({ createdAt:daysAgo(3,12,0), title:"वार्षिक आम सभा (AGM) — 6 सितंबर | Annual General Meeting — 6th September",
    body:"वार्षिक आम सभा 6 सितंबर, रविवार को शाम 5 बजे कम्युनिटी हॉल में आयोजित होगी। एजेंडा:\n1. वार्षिक लेखा प्रस्तुति (FY 2025-26)\n2. अगले वर्ष का बजट अनुमोदन\n3. कमेटी चुनाव की घोषणा\nकृपया उपस्थिति की पुष्टि करें।\n\nAnnual General Meeting on 6th September, Sunday 5 PM at the Community Hall. Agenda: annual accounts, next-year budget, election announcement. Please RSVP.",
    category:"meeting", pinned:true, readBy:["u1","u2","u3","u4","u5"] });
  notice({ createdAt:daysAgo(6,11,0), title:"कार वॉश वेंडर इस शनिवार | Car wash vendor this Saturday",
    body:"गेट पर इस शनिवार सुबह 8 से शाम 6 बजे तक कार वॉश की सुविधा उपलब्ध होगी। दरें: हैचबैक ₹300, सेडान ₹400, SUV ₹500।\n\nCar wash facility at the gate this Saturday 8 AM to 6 PM. Rates: Hatchback ₹300, Sedan ₹400, SUV ₹500.",
    category:"general", readBy:["u1","u2"] });

  // ---- Visitors / VMS ----
  const visitors=[]; let vid=0;
  function visitor(o){ const v={ id:"v"+(++vid), inAt:o.inAt, outAt:o.outAt||null, name:o.name, phone:o.phone||"",
    category:o.category, flatIds:o.flatIds, gate:"Gate 1", guardId:ramesh.id, approval:o.approval||"verified",
    note:o.note||"", photo:o.photo||null }; visitors.push(v); return v; }
  // History yesterday
  visitor({inAt:daysAgo(1,12,10), outAt:daysAgo(1,12,14), name:"Amazon Delivery", category:"delivery", flatIds:[fB201.id], approval:"notified"});
  visitor({inAt:daysAgo(1,14,2), outAt:daysAgo(1,14,30), name:"Ola Cab", category:"cab", flatIds:[fA304.id], approval:"notified"});
  visitor({inAt:daysAgo(1,20,5), outAt:daysAgo(1,21,40), name:"Swiggy", category:"delivery", flatIds:[fB201.id], approval:"notified"});
  // Daily staff today (one still inside)
  visitor({inAt:todayAt(7,40), outAt:null, name:"Shyam (Driver)", category:"daily_staff", flatIds:[fB201.id], approval:"verified", note:"Daily pass"});
  visitor({inAt:todayAt(8,5), outAt:todayAt(11,20), name:"Kavita (Maid)", category:"daily_staff", flatIds:[fA304.id], approval:"verified", note:"Daily pass"});
  // Walk-in pending approval RIGHT NOW (demo flow for Rajesh)
  visitor({inAt:todayAt(10,12), outAt:null, name:"Amit Kumar (Electrician)", category:"service", flatIds:[fA304.id], approval:"pending", note:"Walk-in — approval required"});
  // Past approved guest
  visitor({inAt:daysAgo(2,17,30), outAt:daysAgo(2,20,0), name:"Sharma Ji (Guest)", category:"guest", flatIds:[fA304.id], approval:"approved"});

  // Pre-approvals
  const preApprovals=[
    {id:"pa1", flatId:fA304.id, name:"Sharma Ji", type:"guest", date:todayAt(17,0), window:"17:00 – 19:00", code:"246813", used:false, createdBy:rajesh.id, createdAt:daysAgo(0,8,0)},
    {id:"pa2", flatId:fB201.id, name:"Deepak (Friend)", type:"guest", date:daysAhead(1,18,0), window:"18:00 – 21:00", code:"531972", used:false, createdBy:priya.id, createdAt:daysAgo(0,10,0)}
  ];

  // ---- Facilities & Bookings ----
  const facilities=[
    {id:"f1", nameKey:"communityHall", desc:"एसी हॉल, 100 लोगों की क्षमता, साउंड सिस्टम | AC hall, capacity 100, sound system",
      color:"linear-gradient(135deg,#1F3A5F,#3A5E8C)", charges:2000, deposit:1000, approveRequired:true, capacity:1,
      slots:[{s:"10:00",e:"13:00"},{s:"17:00",e:"21:00"}],
      rules:"शुल्क अग्रिम | Booking 48h पहले रद्द करने पर पूरा रिफंड | No loud music after 10 PM"},
    {id:"f2", nameKey:"gym", desc:"AC जिम, ट्रेडमिल + वेट्स | AC gym, treadmills + weights",
      color:"linear-gradient(135deg,#2E7D32,#4CAF50)", charges:0, deposit:0, approveRequired:false, capacity:20,
      slots:[{s:"06:00",e:"07:00"},{s:"07:00",e:"08:00"},{s:"08:00",e:"09:00"},{s:"09:00",e:"10:00"},{s:"17:00",e:"18:00"},{s:"18:00",e:"19:00"},{s:"19:00",e:"20:00"},{s:"20:00",e:"21:00"},{s:"21:00",e:"22:00"}],
      rules:"हर निवासी प्रति दिन 1 स्लॉट | Towel अनिवार्य | 16+ के लिए"},
    {id:"f3", nameKey:"badmintonCourt", desc:"इंडोर कोर्ट, रैकेट उपलब्ध | Indoor court, rackets available",
      color:"linear-gradient(135deg,#6A3FA0,#8E5FC0)", charges:100, deposit:0, approveRequired:false, capacity:1,
      slots:[{s:"06:00",e:"07:00"},{s:"07:00",e:"08:00"},{s:"08:00",e:"09:00"},{s:"17:00",e:"18:00"},{s:"18:00",e:"19:00"},{s:"19:00",e:"20:00"},{s:"20:00",e:"21:00"}],
      rules:"1 घंटे के स्लॉट | प्रति फ्लैट दिन में 1 स्लॉट"},
    {id:"f4", nameKey:"swimmingPool", desc:"हीटेड पूल, लाइफगार्ड उपलब्ध | Heated pool, lifeguard on duty",
      color:"linear-gradient(135deg,#1565C0,#42A5F5)", charges:0, deposit:0, approveRequired:false, capacity:30,
      slots:[{s:"07:00",e:"10:00"},{s:"16:00",e:"19:00"}],
      rules:"बच्चों के साथ guardian अनिवार्य | Swim cap आवश्यक"}
  ];
  const bookings=[
    {id:"bk1", facilityId:"f3", flatId:fB201.id, date:todayAt(19,0), slot:"19:00 – 20:00", status:"confirmed",
      amount:100, paymentId:facPay.id, createdBy:priya.id, createdAt:daysAgo(1,19,5)},
    {id:"bk2", facilityId:"f1", flatId:fA304.id, date:daysAhead(7,17,0), slot:"17:00 – 21:00", status:"pending_approval",
      amount:2000, paymentId:null, createdBy:rajesh.id, createdAt:daysAgo(0,11,30)},
    {id:"bk3", facilityId:"f2", flatId:fA101.id, date:todayAt(18,0), slot:"18:00 – 19:00", status:"confirmed",
      amount:0, paymentId:null, createdBy:admin.id, createdAt:daysAgo(0,7,45)}
  ];

  // ---- Expenses ----
  const expenses=[
    {id:"ex1", category:"security", amount:38000, vendor:"SecureGuard Agency", date:daysAgo(15,12,0), mode:"neft", note:"Guard agency charges — July", status:"active", receipt:false},
    {id:"ex2", category:"electricity", amount:18500, vendor:"UPPCL", date:daysAgo(12,0,0), mode:"neft", note:"Common area electricity bill", status:"active", receipt:true},
    {id:"ex3", category:"housekeeping", amount:14000, vendor:"CleanServe Solutions", date:daysAgo(10,0,0), mode:"cheque", note:"Housekeeping staff salary", status:"active", receipt:true},
    {id:"ex4", category:"amc", amount:4200, vendor:"Lift AMC Services", date:daysAgo(8,0,0), mode:"neft", note:"Lift AMC monthly", status:"active", receipt:true},
    {id:"ex5", category:"repairs", amount:3500, vendor:"Sharma Hardware", date:daysAgo(4,0,0), mode:"cash", note:"Garden lights repair material", status:"active", receipt:false},
    {id:"ex6", category:"other", amount:1200, vendor:"Municipal Corporation", date:daysAgo(2,0,0), mode:"cash", note:"Garbage disposal charges", status:"active", receipt:false},
    {id:"ex7", category:"security", amount:38000, vendor:"SecureGuard Agency", date:daysAgo(45,0,0), mode:"neft", note:"Guard agency charges — June", status:"active", receipt:true},
    {id:"ex8", category:"electricity", amount:17200, vendor:"UPPCL", date:daysAgo(42,0,0), mode:"neft", note:"Common area electricity", status:"active", receipt:true},
    {id:"ex9", category:"housekeeping", amount:14000, vendor:"CleanServe Solutions", date:daysAgo(40,0,0), mode:"cheque", note:"Housekeeping salary", status:"active", receipt:true},
    {id:"ex10", category:"events", amount:8500, vendor:"Event Décor Lucknow", date:daysAgo(35,0,0), mode:"neft", note:"Independence day decoration", status:"active", receipt:true},
    {id:"ex11", category:"repairs", amount:6200, vendor:"Plumber Ramu", date:daysAgo(33,0,0), mode:"cash", note:"Sewage line repair", status:"void", receipt:false},
    {id:"ex12", category:"amc", amount:4200, vendor:"Lift AMC Services", date:daysAgo(38,0,0), mode:"neft", note:"Lift AMC", status:"active", receipt:true}
  ];

  // ---- Documents ----
  const folders=[
    {id:"fd1", nameKey:"Bye-laws & Registration", docs:"d1,d2"},
    {id:"fd2", nameKey:"Meeting Minutes", docs:"d3,d4"},
    {id:"fd3", nameKey:"Financial Reports", docs:"d5"},
    {id:"fd4", nameKey:"Circulars", docs:"d6"},
    {id:"fd5", nameKey:"Forms & Formats", docs:"d7,d8"},
    {id:"fd6", nameKey:"Insurance", docs:"d9"},
    {id:"fd7", nameKey:"Miscellaneous", docs:"d10"}
  ];
  const documents=[
    {id:"d1", folder:"fd1", title:"सोसाइटी बाय-लॉज़ 2024 | Society Bye-laws 2024", date:daysAgo(400), access:"all", version:2, size:"1.2 MB", uploadedBy:"Col. A.K. Singh",
      body:"Green Valley Residency — Registered Bye-laws (2024 edition).\n\n[Docs demo: actual PDF hosted file storage me hota hai — yahan metadata dikhaya gaya hai.]"},
    {id:"d2", folder:"fd1", title:"रजिस्ट्रेशन सर्टिफिकेट | Registration Certificate", date:daysAgo(800), access:"committee", version:1, size:"380 KB", uploadedBy:"Col. A.K. Singh",
      body:"Society registration certificate under UP Apartment Act, 2010."},
    {id:"d3", folder:"fd2", title:"AGM Minutes — June 2026", date:daysAgo(45), access:"all", version:1, size:"240 KB", uploadedBy:"Col. A.K. Singh",
      body:"Minutes of the Annual General Meeting held on 7 June 2026 at Community Hall.\nKey points: FY 2025-26 accounts approved; budget for FY 2026-27 passed; festival committee formed."},
    {id:"d4", folder:"fd2", title:"Committee Meeting — July 2026", date:daysAgo(30), access:"all", version:1, size:"180 KB", uploadedBy:"Col. A.K. Singh",
      body:"Monthly committee meeting minutes: CCTV camera procurement approved; car wash vendor finalized."},
    {id:"d5", folder:"fd3", title:"FY 2025-26 ऑडिट रिपोर्ट | Audit Report", date:daysAgo(50), access:"committee", version:1, size:"2.1 MB", uploadedBy:"Sanjay Kapoor",
      body:"Audited statement of accounts for FY 2025-26 by M/s Gupta & Associates, Chartered Accountants.\n(Committee-only access — DPDP policy)"},
    {id:"d6", folder:"fd4", title:"दिवाली सर्कुलर | Diwali Circular", date:daysAgo(280), access:"all", version:1, size:"150 KB", uploadedBy:"Col. A.K. Singh",
      body:"Diwali celebration guidelines and common area decoration timings."},
    {id:"d7", folder:"fd5", title:"NOC फॉर्मेट | NOC Application Format", date:daysAgo(500), access:"all", version:1, size:"95 KB", uploadedBy:"Col. A.K. Singh",
      body:"Format for No Objection Certificate application (sale/transfer of flat)."},
    {id:"d8", folder:"fd5", title:"इंटीरियर वर्क परमिशन | Interior Work Permission", date:daysAgo(500), access:"all", version:2, size:"110 KB", uploadedBy:"Col. A.K. Singh",
      body:"Permission form for interior renovation work along with timings and deposit rules."},
    {id:"d9", folder:"fd6", title:"सोसाइटी इंश्योरेंस पॉलिसी | Society Insurance Policy", date:daysAgo(120), access:"committee", version:1, size:"900 KB", uploadedBy:"Sanjay Kapoor",
      body:"Fire & liability insurance policy covering common areas — valid till March 2027."},
    {id:"d10", folder:"fd7", title:"स्वतंत्रता दिवस फोटो एल्बम | Independence Day Album", date:daysAgo(1), access:"all", version:1, size:"24 MB", uploadedBy:"Rekha Chauhan",
      body:"Photo album of the Independence Day celebration — flag hoisting and cultural performances."}
  ];

  // ---- Polls ----
  const polls=[
    {id:"pl1", question:"जन्माष्टमी समारोह के लिए ₹15,000 का बजट स्वीकृत करें? | Approve ₹15,000 budget for Janmashtami celebration?",
     options:["हाँ, स्वीकृत | Yes", "नहीं | No", "बजट बढ़ाएँ ₹20,000 | Increase"], mode:"flat", anonymous:true,
     deadline:daysAhead(3,20,0), createdAt:daysAgo(1,10,0), audience:"all", status:"active",
     votes:[{flatId:"fl1",opt:0},{flatId:"fl2",opt:0},{flatId:"fl3",opt:0},{flatId:"fl4",opt:1},{flatId:"fl5",opt:0},{flatId:"fl6",opt:2},{flatId:"fl7",opt:0},{flatId:"fl8",opt:0},{flatId:"fl9",opt:0}]},
    {id:"pl2", question:"जिम का समय सुबह 5 बजे से खोलें? | Open gym from 5 AM?",
     options:["हाँ | Yes","नहीं | No"], mode:"flat", anonymous:true,
     deadline:daysAgo(3,20,0), createdAt:daysAgo(10,10,0), audience:"all", status:"closed",
     votes:[{flatId:"fl1",opt:0},{flatId:"fl2",opt:0},{flatId:"fl3",opt:0},{flatId:"fl4",opt:0},{flatId:"fl5",opt:1},{flatId:"fl6",opt:0},{flatId:"fl7",opt:1},{flatId:"fl8",opt:0},{flatId:"fl9",opt:0},{flatId:"fl10",opt:0},{flatId:"fl11",opt:0},{flatId:"fl12",opt:0},{flatId:"fl13",opt:1}]}
  ];

  // ---- Audit log ----
  const auditLog=[
    {id:"a1", at:daysAgo(0,9,0), actor:"Col. A.K. Singh", action:"notice.publish", detail:"Emergency notice published (water shutdown)"},
    {id:"a2", at:daysAgo(0,8,30), actor:"Ramesh Kumar", action:"visitor.entry", detail:"Walk-in entry logged — A-304 (Amit Kumar, Electrician)"},
    {id:"a3", at:daysAgo(0,8,0), actor:"Rajesh Verma", action:"visitor.preapprove", detail:"Pre-approval created — Sharma Ji (code 246813)"},
    {id:"a4", at:daysAgo(0,7,45), actor:"Col. A.K. Singh", action:"booking.create", detail:"Gym slot booked (18:00–19:00)"},
    {id:"a5", at:daysAgo(1,9,0), actor:"Sunita Devi", action:"complaint.progress", detail:"CMP lift complaint — technician informed"},
    {id:"a6", at:daysAgo(1,8,10), actor:"Col. A.K. Singh", action:"complaint.assign", detail:"Lift complaint assigned to Lift AMC vendor"},
    {id:"a7", at:daysAgo(1,7,40), actor:"Rajesh Verma", action:"complaint.create", detail:"Lift B complaint filed"},
    {id:"a8", at:daysAgo(2,20,5), actor:"Col. A.K. Singh", action:"complaint.assign", detail:"Seepage complaint assigned to Mahesh Pal"},
    {id:"a9", at:daysAgo(4,12,0), actor:"Priya Sharma", action:"complaint.confirm", detail:"Park lights complaint confirmed — 5★"},
    {id:"a10", at:daysAgo(4,11,30), actor:"Mahesh Pal", action:"complaint.resolve", detail:"Park lights resolved with photo proof"},
    {id:"a11", at:daysAgo(12,11,0), actor:"Col. A.K. Singh", action:"bills.publish", detail:"August bills generated & published (27 flats)"},
    {id:"a12", at:daysAgo(15,10,30), actor:"Sanjay Kapoor", action:"expense.add", detail:"Expense recorded — SecureGuard Agency ₹38,000"}
  ];

  // ---- Notifications ----
  const notifications=[]; let notid=0;
  function notif(userId, icon, title, body, at, link){ notifications.push({id:"n"+(++notid), userId, icon, title, body, at, read:false, link:link||null}); }
  notif(rajesh.id,"bill","August का बिल आ गया है","₹"+(4350).toLocaleString('en-IN')+" — due date 10 Aug", daysAgo(15,9,0), "/bills");
  notif(rajesh.id,"alert","पानी की सप्लाई कल बंद रहेगी","Emergency notice — विवरण पढ़ें", daysAgo(0,9,0), "/notices");
  notif(rajesh.id,"gate","Amit Kumar गेट पर हैं","A-304 के लिए एंट्री अनुरोध — स्वीकृति दें", todayAt(10,12), "/gate");
  notif(rajesh.id,"poll","नई पोल: जन्माष्टमी बजट","अपनी राय दें", daysAgo(1,10,0), "/polls");
  notif(rajesh.id,"booking","बुकिंग स्वीकृति लंबित","Community Hall — अगले हफ्ते", daysAgo(0,11,30), "/bookings");
  notif(admin.id,"alert","नया सदस्य अनुरोध","Ankit Kumar (B-302) ने एक्सेस माँगा है", daysAgo(0,8,0), "/admin/approvals");
  notif(admin.id,"bill","10 फ्लैट का भुगतान बकाया","Defaulter बोर्ड देखें", daysAgo(0,8,0), "/admin/defaulters");
  notif(admin.id,"complaint","2 शिकायतें असाइन नहीं","आज ही assign करें", daysAgo(0,9,15), "/admin/helpdesk");
  notif(admin.id,"booking","नई बुकिंग स्वीकृति हेतु","Community Hall — Rajesh Verma", daysAgo(0,11,30), "/admin/facilities");
  notif(priya.id,"gate","आपकी बुकिंग आज है","Badminton Court 19:00–20:00", daysAgo(0,7,0), "/bookings");
  notif(priya.id,"alert","पानी की सप्लाई कल बंद रहेगी","Emergency notice — विवरण पढ़ें", daysAgo(0,9,0), "/notices");
  notif(ramesh.id,"gate","2 अपेक्षित विज़िटर आज","Pre-approval सूची देखें", daysAgo(0,8,0), "/guard");
  notif(sunita.id,"complaint","2 शिकायतें आपको सौंपी गईं","आज पूरी करें", daysAgo(1,9,0), "/staff");
  notif(vikram.id,"bill","August का बिल आ गया है","₹"+(3450).toLocaleString('en-IN')+" — due date 10 Aug", daysAgo(15,9,0), "/bills");
  notif(ritu.id,"notice","नई सूचना प्रकाशित हुई","AGM — 6 सितंबर", daysAgo(3,12,0), "/notices");

  return { settings, chargeHeads, towerDefs, flats, users, residencies, staffMembers, committee,
    bills, payments, complaints, notices, visitors, preApprovals, facilities, bookings, expenses,
    folders, documents, polls, auditLog, notifications,
    meta:{ month, prev, seededAt:nowIso() } };
})();
