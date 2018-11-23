Api Documentation.
Database consist of two table, taxes and taxcalc. We will use the taxcalc one.
Taxcalc consist of 4 column:
1. Id (int 11, primary key)
2. Name(varchar 255)
3. Tax(varchar 255)
4. Price(varchar 255)
How to use the api:
Run server.js with nodemon server.js
Request a POST request with header: application/json, with input name, tax, and price. It will returned with a json response with template :
First array:
            "name": string,
            "tax": integer,
            "price": integer,
            "type": string,
Second array:
            "refundable": string
            "subtotal": integer,
            "totaltaxes": integer,
            "grandtotal": integer

