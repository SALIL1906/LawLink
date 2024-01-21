import express, { response } from "express";
import mongoose from "mongoose";
import { ERROR, SUCCESS } from "../constants/status.code.js";
import checkLoggedIn from "../middleware/checkLoggedIn.js";
import { ClientModel } from "../models/client.model.js";
import { compare, encrypt } from "../utils/bcrypt.js";
import { encode } from "../utils/jwt.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const uid = mongoose.Types.ObjectId();
    let clientDetails = { ...req.body.clientDetails, _id: uid };
    clientDetails.password = await encrypt(clientDetails.password);
    const client = await ClientModel.findOneAndUpdate(
      { email: req.body.clientDetails.email },
      { $setOnInsert: clientDetails },
      { upsert: true, new: false }
    );
    if (client) {
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
    const client = await ClientModel.findOne({
      email: req.headers.email,
    });
    if (client && (await compare(req.headers.password, client.password))) {
      res.send({
        id: encode(client["_id"]),
        status: SUCCESS.CLIENT_LOGIN_SUCCESSFUL,
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
      content: await ClientModel.findOneAndUpdate(
        { _id: req.headers.id },
        { ...req.body.clientDetails },
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
      content: await ClientModel.findOneAndDelete({ _id: req.headers.id }),
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
      content: await ClientModel.find({
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
