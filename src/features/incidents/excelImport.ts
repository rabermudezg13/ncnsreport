import { readSheet } from "read-excel-file/browser";
import type { IncidentType } from "@/types";

type Cell = string | number | boolean | Date | null;
export interface ImportRow { rowNumber:number; sourceRecordId:string; firstName:string; lastName:string; email:string; ksnNumber:string; schoolName:string; incidentDate:string; scheduledTime:string; incidentType:IncidentType|null; sourceNotes:string; errors:string[] }
const normalize=(value:Cell)=>String(value??"").trim();
const pad=(value:number)=>String(value).padStart(2,"0");
const dateValue=(value:Cell)=>{if(value instanceof Date)return value.toISOString().slice(0,10);if(typeof value==="number")return new Date(Date.UTC(1899,11,30)+value*86400000).toISOString().slice(0,10);const parsed=new Date(String(value));return Number.isNaN(parsed.getTime())?"":parsed.toISOString().slice(0,10)};
const timeValue=(value:Cell)=>{if(value instanceof Date)return `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`;if(typeof value==="number"){const minutes=Math.round((value-Math.floor(value))*1440)%1440;return `${pad(Math.floor(minutes/60))}:${pad(minutes%60)}`}const text=normalize(value);const match=text.match(/(?:T|\s)(\d{1,2}):(\d{2})/)??text.match(/^(\d{1,2}):(\d{2})/);return match?`${pad(Number(match[1]))}:${match[2]}`:""};
const names=(value:string)=>{const clean=value.trim();if(clean.includes(",")){const[last,first]=clean.split(",",2).map(v=>v.trim());return{firstName:first,lastName:last}}const parts=clean.split(/\s+/);return{firstName:parts[0]??"",lastName:parts.slice(1).join(" ")}};
const incidentType=(value:string):IncidentType|null=>{const normalized=value.toLowerCase().replace(/[^a-z]/g,"");if(normalized==="nocallnoshow"||normalized==="ncns")return"no_call_no_show";if(normalized==="latecancellation"||normalized==="latecancel")return"late_cancellation";return null};

export async function parseIncidentWorkbook(file:File){
  const rows=await readSheet(file) as Cell[][];
  if(rows.length<2)throw new Error("The workbook has no data rows.");
  const headers=rows[0].map(cell=>normalize(cell).toLowerCase());
  const index=(...labels:string[])=>{for(const label of labels){const found=headers.indexOf(label);if(found>=0)return found}return-1};
  const columns={record:index("confirmation #","confirmation number","number"),created:index("created","created at"),type:index("subcategory","incident type"),school:index("school information","school"),date:index("date of ncns","incident date"),name:index("talent name","substitute","substitute name"),email:index("email"),ksn:index("ksn id","ksn number"),district:index("district"),state:index("state"),channel:index("channel")};
  if([columns.type,columns.school,columns.date,columns.name].some(value=>value<0))throw new Error("Required columns are missing: Subcategory, School Information, Date of NCNS, or Talent Name.");
  return rows.slice(1).filter(row=>row.some(Boolean)).map((row,rowIndex):ImportRow=>{
    const parsedName=names(normalize(row[columns.name]));const type=incidentType(normalize(row[columns.type]));const schoolName=normalize(row[columns.school]);const incidentDate=dateValue(row[columns.date]);const scheduledTime=columns.created>=0?timeValue(row[columns.created]):"";const errors:string[]=[];
    if(!parsedName.firstName||!parsedName.lastName)errors.push("Full substitute name is required");if(!schoolName)errors.push("School is required");if(!incidentDate)errors.push("Valid incident date is required");if(!type)errors.push("Incident type must be No Call No Show or Late Cancellation");
    const details=[["District",columns.district>=0?normalize(row[columns.district]):""],["State",columns.state>=0?normalize(row[columns.state]):""],["Channel",columns.channel>=0?normalize(row[columns.channel]):""]].filter(([,value])=>value).map(([label,value])=>`${label}: ${value}`).join(" · ");
    return{rowNumber:rowIndex+2,sourceRecordId:columns.record>=0?normalize(row[columns.record]):"",...parsedName,email:columns.email>=0?normalize(row[columns.email]):"",ksnNumber:columns.ksn>=0?normalize(row[columns.ksn]).replace(/^\(/,""):"",schoolName,incidentDate,scheduledTime,incidentType:type,sourceNotes:details,errors};
  });
}
