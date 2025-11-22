package com.roastive.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long start = System.currentTimeMillis();
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        String uri = request.getRequestURI();
        String method = request.getMethod();
        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            String reqBody = extractRequestBody(wrappedRequest);
            String resBody = extractResponseBody(wrappedResponse);
            int status = wrappedResponse.getStatus();
            if (isMutedEndpoint(uri)) {
                // Quiet endpoints: do not log request/response bodies or access lines
                wrappedResponse.copyBodyToResponse();
                return;
            }
            if (isSensitiveEndpoint(uri)) {
                // 민감 엔드포인트는 바디 미노출
                log.info("{} {} status={} elapsedMs={} reqBody=[redacted] resBody=[redacted]", method, uri, status, elapsed);
            } else {
                String maskedReq = truncate(redactSensitive(reqBody));
                String maskedRes = truncate(redactSensitive(resBody));
                log.info("{} {} status={} elapsedMs={} reqBody={} resBody={}", method, uri, status, elapsed, maskedReq, maskedRes);
            }
            wrappedResponse.copyBodyToResponse();
        }
    }

    private String extractRequestBody(ContentCachingRequestWrapper request) {
        byte[] buf = request.getContentAsByteArray();
        if (buf == null || buf.length == 0) return "";
        return new String(buf, StandardCharsets.UTF_8);
    }

    private String extractResponseBody(ContentCachingResponseWrapper response) {
        byte[] buf = response.getContentAsByteArray();
        if (buf == null || buf.length == 0) return "";
        return new String(buf, StandardCharsets.UTF_8);
    }

    private String truncate(String s) {
        if (s == null) return "";
        int max = 2000; // avoid overly large logs
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }

    private boolean isSensitiveEndpoint(String uri) {
        if (uri == null) return false;
        return uri.startsWith("/api/auth");
    }

    private boolean isMutedEndpoint(String uri) {
        if (uri == null) return false;
        // Suppress logs for code set lookups
        return uri.startsWith("/v2/code-sets") || uri.startsWith("/v2/codes");
    }

    private String redactSensitive(String body) {
        if (body == null || body.isEmpty()) return body;
        String masked = body;
        // "password":"..." -> masked
        masked = masked.replaceAll("(?i)\\\"password\\\"\\s*:\\s*\\\"[^\\\"]*\\\"", "\"password\":\"****\"");
        // "token":"..." -> masked
        masked = masked.replaceAll("(?i)\\\"token\\\"\\s*:\\s*\\\"[^\\\"]*\\\"", "\"token\":\"****\"");
        // "authorization":"..." -> masked if appears in bodies
        masked = masked.replaceAll("(?i)\\\"authorization\\\"\\s*:\\s*\\\"[^\\\"]*\\\"", "\"authorization\":\"****\"");
        return masked;
    }
}


