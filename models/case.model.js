import pkg from "mongoose";
import { CASE_TAGS } from "../constants/case.js";
const { model, Schema, Types } = pkg;

const schema = new Schema(
  {
    lawyer: { type: Types.ObjectId, ref: "lawyer", required: false },
    client: { type: Types.ObjectId, ref: "client" },
    requests: [
      {
        lawyer: { type: Types.ObjectId, ref: "lawyer", required: false },
        visible: { type: Boolean, default: true },
      },
    ],
    caseTags: [{ type: String, enum: CASE_TAGS }],
    caseName: { type: String },
    caseDescription: { type: String },
  },
  {
    timestamps: true,
  }
);

export const CaseModel = model("case", schema);
