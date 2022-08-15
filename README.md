# CertCheck
Node JS utility to check the signature of Apple P12 Certificates.

*Confirmed to work on macOS and Linux. Windows may need slight changes.*

*Works with both enterprise and developer certificates.*

Includes tool to convert CER files to PEM. (See [**cer-to-pem.js**](https://github.com/JailbreaksApp/CertCheck/blob/master/cer-to-pem.js))

## Contact
 - [**Twitter** **(@iCrazeiOS)**](https://twitter.com/iCrazeiOS)
 - **Discord:** iCraze#3017

## Support
 - [**PayPal**](https://paypal.me/iCrazeiOS)
 - **BTC:** bc1q0ghuykcutljjyh3tcdjv88ek8zjzrtnk8zhuhy

## Requirements
 - Node JS (with `ocsp` & `node-forge` modules)

## Usage
 **Standard usage:**
  - Have cert.p12 and pass.txt in the same directory as the script.
  - Run `node index.js`

 **Specify directory:**
  - Have cert.p12 and pass.txt in a different directory than the script.
  - Run `node index.js "/path/to/directory"`

 **JSON output:**
  - Follow steps for other examples, but add `--json` to the end of the command. (MUST be after custom directory, if you are using one)
