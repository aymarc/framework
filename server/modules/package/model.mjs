import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const schema = new mongoose.Schema({
    package_id: {
        type: String,
        required: true,
        default: uuidv4(),
        unique: true,
    },
    active_delivery_id: {
        type: String,
        ref: 'Delivery',
    },
    description: {
        type: String,
    },
    weight: {
        type: Number,
        required: true,
    },
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    depth: {
        type: Number,
        required: true,
    },
    from_name: {
        type: String,
        required: true,
    },
    from_address: {
        type: String,
        required: true,
    },
    from_location: {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        },
    },
    to_name: {
        type: String,
        required: true,
    },
    to_address: {
        type: String,
        required: true,
    },
    to_location: {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        },
    },
});
export default mongoose.model("Package", schema);