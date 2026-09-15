package com.feedbackplatform.shared.web;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Generates or propagates {@code X-Request-Id} and puts it in the MDC as {@code traceId}
 * so every log line of the request is correlatable. The id is always echoed back in the response.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

	public static final String REQUEST_ID_HEADER = "X-Request-Id";
	public static final String TRACE_ID_MDC_KEY = "traceId";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String requestId = normalize(request.getHeader(REQUEST_ID_HEADER));
		try {
			MDC.put(TRACE_ID_MDC_KEY, requestId);
			response.setHeader(REQUEST_ID_HEADER, requestId);
			filterChain.doFilter(request, response);
		}
		finally {
			MDC.remove(TRACE_ID_MDC_KEY);
		}
	}

	private static String normalize(String incoming) {
		if (incoming == null || incoming.isBlank() || incoming.length() > 128 || !incoming.matches("[\\w-]+")) {
			return UUID.randomUUID().toString();
		}
		return incoming;
	}
}
