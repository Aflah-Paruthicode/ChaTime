const mongoose = require("mongoose");
require("dotenv").config();

const pass = process.env.DB_PASSWORD;

const connectDb = async () => {
  try {
    await mongoose.connect(
      `mongodb://amaflu4424_db_user:${pass}@ac-yoaupli-shard-00-00.l8s7i8w.mongodb.net:27017,ac-yoaupli-shard-00-01.l8s7i8w.mongodb.net:27017,ac-yoaupli-shard-00-02.l8s7i8w.mongodb.net:27017/?ssl=true&replicaSet=atlas-4vbhpy-shard-0&authSource=admin&appName=Cluster0`,
    );
    console.log("db connection is done");
  } catch (err) {
    console.log(err);
  }
};

module.exports = { connectDb };
