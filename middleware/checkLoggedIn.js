import { ERROR } from "../constants/status.code.js";
import { decode } from "../utils/jwt.js";

export default function (req, res, next) {
  console.log("Request Type:", req.method);
  const decodedToken = decode(req.headers.token);
  if (decodedToken && !decodedToken.error) {
    req.headers.id = decodedToken.value.id;
    next();
  } else {
    res.send({
      status: ERROR.UNAUTHORIZED,
    });
  }
}
