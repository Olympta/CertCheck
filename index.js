const fs = require("fs");
const forge = require("node-forge");
const ocsp = require("ocsp");

const p12File = __dirname+"/cert.p12";
const p12PassFile = __dirname+"/pass.txt";

if (!fs.existsSync(p12File)) {
	console.log("Certificate must be stored at cert.p12");
	process.exit();
} else if (!fs.existsSync(p12PassFile)) {
	console.log("Certificate password must be stored within pass.txt");
	process.exit();
} else if (!fs.existsSync("CA-PEM/")) {
	console.log("CA certificates must be stored within 'CA-PEM/'");
	console.log("Find them at https://www.apple.com/certificateauthority/ ('Worldwide Developer Relations' certificates)");
	console.log("Convert them from CER to PEM via this command:");
	console.log("\tnode cer-to-pem.js <path to .cer file>");
	console.log("The generated PEM file will be saved in the same directory as the .cer file");
	process.exit();
}

const p12Pass = String(fs.readFileSync(p12PassFile, "utf8")).replace("\n", "");

/* Convert P12 to PEM */
let cert, certData;
try {
	const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(fs.readFileSync(p12File, {encoding:"binary"})), false, p12Pass);
	certData = p12.getBags({bagType: forge.pki.oids.certBag});
	cert = forge.pki.certificateToPem(certData[forge.pki.oids.certBag][0].cert); // no need to assign to variable, but makes the ocsp.check() line shorter
} catch (err) {
	console.log(`Failed to convert P12 to PEM. ${err.message.includes("Invalid password") ? "Password is likely incorrect" : "Unknown error"}.`);
	process.exit();
}

// Get certificate name
let certName = certData[forge.pki.oids.certBag][0].cert.subject.attributes.filter(({name}) => name === "organizationName")[0].value;
// Get expiration date
let certExpirationDate = new Date(certData[forge.pki.oids.certBag][0].cert.validity.notAfter.getTime()).toGMTString();

/* GET CERT SIGNATURE STATUS */
// Loop througn all CA certificates from CA-PEM folder
// Probably a better way than doing this, but it's fast anyway and doesn't really matter anyway
fs.readdirSync("CA-PEM").forEach(file => {
	// This next line can break if there is a directory ending with .pem, but that's just intentionally breaking the script so idc
	if (file.endsWith(".pem")) { // If PEM file
		// Check if the certificate is signed by the CA
		ocsp.check({cert: cert, issuer: fs.readFileSync(`${__dirname}/CA-PEM/${file}`, "utf8")}, function(error, res) {
			let certStatus;
			if (error) {
				if (error.toString().includes("revoked")) certStatus = "Revoked";
			} else if (res.type == "good") certStatus = "Signed";

			if (certStatus) {
				console.log("Certificate Name: " + certName);
				console.log("Certificate Status: " + certStatus);
				console.log("Certificate Expiration Date: " + certExpirationDate);
				process.exit(); // Exit here so the script doesn't continue to check other certificates
			}
		});
	}
});
