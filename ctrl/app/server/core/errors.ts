import { TRPCError } from "@trpc/server";

export class InternalError extends TRPCError {
  constructor(
    public code:
      | "PARSE_ERROR"
      | "BAD_REQUEST"
      | "INTERNAL_SERVER_ERROR"
      | "NOT_IMPLEMENTED"
      | "BAD_GATEWAY"
      | "SERVICE_UNAVAILABLE"
      | "GATEWAY_TIMEOUT"
      | "UNAUTHORIZED"
      | "PAYMENT_REQUIRED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "METHOD_NOT_SUPPORTED"
      | "TIMEOUT"
      | "CONFLICT"
      | "PRECONDITION_FAILED"
      | "PAYLOAD_TOO_LARGE"
      | "UNSUPPORTED_MEDIA_TYPE"
      | "UNPROCESSABLE_CONTENT"
      | "TOO_MANY_REQUESTS"
      | "CLIENT_CLOSED_REQUEST",
    public message: string,
    public cause?: Error
  ) {
    super({ code, message, cause });
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <review>
export function wrapErrors<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
      // biome-ignore lint/suspicious/noExplicitAny: <review>
    } catch (error: any) {
      console.log(error);
      if (error instanceof TRPCError) {
        throw error;
      }

      if (error instanceof InternalError){
        throw error
      }

      if (error?.code && error.code === "P2002") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: error,
          message: "cannot reuse the same values",
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
        message: "something went wrong",
      });
    }
  };
}
