import type { Timestamp } from "firebase/firestore";
export type UserRole="admin"|"manager"|"staff"|"read_only";
export type IncidentType="no_call_no_show"|"late_cancellation";
export type ResponseStatus="yes"|"no"|"pending";
export interface UserProfile {id:string;firstName:string;lastName:string;email:string;role:UserRole;active:boolean;createdAt?:Timestamp;updatedAt?:Timestamp}
export interface Substitute {id:string;firstName:string;lastName:string;email?:string;phone?:string;bhNumber?:string;ksnNumber?:string;totalIncidents:number;noCallNoShowCount:number;lateCancellationCount:number;firstIncidentAt?:Timestamp;lastIncidentAt?:Timestamp}
export interface Incident {id:string;substituteId:string;substituteName:string;bhNumber?:string;ksnNumber?:string;schoolId?:string;schoolName:string;incidentDate:Timestamp;scheduledTime:string;incidentType:IncidentType;responseStatus:ResponseStatus;responseDateTime?:Timestamp;responseMethod?:"phone"|"text"|"email"|"other";reasonProvided?:string;followUpNotes?:string;notes?:string;createdBy:string;createdByName:string;createdAt:Timestamp;updatedBy?:string;updatedAt:Timestamp}
export interface School {id:string;schoolName:string;schoolCode:string;active:boolean}
export const incidentLabels:Record<IncidentType,string>={no_call_no_show:"No Call / No Show",late_cancellation:"Late Cancellation"};
export const canWrite=(role:UserRole)=>role!=="read_only";
export const canEditIncidents=(role:UserRole)=>role==="admin"||role==="manager";
