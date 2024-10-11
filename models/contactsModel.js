
import { Schema, model } from "mongoose";

// reference: https://mongoosejs.com/docs/api/schema.html

const contactSchema = new Schema( 
        {
        name: {
            type: String,
            required: [true, "Set name for contact"],
        },
        email: {
            type: String,
            required: [true, "Set email for contact"],
        },
        phone: {
            type: String,
            required: [true, "Set phone for contact"],
        },
        favorite: {
            type: Boolean,
            default: false,
        },
    },
    {versionKey: false}
);

const Contact = model("contact", contactSchema);

export { Contact };