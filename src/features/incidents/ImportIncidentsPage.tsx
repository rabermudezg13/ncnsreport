import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge, Button, Card, Field, Input, PageHeader } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { createIncident, importedIncidentExists, updateImportedIncidentTime } from "@/services/data";
import { canEditIncidents, incidentLabels } from "@/types";
import { parseIncidentWorkbook, type ImportRow } from "./excelImport";

export function ImportIncidentsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [fallbackTime, setFallbackTime] = useState("07:30");
  const [reading, setReading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const valid = useMemo(() => rows.filter((row) => row.errors.length === 0), [rows]);
  const invalid = rows.length - valid.length;

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setReading(true);
    try {
      const parsed = await parseIncidentWorkbook(file);
      setRows(parsed);
      setFileName(file.name);
      toast.success(`${parsed.length} rows loaded for review`);
    } catch (error) {
      setRows([]);
      toast.error(error instanceof Error ? error.message : "Unable to read workbook");
    } finally {
      setReading(false);
      event.target.value = "";
    }
  }

  async function importRows() {
    if (!user || !profile || !fallbackTime || !valid.length) return;
    setImporting(true);
    setProgress(0);
    let created = 0;
    let updated = 0;
    try {
      for (let index = 0; index < valid.length; index++) {
        const row = valid[index];
        if (await importedIncidentExists(row.sourceRecordId)) {
          if (canEditIncidents(profile.role) && row.scheduledTime && await updateImportedIncidentTime(row.sourceRecordId, row.scheduledTime, user.uid)) updated++;
        }
        else {
          await createIncident({
            firstName: row.firstName, lastName: row.lastName, email: row.email || undefined,
            ksnNumber: row.ksnNumber || undefined, sourceRecordId: row.sourceRecordId || undefined,
            schoolName: row.schoolName, incidentDate: row.incidentDate,
            scheduledTime: row.scheduledTime || fallbackTime, incidentType: row.incidentType!,
            responseStatus: "pending",
            notes: [row.sourceRecordId ? `Imported record: ${row.sourceRecordId}` : "Imported from Excel", row.sourceNotes].filter(Boolean).join(" · "),
          }, { uid: user.uid, name: `${profile.firstName} ${profile.lastName}` });
          created++;
        }
        setProgress(index + 1);
      }
      toast.success(`${created} incidents imported${updated ? `; ${updated} existing times corrected` : ""}`);
      navigate("/incidents");
    } catch {
      toast.error(`Import stopped after ${created} new incidents. You can safely retry.`);
    } finally { setImporting(false); }
  }

  return <>
    <PageHeader title="Import Excel" description="Upload and review multiple incidents before saving them to Firestore." />
    <div className="grid gap-6">
      <Card className="p-5"><div className="grid gap-5 lg:grid-cols-[1fr_220px]">
        <div><p className="font-semibold">Select an Excel workbook</p><p className="mt-1 text-sm text-muted">The incident time is read from each row’s Created column.</p>
          <label className="mt-4 inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-primary bg-white px-4 text-sm font-semibold text-primary hover:bg-blue-50"><Upload size={18}/>{reading ? "Reading…" : "Choose Excel file"}<input type="file" accept=".xlsx,.xls" className="sr-only" disabled={reading || importing} onChange={chooseFile}/></label>
          {fileName ? <p className="mt-2 text-sm text-muted">{fileName}</p> : null}
        </div>
        <Field label="Fallback Time" required><Input type="time" value={fallbackTime} onChange={(event) => setFallbackTime(event.target.value)} disabled={importing}/></Field>
      </div></Card>
      {rows.length ? <><div className="grid gap-4 sm:grid-cols-3"><Card className="p-4"><p className="text-sm text-muted">Rows found</p><p className="mt-1 text-2xl font-bold">{rows.length}</p></Card><Card className="p-4"><p className="text-sm text-muted">Ready to import</p><p className="mt-1 text-2xl font-bold text-emerald-700">{valid.length}</p></Card><Card className="p-4"><p className="text-sm text-muted">Need attention</p><p className="mt-1 text-2xl font-bold text-amber-700">{invalid}</p></Card></div>
        <Card><div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="font-semibold">Import preview</h2><p className="text-sm text-muted">Created supplies the time; the fallback is used only when Created has no time.</p></div><Button onClick={importRows} disabled={importing || !valid.length || !fallbackTime}>{importing ? `Importing ${progress}/${valid.length}…` : `Import ${valid.length} incidents`}</Button></div>
          <div className="max-h-[520px] overflow-auto"><table><thead className="sticky top-0"><tr><th>Row</th><th>Status</th><th>Date / Time</th><th>Substitute</th><th>KSN</th><th>School</th><th>Incident Type</th><th>Confirmation #</th></tr></thead><tbody>{rows.map((row) => <tr key={row.rowNumber}><td>{row.rowNumber}</td><td>{row.errors.length ? <span title={row.errors.join("; ")}><Badge className="bg-amber-50 text-amber-800"><AlertTriangle size={12} className="mr-1"/>Needs attention</Badge></span> : <Badge className="bg-emerald-50 text-emerald-700"><CheckCircle2 size={12} className="mr-1"/>Ready</Badge>}</td><td>{row.incidentDate || "—"}<p className="text-xs text-muted">{row.scheduledTime || `${fallbackTime} fallback`}</p></td><td><p className="font-semibold">{row.firstName} {row.lastName}</p><p className="text-xs text-muted">{row.email || "No email"}</p></td><td>{row.ksnNumber || "—"}</td><td>{row.schoolName || "—"}</td><td>{row.incidentType ? incidentLabels[row.incidentType] : "Invalid"}</td><td>{row.sourceRecordId || "—"}</td></tr>)}</tbody></table></div>
        </Card></> : <Card className="grid min-h-64 place-items-center border-dashed p-8 text-center"><div><FileSpreadsheet className="mx-auto text-muted" size={38}/><p className="mt-3 font-semibold">No workbook selected</p><p className="mt-1 text-sm text-muted">Your data stays in the browser until you confirm the import.</p></div></Card>}
    </div>
  </>;
}
