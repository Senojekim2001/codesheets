---
type: "file-index"
domain: "python"
file: "numpy"
title: "NumPy"
tags:
  - "python"
  - "python/numpy"
  - "index"
---

# NumPy

> 28 entries across 4 sections.

## Array Creation · 6

- [[Sections/numpy/creation/np-array|np.array()]] — Create a NumPy array from a Python list or nested list.
- [[Sections/numpy/creation/np-zeros|np.zeros()]] — Create an array filled with zeros.
- [[Sections/numpy/creation/np-ones|np.ones()]] — Create an array filled with ones.
- [[Sections/numpy/creation/np-arange|np.arange()]] — Generate values from start to stop with a fixed step.
- [[Sections/numpy/creation/np-linspace|np.linspace()]] — Generate exactly N evenly spaced values between start and stop.
- [[Sections/numpy/creation/np-random|np.random.default_rng()]] — Generate random arrays with the modern NumPy random API.

## Indexing & Slicing · 5

- [[Sections/numpy/indexing/array-slicing|Array slicing]] — Select subarrays by position using start:stop:step syntax.
- [[Sections/numpy/indexing/boolean-masking|Boolean masking]] — Select elements where a condition is True.
- [[Sections/numpy/indexing/fancy-indexing|Fancy indexing]] — Select elements using integer arrays or lists of indices.
- [[Sections/numpy/indexing/np-unique|np.unique()]] — Find unique elements and optionally their counts or inverse indices.
- [[Sections/numpy/indexing/np-where|np.where()]] — Vectorized conditional — choose between two values element-wise.

## Operations, Math & Performance · 12

- [[Sections/numpy/operations/vectorized-ops|Vectorized operations]] — Apply element-wise arithmetic to arrays without loops.
- [[Sections/numpy/operations/np-clip|np.clip()]] — Clamp array values to a specified range.
- [[Sections/numpy/operations/broadcasting|Broadcasting]] — Operate on arrays of different shapes by automatically expanding dimensions.
- [[Sections/numpy/operations/np-meshgrid|np.meshgrid()]] — Create coordinate matrices from coordinate vectors.
- [[Sections/numpy/operations/np-nan|np.nan handling]] — Detect, replace, and compute safely with NaN values.
- [[Sections/numpy/operations/aggregations|Aggregations]] — Reduce arrays along an axis — sum, mean, std, min, max.
- [[Sections/numpy/operations/np-diff|np.diff()]] — Compute differences between consecutive elements.
- [[Sections/numpy/operations/np-argmax|np.argmax() / np.argmin()]] — Return the index of the maximum or minimum value.
- [[Sections/numpy/operations/np-sort|np.sort() / np.argsort()]] — Sort array values or get the sorting indices.
- [[Sections/numpy/operations/np-linalg|np.linalg]] — Linear algebra — solve systems, invert matrices, eigenvalues, SVD.
- [[Sections/numpy/operations/np-einsum|np.einsum()]] — Express complex tensor operations with Einstein summation notation.
- [[Sections/numpy/operations/np-dtype-perf|dtype optimization]] — Choose numeric types to reduce memory and increase speed.

## Shape & Structure · 5

- [[Sections/numpy/shape/reshape|np.reshape()]] — Change the shape of an array without changing its data.
- [[Sections/numpy/shape/np-stack|np.stack()]] — Join arrays along a NEW axis.
- [[Sections/numpy/shape/np-concatenate|np.concatenate()]] — Join arrays along an EXISTING axis.
- [[Sections/numpy/shape/np-tile|np.tile()]] — Repeat an entire array a specified number of times.
- [[Sections/numpy/shape/np-repeat|np.repeat()]] — Repeat each individual element of an array.
