<<<<<<< HEAD
var express = require('express');
var app = express();
var mysql      = require('mysql');
var cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const allConfig = require('./config');
const path = require('path')
const multer = require('multer')
const creds = allConfig.creds
const models = require('./models/models.js')
app.use('/uploads',express.static('uploads/'))
app.use( bodyParser.urlencoded( {
   extended: true
} ) );

app.use( bodyParser.json() );

app.use(cors())
app.use(function (req, res, next) {

   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', '*');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type' );

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
   next();
});
app.use(function (req, res, next) {

   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', '*');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type' );

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
   next();
});
var connection = mysql.createConnection(allConfig.connectionConf);
// const storage = multer.diskStorage({destination:'uploads/' , filename: function(req , file , cb){
//    cb(null , "IMAGE-"+new Date().toISOString().slice(0,19) +path. file.originalname);
// }})
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now() +'-'+file.originalname )
  }
})
const upload = multer({storage:storage , limits : {fileSize:1000000}}).single('myImage')

app.get('/getstock' , function(req , res){
   models.getStock(req, res , pool)
})
app.put('/updateqnt' , function(req , res){
   models.updateQnt(req, res , pool)
})
app.post('/editprd' , function(req , res){
   models.updatePrdInfo(req , res , pool)
})
app.post('/newsize' , function (req ,res) {
   models.newSize(req , res , pool)
})
app.post('/deleteproduct' , function (req , res) {
   models.deleteProduct(req , res , pool)
})


// var pool = mysql.createPool(allConfig.localPool);
var pool  = mysql.createPool(allConfig.remotePool);
 const objectsQuery = `SELECT  product.product_id,product.product_price , product.barcode, product.product_name , product.categori, product.imgUrl, product.oldPrice,product.newPrice ,
 json_objectagg(stock.size, stock.quantity) AS sizeQty FROM kerzstor_prdnu.stock  join kerzstor_prdnu.product on product.product_id =stock.pid group by product.product_id`
 const objectsQuerySearch = `SELECT  product.product_id,product.product_price , product.barcode, product.product_name , product.categori, product.imgUrl, product.oldPrice,product.newPrice ,
 json_objectagg(stock.size, stock.quantity) AS sizeQty FROM kerzstor_prdnu.stock  join kerzstor_prdnu.product on product.product_id =stock.pid WHERE product.product_name RLIKE ? group by product.product_id `

// const valuesQuery = 'SELECT product.product_name, product.product_price, product.imgUrl, stock.pid,product.barcode ,stock.size,stock.quantity FROM kerzstor_prdnu.stock inner join kerzstor_prdnu.product on product.product_id =stock.pid order by(product.product_name)'
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
const qntSub = `UPDATE kerzstor_prdnu
SET   stock.quantity = stock.quantity - 1 
where product.product_id = ? and stock.size = ?; `
const qntSub2="UPDATE kerzstor_prdnu.stock SET   stock.quantity = stock.quantity - 1 where `stock`.`size-val-id` = ( select `stock`.`size-val-id` where stock.pid = ? and stock.size = ?);"
const reserveProductQuery = `SELECT stock.pid, product.product_name , stock.size , stock.quantity FROM kerzstor_prdnu.stock join kerzstor_prdnu.product on product_id = stock.pid where product.product_id = ? and stock.size = ?;`
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
// INSERT INTO `table` (`value1`, `value2`) 
// SELECT 'stuff for value1', 'stuff for value2' FROM DUAL 
// WHERE NOT EXISTS (SELECT * FROM `table` 
//       WHERE `value1`='stuff for value1' AND `value2`='stuff for value2' LIMIT 1) 

app.get('/products', function(_req, res){
 
pool.query('SELECT * FROM product',function(err,results){
   if (err) {
      console.log(err);
   
   }
   console.log("products have been fetched");
      res.json({data:results}) ;
   })})
   
app.post('/search/', (req, res) => {
   const geo = req.query.query;  
   console.log(req.query.query)
   // const geo = req.param('query');  
   pool.query(objectsQuerySearch,[geo],function(err,results){
      // pool.query('SELECT * FROM `product` WHERE `product_name` RLIKE ?',[geo],function(err,results){
      if(err) return console.error(err);
      console.log("search done");
         // return res.json({data:results}) ;
         const _parsed = results.map(obj => {
            const tmp = {}
           
            tmp.pID = obj.product_id 
            tmp.barcode =obj.barcode
            tmp.productName = obj.product_name 
            tmp.categori = obj.categori 
            tmp.imgUrl = req.file.path
            // tmp.imgUrl = obj.imgUrl 
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
        res.send({_parsed})
      })
   });
   
app.post('/addPrd2/', (req, res) => {
   // const {pID , pName , categori , imgUrl, oldPrice, price , sizeQty} = req.body
  const {product_id,
product_name,
imgUrl2,
barcode,
imgUrl,
oldPrice,
product_price,
sizeQty,} = req.body
   console.log(` body object : ${req.body} ` )
   
      const arr = sizeQty.map(item => {
         const tmp = {}
         // tmp.value_id=item.id 
         tmp.product_id = product_id
          tmp.size= item.size 
          tmp.qty = item.qty
         //  tmp.product_name = product_name
         //  tmp.imgUrl2 = imgUrl2
         //  tmp.barcode = barcode
         //  tmp.imgUrl = imgUrl
         //  tmp.oldPrice = oldPrice
         //  tmp.product_price = product_price
         //  tmp.sizeQt = sizeQt
          return tmp
      })
      const prdQuery = "INSERT INTO `kerzstor_prdnu`.`product` (`product_id`, `product_name`, `product_price`, `categori`, `imgUrl`,`imgUrl2`, `barcode`, `oldPrice`) VALUES ?"
      const prdValues = [[product_id,product_name,product_price,"" ,imgUrl,imgUrl2,barcode,oldPrice]]
      const stockValues =arr.map(item =>  Object.values(item))
      
      pool.getConnection(function(err, connection) {
         if (err)  console.log(err); // not connected!
         const allResults = {sizesQuery:{},prdQuery:{}}
         // Use the connection
         // connection.query('SELECT something FROM sometable', function (error, results, fields) {
            connection.query(prdQuery , [prdValues], function (err, results) {
                  if(err)
                  { console.log(err)
                  return res.status(500).send({error: err, message: err.message})
                  }
                  console.log(results)
               // res.json({message: 'error' , error:err})
            
            if(results){
              allResults.prdQuery = results;
              
            // })

            connection.query("INSERT INTO `kerzstor_prdnu`.`stock` (`pid`, `size`, `quantity`) VALUES ?" , [stockValues] , function (err , results) {
            
              if (err) {
                 console.log(err)
               //   res.status(500).json({message: err})
               return res.status(400).send({error: err, message: err.message})


               // res.json({message: 'error' , error:err})
                  
               } 
               //   console.log(results)
               // console.log(results)

               allResults.sizesQuery = results
              console.log(allResults)
               res.status(200).json({message: 'successfull process' , allResults})
              
            })
         //  res.json({data:allResults})


           connection.release(err);
       
           // Handle error after the release.
           if (err) console.log(err) ;
       
           // Don't use the connection here, it has been returned to the pool.
            }}) ;
         // console.log(prdValues , stockValues)
       });
      // pool.query("INSERT INTO `kerzstor_prdnu`.`stock` (`pid`, `size`, `quantity`) VALUES ?" , [stockValues] , function (err , results) {
      //    if(err) console.log(err)
      //    console.log(results)
         
      })
     
app.post('/addPrd' ,upload , function (req, res, next) {
console.log(req.file)
 // const {pID , pName , categori , imgUrl, oldPrice, price , sizeQty} = req.body
 if(!req.body.info) return res.status(500).send('noinfo')
  const {product_id,
product_name,
imgUrl2,
barcode,
imgUrl,
oldPrice,
product_price,
sizeQty,} = JSON.parse( req.body.info)
   // console.log(` body object : ${req.body} ` )
   
      const arr = sizeQty.map(item => {
         const tmp = {}
         // tmp.value_id=item.id 
         tmp.product_id = product_id
          tmp.size= item.size 
          tmp.qty = item.qty
         //  tmp.product_name = product_name
         //  tmp.imgUrl2 = imgUrl2
         //  tmp.barcode = barcode
         //  tmp.imgUrl = imgUrl
         //  tmp.oldPrice = oldPrice
         //  tmp.product_price = product_price
         //  tmp.sizeQt = sizeQt
          return tmp
      })
      const prdQuery = "INSERT INTO `kerzstor_prdnu`.`product` (`product_id`, `product_name`, `product_price`, `categori`, `imgUrl`,`imgUrl2`, `barcode`, `oldPrice`) VALUES ?"
      const prdValues = [[product_id,product_name,product_price,"" ,req.file.path,imgUrl2,barcode,oldPrice]]
      const stockValues =arr.map(item =>  Object.values(item))
      
      pool.getConnection(function(err, connection) {
         if (err)  console.log(err); // not connected!
         const allResults = {sizesQuery:{},prdQuery:{}}
         // Use the connection
         // connection.query('SELECT something FROM sometable', function (error, results, fields) {
            connection.query(prdQuery , [prdValues], function (err, results) {
                  if(err)
                  { console.log(err)
                  return res.status(500).send({error: err, message: err.message})
                  }
                  console.log(results)
               // res.json({message: 'error' , error:err})
            
            if(results){
              allResults.prdQuery = results;
              
            // })
            connection.query("INSERT INTO `kerzstor_prdnu`.`stock` (`pid`, `size`, `quantity`) VALUES ?" , [stockValues] , function (err , results) {
            
              if (err) {
                 console.log(err)
               //   res.status(500).json({message: err})
               return res.status(400).send({error: err, message: err.message})


               // res.json({message: 'error' , error:err})
                  
               } 
               //   console.log(results)
               // console.log(results)

               allResults.sizesQuery = results
              console.log(allResults)
               res.status(200).json({message: 'successfull process' , allResults})
              
            })
         //  res.json({data:allResults})


           connection.release(err);
       
           // Handle error after the release.
           if (err) console.log(err) ;
       
           // Don't use the connection here, it has been returned to the pool.
            }}) ;
         // console.log(prdValues , stockValues)
       });
      // pool.query("INSERT INTO `kerzstor_prdnu`.`stock` (`pid`, `size`, `quantity`) VALUES ?" , [stockValues] , function (err , results) {
      //    if(err) console.log(err)
      //    console.log(results)
         
      })

   //////////////////////////////
   ///////NEXT MESSION///////////
   //////////////////////////////
//    router.get('/api/url/', function (req, res) {
//       var pool = mysql.createPool(credentials);
//       var query1 = "SELECT column1 FROM table1 WHERE column2 = 'foo'";
//       var query2 = "SELECT column1 FROM table2 WHERE column2 = 'bar'";
  
//       var return_data = {};
  
//       async.parallel([
//          function(parallel_done) {
//              pool.query(query1, {}, function(err, results) {
//                  if (err) return parallel_done(err);
//                  return_data.table1 = results;
//                  parallel_done();
//              });
//          },
//          function(parallel_done) {
//              pool.query(query2, {}, function(err, results) {
//                  if (err) return parallel_done(err);
//                  return_data.table2 = results;
//                  parallel_done();
//              });
//          }
//       ], function(err) {
//            if (err) console.log(err);
//            pool.end();
//            res.send(return_data);
//       });
//   });

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
=======
var express = require('express');
var app = express();
var mysql      = require('mysql');
var cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const allConfig = require('./config');
const path = require('path')
const multer = require('multer')
const creds = allConfig.creds
const models = require('./models/models.js')
app.use('/uploads',express.static('uploads/'))
app.use( bodyParser.urlencoded( {
   extended: true
} ) );

app.use( bodyParser.json() );

app.use(cors())
app.use(function (req, res, next) {

   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin','*');
   res.setHeader('Access-Control-Allow-Origin','https://kerzstore.com');
   const pi = 3.14


   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type' );

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
   next();
});
app.use(function (req, res, next) {

   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', '*');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type' );

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
   next();
});
var connection = mysql.createConnection(allConfig.connectionConf);
// const storage = multer.diskStorage({destination:'uploads/' , filename: function(req , file , cb){
//    cb(null , "IMAGE-"+new Date().toISOString().slice(0,19) +path. file.originalname);
// }})
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now() +'-'+file.originalname )
  }
})
const upload = multer({storage:storage , limits : {fileSize:1000000}}).single('myImage')

app.get('/getstock' , function(req , res){
   models.getStock(req, res , pool)
})
app.put('/updateqnt' , function(req , res){
   models.updateQnt(req, res , pool)
})
app.post('/editprd' , function(req , res){
   models.updatePrdInfo(req , res , pool)
})
app.post('/newsize' , function (req ,res) {
   models.newSize(req , res , pool)
})
app.post('/deleteproduct' , function (req , res) {
   models.deleteProduct(req , res , pool)
})


// var pool = mysql.createPool(allConfig.localPool);
var pool  = mysql.createPool(allConfig.remotePool);
 const objectsQuery = `SELECT  product.product_id,product.product_price , product.barcode, product.product_name , product.categori, product.imgUrl, product.oldPrice,product.newPrice ,
 json_objectagg(stock.size, stock.quantity) AS sizeQty FROM kerzstor_prdnu.stock  join kerzstor_prdnu.product on product.product_id =stock.pid group by product.product_id`
 const objectsQuerySearch = `SELECT  product.product_id,product.product_price , product.barcode, product.product_name , product.categori, product.imgUrl, product.oldPrice,product.newPrice ,
 json_objectagg(stock.size, stock.quantity) AS sizeQty FROM kerzstor_prdnu.stock  join kerzstor_prdnu.product on product.product_id =stock.pid WHERE product.product_name RLIKE ? group by product.product_id `

// const valuesQuery = 'SELECT product.product_name, product.product_price, product.imgUrl, stock.pid,product.barcode ,stock.size,stock.quantity FROM kerzstor_prdnu.stock inner join kerzstor_prdnu.product on product.product_id =stock.pid order by(product.product_name)'
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
const qntSub = `UPDATE kerzstor_prdnu
SET   stock.quantity = stock.quantity - 1 
where product.product_id = ? and stock.size = ?; `
const qntSub2="UPDATE kerzstor_prdnu.stock SET   stock.quantity = stock.quantity - 1 where `stock`.`size-val-id` = ( select `stock`.`size-val-id` where stock.pid = ? and stock.size = ?);"
const reserveProductQuery = `SELECT stock.pid, product.product_name , stock.size , stock.quantity FROM kerzstor_prdnu.stock join kerzstor_prdnu.product on product_id = stock.pid where product.product_id = ? and stock.size = ?;`
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
// INSERT INTO `table` (`value1`, `value2`) 
// SELECT 'stuff for value1', 'stuff for value2' FROM DUAL 
// WHERE NOT EXISTS (SELECT * FROM `table` 
//       WHERE `value1`='stuff for value1' AND `value2`='stuff for value2' LIMIT 1) 

app.get('/products', function(_req, res){
 
pool.query('SELECT * FROM product',function(err,results){
   if (err) {
      console.log(err);
   
   }
   console.log("products have been fetched");
      res.json({data:results}) ;
   })})
   
app.post('/search/', (req, res) => {
   const geo = req.query.query;  
   console.log(req.query.query)
   // const geo = req.param('query');  
   pool.query(objectsQuerySearch,[geo],function(err,results){
      // pool.query('SELECT * FROM `product` WHERE `product_name` RLIKE ?',[geo],function(err,results){
      if(err) return console.error(err);
      console.log("search done");
         // return res.json({data:results}) ;
         const _parsed = results.map(obj => {
            const tmp = {}
           
            tmp.pID = obj.product_id 
            tmp.barcode =obj.barcode
            tmp.productName = obj.product_name 
            tmp.categori = obj.categori 
            tmp.imgUrl = req.file.path
            // tmp.imgUrl = obj.imgUrl 
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
        res.send({_parsed})
      })
   });
   
app.post('/addPrd2/', (req, res) => {
   // const {pID , pName , categori , imgUrl, oldPrice, price , sizeQty} = req.body
  const {product_id,
product_name,
imgUrl2,
barcode,
imgUrl,
oldPrice,
product_price,
sizeQty,} = req.body
   console.log(` body object : ${req.body} ` )
   
      const arr = sizeQty.map(item => {
         const tmp = {}
         // tmp.value_id=item.id 
         tmp.product_id = product_id
          tmp.size= item.size 
          tmp.qty = item.qty
         //  tmp.product_name = product_name
         //  tmp.imgUrl2 = imgUrl2
         //  tmp.barcode = barcode
         //  tmp.imgUrl = imgUrl
         //  tmp.oldPrice = oldPrice
         //  tmp.product_price = product_price
         //  tmp.sizeQt = sizeQt
          return tmp
      })
      const prdQuery = "INSERT INTO `kerzstor_prdnu`.`product` (`product_id`, `product_name`, `product_price`, `categori`, `imgUrl`,`imgUrl2`, `barcode`, `oldPrice`) VALUES ?"
      const prdValues = [[product_id,product_name,product_price,"" ,imgUrl,imgUrl2,barcode,oldPrice]]
      const stockValues =arr.map(item =>  Object.values(item))
      
      pool.getConnection(function(err, connection) {
         if (err)  console.log(err); // not connected!
         const allResults = {sizesQuery:{},prdQuery:{}}
         // Use the connection
         // connection.query('SELECT something FROM sometable', function (error, results, fields) {
            connection.query(prdQuery , [prdValues], function (err, results) {
                  if(err)
                  { console.log(err)
                  return res.status(500).send({error: err, message: err.message})
                  }
                  console.log(results)
               // res.json({message: 'error' , error:err})
            
            if(results){
              allResults.prdQuery = results;
              
            // })

            connection.query("INSERT INTO `kerzstor_prdnu`.`stock` (`pid`, `size`, `quantity`) VALUES ?" , [stockValues] , function (err , results) {
            
              if (err) {
                 console.log(err)
               //   res.status(500).json({message: err})
               return res.status(400).send({error: err, message: err.message})


               // res.json({message: 'error' , error:err})
                  
               } 
               //   console.log(results)
               // console.log(results)

               allResults.sizesQuery = results
              console.log(allResults)
               res.status(200).json({message: 'successfull process' , allResults})
              
            })
         //  res.json({data:allResults})


           connection.release(err);
       
           // Handle error after the release.
           if (err) console.log(err) ;
       
           // Don't use the connection here, it has been returned to the pool.
            }}) ;
         // console.log(prdValues , stockValues)
       });
      // pool.query("INSERT INTO `kerzstor_prdnu`.`stock` (`pid`, `size`, `quantity`) VALUES ?" , [stockValues] , function (err , results) {
      //    if(err) console.log(err)
      //    console.log(results)
         
      })
     
app.post('/addPrd' ,upload , function (req, res, next) {
console.log(req.file)
 // const {pID , pName , categori , imgUrl, oldPrice, price , sizeQty} = req.body
 if(!req.body.info) return res.status(500).send('noinfo')
  const {product_id,
product_name,
imgUrl2,
barcode,
imgUrl,
oldPrice,
product_price,
sizeQty,} = JSON.parse( req.body.info)
   // console.log(` body object : ${req.body} ` )
   
      const arr = sizeQty.map(item => {
         const tmp = {}
         // tmp.value_id=item.id 
         tmp.product_id = product_id
          tmp.size= item.size 
          tmp.qty = item.qty
         //  tmp.product_name = product_name
         //  tmp.imgUrl2 = imgUrl2
         //  tmp.barcode = barcode
         //  tmp.imgUrl = imgUrl
         //  tmp.oldPrice = oldPrice
         //  tmp.product_price = product_price
         //  tmp.sizeQt = sizeQt
          return tmp
      })
      const prdQuery = "INSERT INTO `kerzstor_prdnu`.`product` (`product_id`, `product_name`, `product_price`, `categori`, `imgUrl`,`imgUrl2`, `barcode`, `oldPrice`) VALUES ?"
      const prdValues = [[product_id,product_name,product_price,"" ,req.file.path,imgUrl2,barcode,oldPrice]]
      const stockValues =arr.map(item =>  Object.values(item))
      
      pool.getConnection(function(err, connection) {
         if (err)  console.log(err); // not connected!
         const allResults = {sizesQuery:{},prdQuery:{}}
         // Use the connection
         // connection.query('SELECT something FROM sometable', function (error, results, fields) {
            connection.query(prdQuery , [prdValues], function (err, results) {
                  if(err)
                  { console.log(err)
                  return res.status(500).send({error: err, message: err.message})
                  }
                  console.log(results)
               // res.json({message: 'error' , error:err})
            
            if(results){
              allResults.prdQuery = results;
              
            // })
            connection.query("INSERT INTO `kerzstor_prdnu`.`stock` (`pid`, `size`, `quantity`) VALUES ?" , [stockValues] , function (err , results) {
            
              if (err) {
                 console.log(err)
               //   res.status(500).json({message: err})
               return res.status(400).send({error: err, message: err.message})


               // res.json({message: 'error' , error:err})
                  
               } 
               //   console.log(results)
               // console.log(results)

               allResults.sizesQuery = results
              console.log(allResults)
               res.status(200).json({message: 'successfull process' , allResults})
              
            })
         //  res.json({data:allResults})


           connection.release(err);
       
           // Handle error after the release.
           if (err) console.log(err) ;
       
           // Don't use the connection here, it has been returned to the pool.
            }}) ;
         // console.log(prdValues , stockValues)
       });
      // pool.query("INSERT INTO `kerzstor_prdnu`.`stock` (`pid`, `size`, `quantity`) VALUES ?" , [stockValues] , function (err , results) {
      //    if(err) console.log(err)
      //    console.log(results)
         
      })

   //////////////////////////////
   ///////NEXT MESSION///////////
   //////////////////////////////
//    router.get('/api/url/', function (req, res) {
//       var pool = mysql.createPool(credentials);
//       var query1 = "SELECT column1 FROM table1 WHERE column2 = 'foo'";
//       var query2 = "SELECT column1 FROM table2 WHERE column2 = 'bar'";
  
//       var return_data = {};
  
//       async.parallel([
//          function(parallel_done) {
//              pool.query(query1, {}, function(err, results) {
//                  if (err) return parallel_done(err);
//                  return_data.table1 = results;
//                  parallel_done();
//              });
//          },
//          function(parallel_done) {
//              pool.query(query2, {}, function(err, results) {
//                  if (err) return parallel_done(err);
//                  return_data.table2 = results;
//                  parallel_done();
//              });
//          }
//       ], function(err) {
//            if (err) console.log(err);
//            pool.end();
//            res.send(return_data);
//       });
//   });

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
>>>>>>> 8f370f8c6de8e36352567b058540c535355d66e0
