import React, { useMemo, useState } from "react";
import {
  CheckCircle2, CircleAlert, CircleDot, Clock, Download, FileText, GraduationCap, ListChecks, LogOut, Mail, Phone, Search, Send, Settings, User2,
  Plus, CalendarDays, BadgeCheck, Upload, Edit, X, Laptop, ShieldCheck, BookOpen, Award, Video, BarChart3, FileSpreadsheet
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

/*************************************
 * Springfield palette + logo helpers *
 *************************************/
// Removed LOGO_WORDMARK as per user request for alignment fix.

const brand = {
  primary: "#00205B",       // Springfield deep blue
  primaryDark: "#001B3F",
  accentRed: "#E30613",     // Springfield red accent
  surface: "#FFFFFF",
  panel: "#F5F7FA",         // Light background for panels/sections
  border: "#E5E7EB",        // Light grey border
  text: "#111827",          // Dark text
  muted: "#6B7280",         // Muted text
  success: "#10B981",       // Standard green for success
  danger: "#EF4444",        // Standard red for danger (distinct from accentRed)
  warning: "#F59E0B",       // Standard orange for warning
  // New derived colors for UI consistency
  primaryLight: "#E9F3FF",  // Lighter shade of primary for active tabs/hover states
};

const Card = ({ className = "", children, ...props }) => (
  <div className={`rounded-2xl bg-white border shadow-sm ${className}`} style={{ borderColor: brand.border }} {...props}>{children}</div>
);
const CardBody = ({ className = "", children }) => (<div className={`p-5 ${className}`}>{children}</div>);
const Button = ({ className = "", variant = "primary", children, ...props }) => {
  const base = "px-4 py-2 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2";
  const styles = {
    primary: { background: brand.primary, color: "#fff" },
    outline: { background: "#fff", color: brand.primary, border: `1px solid ${brand.border}` },
    subtle: { background: brand.panel, color: brand.text, border: `1px solid ${brand.border}` },
    danger:  { background: brand.danger, color: "#fff" }, // Keeping specific danger red, not accentRed
  };
  return (<button className={`${base} ${className}`} style={styles[variant]} {...props}>{children}</button>);
};
const Input = ({ className = "", ...props }) => (<input className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${className}`} style={{ borderColor: brand.border, background: brand.surface }} {...props}/>);
const Select = ({ className = "", children, ...props }) => (<select className={`w-full rounded-xl px-3 py-2 text-sm border bg-white focus:outline-none ${className}`} style={{ borderColor: brand.border, background: brand.surface }} {...props}>{children}</select>);
const Textarea = ({ className = "", ...props }) => (<textarea className={`w-full rounded-xl px-3 py-2 text-sm border bg-white focus:outline-none ${className}`} rows={4} style={{ borderColor: brand.border, background: brand.surface }} {...props} />);
const Badge = ({ tone = "default", children }) => {
  const map = { default: brand.panel, info: brand.primaryLight, success: brand.success, danger: brand.danger, warn: brand.primaryLight }; // Changed warn to primaryLight, consistent with other badges' background
  const col = { default: brand.text, info: brand.primary, success: brand.success, danger: brand.danger, warn: brand.accentRed }[tone]; // warn text is accentRed
  return <span className="px-2 py-1 text-xs rounded-full border" style={{ background: map[tone], color: col, borderColor: brand.border }}>{children}</span>;
};
const Field = ({ label, required, children, hint }) => (
  <label className="text-sm block"> {/* Added 'block' for better spacing */}
    <div className="mb-1 text-gray-600">{label} {required && <span className="text-red-500">*</span>}</div>
    {children}
    {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
  </label>
);

/*************************************
 * Demo data & helpers
 *************************************/
const people = [
  { id: 8, name: "Elena Petrova", role: "Sales Executive", email: "elena@example.com", phone: "+971 50 111 2223" }, // Changed name
  { id: 12, name: "Natalia Panaskina", role: "HR Manager", email: "natalia@example.com", phone: "+971 50 987 0000" },
  { id: 23, name: "Anne Lacad", role: "HR Officer", email: "anne@example.com", phone: "+971 55 444 1212" }
];

const catalog = [
  { id: "C-1", title: "Welcome Course", area:"General", level:"Beginner", hours:2, lessons:8 },
  { id: "C-2", title: "Key Systems & Registers (Dubai)", area:"Compliance", level:"Intermediate", hours:4, lessons:12 },
  { id: "C-3", title: "Dubai RE Law Essentials", area:"Compliance", level:"Intermediate", hours:3, lessons:10 },
  { id: "C-4", title: "Community Masterclass (Emaar/Damac/Sobha)", area:"Sales", level:"Advanced", hours:5, lessons:14 },
  { id: "C-5", title: "Lead Handling & Telephony (Bitrix24)", area:"Sales", level:"Beginner", hours:2, lessons:6 },
];

let reqCounter = 1401;
const makeId = () => `REQ-${reqCounter++}`;
const today = () => new Date().toLocaleDateString();

/*************************************
 * Approval routes
 *************************************/
const approvalPaths = { salary: ["Manager", "HR"], noc: ["Manager", "HR", "Director"], leave: ["Manager", "HR"], onboarding: ["HR", "IT", "Manager"] };
const nextStatus = (current, path) => {
  if (!current) return `${path[0]} Pending`;
  const idx = path.findIndex((p) => current.startsWith(p));
  if (idx === -1) return `${path[0]} Pending`;
  if (current.endsWith("Approved") && idx < path.length - 1) return `${path[idx + 1]} Pending`;
  if (current.endsWith("Pending")) return `${path[idx]} Approved`;
  return "Final Approved";
};

/*************************************
 * Navigation
 *************************************/
const NAV = [
  { key: "salary",    label: "Salary Certificate", icon: <FileText size={18} /> },
  { key: "noc",       label: "NOC Certificate",    icon: <FileText size={18} /> },
  { key: "requests",  label: "My Requests",        icon: <ListChecks size={18} /> },
  { key: "leave",     label: "Leave Application",  icon: <Clock size={18} /> },
  { key: "academy",   label: "Academy",            icon: <GraduationCap size={18} /> },
  { key: "onboarding",label: "Onboarding",         icon: <User2 size={18} /> },
  { key: "people",    label: "People Analytics",   icon: <BarChart3 size={18} /> },
  { key: "documents", label: "Docs Center",        icon: <FileSpreadsheet size={18} /> },
  { key: "approvals", label: "Approvals Center",   icon: <CircleDot size={18} /> },
  { key: "directory", label: "Directory",          icon: <Search size={18} /> },
  { key: "settings",  label: "Settings",           icon: <Settings size={18} /> },
];

export default function HRAppV3({ logoUrl }) { // Removed default LOGO_WORDMARK as it's no longer used
  const [active, setActive] = useState("academy");
  const [requests, setRequests] = useState([
    { id: makeId(), type: "NOC Certificate",    assignee: "Anne Lacad",    date: "05 Jul 2025", status: "Final Approved",    remarks: "Approved", downloadable: true },
    { id: makeId(), type: "Salary Certificate",  assignee: "Natalia Panaskina", date: "18 Jun 2025", status: "Manager Pending", remarks: "-",         downloadable: false },
  ]);
  const pendingForMe = useMemo(() => requests.filter(r => /Pending/.test(r.status)), [requests]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: brand.panel }}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-white" style={{ borderColor: brand.border }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo / Brand Name */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold" style={{ background: brand.primary, color: brand.surface }}>SP</div>
            <div>
              <div className="text-xs" style={{ color: brand.muted }}>Welcome back, Elena</div> {/* Updated welcome message */}
              <div className="text-base font-semibold" style={{ color: brand.text }}>Springfield HR App</div>
            </div>
          </div>
          <div className="flex-1"/>
          <Button variant="outline" className="hidden md:inline" onClick={() => alert("Exporting all data...")}>Export All</Button>
          <Button onClick={() => alert("Downloading PDF report...")}><Download size={16} className="inline mr-1"/>Download PDF</Button>
        </div>
      </div>

      {/* Shell */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <Card>
            <CardBody className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: brand.border }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: brand.primary }}>
                    <span className="text-white font-bold">SP</span>
                  </div>
                  <span className="font-semibold" style={{ color: brand.primary }}>Springfield</span>
                </div>
                {/* Removed "v3" badge */}
              </div>
              <nav className="flex flex-col">
                {NAV.map(item => (
                  <button key={item.key} onClick={() => setActive(item.key)}
                    className={`flex items-center gap-3 px-4 py-3 text-left border-b ${active===item.key? 'font-semibold':'hover:bg-[#F8FBFF]'}`}
                    style={{ borderColor: brand.border, backgroundColor: active===item.key? brand.primaryLight : brand.surface, color: active===item.key? brand.primary : brand.text }}>
                    <span style={{ color: active===item.key?brand.accentRed:brand.primary }}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.key==="approvals" && pendingForMe.length>0 && <Badge tone="warn">{pendingForMe.length}</Badge>}
                  </button>
                ))}
              </nav>
            </CardBody>
          </Card>
        </aside>

        {/* Content */}
        <section className="col-span-12 md:col-span-9">
          {active === "salary"    && <SalaryCertificate onSubmit={(payload)=> addRequest(setRequests, payload)} />}
          {active === "noc"       && <NOCCertificate  onSubmit={(payload)=> addRequest(setRequests, payload)} />}
          {active === "requests"  && <MyRequests requests={requests} setRequests={setRequests} />}
          {active === "leave"     && <LeaveApplication onSubmit={(payload)=> addRequest(setRequests, payload)} />}
          {active === "academy"   && <AcademyPro />}
          {active === "onboarding" && <OnboardingEnhanced requests={requests} setRequests={setRequests} />}
          {active === "people"    && <PeopleAnalytics />}
          {active === "documents" && <DocsCenter />}
          {active === "approvals" && <ApprovalsCenter requests={requests} setRequests={setRequests} />}
          {active === "directory" && <Directory />}
          {active === "settings"    && <SettingsPanel />}
        </section>
      </div>
    </div>
  );
}

/*************************************
 * Forms
 *************************************/
function SalaryCertificate({ onSubmit }){
  const [form, setForm] = useState({ salary: "", addressTo: "", responsible: "Natalia Panaskina", purpose: "" });
  const submit = () => {
    if(!form.salary || !form.addressTo || !form.responsible){ alert("Please fill required fields"); return; }
    onSubmit({ kind: "Salary Certificate", assignee: form.responsible, details: form });
  };
  return (
    <Card>
      <CardBody>
        <SimpleHeader title="Salary Certificate" /> {/* Replaced HeaderWithLogo */}
        <div className="grid gap-4">
          <Field label="Current Salary:" required><Input placeholder="Enter your current salary (salary + remuneration)" value={form.salary} onChange={(e)=>setForm({...form, salary:e.target.value})} /></Field>
          <Field label="Address To:" required><Input placeholder="Enter the recipient address" value={form.addressTo} onChange={(e)=>setForm({...form, addressTo:e.target.value})} /></Field>
          <Field label="Responsible Person:" required><Select value={form.responsible} onChange={(e)=>setForm({...form, responsible:e.target.value})}>{people.filter(p=>/HR/.test(p.role)).map(p => <option key={p.id}>{p.name}</option>)}</Select></Field>
          <Field label="Purpose:"><Textarea placeholder="Enter the purpose of the certificate" value={form.purpose} onChange={(e)=>setForm({...form, purpose:e.target.value})} /></Field>
          <div className="flex justify-end"><Button onClick={submit}><Send size={16} className="inline mr-1"/>Request Salary Certificate</Button></div>
        </div>
      </CardBody>
    </Card>
  );
}

function NOCCertificate({ onSubmit }){
  const [form, setForm] = useState({ salary: "", addressTo: "", country: "", reason: "", responsible: "Natalia Panaskina", purpose: "" });
  const submit = () => {
    if(!form.salary || !form.addressTo || !form.reason || !form.responsible){ alert("Please fill required fields"); return; }
    onSubmit({ kind: "NOC Certificate", assignee: form.responsible, details: form });
  };
  return (
    <Card>
      <CardBody>
        <SimpleHeader title="No Objection Certificate (NOC)" /> {/* Replaced HeaderWithLogo */}
        <div className="grid gap-4">
          <Field label="Current Salary:" required><Input placeholder="Enter your current salary" value={form.salary} onChange={(e)=>setForm({...form, salary:e.target.value})} /></Field>
          <Field label="Address To:" required><Input placeholder="Enter the recipient address" value={form.addressTo} onChange={(e)=>setForm({...form, addressTo:e.target.value})} /></Field>
          <Field label="Country:"><Input placeholder="Enter NOC relevant country" value={form.country} onChange={(e)=>setForm({...form, country:e.target.value})} /></Field>
          <Field label="NOC Reason:" required><Select value={form.reason} onChange={(e)=>setForm({...form, reason:e.target.value})}><option value="">Select Reason</option><option>Bank Account</option><option>Travel</option><option>Visa</option><option>Mortgage</option></Select></Field>
          <Field label="Responsible Person:" required><Select value={form.responsible} onChange={(e)=>setForm({...form, responsible:e.target.value})}>{people.filter(p=>/HR/.test(p.role)).map(p => <option key={p.id}>{p.name}</option>)}</Select></Field>
          <Field label="Purpose:"><Textarea placeholder="Enter the purpose of the certificate" value={form.purpose} onChange={(e)=>setForm({...form, purpose:e.target.value})} /></Field>
          <div className="flex justify-end"><Button onClick={submit}><Send size={16} className="inline mr-1"/>Request NOC Certificate</Button></div>
        </div>
      </CardBody>
    </Card>
  );
}

function MyRequests({ requests, setRequests }){
  const toggleApprove = (id) => {
    setRequests(prev => prev.map(r => {
      if(r.id !== id) return r;
      const kind = /NOC/.test(r.type) ? "noc" : /Salary/.test(r.type) ? "salary" : /Onboarding/.test(r.type)? 'onboarding' : "leave";
      const path = approvalPaths[kind];
      const next = nextStatus(r.status, path);
      if(next === "Final Approved") return { ...r, status: next, downloadable: true };
      return { ...r, status: next };
    }));
  };
  const download = (r) => {
    const text = `${r.type} (auto‑generated)\nID: ${r.id}\nAssigned To: ${r.assignee}\nStatus: ${r.status}\nDate: ${r.date}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${r.type.replace(/\s+/g,'_')}_${r.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Card>
      <CardBody>
        <SimpleHeader title="My Document Requests" /> {/* Replaced HeaderWithLogo */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Form</th>
                <th className="py-2 pr-4">Assigned To</th>
                <th className="py-2 pr-4">Request Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
                <th className="py-2 pr-4">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={r.id} className="border-t" style={{ borderColor: brand.border }}>
                  <td className="py-2 pr-4">{i + 1}</td>
                  <td className="py-2 pr-4">{r.type}</td>
                  <td className="py-2 pr-4">{r.assignee}</td>
                  <td className="py-2 pr-4">{r.date}</td>
                  <td className="py-2 pr-4">
                    {r.status.includes("Final Approved") ? (<Badge tone="success">Final Approved</Badge>) : r.status.includes("Approved") ? (<Badge tone="info">{r.status}</Badge>) : (<Badge tone="warn">{r.status}</Badge>)}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      {r.downloadable && (<Button variant="outline" onClick={() => download(r)}><Download size={14} className="inline mr-1"/>Download</Button>)}
                      {!r.status.includes("Final") && (<Button variant="subtle" onClick={() => toggleApprove(r.id)}><CheckCircle2 size={14} className="inline mr-1"/>Simulate Approve</Button>)}
                    </div>
                  </td>
                  <td className="py-2 pr-4">{r.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

function LeaveApplication({ onSubmit }){
  const [form, setForm] = useState({ type: "Annual", start: "", end: "", reason: "", approver: "Anne Lacad" });
  const balances = { Annual: 21, Sick: 10, Unpaid: 0 };
  const submit = () => {
    if(!form.start || !form.end){ alert("Please choose dates"); return; }
    onSubmit({ kind: "Leave Application", assignee: form.approver, details: form });
  };
  return (
    <Card>
      <CardBody>
        <SimpleHeader title="Leave Application" /> {/* Replaced HeaderWithLogo */}
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Leave Type:"><Select value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})}><option>Annual</option><option>Sick</option><option>Unpaid</option></Select><div className="text-xs text-gray-500 mt-1">Balance: {balances[form.type]} days</div></Field>
          <Field label="Approver:"><Select value={form.approver} onChange={(e)=>setForm({...form, approver:e.target.value})}>{people.filter(p=>/HR|Manager/.test(p.role)).map(p => <option key={p.id}>{p.name}</option>)}</Select></Field>
          <Field label="Start Date:"><Input type="date" value={form.start} onChange={(e)=>setForm({...form, start:e.target.value})} /></Field>
          <Field label="End Date:"><Input type="date" value={form.end} onChange={(e)=>setForm({...form, end:e.target.value})} /></Field>
          <div className="md:col-span-2"><Field label="Reason:"><Textarea placeholder="Why do you need leave?" value={form.reason} onChange={(e)=>setForm({...form, reason:e.target.value})} /></Field></div>
          <div className="md:col-span-2 flex justify-end"><Button onClick={submit}><Send size={16} className="inline mr-1"/>Submit Leave Request</Button></div>
        </div>
      </CardBody>
    </Card>
  );
}

/*************************************
 * Academy PRO
 *************************************/
function AcademyPro(){
  const [subTab, setSubTab] = useState('dashboard');
  const [q, setQ] = useState('');
  const filtered = catalog.filter(c => [c.title, c.area, c.level].join(' ').toLowerCase().includes(q.toLowerCase()));
  const perf = [ { m: "Apr", score: 70 }, { m: "May", score: 78 }, { m: "Jun", score: 85 }, { m: "Jul", score: 82 }, { m: "Aug", score: 88 } ];
  const mix = [ { name:'Sales', value: 45 }, { name:'Compliance', value: 35 }, { name:'General', value: 20 } ];
  const CHART_COLORS_ACADEMY = [brand.primary, brand.accentRed, brand.primaryDark]; // Academy specific chart colors
  return (
    <div className="space-y-6">
      <Card><CardBody>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <TitleWithAccent title="Academy" subtitle="Training & compliance hub for UAE real estate (RERA/Trakheesi, sales mastery, systems)." />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['dashboard','courses','videos','path','certs','reports'].map(k => (
              <button key={k} onClick={()=>setSubTab(k)} className={`px-3 py-2 rounded-xl text-sm border ${subTab===k? 'font-semibold':''}`} style={{ borderColor: brand.border, backgroundColor: subTab===k? brand.primaryLight : brand.surface, color: subTab===k? brand.primary : brand.text }}>{k[0].toUpperCase()+k.slice(1)}</button>
            ))}
          </div>
        </div>
      </CardBody></Card>

      {subTab==='dashboard' && (
        <Card><CardBody>
          <div className="grid md:grid-cols-3 gap-4">
            {[{k:'Learners',v:1200},{k:'Active Courses',v:42},{k:'Avg Quiz Score',v:'88%'}].map(x => (
              <div key={x.k} className="rounded-xl bg-white border p-4 text-center" style={{ borderColor: brand.border }}>
                <div className="text-sm text-gray-500">{x.k}</div>
                <div className="text-3xl font-semibold" style={{ color: brand.primary }}>{x.v}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="h-64">
              <div className="text-sm font-medium mb-2">Performance trend</div>
              <ResponsiveContainer>
                <LineChart data={perf}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m"/><YAxis/><Tooltip/><Legend/><Line type='monotone' dataKey='score' stroke={brand.primary} strokeWidth={3}/></LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64">
              <div className="text-sm font-medium mb-2">Training mix</div>
              <ResponsiveContainer>
                <PieChart>
                  <Pie outerRadius={90} data={mix} dataKey="value" nameKey="name" label>
                    {mix.map((_,i)=>(<Cell key={i} fill={CHART_COLORS_ACADEMY[i%CHART_COLORS_ACADEMY.length]}/>))}
                  </Pie>
                  <Tooltip/><Legend/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardBody></Card>
      )}

      {subTab==='courses' && (
        <Card><CardBody>
          <div className="flex items-center gap-2 mb-3">
            <Input placeholder="Search courses, area, level..." value={q} onChange={(e)=>setQ(e.target.value)} />
            <Select><option>All Areas</option><option>Sales</option><option>Compliance</option><option>General</option></Select>
            <Select><option>All Levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></Select>
            </div>
          <div className="grid md:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="rounded-xl border bg-white p-4 flex flex-col" style={{ borderColor: brand.border }}>
                <div className="h-28 rounded-lg bg-[url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center mb-3"/>
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-gray-500">{c.area} • {c.level} • {c.hours}h</div>
                <div className="text-xs text-gray-400 mt-1">Lessons: {c.lessons}</div>
                <div className="mt-auto pt-3 flex gap-2">
                  <Button variant="primary" onClick={() => alert(`Viewing course: ${c.title}`)}><BookOpen size={14} className="inline mr-1"/>View</Button>
                  <Button variant="outline" onClick={() => alert(`Assigning course: ${c.title}`)}><Plus size={14} className="inline mr-1"/>Assign</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}

      {subTab==='videos' && (
        <Card><CardBody>
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Video Lessons</div>
            <Button variant="outline" onClick={() => alert("Opening video upload dialog...")}><Upload size={14} className="inline mr-1"/>Upload</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-xl border p-4" style={{ borderColor: brand.border }}>
                <div className="h-32 rounded-lg bg-[url('https://images.unsplash.com/photo-1585712803112-35aa6b3f5d72?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center mb-3"/>
                <div className="font-medium">Lesson {i}: Mastering Leads</div>
                <div className="text-xs text-gray-500 mb-2">8:0{i} min • Sales</div>
                <Button variant="primary" onClick={() => alert(`Playing video lesson ${i}`)}><Video size={14} className="inline mr-1"/>Play</Button>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}

      {subTab==='path' && (
        <Card><CardBody>
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">My Learning Path</div>
            <Button variant="outline" onClick={() => alert("Creating new learning path...")}><Plus size={14} className="inline mr-1"/>New Path</Button>
          </div>
          <ul className="grid md:grid-cols-2 gap-3 text-sm">
            {catalog.slice(0,4).map(c => (
              <li key={c.id} className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: brand.border }}>
                <div><div className="font-medium">{c.title}</div><div className="text-xs text-gray-500">{c.area} • {c.level}</div></div>
                <div className="w-32 h-2 rounded-full bg-gray-200 overflow-hidden"><div className="h-full" style={{ width:`${50 + Math.floor(Math.random()*40)}%`, background: brand.primary }} /></div>
              </li>
            ))}
          </ul>
        </CardBody></Card>
      )}

      {subTab==='certs' && (
        <Card><CardBody>
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Certificates</div>
            <Button variant="outline" onClick={() => alert("Verifying certificates...")}><Award size={14} className="inline mr-1"/>Verify</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[{t:'RERA Awareness',d:'2025-06-02'},{t:'Health & Safety',d:'2025-07-11'},{t:'Trakheesi Basics',d:'2025-05-20'}].map((c,i)=>(
              <div key={i} className="p-4 border rounded-xl" style={{ borderColor: brand.border }}>
                <div className="font-medium">{c.t}</div>
                <div className="text-xs text-gray-500">Issued: {c.d}</div>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" onClick={() => alert(`Downloading PDF for ${c.t}`)}><Download size={14} className="inline mr-1"/>PDF</Button>
                  <Button variant="subtle" onClick={() => alert(`Sharing ${c.t} certificate...`)}>Share</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}

      {subTab==='reports' && (
        <Card><CardBody>
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Training Reports</div>
            <Button variant="outline" onClick={() => alert("Exporting training reports to CSV...")}><Download size={14} className="inline mr-1"/>Export CSV</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64"><div className="text-sm font-medium mb-2">Completion by Department</div><ResponsiveContainer><BarChart data={[{name:'Sales',v:78},{name:'Leasing',v:65},{name:'Admin',v:88},{name:'IT',v:92}]}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey='v' fill={brand.primary} radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
            <div className="h-64"><div className="text-sm font-medium mb-2">Mandatory compliance due in 30 days</div><ResponsiveContainer><LineChart data={[{d:'Week 1',due:12},{d:'Week 2',due:9},{d:'Week 3',due:7},{d:'Week 4',due:4}]}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="d"/><YAxis/><Tooltip/><Line type='monotone' dataKey='due' stroke={brand.accentRed} strokeWidth={3}/></LineChart></ResponsiveContainer></div> {/* Changed line color to accentRed */}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}

/*************************************
 * Onboarding (from v2)
 *************************************/
function OnboardingEnhanced({ requests, setRequests }){
  const [tab, setTab] = useState('joiners');
  const [modal, setModal] = useState(null);
  const [joiners, setJoiners] = useState([
    { id: 'EMP-221', name:'Hassan Ali', role:'Property Consultant', doj:'2025-09-01', buddy:'Omar',  manager:'Natalia Panaskina', status:'HR Pending', progress: 40, kit:{laptop:true, sim:false, accessCard:false}, docs:{passport:false, visa:false, contract:true} },
    { id: 'EMP-222', name:'Fatima Noor', role:'Leasing Agent',       doj:'2025-09-10', buddy:'Sara', manager:'Anne Lacad',        status:'IT Pending', progress: 55, kit:{laptop:false, sim:false, accessCard:false}, docs:{passport:true,  visa:false, contract:false} }
  ]);
   
   // function to add a joiner
const addJoiner = (j) => {
  setJoiners([j, ...joiners]);
  setRequests(prev => [
    {
      id: makeId(),
      type: `Onboarding – ${j.name}`,
      assignee: j.manager,
      date: today(),
      status: 'HR Pending',
      remarks: '-',
      downloadable: false
    },
    ...prev
  ]);
};

// function to update a joiner
const updateJoiner = (id, patch) =>
  setJoiners(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));


  // Placeholder for file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Simulating upload of file: ${file.name}`);
      // In a real app, you'd send this file to a server
    }
  };

  return (
    <div className="space-y-6">
      <Card><CardBody>
        <div className="flex items-center justify-between">
          <TitleWithAccent title="Onboarding Center" subtitle="Manage new joiners, equipment, documents, orientation and approvals." />
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=>setModal('add')}><Plus size={16} className="inline mr-1"/>Add Joiner</Button>
            <Button variant="outline" onClick={() => alert("Opening bulk import dialog...")}><Upload size={16} className="inline mr-1"/>Bulk Import (.csv)</Button>
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {['joiners','checklist','equipment','documents','orientation','policies'].map(k => (
            <button key={k} onClick={()=>setTab(k)} className={`px-3 py-2 rounded-xl text-sm border ${tab===k? 'font-semibold':''}`} style={{ borderColor: brand.border, backgroundColor: tab===k? brand.primaryLight : brand.surface, color: tab===k? brand.primary : brand.text }}>{k[0].toUpperCase()+k.slice(1)}</button>
          ))}
        </div>
      </CardBody></Card>

      {tab==='joiners' && (
        <Card><CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="py-2 pr-4">Employee</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">DOJ</th><th className="py-2 pr-4">Buddy</th><th className="py-2 pr-4">Manager</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Progress</th><th className="py-2 pr-4">Actions</th></tr></thead>
              <tbody>
                {joiners.map(j => (
                  <tr key={j.id} className="border-t" style={{ borderColor: brand.border }}>
                    <td className="py-2 pr-4"><div className="font-medium">{j.name}</div><div className="text-xs text-gray-400">{j.id}</div></td>
                    <td className="py-2 pr-4">{j.role}</td>
                    <td className="py-2 pr-4">{j.doj}</td>
                    <td className="py-2 pr-4">{j.buddy}</td>
                    <td className="py-2 pr-4">{j.manager}</td>
                    <td className="py-2 pr-4">{j.status.includes('Final')? <Badge tone='success'>{j.status}</Badge> : <Badge tone='warn'>{j.status}</Badge>}</td>
                    <td className="py-2 pr-4"><div className="w-40 h-2 rounded-full bg-gray-200 overflow-hidden"><div className="h-full" style={{ width:`${j.progress}%`, background: brand.primary }} /></div></td>
                    <td className="py-2 pr-4"><div className="flex gap-2"><Button variant='subtle' onClick={()=>updateJoiner(j.id, { progress: Math.min(100, j.progress+10), status: nextStatus(j.status, approvalPaths.onboarding) })}><BadgeCheck size={14} className='inline mr-1'/>Step</Button><Button variant='outline' onClick={()=>setModal({ type:'edit', data:j })}><Edit size={14} className='inline mr-1'/>Edit</Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody></Card>
      )}

      {tab==='checklist' && (
        <Card><CardBody>
          <h3 className='font-semibold mb-3'>Standard Onboarding Checklist</h3>
          <ul className='grid md:grid-cols-2 gap-3 text-sm'>
            {[ {t:'Send offer & e‑sign package', owner:'HR'}, {t:'Create email & CRM accounts', owner:'IT'}, {t:'Equipment handover (laptop, SIM, card)', owner:'Admin'}, {t:'Day‑1 orientation (agenda attached)', owner:'HR'}, {t:'Compliance briefing (RERA, H&S, Trakheesi)', owner:'HR'}, {t:'Buddy assignment & 30‑60‑90 plan', owner:'Manager'}, ].map((x,i)=>(
              <li key={i} className='p-3 rounded-xl border flex items-center justify-between' style={{ borderColor: brand.border }}>
                <div><div className='font-medium'>{x.t}</div><div className='text-xs text-gray-500'>Owner: {x.owner}</div></div>
                <Button variant='subtle' onClick={() => alert(`Scheduling task: ${x.t}`)}><CalendarDays size={14} className='inline mr-1'/>Schedule</Button>
              </li>
            ))}
          </ul>
        </CardBody></Card>
      )}

      {tab==='equipment' && (
        <Card><CardBody>
          <h3 className='font-semibold mb-3'>Equipment & Access</h3>
          <div className='grid md:grid-cols-3 gap-3'>
            {joiners.map(j => (
              <div key={j.id} className='p-3 rounded-xl border' style={{ borderColor: brand.border }}>
                <div className='font-medium mb-1'>{j.name}</div>
                <div className='text-xs text-gray-500 mb-2'>{j.id}</div>
                <div className='space-y-2 text-sm'>
                  <label className='flex items-center gap-2'><input type='checkbox' defaultChecked={j.kit.laptop}/> <Laptop size={14}/> Laptop</label>
                  <label className='flex items-center gap-2'><input type='checkbox' defaultChecked={j.kit.sim}/> SIM / WhatsApp</label>
                  <label className='flex items-center gap-2'><input type='checkbox' defaultChecked={j.kit.accessCard}/> Access Card</label>
                </div>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}

      {tab==='documents' && (
        <Card><CardBody>
          <h3 className='font-semibold mb-3'>Documents & Compliance</h3>
          <div className='grid md:grid-cols-2 gap-3'>
            {joiners.map(j => (
              <div key={j.id} className='p-3 rounded-xl border' style={{ borderColor: brand.border }}>
                <div className='font-medium mb-1'>{j.name}</div>
                <div className='text-xs text-gray-500 mb-2'>{j.id}</div>
                <div className='flex items-center gap-2 text-sm'><ShieldCheck size={14}/> RERA / Trakheesi briefing</div>
                <div className='grid grid-cols-3 gap-2 mt-2 text-sm'>
                  <label className='flex items-center gap-2'><input type='checkbox' defaultChecked={j.docs.passport}/> Passport</label>
                  <label className='flex items-center gap-2'><input type='checkbox' defaultChecked={j.docs.visa}/> Visa</label>
                  <label className='flex items-center gap-2'><input type='checkbox' defaultChecked={j.docs.contract}/> Contract</label>
                </div>
                <div className='mt-3'><Button variant='outline' onClick={() => alert(`Opening file upload for ${j.name}'s documents...`)}><Upload size={14} className='inline mr-1'/> Upload file</Button></div>
              </div>
            ))}
          </div>
          {/* New section for company-wide document uploads */}
          <div className="mt-6 border-t pt-4" style={{ borderColor: brand.border }}>
            <h3 className='font-semibold mb-3'>Upload Company Documents (Rules, PPTs, etc.)</h3>
            <Field label="Select document to upload:">
              <Input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={handleFileUpload} />
              <div className='mt-2'><Button variant='outline' onClick={() => alert("Simulating upload of selected company document...")}><Upload size={14} className='inline mr-1'/>Upload Document</Button></div>
            </Field>
          </div>
        </CardBody></Card>
      )}

      {tab==='orientation' && (
        <Card><CardBody>
          <h3 className='font-semibold mb-3'>Orientation Planner</h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='p-3 rounded-xl border' style={{ borderColor: brand.border }}>
              <div className='text-sm text-gray-600 mb-2'>Create session</div>
              <div className='grid gap-2 text-sm'>
                <Input placeholder='Title (Welcome, CRM training, Health & Safety...)' />
                <div className='grid grid-cols-2 gap-2'>
                  <Input type='date'/> <Input type='time'/>
                </div>
                <Select><option>HR</option><option>IT</option><option>Manager</option></Select>
                <Button variant='primary' onClick={() => alert("Adding session to calendar...")}><CalendarDays size={14} className='inline mr-1'/>Add to Calendar</Button>
              </div>
            </div>
            <div className='p-3 rounded-xl border' style={{ borderColor: brand.border }}>
              <div className='text-sm text-gray-600 mb-2'>Upcoming sessions</div>
              <ul className='space-y-2 text-sm'>
                <li className='p-2 rounded-xl border' style={{ borderColor: brand.border }}>Welcome & Company Intro — 02 Sep, 09:30 (HR)</li>
                <li className='p-2 rounded-xl border' style={{ borderColor: brand.border }}>CRM/Bitrix24 Basics — 02 Sep, 13:00 (IT)</li>
                <li className='p-2 rounded-xl border' style={{ borderColor: brand.border }}>RERA & Trakheesi — 03 Sep, 10:00 (HR)</li>
              </ul>
            </div>
          </div>
        </CardBody></Card>
      )}

      {tab==='policies' && (
        <Card><CardBody>
          <h3 className='font-semibold mb-3'>Policies & Acknowledgements</h3>
          <div className='space-y-2 text-sm'>
            <label className='flex items-center gap-2'><input type='checkbox'/> Code of Conduct</label>
            <label className='flex items-center gap-2'><input type='checkbox'/> Health & Safety</label>
            <label className='flex items-center gap-2'><input type='checkbox'/> Data Privacy</label>
            <Button className='mt-2' onClick={() => alert("Recording acknowledgement for selected policies...")}><BadgeCheck size={14} className='inline mr-1'/> Record Acknowledgement</Button>
          </div>
        </CardBody></Card>
      )}

      {modal && (
        <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center'>
          <div className='w-[680px] max-w-[95vw] rounded-2xl bg-white border shadow-xl' style={{ borderColor: brand.border }}>
            <div className='p-4 border-b flex items-center justify-between' style={{ borderColor: brand.border }}>
              <div className='font-semibold'>{modal==='add'? 'Add New Joiner' : 'Edit Joiner'}</div>
              <button onClick={()=>setModal(null)} className='p-2 rounded-lg border' style={{ borderColor: brand.border }}><X size={16}/></button>
            </div>
            <div className='p-4 grid md:grid-cols-2 gap-3 text-sm'>
              <Input placeholder='Employee ID (e.g., EMP-301)'/>
              <Input placeholder='Full Name'/>
              <Input placeholder='Role / Title'/>
              <Input type='date'/>
              <Input placeholder='Buddy (optional)'/>
              <Select defaultValue={'Natalia Panaskina'}>
                <option>Natalia Panaskina</option><option>Anne Lacad</option><option>Omar Nasser</option>
              </Select>
            </div>
            <div className='p-4 flex items-center justify-end gap-2 border-t' style={{ borderColor: brand.border }}>
              <Button variant='outline' onClick={()=>setModal(null)}>Cancel</Button>
              <Button onClick={()=>{ setModal(null); alert('Saved. (Wire to Bitrix24: crm.contact.add + tasks.task.add)'); }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*************************************
 * People Analytics
 *************************************/
function PeopleAnalytics(){
  const headcount = [ {m:'Apr', v:165},{m:'May',v:172},{m:'Jun',v:178},{m:'Jul',v:182},{m:'Aug',v:186} ];
  const turnover  = [ {m:'Apr', v:3},{m:'May',v:2},{m:'Jun',v:4},{m:'Jul',v:2},{m:'Aug',v:1} ];
  const hiring    = [ {name:'Sales',v:12},{name:'Leasing',v:7},{name:'Admin',v:3},{name:'IT',v:2} ];
  return (
    <div className="space-y-6">
      <Card><CardBody>
        <TitleWithAccent title="People Analytics" subtitle="Headcount, turnover, hiring and attendance – tailored for UAE brokerages." />
      </CardBody></Card>
      <Card><CardBody>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-56"><div className="text-sm font-medium mb-2">Headcount</div><ResponsiveContainer><LineChart data={headcount}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m"/><YAxis/><Tooltip/><Line type='monotone' dataKey='v' stroke={brand.primary} strokeWidth={3}/></LineChart></ResponsiveContainer></div>
          <div className="h-56"><div className="text-sm font-medium mb-2">Turnover</div><ResponsiveContainer><BarChart data={turnover}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m"/><YAxis/><Tooltip/><Bar dataKey='v' fill={brand.accentRed} radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
          <div className="h-56"><div className="text-sm font-medium mb-2">Hiring by Department</div><ResponsiveContainer><BarChart data={hiring}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey='v' fill={brand.primary} radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
        </div>
      </CardBody></Card>
    </div>
  );
}

/*************************************
 * Docs Center
 *************************************/
function DocsCenter(){
  const [tab, setTab] = useState('policies');
  return (
    <div className='space-y-6'>
      <Card><CardBody>
        <div className='flex items-center justify-between'>
          <TitleWithAccent title='Documents Center' subtitle='Central repository for policies, templates, certificates & letters.' />
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => alert("Opening document upload dialog...")}><Upload size={14} className='inline mr-1'/>Upload</Button>
            <Button variant='outline' onClick={() => alert("Opening document search...")}><Search size={14} className='inline mr-1'/>Search</Button>
          </div>
        </div>
        <div className='mt-4 flex gap-2 overflow-x-auto'>
          {['policies','templates','certs'].map(k => (
            <button key={k} onClick={()=>setTab(k)} className={`px-3 py-2 rounded-xl text-sm border ${tab===k? 'font-semibold':''}`} style={{ borderColor: brand.border, backgroundColor: tab===k? brand.primaryLight : brand.surface, color: tab===k? brand.primary : brand.text }}>{k[0].toUpperCase()+k.slice(1)}</button>
          ))}
        </div>
      </CardBody></Card>

      <Card><CardBody>
        {tab==='policies' && (
          <ul className='grid md:grid-cols-3 gap-3 text-sm'>
            {["Code of Conduct","H&S","Leave","Expense","Remote Work","Data Privacy"].map((t,i)=>(
              <li key={i} className='p-3 rounded-xl border flex items-center justify-between' style={{ borderColor: brand.border }}>
                <div className='font-medium'>{t} Policy</div>
                <div className='flex gap-2'>
                  <Button variant='outline' onClick={() => alert(`Viewing ${t} Policy`)}>View</Button>
                  <Button variant='subtle' onClick={() => alert(`Acknowledging ${t} Policy`)}>Ack</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {tab==='templates' && (
          <ul className='grid md:grid-cols-3 gap-3 text-sm'>
            {["Salary Certificate","NOC","Warning Letter","Offer Letter","Probation Result"].map((t,i)=>(
              <li key={i} className='p-3 rounded-xl border flex items-center justify-between' style={{ borderColor: brand.border }}>
                <div className='font-medium'>{t}</div>
                <div className='flex gap-2'>
                  <Button variant='outline' onClick={() => alert(`Downloading ${t} template`)}>Download</Button>
                  <Button variant='subtle' onClick={() => alert(`Editing ${t} template`)}>Edit</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {tab==='certs' && (
          <ul className='grid md:grid-cols-3 gap-3 text-sm'>
            {["RERA Awareness","H&S","Trakheesi"].map((t,i)=>(
              <li key={i} className='p-3 rounded-xl border flex items-center justify-between' style={{ borderColor: brand.border }}>
                <div className='font-medium'>{t} Certificate</div>
                <div className='flex gap-2'>
                  <Button variant='outline' onClick={() => alert(`Downloading PDF for ${t} Certificate`)}><Download size={14} className='inline mr-1'/>PDF</Button>
                  <Button variant='subtle' onClick={() => alert(`Sharing ${t} Certificate...`)}>Share</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody></Card>
    </div>
  );
}

/*************************************
 * Approvals / Directory / Settings
 *************************************/
function ApprovalsCenter({ requests, setRequests }){
  const pending = requests.filter(r => /Pending/.test(r.status));
  const act = (id, action) => {
    setRequests(prev => prev.map(r => {
      if(r.id !== id) return r;
      const kind = /NOC/.test(r.type) ? "noc" : /Salary/.test(r.type) ? "salary" : /Onboarding/.test(r.type) ? 'onboarding' : "leave";
      const path = approvalPaths[kind];
      if(action === "approve"){
        const next = nextStatus(r.status, path);
        if(next === "Final Approved") return { ...r, status: next, downloadable: true };
        return { ...r, status: next };
      }
      return { ...r, status: "Rejected" };
    }));
  };
  return (
    <Card>
      <CardBody>
        <SimpleHeader title="Approvals Center" /> {/* Replaced HeaderWithLogo */}
        {pending.length === 0 ? (
          <div className="text-sm text-gray-500">No items awaiting your approval.</div>
        ) : (
          <ul className="space-y-3">
            {pending.map(p => (
              <li key={p.id} className="p-3 rounded-xl border" style={{ borderColor: brand.border }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.type}</div>
                    <div className="text-xs text-gray-500">ID: {p.id} • Assigned to: {p.assignee} • {p.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="warn">{p.status}</Badge>
                    <Button variant="subtle" onClick={()=>act(p.id, 'approve')}><CheckCircle2 size={14} className="inline mr-1"/>Approve</Button>
                    <Button variant="danger" onClick={()=>act(p.id, 'reject')}><CircleAlert size={14} className="inline mr-1"/>Reject</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function Directory(){
  const [q, setQ] = useState("");
  const rows = people.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.role.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card>
      <CardBody>
        <SimpleHeader title="Directory" /> {/* Replaced HeaderWithLogo */}
        <div className="flex items-center gap-2 mb-3">
          <Input placeholder="Search name or role..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button variant="outline" onClick={() => alert("Opening advanced search options...")}>Advanced</Button>
        </div>
        <ul className="grid md:grid-cols-2 gap-3">
          {rows.map(p => (
            <li key={p.id} className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: brand.border }}>
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">{p.role}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Mail size={14}/>{p.email}</span>
                  <span className="flex items-center gap-1"><Phone size={14}/>{p.phone}</span>
                </div>
              </div>
              <Button onClick={() => alert(`Sending message to ${p.name}...`)}>Message</Button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

function SettingsPanel(){
  return (
    <Card>
      <CardBody>
        <SimpleHeader title="Settings" /> {/* Replaced HeaderWithLogo */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-1">Notifications</div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Email updates</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Slack alerts</label>
              <label className="flex items-center gap-2"><input type="checkbox"/> WhatsApp summaries</label>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Integrations</div>
            <ul className="text-sm list-disc pl-5">
              <li>Bitrix24 CRM (mock connected)</li>
              <li>DocuSign / e‑sign</li>
              <li>Google Calendar</li>
            </ul>
          </div>
        </div>
        <div className="mt-4"><Button variant="danger" onClick={() => alert("Disconnecting from integrations...")}><LogOut size={16} className="inline mr-1"/>Disconnect</Button></div>
      </CardBody>
    </Card>
  );
}

/*************************************
 * Shared bits
 *************************************/
function addRequest(setRequests, payload){
  const path = approvalPaths[payload.kind === "NOC Certificate" ? "noc" : payload.kind === "Salary Certificate" ? "salary" : payload.kind === 'Onboarding' ? 'onboarding' : "leave"];
  const first = `${path[0]} Pending`;
  const row = { id: makeId(), type: payload.kind, assignee: payload.assignee, date: today(), status: first, remarks: "-", downloadable: false };
  setRequests(prev => [row, ...prev]);
  alert(`${payload.kind} submitted for approval.`);
}

// Replaced HeaderWithLogo with a simpler component for consistent branding
function SimpleHeader({ title }){
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: brand.primary }}>
        <span className="text-white font-bold">SP</span>
      </div>
      <h2 className="text-xl font-semibold" style={{ color: brand.primary }}>{title}</h2>
      <span className="ml-auto text-xs px-2 py-1 rounded" style={{ background: brand.accentRed, color: '#fff' }}>Springfield</span>
    </div>
  );
}

function TitleWithAccent({ title, subtitle }){
  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold" style={{ color: brand.primary }}>{title}</h2>
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: brand.accentRed }} />
      </div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  );
}

