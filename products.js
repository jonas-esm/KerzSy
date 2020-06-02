// module.exports 
// const objectsQuery = `SELECT  product.product_id,product.product_price , product.barcode, product.product_name , product.categori, product.imgUrl, product.oldPrice,product.newPrice ,
// json_objectagg(stock.size, stock.quantity) AS sizeQty FROM trialusers.stock  join trialusers.product on product.product_id =stock.pid group by product.product_id`

// const valuesQuery = 'SELECT product.product_name, product.product_price, product.imgUrl, stock.pid,product.barcode ,stock.size,stock.quantity FROM trialusers.stock inner join trialusers.product on product.product_id =stock.pid order by(product.product_name)'
// app.get('/test', function(req , res){
// pool.query(objectsQuery , function (err , result) {
//   if(err)
//   // throw err
//   console.log(err)
//   else {
//   console.log("success")
//   // result.json
//   // res.json({data:result})
//   const _parsed = result.map(obj => {
//     const tmp = {}
   
//     tmp.pID = obj.product_id 
//     tmp.barcode =obj.barcode
//     tmp.productName = obj.product_name 
//     tmp.categori = obj.categori 
//     tmp.imgUrl = obj.imgUrl 
//     tmp.oldPrice = obj.oldPrice 
//     tmp.newPrice = obj.newPrice 
//     tmp.price=obj.product_price
//     let newSizes = []
//     newSizes = JSON.parse(obj.sizeQty)// double-encoded field
//     tmp.sizeQty = newSizes 
//     tmp.sizes  =[]
//     //  tmp.sizeQty= Object.keys(newSizes).map(i => {i: newSizes.i})// double-encoded field
//      for (var i = 0, keys = Object.keys(newSizes); i < keys.length; i++) {
//       // tmp.size=[...tmp.size , Object.assign(newSizes[keys] , {size: keys})]
//       tmp.sizes = [...tmp.sizes,{"size" : keys[i] ,"qty": newSizes[keys[i]]}]
//      }
        
//     return tmp
// })
// res.send(_parsed)
// }
//   })
// })
// const qntSub = `UPDATE trialusers
// SET   stock.quantity = stock.quantity - 1 
// where product.product_id = ? and stock.size = ?; `
// const qntSub2="UPDATE trialusers.stock SET   stock.quantity = stock.quantity - 1 where `stock`.`size-val-id` = ( select `stock`.`size-val-id` where stock.pid = ? and stock.size = ?);"
// const reserveProductQuery = `SELECT stock.pid, product.product_name , stock.size , stock.quantity FROM trialusers.stock join trialusers.product on product_id = stock.pid where product.product_id = ? and stock.size = ?;`
// app.post('/productReserved', function (req, res) 
// {
//  var {productId , quantity , size} = req.body;
//  pool.query(qntSub2,[productId ,size] , function (err , result) {
//    if(err)
//    console.error(err)
//    else{
//      console.log("product reserved")
//      console.log(req.body)
//      res.json({data:result})
//  }
//  })
 
// console.log(req.body)
// // res.json({data:result})
  
// });
