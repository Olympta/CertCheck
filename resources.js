const fs = require('fs')
const https = require('https')
const execSync = require('child_process').execSync;

const downloadCER = (url, dest) => {
  const file = fs.createWriteStream(`cctmp-${dest}.cer`);
  https.get(url, (res) => {
    res.pipe(file)
    file.on('finish', () => {
        file.close()
        execSync(
          `node cer-to-pem.js cctmp-${dest}.cer && mv cctmp-${dest}.pem CA-PEM/${dest}.pem && rm -rf cctmp-${dest}.cer`
        )
    })
  })
}

console.log('[*] Downloading resources...')
fs.mkdirSync("CA-PEM/");
downloadCER(
  "https://developer.apple.com/certificationauthority/AppleWWDRCA.cer",
  "G1"
);
downloadCER(
  "https://www.apple.com/certificateauthority/AppleWWDRCAG2.cer",
  "G2"
);
downloadCER(
  "https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer",
  "G3"
);
downloadCER(
  "https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer",
  "G4"
);
downloadCER(
  "https://www.apple.com/certificateauthority/AppleWWDRCAG5.cer",
  "G5"
);
downloadCER(
  "https://www.apple.com/certificateauthority/AppleWWDRCAG6.cer",
  "G6"
);
console.log(`[*] Downloaded resources. You can now re-run index.js.`);
