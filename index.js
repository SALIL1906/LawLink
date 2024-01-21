import express from "express";
import CaseRoute from "./routes/case.js";
import LawyerRoute from "./routes/lawyer.js";
import ClientRoute from "./routes/client.js";
import AuthRoute from "./routes/auth.js";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import checkLoggedIn from "./middleware/checkLoggedIn.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

mongoose.connect(process.env.MONGO_CONNECTION_URL, () => {
  console.log("Connected to DB");
});

app.use("/case", [checkLoggedIn], CaseRoute);
app.use("/client", ClientRoute);
app.use("/lawyer", LawyerRoute);
app.use("/auth", AuthRoute);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
