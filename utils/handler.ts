
import nodemailer from 'nodemailer';
import { constants } from '../config'
import moment from 'moment';

export const OTPGenerator = () => {
    let otpCode = Math.floor(900000 * Math.random() + 100000);
    return otpCode
}

export const SendEmail = async (to : any, subject : any, text : any, html ?: any) => {
    try {
        // console.log(to);
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Your SMTP server hostname
            port: 587, // Your SMTP port
            secure: false, // true for 465, false for other ports
            auth: {
                user: "testkmsof@gmail.com", // generated ethereal user
                pass: constants.NODEMAILER_PASSKEY, // generated ethereal password
            },
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'testkmsof@gmail.com', // sender address
            to, // list of receivers
            subject, // Subject line
            text: text, // plain text body
            html: html // html body
        });

        console.log('Message sent: %s', info.messageId);
        return true; // Email sent successfully
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        return false; // Failed to send email
    }
}

export const formatFileSize = async (bytes : any) => {

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    
};

export const calculateTimeDifference = async (startTime : any, endTime : any) => {
    const startMilliSecond = startTime.getTime();
    const endMilliSecond = endTime.getTime();
    // console.log('sss',startMilliSecond)
    // console.log('eee',endMilliSecond)
    // console.log('timeDiff',endMilliSecond - startMilliSecond)
    return endMilliSecond - startMilliSecond;
}

export const isBoolean = (value : any) => {
    return typeof value === 'boolean';
}

function generateUUIDv4LikeNumberString(minLength :any, maxLength :any) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let randomNumberString = '';
  for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);
      randomNumberString += randomNumber.toString();
  }
  return randomNumberString;
}

export { generateUUIDv4LikeNumberString };