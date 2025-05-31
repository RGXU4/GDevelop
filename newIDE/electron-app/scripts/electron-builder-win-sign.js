const { execFile } = require('child_process');
const path = require('path');

module.exports = async function customSigner(configuration) {
  return new Promise((resolve, reject) => {
    const fileToSign = configuration.path;

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
      '/kc',
      'eSignerKSP',
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
