module.exports ={
    HelloWorld: ()=>{
        console.log("Hello from models");
    },


    getStock : function(req , res , pool){
        const qry = `SELECT  product.product_id,product.product_price , product.barcode, product.product_name , product.categori, product.imgUrl, product.oldPrice,product.newPrice ,
        json_arrayagg(stock.size) AS sizearr , json_arrayagg(stock.s_v_id ) as vidarr , json_arrayagg(stock.quantity) as qntarr
        FROM kerzstor_prdnu.stock  join kerzstor_prdnu.product on product.product_id =stock.pid group by product.product_id;`;
        pool.query(qry , function(err , result){
            if(err) return res.status(500).send(err)
            var tmp ={}
            const _parsed = 
            result.map((item,i)=>{
                tmp ={}
                tmp.product_id = item.product_id 
                tmp.product_price = item.product_price 
                tmp.barcode = item.barcode 
                tmp.product_name = item.product_name 
                tmp.categori = item.categori 
                tmp.imgUrl = item.imgUrl 
                tmp.oldPrice = item.oldPrice 
                tmp.newPrice = item.newPrice 
                tmp.sizearr = JSON.parse(item.sizearr )
                tmp.vidarr = JSON.parse(item.vidarr) 
                tmp.qntarr = JSON.parse(item.qntarr )
                return tmp
                
            })
            // result.map(item =>{
            //     JSON.parse(item.sizearr)
            //     JSON.parse(item.qntarr)
            //     return item
            // })
            res.status(200).send(_parsed)
        })

    },
updateQnt: function(req,res,pool){
    //updateqnt
    const {s_v_id , quantity} = req.body
   
    pool.query(`update stock set quantity = ? where s_v_id = ?` , [quantity , s_v_id], function(err , result){
        if(err) { console.log(err); return res.status(500).send(err)}
        res.status(200).send(result)
    })
},
updatePrdInfo: function(req, res , pool){
    const {product_id , product_name , product_price , oldPrice ,barcode} = req.body
    const values = {
     product_name, product_price , oldPrice ,barcode
    }
    const qry = 'update product set ? where product_id = ?'
    pool.query(qry  , [values , product_id] , function(err , result){
        if (err) {
            console.log(err)
            return res.status(500).send(err)

        }
        res.status(200).send(result)
    })

},
newSize:function(req , res , pool){
    const qry = `insert into stock (pid , size , quantity) values ? `
    const {product_id , size , quantity} = req.body
    const val = [product_id , size , quantity] 
    pool.query(qry , [[val]] , function (err , result) {
        if(err) {
            console.log(err)
            return res.status(500).send(err)
        }
        res.status(200).send(result)
    })

},
deleteProduct : function (req , res , pool) {
 const {id} =  req.body 
  const qry = `DELETE FROM kerzstor_prdnu.stock WHERE (pid = ?);`
  const qry2 = `DELETE FROM kerzstor_prdnu.product WHERE (product_id = ?);`

  pool.getConnection((err , cnct)=>{
      if(err) throw err;
      let allResults = {sizes:{} , product:{}}

      cnct.query(qry,[id] ,  function (error , result) {
          if(error) throw error
        //   res.status(200).send(result)
        allResults['sizes'] = result
      })
      cnct.query(qry2 ,[id] ,  function (error2 , result2) {
          if(error2) throw error2
           allResults['product'] = result2
      console.log(allResults)
      res.status(200).send(allResults)

      cnct.release()

      })
      
  })
 
}
}