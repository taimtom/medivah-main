import { isAdminRole } from 'src/lib/member-profile';

export function scopeOwnedQuery(query, role, userId, column = 'member_id') {
  if (isAdminRole(role)) return query;
  return query.eq(column, userId);
}

export function buildRecordOwnership(role, userId, extra = {}) {
  if (isAdminRole(role)) {
    return extra;
  }

  return {
    ...extra,
    member_id: userId,
  };
}
