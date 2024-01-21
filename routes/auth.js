import express from "express";
import { ERROR, SUCCESS } from "../constants/status.code.js";
import { USER } from "../constants/user.js";
import checkLoggedIn from "../middleware/checkLoggedIn.js";

import { ClientModel } from "../models/client.model.js";
import { LawyerModel } from "../models/lawyer.model.js";

const router = express.Router();

router.get("/verify", [checkLoggedIn], async (req, res) => {
  try {
    const id = req.headers.id;
    const client = await ClientModel.findOne({ _id: id });
    if (client) {
      res.send({
        status: SUCCESS.TOKEN_VALIDATION_SUCCESSFUL,
        userType: USER.CLIENT,
      });
    } else {
      const lawyer = await LawyerModel.findOne({ _id: id });
      if (lawyer) {
        res.send({
          status: SUCCESS.TOKEN_VALIDATION_SUCCESSFUL,
          userType: USER.LAWYER,
        });
      } else {
        res.send({
          status: ERROR.NOT_FOUND_ERROR,
        });
      }
    }
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

export default router;
