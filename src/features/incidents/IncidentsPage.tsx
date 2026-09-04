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
  if(loading)return <p>Loading incidents…</p>;
  if(error||!data)return <Empty title="Incidents unavailable" body={error}/>;
  const rows=data.filter(i=>(!q||`${i.substituteName} ${i.schoolName} ${i.bhNumber} ${i.ksnNumber}`.toLowerCase().includes(q.toLowerCase()))&&(!type||i.incidentType===type));
  const editable=profile?canEditIncidents(profile.role):false;
  return <>
    <PageHeader title="Incident History" description="Search, filter, review, and update follow-up information."/>
    <Card>
      <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_240px]"><Input placeholder="Search substitute, school, BH or KSN…" value={q} onChange={e=>setQ(e.target.value)}/><Select value={type} onChange={e=>setType(e.target.value)}><option value="">All incident types</option><option value="no_call_no_show">No Call / No Show</option><option value="late_cancellation">Late Cancellation</option></Select></div>
      <div className="overflow-x-auto"><table><thead><tr><th>Date</th><th>Substitute</th><th>BH / KSN</th><th>School</th><th>Time</th><th>Incident Type</th><th>Responded?</th><th>Created By</th>{editable?<th>Action</th>:null}</tr></thead><tbody>{rows.map(i=><tr key={i.id}><td>{format(i.incidentDate.toDate(),"MMM d, yyyy")}</td><td className="font-semibold">{i.substituteName}</td><td>{i.bhNumber||"—"} / {i.ksnNumber||"—"}</td><td>{i.schoolName}</td><td>{i.scheduledTime}</td><td><Badge className={i.incidentType==="no_call_no_show"?"bg-red-50 text-red-700":"bg-amber-50 text-amber-700"}>{incidentLabels[i.incidentType]}</Badge></td><td className="capitalize">{i.responseStatus}</td><td>{i.createdByName}</td>{editable?<td><Link to={`/incidents/${i.id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-blue-50"><Pencil size={14}/>Edit</Link></td>:null}</tr>)}</tbody></table>{!rows.length?<p className="p-12 text-center text-sm text-muted">No incidents match these filters.</p>:null}</div>
    </Card>
  </>;
}
