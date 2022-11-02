const nodemailer = require('nodemailer')

let config = {
    appUrl:process.env.FORGOTPASSWORDLINK
}
const sendEmail = async(email,subject,text)=>{
   try{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:process.env.EMAIL,
            pass: process.env.PASSWORD
        },
    
    });
    
    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        html:`
        <html>
          <head>
            <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
            <title>Reset Password</title>
            <style>
              #outlook a {
                padding: 0;
              }
              .ReadMsgBody {
                width: 100%;
              }
              .ExternalClass {
                width: 100%;
              }
              body {
                -webkit-text-size-adjust: none;
                margin: 0;
                padding: 0;
                font-family: Arial;
                width: 100% !important;
                background-color: #FFFFFF;
                color: #000000;
              }
              img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
              }
              table td {
                border-collapse: collapse;
              }
              #backgroundTable {
                height: 100% !important;
                margin: 0 auto;
                padding: 0;
                width: 100% !important;
              }
              body,
              #backgroundTable {
                background-color: #FFFFFF;
              }
              #templateContainer {
                border: none;
              }
              #templatePreheader {
                background-color: #FFFFFF;
              }
              #templateHeader {
                background-color: #FFFFFF;
                border-bottom: 0;
              }
              #templateHeader h2 {
                margin: 20px 0;
                text-align: center;
                font-size: 20px;
              }
              .headerContent {
                padding: 0 0 20px;
                vertical-align: middle;
              }
              .headerContent img {
  
              }
              .headerContent a:link, .headerContent a:/* Yahoo! Mail Override */visited,
              .headerContent a .yshortcuts
              /* Yahoo! Mail Override */
              {
                color: #12163f;
                font-weight: normal;
                text-decoration: underline;
              }
              #headerImage {
                max-height: 120px !important;
                height: auto !important;
                max-width: 600px !important;
                width: 100% !important;
              }
              #templateContainer,
              .bodyContent {
                background-color: #FFFFFF;
              }
              .bodyContent div,
              .bodyContent p {
                color: #333333;
                font-family: Arial;
                font-size: 16px;
                line-height: 150%;
                text-align: left;
              }
              .bodyContent div a:link, .bodyContent div a:/* Yahoo! Mail Override */visited,
              .bodyContent div a .yshortcuts
              /* Yahoo! Mail Override */
              {
                color: #12163f;
                font-weight: normal;
                text-decoration: underline;
              }
            </style>
          </head>
          <body leftMargin="0" marginWidth="0" topmargin="0" marginHeight="0" offset="0" style="background: #FFFFFF">
            <center>
              <table
                border="0"
                cellPadding="0"
                cellSpacing="0"
                height="100%"
                width="100%"
                id="backgroundTable"
                style="background: #FFFFFF"
              >
                <tr>
                  <td align="center" valign="top">
                    <table
                      border="0"
                      cellPadding="10"
                      cellSpacing="0"
                      width="100%"
                      style="max-width: 600px; margin: 0 auto"
                      id="templatePreheader"
                    >
                      <tr>
                        <td valign="top" class="preheaderContent"></td>
                      </tr>
                    </table>
                    <table
                      border="0"
                      cellPadding="0"
                      cellSpacing="0"
                      width="90%"
                      style="max-width: 600px; margin: 0 auto; border: none; background-color: #FFFFFF;"
                      id="templateContainer"
                    >
                      <tr>
                        <td align="center" valign="top">
                          <table
                            border="0"
                            cellPadding="0"
                            cellSpacing="0"
                            width="100%"
                            style="max-width: 600px; margin: 0 auto"
                            id="templateHeader"
                          >
                            <tr>
                              <td class="headerContent" style="text-align: center;">
                                <img width="200" src="https://png.pngtree.com/png-clipart/20190630/original/pngtree-real-estate-and-business-logo-sign-png-image_4158199.jpg" alt="Elegant Document Portal" style="max-width: 200px;" />
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" valign="top">
                          <table
                            border="0"
                            cellPadding="0"
                            cellSpacing="0"
                            width="100%"
                            style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;"
                            id="templateBody"
                          >
                            <tr>
                              <td valign="top" class="bodyContent">
                                <table border="0" cellPadding="0" cellSpacing="0" width="100%" style="max-width: 600px; margin: 20px auto">
                                  <tr>
                                    <td valign="top">
                                      <h2 style="text-transform: uppercase; font-weight: bold; color: #000; font-size: 20px; margin-bottom: 20px;">
                                         Password Reset link 
                                      </h2>
                                      <h3>Please 
                                        <a href=${config.appUrl}>click here</a> To Reset the password
                                      </h3>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <br />
                  </td>
                </tr>
              </table>
            </center>
          </body>
        </html>
      `
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
   }catch(err){
      console.log(err)
   }
}
module.exports = sendEmail
