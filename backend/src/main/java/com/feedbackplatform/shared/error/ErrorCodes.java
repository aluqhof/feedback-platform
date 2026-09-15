package com.feedbackplatform.shared.error;

/**
 * Stable, documented error codes (docs/API.md §5). Clients must rely on these codes,
 * never on the human-readable {@code detail}.
 */
public final class ErrorCodes {

	public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
	public static final String UNAUTHENTICATED = "UNAUTHENTICATED";
	public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
	public static final String FORBIDDEN = "FORBIDDEN";
	public static final String ORGANIZATION_NOT_FOUND = "ORGANIZATION_NOT_FOUND";
	public static final String PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND";
	public static final String FEEDBACK_NOT_FOUND = "FEEDBACK_NOT_FOUND";
	public static final String ISSUE_NOT_FOUND = "ISSUE_NOT_FOUND";
	public static final String INVALID_PROJECT_KEY = "INVALID_PROJECT_KEY";
	public static final String RATE_LIMITED = "RATE_LIMITED";
	public static final String PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE";
	public static final String INVALID_INVITATION = "INVALID_INVITATION";
	public static final String SLUG_TAKEN = "SLUG_TAKEN";
	public static final String INVALID_STATE_TRANSITION = "INVALID_STATE_TRANSITION";
	public static final String LAST_OWNER = "LAST_OWNER";
	public static final String INTERNAL_ERROR = "INTERNAL_ERROR";

	private ErrorCodes() {
	}
}
