package com.aura.controller;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockCustomUserSecurityContextFactory.class)
public @interface WithMockCustomUser {
    String id() default "user-001";
    String email() default "gnofficer@aura.gov";
    String fullName() default "GN Officer Prime";
    String role() default "gn_officer";
    boolean isActive() default true;
}
