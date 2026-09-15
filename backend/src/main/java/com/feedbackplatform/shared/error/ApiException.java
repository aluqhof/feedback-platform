package com.feedbackplatform.shared.error;

/**
 * Base exception for all domain/application errors. Carries a stable machine-readable
 * {@code code} (see docs/API.md §5) and the HTTP status the GlobalExceptionHandler emits.
 * Always rendered as RFC 7807 Problem Details (ADR-015).
 */
public class ApiException extends RuntimeException {

	private final String code;
	private final int status;

	public ApiException(String code, int status, String detail) {
		super(detail);
		this.code = code;
		this.status = status;
	}

	public ApiException(String code, int status, String detail, Throwable cause) {
		super(detail, cause);
		this.code = code;
		this.status = status;
	}

	public String getCode() {
		return code;
	}

	public int getStatus() {
		return status;
	}

	public static ApiException notFound(String code, String detail) {
		return new ApiException(code, 404, detail);
	}

	public static ApiException badRequest(String code, String detail) {
		return new ApiException(code, 400, detail);
	}

	public static ApiException conflict(String code, String detail) {
		return new ApiException(code, 409, detail);
	}
}
