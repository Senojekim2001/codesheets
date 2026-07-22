export const meta = {
  title: 'Snowflake — Cloud Data Platform',
  domain: 'sql',
  sheet: 'snowflake',
  icon: '❄️',
}

export const sections = [

  // ── Section 1: Warehouses & Compute ─────────────────────────────────────────
  {
    id: 'warehouses',
    title: 'Warehouses & Compute Management',
    entries: [
      {
        id: 'warehouse-management',
        fn: 'CREATE WAREHOUSE — size, scaling, auto-suspend',
        desc: 'A warehouse is the compute cluster that executes SQL statements. Size determines per-query power; scaling policy determines multi-cluster behavior.',
        category: 'Compute',
        subtitle: 'CREATE WAREHOUSE, ALTER WAREHOUSE, size tiers, auto-suspend, auto-resume, scaling policy',
        signature: "CREATE WAREHOUSE my_wh WITH WAREHOUSE_SIZE = 'MEDIUM' AUTO_SUSPEND = 60 AUTO_RESUME = TRUE INITIALLY_SUSPENDED = TRUE",
        descLong: 'Warehouses are Snowflake\'s compute units — clusters of CPU/GPU resources that run queries. Sizes range from X-Small (1 credit/hour) to 6X-Large (512 credits/hour), doubling at each step. Multi-cluster warehouses (max/min cluster count) enable concurrent query handling. Auto-suspend parks the warehouse after N seconds of inactivity (billing stops). Auto-resume wakes it on the next query. Scaling policy (STANDARD or ECONOMY) controls how aggressively new clusters spin up.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create a basic warehouse and understand size tiers.
-- APPROACH  - Use CREATE WAREHOUSE with a fixed size and auto-suspend.
-- STRENGTHS - Simple; covers the most common configuration.
-- WEAKNESSES- No scaling; single cluster only.

-- Size tiers: X-Small, Small, Medium, Large, X-Large, 2X-Large ... 6X-Large
-- Each step doubles compute power and credit cost
CREATE WAREHOUSE dev_wh
  WITH WAREHOUSE_SIZE = 'X-SMALL'
  AUTO_SUSPEND = 60        -- seconds idle before suspending
  AUTO_RESUME = TRUE       -- auto-wake on next query
  INITIALLY_SUSPENDED = TRUE;

-- Switch the current session to use this warehouse
USE WAREHOUSE dev_wh;

-- Resize later
ALTER WAREHOUSE dev_wh SET WAREHOUSE_SIZE = 'SMALL';

-- Check running queries on this warehouse
SHOW WARELOADS;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Configure a multi-cluster warehouse for concurrency.
-- APPROACH  - Set MIN/MAX cluster count and scaling policy.
-- STRENGTHS - Handles concurrent workloads; cost-controlled.
-- WEAKNESSES- More credits consumed when scaling out; monitoring needed.

-- Multi-cluster warehouse: 1-4 clusters, economy scaling
CREATE WAREHOUSE prod_wh
  WITH WAREHOUSE_SIZE = 'LARGE'
  MIN_CLUSTER_COUNT = 1
  MAX_CLUSTER_COUNT = 4
  SCALING_POLICY = 'ECONOMY'   -- waits ~6 min before adding clusters
  AUTO_SUSPEND = 300
  AUTO_RESUME = TRUE;

-- ECONOMY: conservatively adds clusters (good for cost)
-- STANDARD: aggressively adds clusters (good for performance)

-- Monitor warehouse load over time
SELECT *
FROM TABLE(INFORMATION_SCHEMA.WAREHOUSE_LOAD_HISTORY(
  NAME => 'PROD_WH',
  DATE_RANGE_START => '2024-01-01'::timestamp,
  DATE_RANGE_END => '2024-01-31'::timestamp
));

-- Check credit usage by warehouse
SELECT WAREHOUSE_NAME, SUM(CREDITS_USED) AS total_credits
FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY
WHERE START_TIME >= DATEADD(month, -1, CURRENT_DATE())
GROUP BY WAREHOUSE_NAME
ORDER BY total_credits DESC;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Optimize warehouse sizing with query history and resource monitors.
-- APPROACH  - Analyze query patterns, set resource monitors, use query acceleration.
-- STRENGTHS - Cost-optimized; prevents runaway credit usage; leverages QAS.
-- WEAKNESSES- Requires ongoing monitoring and tuning.

-- Query Acceleration Service: offload parts of queries to serverless compute
ALTER WAREHOUSE prod_wh SET
  ENABLE_QUERY_ACCELERATION = TRUE
  QUERY_ACCELERATION_MAX_SCALE_FACTOR = 8;  -- up to 8x serverless boost

-- Resource monitor: cap monthly credits
CREATE RESOURCE MONITOR monthly_cap
  WITH CREDIT_QUOTA = 5000
  FREQUENCY = 'MONTHLY'
  START_TIMESTAMP = '2024-01-01T00:00:00Z'
  NOTIFY_USERS = ('DBA_TEAM')
  TRIGGERS
    ON 80 PERCENT DO NOTIFY
    ON 100 PERCENT DO SUSPEND
    ON 110 PERCENT DO SUSPEND_IMMEDIATE;

-- Attach monitor to warehouse
ALTER ACCOUNT SET RESOURCE_MONITOR = monthly_cap;

-- Find queries that spilled to disk (need bigger warehouse or better clustering)
SELECT QUERY_ID, QUERY_TEXT, BYTES_SPILLED_TO_LOCAL_STORAGE, BYTES_SPILLED_TO_REMOTE_STORAGE
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE WAREHOUSE_NAME = 'PROD_WH'
  AND BYTES_SPILLED_TO_REMOTE_STORAGE > 0
  AND START_TIME >= DATEADD(day, -7, CURRENT_DATE())
ORDER BY BYTES_SPILLED_TO_REMOTE_STORAGE DESC
LIMIT 20;

-- Right-size: compare actual execution time vs. queue time
SELECT
  WAREHOUSE_NAME,
  AVG(EXECUTION_TIME_MS) AS avg_exec,
  AVG(QUEUE_TIME_MS) AS avg_queue,
  COUNT(*) AS query_count
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE START_TIME >= DATEADD(day, -30, CURRENT_DATE())
  AND EXECUTION_STATUS = 'SUCCESS'
GROUP BY WAREHOUSE_NAME;`,
          },
        ],
        tips: [
          'X-Small costs 1 credit/hour; each size step doubles — 6X-Large is 512 credits/hour.',
          'Auto-suspend of 60s is good for dev; 300s for prod to avoid frequent resume latency.',
          'ECONOMY scaling waits ~6 min before adding clusters — saves credits but adds queue time.',
          'Query Acceleration Service uses serverless credits (billed separately) but can speed up large scans.',
          'Use GRANT USAGE ON WAREHOUSE to let roles run queries; OPERATE privilege allows start/stop/suspend.',
        ],
        mistake: 'Setting MIN_CLUSTER_COUNT = MAX_CLUSTER_COUNT for a multi-cluster warehouse — it never scales in, burning credits 24/7 even with no queries. Always set MIN < MAX and rely on auto-suspend to park idle clusters.',
        shorthand: {
          verbose: `-- Manual warehouse management: create, alter, monitor
CREATE WAREHOUSE my_wh WITH WAREHOUSE_SIZE = 'MEDIUM';
ALTER WAREHOUSE my_wh SET AUTO_SUSPEND = 60;
USE WAREHOUSE my_wh;
SHOW WARELOADS;`,
          concise: `-- One-liner: create with all common options
CREATE WAREHOUSE my_wh WAREHOUSE_SIZE='MEDIUM' AUTO_SUSPEND=60 AUTO_RESUME=TRUE;`,
        },
      },
      {
        id: 'warehouse-operations',
        fn: 'Warehouse operations — suspend, resume, abort, status',
        desc: 'Control warehouse state: suspend to stop billing, resume to wake, abort to kill running queries.',
        category: 'Compute',
        subtitle: 'SUSPEND, RESUME, ABORT ALL QUERIES, SHOW WAREHOUSES, DESCRIBE WAREHOUSE',
        signature: 'ALTER WAREHOUSE my_wh { SUSPEND | RESUME | ABORT ALL QUERIES }',
        descLong: 'Suspending a warehouse stops all compute and billing immediately — running queries are aborted. Resuming starts a new cluster (takes ~5-10 seconds). ABORT ALL QUERIES kills in-flight SQL without suspending. SHOW WAREHOUSES lists all warehouses with state, size, and cluster count. DESCRIBE gives detailed config including scaling policy and resource monitor.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Check warehouse status and perform basic operations.
-- APPROACH  - Use SHOW and ALTER to inspect and control warehouses.
-- STRENGTHS - Simple; covers day-to-day operations.
-- WEAKNESSES- No automation or monitoring.

-- List all warehouses with state and size
SHOW WAREHOUSES;

-- Suspend a warehouse (stops billing, aborts running queries)
ALTER WAREHOUSE dev_wh SUSPEND;

-- Resume a warehouse manually
ALTER WAREHOUSE dev_wh RESUME;

-- Describe detailed configuration
DESC WAREHOUSE dev_wh;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Abort long-running queries and monitor warehouse state.
-- APPROACH  - Use ABORT ALL QUERIES and query history views.
-- STRENGTHS - Practical for operational management.
-- WEAKNESSES- Manual; no automated alerting.

-- Abort all queries without suspending the warehouse
ALTER WAREHOUSE prod_wh ABORT ALL QUERIES;

-- Find currently running queries on a warehouse
SELECT QUERY_ID, QUERY_TEXT, USER_NAME, EXECUTION_TIME_MS
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY(
  WAREHOUSE_NAME => 'PROD_WH',
  ERROR_ONLY => FALSE
))
WHERE EXECUTION_STATUS = 'RUNNING'
ORDER BY START_TIME DESC;

-- Check which warehouses are running vs suspended
SELECT NAME, STATE, SIZE, RUNNING, QUEUED
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
WHERE NAME LIKE '%_WH';`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Automate warehouse lifecycle with tasks and alerts.
-- APPROACH  - Use SERVERLESS tasks to suspend idle warehouses automatically.
-- STRENGTHS - Fully automated; prevents credit waste.
-- WEAKNESSES- Requires setup; task itself uses minimal serverless credits.

-- Create a task that suspends warehouses after business hours
CREATE TASK suspend_after_hours
  WAREHOUSE = 'SERVERLESS'   -- uses serverless compute, no warehouse needed
  SCHEDULE = 'USING CRON 0 22 * * 1-5 America/New_York'  -- 10pm weekdays
AS
  ALTER WAREHOUSE dev_wh SUSPEND;

ALTER TASK suspend_after_hours RESUME;

-- Alert: notify when a warehouse exceeds credit threshold
CREATE PROCEDURE check_warehouse_credits()
RETURNS STRING
LANGUAGE SQL
AS
$$
  DECLARE
    credits FLOAT;
  BEGIN
    SELECT SUM(CREDITS_USED) INTO credits
    FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY
    WHERE WAREHOUSE_NAME = 'PROD_WH'
      AND START_TIME >= DATEADD(day, -1, CURRENT_DATE());
    IF (credits > 100) THEN
      RETURN 'ALERT: PROD_WH used ' || credits || ' credits in 24h';
    ELSE
      RETURN 'OK: ' || credits || ' credits';
    END IF;
  END;
$$;

-- Schedule the check
CREATE TASK credit_alert
  WAREHOUSE = 'SERVERLESS'
  SCHEDULE = '60 MINUTE'
AS
  CALL check_warehouse_credits();

ALTER TASK credit_alert RESUME;`,
          },
        ],
        tips: [
          'SUSPEND aborts all running queries immediately — use ABORT ALL QUERIES if you want to keep the warehouse running.',
          'Resuming a suspended warehouse takes 5-10 seconds for the first query — auto-resume handles this transparently.',
          'SHOW WAREHOUSES is instant (metadata only) — use it instead of querying account_usage for real-time status.',
          'SERVERLESS tasks use minimal credits and don\'t require a running warehouse — ideal for monitoring tasks.',
        ],
        mistake: 'Using a shared warehouse for both ETL and BI reporting — long-running ETL queries block short BI queries, causing timeout complaints. Use separate warehouses: one for ETL (Large, long auto-suspend), one for BI (Medium, short auto-suspend, multi-cluster).',
        shorthand: {
          verbose: `-- Manual: check state, suspend, resume
SHOW WAREHOUSES;
ALTER WAREHOUSE my_wh SUSPEND;
ALTER WAREHOUSE my_wh RESUME;`,
          concise: `-- Quick suspend/resume
ALTER WAREHOUSE my_wh SUSPEND; ALTER WAREHOUSE my_wh RESUME;`,
        },
      },
    ],
  },

  // ── Section 2: Stages & Data Loading ─────────────────────────────────────────
  {
    id: 'stages-loading',
    title: 'Stages, COPY INTO & Data Loading',
    entries: [
      {
        id: 'create-stage',
        fn: 'CREATE STAGE — internal and external stages',
        desc: 'A stage is a storage location for data files. Internal stages use Snowflake-managed storage; external stages reference S3, Azure Blob, or GCS buckets.',
        category: 'Data Loading',
        subtitle: 'CREATE STAGE, named internal stage, external S3/Azure/GCS stage, storage integration, directory table',
        signature: "CREATE [OR REPLACE] [TEMPORARY] STAGE my_stage URL = 's3://bucket/path/' STORAGE_INTEGRATION = my_int FILE_FORMAT = my_format",
        descLong: 'Stages are the bridge between your files and Snowflake tables. Internal stages (named, table, user) store files within Snowflake. External stages point to cloud storage (S3, Azure Blob, GCS) using storage integrations (recommended) or credentials. A directory table (ENABLE_DIRECTORY = TRUE) auto-discovers files in the stage for listing and validation. File formats (CSV, JSON, PARQUET, AVRO) can be attached to the stage or specified in COPY INTO.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create a named internal stage and upload a file.
-- APPROACH  - Use PUT to upload, LIST to verify, GET to download.
-- STRENGTHS - Simple; no cloud storage needed.
-- WEAKNESSES- Internal stages have size limits; not for production pipelines.

-- Create a named internal stage with CSV format
CREATE STAGE my_csv_stage
  FILE_FORMAT = (TYPE = CSV FIELD_DELIMITER = ',' SKIP_HEADER = 1);

-- Upload a local file (run from SnowSQL or client)
-- PUT file:///data/customers.csv @my_csv_stage;

-- List files in the stage
LIST @my_csv_stage;

-- Download files back
-- GET @my_csv_stage file:///tmp/download/;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Create an external S3 stage with storage integration.
-- APPROACH  - Use STORAGE_INTEGRATION (no embedded credentials) + directory table.
-- STRENGTHS - Secure; auto-discovers files; no key management.
-- WEAKNESSES- Requires IAM role setup in AWS.

-- Step 1: Create storage integration (one-time, by ACCOUNTADMIN)
CREATE STORAGE INTEGRATION s3_int
  TYPE = EXTERNAL_STAGE
  STORAGE_PROVIDER = 'S3'
  ENABLED = TRUE
  STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::123456789012:role/snowflake-role'
  STORAGE_ALLOWED_LOCATIONS = ('s3://my-bucket/data/');

-- Step 2: Create external stage using the integration
CREATE STAGE s3_data_stage
  URL = 's3://my-bucket/data/'
  STORAGE_INTEGRATION = s3_int
  FILE_FORMAT = (TYPE = PARQUET)
  DIRECTORY = (ENABLE = TRUE);   -- enables auto-discovery

-- List files in the external stage
LIST @s3_data_stage;

-- Query the directory table (metadata about all files)
SELECT RELATIVE_PATH, SIZE, LAST_MODIFIED
FROM DIRECTORY(@s3_data_stage)
ORDER BY LAST_MODIFIED DESC;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Validate files before loading and handle schema evolution.
-- APPROACH  - Use VALIDATE_MODE, ON_ERROR, and FORCE options in COPY INTO.
-- STRENGTHS - Catches bad data before it hits the table; handles schema drift.
-- WEAKNESSES- Validation adds overhead; schema evolution requires ENFORCE_LENGTH.

-- Validate files without loading (returns errors per row)
SELECT *
FROM TABLE(VALIDATE(my_table, JOB_ID => '_last'));

-- COPY INTO with error handling and validation
COPY INTO my_table
FROM @s3_data_stage
  FILE_FORMAT = (TYPE = PARQUET)
  MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE   -- auto-map by column name
  ON_ERROR = 'CONTINUE'                      -- skip bad files, keep loading
  FORCE = FALSE                               -- don't reload already-loaded files
  VALIDATION_MODE = 'RETURN_ERRORS'           -- dry-run, return errors only
  SIZE_LIMIT = 50000000;                      -- validate up to 50MB

-- Auto-detect schema from Parquet and create table
CREATE TABLE my_new_table
  USING TEMPLATE (
    SELECT ARRAY_AGG(OBJECT_CONSTRUCT(*))
    FROM TABLE(
      INFER_SCHEMA(
        LOCATION => '@s3_data_stage/',
        FILE_FORMAT => 'parquet_format'
      )
    )
  );

-- Load with transformation (column reorder + cast)
COPY INTO target_table (id, name, amount, loaded_at)
FROM (
  SELECT
    $1:id::INT,
    $1:name::STRING,
    $1:amount::NUMBER(10,2),
    CURRENT_TIMESTAMP()
  FROM @s3_data_stage
)
FILE_FORMAT = (TYPE = PARQUET)
ON_ERROR = 'CONTINUE';`,
          },
        ],
        tips: [
          'Use STORAGE_INTEGRATION instead of embedded AWS keys — no secret rotation, IAM role handles auth.',
          'FORCE = FALSE (default) skips already-loaded files — Snowflake tracks load history by filename and checksum.',
          'VALIDATION_MODE = RETURN_ERRORS does a dry-run — no data loaded, just error report.',
          'MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE auto-maps Parquet/JSON columns to table columns by name.',
          'INFER_SCHEMA auto-detects columns from staged files — use with USING TEMPLATE to auto-create tables.',
        ],
        mistake: 'Using ON_ERROR = ABORT_STATEMENT for a batch of 100 files — one bad file aborts the entire load, and you lose progress on the other 99. Use ON_ERROR = CONTINUE to skip bad files, then check COPY_HISTORY for rejected files.',
        shorthand: {
          verbose: `-- Create external stage with storage integration
CREATE STORAGE INTEGRATION s3_int TYPE=EXTERNAL_STAGE STORAGE_PROVIDER='S3'
  STORAGE_AWS_ROLE_ARN='arn:aws:iam::123:role/sf' STORAGE_ALLOWED_LOCATIONS=('s3://bucket/');
CREATE STAGE s3_stage URL='s3://bucket/' STORAGE_INTEGRATION=s3_int FILE_FORMAT=(TYPE=PARQUET);`,
          concise: `-- Quick internal stage
CREATE STAGE my_stage FILE_FORMAT=(TYPE=CSV SKIP_HEADER=1);`,
        },
      },
      {
        id: 'copy-into',
        fn: 'COPY INTO — bulk load from stage to table',
        desc: 'The primary data loading command. Reads files from a stage and inserts into a target table with format options, error handling, and transformations.',
        category: 'Data Loading',
        subtitle: 'COPY INTO, ON_ERROR, FORCE, VALIDATION_MODE, transformations, partial column load, pattern matching',
        signature: 'COPY INTO target_table FROM @stage [FILE_FORMAT = ...] [ON_ERROR = CONTINUE|ABORT|SKIP_FILE] [FORCE = TRUE|FALSE]',
        descLong: 'COPY INTO is Snowflake\'s bulk loader — it reads from internal or external stages and inserts into a table. Key options: ON_ERROR controls behavior when a file has bad rows (CONTINUE skips the file, SKIP_FILE skips and continues, ABORT_STATEMENT rolls back). FORCE = TRUE reloads files already loaded. PATTERN filters files by regex. Transformations allow column selection, casting, and computed columns via a subquery. Snowflake tracks load history per stage+table for 14 days, enabling idempotent loads.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Load a CSV file from a stage into a table.
-- APPROACH  - Simple COPY INTO with basic format options.
-- STRENGTHS - Easy; covers the most common loading scenario.
-- WEAKNESSES- No error handling or transformation.

-- Create target table
CREATE TABLE customers (
  id INT,
  name STRING,
  email STRING,
  signup_date DATE
);

-- Load from internal stage
COPY INTO customers
FROM @my_csv_stage
FILE_FORMAT = (TYPE = CSV SKIP_HEADER = 1);

-- Check load history
SELECT *
FROM SNOWFLAKE.ACCOUNT_USAGE.COPY_HISTORY
WHERE TABLE_NAME = 'CUSTOMERS'
ORDER BY START_TIME DESC
LIMIT 5;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Load from external stage with error handling and file pattern.
-- APPROACH  - Use ON_ERROR, PATTERN, and FORCE options.
-- STRENGTHS - Handles real-world messiness; idempotent loads.
-- WEAKNESSES- Need to monitor rejected files separately.

-- Load only Parquet files matching a date pattern
COPY INTO sales_data
FROM @s3_data_stage
  PATTERN = '.*sales/2024/01/.*\\\\.parquet'
  FILE_FORMAT = (TYPE = PARQUET)
  ON_ERROR = 'SKIP_FILE'        -- skip file if any row errors
  FORCE = FALSE;                -- skip already-loaded files

-- Load JSON with transformation
COPY INTO events (event_type, user_id, event_data, loaded_at)
FROM (
  SELECT
    $1:event_type::STRING,
    $1:user_id::INT,
    $1,                          -- store full JSON as VARIANT
    CURRENT_TIMESTAMP()
  FROM @json_stage
  WHERE $1:event_type IS NOT NULL  -- filter bad records
)
FILE_FORMAT = (TYPE = JSON)
ON_ERROR = 'CONTINUE';

-- View rejected files
SELECT FILE_NAME, FIRST_ERROR_MESSAGE, ERROR_COUNT
FROM TABLE(VALIDATE(sales_data, JOB_ID => '_last'))
WHERE ERROR_COUNT > 0;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a production-grade incremental load with merge and dedup.
-- APPROACH  - Use COPY INTO a staging table, then MERGE into target.
-- STRENGTHS - Handles duplicates, schema evolution, and incremental loads.
-- WEAKNESSES- More complex; requires staging table pattern.

-- Step 1: Create a transient staging table (no fail-safe, cheaper)
CREATE TRANSIENT TABLE stg_sales AS
SELECT * FROM sales_data WHERE 1=0;  -- empty, same schema

-- Step 2: Load new files into staging
COPY INTO stg_sales
FROM @s3_data_stage
  PATTERN = '.*sales/2024/.*\\\\.parquet'
  FILE_FORMAT = (TYPE = PARQUET)
  MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE
  FORCE = FALSE
  ON_ERROR = 'SKIP_FILE_1';  -- skip file if exactly 1 error (tolerates header issues)

-- Step 3: Merge staging into target (dedup by id)
MERGE INTO sales_data AS t
USING (
  SELECT * FROM stg_sales
  QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY loaded_at DESC) = 1
) AS s
ON t.id = s.id
WHEN MATCHED AND s.updated_at > t.updated_at THEN
  UPDATE SET amount = s.amount, status = s.status, updated_at = s.updated_at
WHEN NOT MATCHED THEN
  INSERT (id, amount, status, updated_at)
  VALUES (s.id, s.amount, s.status, s.updated_at);

-- Step 4: Truncate staging for next run
TRUNCATE TABLE stg_sales;

-- Monitor: check load performance
SELECT FILE_NAME, ROWS_PARSED, ROWS_LOADED, ERROR_COUNT, FIRST_ERROR_MESSAGE
FROM SNOWFLAKE.ACCOUNT_USAGE.COPY_HISTORY
WHERE TABLE_NAME = 'STG_SALES'
  AND START_TIME >= DATEADD(hour, -1, CURRENT_TIMESTAMP())
ORDER BY START_TIME DESC;`,
          },
        ],
        tips: [
          'FORCE = FALSE (default) makes COPY INTO idempotent — re-running the same command skips already-loaded files.',
          'ON_ERROR = SKIP_FILE is the safest production default — bad files are skipped, good files load.',
          'Use TRANSIENT tables for staging — no Time Travel or Fail-safe costs, 1-day metadata retention.',
          'PATTERN uses regex — escape dots: \\\\.parquet matches .parquet extension.',
          'COPY INTO with a subquery allows transformations — column reorder, casts, filtering, and computed columns.',
        ],
        mistake: 'Using COPY INTO directly into a production table without a staging layer — duplicate files or schema mismatches corrupt the target. Always load into a TRANSIENT staging table first, then MERGE into the production table with dedup logic.',
        shorthand: {
          verbose: `-- Full COPY INTO with error handling and pattern
COPY INTO my_table FROM @my_stage
  PATTERN='.*\\\\.parquet' FILE_FORMAT=(TYPE=PARQUET)
  ON_ERROR='SKIP_FILE' FORCE=FALSE;`,
          concise: `-- Quick load
COPY INTO my_table FROM @my_stage FILE_FORMAT=(TYPE=CSV SKIP_HEADER=1);`,
        },
      },
      {
        id: 'file-formats',
        fn: 'CREATE FILE FORMAT — CSV, JSON, Parquet, Avro, ORC, XML',
        desc: 'A named file format encapsulates parsing options (delimiter, compression, null representation, etc.) so you don\'t repeat them in every COPY INTO.',
        category: 'Data Loading',
        subtitle: 'CREATE FILE FORMAT, TYPE, FIELD_DELIMITER, COMPRESSION, TRIM_SPACE, NULL_IF, PARSE_JSON',
        signature: "CREATE FILE FORMAT my_format TYPE = CSV FIELD_DELIMITER = '|' COMPRESSION = AUTO SKIP_HEADER = 1 NULL_IF = ('', 'NULL')",
        descLong: 'File formats are reusable parsing configurations. Supported types: CSV, JSON, PARQUET, AVRO, ORC, XML. Key CSV options: FIELD_DELIMITER, RECORD_DELIMITER, SKIP_HEADER, TRIM_SPACE, NULL_IF (list of strings to treat as NULL), COMPRESSION (AUTO detects gzip/bzip2/zstd). JSON options: STRIP_OUTER_ARRAY, IGNORE_UTF8_ERRORS. Parquet/Avro are binary — use MATCH_BY_COLUMN_NAME in COPY INTO to map by column name. Formats can be attached to stages or referenced directly in COPY INTO.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create file formats for common file types.
-- APPROACH  - Use CREATE FILE FORMAT with basic options.
-- STRENGTHS - Reusable; clean separation of format from load.
-- WEAKNESSES- No edge case handling.

-- CSV with pipe delimiter and header
CREATE FILE FORMAT pipe_csv
  TYPE = CSV
  FIELD_DELIMITER = '|'
  SKIP_HEADER = 1
  COMPRESSION = AUTO;     -- auto-detect gzip/zstd

-- JSON with outer array stripped
CREATE FILE FORMAT my_json
  TYPE = JSON
  STRIP_OUTER_ARRAY = TRUE;

-- Parquet (binary, no parsing options needed)
CREATE FILE FORMAT my_parquet
  TYPE = PARQUET;

-- Use in COPY INTO
COPY INTO my_table
FROM @my_stage
FILE_FORMAT = my_csv;     -- reference by name`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Handle messy CSV files with edge cases.
-- APPROACH  - Use TRIM_SPACE, NULL_IF, ERROR_ON_COLUMN_COUNT_MISMATCH, and FIELD_OPTIONALLY_ENCLOSED_BY.
-- STRENGTHS - Handles real-world CSV messiness.
-- WEAKNESSES- Too many options can mask data issues.

-- CSV with quoted fields, empty strings as NULL, trailing spaces
CREATE FILE FORMAT messy_csv
  TYPE = CSV
  FIELD_DELIMITER = ','
  SKIP_HEADER = 1
  FIELD_OPTIONALLY_ENCLOSED_BY = '"'   -- handles commas inside quotes
  TRIM_SPACE = TRUE                     -- trim whitespace around fields
  NULL_IF = ('', 'NULL', 'null', 'N/A') -- treat these as SQL NULL
  ERROR_ON_COLUMN_COUNT_MISMATCH = FALSE -- tolerate extra/missing columns
  COMPRESSION = AUTO
  ENCODING = 'UTF8';

-- XML format
CREATE FILE FORMAT my_xml
  TYPE = XML
  COMPRESSION = GZIP;

-- Check what format is attached to a stage
DESC STAGE my_stage;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a format library and validate data quality pre-load.
-- APPROACH  - Create a format catalog, use VALIDATION_MODE, and handle schema drift.
-- STRENGTHS - Production-grade; reusable across pipelines.
-- WEAKNESSES- Requires governance to maintain format library.

-- Format library (create once, reuse everywhere)
CREATE FILE FORMAT ff_csv_standard
  TYPE = CSV SKIP_HEADER = 1 COMPRESSION = AUTO
  FIELD_OPTIONALLY_ENCLOSED_BY = '"' TRIM_SPACE = TRUE
  NULL_IF = ('', 'NULL') ERROR_ON_COLUMN_COUNT_MISMATCH = FALSE;

CREATE FILE FORMAT ff_json_standard
  TYPE = JSON STRIP_OUTER_ARRAY = TRUE COMPRESSION = AUTO
  IGNORE_UTF8_ERRORS = FALSE;

CREATE FILE FORMAT ff_parquet_standard
  TYPE = PARQUET COMPRESSION = AUTO;

CREATE FILE FORMAT ff_avro_standard
  TYPE = AVRO COMPRESSION = AUTO;

-- Validate a file against a format without loading
COPY INTO my_table
FROM @my_stage/some_file.csv
FILE_FORMAT = ff_csv_standard
VALIDATION_MODE = 'RETURN_3_ROWS';  -- show first 3 parsed rows

-- Check for truncation issues with large fields
SELECT $1 AS row_content, LENGTH($1) AS row_length
FROM @my_stage
  (FILE_FORMAT => ff_csv_standard, PATTERN => '.*\\\\.csv')
LIMIT 10;`,
          },
        ],
        tips: [
          'COMPRESSION = AUTO auto-detects gzip, bzip2, zstd, deflate, and raw — always use it.',
          'NULL_IF takes a list — add common null representations: (\'\', \'NULL\', \'null\', \'N/A\', \'NA\').',
          'FIELD_OPTIONALLY_ENCLOSED_BY = \'"\' handles commas and newlines inside quoted fields.',
          'ERROR_ON_COLUMN_COUNT_MISMATCH = FALSE tolerates ragged CSVs — but investigate the root cause.',
          'VALIDATION_MODE = RETURN_3_ROWS shows parsed data without loading — great for testing formats.',
        ],
        mistake: 'Forgetting SKIP_HEADER = 1 on CSVs with headers — the header row loads as data, causing type conversion errors or a garbage row. Always inspect the first few rows with VALIDATION_MODE before loading.',
        shorthand: {
          verbose: `-- Full format with all common options
CREATE FILE FORMAT my_ff TYPE=CSV FIELD_DELIMITER=',' SKIP_HEADER=1
  FIELD_OPTIONALLY_ENCLOSED_BY='"' TRIM_SPACE=TRUE NULL_IF=('','NULL') COMPRESSION=AUTO;`,
          concise: `-- Quick CSV format
CREATE FILE FORMAT my_ff TYPE=CSV SKIP_HEADER=1 COMPRESSION=AUTO;`,
        },
      },
    ],
  },

  // ── Section 3: Pipes & Continuous Loading ─────────────────────────────────────────
  {
    id: 'pipes',
    title: 'Pipes & Continuous Loading (Snowpipe)',
    entries: [
      {
        id: 'snowpipe',
        fn: 'CREATE PIPE — continuous data ingestion with Snowpipe',
        desc: 'A pipe is a named Snowpipe object that continuously loads files from a stage into a table as new files arrive, using serverless compute.',
        category: 'Data Loading',
        subtitle: 'CREATE PIPE, AUTO_INGEST, Snowpipe, SQS notification, INSERT INTO, pipe status, REFRESH',
        signature: "CREATE PIPE my_pipe AUTO_INGEST = TRUE AS COPY INTO my_table FROM @my_stage FILE_FORMAT = my_format",
        descLong: 'Snowpipe enables continuous, automated loading. When AUTO_INGEST = TRUE, Snowflake creates an SQS queue (AWS) or Event Grid notification (Azure) that triggers a load whenever new files land in the stage. Pipes use serverless compute (no warehouse needed) and bill per file loaded. The pipe definition contains a COPY INTO statement. REFRESH manually triggers loads for files that arrived before the pipe was created or during a pause. PIPE_RELOAD_TIME tracks the last loaded file.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create a basic Snowpipe for continuous loading from S3.
-- APPROACH  - Use CREATE PIPE with AUTO_INGEST and a simple COPY INTO.
-- STRENGTHS - Automated; no warehouse needed; near real-time.
-- WEAKNESSES- Requires S3 event notification setup.

-- Create pipe (assumes stage and table already exist)
CREATE PIPE my_pipe
  AUTO_INGEST = TRUE
  AS
    COPY INTO my_table
    FROM @s3_data_stage
    FILE_FORMAT = (TYPE = PARQUET)
    ON_ERROR = 'SKIP_FILE';

-- Get the SQS queue ARN (configure S3 to send events to this queue)
DESC PIPE my_pipe;
-- Look for notification_channel column → SQS queue ARN

-- Check pipe status
SELECT SYSTEM$PIPE_STATUS('my_pipe');

-- Manually trigger a load for historical files
ALTER PIPE my_pipe REFRESH;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Monitor pipe health and handle load failures.
-- APPROACH  - Query pipe history, check for errors, and replay failed files.
-- STRENGTHS - Operational visibility; handles failure recovery.
-- WEAKNESSES- Manual replay needed for failed files.

-- Check recent pipe execution history
SELECT
  PIPE_NAME, FILE_NAME, STATE, ROWS_LOADED, ERROR_COUNT,
  FIRST_ERROR_MESSAGE, LAST_LOADED_TIME
FROM SNOWFLAKE.ACCOUNT_USAGE.COPY_HISTORY
WHERE PIPE_NAME = 'MY_PIPE'
  AND START_TIME >= DATEADD(hour, -24, CURRENT_TIMESTAMP())
ORDER BY START_TIME DESC;

-- Find files that failed to load
SELECT FILE_NAME, FIRST_ERROR_MESSAGE
FROM SNOWFLAKE.ACCOUNT_USAGE.COPY_HISTORY
WHERE PIPE_NAME = 'MY_PIPE'
  AND STATE = 'FAILED'
  AND START_TIME >= DATEADD(day, -7, CURRENT_DATE());

-- Replay failed files (manual refresh for specific files)
ALTER PIPE my_pipe REFRESH PREFIX = 'sales/2024/01/15/';

-- Pause and resume pipe for maintenance
ALTER PIPE my_pipe SET PIPE_EXECUTION_PAUSED = TRUE;
ALTER PIPE my_pipe SET PIPE_EXECUTION_PAUSED = FALSE;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a resilient Snowpipe pipeline with error quarantine and alerting.
-- APPROACH  - Use a dead-letter pattern, error table, and automated alerts.
-- STRENGTHS - Self-healing; alerts on failures; cost-controlled.
-- WEAKNESSES- More moving parts; requires monitoring.

-- Create an error quarantine table
CREATE TABLE pipe_errors (
  file_name STRING,
  error_message STRING,
  error_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  replayed BOOLEAN DEFAULT FALSE
);

-- Create a task to monitor pipe failures
CREATE TASK monitor_pipe_failures
  WAREHOUSE = 'SERVERLESS'
  SCHEDULE = '10 MINUTE'
AS
  INSERT INTO pipe_errors (file_name, error_message)
  SELECT FILE_NAME, FIRST_ERROR_MESSAGE
  FROM SNOWFLAKE.ACCOUNT_USAGE.COPY_HISTORY
  WHERE PIPE_NAME = 'MY_PIPE'
    AND STATE = 'FAILED'
    AND START_TIME >= DATEADD(minute, -15, CURRENT_TIMESTAMP())
    AND FILE_NAME NOT IN (SELECT file_name FROM pipe_errors);

ALTER TASK monitor_pipe_failures RESUME;

-- Auto-replay: task that retries failed files
CREATE TASK replay_failed_files
  WAREHOUSE = 'SERVERLESS'
  SCHEDULE = '30 MINUTE'
AS
  ALTER PIPE my_pipe REFRESH;

ALTER TASK replay_failed_files RESUME;

-- Cost monitoring: pipe credits
SELECT PIPE_NAME, SUM(CREDITS_USED) AS total_credits, COUNT(*) AS load_count
FROM SNOWFLAKE.ACCOUNT_USAGE.PIPE_USAGE_HISTORY
WHERE START_TIME >= DATEADD(day, -30, CURRENT_DATE())
GROUP BY PIPE_NAME;`,
          },
        ],
        tips: [
          'Snowpipe uses serverless compute — no warehouse needed, billed per file (~0.06 credits per 1,000 files).',
          'AUTO_INGEST creates an SQS queue — copy the ARN from DESC PIPE and configure S3 event notifications.',
          'ALTER PIPE ... REFRESH loads files that arrived before the pipe existed or during a pause.',
          'PIPE_EXECUTION_PAUSED = TRUE stops loading — use during table maintenance or schema changes.',
          'Snowpipe loads files within ~1 minute of arrival — for sub-second latency, use Snowpipe Streaming.',
        ],
        mistake: 'Forgetting to configure S3 event notifications after creating the pipe — files pile up in S3 but never load. The SQS queue ARN from DESC PIPE must be added to the S3 bucket\'s event notification configuration.',
        shorthand: {
          verbose: `-- Full pipe with auto-ingest and error handling
CREATE PIPE my_pipe AUTO_INGEST=TRUE AS
  COPY INTO my_table FROM @my_stage FILE_FORMAT=(TYPE=PARQUET) ON_ERROR='SKIP_FILE';
DESC PIPE my_pipe;  -- get SQS ARN for S3 config`,
          concise: `-- Quick pipe
CREATE PIPE my_pipe AUTO_INGEST=TRUE AS COPY INTO my_table FROM @my_stage;`,
        },
      },
    ],
  },

  // ── Section 4: Streams & Change Data Capture ─────────────────────────────────────────
  {
    id: 'streams-cdc',
    title: 'Streams & Change Data Capture (CDC)',
    entries: [
      {
        id: 'create-stream',
        fn: 'CREATE STREAM — track data changes (CDC) on tables',
        desc: 'A stream captures INSERT, UPDATE, and DELETE operations on a table so downstream processes can consume only the delta. Streams are append-only and offset-based.',
        category: 'CDC',
        subtitle: 'CREATE STREAM, SHOW_INITIAL_ROWS, consume stream, CDC patterns, append-only, offset, METADATA$ACTION',
        signature: "CREATE STREAM my_stream ON TABLE my_table [SHOW_INITIAL_ROWS = TRUE] [APPEND_ONLY = TRUE]",
        descLong: 'Streams are Snowflake\'s CDC mechanism. They track changes (INSERT/UPDATE/DELETE) on a source table without adding triggers or logs. When you query a stream, you see changes since the last consumption. Streams have an offset — once data is consumed (read in a transaction), the offset advances. METADATA$ACTION tells you the operation type (INSERT/DELETE). METADATA$ISUPDATE distinguishes updates (which appear as DELETE+INSERT pairs). APPEND_ONLY streams track inserts only (cheaper, no DELETE tracking). SHOW_INITIAL_ROWS = TRUE returns all existing rows as inserts on first read.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create a stream on a table and consume changes.
-- APPROACH  - Use CREATE STREAM and SELECT to see the delta.
-- STRENGTHS - Simple; no triggers or logs needed.
-- WEAKNESSES- Stream must be consumed in a transaction for offset to advance.

-- Create a stream on the source table
CREATE STREAM orders_stream ON TABLE orders;

-- Insert some data into the source table
INSERT INTO orders VALUES (1, 'Alice', 100.00);
INSERT INTO orders VALUES (2, 'Bob', 50.00);

-- Query the stream to see changes
SELECT * FROM orders_stream;
-- Returns: id=1, name=Alice, amount=100, METADATA$ACTION='INSERT'

-- Consume the stream (advance offset) — must be in a transaction
BEGIN;
  CREATE TABLE orders_archive AS SELECT * FROM orders_stream;
COMMIT;

-- Stream is now empty (offset advanced)
SELECT COUNT(*) FROM orders_stream;  -- → 0`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Use a stream + task to incrementally process changes.
-- APPROACH  - Create a task that consumes the stream on a schedule.
-- STRENGTHS - Automated incremental processing; no polling.
-- WEAKNESSES- Task schedule determines latency (minimum 1 minute).

-- Create stream on source table
CREATE STREAM orders_stream ON TABLE orders;

-- Create a task that processes changes every 5 minutes
CREATE TASK process_orders
  WAREHOUSE = 'my_wh'
  SCHEDULE = '5 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('orders_stream')  -- only run if stream has data
AS
  INSERT INTO orders_summary (order_id, customer, amount, processed_at)
  SELECT id, name, amount, CURRENT_TIMESTAMP()
  FROM orders_stream
  WHERE METADATA$ACTION = 'INSERT';

ALTER TASK process_orders RESUME;

-- Handle updates and deletes with MERGE
CREATE TASK sync_orders
  WAREHOUSE = 'my_wh'
  SCHEDULE = '5 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('orders_stream')
AS
  MERGE INTO orders_summary AS t
  USING (
    SELECT id, name, amount, METADATA$ACTION AS action, METADATA$ISUPDATE AS is_update
    FROM orders_stream
  ) AS s
  ON t.order_id = s.id
  WHEN MATCHED AND s.action = 'DELETE' AND NOT s.is_update THEN DELETE
  WHEN MATCHED AND s.is_update THEN UPDATE SET customer = s.name, amount = s.amount
  WHEN NOT MATCHED AND s.action = 'INSERT' THEN
    INSERT (order_id, customer, amount) VALUES (s.id, s.name, s.amount);

ALTER TASK sync_orders RESUME;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a multi-hop CDC pipeline with SCD Type 2 and dedup.
-- APPROACH  - Stream → staging → MERGE with SCD2 history tracking.
-- STRENGTHS - Full history; handles updates and deletes; idempotent.
-- WEAKNESSES- Complex; requires careful transaction management.

-- SCD Type 2 target table with history tracking
CREATE TABLE customers_scd2 (
  customer_id INT,
  name STRING,
  tier STRING,
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  valid_to TIMESTAMP DEFAULT '9999-12-31',
  is_current BOOLEAN DEFAULT TRUE
);

-- Source stream
CREATE STREAM customers_stream ON TABLE customers;

-- Task: SCD2 merge from stream
CREATE TASK scd2_merge
  WAREHOUSE = 'my_wh'
  SCHEDULE = '5 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('customers_stream')
AS
  BEGIN;
    -- Close existing records for updated/deleted rows
    UPDATE customers_scd2 AS t
    SET valid_to = CURRENT_TIMESTAMP(), is_current = FALSE
    WHERE t.is_current = TRUE
      AND t.customer_id IN (
        SELECT customer_id FROM customers_stream
        WHERE METADATA$ACTION IN ('INSERT', 'DELETE') OR METADATA$ISUPDATE = TRUE
      );

    -- Insert new current records for inserts and updates
    INSERT INTO customers_scd2 (customer_id, name, tier, valid_from, is_current)
    SELECT customer_id, name, tier, CURRENT_TIMESTAMP(), TRUE
    FROM customers_stream
    WHERE METADATA$ACTION = 'INSERT';
  END;

ALTER TASK scd2_merge RESUME;

-- Query current state
SELECT * FROM customers_scd2 WHERE is_current = TRUE;

-- Query history for a specific customer
SELECT * FROM customers_scd2 WHERE customer_id = 42 ORDER BY valid_from;`,
          },
        ],
        tips: [
          'Streams must be consumed inside a transaction (BEGIN/COMMIT) for the offset to advance — otherwise the same data appears on next read.',
          'SYSTEM$STREAM_HAS_DATA() returns TRUE if the stream has unconsumed changes — use it in task WHEN clause to skip empty runs.',
          'APPEND_ONLY = TRUE streams are cheaper — they only track inserts, not updates/deletes. Use for append-only source tables.',
          'Updates appear as two rows in the stream: a DELETE (old values) and an INSERT (new values), with METADATA$ISUPDATE = TRUE.',
          'Streams have a staleness limit — if not consumed within the data retention period (default 14 days), they become stale and must be recreated.',
        ],
        mistake: 'Querying a stream outside a transaction — the offset doesn\'t advance, so the next read returns the same data. Always wrap stream consumption in BEGIN/COMMIT or use it inside a task (which runs in an implicit transaction).',
        shorthand: {
          verbose: `-- Create stream and consume in a transaction
CREATE STREAM my_stream ON TABLE my_table;
BEGIN;
  INSERT INTO target SELECT * FROM my_stream WHERE METADATA$ACTION='INSERT';
COMMIT;`,
          concise: `-- Quick stream
CREATE STREAM my_stream ON TABLE my_table;`,
        },
      },
    ],
  },

  // ── Section 5: Tasks & Scheduling ─────────────────────────────────────────
  {
    id: 'tasks',
    title: 'Tasks & Scheduling',
    entries: [
      {
        id: 'create-task',
        fn: 'CREATE TASK — schedule SQL statements and stored procedures',
        desc: 'A task is a scheduled SQL operation. Tasks can run on a warehouse or serverless, use cron expressions, and form DAGs with predecessor tasks.',
        category: 'Scheduling',
        subtitle: 'CREATE TASK, SCHEDULE, CRON, WAREHOUSE, SERVERLESS, AFTER (DAG), WHEN condition, RESUME, SUSPEND',
        signature: "CREATE TASK my_task WAREHOUSE = 'my_wh' SCHEDULE = 'USING CRON 0 * * * * UTC' AS <sql_statement>",
        descLong: 'Tasks are Snowflake\'s native scheduler. Each task runs a single SQL statement or CALL to a stored procedure. Scheduling options: interval (e.g. \'5 MINUTE\') or cron expression (e.g. \'USING CRON 0 2 * * * America/New_York\'). Tasks can use a specified warehouse or SERVERLESS compute. DAGs are built with AFTER — child tasks run after the parent completes. WHEN clause conditionally executes the task body. Tasks start in SUSPENDED state — must RESUME to activate. SERVERLESS tasks auto-scale and are billed per execution.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create a simple scheduled task.
-- APPROACH  - Use CREATE TASK with a fixed interval and warehouse.
-- STRENGTHS - Easy; covers basic scheduling.
-- WEAKNESSES- Single statement; no DAG or conditional execution.

-- Create a task that runs every hour
CREATE TASK hourly_refresh
  WAREHOUSE = 'my_wh'
  SCHEDULE = '60 MINUTE'
AS
  MERGE INTO target AS t
  USING source AS s
  ON t.id = s.id
  WHEN NOT MATCHED THEN INSERT VALUES (s.id, s.name);

-- Resume the task (tasks start suspended)
ALTER TASK hourly_refresh RESUME;

-- Check task status
SHOW TASKS;

-- Suspend when needed
ALTER TASK hourly_refresh SUSPEND;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Build a task DAG with serverless compute and conditional execution.
-- APPROACH  - Use AFTER for dependencies, SERVERLESS for compute, WHEN for conditions.
-- STRENGTHS - Cost-efficient; conditional; chained dependencies.
-- WEAKNESSES- DAG depth limited to 1000; debugging requires task history.

-- Root task: extract data (serverless, no warehouse needed)
CREATE TASK extract_data
  WAREHOUSE = 'SERVERLESS'
  SCHEDULE = 'USING CRON 0 2 * * * UTC'  -- daily at 2 AM UTC
AS
  CALL extract_procedure();

-- Child task 1: transform (runs after extract completes)
CREATE TASK transform_data
  WAREHOUSE = 'SERVERLESS'
  AFTER extract_data
AS
  CALL transform_procedure();

-- Child task 2: load (runs after transform completes)
CREATE TASK load_data
  WAREHOUSE = 'my_wh'
  AFTER transform_data
  WHEN SYSTEM$STREAM_HAS_DATA('stg_stream')  -- only if there's data
AS
  MERGE INTO target_table AS t
  USING stg_stream AS s
  ON t.id = s.id
  WHEN MATCHED THEN UPDATE SET t.val = s.val
  WHEN NOT MATCHED THEN INSERT VALUES (s.id, s.val);

-- Resume all tasks in the DAG (must resume root last)
ALTER TASK load_data RESUME;
ALTER TASK transform_data RESUME;
ALTER TASK extract_data RESUME;

-- Monitor task execution
SELECT NAME, STATE, SCHEDULE, LAST_COMPLETED_TIME, NEXT_SCHEDULED_TIME
FROM TABLE(TASK_DEPENDENTS(task_name => 'EXTRACT_DATA', recursive => TRUE));`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a production task framework with retries, alerting, and audit.
-- APPROACH  - Use stored procedures, error handling, and task history monitoring.
-- STRENGTHS - Self-healing; auditable; alerts on failure.
-- WEAKNESSES- Complex setup; requires governance.

-- Wrapper procedure with error handling and logging
CREATE TABLE task_audit (
  task_name STRING, status STRING, started_at TIMESTAMP,
  completed_at TIMESTAMP, rows_affected INT, error_message STRING
);

CREATE PROCEDURE run_with_logging(task_name STRING, sql_text STRING)
RETURNS STRING LANGUAGE SQL AS
$$
  DECLARE
    start_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP();
    row_count INT DEFAULT 0;
    err_msg STRING DEFAULT NULL;
  BEGIN
    BEGIN;
      EXECUTE IMMEDIATE :sql_text;
      row_count := SQLROWCOUNT;
    EXCEPTION
      WHEN OTHERS THEN
        err_msg := SQLERRM;
        ROLLBACK;
        INSERT INTO task_audit VALUES (:task_name, 'FAILED', :start_ts, CURRENT_TIMESTAMP(), 0, :err_msg);
        RETURN 'FAILED: ' || :err_msg;
    END;
    COMMIT;
    INSERT INTO task_audit VALUES (:task_name, 'SUCCESS', :start_ts, CURRENT_TIMESTAMP(), :row_count, NULL);
    RETURN 'SUCCESS: ' || :row_count || ' rows';
  END;
$$;

-- Task with retry logic
CREATE TASK etl_daily
  WAREHOUSE = 'SERVERLESS'
  SCHEDULE = 'USING CRON 0 2 * * * America/New_York'
AS
  CALL run_with_logging('etl_daily', 'CALL full_etl_pipeline()');

ALTER TASK etl_daily RESUME;

-- View task DAG with history
SELECT ROOT_TASK_NAME, TASK_NAME, STATE, LAST_COMPLETED_TIME, NEXT_SCHEDULED_TIME
FROM SNOWFLAKE.ACCOUNT_USAGE.TASK_HISTORY
WHERE START_TIME >= DATEADD(day, -1, CURRENT_DATE())
  AND STATE != 'SUCCEEDED'
ORDER BY START_TIME DESC;`,
          },
        ],
        tips: [
          'Tasks start SUSPENDED — you must ALTER TASK ... RESUME to activate them.',
          'SERVERLESS tasks don\'t need a warehouse — they use serverless compute and auto-scale (billed per execution).',
          'AFTER creates a DAG — child tasks run only after the parent completes successfully.',
          'WHEN clause skips the task body if the condition is FALSE — saves compute credits on empty runs.',
          'Task DAG depth is limited to 1000 levels; each task runs a single SQL statement (use CALL for complex logic).',
        ],
        mistake: 'Resuming child tasks before the root task — the DAG won\'t execute because the root is still suspended. Always resume child tasks first, then resume the root task last.',
        shorthand: {
          verbose: `-- Full task with DAG, serverless, and condition
CREATE TASK child WAREHOUSE='SERVERLESS' AFTER parent
  WHEN SYSTEM$STREAM_HAS_DATA('my_stream')
AS INSERT INTO target SELECT * FROM my_stream;
ALTER TASK child RESUME;`,
          concise: `-- Quick task
CREATE TASK my_task WAREHOUSE='my_wh' SCHEDULE='60 MINUTE' AS <sql>;
ALTER TASK my_task RESUME;`,
        },
      },
    ],
  },

  // ── Section 6: Time Travel & Zero-Copy Cloning ─────────────────────────────────────────
  {
    id: 'time-travel-clone',
    title: 'Time Travel, Fail-Safe & Zero-Copy Cloning',
    entries: [
      {
        id: 'time-travel',
        fn: 'Time Travel — query historical data with AT/BEFORE',
        desc: 'Time Travel lets you query, restore, or undo data changes within the data retention period (default 1 day for standard, up to 90 days for Enterprise).',
        category: 'Data Protection',
        subtitle: 'AT(TIMESTAMP => ...), AT(OFFSET => ...), BEFORE, UNDROP, data retention, CHANGES',
        signature: "SELECT * FROM my_table AT(TIMESTAMP => '2024-01-15 10:00:00'::timestamp) [WHERE ...]",
        descLong: 'Time Travel is a core Snowflake feature that preserves historical data states. Using AT(TIMESTAMP), AT(OFFSET), or AT(STATEMENT), you can query data as it existed at a past point. BEFORE returns data as it was just before a statement. UNDROP restores dropped tables, schemas, or databases. Data retention is configurable per object (DATA_RETENTION_TIME_IN_DAYS): 0-1 for standard edition, 0-90 for Enterprise. Time Travel consumes storage — the retained data counts toward storage billing. Fail-safe is a 7-day additional recovery window after retention expires (server-side only, not queryable).',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Query data as it existed in the past.
-- APPROACH  - Use AT(TIMESTAMP) or AT(OFFSET) clause.
-- STRENGTHS - Simple; no backups needed.
-- WEAKNESSES- Limited to retention period.

-- Query data as of a specific timestamp
SELECT * FROM orders
AT(TIMESTAMP => '2024-01-15 10:00:00'::timestamp);

-- Query data as of 1 hour ago
SELECT * FROM orders
AT(OFFSET => -3600);  -- seconds

-- Query data as of a specific statement
SELECT * FROM orders
AT(STATEMENT => '01abc234-def5-6789-...');

-- See all versions of a row over time
SELECT id, name, amount, METADATA$ACTION, METADATA$TS AS change_time
FROM orders
CHANGES(INFORMATION => DEFAULT)
AT(TIMESTAMP => '2024-01-15 00:00:00'::timestamp)
END(TIMESTAMP => '2024-01-15 23:59:59'::timestamp);`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Recover accidentally dropped or modified data.
-- APPROACH  - Use UNDROP and CREATE TABLE AS SELECT with Time Travel.
-- STRENGTHS - Quick recovery; no backup restore needed.
-- WEAKNESSES- Must act within retention period.

-- Undrop a dropped table
DROP TABLE customers;       -- oops!
UNDROP TABLE customers;     -- restored!

-- Restore a table to a previous state (undo bad updates)
CREATE TABLE customers_restored AS
SELECT * FROM customers
AT(TIMESTAMP => '2024-01-15 10:00:00'::timestamp);

-- Swap: replace the bad table with the restored one
ALTER TABLE customers RENAME TO customers_bad;
ALTER TABLE customers_restored RENAME TO customers;

-- Set custom retention period (Enterprise edition, up to 90 days)
ALTER TABLE orders SET DATA_RETENTION_TIME_IN_DAYS = 30;

-- Check current retention settings
SHOW TABLES LIKE 'orders';`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Audit data changes and build a point-in-time recovery pipeline.
-- APPROACH  - Use CHANGES clause, METADATA columns, and automated snapshots.
-- STRENGTHS - Full audit trail; automated recovery; compliance-ready.
-- WEAKNESSES- CHANGES clause requires Enterprise; storage cost for long retention.

-- Audit: track all changes to a table over a time range
SELECT
  id, name, amount,
  METADATA$ACTION AS action,
  METADATA$ISUPDATE AS is_update,
  METADATA$TS AS change_time
FROM orders
CHANGES(INFORMATION => APPEND_ONLY)
AT(TIMESTAMP => $start_ts)
END(TIMESTAMP => $end_ts);

-- Point-in-time recovery procedure
CREATE PROCEDURE recover_table(target_table STRING, recover_to TIMESTAMP)
RETURNS STRING LANGUAGE SQL AS
$$
  DECLARE
    backup_name STRING;
  BEGIN
    backup_name := target_table || '_backup_' || TO_CHAR(CURRENT_TIMESTAMP(), 'YYYYMMDDHH24MISS');
    EXECUTE IMMEDIATE 'ALTER TABLE ' || :target_table || ' RENAME TO ' || :backup_name;
    EXECUTE IMMEDIATE
      'CREATE TABLE ' || :target_table || ' AS ' ||
      'SELECT * FROM ' || :backup_name ||
      ' AT(TIMESTAMP => ''' || :recover_to || '''::timestamp)';
    RETURN 'Recovered ' || :target_table || ' from ' || :backup_name;
  END;
$$;

-- Storage cost of Time Travel
SELECT TABLE_NAME, RETENTION_TIME, BYTES / 1e9 AS active_gb,
       RETAINED_FOR_CLONE_BYTES / 1e9 AS clone_retained_gb
FROM SNOWFLAKE.ACCOUNT_USAGE.TABLES
WHERE TABLE_SCHEMA = 'PUBLIC' AND RETENTION_TIME > 1
ORDER BY RETAINED_FOR_CLONE_BYTES DESC;`,
          },
        ],
        tips: [
          'Time Travel retention is per-table: ALTER TABLE ... SET DATA_RETENTION_TIME_IN_DAYS = N (0-90, Enterprise).',
          'UNDROP works for tables, schemas, and databases — but only within the retention period.',
          'CHANGES(INFORMATION => DEFAULT) shows all changes including metadata; APPEND_ONLY shows inserts only.',
          'Fail-safe is a 7-day server-side recovery window after Time Travel expires — not queryable, request via support.',
          'Time Travel storage is billed — long retention on large tables is expensive. Use 1-7 days for most tables.',
        ],
        mistake: 'Setting DATA_RETENTION_TIME_IN_DAYS = 0 to save storage — this disables Time Travel AND Fail-safe, meaning any accidental data loss is permanent. Use 1 (minimum for Time Travel) unless you have an external backup.',
        shorthand: {
          verbose: `-- Query historical data and restore
SELECT * FROM my_table AT(TIMESTAMP => '2024-01-15'::timestamp);
UNDROP TABLE my_table;
ALTER TABLE my_table SET DATA_RETENTION_TIME_IN_DAYS = 30;`,
          concise: `-- Quick time travel
SELECT * FROM my_table AT(OFFSET => -3600);`,
        },
      },
      {
        id: 'zero-copy-clone',
        fn: 'CREATE CLONE — zero-copy cloning of databases, schemas, tables',
        desc: 'Cloning creates a copy of an object that shares the underlying storage. No data is copied until the clone is modified — instant and storage-efficient.',
        category: 'Data Protection',
        subtitle: 'CREATE CLONE, AT/BEFORE, zero-copy, clone of clone, storage sharing, dev/test environments',
        signature: "CREATE TABLE clone_table CLONE source_table [AT(TIMESTAMP => ...)]",
        descLong: 'Zero-copy cloning is one of Snowflake\'s signature features. A clone shares the source\'s micro-partitions — no data is physically copied, so cloning is instant regardless of table size. When the clone is modified, only the changed micro-partitions consume additional storage. Clones can be created at the database, schema, or table level. You can clone at a point in time using AT/BEFORE. Clones of clones are supported but share the original\'s storage. Common use cases: dev/test environments, ETL staging, point-in-time snapshots, and data sharing.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create a clone of a table for testing.
-- APPROACH  - Use CREATE CLONE — instant, no data copied.
-- STRENGTHS - Zero cost at creation; shares storage.
-- WEAKNESSES- Modifications consume additional storage.

-- Clone a table
CREATE TABLE orders_test CLONE orders;

-- Clone at a point in time
CREATE TABLE orders_snapshot CLONE orders
  AT(TIMESTAMP => '2024-01-15 00:00:00'::timestamp);

-- Clone a schema (all tables at once)
CREATE SCHEMA my_schema_test CLONE my_schema;

-- Clone an entire database
CREATE DATABASE my_db_test CLONE my_db;

-- Verify: clone has same data
SELECT COUNT(*) FROM orders;       -- 1,000,000
SELECT COUNT(*) FROM orders_test;  -- 1,000,000 (shared storage)`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Create a dev environment from production with a clone.
-- APPROACH  - Clone the database, grant access, modify safely.
-- STRENGTHS - Instant dev environment; no ETL or backup needed.
-- WEAKNESSES- DDL changes in clone don't affect source; data changes cost storage.

-- Clone production database for development
CREATE DATABASE dev_db CLONE prod_db;

-- Grant access to dev team
GRANT USAGE ON DATABASE dev_db TO ROLE dev_role;
GRANT USAGE ON ALL SCHEMAS IN DATABASE dev_db TO ROLE dev_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN DATABASE dev_db TO ROLE dev_role;

-- Dev team can now modify data safely
USE DATABASE dev_db;
DELETE FROM orders WHERE id = 1;  -- only affects the clone

-- Production is untouched
USE DATABASE prod_db;
SELECT COUNT(*) FROM orders;  -- still 1,000,000`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build an automated snapshot and refresh pipeline using clones.
-- APPROACH  - Schedule daily clones, track storage delta, and rotate old snapshots.
-- STRENGTHS - Automated; cost-controlled; point-in-time recovery.
-- WEAKNESSES- Storage grows with diverging changes; needs cleanup.

-- Create a snapshot schema for daily clones
CREATE SCHEMA IF NOT EXISTS snapshots;

-- Task: daily snapshot of critical tables
CREATE TASK daily_snapshot
  WAREHOUSE = 'SERVERLESS'
  SCHEDULE = 'USING CRON 0 1 * * * UTC'
AS
  CREATE TABLE snapshots.orders_daily CLONE prod.public.orders
    AT(TIMESTAMP => CURRENT_TIMESTAMP() - INTERVAL '1 hour');

ALTER TASK daily_snapshot RESUME;

-- Monitor: storage consumed by clones vs original
SELECT TABLE_NAME, ACTIVE_BYTES / 1e9 AS active_gb,
       CLONE_BYTES / 1e9 AS clone_specific_gb
FROM SNOWFLAKE.ACCOUNT_USAGE.TABLES
WHERE TABLE_SCHEMA = 'SNAPSHOTS'
ORDER BY CLONE_BYTES DESC;

-- Clone lifecycle: automate rotation
CREATE PROCEDURE rotate_snapshots(table_name STRING, keep_days INT)
RETURNS STRING LANGUAGE SQL AS
$$
  DECLARE cutoff STRING; drop_stmt STRING;
  BEGIN
    cutoff := TO_CHAR(DATEADD(day, -:keep_days, CURRENT_DATE()), 'YYYYMMDD');
    drop_stmt := 'DROP TABLE IF EXISTS snapshots.' || :table_name || '_' || :cutoff;
    EXECUTE IMMEDIATE :drop_stmt;
    RETURN 'Rotated snapshots older than ' || :cutoff;
  END;
$$;`,
          },
        ],
        tips: [
          'Cloning is instant — a 10TB table clones in <1 second because no data is copied.',
          'Only modifications to the clone (INSERT/UPDATE/DELETE) consume additional storage.',
          'Clones inherit the source\'s retention setting at creation time — changing the source later doesn\'t affect existing clones.',
          'You can clone at database, schema, or table level — database clones include all schemas and tables.',
          'Clones are independent objects — dropping the source does NOT drop the clone.',
        ],
        mistake: 'Cloning a database and then running heavy ETL on the clone — the diverging micro-partitions can double storage costs. Use clones for read-only or light testing; for heavy ETL, use a separate database with its own data load.',
        shorthand: {
          verbose: `-- Clone at multiple levels with Time Travel
CREATE DATABASE dev_db CLONE prod_db;
CREATE SCHEMA test_schema CLONE prod_schema AT(TIMESTAMP => '2024-01-15'::timestamp);
CREATE TABLE orders_test CLONE orders;`,
          concise: `-- Quick clone
CREATE TABLE orders_test CLONE orders;`,
        },
      },
    ],
  },

  // ── Section 7: Semi-Structured Data ─────────────────────────────────────────
  {
    id: 'semi-structured',
    title: 'Semi-Structured Data (JSON, VARIANT, FLATTEN)',
    entries: [
      {
        id: 'variant-json',
        fn: 'VARIANT columns — store and query JSON, Avro, Parquet, ORC',
        desc: 'VARIANT is Snowflake\'s universal type for semi-structured data. It stores JSON, Avro, ORC, Parquet, or XML natively and supports dot-notation access.',
        category: 'Semi-Structured',
        subtitle: 'VARIANT, dot notation, $1, cast, PARSE_JSON, TRY_CAST, nested arrays, object keys',
        signature: 'SELECT col:path::TYPE FROM table — or SELECT $1:key FROM @stage',
        descLong: 'VARIANT is Snowflake\'s semi-structured column type. It can hold any JSON value (object, array, string, number, boolean, null). Access nested fields with colon notation: col:field:subfield. Cast with ::TYPE (e.g. col:price::DECIMAL(10,2)). TRY_CAST returns NULL instead of erroring on bad data. During COPY INTO, $1 refers to the entire parsed document. VARIANT columns are stored in an optimized columnar format — Snowflake extracts nested keys into separate micro-partitions for fast querying. For frequently accessed keys, extract them into typed columns (materialization) for better performance.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Store and query JSON data in a VARIANT column.
-- APPROACH  - Use PARSE_JSON to insert, colon notation to query.
-- STRENGTHS - Flexible; no schema needed upfront.
-- WEAKNESSES- Slower than typed columns for frequent access.

-- Create table with VARIANT column
CREATE TABLE events (raw VARIANT, loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP());

-- Insert JSON data
INSERT INTO events (raw)
SELECT PARSE_JSON('{"event":"click","user_id":42,"page":"/home","meta":{"browser":"chrome","os":"mac"}}');

-- Query nested fields with colon notation
SELECT
  raw:event::STRING AS event_type,
  raw:user_id::INT AS user_id,
  raw:page::STRING AS page,
  raw:meta:browser::STRING AS browser
FROM events;

-- Query during COPY FROM stage (no table needed)
SELECT $1:event::STRING, $1:user_id::INT, $1:meta:browser::STRING
FROM @json_stage (FILE_FORMAT => 'my_json', PATTERN => '.*\\\\.json');`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Flatten nested arrays and handle mixed types.
-- APPROACH  - Use LATERAL FLATTEN, TRY_CAST, and ARRAY functions.
-- STRENGTHS - Handles complex nested structures; safe parsing.
-- WEAKNESSES- Multiple FLATTEN calls can be expensive on large arrays.

-- Insert with nested arrays
INSERT INTO events (raw)
SELECT PARSE_JSON('{"event":"purchase","user_id":42,"items":[{"sku":"A100","qty":2,"price":19.99},{"sku":"B200","qty":1,"price":49.99}]}');

-- Flatten the items array
SELECT
  raw:event::STRING AS event_type,
  raw:user_id::INT AS user_id,
  f.value:sku::STRING AS sku,
  f.value:qty::INT AS qty,
  f.value:price::DECIMAL(10,2) AS price
FROM events,
LATERAL FLATTEN(input => raw:items) AS f;

-- Safe parsing with TRY_CAST (returns NULL on bad data)
SELECT
  raw:user_id::INT AS uid,
  TRY_CAST(raw:age::STRING AS INT) AS age,
  TRY_CAST(raw:price::STRING AS DECIMAL(10,2)) AS price
FROM events;

-- Check if a key exists
SELECT raw IS NOT NULL AS has_data,
       raw:event IS NOT NULL AS has_event,
       ARRAY_SIZE(raw:items) AS item_count
FROM events;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Optimize VARIANT queries with materialization and indexing.
-- APPROACH  - Extract hot keys into typed columns, use search optimization.
-- STRENGTHS - Production performance; query-optimized; cost-controlled.
-- WEAKNESSES- Requires schema evolution management.

-- Materialize frequently accessed keys into typed columns
CREATE TABLE events_optimized AS
SELECT
  raw,
  raw:event::STRING AS event_type,
  raw:user_id::INT AS user_id,
  raw:page::STRING AS page,
  raw:meta:browser::STRING AS browser,
  raw:meta:os::STRING AS os,
  ARRAY_SIZE(raw:items) AS item_count,
  loaded_at
FROM events;

-- Add search optimization for VARIANT key lookups
ALTER TABLE events_optimized ADD SEARCH OPTIMIZATION ON
  EQUALITY(raw:event), EQUALITY(raw:user_id);

-- Query with materialized columns (fast, uses pruning)
SELECT * FROM events_optimized
WHERE event_type = 'purchase' AND user_id = 42;

-- Deep flatten: multiple levels of nesting
SELECT
  raw:event::STRING AS event_type,
  f1.value:sku::STRING AS sku,
  f2.value:tag::STRING AS tag
FROM events,
LATERAL FLATTEN(input => raw:items) AS f1,
LATERAL FLATTEN(input => f1.value:tags) AS f2;

-- Aggregate JSON: group by event type and count items
SELECT
  raw:event::STRING AS event_type,
  COUNT(*) AS event_count,
  SUM(ARRAY_SIZE(raw:items)) AS total_items,
  AVG(f.value:price::DECIMAL(10,2)) AS avg_item_price
FROM events, LATERAL FLATTEN(input => raw:items) AS f
GROUP BY event_type;`,
          },
        ],
        tips: [
          'Use colon notation (col:key) to access VARIANT fields — not dot notation (col.key).',
          'TRY_CAST(col:key::STRING AS TYPE) returns NULL instead of erroring on bad data.',
          'Materialize frequently accessed VARIANT keys into typed columns — 10x+ faster for filter queries.',
          'LATERAL FLATTEN(input => col:array) expands arrays into rows — use multiple FLATTENs for nested arrays.',
          'SEARCH OPTIMIZATION on VARIANT equality predicates accelerates point lookups — costs extra storage.',
        ],
        mistake: 'Querying raw VARIANT columns without casting — Snowflake returns VARIANT type which can\'t be used in GROUP BY, ORDER BY, or joins efficiently. Always cast: raw:price::DECIMAL(10,2), not just raw:price.',
        shorthand: {
          verbose: `-- Parse JSON, access nested fields, flatten arrays
INSERT INTO t SELECT PARSE_JSON('{"a":1,"b":[10,20]}');
SELECT raw:a::INT, f.value::INT FROM t, LATERAL FLATTEN(input => raw:b) AS f;`,
          concise: `-- Quick VARIANT access
SELECT $1:key::TYPE FROM @stage (FILE_FORMAT => 'json');`,
        },
      },
      {
        id: 'flatten',
        fn: 'LATERAL FLATTEN — explode arrays and nested objects into rows',
        desc: 'FLATTEN is a table function that expands a VARIANT array or object into rows, one per element. Used with LATERAL JOIN to preserve outer row context.',
        category: 'Semi-Structured',
        subtitle: 'LATERAL FLATTEN, input, path, outer, recursive, mode, index, this, ordinal',
        signature: "SELECT ... FROM table, LATERAL FLATTEN(input => col:array [, outer => TRUE, recursive => TRUE]) AS f",
        descLong: 'FLATTEN is the key function for working with nested arrays in VARIANT columns. It takes an input (VARIANT array) and returns one row per element. Key parameters: input (the array to flatten), path (dot path to a sub-key within each element), outer (TRUE = emit a row even if the array is empty/null — useful for LEFT JOIN semantics), recursive (TRUE = flatten nested arrays recursively), mode (ARRAY or OBJECT). The output columns include: VALUE (the element), INDEX (0-based array index), THIS (the original array), ORDINAL (1-based index). Use LATERAL to join FLATTEN output with the source row.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Flatten a simple array in a VARIANT column.
-- APPROACH  - Use LATERAL FLATTEN with input => column.
-- STRENGTHS - Simple; preserves outer row context.
-- WEAKNESSES- Single level only; no OUTER mode.

-- Setup
CREATE TABLE t (id INT, data VARIANT);
INSERT INTO t SELECT 1, PARSE_JSON('{"tags":["a","b","c"]}');
INSERT INTO t SELECT 2, PARSE_JSON('{"tags":["x","y"]}');
INSERT INTO t SELECT 3, PARSE_JSON('{"tags":[]}');

-- Flatten the tags array
SELECT t.id, f.value::STRING AS tag, f.index AS array_index
FROM t, LATERAL FLATTEN(input => t.data:tags) AS f;
-- Result: id=1 tag=a idx=0, id=1 tag=b idx=1, id=1 tag=c idx=2
--         id=2 tag=x idx=0, id=2 tag=y idx=1
-- Note: id=3 is excluded (empty array = no rows)`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Use OUTER mode to keep rows with empty/null arrays.
-- APPROACH  - Set outer => TRUE in FLATTEN.
-- STRENGTHS - LEFT JOIN semantics; no dropped rows.
-- WEAKNESSES- NULL values in output need handling.

-- With OUTER: id=3 (empty array) gets a row with NULL
SELECT t.id, f.value::STRING AS tag, f.index AS array_index
FROM t, LATERAL FLATTEN(input => t.data:tags, outer => TRUE) AS f;

-- Flatten with path: access nested array within each element
INSERT INTO t SELECT 4, PARSE_JSON('{"orders":[{"id":1,"items":["a","b"]},{"id":2,"items":["c"]}]}');

SELECT t.id AS row_id, f_order.value:id::INT AS order_id, f_item.value::STRING AS item
FROM t,
LATERAL FLATTEN(input => t.data:orders) AS f_order,
LATERAL FLATTEN(input => f_order.value:items) AS f_item
WHERE t.id = 4;

-- Flatten an object (mode => OBJECT)
INSERT INTO t SELECT 5, PARSE_JSON('{"scores":{"math":90,"english":85}}');
SELECT t.id, f.key::STRING AS subject, f.value::INT AS score
FROM t, LATERAL FLATTEN(input => t.data:scores, mode => 'OBJECT') AS f
WHERE t.id = 5;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a recursive JSON parser for arbitrary nesting depth.
-- APPROACH  - Use recursive CTE + FLATTEN to handle unknown depth.
-- STRENGTHS - Handles any JSON structure; general-purpose.
-- WEAKNESSES- Recursive CTEs can be expensive on very deep structures.

-- Recursive flatten for deeply nested JSON
WITH RECURSIVE json_tree AS (
  SELECT t.id AS row_id, '' AS parent_path,
    f.key::STRING AS key, f.value AS value,
    OBJECT_SIZE(f.value) > 0 AS is_object,
    ARRAY_SIZE(f.value) > 0 AS is_array
  FROM t, LATERAL FLATTEN(input => t.data, mode => 'OBJECT') AS f
  WHERE t.id = 5
  UNION ALL
  SELECT jt.row_id, jt.parent_path || jt.key || '.',
    f.key::STRING AS key, f.value AS value,
    OBJECT_SIZE(f.value) > 0 AS is_object,
    ARRAY_SIZE(f.value) > 0 AS is_array
  FROM json_tree jt,
  LATERAL FLATTEN(input => jt.value, mode => 'OBJECT') AS f
  WHERE jt.is_object
)
SELECT row_id, parent_path || key AS full_path,
  CASE WHEN is_object THEN 'OBJECT' WHEN is_array THEN 'ARRAY'
       ELSE TYPEOF(value)::STRING END AS type,
  IFF(NOT is_object AND NOT is_array, value::STRING, NULL) AS leaf_value
FROM json_tree;

-- Performance: materialize flattened results
CREATE TABLE events_flattened AS
SELECT
  raw:event::STRING AS event_type,
  raw:user_id::INT AS user_id,
  f.value:sku::STRING AS sku, f.value:qty::INT AS qty,
  f.value:price::DECIMAL(10,2) AS price,
  f.index AS item_index, loaded_at
FROM events, LATERAL FLATTEN(input => raw:items, outer => TRUE) AS f;

ALTER TABLE events_flattened CLUSTER BY (event_type, loaded_at);`,
          },
        ],
        tips: [
          'outer => TRUE keeps rows where the array is empty or NULL — like a LEFT JOIN.',
          'mode => \'OBJECT\' flattens key-value pairs instead of arrays — output includes KEY and VALUE columns.',
          'Multiple FLATTENs in one query handle nested arrays — chain them with commas.',
          'f.index gives the 0-based array position; f.ordinal gives 1-based — useful for ordering.',
          'Recursive FLATTEN with a CTE handles unknown nesting depth — but watch performance on deep structures.',
        ],
        mistake: 'Using INNER FLATTEN (default) and losing rows with empty arrays — if a row has no tags, it disappears from the result. Use outer => TRUE to preserve all source rows, like a LEFT JOIN.',
        shorthand: {
          verbose: `-- Flatten with OUTER mode and path
SELECT t.id, f.value::STRING FROM t,
LATERAL FLATTEN(input => t.data:nested:items, outer => TRUE) AS f;`,
          concise: `-- Quick flatten
SELECT t.id, f.value FROM t, LATERAL FLATTEN(input => t.data:arr) AS f;`,
        },
      },
    ],
  },

  // ── Section 8: Data Sharing & Marketplace ─────────────────────────────────────────
  {
    id: 'data-sharing',
    title: 'Data Sharing & Marketplace',
    entries: [
      {
        id: 'data-sharing',
        fn: 'CREATE SHARE — share data with consumers without copying',
        desc: 'Snowflake Sharing enables live, read-only access to data across accounts without ETL, copying, or API calls. The provider grants access; the consumer mounts the shared database.',
        category: 'Data Sharing',
        subtitle: 'CREATE SHARE, GRANT USAGE ON SHARE, IMPORTED PRIVILEGES, reader account, listing, Snowflake Marketplace',
        signature: "CREATE SHARE my_share; GRANT USAGE ON DATABASE my_db TO SHARE my_share;",
        descLong: 'Data Sharing is Snowflake\'s zero-copy data distribution mechanism. A provider creates a SHARE, grants privileges on databases/schemas/tables to it, and adds consumer accounts. Consumers see a read-only database in their account — no data is copied, it\'s a live view of the provider\'s micro-partitions. Shared data is queryable immediately and reflects provider changes in near real-time. Reader accounts (CREATE READER ACCOUNT) allow sharing with non-Snowflake users. Snowflake Marketplace lets providers list shares publicly.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Share a database with another Snowflake account.
-- APPROACH  - Create a share, grant privileges, add consumer account.
-- STRENGTHS - Zero-copy; live; no ETL.
-- WEAKNESSES- Read-only; provider controls what's shared.

-- Step 1: Create a share (provider account)
CREATE SHARE my_data_share;

-- Step 2: Grant privileges on objects to share
GRANT USAGE ON DATABASE analytics_db TO SHARE my_data_share;
GRANT USAGE ON SCHEMA analytics_db.public TO SHARE my_data_share;
GRANT SELECT ON TABLE analytics_db.public.sales TO SHARE my_data_share;
GRANT SELECT ON VIEW analytics_db.public.sales_summary TO SHARE my_data_share;

-- Step 3: Add consumer account(s)
ALTER SHARE my_data_share ADD ACCOUNTS = 'abc12345';

-- Step 4: Consumer creates a database from the share
-- (run in consumer account)
CREATE DATABASE shared_analytics FROM SHARE provider_account.my_data_share;
GRANT IMPORTED PRIVILEGES ON DATABASE shared_analytics TO ROLE analyst_role;

-- Consumer can now query
SELECT * FROM shared_analytics.public.sales LIMIT 10;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Share with secure views and data governance.
-- APPROACH  - Use SECURE views to filter shared data per consumer.
-- STRENGTHS - Row-level security; consumer-specific data.
-- WEAKNESSES- Secure views have some query optimization restrictions.

-- Create a secure view that filters by consumer
CREATE SECURE VIEW analytics_db.public.sales_by_consumer
AS SELECT * FROM analytics_db.public.sales
WHERE region = CURRENT_REGION();

-- Share the secure view instead of the base table
GRANT SELECT ON VIEW analytics_db.public.sales_by_consumer TO SHARE my_data_share;

-- Share with multiple accounts, each sees only their data
ALTER SHARE my_data_share ADD ACCOUNTS = ('abc12345', 'def67890');

-- Monitor: who is consuming the share?
SELECT CONSUMER_ACCOUNT, DATABASE_NAME, OBJECT_NAME, LAST_USED_TIME
FROM SNOWFLAKE.ACCOUNT_USAGE.SHARE_USAGE_HISTORY
WHERE SHARE_NAME = 'MY_DATA_SHARE'
ORDER BY LAST_USED_TIME DESC;

-- List all shares in the account
SHOW SHARES;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a multi-tenant data sharing platform with reader accounts.
-- APPROACH  - Create reader accounts per consumer, manage billing, automate provisioning.
-- STRENGTHS - Full SaaS data product; isolated billing; automated.
-- WEAKNESSES- Reader accounts have separate user management.

-- Create a reader account for a consumer (provider pays compute)
CREATE READER ACCOUNT acme_reader
  ADMIN_NAME = 'acme_admin'
  ADMIN_PASSWORD = 'SecurePass123!'
  TYPE = 'READER';

-- Share data with the reader account
CREATE SHARE acme_share;
GRANT USAGE ON DATABASE analytics_db TO SHARE acme_share;
GRANT USAGE ON SCHEMA analytics_db.public TO SHARE acme_share;
GRANT SELECT ON TABLE analytics_db.public.acme_data TO SHARE acme_share;
ALTER SHARE acme_share ADD ACCOUNTS = 'acme_reader_locator';

-- Automated provisioning procedure
CREATE PROCEDURE provision_consumer(consumer_name STRING, share_name STRING)
RETURNS STRING LANGUAGE SQL AS
$$
  DECLARE reader_account STRING;
  BEGIN
    reader_account := :consumer_name || '_reader';
    EXECUTE IMMEDIATE 'CREATE READER ACCOUNT ' || :reader_account ||
      ' ADMIN_NAME = ''' || :consumer_name || '_admin'' ADMIN_PASSWORD = ''TempPass!234''';
    EXECUTE IMMEDIATE 'CREATE SHARE ' || :share_name;
    EXECUTE IMMEDIATE 'GRANT USAGE ON DATABASE analytics_db TO SHARE ' || :share_name;
    EXECUTE IMMEDIATE 'GRANT USAGE ON SCHEMA analytics_db.public TO SHARE ' || :share_name;
    EXECUTE IMMEDIATE 'GRANT SELECT ON TABLE analytics_db.public.' || :consumer_name || '_data TO SHARE ' || :share_name;
    EXECUTE IMMEDIATE 'ALTER SHARE ' || :share_name || ' ADD ACCOUNTS = ''' || :reader_account || '''';
    RETURN 'Provisioned: ' || :consumer_name;
  END;
$$;

-- Monitor reader account compute usage (provider is billed)
SELECT CONSUMER_ACCOUNT, SUM(CREDITS_USED) AS credits
FROM SNOWFLAKE.ACCOUNT_USAGE.METERING_HISTORY
WHERE SERVICE_TYPE = 'WAREHOUSE_METERING' AND CONSUMER_ACCOUNT IS NOT NULL
GROUP BY CONSUMER_ACCOUNT;`,
          },
        ],
        tips: [
          'Shared data is zero-copy — consumers query the provider\'s micro-partitions directly, no data movement.',
          'Use SECURE views to enforce row-level security per consumer — CURRENT_ACCOUNT() or mapping tables.',
          'Reader accounts let non-Snowflake users consume your data — you (the provider) pay their compute costs.',
          'Changes to shared data are visible to consumers in near real-time — no refresh or sync needed.',
          'GRANT IMPORTED PRIVILEGES on the shared database lets roles in the consumer account query it.',
        ],
        mistake: 'Sharing base tables directly instead of secure views — all consumers see all data, including columns you may not want to expose. Always share through SECURE views that project only the intended columns and rows.',
        shorthand: {
          verbose: `-- Full share setup
CREATE SHARE my_share;
GRANT USAGE ON DATABASE db TO SHARE my_share;
GRANT USAGE ON SCHEMA db.schema TO SHARE my_share;
GRANT SELECT ON VIEW db.schema.secure_view TO SHARE my_share;
ALTER SHARE my_share ADD ACCOUNTS = 'consumer_locator';`,
          concise: `-- Quick share
CREATE SHARE s; GRANT USAGE ON DATABASE db TO SHARE s; GRANT SELECT ON TABLE db.s.t TO SHARE s;`,
        },
      },
    ],
  },

  // ── Section 9: Security & Governance ─────────────────────────────────────────
  {
    id: 'security-governance',
    title: 'Security, Masking & Row Access Policies',
    entries: [
      {
        id: 'dynamic-masking',
        fn: 'Dynamic Data Masking — mask sensitive columns per role',
        desc: 'Dynamic data masking policies hide or obfuscate column values based on the current role. The underlying data is unchanged — masking is applied at query time.',
        category: 'Security',
        subtitle: 'CREATE MASKING POLICY, dynamic mask, role-based, conditional masking, PII, GDPR',
        signature: "CREATE MASKING POLICY pii_mask AS (val STRING) RETURNS STRING -> CASE WHEN CURRENT_ROLE() IN ('PII_ROLE') THEN val ELSE '***MASKED***' END",
        descLong: 'Dynamic data masking is Snowflake\'s column-level security feature. A masking policy is a function that receives the column value and returns a masked version based on the current role. Policies are applied at query time — the underlying data is never modified. Common patterns: full mask (***), partial mask (showing last 4 digits), hash, or NULL. Policies can use CURRENT_ROLE(), CURRENT_USER(), or custom session variables for conditional logic. A single policy can be applied to multiple columns. Masking policies are secure — users can\'t see the policy logic unless they have OWNERSHIP.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Mask PII columns based on role.
-- APPROACH  - Create a masking policy and apply to columns.
-- STRENGTHS - Simple; role-based; no data changes.
-- WEAKNESSES- Single masking pattern for all masked users.

-- Create masking policy
CREATE MASKING POLICY pii_mask AS (val STRING) RETURNS STRING ->
  CASE WHEN CURRENT_ROLE() IN ('PII_ACCESS_ROLE') THEN val ELSE '***MASKED***' END;

-- Apply to columns
ALTER TABLE customers MODIFY COLUMN email SET MASKING POLICY pii_mask;
ALTER TABLE customers MODIFY COLUMN phone SET MASKING POLICY pii_mask;

-- Test: as PII_ACCESS_ROLE
SELECT email, phone FROM customers LIMIT 1;
-- → alice@example.com, 555-1234

-- Test: as other role
SELECT email, phone FROM customers LIMIT 1;
-- → ***MASKED***, ***MASKED***`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Implement partial masking and conditional policies.
-- APPROACH  - Use different mask patterns based on role hierarchy.
-- STRENGTHS - Granular control; partial visibility for support teams.
-- WEAKNESSES- Multiple policies increase complexity.

-- Partial mask: show last 4 digits for support role
CREATE MASKING POLICY phone_partial AS (val STRING) RETURNS STRING ->
  CASE
    WHEN CURRENT_ROLE() IN ('PII_ACCESS_ROLE') THEN val
    WHEN CURRENT_ROLE() IN ('SUPPORT_ROLE') THEN '***-***-' || RIGHT(val, 4)
    ELSE '***MASKED***'
  END;

ALTER TABLE customers MODIFY COLUMN phone SET MASKING POLICY phone_partial;

-- Hash mask for analytics (preserves uniqueness for joins)
CREATE MASKING POLICY email_hash AS (val STRING) RETURNS STRING ->
  CASE WHEN CURRENT_ROLE() IN ('PII_ACCESS_ROLE') THEN val ELSE SHA2(val) END;

ALTER TABLE customers MODIFY COLUMN email SET MASKING POLICY email_hash;

-- View all masking policies
SELECT * FROM SNOWFLAKE.INFORMATION_SCHEMA.POLICIES WHERE POLICY_TYPE = 'MASKING';`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a comprehensive data governance framework with entitlements.
-- APPROACH  - Use entitlement tables, custom roles, and centralized policy management.
-- STRENGTHS - Enterprise-grade; auditable; centralized governance.
-- WEAKNESSES- Complex setup; requires governance team.

-- Entitlement table: maps roles to data access levels
CREATE TABLE governance.entitlements (
  role STRING, table_name STRING, column_name STRING, access_level STRING
);

INSERT INTO governance.entitlements VALUES
  ('PII_ACCESS_ROLE', 'customers', 'email', 'FULL'),
  ('SUPPORT_ROLE', 'customers', 'email', 'MASKED'),
  ('ANALYST_ROLE', 'customers', 'email', 'HASH'),
  ('SUPPORT_ROLE', 'customers', 'phone', 'PARTIAL');

-- Dynamic masking policy that reads from entitlements
CREATE MASKING POLICY governance.dynamic_mask AS (val STRING, tbl STRING, col STRING) RETURNS STRING ->
  CASE
    WHEN EXISTS (SELECT 1 FROM governance.entitlements
      WHERE role = CURRENT_ROLE() AND table_name = :tbl AND column_name = :col AND access_level = 'FULL')
    THEN val
    WHEN EXISTS (SELECT 1 FROM governance.entitlements
      WHERE role = CURRENT_ROLE() AND table_name = :tbl AND column_name = :col AND access_level = 'PARTIAL')
    THEN '***-***-' || RIGHT(val, 4)
    WHEN EXISTS (SELECT 1 FROM governance.entitlements
      WHERE role = CURRENT_ROLE() AND table_name = :tbl AND column_name = :col AND access_level = 'HASH')
    THEN SHA2(val)
    ELSE '***MASKED***'
  END;

-- Apply with table/column context
ALTER TABLE customers MODIFY COLUMN email
  SET MASKING POLICY governance.dynamic_mask USING (email, 'customers', 'email');
ALTER TABLE customers MODIFY COLUMN phone
  SET MASKING POLICY governance.dynamic_mask USING (phone, 'customers', 'phone');

-- Audit: who accessed masked data?
SELECT QUERY_TIME, USER_NAME, ROLE_NAME, QUERY_TEXT
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE QUERY_TEXT ILIKE '%customers%' AND QUERY_TIME >= DATEADD(day, -7, CURRENT_DATE())
ORDER BY QUERY_TIME DESC;`,
          },
        ],
        tips: [
          'Masking policies are applied at query time — the underlying data is never modified.',
          'A single policy can be applied to multiple columns — reduces policy management overhead.',
          'Use USING(column, context) to pass extra arguments to the policy for conditional logic.',
          'Masking policies are SECURE objects — users can\'t see the policy logic without OWNERSHIP.',
          'Masked columns can still be used in JOIN and WHERE clauses — the mask applies to output, not filtering.',
        ],
        mistake: 'Applying a masking policy that returns NULL for masked users — downstream COUNT(*) or JOIN queries may break because they expect non-NULL values. Use a sentinel like \'***MASKED***\' or a hash that preserves uniqueness.',
        shorthand: {
          verbose: `-- Create and apply masking policy
CREATE MASKING POLICY pii AS (v STRING) RETURNS STRING ->
  CASE WHEN CURRENT_ROLE() IN ('PII_ROLE') THEN v ELSE '***' END;
ALTER TABLE t MODIFY COLUMN col SET MASKING POLICY pii;`,
          concise: `-- Quick mask
CREATE MASKING POLICY m AS (v STRING) RETURNS STRING -> IFF(CURRENT_ROLE()='ADMIN', v, '***');`,
        },
      },
      {
        id: 'row-access-policy',
        fn: 'Row Access Policies — filter rows per role',
        desc: 'Row access policies filter rows based on the current role or session context. Unlike views, policies are applied transparently to the base table — no need to redirect queries.',
        category: 'Security',
        subtitle: 'CREATE ROW ACCESS POLICY, row-level security, role-based filtering, mapping table, CURRENT_ROLE',
        signature: "CREATE ROW ACCESS POLICY dept_filter AS (dept STRING) RETURNS BOOLEAN -> CURRENT_ROLE() IN ('ADMIN_ROLE') OR dept = 'Engineering'",
        descLong: 'Row access policies (RLS) are Snowflake\'s row-level security mechanism. A policy is a boolean function that filters rows — only rows where the policy returns TRUE are visible. Policies are applied transparently to the base table, so all queries (including joins and subqueries) are automatically filtered. Common patterns: role-based (admins see all, users see their department), mapping table (a separate table maps users to allowed values), or session variable based. Unlike views, users query the base table directly — no need to know about a view. Policies can be applied to multiple tables with the same filter column.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Filter rows by department based on current role.
-- APPROACH  - Create a row access policy and apply to a table.
-- STRENGTHS - Transparent; no views needed; automatic filtering.
-- WEAKNESSES- Single filter column; no mapping table.

-- Create row access policy
CREATE ROW ACCESS POLICY dept_policy AS (dept STRING) RETURNS BOOLEAN ->
  CASE WHEN CURRENT_ROLE() IN ('ADMIN_ROLE', 'SUPER_ADMIN') THEN TRUE
  ELSE dept = 'Engineering' END;

-- Apply to table
ALTER TABLE employees ADD ROW ACCESS POLICY dept_policy ON (dept);

-- Test: as ADMIN_ROLE → sees all departments
SELECT DISTINCT dept FROM employees;
-- → Engineering, Sales, HR, Finance

-- Test: as other role → sees only Engineering
SELECT DISTINCT dept FROM employees;
-- → Engineering

-- Remove policy
ALTER TABLE employees DROP ROW ACCESS POLICY dept_policy;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Use a mapping table for flexible row-level security.
-- APPROACH  - Create a mapping table that links roles to allowed values.
-- STRENGTHS - Flexible; no code changes to add/remove access.
-- WEAKNESSES- Mapping table must be maintained; subquery per row.

-- Create mapping table
CREATE TABLE dept_access_map (role STRING, allowed_dept STRING);
INSERT INTO dept_access_map VALUES
  ('ADMIN_ROLE', '*'), ('ENG_ROLE', 'Engineering'),
  ('SALES_ROLE', 'Sales'), ('HR_ROLE', 'HR');

-- Create policy using mapping table
CREATE ROW ACCESS POLICY mapping_dept_policy AS (dept STRING) RETURNS BOOLEAN ->
  EXISTS (SELECT 1 FROM dept_access_map
    WHERE role = CURRENT_ROLE() AND (allowed_dept = '*' OR allowed_dept = dept));

-- Apply to multiple tables
ALTER TABLE employees ADD ROW ACCESS POLICY mapping_dept_policy ON (department);
ALTER TABLE payroll ADD ROW ACCESS POLICY mapping_dept_policy ON (department);
ALTER TABLE projects ADD ROW ACCESS POLICY mapping_dept_policy ON (team);

-- Now: add access for a new role without changing policy
INSERT INTO dept_access_map VALUES ('FINANCE_ROLE', 'Finance');
-- Immediately effective — no policy modification needed`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build multi-tenant row-level security with session context.
-- APPROACH  - Use session variables for tenant ID + mapping table for entitlements.
-- STRENGTHS - Multi-tenant; dynamic; no policy changes for new tenants.
-- WEAKNESSES- Session variables must be set per connection.

-- Set tenant context at session start
ALTER SESSION SET TENANT_ID = 'acme_corp';

-- Mapping table: tenant + role → allowed regions
CREATE TABLE tenant_region_access (tenant_id STRING, role STRING, region STRING);
INSERT INTO tenant_region_access VALUES
  ('acme_corp', 'ADMIN_ROLE', '*'),
  ('acme_corp', 'ANALYST_ROLE', 'North'),
  ('beta_inc', 'ADMIN_ROLE', '*');

-- Policy: filter by tenant + region from session context
CREATE ROW ACCESS POLICY tenant_region_policy
AS (region STRING) RETURNS BOOLEAN ->
  EXISTS (
    SELECT 1 FROM tenant_region_access
    WHERE tenant_id = CURRENT_SESSION()::VARIANT:tenant_id::STRING
      AND role = CURRENT_ROLE()
      AND (region = '*' OR region = :region)
  );

-- Apply to all tenant tables
ALTER TABLE sales ADD ROW ACCESS POLICY tenant_region_policy ON (region);
ALTER TABLE inventory ADD ROW ACCESS POLICY tenant_region_policy ON (region);

-- Audit: verify policy effectiveness
SELECT CURRENT_ROLE() AS role, CURRENT_SESSION() AS session,
  COUNT(*) AS visible_rows
FROM sales;
-- ADMIN_ROLE sees all rows; ANALYST_ROLE sees only their region`,
          },
        ],
        tips: [
          'Row access policies are transparent — users query the base table, not a view.',
          'Use a mapping table for flexible entitlements — add/remove access without changing the policy.',
          'Policies can be applied to multiple tables with the same filter column.',
          'EXISTS subquery in the policy is efficient — Snowflake optimizes it as a semi-join.',
          'Combine masking policies (column-level) with row access policies (row-level) for full governance.',
        ],
        mistake: 'Creating a view for row-level security instead of a row access policy — users who query the base table bypass the view entirely. Row access policies are applied to the base table, so all access paths are covered.',
        shorthand: {
          verbose: `-- Create and apply row access policy with mapping table
CREATE ROW ACCESS POLICY rp AS (dept STRING) RETURNS BOOLEAN ->
  EXISTS (SELECT 1 FROM dept_map WHERE role=CURRENT_ROLE() AND dept=allowed_dept);
ALTER TABLE t ADD ROW ACCESS POLICY rp ON (dept);`,
          concise: `-- Quick RLS
CREATE ROW ACCESS POLICY rp AS (d STRING) RETURNS BOOLEAN -> CURRENT_ROLE()='ADMIN' OR d='Eng';`,
        },
      },
    ],
  },

  // ── Section 10: Performance & Clustering ─────────────────────────────────────────
  {
    id: 'performance-clustering',
    title: 'Performance, Clustering & Search Optimization',
    entries: [
      {
        id: 'clustering-keys',
        fn: 'CLUSTER BY — micro-partition clustering for query pruning',
        desc: 'Clustering keys order data within micro-partitions so queries can prune (skip) irrelevant partitions. Critical for large tables (100M+ rows) with common filter columns.',
        category: 'Performance',
        subtitle: 'CLUSTER BY, clustering key, micro-partition pruning, AUTOMATIC_CLUSTERING, SYSTEM$CLUSTERING_INFORMATION',
        signature: 'ALTER TABLE my_table CLUSTER BY (column1, column2)',
        descLong: 'Snowflake stores data in micro-partitions (50-150MB each, compressed columnar). When a query filters on a column, Snowflake prunes (skips) micro-partitions that don\'t contain matching values — this is the primary performance mechanism. Clustering keys physically order data so that values for the key column(s) are grouped together, maximizing pruning. Natural clustering happens automatically on load order, but explicit clustering keys help when query patterns differ from load order. AUTOMATIC_CLUSTERING = TRUE (default) lets Snowflake re-cluster in the background as data changes. Use SYSTEM$CLUSTERING_INFORMATION to check clustering depth and effectiveness. Over-clustering wastes credits — only cluster columns that are frequently filtered and have low-to-medium cardinality.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Add a clustering key to a large table.
-- APPROACH  - Use ALTER TABLE CLUSTER BY on the most filtered column.
-- STRENGTHS - Dramatic pruning improvement for filtered queries.
-- WEAKNESSES- Re-clustering consumes credits; not needed for small tables.

-- Add clustering key on date column (most common filter)
ALTER TABLE orders CLUSTER BY (order_date);

-- Add composite clustering key (date first, then region)
ALTER TABLE orders CLUSTER BY (order_date, region);

-- Check clustering information
SELECT SYSTEM$CLUSTERING_INFORMATION('orders', '(order_date, region)');
-- Returns: cluster_by, total_partition_count, constant_partition_count,
--          average_depth, average_depth_lower_bound

-- Enable automatic clustering (default, but verify)
ALTER TABLE orders SET AUTOMATIC_CLUSTERING = TRUE;

-- Check re-clustering progress
SELECT TABLE_NAME, CLUSTERING_KEY, AUTOMATIC_CLUSTERING_STATUS
FROM SNOWFLAKE.ACCOUNT_USAGE.TABLES
WHERE TABLE_NAME = 'ORDERS';`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Diagnose poor clustering and measure pruning effectiveness.
-- APPROACH  - Use clustering depth, query profile, and partition scans.
-- STRENGTHS - Data-driven optimization; measurable results.
-- WEAKNESSES- Requires query profiling knowledge.

-- Check clustering depth (lower is better — 1 = perfectly clustered)
SELECT SYSTEM$CLUSTERING_INFORMATION('orders', '(order_date)');
-- average_depth: 16 → poor (many partitions overlap on date)
-- average_depth: 2 → good (most partitions contain narrow date range)

-- Query profile: check partitions scanned vs total
SELECT QUERY_ID, PARTITIONS_SCANNED, PARTITIONS_TOTAL
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE QUERY_TEXT ILIKE '%orders%'
  AND START_TIME >= DATEADD(day, -7, CURRENT_DATE())
ORDER BY PARTITIONS_SCANNED DESC
LIMIT 10;
-- If PARTITIONS_SCANNED ≈ PARTITIONS_TOTAL → no pruning (bad)

-- Re-cluster manually (if automatic clustering is too slow)
ALTER TABLE orders RECLUSTER;

-- Check clustering history
SELECT START_TIME, END_TIME, ROWS_RECLUSTERED, BYTES_RECLUSTERED
FROM SNOWFLAKE.ACCOUNT_USAGE.AUTOMATIC_CLUSTERING_HISTORY
WHERE TABLE_NAME = 'ORDERS'
ORDER BY START_TIME DESC;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Optimize a multi-petabyte warehouse with strategic clustering.
-- APPROACH  - Analyze query patterns, choose optimal keys, monitor credit cost.
-- STRENGTHS - Production-grade; balances query speed vs re-cluster cost.
-- WEAKNESSES- Requires ongoing monitoring and tuning.

-- Analyze top filter columns from query history
SELECT
  REGEXP_SUBSTR(QUERY_TEXT, 'WHERE\\\\s+(\\\\w+)', 1, 1, 'i', 1) AS filter_col,
  COUNT(*) AS query_count,
  AVG(PARTITIONS_SCANNED) AS avg_partitions
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE QUERY_TEXT ILIKE '%orders%'
  AND EXECUTION_STATUS = 'SUCCESS'
  AND START_TIME >= DATEADD(day, -30, CURRENT_DATE())
GROUP BY filter_col
ORDER BY query_count DESC;

-- Choose clustering key based on query frequency + cardinality
-- High-frequency filter + low cardinality = best clustering key
ALTER TABLE orders CLUSTER BY (order_date, customer_id);

-- Monitor: clustering maintenance cost
SELECT
  TABLE_NAME,
  SUM(CREDITS_USED) AS cluster_credits,
  SUM(ROWS_RECLUSTERED) AS rows_reclustered
FROM SNOWFLAKE.ACCOUNT_USAGE.AUTOMATIC_CLUSTERING_HISTORY
WHERE START_TIME >= DATEADD(day, -30, CURRENT_DATE())
GROUP BY TABLE_NAME
ORDER BY cluster_credits DESC;

-- Drop clustering key if maintenance cost > query savings
ALTER TABLE orders DROP CLUSTERING KEY;

-- Alternative: use search optimization instead of clustering for point lookups
ALTER TABLE orders ADD SEARCH OPTIMIZATION ON EQUALITY(customer_id);
-- Search optimization creates a persistent access path — faster than clustering for point lookups`,
          },
        ],
        tips: [
          'Only cluster large tables (100M+ rows) — small tables fit in a few micro-partitions and prune naturally.',
          'Cluster on the most frequently filtered column first — date columns are the most common choice.',
          'Composite keys: order by filter frequency (most filtered first) — Snowflake clusters left-to-right.',
          'AUTOMATIC_CLUSTERING = TRUE re-clusters in the background — check AUTOMATIC_CLUSTERING_HISTORY for cost.',
          'Search optimization (EQUALITY) is better than clustering for point lookups on high-cardinality columns.',
        ],
        mistake: 'Clustering on a high-cardinality column (e.g. UUID) — each micro-partition contains unique values, so pruning never skips anything. Cluster on low-to-medium cardinality columns (date, region, category) that are frequently filtered.',
        shorthand: {
          verbose: `-- Add clustering key, check info, enable auto-clustering
ALTER TABLE orders CLUSTER BY (order_date, region);
SELECT SYSTEM$CLUSTERING_INFORMATION('orders', '(order_date, region)');
ALTER TABLE orders SET AUTOMATIC_CLUSTERING = TRUE;`,
          concise: `-- Quick cluster
ALTER TABLE my_table CLUSTER BY (date_col);`,
        },
      },
      {
        id: 'search-optimization',
        fn: 'SEARCH OPTIMIZATION — accelerate point lookup queries',
        desc: 'Search optimization creates a persistent access path (similar to a bloom filter index) that accelerates equality and substring queries on large tables.',
        category: 'Performance',
        subtitle: 'ADD SEARCH OPTIMIZATION, EQUALITY, SUBSTRING, GEO, ON, maintenance cost, point lookup',
        signature: 'ALTER TABLE my_table ADD SEARCH OPTIMIZATION ON EQUALITY(column1, column2)',
        descLong: 'Search Optimization Service creates a background-maintained access path that speeds up point lookup queries (WHERE col = value). Unlike clustering, it works for high-cardinality columns and doesn\'t reorder data. EQUALITY optimization handles WHERE col = val. SUBSTRING handles LIKE patterns. GEO handles geospatial predicates. The service costs additional storage (for the access path) and compute (for maintenance on data changes). Best for tables with frequent point lookups that can\'t be served by clustering (e.g. lookup by UUID, email, or phone number). Use SYSTEM$ESTIMATE_SEARCH_OPTIMIZATION_COSTS to estimate before enabling.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Add search optimization for point lookups.
-- APPROACH  - Use ADD SEARCH OPTIMIZATION ON EQUALITY.
-- STRENGTHS - Dramatic speedup for WHERE col = val queries.
-- WEAKNESSES- Extra storage and maintenance cost.

-- Add equality search optimization on a column
ALTER TABLE customers ADD SEARCH OPTIMIZATION ON EQUALITY(email);

-- Add on multiple columns
ALTER TABLE customers ADD SEARCH OPTIMIZATION ON EQUALITY(email, phone, customer_id);

-- Query benefits automatically (no query changes needed)
SELECT * FROM customers WHERE email = 'alice@example.com';
-- Before: scans all micro-partitions (slow on 100M+ rows)
-- After: uses access path, scans only matching partitions

-- Check what optimizations are configured
DESC SEARCH OPTIMIZATION ON customers;`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Estimate costs and add substring optimization for LIKE queries.
-- APPROACH  - Use SYSTEM$ESTIMATE_SEARCH_OPTIMIZATION_COSTS and SUBSTRING.
-- STRENGTHS - Cost-aware; handles LIKE patterns.
-- WEAKNESSES- Substring optimization has higher maintenance cost.

-- Estimate cost before enabling
SELECT SYSTEM$ESTIMATE_SEARCH_OPTIMIZATION_COSTS(
  'customers',
  'EQUALITY(email)'
);
-- Returns: build_cost, storage_cost_per_month, benefit

-- Add substring optimization for LIKE queries
ALTER TABLE customers ADD SEARCH OPTIMIZATION ON SUBSTRING(email);

-- This accelerates: WHERE email LIKE '%@gmail.com'
SELECT * FROM customers WHERE email LIKE '%@gmail.com';

-- Check search optimization storage usage
SELECT TABLE_NAME, SEARCH_OPTIMIZATION_BYTES / 1e9 AS so_gb
FROM SNOWFLAKE.ACCOUNT_USAGE.TABLES
WHERE SEARCH_OPTIMIZATION_BYTES > 0
ORDER BY SEARCH_OPTIMIZATION_BYTES DESC;

-- Remove optimization if cost > benefit
ALTER TABLE customers DROP SEARCH OPTIMIZATION ON EQUALITY(phone);`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a comprehensive search optimization strategy for a large table.
-- APPROACH  - Combine EQUALITY, SUBSTRING, and GEO with cost monitoring.
-- STRENGTHS - Covers all query patterns; cost-controlled.
-- WEAKNESSES- High maintenance cost for frequently updated tables.

-- Analyze query patterns to determine which columns need optimization
SELECT
  REGEXP_SUBSTR(QUERY_TEXT, 'WHERE\\\\s+(\\\\w+)\\\\s*=\\\\s*', 1, 1, 'i', 1) AS eq_col,
  COUNT(*) AS eq_count,
  AVG(EXECUTION_TIME_MS) AS avg_time
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE TABLE_NAME = 'CUSTOMERS'
  AND EXECUTION_STATUS = 'SUCCESS'
  AND START_TIME >= DATEADD(day, -30, CURRENT_DATE())
GROUP BY eq_col
HAVING eq_col IS NOT NULL
ORDER BY eq_count DESC;

-- Apply optimization based on query frequency
ALTER TABLE customers ADD SEARCH OPTIMIZATION ON
  EQUALITY(email, customer_id),
  SUBSTRING(last_name);

-- For geospatial tables
ALTER TABLE stores ADD SEARCH OPTIMIZATION ON GEO(location);

-- Monitor: search optimization maintenance cost
SELECT
  TABLE_NAME,
  SUM(CREDITS_USED) AS so_credits,
  SUM(ROWS_INSERTED + ROWS_UPDATED) AS rows_changed
FROM SNOWFLAKE.ACCOUNT_USAGE.SEARCH_OPTIMIZATION_HISTORY
WHERE START_TIME >= DATEADD(day, -30, CURRENT_DATE())
GROUP BY TABLE_NAME
ORDER BY so_credits DESC;

-- ROI: compare query speedup vs maintenance cost
SELECT
  q.TABLE_NAME,
  AVG(q.EXECUTION_TIME_MS) AS avg_query_ms,
  so.so_credits
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY q
JOIN (
  SELECT TABLE_NAME, SUM(CREDITS_USED) AS so_credits
  FROM SNOWFLAKE.ACCOUNT_USAGE.SEARCH_OPTIMIZATION_HISTORY
  WHERE START_TIME >= DATEADD(day, -30, CURRENT_DATE())
  GROUP BY TABLE_NAME
) so ON q.TABLE_NAME = so.TABLE_NAME
GROUP BY q.TABLE_NAME, so.so_credits;`,
          },
        ],
        tips: [
          'Search optimization is best for point lookups on high-cardinality columns (UUID, email, phone) where clustering doesn\'t help.',
          'EQUALITY handles WHERE col = val; SUBSTRING handles WHERE col LIKE \'%pattern%\'; GEO handles geospatial predicates.',
          'Always estimate costs first: SYSTEM$ESTIMATE_SEARCH_OPTIMIZATION_COSTS before enabling.',
          'Maintenance cost is proportional to data change rate — heavily updated tables cost more to maintain.',
          'Search optimization and clustering are complementary — use clustering for range filters, SO for point lookups.',
        ],
        mistake: 'Adding search optimization on a table with frequent INSERT/UPDATE/DELETE — the maintenance cost (rebuilding the access path) can exceed the query savings. Only use SO on read-heavy or append-only tables.',
        shorthand: {
          verbose: `-- Estimate, add, and monitor search optimization
SELECT SYSTEM$ESTIMATE_SEARCH_OPTIMIZATION_COSTS('t', 'EQUALITY(col)');
ALTER TABLE t ADD SEARCH OPTIMIZATION ON EQUALITY(col);
DESC SEARCH OPTIMIZATION ON t;`,
          concise: `-- Quick SO
ALTER TABLE my_table ADD SEARCH OPTIMIZATION ON EQUALITY(col);`,
        },
      },
    ],
  },

  // ── Section 11: Stored Procedures & UDFs ─────────────────────────────────────────
  {
    id: 'procedures-udfs',
    title: 'Stored Procedures & UDFs',
    entries: [
      {
        id: 'stored-procedures',
        fn: 'CREATE PROCEDURE — SQL and JavaScript stored procedures',
        desc: 'Stored procedures encapsulate multi-statement logic with variables, conditionals, loops, and exception handling. Snowflake supports SQL and JavaScript procedure languages.',
        category: 'Programming',
        subtitle: 'CREATE PROCEDURE, LANGUAGE SQL, LANGUAGE JAVASCRIPT, variables, EXECUTE IMMEDIATE, exception handling, CALL',
        signature: "CREATE PROCEDURE my_proc(arg1 STRING) RETURNS STRING LANGUAGE SQL AS $$ ... $$",
        descLong: 'Snowflake stored procedures come in two flavors: SQL (since 2022) and JavaScript (legacy). SQL procedures support variables, IF/ELSE, WHILE/FOR loops, TRY/CATCH exception handling, and EXECUTE IMMEDIATE for dynamic SQL. JavaScript procedures (handler API) provide full JS runtime with Snowflake.execute() for SQL. Procedures run with caller or owner rights — OWNER rights allow delegation (the proc runs as the owner, not the caller). Procedures can be called from tasks, other procedures, or directly via CALL. SQL procedures are recommended for new development — simpler, more secure, and better supported.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create a simple SQL stored procedure.
-- APPROACH  - Use CREATE PROCEDURE with LANGUAGE SQL.
-- STRENGTHS - Simple; familiar SQL syntax.
-- WEAKNESSES- Single statement only in this example.

-- Simple procedure: return a count
CREATE PROCEDURE count_customers()
RETURNS STRING
LANGUAGE SQL
AS
$$
  DECLARE
    cnt INT;
  BEGIN
    SELECT COUNT(*) INTO :cnt FROM customers;
    RETURN 'Total customers: ' || :cnt;
  END;
$$;

-- Call the procedure
CALL count_customers();
-- → Total customers: 1000000

-- Procedure with parameters
CREATE PROCEDURE get_customer_name(cust_id INT)
RETURNS STRING
LANGUAGE SQL
AS
$$
  DECLARE name STRING;
  BEGIN
    SELECT name INTO :name FROM customers WHERE id = :cust_id;
    RETURN :name;
  END;
$$;

CALL get_customer_name(42);
-- → Alice Smith`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Build a procedure with conditionals, loops, and exception handling.
-- APPROACH  - Use IF/ELSE, WHILE, and TRY/CATCH in SQL procedure.
-- STRENGTHS - Full procedural logic; error handling.
-- WEAKNESSES- More complex; harder to debug than simple SQL.

CREATE PROCEDURE merge_customers(source_table STRING)
RETURNS STRING
LANGUAGE SQL
AS
$$
  DECLARE
    inserted INT DEFAULT 0;
    updated INT DEFAULT 0;
    errors INT DEFAULT 0;
  BEGIN
    -- Try-catch for the merge
    BEGIN
      MERGE INTO customers AS t
      USING IDENTIFIER(:source_table) AS s
      ON t.id = s.id
      WHEN MATCHED THEN UPDATE SET t.name = s.name, t.email = s.email
      WHEN NOT MATCHED THEN INSERT (id, name, email) VALUES (s.id, s.name, s.email);

      inserted := SQLROWCOUNT;
    EXCEPTION
      WHEN OTHERS THEN
        errors := 1;
        RETURN 'ERROR: ' || SQLERRM;
    END;

    IF (errors = 0) THEN
      RETURN 'SUCCESS: merged ' || :inserted || ' rows from ' || :source_table;
    ELSE
      RETURN 'FAILED with errors';
    END IF;
  END;
$$;

-- Call with a table name
CALL merge_customers('stg_customers');

-- Loop example: batch insert
CREATE PROCEDURE batch_insert(target STRING, batch_size INT)
RETURNS STRING
LANGUAGE SQL
AS
$$
  DECLARE offset INT DEFAULT 0; total INT DEFAULT 0;
  BEGIN
    WHILE (offset < 1000000) DO
      EXECUTE IMMEDIATE
        'INSERT INTO ' || :target ||
        ' SELECT * FROM source LIMIT ' || :batch_size ||
        ' OFFSET ' || :offset;
      total := :total + SQLROWCOUNT;
      offset := :offset + :batch_size;
    END WHILE;
    RETURN 'Inserted ' || :total || ' rows in batches of ' || :batch_size;
  END;
$$;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a dynamic ETL framework with owner-rights procedures.
-- APPROACH  - Use dynamic SQL, owner rights, and audit logging.
-- STRENGTHS - Reusable; secure; auditable; handles any table.
-- WEAKNESSES- Complex; requires careful privilege management.

-- Audit table
CREATE TABLE etl_audit (
  proc_name STRING, step_name STRING, status STRING,
  rows_affected INT, started_at TIMESTAMP, completed_at TIMESTAMP, error_msg STRING
);

-- Dynamic ETL procedure with owner rights
CREATE PROCEDURE run_etl(table_name STRING, source_stage STRING)
RETURNS STRING
LANGUAGE SQL
EXECUTE AS OWNER  -- runs with owner privileges, not caller's
AS
$$
  DECLARE
    start_ts TIMESTAMP;
    row_count INT;
    err_msg STRING DEFAULT NULL;
  BEGIN
    start_ts := CURRENT_TIMESTAMP();

    -- Step 1: Load into staging
    BEGIN
      EXECUTE IMMEDIATE
        'COPY INTO stg_' || :table_name ||
        ' FROM ' || :source_stage ||
        ' FILE_FORMAT = (TYPE = PARQUET) ON_ERROR = ''SKIP_FILE''';
      row_count := SQLROWCOUNT;

      INSERT INTO etl_audit VALUES
        (:table_name, 'LOAD', 'SUCCESS', :row_count, :start_ts, CURRENT_TIMESTAMP(), NULL);
    EXCEPTION
      WHEN OTHERS THEN
        err_msg := SQLERRM;
        INSERT INTO etl_audit VALUES
          (:table_name, 'LOAD', 'FAILED', 0, :start_ts, CURRENT_TIMESTAMP(), :err_msg);
        RETURN 'FAILED at LOAD: ' || :err_msg;
    END;

    -- Step 2: Merge into target
    BEGIN
      EXECUTE IMMEDIATE
        'MERGE INTO ' || :table_name || ' AS t ' ||
        'USING stg_' || :table_name || ' AS s ' ||
        'ON t.id = s.id ' ||
        'WHEN MATCHED THEN UPDATE SET t.val = s.val ' ||
        'WHEN NOT MATCHED THEN INSERT VALUES (s.id, s.val)';
      row_count := SQLROWCOUNT;

      INSERT INTO etl_audit VALUES
        (:table_name, 'MERGE', 'SUCCESS', :row_count, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), NULL);
    EXCEPTION
      WHEN OTHERS THEN
        err_msg := SQLERRM;
        INSERT INTO etl_audit VALUES
          (:table_name, 'MERGE', 'FAILED', 0, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), :err_msg);
        RETURN 'FAILED at MERGE: ' || :err_msg;
    END;

    -- Step 3: Cleanup staging
    EXECUTE IMMEDIATE 'TRUNCATE TABLE stg_' || :table_name;

    RETURN 'SUCCESS: ' || :table_name || ' ETL complete';
  END;
$$;

-- Call for multiple tables
CALL run_etl('customers', '@s3_stage/customers/');
CALL run_etl('orders', '@s3_stage/orders/');

-- Review audit trail
SELECT * FROM etl_audit ORDER BY started_at DESC;`,
          },
        ],
        tips: [
          'SQL procedures (LANGUAGE SQL) are recommended over JavaScript for new development — simpler and better supported.',
          'EXECUTE AS OWNER lets the procedure run with owner privileges — callers don\'t need direct table access.',
          'Use EXECUTE IMMEDIATE for dynamic SQL — concatenate strings with || and bind variables with :var.',
          'SQLROWCOUNT returns the number of rows affected by the last DML statement.',
          'EXCEPTION WHEN OTHERS THEN catches all errors — SQLERRM contains the error message.',
        ],
        mistake: 'Using EXECUTE AS CALLER (default) and granting CALL on the procedure — callers get "permission denied" on the tables inside the procedure. Use EXECUTE AS OWNER so the procedure runs with the owner\'s privileges.',
        shorthand: {
          verbose: `-- Full procedure with variables, exception handling, dynamic SQL
CREATE PROCEDURE my_proc(t STRING) RETURNS STRING LANGUAGE SQL AS
$$ DECLARE r INT; BEGIN
  EXECUTE IMMEDIATE 'INSERT INTO ' || :t || ' SELECT 1'; r := SQLROWCOUNT;
  RETURN 'OK: ' || :r;
END; $$;`,
          concise: `-- Quick procedure
CREATE PROCEDURE p() RETURNS STRING LANGUAGE SQL AS $$ BEGIN RETURN 'OK'; END; $$;`,
        },
      },
      {
        id: 'udfs',
        fn: 'CREATE FUNCTION — SQL and JavaScript UDFs',
        desc: 'User-defined functions (UDFs) encapsulate reusable logic that returns a scalar or table value. Snowflake supports SQL, JavaScript, Python, and Java UDFs.',
        category: 'Programming',
        subtitle: 'CREATE FUNCTION, SQL UDF, JavaScript UDF, Python UDF, scalar, table, secure, immutable, volatile',
        signature: "CREATE FUNCTION my_func(arg1 INT, arg2 STRING) RETURNS STRING AS 'SELECT ...'",
        descLong: 'UDFs extend Snowflake with custom logic. SQL UDFs are the simplest — a single SELECT expression. JavaScript UDFs provide full JS runtime for complex logic. Python UDFs (Snowpark) enable ML and data science. Java UDFs for enterprise integrations. UDFs can be SCALAR (one value per row) or TABLE (returns a result set). SECURE UDFs hide the implementation from callers. IMMUTABLE functions always return the same output for the same input (enables caching); VOLATILE may vary. External functions call REST APIs outside Snowflake. UDFs are first-class — usable in SELECT, WHERE, GROUP BY, and JOIN clauses.',
        examples: [
          {
            tier: 'intro',
            code: `-- === ENTRY-LEVEL EXAMPLE ===
-- TASK      - Create a simple SQL UDF for reusable logic.
-- APPROACH  - Use CREATE FUNCTION with a SQL expression.
-- STRENGTHS - Reusable; simple; inlined by optimizer.
-- WEAKNESSES- SQL UDFs are limited to a single expression.

-- SQL scalar UDF: format full name
CREATE FUNCTION full_name(first STRING, last STRING)
RETURNS STRING
AS 'TRIM(first || '' '' || last)';

-- Use in queries
SELECT id, full_name(first_name, last_name) AS name FROM customers;

-- SQL UDF: calculate discount
CREATE FUNCTION discount_price(price DECIMAL(10,2), discount_pct FLOAT)
RETURNS DECIMAL(10,2)
AS 'price * (1 - discount_pct / 100)';

SELECT id, discount_price(price, 10) AS discounted FROM products;

-- IMMUTABLE function (same input → same output, enables caching)
CREATE FUNCTION celsius_to_fahrenheit(c FLOAT)
RETURNS FLOAT
IMMUTABLE
AS 'c * 9 / 5 + 32';`,
          },
          {
            tier: 'junior',
            code: `-- === JUNIOR EXAMPLE ===
-- TASK      - Create a JavaScript UDF for complex string parsing.
-- APPROACH  - Use LANGUAGE JAVASCRIPT with a handler function.
-- STRENGTHS - Full JS runtime; handles complex logic.
-- WEAKNESSES- Slower than SQL UDFs; can\'t do SQL inside JS UDF.

-- JavaScript UDF: parse and validate JSON field
CREATE FUNCTION extract_json_field(json_str STRING, field_name STRING)
RETURNS STRING
LANGUAGE JAVASCRIPT
AS
$$
  try {
    const obj = JSON.parse(JSON_STR);
    return obj[FIELD_NAME] || null;
  } catch (e) {
    return null;
  }
$$;

-- Use in query
SELECT id, extract_json_field(metadata, 'category') AS category
FROM products WHERE metadata IS NOT NULL;

-- Python UDF: sentiment analysis
CREATE FUNCTION sentiment_score(text STRING)
RETURNS FLOAT
LANGUAGE PYTHON
RUNTIME_VERSION = '3.9'
PACKAGES = ('snowflake-snowpark-python')
HANDLER = 'analyze_sentiment'
AS
$$
def analyze_sentiment(text):
    # Simple positive/negative word counting
    positive = ['good', 'great', 'excellent', 'amazing', 'love']
    negative = ['bad', 'terrible', 'awful', 'hate', 'worst']
    words = text.lower().split()
    score = sum(1 for w in words if w in positive) - sum(1 for w in words if w in negative)
    return float(score) / max(len(words), 1)
$$;

SELECT id, sentiment_score(review_text) AS sentiment
FROM reviews;`,
          },
          {
            tier: 'senior',
            code: `-- === SENIOR EXAMPLE ===
-- TASK      - Build a UDF library with secure functions and table functions.
-- APPROACH  - Create secure UDFs, table-returning UDFs, and external functions.
-- STRENGTHS - Reusable library; secure; handles complex transformations.
-- WEAKNESSES- Secure UDFs have optimization restrictions; external funcs add latency.

-- Secure SQL UDF (hides implementation from callers)
CREATE SECURE FUNCTION mask_email(email STRING)
RETURNS STRING
AS
'CASE WHEN EMAIL IS NULL THEN NULL ' ||
'ELSE LEFT(EMAIL, 2) || ''***@'' || SPLIT_PART(EMAIL, ''@'', 2) END';

-- Table function: generate date range
CREATE FUNCTION date_range(start_date DATE, end_date DATE)
RETURNS TABLE (dt DATE)
AS
'SELECT DATEADD(day, seq4(), start_date) AS dt ' ||
'FROM TABLE(GENERATOR(ROWCOUNT => DATEDIFF(day, start_date, end_date) + 1))';

-- Use table function in a join
SELECT d.dt, COUNT(o.id) AS order_count
FROM TABLE(date_range('2024-01-01'::DATE, '2024-01-31'::DATE)) AS d
LEFT JOIN orders o ON o.order_date = d.dt
GROUP BY d.dt
ORDER BY d.dt;

-- External function: call a REST API
CREATE EXTERNAL FUNCTION validate_address(address STRING)
RETURNS STRING
VOLATILE
API_INTEGRATION = my_api_integration
AS 'https://api.address-validator.com/validate';

-- Use external function in a query
SELECT id, validate_address(full_address) AS validated
FROM customers
WHERE address_validated = FALSE;

-- UDF library: document all functions
SELECT FUNCTION_NAME, FUNCTION_SCHEMA, ARGUMENT_SIGNATURE, RETURN_TYPE, LANGUAGE
FROM SNOWFLAKE.INFORMATION_SCHEMA.FUNCTIONS
WHERE FUNCTION_SCHEMA = 'PUBLIC'
ORDER BY FUNCTION_NAME;`,
          },
        ],
        tips: [
          'SQL UDFs are inlined by the optimizer — no function call overhead. Use them for simple expressions.',
          'IMMUTABLE functions enable result caching — use for pure functions like unit conversions.',
          'SECURE UDFs hide implementation but restrict some optimizations — only use when IP protection is needed.',
          'Python UDFs require RUNTIME_VERSION and PACKAGES — Snowflake manages the Python environment.',
          'Table-returning UDFs (RETURNS TABLE) can be used in FROM and JOIN clauses like regular tables.',
        ],
        mistake: 'Creating a VOLATILE UDF (default) when the function is actually IMMUTABLE — Snowflake can\'t cache results, so every call re-executes. Mark pure functions as IMMUTABLE for automatic result caching.',
        shorthand: {
          verbose: `-- Create SQL, JavaScript, and Python UDFs
CREATE FUNCTION f(x INT) RETURNS INT AS 'x * 2';
CREATE FUNCTION j(s STRING) RETURNS STRING LANGUAGE JAVASCRIPT AS $$ return s.toUpperCase(); $$;
CREATE FUNCTION p(s STRING) RETURNS FLOAT LANGUAGE PYTHON RUNTIME_VERSION='3.9' HANDLER='h' AS $$ def h(s): return 1.0 $$;`,
          concise: `-- Quick SQL UDF
CREATE FUNCTION f(x INT) RETURNS INT AS 'x * 2';`,
        },
      },
    ],
  },

  // ── Section 12: Snowpark & Modern Programming ─────────────────────────────────────────
  {
    id: "snowpark",
    title: "Snowpark & Modern Programming",
    entries: [
      {
        id: "snowpark-dataframe",
        fn: "Snowpark DataFrame API — Python, Java, Scala processing in Snowflake",
        desc: "Snowpark brings DataFrame-style programming (Python, Java, Scala) directly into Snowflake's compute. Code runs inside Snowflake warehouses — no data movement.",
        category: "Programming",
        subtitle: "Snowpark, DataFrame, session, lazy evaluation, UDF, stored procedure, Python, pushdown",
        signature: "session.table('db.schema.table').select(col1, col2).filter(col1 > 100).collect()",
        descLong: "Snowpark is Snowflake's developer framework for processing data using Python, Java, or Scala instead of SQL. The core abstraction is the DataFrame — a lazy, distributed dataset that translates to SQL under the hood. All operations (select, filter, join, agg) are pushed down to Snowflake's storage engine — no data leaves Snowflake. Snowpark UDFs and stored procedures run Python code inside Snowflake warehouses using conda-hosted packages. Key advantages: (1) No data movement — code runs where the data lives. (2) Familiar DataFrame API (pandas-like for Python). (3) Access to Python ecosystem (scikit-learn, pandas, numpy) inside Snowflake. (4) Lazy evaluation — operations are only executed when collect() or show() is called. (5) Works with Streams and Tasks for pipeline orchestration.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Query and transform data using Snowpark Python\n-- APPROACH  - Create a session, build a DataFrame, collect results\n-- STRENGTHS - Familiar pandas-like API; no SQL needed\n-- WEAKNESSES- Requires Snowpark library and session setup\n\n-- Python code (runs in Snowflake warehouse):\n\nfrom snowflake.snowpark import Session\nfrom snowflake.snowpark.functions import col, sum, avg, count\n\n# Connect to Snowflake\nconnection_params = {\n    \"account\": \"xy12345\",\n    \"user\": \"myuser\",\n    \"password\": \"mypass\",\n    \"warehouse\": \"COMPUTE_WH\",\n    \"database\": \"SALES_DB\",\n    \"schema\": \"PUBLIC\"\n}\nsession = Session.builder.configs(connection_params).create()\n\n# Build a DataFrame (lazy — no execution yet)\ndf = session.table(\"SALES\")\nresult = (\n    df\n    .select(\"CATEGORY\", \"AMOUNT\", \"ORDER_DATE\")\n    .filter(col(\"AMOUNT\") > 100)\n    .groupBy(\"CATEGORY\")\n    .agg(sum(\"AMOUNT\").alias(\"TOTAL\"), count(\"*\").alias(\"CNT\"))\n    .orderBy(col(\"TOTAL\").desc())\n)\n\n# Execute and collect\nresult.show()  -- prints first 10 rows\nresult.collect()  -- returns full result as Python list\n\n-- Equivalent SQL:\n-- SELECT CATEGORY, SUM(AMOUNT) AS TOTAL, COUNT(*) AS CNT\n-- FROM SALES WHERE AMOUNT > 100\n-- GROUP BY CATEGORY ORDER BY TOTAL DESC",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Build a data pipeline with Snowpark + Streams + Tasks\n-- APPROACH  - Use Snowpark to process CDC data from a stream\n-- STRENGTHS - Incremental processing; runs inside Snowflake\n-- WEAKNESSES- Must handle stream empty state gracefully\n\n-- Python stored procedure (called by a TASK):\n\nimport snowflake.snowpark as snowpark\nfrom snowflake.snowpark.functions import col, when_matched, when_not_matched\n\ndef process_cdc(session):\n    # Read CDC changes from stream\n    changes = session.table(\"SALES_STREAM\")\n\n    # Check if stream has data\n    if changes.count() == 0:\n        return \"No changes to process\"\n\n    # Separate inserts and updates\n    inserts = changes.filter(col(\"METADATA$ACTION\") == \"INSERT\")\n    updates = changes.filter(col(\"METADATA$ACTION\") == \"INSERT\")\n\n    # Merge into target table\n    target = session.table(\"SALES_DW\")\n    (\n        target.merge(\n            changes,\n            target.col(\"ORDER_ID\") == changes.col(\"ORDER_ID\"),\n            [\n                when_matched().update({\n                    \"AMOUNT\": changes.col(\"AMOUNT\"),\n                    \"STATUS\": changes.col(\"STATUS\"),\n                    \"UPDATED_AT\": changes.col(\"METADATA$UPDATE_TS\")\n                }),\n                when_not_matched().insert({\n                    \"ORDER_ID\": changes.col(\"ORDER_ID\"),\n                    \"AMOUNT\": changes.col(\"AMOUNT\"),\n                    \"STATUS\": changes.col(\"STATUS\")\n                })\n            ]\n        )\n    )\n\n    return f\"Processed {changes.count()} changes\"\n\n-- Create the stored procedure\nCREATE OR REPLACE PROCEDURE process_cdc_sp()\nRETURNS STRING\nLANGUAGE PYTHON\nRUNTIME_VERSION = '3.9'\nPACKAGES = ('snowflake-snowpark-python')\nHANDLER = 'process_cdc'\nAS $$\n-- (Python code above)\n$$;\n\n-- Schedule with a task\nCREATE OR REPLACE TASK process_cdc_task\nWAREHOUSE = 'COMPUTE_WH'\nSCHEDULE = '5 MINUTE'\nAS CALL process_cdc_sp();\n\nALTER TASK process_cdc_task RESUME;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build an ML scoring pipeline with Snowpark + scikit-learn\n-- APPROACH  - Train model in Python UDF, score batch data via Snowpark\n-- STRENGTHS - Full ML lifecycle inside Snowflake; no data egress\n-- WEAKNESSES- Model training limited to warehouse compute; no GPU\n\n-- Step 1: Train and register a model as a UDF\nCREATE OR REPLACE FUNCTION score_customer(\n    tenure FLOAT, monthly_charge FLOAT, total_charge FLOAT,\n    support_calls FLOAT, payment_delay FLOAT\n) RETURNS FLOAT\nLANGUAGE PYTHON\nRUNTIME_VERSION = '3.9'\nPACKAGES = ('scikit-learn', 'numpy', 'pandas')\nHANDLER = 'predict_churn'\nAS $$\nimport numpy as np\nfrom sklearn.ensemble import GradientBoostingClassifier\n\n# Pre-trained model weights (or load from stage)\nmodel = GradientBoostingClassifier()\n# ... training code or load from @model_stage/model.pkl\n\ndef predict_churn(tenure, monthly_charge, total_charge, support_calls, payment_delay):\n    features = np.array([[tenure, monthly_charge, total_charge, support_calls, payment_delay]])\n    probability = model.predict_proba(features)[0][1]\n    return float(probability)\n$$;\n\n-- Step 2: Score all customers using Snowpark\n-- Python:\nfrom snowflake.snowpark.functions import call_udf, lit, col\n\ndef score_all_customers(session):\n    customers = session.table(\"CUSTOMERS\")\n    scored = customers.select(\n        \"CUSTOMER_ID\",\n        \"CUSTOMER_NAME\",\n        call_udf(\"score_customer\",\n            col(\"TENURE\"), col(\"MONTHLY_CHARGE\"),\n            col(\"TOTAL_CHARGE\"), col(\"SUPPORT_CALLS\"),\n            col(\"PAYMENT_DELAY\")\n        ).alias(\"CHURN_PROBABILITY\")\n    )\n\n    # Save results to a table\n    scored.write.mode(\"overwrite\").save_as_table(\"CUSTOMER_CHURN_SCORES\")\n    return scored.count()\n\n-- Step 3: Orchestrate with tasks\nCREATE OR REPLACE TASK score_customers_task\nWAREHOUSE = 'ML_WH'\nSCHEDULE = 'DAILY'\nAS CALL score_all_customers_sp();\n\n-- Snowpark also supports:\n-- - session.sql('SELECT ...') for raw SQL in Python pipelines\n-- - df.to_pandas() to pull small results to client\n-- - session.upload_file() to stage files\n-- - Snowpark Container Services for Docker-based ML workloads",
          },
        ],
        tips: [
          "Snowpark DataFrames are lazy — operations only execute on collect(), show(), or write().",
          "Use session.table() to read, df.write.save_as_table() to persist — no SQL needed.",
          "Python UDFs run inside Snowflake warehouses with conda packages — no separate compute needed.",
          "Snowpark pushdown: all DataFrame operations translate to SQL — no data leaves Snowflake.",
          "For ML training, use Snowpark Container Services (Docker) for GPU workloads — UDFs are CPU-only.",
        ],
        mistake: "Calling df.to_pandas() on a large DataFrame — this pulls all data to the client memory. Use df.collect() for server-side processing or df.limit(100).to_pandas() for sampling.",
        shorthand: {
          verbose: "-- Snowpark Python: DataFrame pipeline\nfrom snowflake.snowpark.functions import col, sum\ndf = session.table('SALES').filter(col('AMOUNT') > 100).groupBy('CATEGORY').agg(sum('AMOUNT').alias('TOTAL'))\ndf.show()",
          concise: "-- Quick Snowpark\nsession.table('t').filter(col('x')>100).groupBy('c').agg(sum('x')).show()",
        },
      },
    ],
  },

  // ── Section 13: Dynamic Tables & Modern Pipelines ─────────────────────────────────────────
  {
    id: "dynamic-tables",
    title: "Dynamic Tables & Modern Pipelines",
    entries: [
      {
        id: "dynamic-table",
        fn: "CREATE DYNAMIC TABLE — declarative materialized pipelines",
        desc: "Dynamic Tables are Snowflake's modern replacement for Tasks+Streams+MERGE pipelines. They declaratively define a target table that automatically refreshes from source data.",
        category: "Data Pipeline",
        subtitle: "DYNAMIC TABLE, TARGET_LAG, WAREHOUSE, refresh, downstream, declarative pipeline, replace tasks+streams",
        signature: "CREATE DYNAMIC TABLE name TARGET_LAG = '5 min' WAREHOUSE = 'wh' AS SELECT ...",
        descLong: "Dynamic Tables (GA 2024) are a declarative approach to data pipelines. Instead of building a Tasks+Streams+MERGE pipeline manually, you define a Dynamic Table with a SQL query and a target lag ( freshness SLA). Snowflake automatically manages the refresh schedule, incremental processing, and dependency chain. Key advantages over Tasks+Streams: (1) Declarative — no need to write MERGE logic or handle stream empty states. (2) Automatic dependency tracking — if DT_B depends on DT_A, Snowflake refreshes DT_A first. (3) Target lag SLA — specify '5 min', '1 hour', or '1 day' and Snowflake optimizes refresh frequency. (4) Incremental by default — only processes changed data. (5) Automatic retries and error handling. Dynamic Tables are ideal for ELT transformations, dimensional model builds, and feature engineering pipelines. They replace the common pattern of CREATE TASK → CREATE STREAM → MERGE.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Create a daily summary table that auto-refreshes\n-- APPROACH  - Define a Dynamic Table with TARGET_LAG and WAREHOUSE\n-- STRENGTHS - Declarative; no tasks/streams/MERGE needed\n-- WEAKNESSES- Less control over refresh timing than tasks\n\nCREATE OR REPLACE DYNAMIC TABLE sales_daily_summary\nTARGET_LAG = '1 hour'\nWAREHOUSE = 'COMPUTE_WH'\nAS\nSELECT\n    DATE_TRUNC('DAY', order_date) AS sale_date,\n    category,\n    SUM(amount) AS total_sales,\n    COUNT(*) AS order_count,\n    AVG(amount) AS avg_order\nFROM raw_sales\nGROUP BY 1, 2;\n\n-- Snowflake automatically:\n-- 1. Creates the table with the query results\n-- 2. Refreshes every ~1 hour (or more frequently if data changes)\n-- 3. Processes only changed data (incremental)\n-- 4. Handles errors and retries automatically\n\n-- Check refresh status\nSELECT * FROM INFORMATION_SCHEMA.DYNAMIC_TABLES\nWHERE name = 'SALES_DAILY_SUMMARY';\n\n-- Check refresh history\nSELECT *\nFROM INFORMATION_SCHEMA.DYNAMIC_TABLE_REFRESH_HISTORY\nWHERE name = 'SALES_DAILY_SUMMARY'\nORDER BY refresh_time DESC;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Build a multi-layer dimensional model with dependency chains\n-- APPROACH  - Create staging DT, then dimensional DT that depends on it\n// STRENGTHS - Automatic dependency resolution; Snowflake refreshes in order\n// WEAKNESSES- All DTs must be in same schema for automatic dependency tracking\n\n-- Layer 1: Staging (cleans raw data)\nCREATE OR REPLACE DYNAMIC TABLE stg_sales_clean\nTARGET_LAG = '10 minutes'\nWAREHOUSE = 'COMPUTE_WH'\nAS\nSELECT\n    order_id,\n    TRIM(UPPER(customer_name)) AS customer_name,\n    amount,\n    order_date,\n    COALESCE(category, 'UNKNOWN') AS category\nFROM raw_sales\nWHERE amount > 0 AND order_date IS NOT NULL;\n\n-- Layer 2: Dimensional (aggregates from staging)\nCREATE OR REPLACE DYNAMIC TABLE dim_sales_by_category\nTARGET_LAG = '20 minutes'\nWAREHOUSE = 'COMPUTE_WH'\nAS\nSELECT\n    category,\n    DATE_TRUNC('MONTH', order_date) AS month,\n    SUM(amount) AS total_sales,\n    COUNT(DISTINCT customer_name) AS unique_customers\nFROM stg_sales_clean  -- references another Dynamic Table\nGROUP BY 1, 2;\n\n-- Snowflake automatically detects the dependency:\n-- stg_sales_clean → dim_sales_by_category\n-- Refreshes stg_sales_clean first, then dim_sales_by_category\n\n-- Layer 3: KPI rollup\nCREATE OR REPLACE DYNAMIC TABLE kpi_monthly\nTARGET_LAG = '30 minutes'\nWAREHOUSE = 'COMPUTE_WH'\nAS\nSELECT\n    month,\n    SUM(total_sales) AS grand_total,\n    SUM(unique_customers) AS total_customers,\n    SUM(total_sales) / NULLIF(SUM(unique_customers), 0) AS revenue_per_customer\nFROM dim_sales_by_category\nGROUP BY 1;\n\n-- View the dependency graph\nSELECT *\nFROM INFORMATION_SCHEMA.DYNAMIC_TABLE_GRAPH\nWHERE root_name = 'STG_SALES_CLEAN';",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Migrate from Tasks+Streams+MERGE to Dynamic Tables and optimize refresh\n-- APPROACH  - Replace imperative pipeline with declarative DT; tune lag and warehouse\n-- STRENGTHS - Simpler; automatic dependency; less code to maintain\n-- WEAKNESSES- DT refresh is serverless (uses specified warehouse); cost can vary\n\n-- BEFORE: Tasks + Streams + MERGE (imperative pipeline)\nCREATE STREAM sales_stream ON TABLE raw_sales;\nCREATE TASK refresh_sales_summary\n  WAREHOUSE = 'COMPUTE_WH'\n  SCHEDULE = '5 MINUTE'\n  WHEN SYSTEM$STREAM_HAS_DATA('sales_stream')\nAS\n  MERGE INTO sales_summary t\n  USING (\n    SELECT category, DATE_TRUNC('DAY', order_date) AS d, SUM(amount) AS s\n    FROM sales_stream\n    GROUP BY 1, 2\n  ) s\n  ON t.category = s.category AND t.sale_date = s.d\n  WHEN MATCHED THEN UPDATE SET total_sales = t.total_sales + s.s\n  WHEN NOT MATCHED THEN INSERT (category, sale_date, total_sales) VALUES (s.category, s.d, s.s);\nALTER TASK refresh_sales_summary RESUME;\n\n-- AFTER: Single Dynamic Table (declarative)\nCREATE OR REPLACE DYNAMIC TABLE sales_summary\nTARGET_LAG = '5 minutes'\nWAREHOUSE = 'COMPUTE_WH'\nAS\nSELECT\n    category,\n    DATE_TRUNC('DAY', order_date) AS sale_date,\n    SUM(amount) AS total_sales\nFROM raw_sales\nGROUP BY 1, 2;\n\n-- Drop old task and stream\nDROP TASK refresh_sales_summary;\nDROP STREAM sales_stream;\n\n-- Optimization: use serverless warehouse for cost efficiency\nCREATE OR REPLACE DYNAMIC TABLE sales_summary\nTARGET_LAG = '5 minutes'\nWAREHOUSE = 'COMPUTE_WH'  -- or use serverless: omit WAREHOUSE for serverless\nAS\nSELECT category, DATE_TRUNC('DAY', order_date) AS d, SUM(amount) AS s\nFROM raw_sales GROUP BY 1, 2;\n\n-- Monitor refresh performance and cost\nSELECT\n    name,\n    refresh_mode,  -- AUTO, FULL, or INCREMENTAL\n    target_lag,\n    actual_lag,\n    last_refresh_status,\n    average_refresh_duration_seconds\nFROM INFORMATION_SCHEMA.DYNAMIC_TABLES;\n\n-- Force a manual refresh if needed\nALTER DYNAMIC TABLE sales_summary REFRESH;",
          },
        ],
        tips: [
          "Dynamic Tables replace Tasks+Streams+MERGE — declarative pipelines with automatic dependency tracking.",
          "TARGET_LAG is an SLA, not a schedule — Snowflake refreshes as needed to meet the lag target.",
          "Dependencies are automatic: if DT_B reads from DT_A, Snowflake refreshes DT_A first.",
          "Use INFORMATION_SCHEMA.DYNAMIC_TABLE_REFRESH_HISTORY to monitor refresh status and duration.",
          "Omit WAREHOUSE to use serverless compute — Snowflake scales automatically but bills per-refresh.",
        ],
        mistake: "Setting TARGET_LAG too aggressively (e.g. '1 minute') for a complex aggregation on a large table — Snowflake may not meet the SLA and will log refresh failures. Start with a realistic lag and monitor actual_lag before tightening.",
        shorthand: {
          verbose: "-- Dynamic Table: declarative pipeline\nCREATE DYNAMIC TABLE dt_name TARGET_LAG = '1 hour' WAREHOUSE = 'wh' AS SELECT ... FROM source GROUP BY ...;\n-- Check status\nSELECT * FROM INFORMATION_SCHEMA.DYNAMIC_TABLES WHERE name = 'DT_NAME';",
          concise: "-- Quick DT\nCREATE DYNAMIC TABLE t TARGET_LAG='1h' WH='w' AS SELECT ... FROM src;",
        },
      },
      {
        id: "external-tables",
        fn: "CREATE EXTERNAL TABLE — query cloud storage without loading",
        desc: "External Tables read data directly from cloud storage (S3, Azure Blob, GCS) without copying it into Snowflake. Ideal for data lake querying with zero storage cost.",
        category: "Data Loading",
        subtitle: "EXTERNAL TABLE, external stage, parquet, CSV, partition, data lake, zero storage, metadata refresh",
        signature: "CREATE EXTERNAL TABLE name (col1 INT AS (parse_json(metadata$internal_text):col1)) LOCATION = @stage PARTITION BY (col)",
        descLong: "External Tables allow querying data stored in cloud storage (Amazon S3, Google Cloud Storage, Azure Blob Storage) without loading it into Snowflake's internal storage. The data stays in your data lake; Snowflake only stores metadata (file paths, partition info). Key characteristics: (1) Read-only — cannot INSERT, UPDATE, or DELETE. (2) Zero storage cost — data stays in cloud storage. (3) Partitioning — define partition columns to prune file scans. (4) Automatic refresh — can auto-discover new files via partition specs. (5) Supports all file formats (Parquet, CSV, JSON, Avro, ORC, XML). External Tables are ideal for: querying historical archives, exploring data lakes before loading, hybrid architectures where some data stays in cloud storage. For write access, load the data into a standard table using COPY INTO.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Query Parquet files in S3 without loading into Snowflake\n-- APPROACH  - Create an external stage, then an external table on top\n-- STRENGTHS - Zero storage cost; query data lake directly\n-- WEAKNESSES- Read-only; slower than internal tables for frequent queries\n\n-- Step 1: Create a storage integration (one-time)\nCREATE OR REPLACE STORAGE INTEGRATION s3_int\nTYPE = EXTERNAL_STAGE\nSTORAGE_PROVIDER = 'S3'\nENABLED = TRUE\nSTORAGE_AWS_ROLE_ARN = 'arn:aws:iam::123456789012:role/snowflake'\nSTORAGE_ALLOWED_LOCATIONS = ('s3://my-data-lake/sales/');\n\n-- Step 2: Create an external stage\nCREATE OR REPLACE STAGE ext_sales_stage\nSTORAGE_INTEGRATION = s3_int\nURL = 's3://my-data-lake/sales/'\nFILE_FORMAT = (TYPE = PARQUET);\n\n-- Step 3: Create external table\nCREATE OR REPLACE EXTERNAL TABLE ext_sales\n(\n    order_id INT AS (VALUE:order_id::INT),\n    customer_name STRING AS (VALUE:customer_name::STRING),\n    amount FLOAT AS (VALUE:amount::FLOAT),\n    order_date DATE AS (VALUE:order_date::DATE)\n)\nWITH LOCATION = @ext_sales_stage\nAUTO_REFRESH = TRUE\nFILE_FORMAT = (TYPE = PARQUET);\n\n-- Query like a regular table\nSELECT * FROM ext_sales WHERE amount > 1000 ORDER BY order_date DESC;\nSELECT category, SUM(amount) FROM ext_sales GROUP BY category;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Add partitioning to an external table for query pruning\n-- APPROACH  - Use PARTITION BY with expressions extracted from file paths\n-- STRENGTHS - Partition pruning dramatically speeds up queries\n-- WEAKNESSES- Requires consistent directory structure in cloud storage\n\n-- S3 structure: s3://my-data-lake/sales/year=2024/month=03/day=15/file.parquet\n\nCREATE OR REPLACE EXTERNAL TABLE ext_sales_partitioned\n(\n    order_id INT AS (VALUE:order_id::INT),\n    amount FLOAT AS (VALUE:amount::FLOAT),\n    -- Partition columns derived from file path\n    sale_year INT AS (split_part(metadata$filename, '/', 2)::INT),\n    sale_month INT AS (split_part(metadata$filename, '/', 3)::INT),\n    sale_day INT AS (split_part(metadata$filename, '/', 4)::INT)\n)\nPARTITION BY (sale_year, sale_month, sale_day)\nWITH LOCATION = @ext_sales_stage\nAUTO_REFRESH = TRUE\nFILE_FORMAT = (TYPE = PARQUET);\n\n-- Partition pruning: only scans relevant directories\nSELECT * FROM ext_sales_partitioned\nWHERE sale_year = 2024 AND sale_month = 3;\n-- Scans only s3://my-data-lake/sales/year=2024/month=03/ files\n\n-- Manual refresh to discover new files\nALTER EXTERNAL TABLE ext_sales_partitioned REFRESH;\n\n-- Refresh specific partitions only\nALTER EXTERNAL TABLE ext_sales_partitioned REFRESH\nPARTITIONS = (sale_year = 2024, sale_month = 4);",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a hybrid data lake + warehouse architecture with external tables\n-- APPROACH  - Use external tables for cold data, COPY INTO for hot data\n-- STRENGTHS - Cost-optimized; hot data in Snowflake, cold in data lake\n// WEAKNESSES- Requires monitoring both Snowflake and cloud storage costs\n\n-- Pattern: Hot data (last 90 days) in Snowflake, cold data in S3\n\n-- Hot table: loaded via COPY INTO (fast queries, storage cost)\nCREATE TABLE sales_hot AS\nSELECT * FROM ext_sales_partitioned\nWHERE sale_year = 2024 AND sale_month >= 1;\n\n-- Create a unified view across hot + cold\nCREATE OR REPLACE VIEW sales_all AS\nSELECT * FROM sales_hot  -- last 90 days in Snowflake\nUNION ALL\nSELECT * FROM ext_sales_partitioned  -- historical in S3\nWHERE sale_year < 2024 OR (sale_year = 2024 AND sale_month < 1);\n\n-- Automate hot/cold migration with a task\nCREATE OR REPLACE TASK migrate_cold_data\nWAREHOUSE = 'COMPUTE_WH'\nSCHEDULE = 'DAILY'\nAS\nBEGIN\n    -- Move data older than 90 days from hot to cold (just delete from hot)\n    DELETE FROM sales_hot\n    WHERE order_date < DATEADD('DAY', -90, CURRENT_DATE());\n\n    -- The data still exists in ext_sales_partitioned (S3)\n    -- No need to copy — it's already in the data lake\nEND;\nALTER TASK migrate_cold_data RESUME;\n\n-- Monitor external table metadata\nSELECT\n    table_name,\n    partition_column_count,\n    last_refreshed,\n    total_file_count,\n    total_file_size_mb\nFROM INFORMATION_SCHEMA.EXTERNAL_TABLES;\n\n-- Cost optimization: use search optimization on external tables\nALTER EXTERNAL TABLE ext_sales_partitioned\nADD SEARCH OPTIMIZATION ON EQUALITY(order_id);",
          },
        ],
        tips: [
          "External Tables are read-only — use COPY INTO to load data into a standard table for writes.",
          "Use PARTITION BY with path-derived columns for partition pruning — dramatically reduces scanned data.",
          "AUTO_REFRESH = TRUE uses event notifications (S3, GCS, Azure) to auto-discover new files.",
          "Zero Snowflake storage cost — data stays in your cloud storage; Snowflake only stores metadata.",
          "Use ALTER EXTERNAL TABLE ... REFRESH to manually discover new files when AUTO_REFRESH is off.",
        ],
        mistake: "Querying an external table without partition filters — Snowflake scans ALL files in the stage, which can be extremely expensive for large data lakes. Always include partition column filters in WHERE clauses.",
        shorthand: {
          verbose: "-- External table on S3 Parquet\nCREATE EXTERNAL TABLE ext_t (id INT AS (VALUE:id::INT), val FLOAT AS (VALUE:val::FLOAT))\nWITH LOCATION = @ext_stage FILE_FORMAT = (TYPE = PARQUET) AUTO_REFRESH = TRUE;\n-- Partitioned\nCREATE EXTERNAL TABLE ext_t (...) PARTITION BY (year, month) WITH LOCATION = @stage ...",
          concise: "-- Quick external table\nCREATE EXTERNAL TABLE t (c1 AS (VALUE:c1::INT)) WITH LOCATION = @s FILE_FORMAT = (TYPE = PARQUET);",
        },
      },
    ],
  },

  // ── Section 14: Resource Monitors & Cost Optimization ─────────────────────────────────────────
  {
    id: "cost-optimization",
    title: "Resource Monitors & Cost Optimization",
    entries: [
      {
        id: "resource-monitors",
        fn: "CREATE RESOURCE MONITOR — credit budgets and alerts",
        desc: "Resource Monitors track and enforce credit usage across warehouses or entire accounts. Set quotas, trigger alerts at thresholds, and auto-suspend when limits are reached.",
        category: "Governance",
        subtitle: "RESOURCE MONITOR, credit quota, suspend, notify, warehouse, account-level, budget, alert",
        signature: "CREATE RESOURCE MONITOR name WITH CREDIT_QUOTA = 500 FREQUENCY = 'MONTHLY' START_TIMESTAMP = ...",
        descLong: "Resource Monitors are Snowflake's cost control mechanism. They track credit consumption (compute + serverless + cloud services) and can trigger actions at defined thresholds (25%, 50%, 75%, 90%, 100%). Actions include: NOTIFY (email notification), SUSPEND (pause warehouses), SUSPEND_IMMEDIATE (kill running queries + pause). Monitors can be scoped to: (1) Account-level — all credit usage across the account. (2) Warehouse-level — credits used by a specific warehouse. Quotas are set in credits and reset based on frequency (DAILY, WEEKLY, MONTHLY). Key use cases: preventing runaway costs from forgotten warehouses, budget enforcement for departments, and cost anomaly detection. Resource Monitors are especially important for auto-scale warehouses that can consume credits rapidly.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Set a monthly credit budget with email alerts\n-- APPROACH  - Create an account-level resource monitor with thresholds\n-- STRENGTHS - Prevents runaway costs; email alerts at each threshold\n-- WEAKNESSES- Email notifications only; no Slack/PagerDuty integration\n\nCREATE OR REPLACE RESOURCE MONITOR monthly_budget\nWITH CREDIT_QUOTA = 500  -- 500 credits per month\nFREQUENCY = 'MONTHLY'\nSTART_TIMESTAMP = '2024-01-01 00:00'\nTRIGGER ON 50 PERCENT DO NOTIFY\nTRIGGER ON 75 PERCENT DO NOTIFY\nTRIGGER ON 90 PERCENT DO NOTIFY\nTRIGGER ON 100 PERCENT DO SUSPEND  -- pause all warehouses\nTRIGGER ON 110 PERCENT DO SUSPEND_IMMEDIATE;  -- kill queries + pause\n\n-- Apply to account\nALTER ACCOUNT SET RESOURCE MONITOR monthly_budget;\n\n-- Check usage\nSHOW RESOURCE MONITORS;\nSELECT * FROM TABLE(INFORMATION_SCHEMA.RESOURCE_MONITOR_USAGE_HISTORY('monthly_budget'));",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Set per-warehouse credit limits for departmental cost control\n-- APPROACH  - Create warehouse-level resource monitors\n-- STRENGTHS - Granular control; each department has its own budget\n// WEAKNESSES- Must create a monitor per warehouse\n\n-- Marketing warehouse: 100 credits/month\nCREATE OR REPLACE RESOURCE MONITOR marketing_budget\nWITH CREDIT_QUOTA = 100\nFREQUENCY = 'MONTHLY'\nTRIGGER ON 80 PERCENT DO NOTIFY\nTRIGGER ON 100 PERCENT DO SUSPEND;\n\nALTER WAREHOUSE marketing_wh SET RESOURCE MONITOR marketing_budget;\n\n-- Data Science warehouse: 200 credits/month\nCREATE OR REPLACE RESOURCE MONITOR ds_budget\nWITH CREDIT_QUOTA = 200\nFREQUENCY = 'MONTHLY'\nTRIGGER ON 80 PERCENT DO NOTIFY\nTRIGGER ON 100 PERCENT DO SUSPEND;\n\nALTER WAREHOUSE ds_wh SET RESOURCE MONITOR ds_budget;\n\n-- Monitor all resource monitors\nSELECT\n    name,\n    credit_quota,\n    credit_used,\n    credit_remaining,\n    frequency,\n    notify_at,\n    suspend_at,\n    suspend_immediate_at\nFROM TABLE(INFORMATION_SCHEMA.RESOURCE_MONITOR_USAGE_HISTORY(\n    'marketing_budget',\n    DATEADD('DAY', -30, CURRENT_TIMESTAMP()),\n    CURRENT_TIMESTAMP()\n));",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a comprehensive cost optimization framework\n-- APPROACH  - Combine resource monitors, warehouse right-sizing, and ACCOUNT_USAGE queries\n-- STRENGTHS - Full cost visibility; automated enforcement; production-grade\n-- WEAKNESSES- Requires ongoing tuning and monitoring\n\n-- 1. Account-level hard cap\nCREATE OR REPLACE RESOURCE MONITOR account_cap\nWITH CREDIT_QUOTA = 5000 FREQUENCY = 'MONTHLY'\nTRIGGER ON 85 PERCENT DO NOTIFY\nTRIGGER ON 100 PERCENT DO SUSPEND_IMMEDIATE;\nALTER ACCOUNT SET RESOURCE MONITOR account_cap;\n\n-- 2. Find wasted credits: warehouses running with no queries\nSELECT\n    warehouse_name,\n    SUM(credits_used) AS total_credits,\n    SUM(credits_used_cloud_services) AS cloud_service_credits,\n    AVG(running) AS avg_running_minutes,\n    AVG(idle) AS avg_idle_minutes\nFROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY\nWHERE start_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY total_credits DESC;\n\n-- 3. Identify long-running queries consuming excess credits\nSELECT\n    query_id,\n    query_text,\n    warehouse_name,\n    warehouse_size,\n    execution_status,\n    total_elapsed_time / 1000 AS seconds,\n    credits_used_cloud_services AS credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\n    AND total_elapsed_time > 600000  -- > 10 minutes\n    AND execution_status = 'SUCCESS'\nORDER BY total_elapsed_time DESC\nLIMIT 20;\n\n-- 4. Right-size warehouses based on actual load\nSELECT\n    w.name AS warehouse_name,\n    w.size AS configured_size,\n    AVG(q.total_elapsed_time) AS avg_query_seconds,\n    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY q.total_elapsed_time / 1000) AS p95_seconds,\n    COUNT(*) AS query_count\nFROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSES w\nJOIN SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY q ON w.name = q.warehouse_name\nWHERE q.start_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nGROUP BY 1, 2;\n-- If avg query time < 10s and query_count is low → downsize warehouse\n\n-- 5. Auto-suspend tuning: warehouses with high idle time\nSELECT\n    warehouse_name,\n    SUM(idle) / 60 AS total_idle_minutes,\n    SUM(running) / 60 AS total_running_minutes,\n    SUM(idle) / NULLIF(SUM(running) + SUM(idle), 0) * 100 AS idle_pct\nFROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY\nWHERE start_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nGROUP BY 1 HAVING idle_pct > 50\nORDER BY idle_pct DESC;\n-- Warehouses with >50% idle time → reduce auto-suspend to 60s or 1min",
          },
        ],
        tips: [
          "Account-level monitors cover ALL credit usage; warehouse-level monitors only track that warehouse.",
          "SUSPEND pauses the warehouse after current queries finish; SUSPEND_IMMEDIATE kills running queries immediately.",
          "Credit quotas reset at the start of each frequency period (daily/weekly/monthly).",
          "Use ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY to find warehouses with high idle time — reduce auto-suspend.",
          "Serverless features (Snowpipe, tasks, auto-clustering) consume credits not tied to a warehouse — only account-level monitors catch them.",
        ],
        mistake: "Setting only a 100% threshold with SUSPEND — queries already running will complete, potentially exceeding the quota by 10-20%. Set a 90% NOTIFY + 100% SUSPEND to get early warning.",
        shorthand: {
          verbose: "-- Resource monitor with alerts\nCREATE RESOURCE MONITOR budget WITH CREDIT_QUOTA = 500 FREQUENCY = 'MONTHLY'\nTRIGGER ON 80 PERCENT DO NOTIFY TRIGGER ON 100 PERCENT DO SUSPEND;\nALTER ACCOUNT SET RESOURCE MONITOR budget;",
          concise: "-- Quick monitor\nCREATE RESOURCE MONITOR m WITH CREDIT_QUOTA=500 FREQUENCY='MONTHLY' TRIGGER ON 100 PERCENT DO SUSPEND;",
        },
      },
    ],
  },

  // ── Section 15: Materialized Views & Replication ─────────────────────────────────────────
  {
    id: "mv-replication",
    title: "Materialized Views & Replication",
    entries: [
      {
        id: "materialized-views",
        fn: "CREATE MATERIALIZED VIEW — cached query results with auto-refresh",
        desc: "Snowflake Materialized Views automatically refresh when base tables change. They use incremental refresh maintained by Snowflake's serverless compute.",
        category: "Performance",
        subtitle: "MATERIALIZED VIEW, refresh, incremental, serverless, micro-partition, query acceleration, maintenance cost",
        signature: "CREATE MATERIALIZED VIEW name AS SELECT ... FROM base_table GROUP BY ...",
        descLong: "Snowflake Materialized Views (MVs) are pre-computed result sets that accelerate query performance. Unlike traditional MVs, Snowflake MVs are automatically and incrementally refreshed by serverless compute. When base table data changes, Snowflake updates only the affected micro-partitions. Key characteristics: (1) Single base table only — no joins. (2) Automatic incremental refresh via serverless compute. (3) Query optimizer transparently rewrites queries to use MVs. (4) Limited DML — no direct INSERT/UPDATE/DELETE. (5) Aggregates limited to SUM, COUNT, MIN, MAX, AVG, ANY_VALUE. MVs are ideal for expensive aggregations queried frequently. For multi-table joins, use Dynamic Tables instead.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Speed up a frequently-run aggregation query\n-- APPROACH  - Create a materialized view on the base table\n-- STRENGTHS - Auto-refresh; transparent query rewrite\n-- WEAKNESSES- Single base table only; serverless refresh costs credits\n\nCREATE OR REPLACE MATERIALIZED VIEW mv_sales_monthly\nAS\nSELECT\n    category,\n    DATE_TRUNC('MONTH', order_date) AS month,\n    SUM(amount) AS total_sales,\n    COUNT(*) AS order_count\nFROM raw_sales\nGROUP BY 1, 2;\n\n-- Query transparently uses MV (optimizer rewrites)\nSELECT * FROM mv_sales_monthly WHERE category = 'Electronics'\nORDER BY month DESC;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Create MVs for different query patterns and monitor refresh costs\n-- APPROACH  - Multiple MVs for different aggregation levels + monitor serverless costs\n-- STRENGTHS - Each MV optimized for its query pattern\n-- WEAKNESSES- Each MV adds storage + refresh cost\n\nCREATE OR REPLACE MATERIALIZED VIEW mv_sales_daily\nAS\nSELECT\n    DATE_TRUNC('DAY', order_date) AS sale_date,\n    region,\n    SUM(amount) AS daily_total,\n    COUNT(DISTINCT customer_id) AS unique_customers\nFROM raw_sales\nGROUP BY 1, 2;\n\n-- Monitor MV refresh costs\nSELECT\n    table_name,\n    bytes,\n    refresh_time_seconds,\n    credits_used\nFROM SNOWFLAKE.ACCOUNT_USAGE.MATERIALIZED_VIEW_REFRESH_HISTORY\nWHERE start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\nORDER BY credits_used DESC;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build an MV strategy with cost-benefit analysis and drop unused MVs\n-- APPROACH  - Track MV usage, refresh costs, and storage to optimize ROI\n-- STRENGTHS - Data-driven MV management; eliminates waste\n-- WEAKNESSES- Requires ACCOUNT_USAGE access and ongoing analysis\n\n-- Find MVs that are never queried (wasting refresh + storage credits)\nSELECT\n    m.table_name AS mv_name,\n    COUNT(q.query_id) AS query_count,\n    SUM(r.credits_used) AS refresh_credits,\n    AVG(r.bytes) / 1e9 AS storage_gb\nFROM SNOWFLAKE.ACCOUNT_USAGE.MATERIALIZED_VIEWS m\nLEFT JOIN SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY q\n    ON q.query_text ILIKE '%' || m.table_name || '%'\n    AND q.start_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nLEFT JOIN SNOWFLAKE.ACCOUNT_USAGE.MATERIALIZED_VIEW_REFRESH_HISTORY r\n    ON r.table_name = m.table_name\nGROUP BY 1\nORDER BY refresh_credits DESC;\n\n-- MV constraints:\n-- 1. Single base table only (no joins)\n-- 2. No ORDER BY in MV definition\n-- 3. Aggregates: SUM, COUNT, MIN, MAX, AVG, ANY_VALUE only\n-- 4. Cannot create MV on external table or another MV\n-- For joins, use Dynamic Tables or regular tables with tasks",
          },
        ],
        tips: [
          "Snowflake MVs auto-refresh incrementally using serverless compute — no manual maintenance needed.",
          "MVs support single base table only — for multi-table joins, use Dynamic Tables or tasks.",
          "The query optimizer transparently rewrites queries to use MVs — no application changes needed.",
          "Each MV adds storage + refresh cost — monitor with ACCOUNT_USAGE.MATERIALIZED_VIEW_REFRESH_HISTORY.",
          "Aggregate functions in MVs: SUM, COUNT, MIN, MAX, AVG, ANY_VALUE — no MEDIAN, PERCENTILE, or window functions.",
        ],
        mistake: "Creating an MV on a query with JOINs — Snowflake MVs only support a single base table. Use Dynamic Tables (which support joins) or create a regular table refreshed by a task instead.",
        shorthand: {
          verbose: "-- Materialized view with auto-refresh\nCREATE MATERIALIZED VIEW mv_name AS SELECT col, SUM(amt) FROM base GROUP BY col;\n-- Query transparently uses MV\nSELECT * FROM mv_name WHERE col = 'x';",
          concise: "-- Quick MV\nCREATE MATERIALIZED VIEW mv AS SELECT c, SUM(a) FROM t GROUP BY c;",
        },
      },
      {
        id: "replication-failover",
        fn: "Database Replication & Failover — cross-region business continuity",
        desc: "Snowflake replication copies databases across regions/accounts for disaster recovery. Failover promotes a secondary database to primary.",
        category: "Disaster Recovery",
        subtitle: "REPLICATION, FAILOVER, secondary database, cross-region, cross-cloud, business continuity, refresh schedule, ORGADMIN",
        signature: "CREATE DATABASE secondary AS REPLICA OF primary ACCOUNT (org.account.region.db)",
        descLong: "Snowflake replication enables cross-region and cross-account database copies for disaster recovery (DR) and business continuity. The primary database is the source; secondary databases are read-only replicas refreshed on a schedule. In failover, a secondary is promoted to primary. Key concepts: (1) Replication groups — replicate multiple databases together with roles/warehouses. (2) Refresh schedule — automatic or manual. (3) Failover — promotes secondary to primary (requires FAILOVER privilege). (4) Time Travel and data sharing preserved in replicas. (5) Storage billing — secondary databases incur storage costs in their region. Managed at the organization level using ORGADMIN role.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Set up cross-region replication for disaster recovery\n-- APPROACH  - Enable replication on primary, create secondary in target region\n-- STRENGTHS - Automated DR; cross-region/cross-cloud\n-- WEAKNESSES- Secondary is read-only until failover; storage costs in both regions\n\n-- On primary account (source region):\nUSE ROLE ORGADMIN;\nALTER DATABASE sales_db ENABLE REPLICATION TO ACCOUNTS\n    my_org.my_account_aws_us_west,\n    my_org.my_account_azure_east;\n\n-- On secondary account (target region):\nUSE ROLE ORGADMIN;\nCREATE DATABASE sales_db_secondary\nAS REPLICA OF my_org.my_account_aws_us_east.sales_db;\n\n-- Set automatic refresh (every 30 minutes)\nALTER DATABASE sales_db_secondary SET REFRESH_INTERVAL = 30;\n\n-- Manual refresh\nALTER DATABASE sales_db_secondary REFRESH;\n\n-- Check replication status\nSHOW REPLICATION DATABASES;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Set up replication groups for multiple databases with shared objects\n-- APPROACH  - Use CREATE REPLICATION GROUP to replicate databases + roles + warehouses\n-- STRENGTHS - Replicates related objects together; consistent state\n-- WEAKNESSES- Requires ORGADMIN; complex setup\n\n-- On primary account:\nUSE ROLE ORGADMIN;\nCREATE REPLICATION GROUP my_rg\nFOR DATABASES sales_db, ref_db\nREPLICATE TO ACCOUNTS my_org.dr_account_aws_west\n    WITH FAILOVER;\n\n-- Add warehouses and roles\nALTER REPLICATION GROUP my_rg\nADD WAREHOUSES wh1, wh2\nADD ROLES role_analyst, role_admin;\n\n-- On secondary account:\nCREATE DATABASE GROUP my_rg_secondary\nAS REPLICA OF my_org.primary_account.my_rg;\n\n-- Monitor refresh lag\nSELECT\n    database_name,\n    refresh_started_at,\n    refresh_completed_at,\n    DATEDIFF('MINUTE', refresh_started_at, refresh_completed_at) AS refresh_minutes,\n    bytes_transferred\nFROM TABLE(INFORMATION_SCHEMA.REPLICATION_REFRESH_HISTORY(\n    'my_rg_secondary',\n    DATEADD('DAY', -7, CURRENT_TIMESTAMP()),\n    CURRENT_TIMESTAMP()\n))\nORDER BY refresh_started_at DESC;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Execute a full failover drill and verify business continuity\n-- APPROACH  - Promote secondary to primary, redirect clients, verify data\n-- STRENGTHS - Full DR drill; validates RTO/RPO\n-- WEAKNESSES- Failover is disruptive; schedule during maintenance window\n\n-- Step 1: Stop writes on primary (application-level quiesce)\n-- Step 2: Final refresh on secondary\nALTER DATABASE sales_db_secondary REFRESH;\n\n-- Step 3: Verify secondary is up-to-date\nSELECT database_name, primary_database_last_refresh_time,\n    secondary_database_last_refresh_time\nFROM TABLE(INFORMATION_SCHEMA.REPLICATION_REFRESH_HISTORY('sales_db_secondary'))\nORDER BY refresh_completed_at DESC LIMIT 1;\n\n-- Step 4: Promote secondary to primary (FAILOVER)\nUSE ROLE ORGADMIN;\nALTER DATABASE sales_db_secondary FAILOVER;\n-- Now sales_db_secondary is primary (read-write)\n-- Old primary becomes secondary (read-only)\n\n-- Step 5: Redirect application connections to new primary account\n-- Update connection strings: account=xy12345.us-west-2.aws\n\n-- Step 6: Verify data integrity\nSELECT COUNT(*) FROM sales_db.public.orders;\nSELECT MAX(order_date) FROM sales_db.public.orders;\n\n-- Step 7: Re-establish replication in reverse\nALTER DATABASE sales_db REFRESH;  -- sync from new primary\n\n-- Ongoing DR monitoring task\nCREATE OR REPLACE TASK dr_monitoring\nWAREHOUSE = 'COMPUTE_WH'\nSCHEDULE = 'HOURLY'\nAS\nINSERT INTO dr_audit (check_time, lag_seconds, status)\nSELECT CURRENT_TIMESTAMP(),\n    DATEDIFF('SECOND', primary_last_refresh, secondary_last_refresh),\n    CASE WHEN DATEDIFF('SECOND', primary_last_refresh, secondary_last_refresh) < 1800\n         THEN 'OK' ELSE 'LAG_WARNING' END\nFROM TABLE(INFORMATION_SCHEMA.REPLICATION_REFRESH_HISTORY('sales_db_secondary'))\nLIMIT 1;\nALTER TASK dr_monitoring RESUME;",
          },
        ],
        tips: [
          "Replication requires ORGADMIN role — only organization admins can enable and manage replication.",
          "Secondary databases are read-only until failover — applications must redirect after failover.",
          "Use replication groups to replicate multiple databases + roles + warehouses together for consistent DR.",
          "Refresh interval determines RPO — shorter interval = less data loss but more cost.",
          "Failover is irreversible — the old primary becomes a secondary replica of the new primary.",
        ],
        mistake: "Forgetting to update application connection strings after failover — the old primary is now read-only, so writes will fail. Always test connection string updates as part of the DR runbook.",
        shorthand: {
          verbose: "-- Replication setup\nALTER DATABASE db ENABLE REPLICATION TO ACCOUNTS org.dr_account;\n-- On secondary:\nCREATE DATABASE db_sec AS REPLICA OF org.primary.db;\nALTER DATABASE db_sec SET REFRESH_INTERVAL = 30;\n-- Failover:\nALTER DATABASE db_sec FAILOVER;",
          concise: "-- Quick replication\nCREATE DATABASE s AS REPLICA OF org.acct.db; ALTER DATABASE s REFRESH;",
        },
      },
    ],
  },

  // ── Section 16: Cortex AI & ML ─────────────────────────────────────────
  {
    id: "cortex-ai",
    title: "Cortex AI & ML",
    entries: [
      {
        id: "cortex-ai-functions",
        fn: "Snowflake Cortex — built-in AI/ML functions",
        desc: "Snowflake Cortex provides serverless AI/ML functions (sentiment, summarization, translation, embeddings, LLM completion) that run inside Snowflake — no data movement, no external API calls.",
        category: "AI/ML",
        subtitle: "Cortex, sentiment, summarize, translate, embed, complete, LLM, serverless AI, data privacy, no egress, RAG",
        signature: "SELECT SNOWFLAKE.CORTEX.SENTIMENT(text_column) FROM table",
        descLong: "Snowflake Cortex is a managed AI/ML service built directly into Snowflake. It provides serverless functions for common NLP tasks without moving data outside Snowflake or managing infrastructure. Available functions: (1) SENTIMENT(text) — returns -1 to 1 sentiment score. (2) SUMMARIZE(text) — generates a summary. (3) TRANSLATE(text, source_lang, target_lang) — translates between languages. (4) EMBED_TEXT_768(text) — generates 768-dimensional vector embeddings for similarity search. (5) COMPLETE(prompt, model) — LLM text completion (Mistral, Llama, Mixtral). Key advantages: no data egress, serverless (billed per-use), SQL-native. Ideal for batch sentiment analysis, document summarization, multilingual processing, and RAG with vector embeddings.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Analyze customer review sentiment at scale\n-- APPROACH  - Use CORTEX.SENTIMENT on a text column\n-- STRENGTHS - Serverless; no data movement; SQL-native\n-- WEAKNESSES- Per-use billing; limited model selection\n\nSELECT\n    review_id,\n    review_text,\n    SNOWFLAKE.CORTEX.SENTIMENT(review_text) AS sentiment_score\nFROM customer_reviews\nWHERE review_date >= '2024-01-01'\nLIMIT 100;\n-- sentiment_score: -1.0 (very negative) to 1.0 (very positive)\n\n-- Categorize sentiment\nSELECT\n    CASE\n        WHEN SNOWFLAKE.CORTEX.SENTIMENT(review_text) > 0.3 THEN 'Positive'\n        WHEN SNOWFLAKE.CORTEX.SENTIMENT(review_text) < -0.3 THEN 'Negative'\n        ELSE 'Neutral'\n    END AS sentiment_category,\n    COUNT(*) AS review_count\nFROM customer_reviews\nWHERE review_date >= '2024-01-01'\nGROUP BY 1 ORDER BY review_count DESC;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Summarize support tickets and translate to English\n-- APPROACH  - Use CORTEX.SUMMARIZE and CORTEX.TRANSLATE\n-- STRENGTHS - Multilingual; handles long text\n-- WEAKNESSES- Summary quality varies by input length and domain\n\n-- Summarize long support tickets\nSELECT\n    ticket_id,\n    LEFT(ticket_text, 100) AS text_preview,\n    SNOWFLAKE.CORTEX.SUMMARIZE(ticket_text) AS summary\nFROM support_tickets\nWHERE status = 'closed' AND LENGTH(ticket_text) > 500\nLIMIT 50;\n\n-- Translate non-English reviews to English\nSELECT\n    review_id,\n    review_text,\n    SNOWFLAKE.CORTEX.TRANSLATE(review_text, 'auto', 'en') AS english_text\nFROM customer_reviews\nWHERE detected_language != 'en'\nLIMIT 100;\n\n-- Combine: translate then summarize\nSELECT\n    ticket_id,\n    SNOWFLAKE.CORTEX.SUMMARIZE(\n        SNOWFLAKE.CORTEX.TRANSLATE(ticket_text, 'auto', 'en')\n    ) AS english_summary\nFROM support_tickets\nWHERE detected_language != 'en';",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a RAG (Retrieval-Augmented Generation) pipeline with Cortex\n-- APPROACH  - Generate embeddings, store in vector column, search with similarity, generate answer\n-- STRENGTHS - Full RAG inside Snowflake; no external vector DB\n-- WEAKNESSES- Vector search is brute-force (no ANN index yet)\n\n-- Step 1: Generate embeddings for knowledge base\nCREATE OR REPLACE TABLE kb_embeddings AS\nSELECT\n    doc_id,\n    doc_title,\n    doc_text,\n    SNOWFLAKE.CORTEX.EMBED_TEXT_768(doc_text) AS embedding\nFROM knowledge_base\nWHERE doc_text IS NOT NULL;\n\n-- Step 2: RAG — retrieve relevant docs and generate answer\nSELECT\n    SNOWFLAKE.CORTEX.COMPLETE(\n        CONCAT(\n            'Answer based on these documents:\\n',\n            STRING_AGG(doc_title || ': ' || LEFT(doc_text, 500), '\\n---\\n'),\n            '\\n\\nQuestion: How do I configure SSO?\\nAnswer:'\n        ),\n        'mixtral-8x7b'\n    ) AS rag_answer\nFROM (\n    SELECT doc_title, doc_text\n    FROM kb_embeddings\n    ORDER BY VECTOR_COSINE_SIMILARITY(\n        embedding,\n        SNOWFLAKE.CORTEX.EMBED_TEXT_768('How do I configure SSO?')\n    ) DESC\n    LIMIT 5\n);\n\n-- Monitor Cortex usage and costs\nSELECT\n    function_name,\n    credits_used,\n    rows_processed,\n    AVG(duration_ms) AS avg_duration\nFROM SNOWFLAKE.ACCOUNT_USAGE.CORTEX_QUERY_HISTORY\nWHERE start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY credits_used DESC;",
          },
        ],
        tips: [
          "Cortex functions are serverless — no warehouse needed, billed per-use (per row or per token).",
          "SENTIMENT returns -1 to 1; SUMMARIZE handles up to 8K tokens; TRANSLATE supports 20+ languages.",
          "EMBED_TEXT_768 generates vectors for similarity search — use VECTOR_COSINE_SIMILARITY for matching.",
          "COMPLETE supports multiple LLM models (Mistral, Llama, Mixtral) — choose based on quality vs cost.",
          "All processing happens inside Snowflake — no data egress, no external API calls, full data governance.",
        ],
        mistake: "Running Cortex functions on a large warehouse — Cortex is serverless and bills per-use regardless. Use the smallest warehouse that can run the SQL wrapper to avoid double billing.",
        shorthand: {
          verbose: "-- Cortex AI functions\nSELECT SNOWFLAKE.CORTEX.SENTIMENT(text) FROM t;\nSELECT SNOWFLAKE.CORTEX.SUMMARIZE(text) FROM t;\nSELECT SNOWFLAKE.CORTEX.TRANSLATE(text, 'auto', 'en') FROM t;\nSELECT SNOWFLAKE.CORTEX.EMBED_TEXT_768(text) FROM t;\nSELECT SNOWFLAKE.CORTEX.COMPLETE(prompt, 'mixtral-8x7b') FROM t;",
          concise: "-- Quick Cortex\nSELECT SNOWFLAKE.CORTEX.SENTIMENT(t) AS s FROM tbl;",
        },
      },
    ],
  },

  // ── Section 17: Network Security & SSO ─────────────────────────────────────────
  {
    id: "network-security",
    title: "Network Security & SSO",
    entries: [
      {
        id: "network-policies",
        fn: "CREATE NETWORK POLICY — IP-based access control",
        desc: "Network Policies restrict Snowflake access to specific IP ranges (allow/deny lists). Apply at account or user level for defense-in-depth.",
        category: "Security",
        subtitle: "NETWORK POLICY, IP allowlist, IP blocklist, CIDR, account-level, user-level, SCIM, SSO, SAML, OAuth",
        signature: "CREATE NETWORK POLICY name ALLOWED_IP_LIST = ('10.0.0.0/8', '192.168.1.0/24') BLOCKED_IP_LIST = ('10.1.2.3')",
        descLong: "Network Policies are Snowflake's IP-based access control mechanism. They allow or deny connections based on source IP addresses (CIDR notation). Policies can be applied at: (1) Account-level — affects all users. (2) User-level — overrides account policy for specific users. Key features: multiple allowed/blocked IP ranges, CIDR notation support, and activation via ALTER ACCOUNT or ALTER USER. Combined with SSO (SAML 2.0, OAuth) and SCIM (automated user provisioning), Network Policies form a comprehensive security perimeter. Common patterns: restrict to corporate VPN IP range, allow specific service accounts from cloud IPs, block known bad IPs. Network Policies are evaluated at connection time — no query overhead.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Restrict Snowflake access to corporate network only\n-- APPROACH  - Create a network policy with allowed IP ranges\n-- STRENGTHS - Simple; blocks all non-corporate access\n-- WEAKNESSES- Must update when corporate IP changes\n\nCREATE OR REPLACE NETWORK POLICY corporate_access\nALLOWED_IP_LIST = ('10.0.0.0/8', '192.168.1.0/24', '203.0.113.50')\nBLOCKED_IP_LIST = ('10.1.2.3')  -- specific blocked IP within allowed range\nCOMMENT = 'Restrict to corporate VPN and office networks';\n\n-- Apply to account\nALTER ACCOUNT SET NETWORK POLICY corporate_access;\n\n-- View active policies\nSHOW NETWORK POLICIES;\nDESC NETWORK POLICY corporate_access;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Set up SSO with SAML 2.0 and SCIM user provisioning\n-- APPROACH  - Configure SAML integration + SCIM security integration\n-- STRENGTHS - Centralized identity management; no separate Snowflake passwords\n-- WEAKNESSES- Requires IdP configuration (Okta, Azure AD, etc.)\n\n-- Step 1: Create SAML2 SSO integration\nCREATE OR REPLACE SECURITY INTEGRATION my_sso\nTYPE = SAML2\nENABLED = TRUE\nSAML2_ISSUER = 'https://mycompany.okta.com/exk123'\nSAML2_SSO_URL = 'https://mycompany.okta.com/app/snowflake/exk123/sso/saml'\nSAML2_PROVIDER = 'OKTA'\nSAML2_X509_CERT = 'MIID...'\nSAML2_SP_INITIATED_LOGIN_PAGE_LABEL = 'Okta SSO'\nSAML2_ENABLE_SP_INITIATED = TRUE;\n\n-- Step 2: Create SCIM integration for automated user provisioning\nCREATE OR REPLACE SECURITY INTEGRATION okta_scim\nTYPE = SCIM\nSCIM_CLIENT = 'OKTA'\nRUN_AS_ROLE = 'OKTA_PROVISIONER'\nNETWORK_POLICY = 'corporate_access';\n\n-- Get the bearer token for IdP configuration\nSELECT INTEGRATION_PROPERTY_VALUE\nFROM TABLE(INFORMATION_SCHEMA.INTEGRATION_PROPERTIES('okta_scim'))\nWHERE INTEGRATION_PROPERTY_NAME = 'BEARER_TOKEN';\n\n-- Step 3: Set per-user network policy (override account-level)\nCREATE OR REPLACE NETWORK POLICY service_account_access\nALLOWED_IP_LIST = ('0.0.0.0/0')  -- service account can connect from anywhere\nCOMMENT = 'Service accounts bypass corporate IP restriction';\n\nALTER USER etl_service_account SET NETWORK POLICY service_account_access;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a comprehensive access control framework with network + SSO + SCIM + OAuth\n-- APPROACH  - Layered security: network policies, SSO, SCIM, OAuth, and monitoring\n-- STRENGTHS - Defense-in-depth; automated provisioning; full audit trail\n-- WEAKNESSES- Complex setup; requires coordination with IdP team\n\n-- 1. Tiered network policies\nCREATE OR REPLACE NETWORK POLICY corp_only\nALLOWED_IP_LIST = ('10.0.0.0/8')  -- corporate VPN only\nCOMMENT = 'Default: corporate network only';\n\nCREATE OR REPLACE NETWORK POLICY corp_and_cloud\nALLOWED_IP_LIST = ('10.0.0.0/8', '52.44.0.0/16')  -- corporate + AWS VPC\nCOMMENT = 'For service accounts needing cloud access';\n\n-- Apply default to account\nALTER ACCOUNT SET NETWORK POLICY corp_only;\n\n-- 2. OAuth for programmatic access\nCREATE OR REPLACE SECURITY INTEGRATION snowflake_oauth\nTYPE = OAUTH\nOAUTH_CLIENT = TABLEAU_DESKTOP\nOAUTH_REDIRECT_URI = 'https://tableau.mycompany.com/auth/callback'\nOAUTH_ISSUE_REFRESH_TOKENS = TRUE\nOAUTH_REFRESH_TOKEN_VALIDITY = 7776000;  -- 90 days\n\n-- 3. Monitor login attempts and blocked connections\nSELECT\n    event_timestamp,\n    user_name,\n    client_ip,\n    reported_client_type,\n    first_authentication_factor,\n    second_authentication_factor,\n    error_code,\n    error_message\nFROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY\nWHERE event_timestamp >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\n    AND error_code IS NOT NULL  -- failed logins\nORDER BY event_timestamp DESC\nLIMIT 50;\n\n-- 4. Audit SSO usage\nSELECT\n    user_name,\n    first_authentication_factor,\n    COUNT(*) AS login_count,\n    MAX(event_timestamp) AS last_login\nFROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY\nWHERE event_timestamp >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\n    AND first_authentication_factor = 'SAML2'\nGROUP BY 1, 2 ORDER BY login_count DESC;\n\n-- 5. Alert on non-SSO logins (potential security violation)\nCREATE OR REPLACE TASK check_non_sso_logins\nWAREHOUSE = 'COMPUTE_WH'\nSCHEDULE = 'DAILY'\nAS\nINSERT INTO security_audit (check_date, user_name, login_method, client_ip)\nSELECT CURRENT_DATE(), user_name, first_authentication_factor, client_ip\nFROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY\nWHERE event_timestamp >= DATEADD('DAY', -1, CURRENT_TIMESTAMP())\n    AND first_authentication_factor != 'SAML2'\n    AND user_name NOT IN ('etl_service_account', 'snowflake');  -- exclude service accounts\nALTER TASK check_non_sso_logins RESUME;",
          },
        ],
        tips: [
          "Network Policies support CIDR notation — use '10.0.0.0/8' for a range, not individual IPs.",
          "User-level network policies override account-level — use for service accounts that need broader access.",
          "SCIM automates user provisioning from your IdP — no manual CREATE USER needed when people join/leave.",
          "SAML2 SSO eliminates Snowflake passwords — users authenticate through your IdP (Okta, Azure AD, etc.).",
          "Monitor LOGIN_HISTORY for failed attempts and non-SSO logins — potential security violations.",
        ],
        mistake: "Applying a restrictive network policy at the account level without exempting service accounts — ETL pipelines running from cloud IPs will be blocked. Always create a per-user policy for service accounts.",
        shorthand: {
          verbose: "-- Network policy + SSO\nCREATE NETWORK POLICY p ALLOWED_IP_LIST = ('10.0.0.0/8');\nALTER ACCOUNT SET NETWORK POLICY p;\n-- SSO:\nCREATE SECURITY INTEGRATION sso TYPE = SAML2 ENABLED = TRUE SAML2_PROVIDER = 'OKTA' ...",
          concise: "-- Quick network policy\nCREATE NETWORK POLICY p ALLOWED_IP_LIST=('10.0.0.0/8'); ALTER ACCOUNT SET NETWORK POLICY p;",
        },
      },
    ],
  },

  // ── Section 18: Monitoring & Observability ─────────────────────────────────────────
  {
    id: "monitoring",
    title: "Monitoring & Observability",
    entries: [
      {
        id: "account-usage",
        fn: "ACCOUNT_USAGE — query, cost, and usage monitoring",
        desc: "SNOWFLAKE.ACCOUNT_USAGE views provide historical data on query performance, credit consumption, storage, and user activity — essential for operational monitoring and cost optimization.",
        category: "Monitoring",
        subtitle: "ACCOUNT_USAGE, QUERY_HISTORY, WAREHOUSE_METERING, STORAGE_USAGE, LOGIN_HISTORY, ACCESS_HISTORY, cost monitoring, audit",
        signature: "SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.<view> WHERE start_time >= DATEADD('DAY', -N, CURRENT_TIMESTAMP())",
        descLong: "The SNOWFLAKE.ACCOUNT_USAGE schema contains read-only views with historical usage data for your entire Snowflake account. Key views: QUERY_HISTORY (every query with timing, bytes, errors), WAREHOUSE_METERING_HISTORY (credits per warehouse per hour), STORAGE_USAGE (database/table storage over time), LOGIN_HISTORY (user login attempts), DATA_TRANSFER_HISTORY (cross-region egress), ACCESS_HISTORY (column-level data lineage). Data has ~1-2 hour latency and 365-day retention. These views are the foundation for cost optimization, performance tuning, security auditing, and capacity planning. Unlike INFORMATION_SCHEMA (real-time, current database only), ACCOUNT_USAGE covers the entire account historically.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Find the top 10 most expensive queries by credits consumed\n-- APPROACH  - Query ACCOUNT_USAGE.QUERY_HISTORY sorted by credits\n-- STRENGTHS - Account-wide; historical; includes all query metadata\n-- WEAKNESSES- ~1-2 hour latency; 365-day retention\n\nSELECT\n    query_id,\n    LEFT(query_text, 200) AS query_preview,\n    warehouse_name,\n    warehouse_size,\n    total_elapsed_time / 1000 AS seconds,\n    bytes_scanned / 1e9 AS gb_scanned,\n    credits_used_cloud_services AS credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\n    AND execution_status = 'SUCCESS'\nORDER BY credits_used_cloud_services DESC\nLIMIT 10;\n\n-- Top 10 slowest queries\nSELECT\n    query_id,\n    LEFT(query_text, 200) AS query_preview,\n    warehouse_name,\n    total_elapsed_time / 1000 AS seconds,\n    bytes_scanned / 1e9 AS gb_scanned\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\n    AND execution_status = 'SUCCESS'\nORDER BY total_elapsed_time DESC\nLIMIT 10;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Build a daily cost dashboard with warehouse breakdown\n-- APPROACH  - Aggregate WAREHOUSE_METERING_HISTORY by day and warehouse\n-- STRENGTHS - Clear cost attribution; trendable\n-- WEAKNESSES- Cloud services credits may be partially included\n\nSELECT\n    DATE(start_time) AS usage_date,\n    warehouse_name,\n    SUM(credits_used) AS total_credits,\n    SUM(credits_used_compute) AS compute_credits,\n    SUM(credits_used_cloud_services) AS cloud_service_credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY\nWHERE start_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nGROUP BY 1, 2\nORDER BY 1 DESC, 3 DESC;\n\n-- Failed queries analysis\nSELECT\n    DATE(start_time) AS error_date,\n    error_code,\n    LEFT(error_message, 100) AS error_preview,\n    COUNT(*) AS error_count,\n    ARRAY_AGG(DISTINCT user_name) AS affected_users\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\n    AND execution_status != 'SUCCESS'\nGROUP BY 1, 2, 3\nORDER BY error_count DESC\nLIMIT 20;\n\n-- Storage growth by database\nSELECT\n    DATE(usage_date) AS snapshot_date,\n    database_name,\n    AVG(storage_bytes / 1e12) AS avg_tb\nFROM SNOWFLAKE.ACCOUNT_USAGE.DATABASE_STORAGE_USAGE_HISTORY\nWHERE usage_date >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nGROUP BY 1, 2\nORDER BY 1 DESC, 3 DESC;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a comprehensive operational monitoring suite with anomaly detection\n-- APPROACH  - Combine multiple ACCOUNT_USAGE views into a monitoring framework\n-- STRENGTHS - Full visibility; production-grade; covers cost, perf, security\n-- WEAKNESSES- Complex; requires DATA_READER role on ACCOUNT_USAGE\n\n-- 1. Cost anomaly detection: compare daily credits to 30-day rolling average\nWITH daily_credits AS (\n    SELECT DATE(start_time) AS d, SUM(credits_used) AS credits\n    FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY\n    WHERE start_time >= DATEADD('DAY', -60, CURRENT_TIMESTAMP())\n    GROUP BY 1\n),\nbaseline AS (\n    SELECT d, credits,\n        AVG(credits) OVER (ORDER BY d ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING) AS avg_30d,\n        STDDEV(credits) OVER (ORDER BY d ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING) AS stddev_30d\n    FROM daily_credits\n)\nSELECT d, credits, avg_30d,\n    CASE\n        WHEN credits > avg_30d + 2 * stddev_30d THEN 'ANOMALY'\n        WHEN credits > avg_30d * 1.5 THEN 'HIGH'\n        ELSE 'NORMAL'\n    END AS status\nFROM baseline WHERE d >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\nORDER BY d DESC;\n\n-- 2. Data lineage: which tables/columns were accessed by a query\nSELECT query_id, LEFT(query_text, 200) AS query_preview,\n    PARSE_JSON(direct_objects_accessed) AS objects_accessed\nFROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY\nWHERE query_start_time >= DATEADD('DAY', -1, CURRENT_TIMESTAMP())\n    AND query_text ILIKE '%sales%'\nLIMIT 20;\n\n-- 3. User activity heatmap\nSELECT user_name,\n    DATE_TRUNC('HOUR', event_timestamp) AS hour,\n    COUNT(*) AS query_count,\n    SUM(total_elapsed_time) / 1000 AS total_seconds\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\nGROUP BY 1, 2\nORDER BY query_count DESC\nLIMIT 50;\n\n-- 4. Data transfer costs (cross-region egress)\nSELECT DATE(transfer_date) AS d,\n    source_cloud,\n    target_cloud,\n    SUM(bytes_transferred) / 1e9 AS gb_transferred\nFROM SNOWFLAKE.ACCOUNT_USAGE.DATA_TRANSFER_HISTORY\nWHERE transfer_date >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nGROUP BY 1, 2, 3 ORDER BY 1 DESC, 4 DESC;",
          },
        ],
        tips: [
          "ACCOUNT_USAGE data has ~1-2 hour latency — use INFORMATION_SCHEMA for real-time data.",
          "Retention is 365 days — for longer history, export to your own tables periodically.",
          "Key views: QUERY_HISTORY, WAREHOUSE_METERING_HISTORY, STORAGE_USAGE, LOGIN_HISTORY, ACCESS_HISTORY.",
          "ACCESS_HISTORY provides column-level data lineage — essential for compliance and impact analysis.",
          "Requires DATA_READER role on SNOWFLAKE database — grant with care as it exposes all account activity.",
        ],
        mistake: "Querying ACCOUNT_USAGE.QUERY_HISTORY without a time filter — it contains every query from the past year. Always filter with WHERE start_time >= DATEADD('DAY', -N, CURRENT_TIMESTAMP()) to avoid scanning millions of rows.",
        shorthand: {
          verbose: "-- ACCOUNT_USAGE: top queries by cost\nSELECT query_id, LEFT(query_text,200) AS q, credits_used_cloud_services AS credits\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD('DAY',-7,CURRENT_TIMESTAMP())\nORDER BY credits DESC LIMIT 10;",
          concise: "-- Quick ACCOUNT_USAGE\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY WHERE start_time >= DATEADD('DAY',-7,NOW()) LIMIT 10;",
        },
      },
      {
        id: "data-quality",
        fn: "Data Quality — constraints, expectations, and validation",
        desc: "Snowflake data quality features include NOT NULL/UNIQUE constraints, data metric functions, and DATA_QUALITY monitoring views for automated validation.",
        category: "Data Quality",
        subtitle: "data quality, constraints, NOT NULL, UNIQUE, data metric, validation, anomaly detection, DATA_QUALITY views",
        signature: "ALTER TABLE t ADD CONSTRAINT c NOT NULL (col); CREATE DATA METRIC FUNCTION ...",
        descLong: "Snowflake provides multiple layers of data quality: (1) Column constraints — NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY (enforced on COPY INTO and INSERT). (2) Data metric functions — custom SQL functions that check data quality rules (e.g., null count, uniqueness, range validation). (3) DATA_QUALITY monitoring views — track quality metrics over time. (4) Schema evolution — automatic schema adaptation when source data changes column types or adds columns. (5) Conditional transforms — COPY INTO with WHEN clauses to filter bad rows during loading. These features enable building reliable data pipelines with automated quality checks, similar to dbt tests or Great Expectations but native to Snowflake.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Add basic constraints to enforce data quality\n-- APPROACH  - Use ALTER TABLE to add NOT NULL and UNIQUE constraints\n-- STRENGTHS - Enforced on INSERT and COPY INTO; simple\n-- WEAKNESSES- Constraints are limited; no custom validation rules\n\n-- Add constraints\nALTER TABLE sales ADD CONSTRAINT nn_amount NOT NULL (amount);\nALTER TABLE sales ADD CONSTRAINT nn_order_date NOT NULL (order_date);\nALTER TABLE sales ADD CONSTRAINT uq_order_id UNIQUE (order_id);\n\n-- COPY INTO will reject rows that violate constraints\nCOPY INTO sales FROM @sales_stage\nFILE_FORMAT = (TYPE = PARQUET)\nON_ERROR = 'CONTINUE';  -- skip bad rows, continue loading\n\n-- Check load history for rejected rows\nSELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(\n    TABLE_NAME => 'SALES',\n    START_TIME => DATEADD('HOUR', -1, CURRENT_TIMESTAMP())\n));",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Create custom data quality checks with data metric functions\n-- APPROACH  - Use CREATE DATA METRIC FUNCTION for custom validation rules\n-- STRENGTHS - Custom rules; scheduled checks; quality scoring\n-- WEAKNESSES- Requires Snowflake Enterprise edition for some features\n\n-- Create data metric function: check for negative amounts\nCREATE OR REPLACE DATA METRIC FUNCTION dm_no_negative_amounts(\n    arg1 TABLE (amount NUMBER, order_id STRING)\n) RETURNS NUMBER AS\n$$\n    SELECT COUNT(*) FROM arg1 WHERE amount < 0\n$$;\n\n-- Create data metric function: check for null customer names\nCREATE OR REPLACE DATA METRIC FUNCTION dm_null_customer_names(\n    arg1 TABLE (customer_name STRING)\n) RETURNS NUMBER AS\n$$\n    SELECT COUNT(*) FROM arg1 WHERE customer_name IS NULL\n$$;\n\n-- Schedule quality checks on a table\nALTER TABLE sales ADD DATA METRIC FUNCTION dm_no_negative_amounts\n    ON (amount, order_id)\n    SCHEDULE = '5 MINUTE';\n\nALTER TABLE sales ADD DATA METRIC FUNCTION dm_null_customer_names\n    ON (customer_name)\n    SCHEDULE = 'HOURLY';\n\n-- Check data quality results\nSELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.DATA_QUALITY_MONITORING_RESULTS\nWHERE table_name = 'SALES'\nORDER BY measurement_time DESC;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a comprehensive data quality framework with conditional loading\n-- APPROACH  - Combine COPY INTO transforms, constraints, and scheduled quality checks\n-- STRENGTHS - Prevents bad data from entering; automated monitoring; production-grade\n-- WEAKNESSES- Complex; requires careful transform logic\n\n-- Step 1: Conditional COPY INTO — filter bad rows during loading\nCOPY INTO sales FROM (\n    SELECT\n        $1:order_id::STRING AS order_id,\n        $1:amount::FLOAT AS amount,\n        $1:order_date::DATE AS order_date,\n        $1:customer_name::STRING AS customer_name\n    FROM @sales_stage\n    WHERE $1:amount::FLOAT > 0          -- reject negative amounts\n      AND $1:order_date::DATE IS NOT NULL  -- reject null dates\n      AND $1:customer_name::STRING IS NOT NULL  -- reject null names\n)\nFILE_FORMAT = (TYPE = PARQUET)\nON_ERROR = 'CONTINUE';\n\n-- Step 2: Schema evolution — auto-adapt when source columns change\nALTER TABLE sales SET ENABLE_SCHEMA_EVOLUTION = TRUE;\n-- Now if source Parquet adds a new column, Snowflake auto-adds it\n\n-- Step 3: Comprehensive quality checks\nCREATE OR REPLACE DATA METRIC FUNCTION dm_referential_integrity(\n    arg1 TABLE (customer_id STRING)\n) RETURNS NUMBER AS\n$$\n    SELECT COUNT(*) FROM arg1\n    WHERE customer_id NOT IN (SELECT customer_id FROM dim_customers)\n$$;\n\nCREATE OR REPLACE DATA METRIC FUNCTION dm_amount_range(\n    arg1 TABLE (amount FLOAT)\n) RETURNS NUMBER AS\n$$\n    SELECT COUNT(*) FROM arg1 WHERE amount < 0 OR amount > 1000000\n$$;\n\n-- Schedule all checks\nALTER TABLE sales ADD DATA METRIC FUNCTION dm_referential_integrity\n    ON (customer_id) SCHEDULE = 'HOURLY';\nALTER TABLE sales ADD DATA METRIC FUNCTION dm_amount_range\n    ON (amount) SCHEDULE = '5 MINUTE';\n\n-- Step 4: Alert on quality failures\nCREATE OR REPLACE TASK data_quality_alert\nWAREHOUSE = 'COMPUTE_WH'\nSCHEDULE = 'HOURLY'\nAS\nINSERT INTO dq_alerts (check_time, metric_name, failure_count, severity)\nSELECT CURRENT_TIMESTAMP(), metric_name, metric_value,\n    CASE WHEN metric_value > 100 THEN 'CRITICAL'\n         WHEN metric_value > 10 THEN 'WARNING'\n         ELSE 'OK' END\nFROM SNOWFLAKE.ACCOUNT_USAGE.DATA_QUALITY_MONITORING_RESULTS\nWHERE table_name = 'SALES'\n    AND measurement_time >= DATEADD('HOUR', -1, CURRENT_TIMESTAMP())\n    AND metric_value > 0;\nALTER TASK data_quality_alert RESUME;\n\n-- Step 5: Quality score dashboard\nSELECT\n    DATE(measurement_time) AS check_date,\n    table_name,\n    metric_name,\n    AVG(metric_value) AS avg_failures,\n    MAX(metric_value) AS max_failures\nFROM SNOWFLAKE.ACCOUNT_USAGE.DATA_QUALITY_MONITORING_RESULTS\nWHERE measurement_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nGROUP BY 1, 2, 3\nORDER BY 1 DESC, max_failures DESC;",
          },
        ],
        tips: [
          "NOT NULL and UNIQUE constraints are enforced on INSERT and COPY INTO — bad rows are rejected.",
          "Use ON_ERROR = 'CONTINUE' in COPY INTO to skip bad rows instead of failing the entire load.",
          "Data metric functions are custom SQL that returns a count of quality violations — schedule them regularly.",
          "Enable schema evolution with ALTER TABLE SET ENABLE_SCHEMA_EVOLUTION = TRUE for auto-adapting tables.",
          "Use conditional transforms in COPY INTO (SELECT ... WHERE ...) to filter bad rows during loading.",
        ],
        mistake: "Relying only on constraints without monitoring — constraints reject bad rows but you won't know unless you check COPY_HISTORY. Always pair constraints with load monitoring and alerting.",
        shorthand: {
          verbose: "-- Data quality: constraints + conditional load\nALTER TABLE t ADD CONSTRAINT nn NOT NULL (col);\nCOPY INTO t FROM (SELECT $1:c::INT FROM @s WHERE $1:c::INT > 0) ON_ERROR='CONTINUE';\n-- Data metric function\nCREATE DATA METRIC FUNCTION dm(arg1 TABLE(c INT)) RETURNS NUMBER AS 'SELECT COUNT(*) FROM arg1 WHERE c < 0';",
          concise: "-- Quick DQ\nALTER TABLE t ADD CONSTRAINT nn NOT NULL(c); COPY INTO t FROM @s ON_ERROR='CONTINUE';",
        },
      },
    ],
  },

  // ── Section 19: Iceberg, Streamlit & Tooling ─────────────────────────────────────────
  {
    id: "iceberg-streamlit-tooling",
    title: "Iceberg, Streamlit & Tooling",
    entries: [
      {
        id: "iceberg-tables",
        fn: "Apache Iceberg Tables — open-format external tables with Snowflake",
        desc: "Snowflake supports Apache Iceberg tables — open-format tables stored in your cloud storage with Snowflake's catalog. Combines Snowflake compute with vendor-neutral storage.",
        category: "Data Storage",
        subtitle: "ICEBERG, open format, catalog, external volume, S3, Parquet, vendor-neutral, data lakehouse, CREATE ICEBERG TABLE",
        signature: "CREATE ICEBERG TABLE name CATALOG = 'snowflake' EXTERNAL_VOLUME = 'vol' LOCATION = 's3://...' AS SELECT ...",
        descLong: "Apache Iceberg tables in Snowflake provide an open-table format that stores data in your cloud storage (S3, GCS, Azure) using Parquet files, while Snowflake manages the catalog and provides query compute. Key advantages: (1) Vendor-neutral — data stays in your cloud storage in open Parquet format; no lock-in. (2) Snowflake compute — query Iceberg tables with full Snowflake SQL support. (3) Time travel — Iceberg tables support Snowflake's time travel. (4) External catalogs — use Snowflake, Glue, or REST catalog. (5) Schema evolution — Iceberg handles schema changes natively. Use cases: data lakehouse architecture, multi-engine access (Spark, Trino, Snowflake), regulatory requirements for open formats, and avoiding vendor lock-in. Trade-offs: slightly slower than native Snowflake tables for frequent queries; requires external volume setup.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Create an Iceberg table from Snowflake data\n-- APPROACH  - Define external volume, create Iceberg table with catalog\n-- STRENGTHS - Open format; vendor-neutral; queryable from Snowflake\n-- WEAKNESSES- Slower than native tables; requires external storage setup\n\n-- Step 1: Create external volume (one-time, requires ACCOUNTADMIN)\nCREATE OR REPLACE EXTERNAL VOL my_s3_vol\nSTORAGE_LOCATIONS = (\n    ('s3://my-iceberg-bucket/sales/', 'us-east-1', 'AWS_IAM_ROLE', 'arn:aws:iam::123:role/iceberg')\n);\n\n-- Step 2: Create Iceberg table\nCREATE OR REPLACE ICEBERG TABLE sales_iceberg\nCATALOG = 'SNOWFLAKE'\nEXTERNAL_VOLUME = 'my_s3_vol'\nLOCATION = 'sales_iceberg/'\nAS\nSELECT * FROM sales WHERE sale_date >= '2024-01-01';\n\n-- Query like a regular table\nSELECT category, SUM(amount) FROM sales_iceberg GROUP BY category;\n\n-- Time travel works on Iceberg tables\nSELECT * FROM sales_iceberg AT(TIMESTAMP => DATEADD('HOUR', -1, CURRENT_TIMESTAMP()));",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Use external catalog (AWS Glue) for Iceberg tables\n-- APPROACH  - Configure catalog integration with Glue, create Iceberg table\n-- STRENGTHS - Multi-engine access; Spark/Trino can read same table\n-- WEAKNESSES- Requires Glue catalog setup; limited Snowflake features\n\n-- Create catalog integration with AWS Glue\nCREATE OR REPLACE CATALOG INTEGRATION glue_catalog\nCATALOG_SOURCE = 'GLUE'\nTABLE_FORMAT = 'ICEBERG'\nGLUE_AWS_ROLE_ARN = 'arn:aws:iam::123:role/glue-iceberg'\nGLUE_CATALOG_ID = '123456789012'\nGLUE_REGION = 'us-east-1'\nENABLED = TRUE;\n\n-- Create Iceberg table using Glue catalog\nCREATE OR REPLACE ICEBERG TABLE sales_glue\nCATALOG = 'glue_catalog'\nEXTERNAL_VOLUME = 'my_s3_vol'\nLOCATION = 'my-glue-db/sales'\nCATALOG_TABLE_NAME = 'sales'\nAS SELECT * FROM sales;\n\n-- Now both Snowflake and Spark/Trino can query the same Iceberg table\n-- Spark: spark.read.format('iceberg').load('glue.my-glue-db.sales')\n-- Trino: SELECT * FROM iceberg.my_glue_db.sales\n-- Snowflake: SELECT * FROM sales_glue",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a lakehouse architecture with native + Iceberg tables\n-- APPROACH  - Hot data in native Snowflake, warm/cold in Iceberg, unified views\n-- STRENGTHS - Cost-optimized; open format for cold data; full SQL access\n-- WEAKNESSES- Requires storage tiering strategy and monitoring\n\n-- Hot data: native Snowflake table (fastest, storage cost)\nCREATE TABLE sales_hot AS\nSELECT * FROM sales WHERE sale_date >= DATEADD('DAY', -90, CURRENT_DATE());\n\n-- Cold data: Iceberg table in S3 (cheaper storage, open format)\nCREATE OR REPLACE ICEBERG TABLE sales_cold_iceberg\nCATALOG = 'SNOWFLAKE'\nEXTERNAL_VOLUME = 'my_s3_vol'\nLOCATION = 'sales_cold/'\nAS SELECT * FROM sales WHERE sale_date < DATEADD('DAY', -90, CURRENT_DATE());\n\n-- Unified view across hot + cold\nCREATE OR REPLACE VIEW sales_all AS\nSELECT * FROM sales_hot\nUNION ALL\nSELECT * FROM sales_cold_iceberg;\n\n-- Automate tiering: move old data from hot to Iceberg monthly\nCREATE OR REPLACE TASK tier_cold_data\nWAREHOUSE = 'COMPUTE_WH'\nSCHEDULE = 'MONTHLY'\nAS\nBEGIN\n    -- Insert new cold data into Iceberg table\n    INSERT INTO sales_cold_iceberg\n    SELECT * FROM sales_hot\n    WHERE sale_date < DATEADD('DAY', -90, CURRENT_DATE());\n\n    -- Delete from hot table\n    DELETE FROM sales_hot\n    WHERE sale_date < DATEADD('DAY', -90, CURRENT_DATE());\nEND;\nALTER TASK tier_cold_data RESUME;\n\n-- Monitor Iceberg table performance vs native\nSELECT\n    table_name,\n    table_type,  -- ICEBERG vs BASE TABLE\n    bytes_scanned,\n    total_elapsed_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE query_text ILIKE '%sales_cold_iceberg%'\n    AND start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\nORDER BY total_elapsed_time DESC;",
          },
        ],
        tips: [
          "Iceberg tables store data in your cloud storage as open Parquet files — no vendor lock-in.",
          "Use SNOWFLAKE catalog for simplicity, or external catalogs (Glue, REST) for multi-engine access.",
          "Iceberg tables support time travel and most Snowflake SQL features — but are slower than native tables.",
          "External volume requires ACCOUNTADMIN to create — defines the cloud storage connection.",
          "Use Iceberg for cold/warm data and native tables for hot data — tier for cost optimization.",
        ],
        mistake: "Expecting Iceberg table performance to match native Snowflake tables — Iceberg tables have higher latency because data is in external storage. Use native tables for frequently-queried hot data.",
        shorthand: {
          verbose: "-- Iceberg table\nCREATE ICEBERG TABLE t CATALOG='SNOWFLAKE' EXTERNAL_VOLUME='vol' LOCATION='path/' AS SELECT * FROM src;\n-- External catalog (Glue)\nCREATE ICEBERG TABLE t CATALOG='glue_int' EXTERNAL_VOLUME='vol' LOCATION='db/tbl' CATALOG_TABLE_NAME='tbl';",
          concise: "-- Quick Iceberg\nCREATE ICEBERG TABLE t CATALOG='SNOWFLAKE' EXTERNAL_VOLUME='v' LOCATION='p/' AS SELECT * FROM s;",
        },
      },
      {
        id: "streamlit",
        fn: "Streamlit in Snowflake — build data apps inside Snowflake",
        desc: "Streamlit in Snowflake lets you build interactive data applications using Python, running inside Snowflake's secure perimeter — no separate app server needed.",
        category: "Application",
        subtitle: "Streamlit, data app, Python, interactive, dashboard, Snowflake Native App, secure, no egress",
        signature: "CREATE STREAMLIT app_name FROM @stage DIRECTORY = 'app_dir' MAIN_FILE = 'streamlit_app.py'",
        descLong: "Streamlit in Snowflake (SiS) brings the popular Python web framework into Snowflake's compute environment. Data apps run inside Snowflake — no separate server, no data egress, full security governance. Key features: (1) Native Snowflake integration — connect to tables, views, and Snowpark directly. (2) Secure — data never leaves Snowflake's perimeter. (3) Shared with consumers via Snowflake Native Apps. (4) Python packages from Snowflake Anaconda channel. (5) Interactive widgets (sliders, dropdowns, charts). Use cases: internal dashboards, data exploration tools, ML model interfaces, customer-facing analytics apps. Streamlit apps are created from a staged Python file and managed like other Snowflake objects.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Deploy a Streamlit data app inside Snowflake\n-- APPROACH  - Stage the Python file, create Streamlit object\n-- STRENGTHS - No separate server; secure; interactive\n-- WEAKNESSES- Limited to Snowflake Anaconda packages; no custom installs\n\n-- Step 1: Stage the Streamlit app\n-- Local file: streamlit_app.py\n-- import streamlit as st\n-- import snowflake.snowpark.context as ctx\n-- session = ctx.get_active_session()\n-- st.title('Sales Dashboard')\n-- df = session.table('SALES').to_pandas()\n-- st.dataframe(df)\n-- st.bar_chart(df, x='CATEGORY', y='AMOUNT')\n\nPUT file://streamlit_app.py @streamlit_stage AUTO_COMPRESS = FALSE;\n\n-- Step 2: Create Streamlit app\nCREATE OR REPLACE STREAMLIT sales_dashboard\nFROM @streamlit_stage\nDIRECTORY = '/'\nMAIN_FILE = 'streamlit_app.py'\nQUERY_WAREHOUSE = 'COMPUTE_WH';\n\n-- Step 3: View the app\n-- In Snowsight: navigate to Streamlit > sales_dashboard > Open\n-- The app runs inside Snowflake with full data access",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Build an interactive sales explorer with filters and charts\n-- APPROACH  - Use Streamlit widgets for user input, Snowpark for data queries\n-- STRENGTHS - Interactive; real-time filtering; no data egress\n-- WEAKNESSES- App performance depends on warehouse size\n\n-- streamlit_app.py:\n-- import streamlit as st\n-- from snowflake.snowpark.context import get_active_session\n-- import pandas as pd\n--\n-- session = get_active_session()\n--\n-- st.title('Sales Explorer')\n--\n-- # Filters\n-- categories = session.table('SALES').select('CATEGORY').distinct().collect()\n-- cat_list = [row['CATEGORY'] for row in categories]\n-- selected = st.multiselect('Category', cat_list, default=cat_list[:3])\n--\n-- # Date range\n-- col1, col2 = st.columns(2)\n-- with col1: start_date = st.date_input('Start', value=pd.Timestamp('2024-01-01'))\n-- with col2: end_date = st.date_input('End', value=pd.Timestamp('2024-12-31'))\n--\n-- # Query with filters\n-- df = session.table('SALES') \\\n--     .filter(col('CATEGORY').in_(selected)) \\\n--     .filter(col('SALE_DATE').between(start_date, end_date)) \\\n--     .to_pandas()\n--\n-- # Display\n-- st.metric('Total Sales', f\"${df['AMOUNT'].sum():,.0f}\")\n-- st.bar_chart(df.groupby('CATEGORY')['AMOUNT'].sum())\n-- st.dataframe(df)\n\nCREATE OR REPLACE STREAMLIT sales_explorer\nFROM @streamlit_stage\nDIRECTORY = '/'\nMAIN_FILE = 'streamlit_app.py'\nQUERY_WAREHOUSE = 'COMPUTE_WH';\n\n-- Share with other users\nGRANT USAGE ON STREAMLIT sales_dashboard TO ROLE analyst_role;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a production-grade ML model monitoring dashboard\n-- APPROACH  - Streamlit + Cortex + Snowpark for model performance tracking\n-- STRENGTHS - Full ML monitoring; interactive; secure inside Snowflake\n-- WEAKNESSES- Complex app; requires multiple Snowflake features\n\n-- streamlit_app.py (key sections):\n-- import streamlit as st\n-- from snowflake.snowpark.context import get_active_session\n-- import plotly.express as px\n--\n-- session = get_active_session()\n-- st.set_page_config(layout='wide')\n--\n-- # Sidebar: model selection\n-- st.sidebar.title('Model Monitor')\n-- model = st.sidebar.selectbox('Model', ['churn_v1', 'churn_v2', 'sentiment_v1'])\n--\n-- # Main: performance metrics\n-- st.header(f'{model} Performance')\n--\n-- metrics = session.sql(f'''\n--     SELECT prediction_date, accuracy, precision, recall, f1\n--     FROM ml_metrics WHERE model_name = '{model}'\n--     ORDER BY prediction_date DESC LIMIT 30\n-- ''').to_pandas()\n--\n-- col1, col2, col3, col4 = st.columns(4)\n-- col1.metric('Accuracy', f\"{metrics['ACCURACY'].iloc[0]:.1%}\")\n-- col2.metric('Precision', f\"{metrics['PRECISION'].iloc[0]:.1%}\")\n-- col3.metric('Recall', f\"{metrics['RECALL'].iloc[0]:.1%}\")\n-- col4.metric('F1', f\"{metrics['F1'].iloc[0]:.1%}\")\n--\n-- # Trend chart\n-- fig = px.line(metrics, x='PREDICTION_DATE', y=['ACCURACY','PRECISION','RECALL','F1'])\n-- st.plotly_chart(fig, use_container_width=True)\n--\n-- # Feature drift detection\n-- st.header('Feature Drift')\n-- drift = session.sql(f'''\n--     SELECT feature_name, psi_value, drift_status\n--     FROM feature_drift WHERE model_name = '{model}'\n-- ''').to_pandas()\n-- st.dataframe(drift.style.apply(\n--     lambda x: ['background: red' if v == 'DRIFT' else '' for v in x],\n--     subset=['DRIFT_STATUS']\n-- ))\n--\n-- # Prediction samples with Cortex sentiment\n-- st.header('Recent Predictions')\n-- preds = session.sql(f'''\n--     SELECT customer_id, prediction, actual,\n--         SNOWFLAKE.CORTEX.SENTIMENT(feedback_text) AS feedback_sentiment\n--     FROM ml_predictions WHERE model_name = '{model}'\n--     ORDER BY prediction_date DESC LIMIT 20\n-- ''').to_pandas()\n-- st.dataframe(preds)\n\nCREATE OR REPLACE STREAMLIT ml_monitor\nFROM @streamlit_stage\nDIRECTORY = '/'\nMAIN_FILE = 'streamlit_app.py'\nQUERY_WAREHOUSE = 'ML_WH';\n\n-- Package as a Native App for distribution\nCREATE OR REPLACE NATIVE APP ml_monitor_app\nFROM STREAMLIT ml_monitor\nVERSION = '1.0';",
          },
        ],
        tips: [
          "Streamlit apps run inside Snowflake — no separate server, no data egress, full security.",
          "Use get_active_session() to access Snowpark — the app runs with the caller's permissions.",
          "Install packages from Snowflake's Anaconda channel — no custom pip installs allowed.",
          "Grant USAGE ON STREAMLIT to share apps with other roles — consumers don't need the source code.",
          "Set QUERY_WAREHOUSE to control compute — use a small warehouse for dashboards, larger for ML apps.",
        ],
        mistake: "Calling st.dataframe() on a large Snowpark DataFrame without filtering — this pulls all rows to the app. Always filter and limit before calling to_pandas() or st.dataframe().",
        shorthand: {
          verbose: "-- Streamlit in Snowflake\nCREATE STREAMLIT app FROM @stage DIRECTORY='/' MAIN_FILE='app.py' QUERY_WAREHOUSE='wh';\n-- Grant access\nGRANT USAGE ON STREAMLIT app TO ROLE role;",
          concise: "-- Quick Streamlit\nCREATE STREAMLIT a FROM @s DIRECTORY='/' MAIN_FILE='a.py' QUERY_WAREHOUSE='w';",
        },
      },
      {
        id: "snowsql",
        fn: "SnowSQL — command-line client for Snowflake",
        desc: "SnowSQL is Snowflake's CLI tool for executing SQL, loading data, and automating tasks from scripts and CI/CD pipelines.",
        category: "Tooling",
        subtitle: "SnowSQL, CLI, config file, variable substitution, batch, CI/CD, automation, -f, -q, --output",
        signature: "snowsql -a account -u user -f script.sql -o output_format=csv",
        descLong: "SnowSQL is the official command-line client for Snowflake. It supports interactive sessions, batch script execution, and CI/CD automation. Key features: (1) Connection config — store credentials in ~/.snowsql/config for passwordless operation. (2) Variable substitution — use &{var} in SQL files, pass values with -D. (3) Output formats — csv, json, tsv, fancy for different consumers. (4) Multi-statement scripts — execute entire .sql files with -f. (5) Exit codes — non-zero on error for CI/CD integration. (6) Query results — pipe to other tools or files. SnowSQL is essential for automated deployments, data loading scripts, and CI/CD pipelines where Snowpark or REST APIs are overkill.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Connect to Snowflake and run a query from the command line\n-- APPROACH  - Use snowsql with -q for inline queries or -f for scripts\n-- STRENGTHS - Simple; scriptable; works in CI/CD\n-- WEAKNESSES- Interactive mode is limited compared to Snowsight\n\n-- Connect and run inline query\nsnowsql -a xy12345 -u myuser -q \"SELECT CURRENT_VERSION()\"\n\n-- Run a SQL script file\nsnowsql -a xy12345 -u myuser -f deploy_schema.sql\n\n-- Use config file (stored in ~/.snowsql/config)\n-- [connections.myaccount]\n-- accountname = xy12345\n-- username = myuser\n-- password = mypass\n-- warehousename = COMPUTE_WH\n\n-- Connect using named config\nsnowsql -c myaccount -f deploy_schema.sql\n\n-- Output as CSV (for piping to other tools)\nsnowsql -c myaccount -q \"SELECT * FROM sales LIMIT 10\" -o output_format=csv -o header=false\n\n-- Output as JSON\nsnowsql -c myaccount -q \"SELECT * FROM sales LIMIT 10\" -o output_format=json",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Use variable substitution for parameterized deployments\n-- APPROACH  - Define variables with -D, reference with &{var} in SQL\n-- STRENGTHS - Reusable scripts; CI/CD friendly\n-- WEAKNESSES- Variable syntax is non-standard SQL\n\n-- deploy_schema.sql:\n-- USE DATABASE &{db_name};\n-- CREATE SCHEMA IF NOT EXISTS &{schema_name};\n-- USE SCHEMA &{schema_name};\n--\n-- CREATE OR REPLACE TABLE &{table_name} (\n--     id INT, name STRING, amount FLOAT\n-- );\n--\n-- COPY INTO &{table_name} FROM @&{stage_name}\n-- FILE_FORMAT = (TYPE = PARQUET);\n\n-- Execute with variables\nsnowsql -c myaccount -f deploy_schema.sql \\\n  -D db_name=SALES_DB \\\n  -D schema_name=STAGING \\\n  -D table_name=SALES_RAW \\\n  -D stage_name=SALES_STAGE\n\n-- CI/CD pipeline example (GitHub Actions):\n-- - name: Deploy to Snowflake\n--   run: |\n--     snowsql -c ci_account -f deploy.sql \\\n--       -D env=$ENVIRONMENT \\\n--       -D version=$GITHUB_SHA\n--   env:\n--     SNOWSQL_PWD: ${{ secrets.SNOWFLAKE_PASSWORD }}\n\n-- Exit code checking for CI/CD\nsnowsql -c myaccount -f deploy.sql; echo $?\n-- 0 = success, 1 = error (useful for CI/CD gates)",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a complete CI/CD deployment pipeline with SnowSQL\n-- APPROACH  - Multi-environment deployment with rollback support\n-- STRENGTHS - Production-grade; automated; rollback capable\n-- WEAKNESSES- Requires careful scripting and error handling\n\n-- deploy.sh: Multi-environment deployment script\n-- #!/bin/bash\n-- set -e  # exit on error\n--\n-- ENV=$1\n-- VERSION=$(git rev-parse --short HEAD)\n--\n-- case $ENV in\n--   dev)     CONN=dev_account  ;;\n--   staging) CONN=staging_account ;;\n--   prod)    CONN=prod_account ;;\n--   *) echo \"Usage: $0 {dev|staging|prod}\"; exit 1 ;;\n-- esac\n--\n-- echo \"Deploying version $VERSION to $ENV\"\n--\n-- # Step 1: Run migrations\n-- snowsql -c $CONN -f migrations/001_add_columns.sql \\\n--   -D version=$VERSION -o exit_on_error=true\n--\n-- # Step 2: Deploy stored procedures\n-- snowsql -c $CONN -f procedures/ -o exit_on_error=true\n--\n-- # Step 3: Deploy tasks\n-- snowsql -c $CONN -f tasks/deploy_tasks.sql \\\n--   -D env=$ENV -D version=$VERSION\n--\n-- # Step 4: Verify deployment\n-- snowsql -c $CONN -q \"\n--   SELECT object_name, version_tag, deployed_at\n--   FROM metadata.deployments\n--   WHERE version_tag = '$VERSION'\n-- \" -o output_format=json > deploy_result.json\n--\n-- # Step 5: Record deployment\n-- snowsql -c $CONN -q \"\n--   INSERT INTO metadata.deployments (version_tag, env, deployed_at, status)\n--   VALUES ('$VERSION', '$ENV', CURRENT_TIMESTAMP(), 'SUCCESS')\n-- \"\n--\n-- echo \"Deployment $VERSION to $ENV complete\"\n\n-- Rollback script\n-- snowsql -c $CONN -f rollback.sql -D version=$PREV_VERSION\n\n-- SnowSQL config for CI/CD (~/.snowsql/config):\n-- [connections.dev_account]\n-- accountname = dev-xy12345\n-- username = ci_user\n-- warehousename = CI_WH\n-- [connections.prod_account]\n-- accountname = prod-xy12345\n-- username = ci_user\n-- warehousename = CI_WH\n\n-- Useful SnowSQL options:\n-- -o headless=true        # no interactive prompts (CI/CD)\n-- -o exit_on_error=true   # stop on first error\n-- -o quiet=true           # suppress non-query output\n-- -o timing=true          # show query execution time",
          },
        ],
        tips: [
          "Store credentials in ~/.snowsql/config with named connections — avoid passing passwords on the command line.",
          "Use -D for variable substitution: pass -D var=value, reference as &{var} in SQL files.",
          "Set -o exit_on_error=true and -o headless=true for CI/CD pipelines — stops on errors, no prompts.",
          "Output formats: csv, json, tsv, fancy — use csv/json for piping to other tools.",
          "SnowSQL exit codes: 0 = success, non-zero = error — use for CI/CD pipeline gates.",
        ],
        mistake: "Passing passwords directly on the command line with -p — this exposes credentials in shell history and process lists. Use the config file or SNOWSQL_PWD environment variable instead.",
        shorthand: {
          verbose: "-- SnowSQL CLI\nsnowsql -c myaccount -f deploy.sql -D env=prod -o exit_on_error=true\n-- Inline query with CSV output\nsnowsql -c myaccount -q \"SELECT * FROM t\" -o output_format=csv",
          concise: "-- Quick SnowSQL\nsnowsql -c acct -f script.sql -o exit_on_error=true",
        },
      },
    ],
  },

  // ── Section 20: Event Tables, Access History & Git Integration ─────────────────────────────────────────
  {
    id: "events-access-git",
    title: "Event Tables, Access History & Git Integration",
    entries: [
      {
        id: "event-tables",
        fn: "Event Tables — centralized logging for Snowflake",
        desc: "Event Tables capture logs, traces, and metrics from Snowflake (stored procedures, UDFs, tasks) and external applications in a structured, queryable format.",
        category: "Observability",
        subtitle: "EVENT TABLE, logging, tracing, metrics, stored procedure logs, UDF logs, observability, OpenTelemetry",
        signature: "CREATE EVENT TABLE name (event_time TIMESTAMP, event_type STRING, ...); ALTER ACCOUNT SET EVENT_TABLE = name",
        descLong: "Event Tables are Snowflake's native observability system. They store structured logs, traces, and metrics emitted by Snowflake stored procedures, UDFs, and external applications. Key features: (1) Structured schema — predefined columns for event_time, event_type, resource, severity, message, attributes (JSON). (2) Centralized — all logs from all procedures/UDFs go to one table. (3) Queryable — use standard SQL to filter, aggregate, and analyze logs. (4) OpenTelemetry-compatible — external apps can send traces via OTLP. (5) Retention — controlled by data retention policy. Event Tables replace scattered PRINT statements and ad-hoc logging tables. They are essential for debugging stored procedures, monitoring UDF execution, and building observability dashboards for Snowflake-native applications.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Set up event tables for stored procedure logging\n-- APPROACH  - Create event table, enable account-level, use LOG in procedures\n-- STRENGTHS - Centralized; structured; queryable\n-- WEAKNESSES- Requires account-level configuration\n\n-- Step 1: Create event table\nCREATE OR REPLACE EVENT TABLE my_events;\n\n-- Step 2: Enable at account level\nUSE ROLE ACCOUNTADMIN;\nALTER ACCOUNT SET EVENT_TABLE = my_db.public.my_events;\n\n-- Step 3: Log from a stored procedure\nCREATE OR REPLACE PROCEDURE process_sales()\nRETURNS STRING\nLANGUAGE SQL\nAS\nBEGIN\n    LOG_INFO('Starting sales processing');\n    LOG_DEBUG('Parameters: batch_size=1000');\n    \n    -- Do work\n    INSERT INTO sales_summary SELECT * FROM sales_raw;\n    \n    LOG_INFO('Processing complete', {'rows_processed': SQLROWCOUNT});\n    RETURN 'Success';\nEXCEPTION\n    WHEN OTHER THEN\n        LOG_ERROR('Processing failed: ' || SQLERRM);\n        RAISE;\nEND;\n\n-- Step 4: Query logs\nSELECT\n    event_time,\n    event_type,\n    severity,\n    message,\n    PARSE_JSON(attributes) AS attrs\nFROM my_events\nWHERE event_type = 'log'\n    AND event_time >= DATEADD('HOUR', -1, CURRENT_TIMESTAMP())\nORDER BY event_time DESC;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Build a structured logging pipeline with severity levels and filtering\n-- APPROACH  - Use LOG_INFO/LOG_WARN/LOG_ERROR in procedures, query by severity\n-- STRENGTHS - Severity-based filtering; structured attributes; alerting\n-- WEAKNESSES- Event table grows; requires retention management\n\nCREATE OR REPLACE PROCEDURE etl_pipeline(batch_id STRING)\nRETURNS STRING\nLANGUAGE SQL\nAS\n$$\nBEGIN\n    LOG_INFO('ETL pipeline started', {'batch_id': :batch_id});\n    \n    -- Stage 1: Extract\n    LOG_DEBUG('Extracting from source...');\n    INSERT INTO staging SELECT * FROM source WHERE batch_id = :batch_id;\n    LET extract_count := SQLROWCOUNT;\n    LOG_INFO('Extract complete', {'rows': extract_count});\n    \n    -- Stage 2: Transform\n    LOG_DEBUG('Transforming...');\n    INSERT INTO transformed \n    SELECT *, UPPER(name) AS name_clean FROM staging WHERE name IS NOT NULL;\n    LET transform_count := SQLROWCOUNT;\n    \n    IF transform_count < extract_count * 0.9 THEN\n        LOG_WARN('Data loss detected', {\n            'extracted': extract_count,\n            'transformed': transform_count,\n            'loss_pct': (extract_count - transform_count) * 100.0 / extract_count\n        });\n    END IF;\n    \n    -- Stage 3: Load\n    INSERT INTO target SELECT * FROM transformed;\n    LOG_INFO('ETL complete', {'batch_id': :batch_id, 'loaded': SQLROWCOUNT});\n    RETURN 'Success';\nEXCEPTION\n    WHEN OTHER THEN\n        LOG_ERROR('ETL failed', {'batch_id': :batch_id, 'error': SQLERRM});\n        RAISE;\nEND;\n$$;\n\n-- Query errors and warnings from last 24 hours\nSELECT\n    event_time,\n    severity,\n    message,\n    PARSE_JSON(attributes):batch_id::STRING AS batch_id\nFROM my_events\nWHERE severity IN ('ERROR', 'WARN')\n    AND event_time >= DATEADD('DAY', -1, CURRENT_TIMESTAMP())\nORDER BY event_time DESC;\n\n-- Set retention on event table (30 days)\nALTER TABLE my_events SET DATA_RETENTION_TIME_IN_DAYS = 30;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a full observability stack with traces, metrics, and alerting\n-- APPROACH  - Event tables + traces + metric aggregation + automated alerting\n-- STRENGTHS - Production-grade observability; OpenTelemetry-compatible\n-- WEAKNESSES- Complex setup; requires careful schema design\n\n-- 1. Create dedicated event table with custom retention\nCREATE OR REPLACE EVENT TABLE obs_events\nDATA_RETENTION_TIME_IN_DAYS = 90;\n\n-- 2. Enable tracing in stored procedures\nCREATE OR REPLACE PROCEDURE ml_inference_pipeline()\nRETURNS STRING\nLANGUAGE SQL\nAS\nBEGIN\n    -- Start trace span\n    LET trace_id := UUID_STRING();\n    LOG_INFO('ML inference started', {'trace_id': trace_id});\n    \n    -- Span 1: Feature engineering\n    LET span1_start := CURRENT_TIMESTAMP();\n    INSERT INTO features SELECT * FROM raw_data WHERE processed = FALSE;\n    LOG_INFO('Feature engineering complete', {\n        'trace_id': trace_id,\n        'span': 'feature_engineering',\n        'duration_ms': DATEDIFF('MILLISECOND', span1_start, CURRENT_TIMESTAMP()),\n        'rows': SQLROWCOUNT\n    });\n    \n    -- Span 2: Model scoring\n    LET span2_start := CURRENT_TIMESTAMP();\n    INSERT INTO predictions \n    SELECT customer_id, predict_churn(features) AS churn_prob \n    FROM features;\n    LOG_INFO('Model scoring complete', {\n        'trace_id': trace_id,\n        'span': 'model_scoring',\n        'duration_ms': DATEDIFF('MILLISECOND', span2_start, CURRENT_TIMESTAMP()),\n        'rows': SQLROWCOUNT\n    });\n    \n    -- Span 3: Publish results\n    LET span3_start := CURRENT_TIMESTAMP();\n    INSERT INTO churn_alerts \n    SELECT customer_id, churn_prob FROM predictions WHERE churn_prob > 0.7;\n    LOG_INFO('Publish complete', {\n        'trace_id': trace_id,\n        'span': 'publish',\n        'duration_ms': DATEDIFF('MILLISECOND', span3_start, CURRENT_TIMESTAMP()),\n        'alerts': SQLROWCOUNT\n    });\n    \n    RETURN trace_id;\nEND;\n\n-- 3. Build observability dashboard queries\n-- Trace timeline: see all spans for a trace\nSELECT\n    event_time,\n    PARSE_JSON(attributes):span::STRING AS span,\n    PARSE_JSON(attributes):duration_ms::INT AS duration_ms,\n    PARSE_JSON(attributes):rows::INT AS rows,\n    message\nFROM obs_events\nWHERE PARSE_JSON(attributes):trace_id = 'abc-123'\n    AND event_type = 'log'\nORDER BY event_time;\n\n-- 4. Error rate alerting task\nCREATE OR REPLACE TASK error_rate_alert\nWAREHOUSE = 'COMPUTE_WH'\nSCHEDULE = '5 MINUTE'\nAS\nINSERT INTO alert_log (alert_time, alert_type, details)\nSELECT CURRENT_TIMESTAMP(), 'HIGH_ERROR_RATE',\n    OBJECT_CONSTRUCT('error_count', COUNT(*), 'window', '5min')\nFROM obs_events\nWHERE severity = 'ERROR'\n    AND event_time >= DATEADD('MINUTE', -5, CURRENT_TIMESTAMP())\nHAVING COUNT(*) > 10;\nALTER TASK error_rate_alert RESUME;\n\n-- 5. Daily observability summary\nCREATE OR REPLACE VIEW daily_obs_summary AS\nSELECT\n    DATE(event_time) AS day,\n    severity,\n    COUNT(*) AS event_count,\n    COUNT(DISTINCT PARSE_JSON(attributes):trace_id::STRING) AS unique_traces\nFROM obs_events\nWHERE event_type = 'log'\nGROUP BY 1, 2\nORDER BY 1 DESC, 3 DESC;",
          },
        ],
        tips: [
          "Event tables require ACCOUNTADMIN to set at the account level — one event table per account.",
          "Use LOG_INFO, LOG_DEBUG, LOG_WARN, LOG_ERROR in SQL procedures; Python UDFs use the logging module.",
          "Attributes column stores JSON — use PARSE_JSON() to extract structured fields from log entries.",
          "Set DATA_RETENTION_TIME_IN_DAYS on the event table to control log retention and storage costs.",
          "Event tables are OpenTelemetry-compatible — external apps can send traces via Snowflake's OTLP endpoint.",
        ],
        mistake: "Creating a regular table instead of an EVENT TABLE — only CREATE EVENT TABLE captures logs from LOG_INFO/LOG_ERROR functions. Regular tables won't receive any log data.",
        shorthand: {
          verbose: "-- Event table setup\nCREATE EVENT TABLE my_events;\nALTER ACCOUNT SET EVENT_TABLE = db.schema.my_events;\n-- Log in procedure: LOG_INFO('msg', {'key': 'val'});\n-- Query: SELECT event_time, severity, message FROM my_events WHERE severity='ERROR';",
          concise: "-- Quick event table\nCREATE EVENT TABLE e; ALTER ACCOUNT SET EVENT_TABLE=db.s.e;",
        },
      },
      {
        id: "access-history",
        fn: "ACCESS_HISTORY — column-level data lineage and audit",
        desc: "The ACCESS_HISTORY view in ACCOUNT_USAGE provides column-level lineage — which columns were read, written, or derived by every query, enabling compliance and impact analysis.",
        category: "Governance",
        subtitle: "ACCESS_HISTORY, data lineage, column-level, compliance, impact analysis, GDPR, audit trail, data governance",
        signature: "SELECT * FROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY WHERE query_start_time >= ...",
        descLong: "The ACCESS_HISTORY view is Snowflake's column-level data lineage system. For every query, it records: (1) Direct objects accessed — tables/views read from. (2) Direct objects modified — tables written to. (3) Columns accessed — which specific columns were read. (4) Columns modified — which columns were written. (5) Lineage — how data flows from source columns to derived columns. This enables: GDPR/CCPA compliance (find all queries that accessed a specific customer's data), impact analysis (what downstream objects are affected if I change this column?), data catalog building (auto-discover dependencies), and audit trails (who accessed what data and when). Data has ~1-2 hour latency, 365-day retention.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Find all queries that accessed a specific table\n-- APPROACH  - Query ACCESS_HISTORY filtering on direct_objects_accessed\n-- STRENGTHS - Complete audit trail; column-level detail\n-- WEAKNESSES- ~1-2 hour latency; JSON parsing required\n\nSELECT\n    query_id,\n    query_start_time,\n    user_name,\n    query_type,\n    PARSE_JSON(direct_objects_accessed) AS objects_accessed\nFROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY\nWHERE query_start_time >= DATEADD('DAY', -1, CURRENT_TIMESTAMP())\n    AND direct_objects_accessed ILIKE '%sales%'\nORDER BY query_start_time DESC\nLIMIT 20;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - GDPR compliance: find all queries that accessed customer PII columns\n-- APPROACH  - Parse ACCESS_HISTORY JSON to extract column-level access\n-- STRENGTHS - Column-level granularity; complete audit\n-- WEAKNESSES- Complex JSON parsing; large result sets\n\n-- Find all accesses to PII columns (email, phone, ssn)\nSELECT\n    query_id,\n    query_start_time,\n    user_name,\n    obj.value:objectName::STRING AS table_name,\n    col.value:columnName::STRING AS column_name,\n    col.value:columnDomainType::STRING AS column_type\nFROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY,\n    LATERAL FLATTEN(input => PARSE_JSON(direct_objects_accessed)) obj,\n    LATERAL FLATTEN(input => obj.value:columns) col\nWHERE query_start_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\n    AND col.value:columnName::STRING IN ('email', 'phone', 'ssn', 'address')\nORDER BY query_start_time DESC;\n\n-- Impact analysis: what depends on a column I want to change?\nSELECT\n    query_id,\n    LEFT(query_text, 200) AS query_preview,\n    user_name,\n    query_start_time\nFROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY\nWHERE direct_objects_accessed ILIKE '%customers.email%'\n    AND query_start_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\nORDER BY query_start_time DESC;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a complete data lineage graph from ACCESS_HISTORY\n-- APPROACH  - Extract source-to-target column mappings for all queries\n-- STRENGTHS - Full lineage graph; automated dependency discovery\n-- WEAKNESSES- Complex; requires recursive parsing\n\n-- Build column-level lineage: source column → target column\nCREATE OR REPLACE TABLE column_lineage AS\nSELECT\n    query_id,\n    query_start_time,\n    src_obj.value:objectName::STRING AS source_table,\n    src_col.value:columnName::STRING AS source_column,\n    tgt_obj.value:objectName::STRING AS target_table,\n    tgt_col.value:columnName::STRING AS target_column\nFROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY,\n    LATERAL FLATTEN(input => PARSE_JSON(direct_objects_sources_accessed)) src_obj,\n    LATERAL FLATTEN(input => src_obj.value:columns) src_col,\n    LATERAL FLATTEN(input => PARSE_JSON(direct_objects_modified)) tgt_obj,\n    LATERAL FLATTEN(input => tgt_obj.value:columns) tgt_col\nWHERE query_start_time >= DATEADD('DAY', -30, CURRENT_TIMESTAMP())\n    AND query_type IN ('INSERT', 'CREATE_TABLE_AS_SELECT', 'MERGE');\n\n-- Query: what's the upstream lineage of a specific column?\nWITH RECURSIVE lineage AS (\n    -- Direct sources\n    SELECT\n        source_table, source_column, target_table, target_column,\n        1 AS depth,\n        source_table || '.' || source_column || ' -> ' ||\n        target_table || '.' || target_column AS path\n    FROM column_lineage\n    WHERE target_table = 'SALES_SUMMARY' AND target_column = 'total_revenue'\n    \n    UNION ALL\n    \n    -- Upstream sources\n    SELECT\n        cl.source_table, cl.source_column,\n        l.source_table, l.source_column,\n        l.depth + 1,\n        cl.source_table || '.' || cl.source_column || ' -> ' || l.path\n    FROM column_lineage cl\n    JOIN lineage l ON cl.target_table = l.source_table\n        AND cl.target_column = l.source_column\n    WHERE l.depth < 10  -- prevent infinite loops\n)\nSELECT DISTINCT path, depth FROM lineage ORDER BY depth, path;\n\n-- Compliance: find all users who accessed PII in last 90 days\nCREATE OR REPLACE VIEW pii_access_audit AS\nSELECT\n    user_name,\n    COUNT(DISTINCT query_id) AS pii_query_count,\n    MIN(query_start_time) AS first_access,\n    MAX(query_start_time) AS last_access,\n    ARRAY_AGG(DISTINCT col.value:columnName::STRING) AS pii_columns_accessed\nFROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY,\n    LATERAL FLATTEN(input => PARSE_JSON(direct_objects_accessed)) obj,\n    LATERAL FLATTEN(input => obj.value:columns) col\nWHERE query_start_time >= DATEADD('DAY', -90, CURRENT_TIMESTAMP())\n    AND col.value:columnName::STRING IN ('email', 'phone', 'ssn', 'address', 'credit_card')\nGROUP BY 1 ORDER BY pii_query_count DESC;",
          },
        ],
        tips: [
          "ACCESS_HISTORY provides column-level lineage — not just which tables were accessed, but which columns.",
          "Use LATERAL FLATTEN to parse the JSON columns in direct_objects_accessed and direct_objects_modified.",
          "Data has ~1-2 hour latency and 365-day retention — same as other ACCOUNT_USAGE views.",
          "Lineage includes derived columns — if SELECT a+b AS c, it records that column c depends on columns a and b.",
          "Use for GDPR/CCPA compliance: find all queries that accessed specific PII columns by user and time.",
        ],
        mistake: "Expecting real-time lineage from ACCESS_HISTORY — it has ~1-2 hour latency. For real-time column access, use INFORMATION_SCHEMA or query tags instead.",
        shorthand: {
          verbose: "-- Access history: find who accessed a table\nSELECT query_id, user_name, query_start_time,\n    PARSE_JSON(direct_objects_accessed) AS objects\nFROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY\nWHERE direct_objects_accessed ILIKE '%table_name%'\n    AND query_start_time >= DATEADD('DAY',-7,CURRENT_TIMESTAMP());",
          concise: "-- Quick access history\nSELECT user_name, query_start_time FROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY WHERE direct_objects_accessed ILIKE '%t%' AND query_start_time >= DATEADD('DAY',-7,NOW());",
        },
      },
      {
        id: "git-integration",
        fn: "Git Integration — version control for Snowflake objects",
        desc: "Snowflake Git Integration allows connecting repositories to Snowflake, enabling version-controlled deployment of SQL scripts, UDFs, and stored procedures directly from Git.",
        category: "DevOps",
        subtitle: "GIT, repository, version control, CI/CD, API integration, branch, deploy, Snowflake Native App, devops",
        signature: "CREATE GIT REPOSITORY name FROM API INTEGRATION name API_TOKEN = '...' API_PREFIX = '...'",
        descLong: "Snowflake Git Integration (Snowflake's Git API integration) connects external Git repositories (GitHub, GitLab, Bitbucket) to Snowflake. Key features: (1) CREATE GIT REPOSITORY — registers a repo as a Snowflake object. (2) Stage files — clone repo contents to a Snowflake stage for execution. (3) Branch support — checkout specific branches or tags. (4) Execute from repo — run SQL files directly from the repo stage. (5) CI/CD integration — combine with SnowSQL for automated deployments. This enables version-controlled Snowflake object management — stored procedures, UDFs, schemas, and data pipelines live in Git and deploy through Snowflake. Common patterns: GitOps for Snowflake, branch-based environments (dev/staging/prod branches), and automated deployment pipelines triggered by Git pushes.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Connect a GitHub repository to Snowflake\n-- APPROACH  - Create API integration, then Git repository object\n-- STRENGTHS - Version-controlled Snowflake objects; CI/CD ready\n-- WEAKNESSES- Requires API token; limited to Snowflake-supported repos\n\n-- Step 1: Create API integration for GitHub\nCREATE OR REPLACE API INTEGRATION github_api\nAPI_PROVIDER = 'GITHUB'\nAPI_ALLOWED_PREFIXES = ('https://api.github.com/')\nALLOWED_AUTHENTICATION_TYPES = ('BEARER')\nENABLED = TRUE;\n\n-- Step 2: Create Git repository object\nCREATE OR REPLACE GIT REPOSITORY my_repo\nFROM API INTEGRATION github_api\nAPI_TOKEN = 'ghp_xxxxxxxxxxxx'\nAPI_PREFIX = 'https://api.github.com/repos/myorg/snowflake-scripts';\n\n-- Step 3: Fetch latest from main branch\nALTER GIT REPOSITORY my_repo FETCH;\n\n-- Step 4: List files in the repo\nLIST @my_repo/branches/main/;\n\n-- Step 5: Execute a SQL file from the repo\nEXECUTE IMMEDIATE FROM @my_repo/branches/main/sql/deploy_schema.sql;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Deploy stored procedures from Git branches\n-- APPROACH  - Use branch-based environments: dev/staging/prod\n-- STRENGTHS - Environment isolation; version-controlled; reproducible\n-- WEAKNESSES- Requires branch management discipline\n\n-- Fetch latest from all branches\nALTER GIT REPOSITORY my_repo FETCH;\n\n-- Deploy from dev branch\nEXECUTE IMMEDIATE FROM @my_repo/branches/dev/sql/001_create_procs.sql;\nEXECUTE IMMEDIATE FROM @my_repo/branches/dev/sql/002_create_tasks.sql;\n\n-- Deploy from prod branch (after merge)\nEXECUTE IMMEDIATE FROM @my_repo/branches/main/sql/001_create_procs.sql;\nEXECUTE IMMEDIATE FROM @my_repo/branches/main/sql/002_create_tasks.sql;\n\n-- Deploy a specific tag (release version)\nEXECUTE IMMEDIATE FROM @my_repo/tags/v1.2.0/sql/deploy_all.sql;\n\n-- CI/CD: GitHub Actions triggers SnowSQL to deploy\n-- .github/workflows/deploy.yml:\n-- on:\n--   push:\n--     branches: [main]\n-- jobs:\n--   deploy:\n--     runs-on: ubuntu-latest\n--     steps:\n--       - run: |\n--           snowsql -c prod -q \"\n--             ALTER GIT REPOSITORY my_repo FETCH;\n--             EXECUTE IMMEDIATE FROM @my_repo/branches/main/sql/deploy_all.sql;\n--           \"",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a GitOps deployment pipeline with automated testing\n-- APPROACH  - Git-triggered deploy + pre-deployment validation + rollback\n-- STRENGTHS - Full GitOps; automated validation; rollback capable\n-- WEAKNESSES- Complex; requires CI/CD infrastructure\n\n-- 1. Create separate repos for different environments\nCREATE OR REPLACE GIT REPOSITORY snowflake_prod\nFROM API INTEGRATION github_api\nAPI_TOKEN = 'ghp_xxx'\nAPI_PREFIX = 'https://api.github.com/repos/myorg/snowflake-prod';\n\nCREATE OR REPLACE GIT REPOSITORY snowflake_shared\nFROM API INTEGRATION github_api\nAPI_TOKEN = 'ghp_xxx'\nAPI_PREFIX = 'https://api.github.com/repos/myorg/snowflake-shared';\n\n-- 2. Deployment procedure with validation\nCREATE OR REPLACE PROCEDURE gitops_deploy(branch STRING, env STRING)\nRETURNS STRING\nLANGUAGE SQL\nAS\n$$\nBEGIN\n    -- Fetch latest\n    ALTER GIT REPOSITORY snowflake_prod FETCH;\n    \n    -- Record deployment start\n    INSERT INTO deploy_audit (deploy_time, branch, env, status)\n    VALUES (CURRENT_TIMESTAMP(), :branch, :env, 'STARTED');\n    \n    -- Run pre-deployment validation\n    EXECUTE IMMEDIATE FROM \n        @snowflake_prod/branches/||:branch||/sql/00_validate.sql;\n    \n    -- Run migrations in order\n    EXECUTE IMMEDIATE FROM \n        @snowflake_prod/branches/||:branch||/sql/01_migrate.sql;\n    \n    -- Deploy procedures and UDFs\n    EXECUTE IMMEDIATE FROM \n        @snowflake_prod/branches/||:branch||/sql/02_deploy_procs.sql;\n    \n    -- Deploy tasks\n    EXECUTE IMMEDIATE FROM \n        @snowflake_prod/branches/||:branch||/sql/03_deploy_tasks.sql;\n    \n    -- Post-deployment tests\n    EXECUTE IMMEDIATE FROM \n        @snowflake_prod/branches/||:branch||/sql/99_tests.sql;\n    \n    -- Record success\n    UPDATE deploy_audit SET status = 'SUCCESS'\n    WHERE deploy_time = (SELECT MAX(deploy_time) FROM deploy_audit);\n    \n    RETURN 'Deployment successful';\nEXCEPTION\n    WHEN OTHER THEN\n        -- Record failure\n        UPDATE deploy_audit SET status = 'FAILED', error = SQLERRM\n        WHERE deploy_time = (SELECT MAX(deploy_time) FROM deploy_audit);\n        \n        -- Auto-rollback to previous version\n        EXECUTE IMMEDIATE FROM \n            @snowflake_prod/tags/previous/sql/rollback.sql;\n        RAISE;\nEND;\n$$;\n\n-- 3. Monitor deployment history\nSELECT\n    deploy_time,\n    branch,\n    env,\n    status,\n    error\nFROM deploy_audit\nORDER BY deploy_time DESC\nLIMIT 20;",
          },
        ],
        tips: [
          "Use ALTER GIT REPOSITORY ... FETCH to pull latest changes — Snowflake doesn't auto-sync.",
          "EXECUTE IMMEDIATE FROM @repo/branches/main/sql/file.sql runs SQL directly from the repo.",
          "Use tags for release versions: @repo/tags/v1.0.0/sql/deploy.sql ensures reproducible deployments.",
          "Combine with SnowSQL in CI/CD pipelines for Git-triggered automated deployments.",
          "Store API tokens securely — use Snowflake secrets or environment variables, not hardcoded values.",
        ],
        mistake: "Forgetting to FETCH before executing from the repo — Snowflake caches the repo state at FETCH time. Always run ALTER GIT REPOSITORY ... FETCH before deploying from latest commits.",
        shorthand: {
          verbose: "-- Git integration\nCREATE API INTEGRATION gh API_PROVIDER='GITHUB' API_ALLOWED_PREFIXES=('https://api.github.com/') ENABLED=TRUE;\nCREATE GIT REPOSITORY repo FROM API INTEGRATION gh API_TOKEN='xxx' API_PREFIX='https://api.github.com/repos/org/repo';\nALTER GIT REPOSITORY repo FETCH;\nEXECUTE IMMEDIATE FROM @repo/branches/main/sql/deploy.sql;",
          concise: "-- Quick Git\nALTER GIT REPOSITORY r FETCH; EXECUTE IMMEDIATE FROM @r/branches/main/sql/f.sql;",
        },
      },
    ],
  },

  // ── Section 21: Hybrid Tables & Native Apps ─────────────────────────────────────────
  {
    id: "hybrid-native",
    title: "Hybrid Tables & Native Apps",
    entries: [
      {
        id: "hybrid-tables",
        fn: "CREATE HYBRID TABLE — transactional + analytical workloads",
        desc: "Hybrid Tables (Unistore) combine transactional (OLTP) and analytical (OLAP) workloads in a single Snowflake table with indexed lookups and ACID transactions.",
        category: "Data Storage",
        subtitle: "HYBRID TABLE, Unistore, OLTP, OLAP, indexed lookup, ACID, transactional, primary key, index, mixed workload",
        signature: "CREATE HYBRID TABLE name (id INT PRIMARY KEY, ...) INDEX (col);",
        descLong: "Hybrid Tables (formerly Unistore) are Snowflake's solution for mixed OLTP+OLAP workloads. Unlike regular Snowflake tables (optimized for analytical scans), Hybrid Tables support: (1) Primary key enforcement — unique, non-null constraint with an index. (2) Secondary indexes — B-tree indexes for fast point lookups. (3) Single-row transactional performance — optimized for INSERT/UPDATE/DELETE on individual rows. (4) ACID transactions — full transactional guarantees. (5) Analytical queries — still support full table scans and aggregations. Key differences from regular tables: Hybrid Tables use indexed storage (not just micro-partitions), enforce primary keys, and optimize for point queries. Use cases: operational dashboards, SaaS application backends, metadata stores, and any workload needing both fast lookups and analytics. Trade-offs: slightly slower full-table scans than regular tables; additional storage for indexes.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Create a transactional table for application state\n-- APPROACH  - Use CREATE HYBRID TABLE with primary key and indexes\n-- STRENGTHS - Fast point lookups; ACID; primary key enforcement\n-- WEAKNESSES- Slower full scans than regular tables; index storage overhead\n\nCREATE OR REPLACE HYBRID TABLE orders (\n    order_id INT PRIMARY KEY,\n    customer_id INT,\n    order_date TIMESTAMP,\n    status STRING,\n    amount FLOAT,\n    INDEX idx_customer (customer_id),\n    INDEX idx_status_date (status, order_date)\n);\n\n-- Fast point lookup by primary key (uses index)\nSELECT * FROM orders WHERE order_id = 12345;\n\n-- Fast lookup by indexed column\nSELECT * FROM orders WHERE customer_id = 67890 AND status = 'pending';\n\n-- Transactional update (ACID)\nBEGIN TRANSACTION;\n    UPDATE orders SET status = 'shipped' WHERE order_id = 12345;\n    INSERT INTO order_events (order_id, event, timestamp)\n    VALUES (12345, 'shipped', CURRENT_TIMESTAMP());\nCOMMIT;\n\n-- Also supports analytical queries (full scan)\nSELECT status, COUNT(*), SUM(amount) FROM orders\nGROUP BY status ORDER BY COUNT(*) DESC;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Build a SaaS application backend with Hybrid Tables\n-- APPROACH  - Use Hybrid Tables for user/session data, regular tables for analytics\n-- STRENGTHS - Fast CRUD; ACID; same platform for OLTP+OLAP\n-- WEAKNESSES- Not a replacement for dedicated OLTP databases at scale\n\n-- User profiles (frequent point lookups by user_id)\nCREATE OR REPLACE HYBRID TABLE user_profiles (\n    user_id STRING PRIMARY KEY,\n    email STRING,\n    name STRING,\n    plan STRING,\n    created_at TIMESTAMP,\n    INDEX idx_email (email)\n);\n\n-- User sessions (frequent lookups by session_id, TTL-based cleanup)\nCREATE OR REPLACE HYBRID TABLE user_sessions (\n    session_id STRING PRIMARY KEY,\n    user_id STRING,\n    expires_at TIMESTAMP,\n    INDEX idx_expires (expires_at)\n);\n\n-- Application events (append-heavy, queried by user and time)\nCREATE OR REPLACE HYBRID TABLE app_events (\n    event_id STRING PRIMARY KEY,\n    user_id STRING,\n    event_type STRING,\n    event_data VARIANT,\n    created_at TIMESTAMP,\n    INDEX idx_user_time (user_id, created_at),\n    INDEX idx_type (event_type)\n);\n\n-- Common operations\n-- Login: create session\nINSERT INTO user_sessions VALUES (UUID_STRING(), 'user123', DATEADD('HOUR', 1, CURRENT_TIMESTAMP()));\n\n-- Validate session (fast PK lookup)\nSELECT s.*, p.name, p.plan FROM user_sessions s\nJOIN user_profiles p ON s.user_id = p.user_id\nWHERE s.session_id = 'abc-123' AND s.expires_at > CURRENT_TIMESTAMP();\n\n-- Cleanup expired sessions (indexed range scan)\nDELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP();\n\n-- Analytics: event counts by type (full scan, but works)\nSELECT event_type, COUNT(*) FROM app_events\nWHERE created_at >= DATEADD('DAY', -1, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY COUNT(*) DESC;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a multi-tenant SaaS with Hybrid Tables + regular tables + views\n-- APPROACH  - Hybrid Tables for hot operational data, regular tables for cold analytics\n-- STRENGTHS - Optimized for both workloads; cost-effective tiering\n-- WEAKNESSES- Requires careful schema design and workload analysis\n\n-- Hot data: Hybrid Tables (fast CRUD, indexed lookups)\nCREATE OR REPLACE HYBRID TABLE tenant_config (\n    tenant_id STRING PRIMARY KEY,\n    config VARIANT,\n    plan STRING,\n    seats INT,\n    INDEX idx_plan (plan)\n);\n\nCREATE OR REPLACE HYBRID TABLE user_accounts (\n    user_id STRING PRIMARY KEY,\n    tenant_id STRING,\n    email STRING,\n    role STRING,\n    last_login TIMESTAMP,\n    INDEX idx_tenant (tenant_id),\n    INDEX idx_email (email)\n);\n\nCREATE OR REPLACE HYBRID TABLE api_keys (\n    key_id STRING PRIMARY KEY,\n    user_id STRING,\n    key_hash STRING,\n    expires_at TIMESTAMP,\n    INDEX idx_user (user_id),\n    INDEX idx_hash (key_hash)\n);\n\n-- Cold/analytical data: regular Snowflake tables (optimized for scans)\nCREATE OR REPLACE TABLE event_log (\n    event_id STRING,\n    tenant_id STRING,\n    user_id STRING,\n    event_type STRING,\n    event_data VARIANT,\n    created_at TIMESTAMP\n);\n\n-- Unified view: join hot + cold for complete picture\nCREATE OR REPLACE VIEW user_activity AS\nSELECT\n    u.user_id,\n    u.email,\n    u.role,\n    t.tenant_id,\n    t.plan,\n    e.event_type,\n    e.created_at\nFROM user_accounts u\nJOIN tenant_config t ON u.tenant_id = t.tenant_id\nLEFT JOIN event_log e ON u.user_id = e.user_id\nWHERE e.created_at >= DATEADD('DAY', -30, CURRENT_TIMESTAMP());\n\n-- Monitor Hybrid Table performance\nSELECT\n    query_id,\n    LEFT(query_text, 200) AS query_preview,\n    total_elapsed_time / 1000 AS seconds,\n    rows_produced,\n    bytes_scanned\nFROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY\nWHERE start_time >= DATEADD('DAY', -7, CURRENT_TIMESTAMP())\n    AND (query_text ILIKE '%user_accounts%'\n         OR query_text ILIKE '%tenant_config%'\n         OR query_text ILIKE '%api_keys%')\n    AND total_elapsed_time > 1000  -- > 1 second\nORDER BY total_elapsed_time DESC;\n\n-- When to use Hybrid Tables vs regular tables:\n-- Hybrid: point lookups by PK/index, CRUD operations, ACID transactions, < 10M rows\n-- Regular: full table scans, bulk loads, aggregations, > 10M rows, time travel heavy\n-- Mixed: use Hybrid for hot data, regular for cold, views to unify",
          },
        ],
        tips: [
          "Hybrid Tables enforce primary keys — INSERT/UPDATE with duplicate PK values will fail.",
          "Use INDEX for columns frequently used in WHERE clauses for point lookups — not for analytical scan columns.",
          "Hybrid Tables support both point lookups (indexed) and full scans (micro-partitions) — but scans are slower than regular tables.",
          "Best for operational data (< 10M rows) needing fast CRUD — use regular tables for large analytical datasets.",
          "ACID transactions work the same as regular tables — BEGIN/COMMIT/ROLLBACK fully supported.",
        ],
        mistake: "Creating indexes on every column — indexes speed up lookups but slow down INSERT/UPDATE/DELETE and consume storage. Only index columns used frequently in WHERE clause point lookups.",
        shorthand: {
          verbose: "-- Hybrid table with PK and indexes\nCREATE HYBRID TABLE t (id INT PRIMARY KEY, name STRING, created_at TIMESTAMP, INDEX idx_name (name));\n-- Fast point lookup: SELECT * FROM t WHERE id = 1;\n-- Transactional: BEGIN; UPDATE t SET name='x' WHERE id=1; COMMIT;",
          concise: "-- Quick hybrid\nCREATE HYBRID TABLE t (id INT PRIMARY KEY, c STRING, INDEX idx_c(c));",
        },
      },
      {
        id: "native-apps",
        fn: "Snowflake Native Apps — distribute applications via Marketplace",
        desc: "Native Apps allow packaging Snowflake objects (tables, procedures, Streamlit apps) into a shareable application that consumers install in their own Snowflake account — no data movement.",
        category: "Application",
        subtitle: "NATIVE APP, Marketplace, application package, share, consumer, provider, version, install, data sharing",
        signature: "CREATE APPLICATION PACKAGE name FROM ... VERSION = '1.0';",
        descLong: "Snowflake Native Apps enable developers to package Snowflake objects (tables, views, stored procedures, UDFs, Streamlit apps, roles) into a distributable application. Consumers install the app from the Snowflake Marketplace or directly from the provider's account. Key features: (1) Zero data movement — the app runs in the consumer's account with their data. (2) Provider-managed — the provider controls versions and updates. (3) Consumer-governed — the consumer controls data access and compute. (4) Monetization — providers can charge via Marketplace listings. (5) Setup script — defines the app's schema, objects, and permissions. Use cases: SaaS analytics tools, data quality monitors, ML model deployment, industry-specific solutions (finance, healthcare). Native Apps combine data sharing with application logic — the consumer gets both the data and the code to process it.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Package a Streamlit dashboard as a Native App\n-- APPROACH  - Create application package with setup script and manifest\n-- STRENGTHS - Distributable; no data movement; consumer-controlled\n-- WEAKNESSES- Complex packaging; version management required\n\n-- Step 1: Create the app's setup script (setup.sql)\n-- This runs in the consumer's account on install\nCREATE SCHEMA IF NOT EXISTS core;\nCREATE SCHEMA IF NOT EXISTS data;\n\n-- Create the app's tables (consumer provides data)\nCREATE OR REPLACE TABLE data.metrics (\n    metric_name STRING,\n    metric_value FLOAT,\n    recorded_at TIMESTAMP\n);\n\n-- Create the Streamlit app\nCREATE OR REPLACE STREAMLIT app.dashboard\nFROM @app_stage\nDIRECTORY = '/'\nMAIN_FILE = 'dashboard.py'\nQUERY_WAREHOUSE = app_warehouse;\n\n-- Step 2: Create manifest.yml\n-- version: 1.0\n-- configuration:\n--   trace: false\n--   log_level: info\n\n-- Step 3: Package the app (provider account)\nCREATE OR REPLACE APPLICATION PACKAGE my_metrics_app\nFROM @app_stage\nUSING 'manifest.yml';\n\n-- Step 4: Publish to Marketplace (provider account)\nCREATE OR REPLACE LISTING my_metrics_listing\nFROM APPLICATION PACKAGE my_metrics_app\nTITLE = 'Metrics Dashboard Pro'\nDESCRIPTION = 'Interactive metrics dashboard with real-time analytics'\n-- Consumers can now install from Marketplace",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Build a data quality monitoring app for distribution\n-- APPROACH  - Package DQ checks + Streamlit dashboard as a Native App\n-- STRENGTHS - Turnkey solution; consumer installs and runs immediately\n-- WEAKNESSES- Consumer must grant data access; version updates needed\n\n-- setup.sql (runs in consumer's account):\nCREATE SCHEMA IF NOT EXISTS dq_core;\nCREATE SCHEMA IF NOT EXISTS dq_data;\n\n-- DQ metric functions\nCREATE OR REPLACE SCHEMA-PUBLIC FUNCTION dq_core.null_count(\n    table_name STRING, column_name STRING\n) RETURNS NUMBER AS\n$$\n    SELECT COUNT(*) FROM IDENTIFIER(:table_name) WHERE IDENTIFIER(:column_name) IS NULL\n$$;\n\n-- DQ results table (in consumer's account)\nCREATE OR REPLACE TABLE dq_data.results (\n    check_id STRING,\n    table_name STRING,\n    column_name STRING,\n    check_type STRING,\n    result_value FLOAT,\n    status STRING,\n    checked_at TIMESTAMP\n);\n\n-- DQ monitoring task\nCREATE OR REPLACE TASK dq_monitor\nWAREHOUSE = app_warehouse\nSCHEDULE = 'HOURLY'\nAS\nINSERT INTO dq_data.results\nSELECT\n    UUID_STRING(), table_name, column_name, 'null_count',\n    dq_core.null_count(table_name, column_name),\n    CASE WHEN dq_core.null_count(table_name, column_name) > 0 THEN 'FAIL' ELSE 'PASS' END,\n    CURRENT_TIMESTAMP()\nFROM dq_config.checks;\n\n-- Streamlit dashboard for results\nCREATE OR REPLACE STREAMLIT app.dashboard\nFROM @app_stage DIRECTORY = '/' MAIN_FILE = 'dashboard.py'\nQUERY_WAREHOUSE = app_warehouse;\n\n-- Consumer installs and configures:\n-- 1. Install app from Marketplace\n-- 2. Grant access to their tables: GRANT USAGE ON DATABASE my_db TO APPLICATION my_dq_app;\n-- 3. Configure which tables to monitor\n-- 4. App runs DQ checks hourly and shows dashboard",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a multi-version Native App with consumer data integration\n-- APPROACH  - Versioned releases, consumer-specific configuration, upgrade path\n-- STRENGTHS - Production-grade; versioned; consumer-configurable\n-- WEAKNESSES- Complex; requires careful upgrade management\n\n-- Provider account: create versioned application package\nCREATE OR REPLACE APPLICATION PACKAGE analytics_toolkit\nFROM @app_stage\nUSING 'manifest.yml'\nVERSION = '2.1.0'\nPATCH = 'bugfix_null_handling';\n\n-- Define consumer-facing configuration\n-- manifest.yml:\n-- version: 2.1.0\n-- configuration:\n--   objects:\n--     - name: input_database\n--       type: DATABASE\n--       required: true\n--       label: 'Select your data database'\n--     - name: compute_warehouse\n--       type: WAREHOUSE\n--       required: true\n--       label: 'Select compute warehouse'\n--   log_level: info\n\n-- setup.sql: use consumer-provided references\nCREATE OR REPLACE SCHEMA core;\n\n-- Reference consumer's database (provided during install)\nCREATE OR REPLACE VIEW core.customer_data AS\nSELECT * FROM IDENTIFIER(${{ input_database }}.public.sales);\n\n-- App logic\nCREATE OR REPLACE PROCEDURE core.run_analysis()\nRETURNS STRING\nLANGUAGE SQL\nAS\nBEGIN\n    -- Use consumer's warehouse\n    LET wh := ${{ compute_warehouse }};\n    \n    -- Run analysis on consumer's data\n    INSERT INTO core.results\n    SELECT\n        DATE_TRUNC('MONTH', order_date) AS month,\n        category,\n        SUM(amount) AS total,\n        COUNT(*) AS orders\n    FROM core.customer_data\n    GROUP BY 1, 2;\n    \n    RETURN 'Analysis complete';\nEND;\n\n-- Streamlit dashboard\nCREATE OR REPLACE STREAMLIT app.dashboard\nFROM @app_stage DIRECTORY = '/' MAIN_FILE = 'dashboard.py'\nQUERY_WAREHOUSE = ${{ compute_warehouse }};\n\n-- Provider: publish new version\nALTER APPLICATION PACKAGE analytics_toolkit\nADD VERSION '2.2.0' FROM @app_stage/v2.2.0/;\n\n-- Consumer: upgrade to new version\nALTER APPLICATION my_analytics_toolkit UPGRADE TO VERSION '2.2.0';\n\n-- Provider: monitor installations\nSELECT\n    app_name,\n    app_version,\n    consumer_account_name,\n    installed_on,\n    status\nFROM SNOWFLAKE.ACCOUNT_USAGE.INSTALLATIONS\nWHERE app_package_name = 'analytics_toolkit'\nORDER BY installed_on DESC;",
          },
        ],
        tips: [
          "Native Apps run in the consumer's account — no data leaves their environment, ensuring compliance.",
          "Use the setup.sql script to create all required objects — it runs automatically on install and upgrade.",
          "Consumers provide references (databases, warehouses) during installation via the manifest configuration.",
          "Version management: ADD VERSION for new releases, consumers UPGRADE when ready — no forced upgrades.",
          "Monetize via Snowflake Marketplace listings — charge per-use, monthly, or bring-your-own-license.",
        ],
        mistake: "Hardcoding database/warehouse names in setup.sql — consumers have different naming conventions. Use manifest configuration references (${{ input_database }}) to let consumers specify their objects.",
        shorthand: {
          verbose: "-- Native App packaging\nCREATE APPLICATION PACKAGE pkg FROM @stage USING 'manifest.yml' VERSION='1.0';\n-- Consumer install: CREATE APPLICATION my_app FROM MARKETPLACE LISTING 'pkg';\n-- Upgrade: ALTER APPLICATION my_app UPGRADE TO VERSION '2.0';",
          concise: "-- Quick native app\nCREATE APPLICATION PACKAGE p FROM @s USING 'm.yml' VERSION='1.0';",
        },
      },
    ],
  },

]

export default { meta, sections }
