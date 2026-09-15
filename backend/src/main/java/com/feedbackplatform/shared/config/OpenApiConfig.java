package com.feedbackplatform.shared.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;

/**
 * OpenAPI metadata for the generated /v3/api-docs document (ADR-016: frontend types
 * are generated from this schema, so it must stay accurate).
 */
@Configuration
@OpenAPIDefinition(info = @Info(title = "Feedback Platform API", version = "v1",
		description = "Feedback Platform backend API. Dashboard: /api/v1 (cookie-authenticated). "
				+ "Public ingestion: /api/public/v1 (publicKey)."),
		servers = { @Server(url = "/", description = "current") })
public class OpenApiConfig {
}
