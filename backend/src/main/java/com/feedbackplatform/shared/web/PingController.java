package com.feedbackplatform.shared.web;

import java.time.Instant;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Liveness/ping endpoint for Phase 0. No business logic.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health")
public class PingController {

	public record PingResponse(String status, Instant timestamp) {
	}

	@GetMapping("/ping")
	@Operation(summary = "Liveness ping", operationId = "ping")
	public PingResponse ping() {
		return new PingResponse("ok", Instant.now());
	}
}
