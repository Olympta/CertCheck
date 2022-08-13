const fs = require("fs");
const ocsp = require("ocsp");
const { exec } = require("child_process");

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
	console.log("Convert them from CER to PEM via this command:")
	console.log("\topenssl x509 -inform der -in <input file> -out <output file name>.pem");
	process.exit();
}

const p12Pass = String(fs.readFileSync(p12PassFile, "utf8")).replace("\n", "");
let certStatus, certName, certExpirationDate;

// Convert .p12 to .pem
exec(`openssl pkcs12 -in "${p12File}" -passin pass:"${p12Pass}" -out tempcert.pem -nodes`, (error, stdout, stderr) => {
	if (stderr.includes("invalid password")) {
		console.log("Failed to convert p12 to PEM. Password is likely incorrect.");
		process.exit();
	}

	/* GET CERT NAME */
	exec(`openssl x509 -in tempcert.pem -noout -nameopt -oneline -subject`, (error, stdout, stderr) => {
		certName = stdout.replace("\n", "").split("iPhone Distribution: ").pop().split(".,")[0];
	});
	
	/* GET CERT EXPIRARION DATE */
	exec(`openssl x509 -in tempcert.pem -noout -enddate`, (error, stdout, stderr) => {
		certExpirationDate = stdout.replace("  ", " ").replace("notAfter=", "").slice(0, -1);
	});

	/* GET CERT SIGNATURE STATUS */
	// Probably a better way than doing this, but it's fast anyway and doesn't really matter anyway
	fs.readdirSync("CA-PEM").forEach(file => { // Loop through files in CA-PEM folder
		// I think this next line can break if there is a directory ending with .pem, but that's just intentionally breaking the script
		if (file.endsWith(".pem")) { // If PEM file
			// Check if the certificate is signed by the CA
			ocsp.check({ cert: fs.readFileSync("tempcert.pem", "utf8"), issuer: fs.readFileSync(`${__dirname}/CA-PEM/${file}`, "utf8") }, function(error, res) {
				let success = false;
				if (error) {
					if (error.toString().includes("revoked")) {
						success = true;
						certStatus = "Revoked";
					}
				} else if (res.type == "good") {
					success = true;
					certStatus = "Signed";
				}

				if (success) {
					console.log("Certificate Name: " + certName);
					console.log("Certificate Status: " + certStatus);
					console.log("Certificate Expiration Date: " + certExpirationDate);
					fs.unlinkSync("tempcert.pem"); // Remove temporary PEM file
					process.exit(); // Exit here so the script doesn't continue to check other certificates
				}
			});
		}
	});
});
