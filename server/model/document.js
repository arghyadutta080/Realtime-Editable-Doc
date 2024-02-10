const { default: mongoose } = require("mongoose");


const documentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    data: {
        type: Object,
    }
})

const docs = mongoose.model('docs', documentSchema);
module.exports = { docs };