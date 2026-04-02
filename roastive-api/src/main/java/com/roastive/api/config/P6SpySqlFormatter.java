package com.roastive.api.config;

import com.p6spy.engine.spy.appender.MessageFormattingStrategy;

import java.util.regex.Pattern;

/**
 * Formats SQL logs emitted by P6Spy so that final SQL with resolved parameter values
 * is printed in a consistent, multi-line style.
 */
public class P6SpySqlFormatter implements MessageFormattingStrategy {

    private static final Pattern APP_MENU_PATTERN = Pattern.compile("\\bapp_menu\\b", Pattern.CASE_INSENSITIVE);

    @Override
    public String formatMessage(int connectionId, String now, long elapsed, String category, String prepared, String sql, String url) {
        String statement = (sql == null || sql.isBlank()) ? prepared : sql;
        if (statement == null || statement.isBlank()) {
            return "";
        }
        if (APP_MENU_PATTERN.matcher(statement).find()) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        builder.append('\n')
            .append("=== SQL[").append(category).append("] (").append(elapsed).append(" ms) ===\n")
            .append(statement.trim()).append('\n')
            .append("----------------------------------------------------\n")
            .append("connectionId=").append(connectionId);
        if (url != null && !url.isBlank()) {
            builder.append(" | url=").append(url);
        }
        builder.append('\n').append("====================================================\n");
        return builder.toString();
    }
}











