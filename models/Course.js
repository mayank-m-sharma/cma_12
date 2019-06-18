const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
    course_name:{
        type: String,
        required: true
    },
    torrentUrl:{
        type: String,
        required: true
    },
    torrentFilePath: {
        type: String
    },
    status:{
        type: Boolean
    },
    date:{
        type:Date,
        default: Date.now()
    },
    courseImage: {
        type: String,
        default: "https://farm4.staticflickr.com/3274/3063220244_febaf28d96.jpg"
    }
})
mongoose.model('courses', CourseSchema);