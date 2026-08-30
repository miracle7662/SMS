import subscriptionRepository from '../repositories/subscription.repository.js';

class SubscriptionService {
  dashboard(){ return subscriptionRepository.dashboard(); }
  async createPlan(body,userId){ await subscriptionRepository.createPlan({...body,plan_code:body.plan_code.trim().toUpperCase(),plan_name:body.plan_name.trim()},userId); return this.dashboard(); }
  async assign(body,userId){ await subscriptionRepository.assign(body,userId); return this.dashboard(); }
  async status(id,body,userId){ await subscriptionRepository.updateStatus(id,body.status,userId); return this.dashboard(); }
  async invoice(body,userId){ await subscriptionRepository.createInvoice(body,userId); return this.dashboard(); }
  async payment(id,body,userId){ await subscriptionRepository.recordPayment(id,body,userId); return this.dashboard(); }
}
export default new SubscriptionService();
