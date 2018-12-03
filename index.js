const request = require('superagent');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express()
const port = process.env.PORT || '3000';

let client;
async function connectDB() {
    const url = 'mongodb://heroku_qhth26ww:4881jn68umbadudr95p5omosa6@ds147030.mlab.com:47030/heroku_qhth26ww';
    const dbname = 'heroku_qhth26ww';

    try {
      if (!client) {
        client = await MongoClient.connect(url,{useNewUrlParser:true});
      }
      return client.db(dbname)
    } catch(err) {
      return Promise.reject(err);
    }
    
};
    
const mail_list = ['dmitry.agli@gmail.com','milena290510@yandex.ru'];

app.get('/', async(req, res, next) => {

  const db = await connectDB().catch((err)=> {
    res.send('DB is not available, please try later');
    next(err);
  });;

  const req_data = await request.get('https://sitv.ru/actirovka/')
  .catch((err)=> {
    res.send('External resource is not available, please try later');
    next(err);
  });

  if(req_data&&db) {

    const $ = await cheerio.load(req_data.text);
  
    const date = $('.activ').children().eq(0).text();
    const first_sm = $('.activ').children().eq(1).text();
    const first_sm_data = $('.activ').children().eq(2).text();
    const second_sm = $('.activ').children().eq(3).text();
    const second_sm_data = $('.activ').children().eq(4).text();
    const empty_data = 'Данных нет, информация обновляется после 06:00 и после 11:00';
  
        let res_data = empty_data;

        await checkConditions(date,first_sm,first_sm_data,'first_sm_marker');
        await checkConditions(date,second_sm,second_sm_data,'second_sm_marker');
        
        async function checkConditions(date,sm,sm_data,sm_marker) {
          if (sm_data !== empty_data) {
              
            const collection = db.collection('markers');
            
            let markerDoc = await collection.findOne({
              sm: sm_marker
            });
              
            if(!markerDoc) {
              markerDoc = await collection.insertOne({
                sm: sm_marker,
                date: ''
              })
            }

            if (markerDoc.date !== date) {
              markerDoc = await collection.updateOne({
                sm: sm_marker
              },{
                $set: {
                  date: date
                }
              });
              sendMails(date,sm,sm_data);
              res_data = `Email sent: / ${date} / ${sm} / ${sm_data}`;
            } else {
              res_data = "The email is have already sent";
            }
          }
        }
    
    console.log(res_data);
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
  console.log(`Error Handler: ${err.message}`);
});

app.listen(port, () => console.log(`App listening on port ${port}!`))