const { default: mongoose } = require("mongoose");

const connectionDB = async () => {
    try { 
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'docs'
        });
        console.log('Connected to the database');
    } catch (error) {
        console.log('Error connecting to the database', error);
    }
}

module.exports = { connectionDB };