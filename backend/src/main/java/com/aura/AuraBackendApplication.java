package com.aura;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AuraBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuraBackendApplication.class, args);
	}

}
