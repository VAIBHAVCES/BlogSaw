const nodemailer = require("nodemailer");
const path  = require("path");
const  fs = require('fs').promises;

// async..await is not allowed in global scope, must use a wrapper
async function sendRegisterationWelcomeMail(emailId){

    // Generate test SMTP service account from ethereal.email
    const file = await fs.readFile("/html mail/welcome.html",{"encoding":"utf-8"}).then((data)=>{
        
        console.log("parsing message file ");
        // console.log(data);
        return data;
    });

  const transporter = nodemailer.createTransport({
    // host: "gmail",
    service:"gmail",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.OFFICIAL_MAIL_ID, 
      pass: process.env.OFFICIAL_MAIL_PWD
    }
  });


  let info = await transporter.sendMail({
      from: process.env.OFFICIAL_MAIL_ID, // sender address
      to: emailId, // list of receivers
      subject: " Welcome to community of blogsaw", // Subject line
      html: file
    });
}

module.exports = sendRegisterationWelcomeMail;
// myFunc().then((params)=>{
//     // console.log("transporter is :");
//     // console.log(transporter);
//     // console.log("file is : ");
//     console.log("exporting now");
//     module.exports = {
//         transporter:params.transporter,
//         file:params.file
//     };

// })