package com.feedbackplatform.shared.web;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Slice test for the Phase 0 ping endpoint + request-id correlation.
 */
@WebMvcTest(PingController.class)
@Import({ RequestIdFilter.class, PingControllerTest.PermitAllSecurity.class })
class PingControllerTest {

	/**
	 * Phase 0: mirrors the production SecurityConfig (permitAll) until authentication
	 * lands in Phase 1; otherwise the @WebMvcTest default security answers 401.
	 */
	@TestConfiguration(proxyBeanMethods = false)
	static class PermitAllSecurity {
		@org.springframework.context.annotation.Bean
		SecurityFilterChain permitAll(HttpSecurity http) throws Exception {
			return http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
					.csrf(csrf -> csrf.disable())
					.build();
		}
	}

	private static final String UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

	@Autowired
	private MockMvc mockMvc;

	@Test
	void pingReturnsOkWithTimestamp() throws Exception {
		mockMvc.perform(get("/api/v1/ping"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("ok"))
				.andExpect(jsonPath("$.timestamp").isNotEmpty());
	}

	@Test
	void generatesRequestIdWhenMissing() throws Exception {
		mockMvc.perform(get("/api/v1/ping"))
				.andExpect(header().string(RequestIdFilter.REQUEST_ID_HEADER, matchesPattern(UUID_PATTERN)));
	}

	@Test
	void propagatesIncomingRequestId() throws Exception {
		mockMvc.perform(get("/api/v1/ping").header(RequestIdFilter.REQUEST_ID_HEADER, "my-correlation-id-123"))
				.andExpect(header().string(RequestIdFilter.REQUEST_ID_HEADER, "my-correlation-id-123"));
	}

	@Test
	void rejectsMalformedRequestIdAndGeneratesNewOne() throws Exception {
		mockMvc.perform(get("/api/v1/ping").header(RequestIdFilter.REQUEST_ID_HEADER, "bad id with spaces!\n"))
				.andExpect(header().string(RequestIdFilter.REQUEST_ID_HEADER, matchesPattern(UUID_PATTERN)));
	}
}
