const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// connection configurations
const mc = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testnode',
    multipleStatements: true,
});

// connect to database
mc.connect();
 
// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});
 
// Retrieve all datas 
app.get('/shows', function (req, res) {
    mc.query('SELECT * FROM taxcalc', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Item list.' });
    });
});
 
 
// Retrieve data with id 
app.get('/show/:id', function (req, res) {
 
    let tax_id = req.params.id;
 
    mc.query('SELECT * FROM taxcalc where id=?', tax_id, function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results[0], message: 'Item list.' });
    });
 
});
 
// Add a new item  
// Tax Codes can be statically assigned:
// 1 = food
// 2 = tobacco
// 3 = entertainment

app.post('/tax', function (req, res) {
    
    let name = req.body.name;
    let tax = req.body.tax;
    let price = req.body.price;
    
    //console.log(task);
    if (!name) {
        return res.status(400).send({ error:true, message: 'Please provide item' });
    }
 
    mc.query("INSERT INTO taxcalc SET ? ", { name: name, tax: tax, price: price }, function (error, results, fields) {
        if (error) throw error;

        if(tax=='1'){
            var misctax = 0.1*price;
            var misctype = "Food & Beverage";
            var miscrefund = "Yes";
        }
        else if(tax=='2'){
            var misctax = 10+(0.02*(price));
            var misctype = "Tobacco";
            var miscrefund = "No";
        }
        else{
            var altertax = 0;
            if(price >= 100){
                altertax = 0.001*(price-100);
            }
            else{
                altertax = 0;
            }
            var misctax = altertax;
            var misctype = "Entertainment";
            var miscrefund = "No";
        }
        var response = [{   "name" : name,
                            "tax" : misctax,
                            "price" : price,
                            "type" : misctype,
                            "refundable": miscrefund}];
        //return res.send({ error: false, data: response });
        mc.query('SELECT SUM(price-(0.1*price)) as grand, SUM(0.1*price) as taxes FROM taxcalc WHERE tax=1;SELECT SUM(price-(10+(0.02*(price)))) as grand, SUM(10+(0.02*(price))) as taxes FROM taxcalc WHERE tax=2;SELECT SUM(CASE WHEN price >= 100 THEN (price-0.001*(price-100)) ELSE 0 END) AS grand, SUM(CASE WHEN price >= 100 THEN (0.001*(price-100)) ELSE 0 END) AS taxes FROM taxcalc WHERE tax=3;SELECT SUM(price) as amount FROM taxcalc;', function (error, results, fields) {
            if (error) throw error;
            //return res.send({ error: false, data: results[0], message: 'Item list.' });
            var sum1 = results[0][0].grand;
            var tax1 = results[0][0].taxes;
            if(sum1 == undefined){
                var sum1 = 0;
                var tax1 = 0;
            }
            console.log(sum1);
            var sum2 = results[1][0].grand;
            var tax2 = results[1][0].taxes;
            if(sum2 == undefined){
                var sum2 = 0;
                var tax2 = 0;
            }
            console.log(sum2);
            var sum3 = results[2][0].grand;
            var tax3 = results[2][0].taxes;
            if(sum3 == undefined){
                var sum3 = 0;
                var tax3 = 0;
            }
            console.log(sum3);
            var grand = sum1+sum2+sum3;
            var taxes = tax1+tax2+tax3;
            response.push({
                "subtotal" : results[3][0].amount,
                "totaltaxes" : taxes,
                "grandtotal" : grand});
            console.log(response);
            return res.send({ error: false, data: response });
        });
    });
});

 
// all other requests redirect to 404
app.all("*", function (req, res, next) {
    return res.send('page not found');
    next();
});
 
// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});
 
// allows "grunt dev" to create a development server with livereload
module.exports = app;