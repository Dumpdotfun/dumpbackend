// models/Feedback.ts
import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
    coinID : { type: mongoose.Schema.Types.ObjectId, ref: 'Coin', required: true },
    sender : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    reply : { type: String, required: true},
    img: { type:String, default: ""},
    time: {type: Date, default: Date.now}
});

const ReplyModel = mongoose.model('ReplyModel', ReplySchema);

export default ReplyModel;
