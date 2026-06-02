export type LicenseStatus = 'unlicensed' | 'active';

export type LicenseState = {
  status: LicenseStatus;
  requestKey: string;
  serialNumber?: string;
  activatedAt?: string;
};

export type ActivationResult = {
  success: boolean;
  error?: 'invalid_signature' | 'already_active' | 'tampered';
};

export type RevokeResult = {
  cancelKey: string;
  requestKey: string;
};

export type StoredActivation = {
  activationCode: string;
  serialNumber: string;
  activatedAt: string;
};
