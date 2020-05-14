var express = require('express');
var app = express();
var mysql      = require('mysql');
var cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const creds = require('./config');

app.use( bodyParser.urlencoded( {
   extended: true
} ) );

app.use( bodyParser.json() );

app.use(cors())
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '7899',
  database : 'trialusers'

});
var pool  = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : '7899',
  database : 'trialusers'
});
app.get('/products', function(_req, res){
 
pool.query('SELECT * FROM product',function(err,results){
   if (err) console.log(err);
   console.log("products have been fetched");
      res.json({data:results}) ;
   })})
   app.post('/search/', (req, res) => {
         const geo = req.param('query');  
         pool.query('SELECT * FROM `product` WHERE `product_name` RLIKE ?',[geo],function(err,results){
            if(err) return console.error(err);
            console.log("search done");
               return res.json({data:results}) ;
         
         })
      });

// connection.connect(err => {if (err) return err;});

// app.get('/products', function(_req, res){
//    connection.query('SELECT * FROM product',function(err,results){
//       if(err) return console.error(err);
//       else {console.log("products have been fetched");
//          return res.json({data:results}) ;
//    }
//    })
// });
// app.post('/search/', (req, res) => {
//    const geo = req.param('query');  
//    connection.query('SELECT * FROM `product` WHERE `product_name` RLIKE ?',[geo],function(err,results){
//       if(err) return console.error(err);
//       else {console.log("search done");
//          return res.json({data:results}) ;
//    }
//    })
// });

// app.post('/products/add', function (_req, res) {
//     connection.query('', function (err, result) {
//       if (err) return err;
//       else {
//           return res.json({ data: results })
//       }
//     })
// });

function isAuthenticated(req, res, next) {
   if (typeof req.headers.authorization !== "undefined") {
      let token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, "Myasklfhlkashflkashfklahs", function(err, decoded) {
         if (err) return res.status(500).send({ auth: false, message: 'Not Authorized' });
         req.decoded_user = decoded;
         return next();
       });

   } else {
       res.status(500).json({ error: "Not Authorized" });
       throw new Error("Not Authorized");
   }
}


// app.get('/secret', isAuthenticated, (req, res) => {
//    res.status(200).send(req.decoded_user);   
// })

app.post('/user/login', (req, res) => {
   const { email, password } = req.body;

   if(!email || email.length == 0)
      res.status(400).send({ message: "email is required" })
   if(!password || password.length == 0)
      res.status(400).send({ message: "password is required" })

      connection.query("SELECT * FROM users WHERE email = ?", email, function(err,results){
         if(err) return res.status(400).send({ message: err.sqlMessage });
         else if(results.length <= 0)
            res.status(401).send({ message: "invalid email or password" })
         else {
               bcrypt.compare(password, results[0].password, function(err, pw_check) {
                  if(pw_check) {
                     var user = {
                        name: results[0].name,
                        email: results[0].email,
                        phone: results[0].phone,
                        address: results[0].address
                     }
                     var token = jwt.sign(user, "Myasklfhlkashflkashfklahs", {
                        expiresIn: 86400000 // expires in 24 hours
                      });
                      user.token = token;
                     res.status(200).send({ ...user })
                  } else {
                     res.status(401).send({ message: "invalid email or password" })
                  }
               });
         }
      })
});


app.post('/user/signup', (req, res) => {
   const { username, email, PhoneNumber, password, address } = req.body;
   var user = { username, email, PhoneNumber, address };

   if(!username || username.length == 0)
      res.status(400).send({ message: "username is required" })
   if(!email || email.length == 0)
      res.status(400).send({ message: "email is required" })
   if(!PhoneNumber || PhoneNumber.length == 0)
      res.status(400).send({ message: "PhoneNumber is required" })
   if(!password || password.length == 0)
      res.status(400).send({ message: "password is required" })
   if(!address || address.length == 0)
      res.status(400).send({ message: "address is required" })

   // encrypt the pw
   bcrypt.hash(password, 10, function(err, hash) {
      connection.query('INSERT INTO users SET ?', { username, email, PhoneNumber, password: hash, address }, function(err,results){
         if(err) return res.status(400).send({ message: err.sqlMessage });
         else {
            var token = jwt.sign(user, "Myasklfhlkashflkashfklahs", {
               expiresIn: 86400000 // expires in 24 hours
             });
             user.token = token;
            res.status(200).send({ ...user })
         }
      })
   });   
});

var transport = {
   host: 'smtp.gmail.com', // e.g. smtp.gmail.com
   auth: {
     user: creds.USER,
     pass: creds.PASS
   }
 }
 var transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log('All works fine, congratz!');
  }
});
app.use(express.json()); app.post('/send', (req, res, next) => {
   const name = req.body.name
   const email = req.body.email
   const message = req.body.messageHtml
 
 
   var mail = {
     from: name,
     to: 'anas.esm@gmail.com',  
     subject: 'Contact form request',
 
     html: message
   }
 
   transporter.sendMail(mail, (err, data) => {
     if (err) {
      //   console.log(err)
       res.json({
          
         msg: 'fail'
       })
     } else {
      //   console.log(res);
       res.json({
         
         msg: 'success'
       })
     }
   })
 })
var PORT = process.env.PORT || 8000;
app.listen(PORT
   ,()=>{console.log("App is listening at 8000")}
   );
