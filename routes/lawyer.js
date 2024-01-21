import express, { response } from "express";
import mongoose from "mongoose";
import { ERROR, SUCCESS } from "../constants/status.code.js";
import checkLoggedIn from "../middleware/checkLoggedIn.js";
import { LawyerModel } from "../models/lawyer.model.js";
import { compare, encrypt } from "../utils/bcrypt.js";
import { encode } from "../utils/jwt.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const uid = mongoose.Types.ObjectId();
    let lawyerDetails = { ...req.body.lawyerDetails, _id: uid };
    lawyerDetails.password = await encrypt(lawyerDetails.password);
    const lawyer = await LawyerModel.findOneAndUpdate(
      { email: req.body.lawyerDetails.email },
      { $setOnInsert: lawyerDetails },
      { upsert: true, new: false }
    );
    if (lawyer) {
      res.send({
        status: ERROR.EMAIL_ID_EXISTS,
      });
    } else {
      res.send({
        id: encode(uid),
        status: SUCCESS.CLIENT_CREATE_SUCCESSFUL,
      });
    }
  } catch (error) {
    res.send({
      status: ERROR.VALIDATION_ERROR,
    });
  }
});

router.get("/login", async (req, res) => {
  try {
    const lawyer = await LawyerModel.findOne({
      email: req.headers.email,
    });
    if (lawyer && (await compare(req.headers.password, lawyer.password))) {
      res.send({
        id: encode(lawyer["_id"]),
        status: SUCCESS.LAWYER_LOGIN_SUCCESSFUL,
      });
    } else {
      res.send({
        status: ERROR.VALIDATION_ERROR,
      });
    }
  } catch (error) {
    res.send({
      status: ERROR.VALIDATION_ERROR,
    });
  }
});

router.put("/", [checkLoggedIn], async (req, res) => {
  try {
    return res.send({
      content: await LawyerModel.findOneAndUpdate(
        { _id: req.headers.id },
        { ...req.body.lawyerDetails },
        { new: true }
      ),
      status: SUCCESS.CLIENT_UPDATE_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.NOT_FOUND_ERROR,
    });
  }
});

router.delete("/", [checkLoggedIn], async (req, res) => {
  try {
    return res.send({
      content: await LawyerModel.findOneAndDelete({ _id: req.headers.id }),
      status: SUCCESS.CLIENT_REMOVE_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.NOT_FOUND_ERROR,
    });
  }
});

router.get("/id", [checkLoggedIn], async (req, res) => {
  try {
    return res.send({
      content: await LawyerModel.find({
        _id: req.headers.id,
      }),
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

export default router;
