const mongoose = require("mongoose");

const conectareDB = async () => {
    try{
        await mongoose.connect(process.env.MONGOURL);
        console.log("MongoDB functioneaza!");
    
    } catch(err) {
        console.error("Eroare MongoDB:", err);
    }
}
module.exports =conectareDB