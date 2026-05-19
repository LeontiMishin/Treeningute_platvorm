import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../utils/api-error";

type RequestSource = "body" | "params" | "query";

export function validate(schema: ZodTypeAny, source: RequestSource = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[source]);

    if (!parsed.success) {
      return next(
        new ApiError(400, "Validation failed.", parsed.error.flatten()),
      );
    }

    (req as Request & Record<RequestSource, unknown>)[source] = parsed.data;
    return next();
  };
}

