const { execFile, execFileSync } = require('child_process');
const path = require('path');

module.exports = async function customSigner(configuration) {
  return new Promise((resolve, reject) => {
    const fileToSign = configuration.path;

    // Dynamically fetch the container name
    const getContainerName = () => {
      const command = `
        $cert = Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Subject -like "*GDevelop Ltd*" };
        $cert.PrivateKey.CspKeyContainerInfo.UniqueKeyContainerName
        `;
      const container = execFileSync(
        'powershell.exe',
        ['-NoProfile', '-Command', command],
        { encoding: 'utf-8' }
      ).trim();
      return container;
    };
    const keyContainer = getContainerName();

    const signtool = process.env.SIGNTOOL_PATH;
    if (!signtool) {
      console.error('❌ SIGNTOOL_PATH is not set');
      return reject(new Error('SIGNTOOL_PATH is not set'));
    }

    const args = [
      'sign',
      '/n',
      'GDevelop Ltd',
      '/csp',
      'eSignerKSP',
      '/k',
      keyContainer, // Required with /csp
      '/fd',
      'sha256',
      '/td',
      'sha256',
      '/tr',
      'http://timestamp.digicert.com',
      '/d',
      'GDevelop 5',
      '/du',
      'https://gdevelop.io',
      '/debug',
      fileToSign,
    ];

    console.log(`🔏 Signing ${fileToSign} using eSignerKSP...`);
    console.log(`🔧 Key container: ${keyContainer}`);
    console.log(`🔏 Signtool path: ${signtool}`);
    console.log(`🔏 Args: ${args.join(' ')}`);

    execFile(signtool, args, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ SignTool failed.');
        console.error(stdout);
        console.error(stderr);
        return reject(error);
      }

      console.log(`✅ Successfully signed: ${fileToSign}`);
      resolve();
    });
  });
};
