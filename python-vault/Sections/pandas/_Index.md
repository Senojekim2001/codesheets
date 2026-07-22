---
type: "file-index"
domain: "python"
file: "pandas"
title: "Pandas"
tags:
  - "python"
  - "python/pandas"
  - "index"
---

# Pandas

> 55 entries across 5 sections.

## Reading, Writing & Performance · 9

- [[Sections/pandas/io/dataframe-constructor|pd.DataFrame()]] — Create a DataFrame from a dict, list, ndarray, or another DataFrame.
- [[Sections/pandas/io/series-constructor|pd.Series()]] — Create a one-dimensional labeled array.
- [[Sections/pandas/io/read-csv|pd.read_csv()]] — Load a CSV file into a DataFrame.
- [[Sections/pandas/io/read-excel|pd.read_excel()]] — Load an Excel file into a DataFrame.
- [[Sections/pandas/io/read-sql|pd.read_sql()]] — Load a SQL query result into a DataFrame.
- [[Sections/pandas/io/read-parquet|pd.read_parquet()]] — Read and write Parquet files — the best format for pandas data.
- [[Sections/pandas/io/dtype-opt|dtype optimization]] — Reduce DataFrame memory by downcasting numeric types and using category.
- [[Sections/pandas/io/pd-eval|pd.eval()]] — Evaluate multi-column arithmetic expressions faster than pandas.
- [[Sections/pandas/io/chunked-processing|Chunked processing]] — Process files larger than RAM in chunks.

## Inspecting Data · 6

- [[Sections/pandas/inspection/info|.info()]] — Print a concise summary of the DataFrame — types, nulls, memory.
- [[Sections/pandas/inspection/describe|.describe()]] — Compute summary statistics for numeric (and categorical) columns.
- [[Sections/pandas/inspection/value-counts|.value_counts()]] — Count unique values in a Series, sorted by frequency.
- [[Sections/pandas/inspection/head-tail|.head() / .tail()]] — Return the first or last N rows of a DataFrame.
- [[Sections/pandas/inspection/sample|.sample()]] — Return a random sample of rows or columns.
- [[Sections/pandas/inspection/nunique|.nunique()]] — Count the number of unique values per column.

## Selecting, Filtering & MultiIndex · 6

- [[Sections/pandas/selection/loc|.loc[]]] — Select rows and columns by label.
- [[Sections/pandas/selection/iloc|.iloc[]]] — Select rows and columns by integer position.
- [[Sections/pandas/selection/query|.query()]] — Filter rows with a readable SQL-like string expression.
- [[Sections/pandas/selection/isin|.isin()]] — Filter rows where a column value is in a list of allowed values.
- [[Sections/pandas/selection/between|.between()]] — Filter rows where a column value falls within a range.
- [[Sections/pandas/selection/multiindex|MultiIndex]] — Hierarchical index with multiple levels of row or column labels.

## Cleaning Data · 10

- [[Sections/pandas/cleaning/isna|.isna()]] — Detect missing values — returns a boolean DataFrame.
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates()]] — Find and remove duplicate rows.
- [[Sections/pandas/cleaning/dropna|.dropna()]] — Remove rows or columns containing missing values.
- [[Sections/pandas/cleaning/fillna|.fillna()]] — Fill missing values with a constant, statistic, or method.
- [[Sections/pandas/cleaning/astype|.astype()]] — Convert a column to a different dtype.
- [[Sections/pandas/cleaning/categorical|pd.Categorical]] — Fixed set of possible values with optional ordering.
- [[Sections/pandas/cleaning/to-numeric|pd.to_numeric()]] — Convert a Series to numeric, coercing bad values to NaN.
- [[Sections/pandas/cleaning/to-datetime|pd.to_datetime()]] — Parse a Series of strings or numbers into datetime64.
- [[Sections/pandas/cleaning/str-accessor|.str accessor]] — Vectorized string operations on a Series.
- [[Sections/pandas/cleaning/dt-accessor|.dt accessor]] — Extract datetime components and perform datetime arithmetic.

## Transforming Data · 24

- [[Sections/pandas/transform/sort-values|.sort_values()]] — Sort a DataFrame by one or more column values.
- [[Sections/pandas/transform/sort-index|.sort_index()]] — Sort a DataFrame by its row or column index.
- [[Sections/pandas/transform/rename|.rename()]] — Rename columns or index labels.
- [[Sections/pandas/transform/drop|.drop()]] — Remove rows or columns by label.
- [[Sections/pandas/transform/reset-set-index|.reset_index() / .set_index()]] — Move columns to/from the DataFrame index.
- [[Sections/pandas/transform/nlargest-nsmallest|.nlargest() / .nsmallest()]] — Return the N rows with the largest or smallest values in a column.
- [[Sections/pandas/transform/explode|.explode()]] — Transform each element of a list-like cell into a row.
- [[Sections/pandas/transform/assign|.assign()]] — Add or replace columns inline, returning a new DataFrame.
- [[Sections/pandas/transform/pipe|.pipe()]] — Pass the DataFrame into any function, enabling full method chaining.
- [[Sections/pandas/transform/apply|.apply()]] — Apply a function row-wise (axis=1) or column-wise (axis=0).
- [[Sections/pandas/transform/map|.map()]] — Map each element of a Series through a dict or function.
- [[Sections/pandas/transform/groupby|.groupby()]] — Split a DataFrame into groups by one or more column values.
- [[Sections/pandas/transform/agg|.agg()]] — Compute one or more aggregate statistics per group.
- [[Sections/pandas/transform/transform|.transform()]] — Apply a group function and return a Series aligned with the original index.
- [[Sections/pandas/transform/merge|pd.merge()]] — Join two DataFrames on key columns — SQL-style.
- [[Sections/pandas/transform/concat|pd.concat()]] — Stack DataFrames vertically or side-by-side.
- [[Sections/pandas/transform/pivot-table|.pivot_table()]] — Reshape data from long to wide format with aggregation.
- [[Sections/pandas/transform/melt|.melt()]] — Reshape data from wide to long (tidy) format.
- [[Sections/pandas/transform/df-stack|.stack()]] — Pivot innermost column level into row index.
- [[Sections/pandas/transform/rolling|.rolling()]] — Compute statistics over a fixed-size sliding window.
- [[Sections/pandas/transform/expanding|.expanding()]] — Compute statistics over all rows up to the current one.
- [[Sections/pandas/transform/shift|.shift()]] — Shift values forward or backward by N periods to create lag features.
- [[Sections/pandas/transform/cut|pd.cut()]] — Bin continuous data into fixed-width intervals.
- [[Sections/pandas/transform/qcut|pd.qcut()]] — Bin continuous data into equal-frequency quantile-based intervals.
