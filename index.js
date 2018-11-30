const request = require('superagent');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const express = require('express')

const app = express()
const port = process.env.PORT || '3000';

const mail_list = ['dmitry.agli@gmail.com'];

let markers = {
  first_sm_marker: '',
  second_sm_marker: ''
}

app.get('/', async(req, res, next) => {

  const req_data = await request.get('https://sitv.ru/actirovka/')
  .catch((err)=> {
    res.send('Resource not available')
    next(err);
  });

  if(req_data) {

    const $ = await cheerio.load(req_data.text);
  
    const date = $('.activ').children().eq(0).text();
    const first_sm = $('.activ').children().eq(1).text();
    const first_sm_data = $('.activ').children().eq(2).text();
    const second_sm = $('.activ').children().eq(3).text();
    const second_sm_data = $('.activ').children().eq(4).text();
    const empty_data = 'Данных нет, информация обновляется после 06:00 и после 11:00';
  
        let res_data = empty_data;

        checkConditions(date,first_sm,first_sm_data,'first_sm_marker');
        checkConditions(date,second_sm,second_sm_data,'second_sm_marker');
        
        function checkConditions(date,sm,sm_data,sm_marker) {
          if (sm_data !== empty_data) {
            res_data = "The email is have already sent";
            if (markers[sm_marker] !== date) {
              markers[sm_marker] = date;
              sendMails(date,sm,sm_data);
              res_data = `Email sent: / ${date} / ${sm} / ${sm_data}`;
            }
          }
        }
    
    res.send(res_data);

  }

})

function sendMails(date,sm,sm_data) {
  const transporter = nodemailer.createTransport({
    service: 'Yandex',
    auth: {
      user: 'dmitry.agli@yandex.ru',
      pass: 'Qq10102018'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  const mailOptions = {
    from: 'dmitry.agli@yandex.ru',
    to: mail_list,
    subject: `ВНИМАНИЕ! Актировка ${date} ${sm}`,
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

// error handler
app.use(function(err, req, res, next) {
  console.log(`err.message: ${err.message}`);
});

app.listen(port, () => console.log(`App listening on port ${port}!`))