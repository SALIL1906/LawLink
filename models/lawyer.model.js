import pkg from "mongoose";
import { CASE_TAGS } from "../constants/case.js";
const { model, Schema, Types } = pkg;

const schema = new Schema(
  {
    name: { type: String },
    location: { type: String },
    mobile: { type: String },
    password: { type: String },
    email: { type: String },
    expertise: [{ type: String, enum: CASE_TAGS }],
    bio: { type: String, required: false },
    pastCases: [{ type: String, required: false }],
  },
  {
    timestamps: true,
  }
);

export const LawyerModel = model("lawyer", schema);
