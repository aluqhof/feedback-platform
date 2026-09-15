package com.feedbackplatform;

import org.springframework.boot.SpringApplication;

public class TestFeedbackPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.from(FeedbackPlatformApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
