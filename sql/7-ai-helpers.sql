-- AI Helper Functions for Mojo Land v2.0
-- These functions help with schema introspection for AI features

-- Function to get table schema information
CREATE OR REPLACE FUNCTION get_table_schema(table_name TEXT)
RETURNS TABLE (
  column_name TEXT,
  data_type TEXT,
  is_nullable TEXT,
  column_default TEXT,
  character_maximum_length INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT,
    c.column_default::TEXT,
    c.character_maximum_length
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = get_table_schema.table_name
  ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all tables in public schema
CREATE OR REPLACE FUNCTION get_all_tables_schema()
RETURNS TABLE (
  table_name TEXT,
  column_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::TEXT,
    COUNT(c.column_name) as column_count
  FROM information_schema.tables t
  LEFT JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND t.table_schema = c.table_schema
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  GROUP BY t.table_name
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table relationships (foreign keys)
CREATE OR REPLACE FUNCTION get_table_relationships(table_name TEXT)
RETURNS TABLE (
  constraint_name TEXT,
  column_name TEXT,
  foreign_table_name TEXT,
  foreign_column_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.constraint_name::TEXT,
    kcu.column_name::TEXT,
    ccu.table_name::TEXT AS foreign_table_name,
    ccu.column_name::TEXT AS foreign_column_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = get_table_relationships.table_name
    AND tc.table_schema = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute safe SELECT queries (for AI-generated SQL)
-- Note: This should be used with caution and proper validation
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Basic safety check - only allow SELECT statements
  IF LOWER(TRIM(sql_query)) NOT LIKE 'select%' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Prevent dangerous keywords
  IF sql_query ~* '\b(drop|delete|insert|update|alter|create|truncate|grant|revoke)\b' THEN
    RAISE EXCEPTION 'Query contains prohibited keywords';
  END IF;

  -- Execute the query and return as JSON
  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || sql_query || ') t'
  INTO result;

  RETURN COALESCE(result, '[]'::JSONB);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get sample data from a table (for AI context)
CREATE OR REPLACE FUNCTION get_table_sample(
  table_name TEXT,
  limit_rows INTEGER DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  query TEXT;
BEGIN
  -- Build and execute query
  query := format(
    'SELECT jsonb_agg(row_to_json(t)) FROM (SELECT * FROM %I LIMIT %s) t',
    table_name,
    limit_rows
  );

  EXECUTE query INTO result;

  RETURN COALESCE(result, '[]'::JSONB);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'table', table_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table statistics (for AI insights)
CREATE OR REPLACE FUNCTION get_table_stats(table_name TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  query TEXT;
BEGIN
  query := format('SELECT COUNT(*) as total_rows FROM %I', table_name);

  EXECUTE format(
    'SELECT jsonb_build_object(
      ''table_name'', %L,
      ''total_rows'', (SELECT COUNT(*) FROM %I),
      ''columns'', (
        SELECT jsonb_agg(jsonb_build_object(
          ''name'', column_name,
          ''type'', data_type
        ))
        FROM information_schema.columns
        WHERE table_schema = ''public''
          AND table_name = %L
      )
    )',
    table_name,
    table_name,
    table_name
  ) INTO result;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'table', table_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate endpoint configuration
CREATE OR REPLACE FUNCTION validate_endpoint_config(config JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check required fields
  IF NOT (config ? 'endpoint') THEN
    errors := array_append(errors, 'endpoint field is required');
  END IF;

  IF NOT (config ? 'method') THEN
    errors := array_append(errors, 'method field is required');
  END IF;

  -- Validate method
  IF config->>'method' NOT IN ('get', 'post', 'create', 'update', 'delete', 'function', 'data', 'text', 'rpc', 'sql') THEN
    IF config->>'method' NOT LIKE '%,%' THEN
      errors := array_append(errors, 'invalid method specified');
    END IF;
  END IF;

  -- Validate table exists if specified
  IF config ? 'table' THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = config->>'table'
    ) THEN
      errors := array_append(errors, format('table "%s" does not exist', config->>'table'));
    END IF;
  END IF;

  -- Build result
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  ELSE
    result := jsonb_build_object(
      'valid', true,
      'errors', '[]'::JSONB
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
-- Uncomment these if you want to restrict access

-- GRANT EXECUTE ON FUNCTION get_table_schema(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_all_tables_schema() TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_table_relationships(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_table_sample(TEXT, INTEGER) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_table_stats(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION validate_endpoint_config(JSONB) TO authenticated;

COMMENT ON FUNCTION get_table_schema IS 'Returns schema information for a specific table';
COMMENT ON FUNCTION get_all_tables_schema IS 'Returns list of all tables with column counts';
COMMENT ON FUNCTION get_table_relationships IS 'Returns foreign key relationships for a table';
COMMENT ON FUNCTION execute_sql IS 'Safely executes SELECT queries (AI-generated SQL)';
COMMENT ON FUNCTION get_table_sample IS 'Returns sample data from a table for AI context';
COMMENT ON FUNCTION get_table_stats IS 'Returns statistics about a table';
COMMENT ON FUNCTION validate_endpoint_config IS 'Validates endpoint configuration JSON';
