import pkg from "mongoose";
const { model, Schema, Types } = pkg;

const schema = new Schema(
  {
    name: { type: String },
    location: { type: String },
    mobile: { type: String },
    password: { type: String },
    email: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ClientModel = model("client", schema);
