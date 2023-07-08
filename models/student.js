import  Mongoose  from "mongoose";


const student = new Mongoose.Schema({
    subject_code:String,
    subject_name:String,
    grade: String,
})

const gradelist = new Mongoose.Schema({
    Gradelist:[student]
})
const Gradelist = Mongoose.model('Gradelist', gradelist);


export default Gradelist


