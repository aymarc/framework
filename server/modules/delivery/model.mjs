import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const schema = new mongoose.Schema({
    delivery_id: {
        type: String,
        required: true,
        default: uuidv4(),
        unique: true,
    },
    package_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
    },
    pickup_time: {
        type: Date,
        required: true,
    },
    start_time: {
        type: Date,
    },
    end_time: {
        type: Date,
    },
    location: {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        },
    },
    status: {
        type: String,
        required: true,
        enum: ['open', 'picked-up', 'in-transit', 'delivered', 'failed'],
    },
});

export default mongoose.model("Delivery", schema);