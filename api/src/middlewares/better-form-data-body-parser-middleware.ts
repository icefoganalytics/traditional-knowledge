import { type NextFunction, type Request, type Response } from "express"

import objectValueDecoder from "@/utils/object-value-decoder"

export function betterFormDataBodyParserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (
    req.headers["content-type"]?.includes("multipart/form-data") &&
    req.body &&
    typeof req.body === "object"
  ) {
    req.body = objectValueDecoder(req.body)
  }
  next()
}

export default betterFormDataBodyParserMiddleware
