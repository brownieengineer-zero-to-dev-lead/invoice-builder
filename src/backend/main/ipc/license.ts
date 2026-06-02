import { ipcMain } from 'electron';
import { getHardwareId } from '../license/hardwareId';
import { readOrCreateSalt, rotateSalt, writeLicenseActivation, clearLicenseActivation, readLicenseState } from '../license/licenseStore';
import { deriveRequestKey, verifyActivationCode, computeCancelKey } from '../license/licenseVerify';

export const initLicenseHandlers = () => {
  ipcMain.handle('get-license-state', async () => {
    const hardwareId = getHardwareId();
    const salt = await readOrCreateSalt();
    const requestKey = deriveRequestKey(hardwareId, salt);
    return readLicenseState(requestKey);
  });

  ipcMain.handle('activate-license', async (_event, activationCode: string, serialNumber: string) => {
    const hardwareId = getHardwareId();
    const salt = await readOrCreateSalt();
    const requestKey = deriveRequestKey(hardwareId, salt);

    const result = verifyActivationCode(activationCode, requestKey);
    if (!result.success) return result;

    await writeLicenseActivation({
      activationCode,
      serialNumber,
      activatedAt: new Date().toISOString().split('T')[0]
    });
    return { success: true };
  });

  ipcMain.handle('revoke-license', async () => {
    const hardwareId = getHardwareId();
    const salt = await readOrCreateSalt();
    const requestKey = deriveRequestKey(hardwareId, salt);

    const cancelKey = computeCancelKey(requestKey);
    await clearLicenseActivation();
    const newSalt = await rotateSalt();
    const newRequestKey = deriveRequestKey(hardwareId, newSalt);

    return { cancelKey, requestKey: newRequestKey };
  });
};
