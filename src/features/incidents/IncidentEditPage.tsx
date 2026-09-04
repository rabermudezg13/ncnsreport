import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button, Card, Empty, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { useData } from "@/hooks/useData";
import { getIncident, updateIncidentFollowUp } from "@/services/data";
import type { ResponseStatus } from "@/types";

export function IncidentEditPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: incident, loading, error } = useData(() => getIncident(id), [id]);
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>("pending");
  const [responseDateTime, setResponseDateTime] = useState("");
  const [responseMethod, setResponseMethod] = useState<""|"phone"|"text"|"email"|"other">("");
  const [reasonProvided, setReasonProvided] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!incident) return;
    setResponseStatus(incident.responseStatus);
    setResponseDateTime(incident.responseDateTime ? format(incident.responseDateTime.toDate(), "yyyy-MM-dd'T'HH:mm") : "");
    setResponseMethod(incident.responseMethod ?? "");
    setReasonProvided(incident.reasonProvided ?? "");
    setFollowUpNotes(incident.followUpNotes ?? "");
    setNotes(incident.notes ?? "");
  }, [incident]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateIncidentFollowUp(id, { responseStatus, responseDateTime: responseStatus === "yes" ? responseDateTime : undefined, responseMethod: responseStatus === "yes" ? responseMethod || undefined : undefined, reasonProvided, followUpNotes, notes }, user.uid);
      toast.success("Follow-up updated successfully");
      navigate("/incidents");
    } catch { toast.error("Unable to update this incident"); }
    finally { setSaving(false); }
  }

  if (loading) return <p>Loading incident…</p>;
  if (error || !incident) return <Empty title="Incident unavailable" body={error || "The incident was not found."}/>;
  return <>
    <PageHeader title="Edit Follow-up" description="Record contact attempts, responses, and notes for this incident."/>
    <Card className="mb-6 p-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs text-muted">Substitute</p><p className="font-semibold">{incident.substituteName}</p></div><div><p className="text-xs text-muted">School</p><p className="font-semibold">{incident.schoolName}</p></div><div><p className="text-xs text-muted">Incident date</p><p className="font-semibold">{format(incident.incidentDate.toDate(), "MMM d, yyyy")}</p></div><div><p className="text-xs text-muted">Time</p><p className="font-semibold">{incident.scheduledTime}</p></div></div></Card>
    <form onSubmit={save} className="grid gap-6"><Card className="p-5"><div className="grid gap-4 md:grid-cols-3"><Field label="Did the substitute respond?"><Select value={responseStatus} onChange={(event)=>setResponseStatus(event.target.value as ResponseStatus)}><option value="yes">Yes</option><option value="no">No</option><option value="pending">Pending</option></Select></Field>{responseStatus === "yes" ? <><Field label="Response Date/Time"><Input type="datetime-local" value={responseDateTime} onChange={(event)=>setResponseDateTime(event.target.value)}/></Field><Field label="Response Method"><Select value={responseMethod} onChange={(event)=>setResponseMethod(event.target.value as typeof responseMethod)}><option value="">Select</option><option value="phone">Phone</option><option value="text">Text</option><option value="email">Email</option><option value="other">Other</option></Select></Field></> : null}</div>{responseStatus === "yes" ? <div className="mt-4"><Field label="Reason Provided"><Textarea value={reasonProvided} onChange={(event)=>setReasonProvided(event.target.value)}/></Field></div> : null}<div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Follow-up Notes"><Textarea value={followUpNotes} onChange={(event)=>setFollowUpNotes(event.target.value)}/></Field><Field label="General Notes"><Textarea value={notes} onChange={(event)=>setNotes(event.target.value)}/></Field></div></Card><div className="flex justify-end gap-3"><Button type="button" className="bg-slate-600 hover:bg-slate-700" onClick={()=>navigate("/incidents")}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : "Save Follow-up"}</Button></div></form>
  </>;
}
