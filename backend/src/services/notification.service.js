import repository from '../repositories/notification.repository.js';
import audit from './audit.service.js';
import config from '../config/env.js';
import { ApiError } from '../utils/api-error.js';

const isManager = (roles, platformRoles) =>
  platformRoles.includes('SUPER_ADMIN') || roles.some((role) => ['SOCIETY_ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(role));

class NotificationService {
  async data(societyId, userId, roles, platformRoles) {
    const manager = isManager(roles, platformRoles);
    const data = await repository.data(societyId, userId, manager);
    if (manager) {
      const personal = await repository.data(societyId, userId, false);
      data.unread_count = personal.unread_count;
      data.my_notifications = personal.notifications;
      data.preferences = personal.preferences;
    }
    return data;
  }

  async template(societyId, payload, userId) {
    try {
      const id = await repository.template(societyId, {
        ...payload,
        template_code: payload.template_code.trim().toUpperCase(),
        template_name: payload.template_name.trim(),
        title_template: payload.title_template.trim(),
        message_template: payload.message_template.trim(),
      }, userId);
      await audit.logAction(userId, 'notifications', 'TEMPLATE_CREATED', id, null, { template_code: payload.template_code }, societyId);
      return { id };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Template code already exists');
      throw error;
    }
  }

  async campaign(societyId, payload, userId) {
    const userIds = (payload.user_ids || []).map(Number);
    if (payload.audience_type === 'CUSTOM' && !userIds.length) throw new ApiError(400, 'Select at least one user for custom audience');
    const recipients = await repository.recipients(societyId, payload.audience_type, userIds);
    if (!recipients.length) throw new ApiError(404, 'No active recipients found');
    const result = await repository.campaign(societyId, { ...payload, title: payload.title.trim(), message: payload.message.trim() }, recipients, userId);
    await audit.logAction(userId, 'notifications', 'CAMPAIGN_CREATED', result.id, null, { audience: payload.audience_type, channels: payload.channels, recipients: result.recipient_count }, societyId);
    return result;
  }

  async dispatch(societyId, userId) {
    const notifications = await repository.outbox(societyId);
    const result = { processed: 0, sent: 0, failed: 0 };
    for (const notification of notifications) {
      const provider = config.notifications[notification.channel.toLowerCase()];
      if (!provider.url) {
        await repository.dispatchResult(societyId, notification.id, false, { error: `${notification.channel} provider is not configured` });
        result.failed += 1;
        result.processed += 1;
        continue;
      }
      try {
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}) },
          body: JSON.stringify({ recipient: notification.recipient_address, title: notification.title, message: notification.message, channel: notification.channel, notification_id: notification.id }),
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
        const body = await response.json().catch(() => ({}));
        await repository.dispatchResult(societyId, notification.id, true, { messageId: String(body.message_id || body.id || '') });
        result.sent += 1;
      } catch (error) {
        await repository.dispatchResult(societyId, notification.id, false, { error: error.message });
        result.failed += 1;
      }
      result.processed += 1;
    }
    await repository.refreshCampaigns(societyId);
    await audit.logAction(userId, 'notifications', 'OUTBOX_DISPATCHED', null, null, result, societyId);
    return result;
  }

  async read(societyId, id, userId) {
    if (!await repository.read(societyId, id, userId)) throw new ApiError(404, 'Unread in-app notification not found');
    return { read: true };
  }
  readAll(societyId, userId) { return repository.readAll(societyId, userId); }
  preferences(societyId, userId, payload) {
    if (!payload.in_app_enabled && !payload.email_enabled && !payload.sms_enabled && !payload.whatsapp_enabled) throw new ApiError(400, 'At least one notification channel must remain enabled');
    return repository.preferences(societyId, userId, payload);
  }
}

export default new NotificationService();
