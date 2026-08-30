import { getPool } from '../config/database.js';
import subscriptionRepository from '../repositories/subscription.repository.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

export const requireActiveSubscription = asyncHandler(async (req, res, next) => {
  if (req.auth?.platformRoles?.includes('SUPER_ADMIN')) return next();
  const entitlement = await subscriptionRepository.entitlement(req.auth.activeSocietyId);
  const now = new Date();
  const validStatus = entitlement && ['ACTIVE', 'TRIAL'].includes(entitlement.status);
  const validEnd = entitlement && (!entitlement.end_date || new Date(entitlement.end_date).getTime() >= now.setHours(0, 0, 0, 0));
  const validTrial = entitlement && (entitlement.status !== 'TRIAL' || !entitlement.trial_end_date || new Date(entitlement.trial_end_date).getTime() >= now.setHours(0, 0, 0, 0));
  if (!validStatus || !validEnd || !validTrial) throw new ApiError(402, 'Society subscription is inactive or expired. Please contact the platform administrator.');
  req.auth.entitlement = entitlement;
  next();
});

const resourceConfig = {
  buildings: { limit: 'max_buildings', table: 'buildings' },
  flats: { limit: 'max_flats', table: 'flats' },
  users: { limit: 'max_users', table: 'user_societies', extra: `AND status='ACTIVE'` },
};

export const enforceSubscriptionLimit = (resource) => asyncHandler(async (req, res, next) => {
  if (req.auth?.platformRoles?.includes('SUPER_ADMIN')) return next();
  const definition = resourceConfig[resource];
  const entitlement = req.auth.entitlement || await subscriptionRepository.entitlement(req.auth.activeSocietyId);
  const limit = entitlement?.[definition.limit];
  if (limit === null || limit === undefined) return next();
  const [[row]] = await getPool().execute(`SELECT COUNT(*) count FROM ${definition.table} WHERE society_id=? ${definition.extra || ''}`, [req.auth.activeSocietyId]);
  const requestedUnits = resource === 'flats' ? Number(req.body?.number_of_flats || 1) : 1;
  if (Number(row.count) + requestedUnits > Number(limit)) throw new ApiError(409, `${resource} limit reached for the current subscription plan`);
  next();
});

export default { requireActiveSubscription, enforceSubscriptionLimit };
