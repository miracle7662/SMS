import crypto from 'crypto';
import repository from '../repositories/onboarding.repository.js';
import auditRepository from '../repositories/audit.repository.js';
import config from '../config/env.js';
import { hashPassword } from '../utils/password-utils.js';
import { normalizeEmail, normalizeMobile } from '../utils/normalize.js';
import { ApiError } from '../utils/api-error.js';

const temporaryPassword=()=>`Soc@${crypto.randomBytes(6).toString('base64url')}9`;
const mask=value=>{const text=String(value||'');return text.includes('@')?`${text.slice(0,2)}***@${text.split('@')[1]}`:`******${text.slice(-4)}`;};
class OnboardingService {
  dashboard(){return repository.dashboard();}
  async create(body,actor,meta){const mobile=normalizeMobile(body.admin.mobile),email=body.admin.email?normalizeEmail(body.admin.email):null;const password=temporaryPassword();const channel=body.invitation_channel||'NONE';const recipient=channel==='EMAIL'?email:mobile;if(channel==='EMAIL'&&!email)throw new ApiError(400,'Admin email is required for email invitation');
    const result=await repository.create({society:{...body.society,society_code:body.society.society_code.trim().toUpperCase(),society_name:body.society.society_name.trim()},admin:{...body.admin,name:body.admin.name.trim(),mobile,email},plan_id:body.plan_id,use_trial:body.use_trial,invitation_channel:channel,recipient_masked:mask(recipient)},await hashPassword(password),actor);
    let invitationSent=false;if(result.accountCreated&&channel!=='NONE'){invitationSent=await this.sendInvitation(channel,recipient,{societyName:body.society.society_name,login:channel==='EMAIL'?email:mobile,password});await repository.markInvitation(result.invitationId,invitationSent?'SENT':'FAILED',invitationSent?null:'Provider is not configured or rejected the request');await repository.markUserInvited(result.userId,invitationSent?'SENT':'PENDING');}
    await auditRepository.log({userId:actor,societyId:result.societyId,moduleName:'society_onboarding',action:'create_society_and_admin',recordId:result.societyId,newData:{admin_user_id:result.userId,account_created:result.accountCreated,invitation_channel:channel,invitation_sent:invitationSent},ipAddress:meta.ip,userAgent:meta.userAgent});
    return{society_id:result.societyId,admin_user_id:result.userId,account_created:result.accountCreated,existing_account_assigned:!result.accountCreated,invitation_sent:invitationSent,temporary_password:result.accountCreated?password:null,login:result.accountCreated?(email||mobile):null};}
  async sendInvitation(channel,recipient,data){const provider=config.notifications[channel.toLowerCase()];if(!provider?.url)return false;try{const response=await fetch(provider.url,{method:'POST',headers:{'Content-Type':'application/json',...(provider.apiKey?{Authorization:`Bearer ${provider.apiKey}`}:{})},body:JSON.stringify({recipient,channel,title:`Welcome to ${data.societyName}`,message:`Your SocietyOS login is ${data.login} and temporary password is ${data.password}. Change it after first login.`}),signal:AbortSignal.timeout(10000)});return response.ok;}catch{return false;}}
  async goLive(id,actor,meta){await repository.goLive(id,actor);await auditRepository.log({userId:actor,societyId:id,moduleName:'society_onboarding',action:'go_live',recordId:id,ipAddress:meta.ip,userAgent:meta.userAgent});return this.dashboard();}
  async resend(id,channel,actor,meta){const password=temporaryPassword();const admin=await repository.prepareResend(id,channel,await hashPassword(password),actor,null);const recipient=channel==='EMAIL'?admin.email:admin.mobile;const sent=await this.sendInvitation(channel,recipient,{societyName:admin.society_name,login:admin.email||admin.mobile,password});await repository.markInvitation(admin.invitationId,sent?'SENT':'FAILED',sent?null:'Provider is not configured or rejected the request');await repository.markUserInvited(admin.id,sent?'SENT':'PENDING');await auditRepository.log({userId:actor,societyId:id,moduleName:'society_onboarding',action:'resend_invitation',recordId:admin.invitationId,newData:{channel,sent},ipAddress:meta.ip,userAgent:meta.userAgent});return{invitation_sent:sent,login:admin.email||admin.mobile,temporary_password:password};}
}
export default new OnboardingService();
