import jwt from "json-web-token";

export function encode(id) {
  const payload = { id };
  const SECRET = process.env.SECRET_KEY;
  return jwt.encode(SECRET, payload).value;
}

export function decode(token) {
  const SECRET = process.env.SECRET_KEY;
  try {
    return jwt.decode(SECRET, token);
  } catch (error) {
    return false;
  }
}
