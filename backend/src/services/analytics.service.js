import repository from '../repositories/analytics.repository.js';
import { ApiError } from '../utils/api-error.js';

const financialAccess = (roles, platformRoles) =>
  platformRoles.includes('SUPER_ADMIN') ||
  roles.some((role) => ['SOCIETY_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'ACCOUNTANT'].includes(role));

const operationsAccess = (roles, platformRoles) =>
  platformRoles.includes('SUPER_ADMIN') ||
  roles.some((role) => ['SOCIETY_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'ACCOUNTANT'].includes(role));

function normalizeNumbers(record) {
  for (const [key, value] of Object.entries(record || {})) {
    if (value !== null && !Number.isNaN(Number(value))) record[key] = Number(value);
  }
  return record;
}

class AnalyticsService {
  async data(societyId, from, to, roles, platformRoles) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) {
      throw new ApiError(400, 'Valid from and to dates are required');
    }

    const data = await repository.data(societyId, from, to);
    for (const value of Object.values(data.kpis)) normalizeNumbers(value);
    for (const rows of [data.collection_trend, data.expense_trend, data.expense_categories, data.defaulters, data.recent_payments]) {
      for (const row of rows) normalizeNumbers(row);
    }

    data.can_view_financials = financialAccess(roles, platformRoles);
    if (!data.can_view_financials) {
      for (const key of ['maintenance', 'collection', 'expenses', 'payroll', 'accounting']) data.kpis[key] = {};
      data.collection_trend = [];
      data.expense_trend = [];
      data.expense_categories = [];
      data.defaulters = [];
      data.recent_payments = [];
    }

    if (!operationsAccess(roles, platformRoles)) {
      data.recent_complaints = [];
      if (roles.includes('RESIDENT')) data.visitors = [];
      if (roles.includes('SECURITY')) data.members = [];
    }

    return data;
  }
}

export default new AnalyticsService();
