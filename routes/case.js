import express, { response } from "express";
import { ERROR, SUCCESS } from "../constants/status.code.js";
import checkLoggedIn from "../middleware/checkLoggedIn.js";
import { CaseModel } from "../models/case.model.js";
import { LawyerModel } from "../models/lawyer.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const caseDetails = { ...req.body.caseDetails, client: req.headers.id };
    return res.send({
      content: await CaseModel.create(caseDetails),
      status: SUCCESS.CASE_CREATE_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.VALIDATION_ERROR,
    });
  }
});

router.put("/", async (req, res) => {
  try {
    const caseDetails = { ...req.body.caseDetails, client: req.headers.id };
    return res.send({
      content: await CaseModel.findOneAndUpdate(
        { email: caseDetails.email },
        caseDetails,
        { new: true }
      ),
      status: SUCCESS.CASE_UPDATE_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.NOT_FOUND_ERROR,
    });
  }
});

router.delete("/", async (req, res) => {
  try {
    const caseDetails = { ...req.body.caseDetails, client: req.headers.id };
    return res.send({
      content: await CaseModel.findOneAndDelete(
        { email: caseDetails.email },
        caseDetails
      ),
      status: SUCCESS.CASE_REMOVE_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.NOT_FOUND_ERROR,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    return res.send({
      content: await CaseModel.find({}),
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

// For lawyer to check personalized cases
router.get("/lawyer", async (req, res) => {
  try {
    const id = req.headers.id;
    const lawyer = await LawyerModel.findOne({
      _id: id,
    });
    if (lawyer) {
      const expertise = lawyer.expertise || [];
      try {
        res.send({
          content: (
            await CaseModel.find({
              caseTags: {
                $in: expertise,
              },
            })
          ).reverse(),
          status: SUCCESS.LAWYER_CASE_FETCH_SUCCESSFUL,
        });
      } catch (error) {
        res.send({
          status: ERROR.DATABASE_ERROR,
        });
      }
    } else {
      res.send({
        status: ERROR.NOT_FOUND_ERROR,
      });
    }
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

// For client to check all their cases.
router.get("/client/id", async (req, res) => {
  console.log(req.headers);
  try {
    res.send({
      content: (
        await CaseModel.find({
          client: req.headers.id,
        })
      ).reverse(),
      status: SUCCESS.CLIENT_CASE_FETCH_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

// For lawyers to check all their applied cases.
router.get("/lawyer/id", async (req, res) => {
  try {
    res.send({
      content: (
        await CaseModel.find({
          $or: [
            { lawyer: req.headers.id },
            { requests: { lawyer: req.headers.id } },
          ],
        })
      ).reverse(),
      status: SUCCESS.LAWYER_CASE_FETCH_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

// Request for a case
router.post("/lawyer/request", async (req, res) => {
  try {
    console.log(req.headers.id);
    res.send({
      content: await CaseModel.findOneAndUpdate(
        {
          _id: req.headers.caseid,
          $and: [
            { "requests.lawyer": { $ne: req.headers.id } },
            { lawyer: { $ne: req.headers.id } },
          ],
        },
        {
          $push: {
            requests: {
              lawyer: req.headers.id,
              visible: true,
            },
          },
        },
        {
          new: true,
        }
      ),
      status: SUCCESS.LAWYER_REQUEST_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

// Accept for a request (Client)
router.post("/client/accept", async (req, res) => {
  try {
    res.send({
      content: await CaseModel.findOneAndUpdate(
        { $and: [{ _id: req.headers.caseid }, { client: req.headers.id }] },
        {
          lawyer: req.body.lawyer,
          $pull: { requests: { lawyer: req.body.lawyer } },
        },
        {
          new: true,
        }
      ),
      status: SUCCESS.LAWYER_REQUEST_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

// Ignore for a request (Client)
router.post("/client/ignore", async (req, res) => {
  try {
    res.send({
      content: await CaseModel.findOneAndUpdate(
        {
          _id: req.headers.caseid,
          client: req.headers.id,
          "requests.lawyer": req.body.lawyer,
        },
        {
          $set: {
            "requests.$.visible": false,
          },
        },
        {
          new: true,
        }
      ),
      status: SUCCESS.CLIENT_CASE_REQUEST_IGNORE_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

// To get all the details of the case
router.get("/id", async (req, res) => {
  try {
    res.send({
      content: await CaseModel.findOne({
        _id: req.headers.caseid,
      }).populate("client lawyer requests.lawyer"),
      status: SUCCESS.CLIENT_CASE_FETCH_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

router.get("/id/check", async (req, res) => {
  try {
    res.send({
      content: await CaseModel.findOne({
        _id: req.headers.caseid,
        client: req.headers.id,
      }).populate("client lawyer requests.lawyer"),
      status: SUCCESS.CLIENT_CASE_FETCH_SUCCESSFUL,
    });
  } catch (error) {
    res.send({
      status: ERROR.DATABASE_ERROR,
    });
  }
});

export default router;
