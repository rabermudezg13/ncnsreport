import { format } from "date-fns";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge,Button,Card,Empty,Input,PageHeader } from "@/components/ui";
import { useData } from "@/hooks/useData";
import { offenderLevel } from "@/lib/utils";
import { listSubstitutes } from "@/services/data";

export function SubstitutesPage(){
  const{data,loading,error}=useData(()=>listSubstitutes(),[]);
  const[q,setQ]=useState("");
  const[searchParams,setSearchParams]=useSearchParams();
  const repeatOnly=searchParams.get("repeat")==="true";
  if(loading)return <p>Loading substitutes…</p>;
  if(error||!data)return <Empty title="Directory unavailable" body={error}/>;
  const rows=data.filter(s=>(!repeatOnly||s.totalIncidents>=2)&&(!q||[s.firstName,s.lastName,s.bhNumber,s.ksnNumber,s.email,s.phone].join(" ").toLowerCase().includes(q.toLowerCase())));
  function toggleRepeat(){const next=new URLSearchParams(searchParams);if(repeatOnly)next.delete("repeat");else next.set("repeat","true");setSearchParams(next)}
  return <><PageHeader title={repeatOnly?"Repeat Offenders":"Substitute Directory"} description={repeatOnly?"Substitutes with two or more reported incidents.":"Find substitute profiles and review incident frequency."}/><Card><div className="flex flex-wrap gap-3 border-b p-4"><Input className="max-w-xl" placeholder="Search name, BH, KSN, email or phone…" value={q} onChange={e=>setQ(e.target.value)}/><Button type="button" className={repeatOnly?"bg-slate-700 hover:bg-slate-800":""} onClick={toggleRepeat}>{repeatOnly?"Show all substitutes":"Show repeat offenders"}</Button></div><div className="overflow-x-auto"><table><thead><tr><th>Substitute</th><th>BH Number</th><th>KSN Number</th><th>Email</th><th>Phone</th><th>Total</th><th>Last Incident</th><th>Status</th></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td className="font-semibold">{s.firstName} {s.lastName}</td><td>{s.bhNumber||"—"}</td><td>{s.ksnNumber||"—"}</td><td>{s.email||"—"}</td><td>{s.phone||"—"}</td><td>{s.totalIncidents}</td><td>{s.lastIncidentAt?format(s.lastIncidentAt.toDate(),"MMM d, yyyy"):"—"}</td><td><Badge className={s.totalIncidents>=2?"bg-red-50 text-red-700":""}>{offenderLevel(s.totalIncidents)}</Badge></td></tr>)}</tbody></table>{!rows.length?<p className="p-12 text-center text-sm text-muted">No substitute profiles found.</p>:null}</div></Card></>;
}
