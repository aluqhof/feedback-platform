import { describe, it, expect } from "vitest";
import { ApiError, getFieldErrors } from "@/lib/api/client";
import type { ProblemDetail } from "@/types/api";

describe("ApiError", () => {
  it("creates an error from a ProblemDetail", () => {
    const problem: ProblemDetail = {
      type: "https://feedbackplatform.dev/errors/validation",
      title: "Validation failed",
      status: 400,
      code: "VALIDATION_ERROR",
      errors: [
        { field: "title", code: "SIZE", message: "must be ≤ 200 chars" },
      ],
      traceId: "abc123",
    };

    const error = new ApiError(problem);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe("ApiError");
    expect(error.message).toBe("Validation failed");
    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.traceId).toBe("abc123");
    expect(error.errors).toHaveLength(1);
    expect(error.errors?.[0].field).toBe("title");
    expect(error.problemDetail).toBe(problem);
  });
});

describe("getFieldErrors", () => {
  it("extracts field errors from an ApiError", () => {
    const problem: ProblemDetail = {
      type: "https://feedbackplatform.dev/errors/validation",
      title: "Validation failed",
      status: 400,
      code: "VALIDATION_ERROR",
      errors: [
        { field: "email", code: "FORMAT", message: "Invalid email" },
        { field: "password", code: "SIZE", message: "Too short" },
      ],
    };

    const error = new ApiError(problem);
    const fieldErrors = getFieldErrors(error);

    expect(fieldErrors).toEqual({
      email: "Invalid email",
      password: "Too short",
    });
  });

  it("returns empty object when no errors", () => {
    const problem: ProblemDetail = {
      type: "about:blank",
      title: "Not found",
      status: 404,
      code: "NOT_FOUND",
    };

    const error = new ApiError(problem);
    const fieldErrors = getFieldErrors(error);

    expect(fieldErrors).toEqual({});
  });
});
