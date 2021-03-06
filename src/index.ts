import { Schema } from "joi";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { RequestHandler, NextHandler } from "next-connect";

export type ValidableRequestFields = Pick<NextApiRequest, "query" | "body">;

export type ValidationSchemas = {
  [K in keyof ValidableRequestFields]?: Schema;
};

export default function withJoi(schemas: ValidationSchemas): RequestHandler<NextApiRequest, NextApiResponse>;
export default function withJoi(schemas: ValidationSchemas, handler: NextApiHandler): NextApiHandler;
export default function withJoi(
  schemas: ValidationSchemas,
  handler?: NextApiHandler
): NextApiHandler | RequestHandler<NextApiRequest, NextApiResponse> {
  return (req: NextApiRequest, res: NextApiResponse, next?: NextHandler) => {
    const fields: (keyof ValidableRequestFields)[] = ["body", "query"];

    const hasValidationErrors = fields.some((field) => {
      const schema = schemas[field];

      return schema && schema.required().validate(req[field]).error;
    });

    if (hasValidationErrors) {
      return res.status(400).end();
    }

    if (undefined !== next) {
      return next();
    }

    if (undefined !== handler) {
      return handler(req, res);
    }

    res.status(404).end();
  };
}
