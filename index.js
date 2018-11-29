const request = require('superagent');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const express = require('express')

const app = express()
const port = process.env.PORT || '3000';

const mail_list = ['dmitry.agli@gmail.com'];

let first_sm_marker;
let second_sm_marker;


app.get('/', async(req, res) => {

  const req_data = await request.get('https://sitv.ru/actirovka/');

  const $ = await cheerio.load(req_data.text);

  const date = $('.activ').children().eq(0).text();
  const first_sm = $('.activ').children().eq(1).text();
  const first_sm_data = $('.activ').children().eq(2).text();
  const second_sm = $('.activ').children().eq(3).text();
  const second_sm_data = $('.activ').children().eq(4).text();
  const empty_data = 'Данных нет, информация обновляется после 06:00 и после 11:00';

      let res_data = empty_data;

      if (first_sm_data !== empty_data) {
        if (first_sm_marker !== date) {
          first_sm_marker = date;
          sendMails(date,first_sm,first_sm_data);
          res_data = `Email sent: / ${date} / ${first_sm} / ${first_sm_data}`;
        }
      }
      
      if (second_sm_data !== empty_data) {
        if (second_sm_marker !== date) {
          second_sm_marker = date;
          sendMails(date,_sm,second_sm_data);
          res_data = `Email sent: / ${date} / ${second_sm} / ${second_sm_data}`;
        }
      }

  res.send(res_data);

})

app.listen(port, () => console.log(`App listening on port ${port}!`))

function sendMails(date,sm,sm_data) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dmitry.agli@gmail.com',
      pass: 'Ads328654'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
    
  const mailOptions = {
    from: 'dmitry.agli@gmail.com',
    to: mail_list,
    subject: `ВНИМАНИЕ! Актировка ${sm}`,
    text: `
    ${date} 
    
    ${sm} 
    ${sm_data}`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: / ${date} / ${sm} / ${info.response}`);
    }
  });
};