package com.feedbackplatform.shared.error;

import java.time.Instant;
import java.util.List;

import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Single entry point for all error responses: RFC 7807 Problem Details (ADR-015).
 * Extends the standard members with {@code code} (stable, for clients) and {@code traceId}.
 * Never exposes stack traces or internal messages.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final String TYPE_BASE = "https://feedbackplatform.dev/errors/";
	private static final String CODE_PROPERTY = "code";
	private static final String TRACE_ID_PROPERTY = "traceId";

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ProblemDetail> handleApiException(ApiException ex, HttpServletRequest request) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(
				HttpStatus.valueOf(ex.getStatus()), ex.getMessage() != null ? ex.getMessage() : ex.getCode());
		problem.setType(java.net.URI.create(TYPE_BASE + ex.getCode().toLowerCase().replace('_', '-')));
		problem.setTitle(toTitle(ex.getCode()));
		problem.setProperty(CODE_PROPERTY, ex.getCode());
		problem.setProperty(TRACE_ID_PROPERTY, MDC.get("traceId"));
		problem.setInstance(java.net.URI.create(request.getRequestURI()));
		return ResponseEntity.status(ex.getStatus())
				.contentType(org.springframework.http.MediaType.parseMediaType("application/problem+json"))
				.body(problem);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex,
			HttpServletRequest request) {
		List<FieldViolation> errors = ex.getBindingResult().getFieldErrors().stream()
				.map(GlobalExceptionHandler::toFieldViolation)
				.toList();
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
		problem.setType(java.net.URI.create(TYPE_BASE + "validation"));
		problem.setTitle("Validation failed");
		problem.setProperty(CODE_PROPERTY, ErrorCodes.VALIDATION_ERROR);
		problem.setProperty(TRACE_ID_PROPERTY, MDC.get("traceId"));
		problem.setProperty("errors", errors);
		problem.setInstance(java.net.URI.create(request.getRequestURI()));
		return ResponseEntity.badRequest()
				.contentType(org.springframework.http.MediaType.parseMediaType("application/problem+json"))
				.body(problem);
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ProblemDetail> handleNotFound(NoResourceFoundException ex, HttpServletRequest request) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Resource not found");
		problem.setType(java.net.URI.create(TYPE_BASE + "not-found"));
		problem.setTitle("Not found");
		problem.setProperty(CODE_PROPERTY, "NOT_FOUND");
		problem.setProperty(TRACE_ID_PROPERTY, MDC.get("traceId"));
		problem.setInstance(java.net.URI.create(request.getRequestURI()));
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.contentType(org.springframework.http.MediaType.parseMediaType("application/problem+json"))
				.body(problem);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ProblemDetail> handleGeneric(Exception ex, HttpServletRequest request) {
		// Logged by the infrastructure with traceId; the response never leaks internals.
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(
				HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
		problem.setType(java.net.URI.create(TYPE_BASE + "internal-error"));
		problem.setTitle("Internal server error");
		problem.setProperty(CODE_PROPERTY, ErrorCodes.INTERNAL_ERROR);
		problem.setProperty(TRACE_ID_PROPERTY, MDC.get("traceId"));
		problem.setInstance(java.net.URI.create(request.getRequestURI()));
		return ResponseEntity.internalServerError()
				.contentType(org.springframework.http.MediaType.parseMediaType("application/problem+json"))
				.body(problem);
	}

	private static FieldViolation toFieldViolation(FieldError fe) {
		return new FieldViolation(fe.getField(), fe.getCode(), fe.getDefaultMessage());
	}

	private static String toTitle(String code) {
		String[] words = code.toLowerCase().split("_");
		StringBuilder sb = new StringBuilder();
		for (String w : words) {
			if (w.isEmpty()) {
				continue;
			}
			if (!sb.isEmpty()) {
				sb.append(' ');
			}
			sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1));
		}
		return sb.toString();
	}

	public record FieldViolation(String field, String code, String message) {
	}
}
