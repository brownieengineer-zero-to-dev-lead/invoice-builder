// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { execSync } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const path = require('path');

// eslint-disable-next-line no-undef
module.exports = async function (context) {
  const { electronPlatformName, appOutDir, packager } = context;
  const productName = packager.appInfo.productFilename;

  // Resolve path to the Electron binary/app bundle per platform
  let electronPath;
  if (electronPlatformName === 'darwin') {
    electronPath = path.join(appOutDir, `${productName}.app`, 'Contents', 'MacOS', productName);

    console.log('Removing quarantine from:', path.join(appOutDir, `${productName}.app`));
    execSync(`xattr -cr "${path.join(appOutDir, `${productName}.app`)}"`);
  } else if (electronPlatformName === 'win32') {
    electronPath = path.join(appOutDir, `${productName}.exe`);
  } else {
    electronPath = path.join(appOutDir, productName);
  }

  console.log('Flipping Electron fuses for:', electronPath);

  await flipFuses(electronPath, {
    version: FuseVersion.V1,

    // Block loading app code from outside the asar bundle
    [FuseV1Options.OnlyLoadAppFromAsar]: true,

    // Disable --inspect / --inspect-brk so the renderer can't be debugged at runtime
    [FuseV1Options.EnableNodeCliInspectArguments]: false,

    // Disable NODE_OPTIONS env var (prevents injecting --require hooks)
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,

    // Validate asar integrity on load (requires codesigning to be meaningful on macOS)
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
  });

  console.log('Fuses flipped successfully.');
};
