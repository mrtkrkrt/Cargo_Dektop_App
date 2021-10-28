let MongoClient = require('mongodb').MongoClient;
let url = "mongodb+srv://admin:a@muratkarakurt.9ergo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
/* 
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.collection("users").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
}); */
 /* MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");

    dbo.collection("users").deleteMany({}, function(err, obj) {
      if (err) throw err;

      db.close();
    });
  });*/

 /*MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");
    let myobj = { username: "a", password: "a" };
    dbo.collection("users").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });*/
