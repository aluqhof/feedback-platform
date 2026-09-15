package com.feedbackplatform.shared.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.net.URI;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Verifies the RFC 7807 Problem Details contract (ADR-015): code + traceId extensions,
 * validation errors array, and a 500 that never leaks internals.
 */
@WebMvcTest
@Import({ GlobalExceptionHandler.class, GlobalExceptionHandlerTest.TestController.class,
		GlobalExceptionHandlerTest.PermitAllSecurity.class, com.feedbackplatform.shared.web.RequestIdFilter.class })
class GlobalExceptionHandlerTest {

	@Autowired
	private MockMvc mockMvc;

	@RestController
	@RequestMapping("/test")
	static class TestController {

		@GetMapping("/api-error")
		public void apiError() {
			throw ApiException.notFound("FEEDBACK_NOT_FOUND", "Feedback 0190 was not found");
		}

		@GetMapping("/boom")
		public void boom() {
			throw new IllegalStateException("secret internals");
		}
	}

	@org.springframework.boot.test.context.TestConfiguration(proxyBeanMethods = false)
	static class PermitAllSecurity {
		@org.springframework.context.annotation.Bean
		SecurityFilterChain permitAll(HttpSecurity http) throws Exception {
			return http.authorizeHttpRequests(a -> a.anyRequest().permitAll())
					.csrf(c -> c.disable())
					.build();
		}
	}

	@Test
	void apiExceptionBecomesProblemDetailWithCode() throws Exception {
		mockMvc.perform(get("/test/api-error"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.type").value("https://feedbackplatform.dev/errors/feedback-not-found"))
				.andExpect(jsonPath("$.title").value("Feedback Not Found"))
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.code").value("FEEDBACK_NOT_FOUND"))
				.andExpect(jsonPath("$.detail").value("Feedback 0190 was not found"))
				.andExpect(jsonPath("$.instance").value("/test/api-error"))
				.andExpect(jsonPath("$.traceId").isNotEmpty());
	}

	@Test
	void unexpectedExceptionBecomes500WithoutInternals() throws Exception {
		mockMvc.perform(get("/test/boom"))
				.andExpect(status().isInternalServerError())
				.andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
				.andExpect(jsonPath("$.detail").value("An unexpected error occurred"))
				.andExpect(jsonPath("$.traceId").isNotEmpty());
	}

	@Test
	void contentTypeIsProblemJson() throws Exception {
		mockMvc.perform(get("/test/api-error"))
				.andExpect(status().isNotFound())
				.andExpect(result -> org.assertj.core.api.Assertions.assertThat(
						result.getResponse().getContentType()).startsWith("application/problem+json"));
	}
}
