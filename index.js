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
var pool2  = mysql.createPool({
  connectionLimit : 10,
  host     : 'db4free.net',
  user     : 'anas_esm',
  password : 'a1069000A',
  database : 'trialusers'
});
var pool4  = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : '7899',
  database : 'trialusers'
});
var pool  = mysql.createPool({
   connectionLimit : 100,
   host     : '139.162.141.183',
   user     : 'kerzstor_anas',
   password : 'a1069000',
   database : 'kerzstor_prdnu'
 });
const objectsQuery = `SELECT  product.product_id,product.product_price , product.barcode, product.product_name , product.categori, product.imgUrl, product.oldPrice,product.newPrice ,
json_objectagg(stock.size, stock.quantity) AS sizeQty FROM trialusers.stock  join trialusers.product on product.product_id =stock.pid group by product.product_id`

// const valuesQuery = 'SELECT product.product_name, product.product_price, product.imgUrl, stock.pid,product.barcode ,stock.size,stock.quantity FROM trialusers.stock inner join trialusers.product on product.product_id =stock.pid order by(product.product_name)'
app.get('/test', function(req , res){
pool.query(objectsQuery , function (err , result) {
  if(err)
  // throw err
  console.log(err)
  else {
  console.log("success")
  // result.json
  // res.json({data:result})
  const _parsed = result.map(obj => {
    const tmp = {}
   
    tmp.pID = obj.product_id 
    tmp.barcode =obj.barcode
    tmp.productName = obj.product_name 
    tmp.categori = obj.categori 
    tmp.imgUrl = obj.imgUrl 
    tmp.oldPrice = obj.oldPrice 
    tmp.newPrice = obj.newPrice 
    tmp.price=obj.product_price
    let newSizes = []
    newSizes = JSON.parse(obj.sizeQty)// double-encoded field
    tmp.sizeQty = newSizes 
    tmp.sizes  =[]
    //  tmp.sizeQty= Object.keys(newSizes).map(i => {i: newSizes.i})// double-encoded field
     for (var i = 0, keys = Object.keys(newSizes); i < keys.length; i++) {
      // tmp.size=[...tmp.size , Object.assign(newSizes[keys] , {size: keys})]
      tmp.sizes = [...tmp.sizes,{"size" : keys[i] ,"qty": newSizes[keys[i]]}]
     }
        
    return tmp
})
res.send(_parsed)
}
  })
})
const qntSub = `UPDATE trialusers
SET   stock.quantity = stock.quantity - 1 
where product.product_id = ? and stock.size = ?; `
const qntSub2="UPDATE trialusers.stock SET   stock.quantity = stock.quantity - 1 where `stock`.`size-val-id` = ( select `stock`.`size-val-id` where stock.pid = ? and stock.size = ?);"
const reserveProductQuery = `SELECT stock.pid, product.product_name , stock.size , stock.quantity FROM trialusers.stock join trialusers.product on product_id = stock.pid where product.product_id = ? and stock.size = ?;`
app.post('/productReserved', function (req, res) 
{
 var {productId , quantity , size} = req.body;
 pool.query(qntSub2,[productId ,size] , function (err , result) {
   if(err)
   console.error(err)
   else{
     console.log("product reserved")
     console.log(req.body)
     res.json({data:result})
 }
 })
 
console.log(req.body)
// res.json({data:result})
  
});
app.get('/products', function(_req, res){
 
pool.query('SELECT * FROM product',function(err,results){
   if (err) {
      console.log(err);
   
   }
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
    console.error(error);
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
