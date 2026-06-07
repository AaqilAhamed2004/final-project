package com.aura.controller;

import com.aura.schema.User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.Collections;

public class WithMockCustomUserSecurityContextFactory implements WithSecurityContextFactory<WithMockCustomUser> {
    @Override
    public SecurityContext createSecurityContext(WithMockCustomUser customUser) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        User user = User.builder()
                .id(customUser.id())
                .email(customUser.email())
                .fullName(customUser.fullName())
                .role(customUser.role())
                .isActive(customUser.isActive())
                .build();

        String role = customUser.role().toUpperCase();
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, Collections.singletonList(authority));
        context.setAuthentication(auth);
        return context;
    }
}
