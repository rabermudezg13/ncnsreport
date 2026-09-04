import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Empty, Input, PageHeader, Select } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { useData } from "@/hooks/useData";
import { listIncidents } from "@/services/data";
import { canEditIncidents, incidentLabels } from "@/types";

export function IncidentsPage(){
  const {profile}=useAuth();
  const {data,loading,error}=useData(()=>listIncidents(),[]);
  const [q,setQ]=useState("");
  const [type,setType]=useState("");
  const [district,setDistrict]=useState("");
  const [state,setState]=useState("");
  if(loading)return <p>Loading incidents…</p>;
  if(error||!data)return <Empty title="Incidents unavailable" body={error}/>;
  const districts=Array.from(new Set(data.map(i=>i.district).filter((value):value is string=>Boolean(value)))).sort();
  const states=Array.from(new Set(data.map(i=>i.state).filter((value):value is string=>Boolean(value)))).sort();
  const rows=data.filter(i=>(!q||`${i.substituteName} ${i.schoolName} ${i.bhNumber} ${i.ksnNumber} ${i.district} ${i.state}`.toLowerCase().includes(q.toLowerCase()))&&(!type||i.incidentType===type)&&(!district||i.district===district)&&(!state||i.state===state));
  const editable=profile?canEditIncidents(profile.role):false;
  return <>
    <PageHeader title="Incident History" description="Search, filter, review, and update follow-up information."/>
    <Card>
      <div className="grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-[1fr_220px_220px_220px]"><Input placeholder="Search substitute, school, State or District…" value={q} onChange={e=>setQ(e.target.value)}/><Select aria-label="Filter by incident type" value={type} onChange={e=>setType(e.target.value)}><option value="">All incident types</option><option value="no_call_no_show">No Call / No Show</option><option value="late_cancellation">Late Cancellation</option></Select><Select aria-label="Filter by state" value={state} onChange={e=>setState(e.target.value)}><option value="">All states</option>{states.map(value=><option key={value} value={value}>{value}</option>)}</Select><Select aria-label="Filter by district" value={district} onChange={e=>setDistrict(e.target.value)}><option value="">All districts</option>{districts.map(value=><option key={value} value={value}>{value}</option>)}</Select></div>
      <div className="overflow-x-auto"><table><thead><tr><th>Date</th><th>Substitute</th><th>BH / KSN</th><th>School</th><th>State</th><th>District</th><th>Time</th><th>Incident Type</th><th>Responded?</th><th>Created By</th>{editable?<th>Action</th>:null}</tr></thead><tbody>{rows.map(i=><tr key={i.id}><td>{format(i.incidentDate.toDate(),"MMM d, yyyy")}</td><td className="font-semibold">{i.substituteName}</td><td>{i.bhNumber||"—"} / {i.ksnNumber||"—"}</td><td>{i.schoolName}</td><td>{i.state||"—"}</td><td>{i.district||"—"}</td><td>{i.scheduledTime}</td><td><Badge className={i.incidentType==="no_call_no_show"?"bg-red-50 text-red-700":"bg-amber-50 text-amber-700"}>{incidentLabels[i.incidentType]}</Badge></td><td className="capitalize">{i.responseStatus}</td><td>{i.createdByName}</td>{editable?<td><Link to={`/incidents/${i.id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-blue-50"><Pencil size={14}/>Edit</Link></td>:null}</tr>)}</tbody></table>{!rows.length?<p className="p-12 text-center text-sm text-muted">No incidents match these filters.</p>:null}</div>
    </Card>
  </>;
}
