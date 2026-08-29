export const normalizeEmail = (email) => {
  if (!email) return null;
  return email.toLowerCase().trim();
};

export const normalizeMobile = (mobile) => {
  if (!mobile) return null;
  // Remove all non-digit characters
  return mobile.replace(/\D/g, '');
};

export const maskMobile = (mobile) => {
  if (!mobile || mobile.length < 4) return mobile;
  return `${'*'.repeat(mobile.length - 4)}${mobile.slice(-4)}`;
};

export default {
  normalizeEmail,
  normalizeMobile,
  maskMobile,
};
