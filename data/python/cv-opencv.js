export const meta = {
  "id": "cv-opencv",
  "label": "OpenCV (cv2)",
  "icon": "👁️",
  "description": "OpenCV (`cv2`) — the C++ computer-vision workhorse exposed to Python: image I/O, color spaces, geometric transforms, filters and edges, morphology and thresholding, template/feature matching, video capture, and ONNX/DNN inference. Reads BGR by default — that single fact is the most common source of bugs when mixing cv2 with Pillow/Matplotlib/PyTorch."
}

export const sections = [

  // ── Section 1: I/O, color spaces, pixel access ─────────────────────────────────────────
  {
    id: "basics",
    title: "I/O, color spaces, pixel access",
    entries: [
      {
        id: "cv2-imread-imwrite",
        fn: "cv2.imread / cv2.imwrite — load and save images",
        desc: "Read an image from disk into a NumPy array, save it back. cv2 reads as **BGR**, height×width×3, dtype `uint8`. Returns `None` on failure (no exception) — always check.",
        category: "cv2 basics",
        subtitle: "cv2.imread (flags: IMREAD_COLOR/GRAYSCALE/UNCHANGED), shape (H,W,3), BGR vs RGB, cv2.imwrite (encodes by extension: .jpg/.png/.webp), JPEG quality, PNG compression, Unicode paths via np.fromfile + cv2.imdecode",
        signature: "cv2.imread(path, flags=cv2.IMREAD_COLOR) -> np.ndarray | None; cv2.imwrite(path, img, params)",
        descLong: "cv2.imread is the entry point: returns a `(H, W, 3)` uint8 ndarray in **BGR** order (legacy from the C++ days when BGR matched Windows bitmaps). Returns `None` for missing/corrupt files — never raises. cv2.imwrite picks encoder from extension. Three depths solve the SAME task — load image, convert to grayscale, save — at increasing depths: minimal imread/imwrite → robust None-check + IMREAD_UNCHANGED for alpha → batched processing with Unicode paths via np.fromfile/imdecode and quality params.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Load an image, convert to grayscale, save it.\n# APPROACH  - imread with default BGR -> cvtColor -> imwrite.\n# STRENGTHS - Two function calls.\n# WEAKNESSES- No error handling; assumes path exists; assumes ASCII path.\nimport cv2\n\nimg = cv2.imread('photo.jpg')                    # shape (H, W, 3), BGR uint8\ngray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)     # shape (H, W),    uint8\n\ncv2.imwrite('photo_gray.jpg', gray)\n\nprint(img.shape, img.dtype)                       # (H, W, 3) uint8\nprint(gray.shape, gray.dtype)                     # (H, W)    uint8\n\n# imread returns BGR (NOT RGB). If you display with matplotlib:\n#     plt.imshow(img)  ->  colors look wrong (red/blue swapped)\n# Convert first:\n#     plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — load, grayscale, save — with proper error handling\n#             and JPEG quality control.\n# APPROACH  - Check None, choose flag, set encode params.\n# STRENGTHS - Catches missing/corrupt files; respects alpha; tunes quality.\n# WEAKNESSES- Still ASCII-only path; no batching.\nimport cv2\nfrom pathlib import Path\n\nsrc = Path('photo.jpg')\n\n# Read with explicit flag:\n#   IMREAD_COLOR     (default) - drop alpha, force 3-channel BGR\n#   IMREAD_GRAYSCALE          - decode straight to single channel\n#   IMREAD_UNCHANGED          - keep alpha (4 channels) and 16-bit depth\nimg = cv2.imread(str(src), cv2.IMREAD_COLOR)\n\nif img is None:\n    raise FileNotFoundError(f\"cv2 could not read {src!r} (missing or unsupported format)\")\n\ngray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n\n# Encode params per format:\n#   JPEG: cv2.IMWRITE_JPEG_QUALITY  (0..100, default 95)\n#   PNG : cv2.IMWRITE_PNG_COMPRESSION (0..9, default 3)\n#   WEBP: cv2.IMWRITE_WEBP_QUALITY (1..101, lossless at 101)\nok = cv2.imwrite(\n    'photo_gray.jpg',\n    gray,\n    [cv2.IMWRITE_JPEG_QUALITY, 90],\n)\nif not ok:\n    raise RuntimeError(\"cv2.imwrite failed (bad path or encoder)\")\n\n# Tip: imread can also load straight to grayscale in one call -\n#       cv2.imread(src, cv2.IMREAD_GRAYSCALE)\n# That avoids decoding 3 channels just to throw 2 away.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — load, grayscale, save — production: Unicode paths,\n#             16-bit depth preserved, batched, atomic writes.\n# APPROACH  - np.fromfile + imdecode (Unicode-safe) ; imencode + tobytes.\n# STRENGTHS - Handles non-ASCII paths (Windows!); preserves bit depth;\n#             atomic via tmp+rename; batchable with map().\n# WEAKNESSES- More code; need to know the byte-buffer pattern.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\nfrom pathlib import Path\nfrom concurrent.futures import ThreadPoolExecutor\n\n\ndef imread_unicode(path: Path, flags: int = cv2.IMREAD_UNCHANGED) -> np.ndarray:\n    \"\"\"Unicode-safe read - cv2.imread on Windows mangles non-ASCII paths.\"\"\"\n    data = np.fromfile(str(path), dtype=np.uint8)\n    img = cv2.imdecode(data, flags)\n    if img is None:\n        raise RuntimeError(f\"decode failed for {path!r}\")\n    return img\n\n\ndef imwrite_unicode(path: Path, img: np.ndarray, params: list[int] | None = None) -> None:\n    \"\"\"Unicode-safe + atomic write.\"\"\"\n    ext = path.suffix or '.png'\n    ok, buf = cv2.imencode(ext, img, params or [])\n    if not ok:\n        raise RuntimeError(f\"encode failed for {path!r}\")\n    tmp = path.with_suffix(path.suffix + '.tmp')\n    tmp.write_bytes(buf.tobytes())\n    tmp.replace(path)                                  # atomic on POSIX & NTFS\n\n\ndef to_gray_preserve_depth(img: np.ndarray) -> np.ndarray:\n    \"\"\"cvtColor handles uint8 / uint16 / float32 - keeps dtype.\"\"\"\n    if img.ndim == 2:\n        return img\n    if img.shape[2] == 4:                              # BGRA\n        return cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)\n    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n\n\ndef process_one(src: Path, dst_dir: Path) -> Path:\n    img = imread_unicode(src)                          # may be 8-bit or 16-bit\n    gray = to_gray_preserve_depth(img)\n    out = dst_dir / f\"{src.stem}_gray{src.suffix}\"\n    params = [cv2.IMWRITE_JPEG_QUALITY, 92] if src.suffix.lower() in {'.jpg', '.jpeg'} else []\n    imwrite_unicode(out, gray, params)\n    return out\n\n\ndef batch(srcs: list[Path], dst_dir: Path, workers: int = 4) -> list[Path]:\n    dst_dir.mkdir(parents=True, exist_ok=True)\n    with ThreadPoolExecutor(max_workers=workers) as ex:\n        return list(ex.map(lambda p: process_one(p, dst_dir), srcs))\n\n# Decision rule:\n#   ASCII paths + uint8 only       -> cv2.imread / cv2.imwrite are fine.\n#   Unicode paths (Windows, i18n)  -> np.fromfile + cv2.imdecode (above).\n#   16-bit medical/RAW/HDR         -> IMREAD_UNCHANGED + don't cvtColor to uint8.\n#   Need atomic guarantees         -> imencode -> tmp -> rename.\n\n# Anti-pattern:\n#   if cv2.imread(path):  ...   # WRONG - returns ndarray; truthiness on\n#                                 ndarray raises ValueError. Use 'is None'.\n"
                  }
        ],
        tips: [
                  "cv2.imread returns BGR; convert to RGB before passing to matplotlib, Pillow, or PyTorch transforms.",
                  "imread returns None on failure — never raises. Always check `if img is None`.",
                  "np.fromfile + cv2.imdecode is the Unicode-safe replacement on Windows.",
                  "IMREAD_UNCHANGED preserves alpha (4ch) and 16-bit depth — use it for medical/HDR/PNG with transparency.",
                  "cv2.imwrite picks the codec from the extension; pass params via `[FLAG, value, FLAG, value]` flat list."
        ],
        mistake: "Treating cv2 arrays as RGB. They are BGR. Pass through `cv2.COLOR_BGR2RGB` before any non-cv2 library.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "cv2-color-spaces",
        fn: "cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB)",
        desc: "Convert between BGR (cv2 default), RGB (everyone else), HSV (color filtering), LAB (perceptual color), and grayscale. Always know the input space — half of all cv2 bugs come from forgetting that imread is BGR.",
        category: "cv2 basics",
        subtitle: "COLOR_BGR2RGB, COLOR_BGR2GRAY, COLOR_BGR2HSV (H: 0..179, S/V: 0..255 for uint8), COLOR_BGR2LAB, in-range masking for color, hue wrap-around for red",
        signature: "cv2.cvtColor(src, code) -> dst; cv2.inRange(src, lo, hi) -> mask",
        descLong: "cvtColor maps between color spaces using flags like `COLOR_BGR2HSV`. HSV is the practical choice for color filtering because hue is one channel — but cv2 packs H into 0..179 (so it fits in uint8), not 0..360. LAB is perceptually uniform — useful for color difference. The three depths solve the SAME task — pick out red pixels from an image — at increasing depths: naive RGB threshold → HSV with inRange → LAB ΔE distance with morphology cleanup.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Pick out red pixels in an image (mask = white where red).\n# APPROACH  - Threshold each BGR channel separately.\n# STRENGTHS - No color theory needed.\n# WEAKNESSES- Brittle: any lighting/shadow change kills it; no hue concept.\nimport cv2\nimport numpy as np\n\nimg = cv2.imread('apples.jpg')                    # BGR\nb, g, r = cv2.split(img)                          # three (H, W) uint8 arrays\n\n# Naive: red is high R, low G, low B.\nmask = (r > 150) & (g < 80) & (b < 80)\nmask = mask.astype(np.uint8) * 255\n\ncv2.imwrite('red_mask.png', mask)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — mask red pixels — using HSV (the right tool).\n# APPROACH  - cvtColor BGR->HSV; inRange around the red hue band.\n# STRENGTHS - Lighting-independent; one parameter (hue) per color.\n# WEAKNESSES- Red wraps around 0/180 in HSV; need TWO ranges and OR them.\nimport cv2\nimport numpy as np\n\nimg = cv2.imread('apples.jpg')\nhsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)        # H: 0..179, S/V: 0..255\n\n# Red hue is at 0 AND 180 (wrap-around). Need two inRange calls.\nlo1, hi1 = np.array([  0, 100, 50]), np.array([ 10, 255, 255])\nlo2, hi2 = np.array([170, 100, 50]), np.array([179, 255, 255])\n\nmask = cv2.inRange(hsv, lo1, hi1) | cv2.inRange(hsv, lo2, hi2)\n\ncv2.imwrite('red_mask_hsv.png', mask)\n\n# Why H ranges to 179 not 359? cv2 stores H/2 to fit in uint8.\n# So \"60 degrees\" on a normal color wheel is 30 in cv2.\n# Saturation > 100 filters out grays; Value > 50 filters near-black.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — mask red pixels — production: LAB ΔE distance,\n#             morphology cleanup, contour-area filter.\n# APPROACH  - LAB color distance from a reference red; clean noise.\n# STRENGTHS - Perceptually uniform; single threshold works across lighting;\n#             noise is gone after morphology.\n# WEAKNESSES- LAB conversion is ~3x slower than HSV; need a reference color.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\n\n\ndef red_mask_lab(img_bgr: np.ndarray, *, delta_e: float = 25.0,\n                 min_area: int = 50) -> np.ndarray:\n    \"\"\"Mask red regions using LAB perceptual distance.\"\"\"\n    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)\n\n    # Reference \"red\" in LAB: pure red (255,0,0) -> LAB ~ (54, 81, 70)\n    ref = np.array([54.0, 81.0, 70.0], dtype=np.float32)\n\n    # Per-pixel Euclidean distance in LAB space (~ Delta E 76).\n    diff = lab - ref\n    dist = np.linalg.norm(diff, axis=2)               # (H, W) float32\n\n    mask = (dist < delta_e).astype(np.uint8) * 255\n\n    # Morphology: kill speckle, fill holes.\n    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))\n    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  kernel)\n    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)\n\n    # Drop blobs smaller than min_area.\n    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)\n    keep = np.zeros_like(mask)\n    for i in range(1, n):                             # 0 is background\n        if stats[i, cv2.CC_STAT_AREA] >= min_area:\n            keep[labels == i] = 255\n    return keep\n\n# Decision rule:\n#   Threshold colors                     -> HSV + inRange.\n#   Red specifically                     -> HSV with TWO ranges (wrap).\n#   Match perceived color across lights  -> LAB + Delta E distance.\n#   Need exact RGB equality (UI assets)  -> stay in BGR; np.all(img == c, -1).\n\n# Anti-pattern:\n#   img_rgb = cv2.imread(p)            # cv2.imread is BGR not RGB\n#   plt.imshow(img_rgb)                # red/blue swapped on screen\n# Always cvtColor BGR2RGB before plt.imshow / Pillow.fromarray / PyTorch.\n"
                  }
        ],
        tips: [
                  "cv2 hue range is 0..179 (H/2), saturation and value 0..255 — different from PIL/HTML 0..360.",
                  "Red wraps hue 0/180 — use two inRange calls and OR the masks.",
                  "LAB distance (Delta E) is the gold standard for \"looks the same color\" across lighting.",
                  "cv2.split/merge are cheap views, but slicing `img[:,:,0]` is identical and zero-copy.",
                  "Always cvtColor BGR→RGB before passing to matplotlib, PIL, or torchvision transforms."
        ],
        mistake: "Using RGB hue ranges (0..360) with cv2 — cv2 hue is 0..179. Halve any hue value taken from a Photoshop/CSS color picker.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "cv2-pixel-access-roi",
        fn: "Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2]",
        desc: "cv2 images are NumPy arrays — index with `[y, x]` (row, col), slice ROIs with `[y1:y2, x1:x2]`. Slices are **views**, not copies — modifying the ROI mutates the source. Use `.copy()` if you need an independent buffer.",
        category: "cv2 basics",
        subtitle: "img[y, x] -> BGR pixel (3,), img[y1:y2, x1:x2] = ROI view, .copy() for independence, np.ndarray indexing semantics, vectorized region edits",
        signature: "pixel = img[y, x]; roi = img[y1:y2, x1:x2]; img[mask] = color",
        descLong: "OpenCV images are just NumPy arrays — all NumPy indexing applies. Critical gotcha: indexing is `[row, col]` = `[y, x]` (vertical first), the opposite of mathematical `(x, y)` and the opposite of how cv2 functions (which take `(x, y)` tuples). Slicing returns a view — `roi[:] = 0` zeroes the original. Three depths solve the SAME task — blank out a rectangle and stamp a copy of the top-left corner — at depths: scalar pixel writes → ROI assignment → vectorized boolean mask with bounds check.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Black out a 100x100 rectangle at (x=50, y=30); copy the\n#             top-left 100x100 onto position (x=200, y=200).\n# APPROACH  - Loop over pixels.\n# STRENGTHS - Shows what's happening at the pixel level.\n# WEAKNESSES- Glacial in Python; should never do this in real code.\nimport cv2\n\nimg = cv2.imread('photo.jpg')\n\n# Black out 100x100 rectangle starting at (x=50, y=30).\nfor y in range(30, 130):\n    for x in range(50, 150):\n        img[y, x] = (0, 0, 0)                         # BGR pixel = black\n\n# Copy top-left 100x100 to (x=200, y=200).\nfor y in range(100):\n    for x in range(100):\n        img[200 + y, 200 + x] = img[y, x]\n\ncv2.imwrite('out.jpg', img)\n# This works but is ~1000x slower than the slice version below.\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — but using NumPy slicing (the right way).\n# APPROACH  - ROI assignment with [y1:y2, x1:x2].\n# STRENGTHS - Vectorized, ~1000x faster, two lines.\n# WEAKNESSES- Easy to mistake [y, x] for [x, y]; no bounds checking.\nimport cv2\n\nimg = cv2.imread('photo.jpg')\n\n# Black out 100x100 rectangle at (x=50, y=30).\nimg[30:130, 50:150] = 0                               # broadcast scalar to all 3 ch\n\n# Copy top-left 100x100 to (x=200, y=200).\n# IMPORTANT: .copy() because the slices overlap if dest is inside src.\nsrc_roi = img[0:100, 0:100].copy()\nimg[200:300, 200:300] = src_roi\n\ncv2.imwrite('out.jpg', img)\n\n# Two slice axes:\n#   img.shape == (H, W, C) so img[y, x, c] - row first.\n# Two cv2 conventions:\n#   cv2.rectangle, cv2.circle, cv2.line - take (x, y) tuples.\n#   img[y, x]                            - takes (y, x).\n# Forgetting which mode you're in is the #1 cv2 bug. Memorize:\n#     \"NumPy is row-major (y first); cv2 functions are point-style (x first).\"\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — robust ROI utilities: bounds-clip, copy or view,\n#             paste with alpha blending, mask-based edits.\n# APPROACH  - Helper functions with explicit clipping; broadcast over masks.\n# STRENGTHS - Won't crash on out-of-bounds; supports alpha; clear API.\n# WEAKNESSES- More LOC; have to think in (y1, x1, y2, x2) consistently.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\n\n\ndef clip_roi(img: np.ndarray, y: int, x: int, h: int, w: int) -> tuple[int, int, int, int]:\n    \"\"\"Clamp (y, x, h, w) so the ROI stays inside img.shape[:2].\"\"\"\n    H, W = img.shape[:2]\n    y0 = max(0, y);          x0 = max(0, x)\n    y1 = min(H, y + h);      x1 = min(W, x + w)\n    if y0 >= y1 or x0 >= x1:\n        raise ValueError(f\"ROI ({y},{x},{h},{w}) is outside image {H}x{W}\")\n    return y0, x0, y1, x1\n\n\ndef fill_rect(img: np.ndarray, y: int, x: int, h: int, w: int,\n              color: tuple[int, int, int] = (0, 0, 0)) -> None:\n    y0, x0, y1, x1 = clip_roi(img, y, x, h, w)\n    img[y0:y1, x0:x1] = color\n\n\ndef paste(dst: np.ndarray, src: np.ndarray, y: int, x: int,\n          alpha: np.ndarray | float = 1.0) -> None:\n    \"\"\"Paste src into dst at (y, x). Optional per-pixel alpha (H,W) in [0..1].\"\"\"\n    h, w = src.shape[:2]\n    y0, x0, y1, x1 = clip_roi(dst, y, x, h, w)\n    sy0, sx0 = y0 - y, x0 - x\n    sy1, sx1 = sy0 + (y1 - y0), sx0 + (x1 - x0)\n    src_clip = src[sy0:sy1, sx0:sx1]\n    if isinstance(alpha, float) and alpha == 1.0:\n        dst[y0:y1, x0:x1] = src_clip\n        return\n    a = alpha[sy0:sy1, sx0:sx1, None] if isinstance(alpha, np.ndarray) else alpha\n    blended = (a * src_clip + (1 - a) * dst[y0:y1, x0:x1]).astype(dst.dtype)\n    dst[y0:y1, x0:x1] = blended\n\n\ndef edit_by_mask(img: np.ndarray, mask: np.ndarray,\n                 color: tuple[int, int, int]) -> None:\n    \"\"\"Set every pixel where mask>0 to color. Mask is (H,W) uint8.\"\"\"\n    img[mask.astype(bool)] = color\n\n# Decision rule:\n#   Single pixel read/write    -> img[y, x] (scalar) - O(1).\n#   Rectangular region edit    -> img[y1:y2, x1:x2] = value - vectorized.\n#   Arbitrary-shape edit       -> boolean mask: img[mask] = value.\n#   Need to keep original safe -> .copy() the slice before mutating.\n#   Coords from cv2 functions  -> (x, y);   coords for indexing -> [y, x].\n\n# Anti-pattern:\n#   for y in range(H):              # Python loop on pixels\n#       for x in range(W):\n#           if img[y, x, 0] > 200:\n#               img[y, x] = (0,0,0)\n# 1000x slower than:\n#   img[img[..., 0] > 200] = (0, 0, 0)\n# If you find yourself looping over pixels, you're missing a vectorization.\n"
                  }
        ],
        tips: [
                  "Indexing is `[y, x]` (row, col); cv2 drawing functions take `(x, y)` — opposite order. Memorize it.",
                  "Slices are views — `roi[:] = 0` mutates the original. Use `.copy()` when you need independence.",
                  "`img[mask]` where mask is `(H, W)` boolean is the idiom for arbitrary-shape edits.",
                  "For per-pixel work, vectorize with NumPy or call cv2 — Python loops are 100-1000x slower.",
                  "Always clip ROI bounds before slicing — out-of-bounds slices silently truncate (not what you want for paste)."
        ],
        mistake: "Swapping x and y. NumPy indexing is `[y, x]`; cv2 point arguments are `(x, y)`. Mixing them silently flips the operation along the diagonal.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Geometric transforms — resize, rotate, warp ─────────────────────────────────────────
  {
    id: "transforms",
    title: "Geometric transforms — resize, rotate, warp",
    entries: [
      {
        id: "cv2-resize-rotation",
        fn: "cv2.resize / cv2.warpAffine — resize and rotate",
        desc: "Resize with `cv2.resize(img, (w, h), interpolation=...)` — note `(w, h)` order. Rotate with `getRotationMatrix2D` + `warpAffine`. Pick the right interpolation: AREA for downscale, CUBIC/LANCZOS4 for upscale.",
        category: "transforms",
        subtitle: "cv2.resize ((w,h) order!), INTER_AREA (downscale), INTER_CUBIC/INTER_LANCZOS4 (upscale), getRotationMatrix2D, warpAffine, borderMode (CONSTANT/REFLECT/REPLICATE), bounding-box-aware rotation",
        signature: "cv2.resize(src, dsize=(w,h), fx=, fy=, interpolation=); cv2.warpAffine(src, M, dsize)",
        descLong: "cv2.resize takes `(width, height)` — the OPPOSITE of every other shape API in cv2/NumPy. Pass `None` for dsize and use `fx`/`fy` for fractional scaling. Interpolation matters: INTER_AREA is the right downscaler (anti-aliased), INTER_CUBIC and INTER_LANCZOS4 are sharper for upscale. Rotation = build a 2x3 affine matrix with `getRotationMatrix2D((cx, cy), angle, scale)` then `warpAffine`. Three depths solve the SAME task — resize to 800px and rotate 30° — at depths: naive resize+rotate (corners clipped) → correct interpolation per direction → bounding-box-aware rotation that grows the canvas to fit.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Resize to 800px wide, then rotate 30 degrees.\n# APPROACH  - cv2.resize then warpAffine with default args.\n# STRENGTHS - Two lines.\n# WEAKNESSES- Default INTER_LINEAR is fine for upscale, BAD for downscale;\n#             rotation clips corners (canvas stays the same size).\nimport cv2\n\nimg = cv2.imread('photo.jpg')\nh, w = img.shape[:2]\n\n# Resize to width=800, keep aspect.\nnew_w = 800\nnew_h = int(h * (new_w / w))\nimg = cv2.resize(img, (new_w, new_h))                 # (w, h) order!\n\n# Rotate 30 degrees about center.\n(cx, cy) = (new_w // 2, new_h // 2)\nM = cv2.getRotationMatrix2D((cx, cy), angle=30, scale=1.0)\nimg = cv2.warpAffine(img, M, (new_w, new_h))          # (w, h) again\n\ncv2.imwrite('out.jpg', img)\n# Corners get cut off because the canvas size didn't grow.\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — resize to 800px, rotate 30 deg — with correct\n#             interpolation and a sane border fill.\n# APPROACH  - INTER_AREA for downscale; BORDER_REFLECT to avoid black edges.\n# STRENGTHS - No aliasing on downscale; smooth rotated edges.\n# WEAKNESSES- Canvas still doesn't grow; corners still clipped.\nimport cv2\n\nimg = cv2.imread('photo.jpg')\nh, w = img.shape[:2]\n\n# Pick interpolation by direction:\n#   downscale (new < old) -> INTER_AREA  (anti-aliased)\n#   upscale   (new > old) -> INTER_CUBIC or INTER_LANCZOS4\nnew_w = 800\nscale = new_w / w\ninterp = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC\nimg = cv2.resize(img, None, fx=scale, fy=scale, interpolation=interp)\n\nnew_h = img.shape[0]\nM = cv2.getRotationMatrix2D((new_w / 2, new_h / 2), 30, 1.0)\nimg = cv2.warpAffine(\n    img, M, (new_w, new_h),\n    flags=cv2.INTER_LINEAR,\n    borderMode=cv2.BORDER_REFLECT,                    # avoid black wedges\n)\n\ncv2.imwrite('out.jpg', img)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — resize to 800px, rotate 30 deg — production: canvas\n#             grows to fit the rotated bounding box, no clipping, no waste.\n# APPROACH  - Compute new bbox from rotated corners; translate matrix to\n#             new origin; warpAffine into the bigger canvas.\n# STRENGTHS - Lossless rotation (no clipping); minimal canvas size.\n# WEAKNESSES- More math; need to remember the matrix is 2x3 not 3x3.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\n\n\ndef smart_resize(img: np.ndarray, max_side: int) -> np.ndarray:\n    h, w = img.shape[:2]\n    if max(h, w) <= max_side:\n        return img\n    scale = max_side / max(h, w)\n    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_LANCZOS4\n    return cv2.resize(img, None, fx=scale, fy=scale, interpolation=interp)\n\n\ndef rotate_no_clip(img: np.ndarray, angle: float,\n                   border: int = cv2.BORDER_REFLECT) -> np.ndarray:\n    \"\"\"Rotate so the full image fits in the output (canvas grows).\"\"\"\n    h, w = img.shape[:2]\n    cx, cy = w / 2.0, h / 2.0\n\n    # Affine rotation matrix.\n    M = cv2.getRotationMatrix2D((cx, cy), angle, 1.0)\n\n    # Compute the new bounding box dimensions.\n    cos = abs(M[0, 0])\n    sin = abs(M[0, 1])\n    new_w = int(h * sin + w * cos)\n    new_h = int(h * cos + w * sin)\n\n    # Translate the matrix so the rotated image is centered in the new canvas.\n    M[0, 2] += (new_w / 2.0) - cx\n    M[1, 2] += (new_h / 2.0) - cy\n\n    return cv2.warpAffine(img, M, (new_w, new_h),\n                          flags=cv2.INTER_LINEAR, borderMode=border)\n\n\nimg = cv2.imread('photo.jpg')\nimg = smart_resize(img, 800)\nimg = rotate_no_clip(img, 30)\ncv2.imwrite('out.jpg', img)\n\n# Decision rule:\n#   Downscale            -> INTER_AREA.\n#   Upscale (real photo) -> INTER_CUBIC (fast) or INTER_LANCZOS4 (sharp).\n#   Upscale (line art)   -> INTER_NEAREST (preserves hard edges).\n#   Rotation tiny angle  -> warpAffine into same canvas is fine.\n#   Rotation big angle   -> grow canvas (above) or use rotate() if 90/180/270.\n#   Pure 90/180/270      -> cv2.rotate(img, ROTATE_90_CLOCKWISE) - faster, no interp.\n\n# Anti-pattern:\n#   cv2.resize(img, (h, w))      # passing (height, width) instead of (w, h)\n# Image comes back transposed-looking - aspect ratio destroyed. cv2.resize\n# is the ONE place in cv2 where \"size\" is (w, h), not (h, w).\n"
                  }
        ],
        tips: [
                  "cv2.resize takes `(width, height)` — opposite of `img.shape` which is `(height, width, channels)`.",
                  "INTER_AREA is the only correct downscaler — INTER_LINEAR aliases on shrink.",
                  "90°/180°/270° rotations should use `cv2.rotate` (no interpolation, faster).",
                  "For lossless rotation, grow the canvas based on cos/sin of the angle.",
                  "Use `cv2.warpAffine` for any 2x3 transform; `cv2.warpPerspective` for 3x3 homographies."
        ],
        mistake: "Using INTER_LINEAR to downscale — produces aliasing. Use INTER_AREA when shrinking.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "cv2-perspective-warp",
        fn: "cv2.getPerspectiveTransform / warpPerspective — deskew documents",
        desc: "Compute a 3x3 homography from 4 source points to 4 destination points. Used for document deskewing, license plate rectification, AR markers — anywhere you have a quadrilateral that should become a rectangle.",
        category: "transforms",
        subtitle: "getPerspectiveTransform (4 src + 4 dst points), warpPerspective (3x3 matrix vs 2x3 affine), corner ordering convention (TL, TR, BR, BL), document deskew pipeline",
        signature: "M = cv2.getPerspectiveTransform(src_pts, dst_pts); cv2.warpPerspective(img, M, (w, h))",
        descLong: "Perspective warp maps any quadrilateral to any other quadrilateral via a 3x3 homography. The classic use is \"scan a photo of a document\": detect the 4 corners of the page in the photo, map them to a clean rectangle. Three depths solve the SAME task — deskew a 4-corner document — at increasing depths: hardcoded corner points → user-clicked corners with sorting → automatic corner detection via contour finding + corner sorting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Deskew a document photo when you already know the 4 corners.\n# APPROACH  - getPerspectiveTransform + warpPerspective.\n# STRENGTHS - Direct; teaches the 4-point pattern.\n# WEAKNESSES- Hardcoded points; assumes you know corner order.\nimport cv2\nimport numpy as np\n\nimg = cv2.imread('document.jpg')\n\n# 4 source points in the photo (TL, TR, BR, BL order).\nsrc = np.float32([[110, 95], [610, 80], [640, 880], [80, 870]])\n\n# 4 destination points - a clean A4-ish rectangle.\nW, H = 600, 800\ndst = np.float32([[0, 0], [W, 0], [W, H], [0, H]])\n\nM = cv2.getPerspectiveTransform(src, dst)\nflat = cv2.warpPerspective(img, M, (W, H))\n\ncv2.imwrite('document_flat.jpg', flat)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — deskew a document — but accept user-clicked corners\n#             in any order and sort them automatically.\n# APPROACH  - Sort 4 points to (TL, TR, BR, BL); auto-size output by edge length.\n# STRENGTHS - Robust to click order; output keeps document aspect.\n# WEAKNESSES- Still need user clicks; no auto-detect.\nimport cv2\nimport numpy as np\n\n\ndef order_corners(pts: np.ndarray) -> np.ndarray:\n    \"\"\"Sort 4 (x,y) points into (TL, TR, BR, BL) order.\"\"\"\n    pts = pts.reshape(4, 2)\n    s = pts.sum(axis=1)                               # x + y\n    d = np.diff(pts, axis=1).flatten()                # y - x\n    return np.float32([\n        pts[np.argmin(s)],                            # TL = min sum\n        pts[np.argmin(d)],                            # TR = min diff\n        pts[np.argmax(s)],                            # BR = max sum\n        pts[np.argmax(d)],                            # BL = max diff\n    ])\n\n\ndef four_point_warp(img: np.ndarray, pts: np.ndarray) -> np.ndarray:\n    src = order_corners(pts)\n    (tl, tr, br, bl) = src\n\n    # Output size = average of opposite edges (preserves document aspect).\n    width  = int(max(np.linalg.norm(br - bl), np.linalg.norm(tr - tl)))\n    height = int(max(np.linalg.norm(tr - br), np.linalg.norm(tl - bl)))\n\n    dst = np.float32([[0, 0], [width - 1, 0],\n                      [width - 1, height - 1], [0, height - 1]])\n\n    M = cv2.getPerspectiveTransform(src, dst)\n    return cv2.warpPerspective(img, M, (width, height))\n\n\nimg = cv2.imread('document.jpg')\nclicks = np.array([[610, 80], [80, 870], [110, 95], [640, 880]])  # any order\nflat = four_point_warp(img, clicks)\ncv2.imwrite('document_flat.jpg', flat)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — deskew a document — production: auto-detect the page\n#             edges with contours, choose the largest 4-corner contour,\n#             warp to corrected aspect.\n# APPROACH  - Edge detection -> largest contour -> approxPolyDP to 4 pts -> warp.\n# STRENGTHS - Zero user input; works for any rectangular document on contrast.\n# WEAKNESSES- Fails if document edges blend into background; need fallback.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\n\n\ndef order_corners(pts: np.ndarray) -> np.ndarray:\n    pts = pts.reshape(4, 2)\n    s, d = pts.sum(1), np.diff(pts, axis=1).flatten()\n    return np.float32([pts[np.argmin(s)], pts[np.argmin(d)],\n                       pts[np.argmax(s)], pts[np.argmax(d)]])\n\n\ndef find_document_corners(img: np.ndarray) -> np.ndarray | None:\n    \"\"\"Find the largest 4-corner contour. None if not found.\"\"\"\n    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n    blur = cv2.GaussianBlur(gray, (5, 5), 0)\n    edges = cv2.Canny(blur, 50, 150)\n\n    # Dilate so broken edges connect.\n    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)\n\n    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL,\n                                   cv2.CHAIN_APPROX_SIMPLE)\n    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]\n\n    for c in contours:\n        peri = cv2.arcLength(c, True)\n        approx = cv2.approxPolyDP(c, 0.02 * peri, True)\n        if len(approx) == 4 and cv2.contourArea(c) > 0.1 * img.size:\n            return approx\n    return None\n\n\ndef deskew(img: np.ndarray) -> np.ndarray:\n    corners = find_document_corners(img)\n    if corners is None:\n        return img                                    # fallback: original\n\n    src = order_corners(corners)\n    (tl, tr, br, bl) = src\n    W = int(max(np.linalg.norm(br - bl), np.linalg.norm(tr - tl)))\n    H = int(max(np.linalg.norm(tr - br), np.linalg.norm(tl - bl)))\n    dst = np.float32([[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]])\n    M = cv2.getPerspectiveTransform(src, dst)\n    return cv2.warpPerspective(img, M, (W, H))\n\n# Decision rule:\n#   Map 2D plane -> 2D plane (rotate/scale/skew, no perspective)\n#       -> warpAffine (2x3 matrix).\n#   Need to flatten a quadrilateral to a rectangle (perspective)\n#       -> getPerspectiveTransform + warpPerspective (3x3).\n#   Stitch panoramas / match scenes\n#       -> findHomography(RANSAC) instead of getPerspectiveTransform.\n#   Need to undo lens distortion BEFORE deskew\n#       -> cv2.undistort with calibration matrix first.\n\n# Anti-pattern:\n#   warpAffine with a homography matrix       # silently drops the perspective row\n# warpAffine takes 2x3, warpPerspective takes 3x3. Using affine when the\n# transform has any depth distortion gives a wrong-but-plausible result.\n"
                  }
        ],
        tips: [
                  "getPerspectiveTransform needs exactly 4 src and 4 dst points in matching order.",
                  "Order corners as (TL, TR, BR, BL) — the standard convention.",
                  "For panorama/scene matching where points are noisy, use `findHomography(RANSAC)` instead of `getPerspectiveTransform`.",
                  "Output size should match the longest edges to preserve document aspect.",
                  "`approxPolyDP` collapses a contour to a polygon — if you get exactly 4 vertices, you found a quadrilateral."
        ],
        mistake: "Passing a 3x3 homography to `warpAffine` (which only reads the top 2 rows). Use `warpPerspective` for any non-affine transform.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 3: Blur, edges, morphology, thresholding ─────────────────────────────────────────
  {
    id: "filters",
    title: "Blur, edges, morphology, thresholding",
    entries: [
      {
        id: "cv2-blur-edges",
        fn: "cv2.GaussianBlur / cv2.Canny — smoothing and edge detection",
        desc: "GaussianBlur smooths noise (kernel must be odd, sigma controls strength). Canny finds edges from a blurred image — the workhorse pipeline is `Gaussian → Canny → contours`. Tune Canny's two hysteresis thresholds, not just one.",
        category: "filters",
        subtitle: "GaussianBlur (odd ksize, sigmaX), medianBlur (salt-and-pepper noise), bilateralFilter (preserves edges), Canny (lo/hi hysteresis), Sobel/Laplacian (gradient operators), auto-threshold via image median",
        signature: "cv2.GaussianBlur(src, ksize=(k,k), sigmaX=); cv2.Canny(src, threshold1=, threshold2=)",
        descLong: "GaussianBlur with odd kernel size is the standard smoother; medianBlur is the right choice for salt-and-pepper noise; bilateralFilter smooths while keeping edges crisp (slower). Canny applies Sobel-derived gradients then double-thresholds: pixels above hi are edges, pixels above lo connected to hi are kept (hysteresis). Three depths solve the SAME task — find edges in a noisy photo — at depths: blur+Canny with hardcoded thresholds → auto-thresholds from image median → bilateralFilter + Canny + dilate-close to clean broken edges.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Find edges in a noisy photo.\n# APPROACH  - GaussianBlur to denoise, Canny with fixed thresholds.\n# STRENGTHS - Two-line edge detector.\n# WEAKNESSES- Thresholds 100/200 won't work for every image.\nimport cv2\n\nimg = cv2.imread('photo.jpg', cv2.IMREAD_GRAYSCALE)\n\nblur = cv2.GaussianBlur(img, ksize=(5, 5), sigmaX=1.0)\nedges = cv2.Canny(blur, threshold1=100, threshold2=200)\n\ncv2.imwrite('edges.jpg', edges)\n\n# Kernel size MUST be odd and positive. (3,3) (5,5) (7,7) typical.\n# sigmaX=0 -> auto from kernel size; explicit sigma gives more control.\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — edges in noisy photo — auto-threshold by image median.\n# APPROACH  - Otsu-style: pick lo/hi from the image's median pixel value.\n# STRENGTHS - Adapts to bright vs dark images; no magic numbers.\n# WEAKNESSES- Single image; doesn't preserve fine textures.\nimport cv2\nimport numpy as np\n\n\ndef auto_canny(gray: np.ndarray, sigma: float = 0.33) -> np.ndarray:\n    \"\"\"Canny with thresholds derived from the image median.\"\"\"\n    v = np.median(gray)\n    lo = int(max(0,   (1.0 - sigma) * v))\n    hi = int(min(255, (1.0 + sigma) * v))\n    return cv2.Canny(gray, lo, hi)\n\n\nimg = cv2.imread('photo.jpg', cv2.IMREAD_GRAYSCALE)\nblur = cv2.GaussianBlur(img, (5, 5), 1.0)\nedges = auto_canny(blur)\n\ncv2.imwrite('edges.jpg', edges)\n\n# Why median-based? Bright images need higher thresholds, dark images lower.\n# sigma=0.33 is a popular default (Adrian Rosebrock's \"auto Canny\").\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — edges in noisy photo — production: bilateral filter\n#             to denoise without losing edges, auto-Canny, morphology to\n#             close gaps so contours close cleanly.\n# APPROACH  - bilateralFilter -> auto-Canny -> dilate -> close.\n# STRENGTHS - Edges stay sharp through smoothing; broken edges connect.\n# WEAKNESSES- bilateralFilter is ~10x slower than GaussianBlur.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\n\n\ndef auto_canny(gray: np.ndarray, sigma: float = 0.33) -> np.ndarray:\n    v = float(np.median(gray))\n    return cv2.Canny(gray,\n                     int(max(0,   (1 - sigma) * v)),\n                     int(min(255, (1 + sigma) * v)))\n\n\ndef edges_for_contours(img_bgr: np.ndarray) -> np.ndarray:\n    \"\"\"Edge map suitable for findContours - closed, single-pixel-wide.\"\"\"\n    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)\n\n    # bilateralFilter: smooth color but preserve sharp edges.\n    #   d = neighborhood diameter (5 fast, 9 slow-but-pretty)\n    #   sigmaColor / sigmaSpace - larger = more aggressive smoothing\n    smooth = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)\n\n    edges = auto_canny(smooth, sigma=0.33)\n\n    # Morphology to close 1-2 pixel gaps so contour finding doesn't leak.\n    kernel = np.ones((3, 3), np.uint8)\n    edges = cv2.dilate(edges, kernel, iterations=1)\n    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)\n\n    return edges\n\n\nimg = cv2.imread('photo.jpg')\nedges = edges_for_contours(img)\ncv2.imwrite('edges.jpg', edges)\n\n# Decision rule:\n#   General Gaussian noise           -> GaussianBlur(ksize=(5,5)).\n#   Salt-and-pepper noise            -> medianBlur(ksize=5).\n#   Need to keep edges sharp         -> bilateralFilter.\n#   Need fast denoise + edges        -> GaussianBlur(3,3) -> Canny.\n#   Going to findContours next       -> close edges with dilate+CLOSE.\n#   Need oriented gradients (HOG)    -> Sobel(dx=1,dy=0) and Sobel(dx=0,dy=1).\n#   Single threshold doesn't fit all -> auto_canny via image median.\n\n# Anti-pattern:\n#   cv2.Canny(img, 100, 100)           # lo == hi defeats hysteresis\n# Canny needs lo < hi (typically lo = 0.5*hi). Equal thresholds = single\n# threshold = noisy or missed edges depending on the image.\n"
                  }
        ],
        tips: [
                  "GaussianBlur kernel must be odd and positive; sigma=0 auto-derives from ksize.",
                  "medianBlur is the right answer for salt-and-pepper noise — Gaussian smears it.",
                  "bilateralFilter preserves edges but is ~10x slower than Gaussian.",
                  "Canny needs two thresholds (hysteresis); the lo:hi ratio of 1:2 or 1:3 is standard.",
                  "auto_canny via image median adapts to image brightness without retuning."
        ],
        mistake: "Calling Canny on a noisy unblurred image — every pixel of noise becomes an edge. Always blur first.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "cv2-morphology-thresholding",
        fn: "cv2.threshold / cv2.morphologyEx — binarize and clean masks",
        desc: "Threshold turns grayscale → binary. Morphology cleans the binary mask — open removes specks, close fills holes, erode/dilate shrink/grow shapes. Use Otsu for auto-threshold; use adaptive for uneven lighting.",
        category: "filters",
        subtitle: "cv2.threshold (THRESH_BINARY + THRESH_OTSU), adaptiveThreshold (uneven lighting), getStructuringElement (RECT/ELLIPSE/CROSS), morphologyEx (OPEN/CLOSE/GRADIENT/TOPHAT), kernel size effects",
        signature: "cv2.threshold(src, thresh, maxval, type) -> (T, dst); cv2.morphologyEx(src, op, kernel)",
        descLong: "Thresholding is the bridge from grayscale to binary masks. Otsu finds the optimal threshold automatically; adaptive thresholding handles uneven lighting (per-pixel local threshold). Morphology operates on a binary image with a structuring element (\"kernel\"). Open = erode then dilate (kills small white specks). Close = dilate then erode (fills small black holes). Three depths solve the SAME task — clean a thresholded license-plate image — at depths: fixed threshold + open → Otsu + open + close → adaptive threshold + size-filtered components.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Threshold a license plate photo and clean speckle.\n# APPROACH  - Fixed threshold + MORPH_OPEN to kill specks.\n# STRENGTHS - Fast and direct.\n# WEAKNESSES- Fixed threshold breaks under different lighting.\nimport cv2\nimport numpy as np\n\ngray = cv2.imread('plate.jpg', cv2.IMREAD_GRAYSCALE)\n\n# Fixed threshold: pixels >= 127 -> 255, else 0.\n_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)\n\n# OPEN = erode + dilate. Kills isolated white pixels.\nkernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))\nclean = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)\n\ncv2.imwrite('plate_clean.png', clean)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — clean license plate — Otsu auto-threshold + close holes.\n# APPROACH  - Otsu picks threshold; open then close cleans both directions.\n# STRENGTHS - Adapts to image lighting; full mask cleanup.\n# WEAKNESSES- Otsu fails when foreground/background histograms overlap.\nimport cv2\nimport numpy as np\n\ngray = cv2.imread('plate.jpg', cv2.IMREAD_GRAYSCALE)\n\n# Otsu auto-picks the best global threshold. Use 0 as the threshold value.\nT, binary = cv2.threshold(gray, 0, 255,\n                          cv2.THRESH_BINARY + cv2.THRESH_OTSU)\nprint(f\"Otsu chose threshold = {T}\")\n\n# Morphology pipeline:\n#   OPEN  removes small white noise   (erode -> dilate)\n#   CLOSE fills small black holes      (dilate -> erode)\nkernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))\nclean = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)\nclean = cv2.morphologyEx(clean,  cv2.MORPH_CLOSE, kernel)\n\ncv2.imwrite('plate_clean.png', clean)\n\n# If text is dark on a bright plate, you may want THRESH_BINARY_INV\n# so the foreground (text) becomes white = 255.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — clean license plate — production: adaptive threshold\n#             for uneven lighting, area-filtered components, bounding boxes.\n# APPROACH  - adaptiveThreshold -> open -> connectedComponentsWithStats ->\n#             keep only character-shaped blobs.\n# STRENGTHS - Robust to glare/shadow; only character glyphs survive.\n# WEAKNESSES- More tuning knobs; adaptive params depend on image scale.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\n\n\ndef clean_plate(gray: np.ndarray, *,\n                min_area: int = 100,\n                max_area: int = 5_000,\n                aspect_min: float = 0.2,\n                aspect_max: float = 1.0) -> tuple[np.ndarray, list[tuple]]:\n    \"\"\"Clean a plate image and return (binary_mask, list_of_glyph_bboxes).\"\"\"\n\n    # Adaptive threshold: per-pixel threshold from a local window.\n    # Better than Otsu when lighting varies across the image.\n    binary = cv2.adaptiveThreshold(\n        gray,\n        maxValue=255,\n        adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,\n        thresholdType=cv2.THRESH_BINARY_INV,           # text becomes white\n        blockSize=21,                                  # must be odd\n        C=10,                                          # subtracted from mean\n    )\n\n    # Open to kill speckle.\n    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))\n    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)\n\n    # Connected components with stats - drop blobs by area + aspect.\n    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)\n\n    keep_mask = np.zeros_like(binary)\n    bboxes: list[tuple] = []\n    for i in range(1, n):                              # 0 is background\n        x, y, w, h, area = stats[i]\n        aspect = w / max(h, 1)\n        if min_area <= area <= max_area and aspect_min <= aspect <= aspect_max:\n            keep_mask[labels == i] = 255\n            bboxes.append((x, y, w, h))\n\n    return keep_mask, bboxes\n\n\ngray = cv2.imread('plate.jpg', cv2.IMREAD_GRAYSCALE)\nmask, glyphs = clean_plate(gray)\ncv2.imwrite('plate_clean.png', mask)\nprint(f\"found {len(glyphs)} glyph candidates\")\n\n# Decision rule:\n#   Even lighting + bimodal histogram   -> THRESH_BINARY + THRESH_OTSU.\n#   Uneven lighting (shadow, glare)     -> adaptiveThreshold (Gaussian C).\n#   Need multi-class (>2 levels)        -> Otsu by levels (Yen) or k-means.\n#   Remove small white noise            -> MORPH_OPEN.\n#   Fill small black holes              -> MORPH_CLOSE.\n#   Both                                 -> OPEN then CLOSE (this order matters).\n#   Skeleton / one-pixel-wide           -> ximgproc.thinning (contrib module).\n\n# Anti-pattern:\n#   kernel = np.ones((3, 3))           # float64 by default\n#   cv2.dilate(img, kernel)             # expects uint8 0/1 - works but\n# correct form is np.ones((3,3), np.uint8) or use getStructuringElement.\n"
                  }
        ],
        tips: [
                  "Otsu auto-thresholds — pass 0 as the manual threshold and OR `THRESH_OTSU` into the type.",
                  "adaptiveThreshold has `blockSize` (odd, controls locality) and `C` (offset from mean) — both need tuning.",
                  "OPEN before CLOSE if you want to denoise then fill; the order matters.",
                  "`connectedComponentsWithStats` is the fast way to filter blobs by area / bbox — don't loop contours.",
                  "MORPH_TOPHAT extracts bright details smaller than the kernel; MORPH_BLACKHAT does the opposite."
        ],
        mistake: "Using a fixed threshold across an image with uneven lighting. Use `adaptiveThreshold` instead — it computes a local threshold per pixel.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 4: Template, feature, and contour detection ─────────────────────────────────────────
  {
    id: "detection",
    title: "Template, feature, and contour detection",
    entries: [
      {
        id: "cv2-template-matching",
        fn: "cv2.matchTemplate — find a known image inside another",
        desc: "Slide a template across an image and report the best match location. Fast and simple, but not invariant to scale or rotation. Use TM_CCOEFF_NORMED, threshold the result, run NMS to drop overlapping detections.",
        category: "detection",
        subtitle: "matchTemplate (TM_CCOEFF_NORMED), minMaxLoc, multi-match thresholding (np.where), non-max suppression, scale invariance via image pyramids",
        signature: "cv2.matchTemplate(image, templ, method) -> result; cv2.minMaxLoc(result)",
        descLong: "Template matching computes a similarity score at every position of the template within the image. TM_CCOEFF_NORMED is the right method (normalized correlation, range -1 to +1). For a single best match, `minMaxLoc` finds the peak; for multiple, threshold the score map and apply non-max suppression. Three depths solve the SAME task — find every appearance of an icon — at depths: single best with minMaxLoc → all above threshold (no NMS, gets duplicates) → thresholded + NMS + multi-scale via image pyramid for robustness.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Find a single best match of an icon inside a screenshot.\n# APPROACH  - matchTemplate + minMaxLoc.\n# STRENGTHS - One match, three lines.\n# WEAKNESSES- Only finds ONE; no scale invariance.\nimport cv2\n\nscreen = cv2.imread('screen.png',  cv2.IMREAD_GRAYSCALE)\nicon   = cv2.imread('icon.png',    cv2.IMREAD_GRAYSCALE)\nh, w = icon.shape\n\nresult = cv2.matchTemplate(screen, icon, cv2.TM_CCOEFF_NORMED)\n_, max_val, _, max_loc = cv2.minMaxLoc(result)        # max for CCOEFF_NORMED\n\nprint(f\"best match: score={max_val:.2f} at {max_loc}\")\nx, y = max_loc\ncv2.rectangle(screen, (x, y), (x + w, y + h), 255, 2)\ncv2.imwrite('found.png', screen)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — find every appearance of an icon — multi-match.\n# APPROACH  - matchTemplate -> threshold the score map -> np.where for coords.\n# STRENGTHS - Finds all instances above similarity threshold.\n# WEAKNESSES- Adjacent matches show up as clusters of duplicates (no NMS).\nimport cv2\nimport numpy as np\n\nscreen = cv2.imread('screen.png', cv2.IMREAD_GRAYSCALE)\nicon   = cv2.imread('icon.png',   cv2.IMREAD_GRAYSCALE)\nh, w = icon.shape\n\nresult = cv2.matchTemplate(screen, icon, cv2.TM_CCOEFF_NORMED)\n\nTHRESH = 0.85\nys, xs = np.where(result >= THRESH)\npoints = list(zip(xs, ys))                            # (x, y) pairs\nprint(f\"found {len(points)} candidate matches above {THRESH}\")\n\n# Note: matches near each other are duplicates of the same instance.\n# A 50x50 icon with no NMS will produce ~10 hits per real instance.\nout = cv2.cvtColor(screen, cv2.COLOR_GRAY2BGR)\nfor x, y in points:\n    cv2.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 1)\ncv2.imwrite('found.png', out)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — find every instance of an icon — production:\n#             multi-scale (image pyramid) + non-max suppression + score-ranked.\n# APPROACH  - For each scale, matchTemplate; collect (x,y,w,h,score); NMS.\n# STRENGTHS - Robust to mild scale changes; one rectangle per real instance.\n# WEAKNESSES- Slower (one matchTemplate per scale); no rotation invariance.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\n\n\ndef nms(boxes: np.ndarray, scores: np.ndarray, iou_thresh: float = 0.4) -> list[int]:\n    \"\"\"Greedy NMS on (N,4) xywh boxes. Returns kept indices.\"\"\"\n    x1, y1 = boxes[:, 0], boxes[:, 1]\n    x2, y2 = x1 + boxes[:, 2], y1 + boxes[:, 3]\n    areas = boxes[:, 2] * boxes[:, 3]\n\n    order = scores.argsort()[::-1]                    # high score first\n    keep = []\n    while order.size:\n        i = order[0]; keep.append(i)\n        xx1 = np.maximum(x1[i], x1[order[1:]]); yy1 = np.maximum(y1[i], y1[order[1:]])\n        xx2 = np.minimum(x2[i], x2[order[1:]]); yy2 = np.minimum(y2[i], y2[order[1:]])\n        inter = np.maximum(0, xx2 - xx1) * np.maximum(0, yy2 - yy1)\n        iou = inter / (areas[i] + areas[order[1:]] - inter)\n        order = order[1:][iou < iou_thresh]\n    return keep\n\n\ndef find_template_multiscale(\n    screen: np.ndarray, template: np.ndarray, *,\n    scales: tuple[float, ...] = (0.75, 0.85, 1.0, 1.15, 1.3),\n    score_thresh: float = 0.85,\n    iou_thresh: float = 0.4,\n) -> list[tuple[int, int, int, int, float]]:\n    \"\"\"Return list of (x, y, w, h, score) after multi-scale NMS.\"\"\"\n    boxes, scores = [], []\n\n    for s in scales:\n        tw, th = max(1, int(template.shape[1] * s)), max(1, int(template.shape[0] * s))\n        if tw >= screen.shape[1] or th >= screen.shape[0]:\n            continue\n        templ = cv2.resize(template, (tw, th), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)\n        result = cv2.matchTemplate(screen, templ, cv2.TM_CCOEFF_NORMED)\n        ys, xs = np.where(result >= score_thresh)\n        for x, y in zip(xs, ys):\n            boxes.append((x, y, tw, th))\n            scores.append(float(result[y, x]))\n\n    if not boxes:\n        return []\n    boxes_arr = np.asarray(boxes, dtype=np.float32)\n    scores_arr = np.asarray(scores, dtype=np.float32)\n    keep = nms(boxes_arr, scores_arr, iou_thresh)\n    return [(*boxes[i], scores[i]) for i in keep]\n\n\nscreen = cv2.imread('screen.png', cv2.IMREAD_GRAYSCALE)\nicon   = cv2.imread('icon.png',   cv2.IMREAD_GRAYSCALE)\nhits = find_template_multiscale(screen, icon, score_thresh=0.85)\n\nout = cv2.cvtColor(screen, cv2.COLOR_GRAY2BGR)\nfor (x, y, w, h, s) in hits:\n    cv2.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 2)\n    cv2.putText(out, f\"{s:.2f}\", (x, y - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)\ncv2.imwrite('found.png', out)\n\n# Decision rule:\n#   Single instance, fixed scale, fixed orientation -> matchTemplate + minMaxLoc.\n#   Multiple instances, fixed scale                 -> threshold + NMS.\n#   Mild scale variance                             -> image pyramid + NMS.\n#   Rotation or large scale variance                -> feature-based (ORB/SIFT) or DNN.\n#   Real-world objects (cats, cars, faces)          -> use a pretrained DNN, not matchTemplate.\n\n# Anti-pattern:\n#   matchTemplate + minMaxLoc when multiple matches exist\n# Returns ONLY the global max - the other 9 instances are silently dropped.\n# Always np.where + NMS for multi-instance cases.\n"
                  }
        ],
        tips: [
                  "TM_CCOEFF_NORMED is the right method — invariant to mean brightness, range [-1, +1].",
                  "For multi-match, threshold the result map and apply non-max suppression — minMaxLoc only returns the single best.",
                  "Template matching has zero scale or rotation invariance — use an image pyramid for ±20% scale tolerance.",
                  "For rotation, real scale variance, or texture variation, switch to feature matching (ORB/SIFT) or a DNN detector.",
                  "Score thresholds are scene-dependent — start at 0.85, tune from there."
        ],
        mistake: "Using `minMaxLoc` when there are multiple instances — it returns only the single best, silently dropping the rest.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "cv2-feature-orb",
        fn: "cv2.ORB / cv2.BFMatcher — keypoint matching for scenes",
        desc: "ORB detects rotation-invariant keypoints + binary descriptors. BFMatcher with Hamming distance + Lowe's ratio test gives reliable correspondences. Use this when template matching is too rigid — different angles, partial occlusion, panorama stitching.",
        category: "detection",
        subtitle: "ORB.create(nfeatures=), detectAndCompute, BFMatcher(NORM_HAMMING, crossCheck=False), knnMatch + Lowe ratio (m.distance < 0.75 * n.distance), findHomography(RANSAC), perspectiveTransform for box mapping",
        signature: "orb = cv2.ORB_create(); kp, des = orb.detectAndCompute(gray, None); BFMatcher.knnMatch(des1, des2, k=2)",
        descLong: "ORB (Oriented FAST + Rotated BRIEF) is patent-free and fast. Pipeline: detect+describe both images → BFMatcher with Hamming distance → knnMatch k=2 → Lowe ratio test (keep matches where best is ≪ second-best) → findHomography(RANSAC) to get a robust geometric mapping. Three depths solve the SAME task — find a logo in a scene photo and outline it — at depths: brute-force matching with crossCheck → Lowe ratio test for quality → RANSAC homography to draw the outline of the matched object.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Find a logo in a scene photo and visualize the matches.\n# APPROACH  - ORB keypoints + BFMatcher with crossCheck.\n# STRENGTHS - Two-image matching with one matcher; ~30 lines.\n# WEAKNESSES- crossCheck alone leaves bad matches; no geometric verification.\nimport cv2\n\nlogo  = cv2.imread('logo.png',  cv2.IMREAD_GRAYSCALE)\nscene = cv2.imread('scene.jpg', cv2.IMREAD_GRAYSCALE)\n\norb = cv2.ORB_create(nfeatures=1000)\nkp1, des1 = orb.detectAndCompute(logo,  None)\nkp2, des2 = orb.detectAndCompute(scene, None)\n\n# Hamming distance for binary descriptors (ORB/BRISK).\nmatcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)\nmatches = matcher.match(des1, des2)\nmatches = sorted(matches, key=lambda m: m.distance)[:30]\n\nvis = cv2.drawMatches(logo, kp1, scene, kp2, matches, None,\n                      flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\ncv2.imwrite('matches.jpg', vis)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — match logo in scene — Lowe ratio test for quality.\n# APPROACH  - knnMatch k=2; keep m where m.distance < 0.75 * n.distance.\n# STRENGTHS - Filters out ambiguous matches; cleaner correspondences.\n# WEAKNESSES- Doesn't verify geometric consistency.\nimport cv2\n\nlogo  = cv2.imread('logo.png',  cv2.IMREAD_GRAYSCALE)\nscene = cv2.imread('scene.jpg', cv2.IMREAD_GRAYSCALE)\n\norb = cv2.ORB_create(nfeatures=2000, scaleFactor=1.2)\nkp1, des1 = orb.detectAndCompute(logo,  None)\nkp2, des2 = orb.detectAndCompute(scene, None)\n\n# crossCheck=False because we'll do Lowe's ratio test instead.\nmatcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)\nknn = matcher.knnMatch(des1, des2, k=2)\n\n# Lowe's ratio test: keep matches where the best is much better than 2nd-best.\ngood = [m for m, n in knn if m.distance < 0.75 * n.distance]\nprint(f\"{len(good)} good matches out of {len(knn)} candidates\")\n\nvis = cv2.drawMatches(logo, kp1, scene, kp2, good, None,\n                      flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\ncv2.imwrite('matches.jpg', vis)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — match logo in scene — production: ratio test + RANSAC\n#             homography + draw the outline of the logo onto the scene.\n# APPROACH  - Lowe ratio -> findHomography(RANSAC) -> perspectiveTransform\n#             on the logo's corner box.\n# STRENGTHS - Robust to outliers; outputs the warped logo region.\n# WEAKNESSES- Needs >= 4 inlier correspondences after RANSAC.\nfrom __future__ import annotations\nimport cv2\nimport numpy as np\n\n\ndef find_object(\n    template: np.ndarray, scene: np.ndarray, *,\n    nfeatures: int = 2000,\n    ratio: float = 0.75,\n    min_inliers: int = 10,\n) -> tuple[np.ndarray | None, int]:\n    \"\"\"Return (4x2 corner array of template in scene, num_inliers) or (None, 0).\"\"\"\n    orb = cv2.ORB_create(nfeatures=nfeatures, scaleFactor=1.2)\n    kp1, des1 = orb.detectAndCompute(template, None)\n    kp2, des2 = orb.detectAndCompute(scene,    None)\n    if des1 is None or des2 is None:\n        return None, 0\n\n    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)\n    knn = bf.knnMatch(des1, des2, k=2)\n    good = [m for m, n in knn if m.distance < ratio * n.distance]\n    if len(good) < min_inliers:\n        return None, 0\n\n    src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)\n    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)\n\n    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)\n    if H is None:\n        return None, 0\n    inliers = int(mask.sum())\n    if inliers < min_inliers:\n        return None, inliers\n\n    h, w = template.shape[:2]\n    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)\n    warped = cv2.perspectiveTransform(corners, H).reshape(-1, 2)\n    return warped, inliers\n\n\nlogo  = cv2.imread('logo.png',  cv2.IMREAD_GRAYSCALE)\nscene = cv2.imread('scene.jpg', cv2.IMREAD_GRAYSCALE)\n\nbox, n = find_object(logo, scene)\nout = cv2.cvtColor(scene, cv2.COLOR_GRAY2BGR)\nif box is not None:\n    cv2.polylines(out, [np.int32(box)], True, (0, 255, 0), 3)\n    cv2.putText(out, f\"inliers={n}\", (10, 30),\n                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)\ncv2.imwrite('found.jpg', out)\n\n# Decision rule:\n#   Same scene, no rotation, fixed scale          -> matchTemplate.\n#   Different angles, mild occlusion              -> ORB + ratio test.\n#   Need geometric outline of the matched object  -> add findHomography(RANSAC).\n#   Stitch panoramas                              -> SIFT (now patent-free) or AKAZE.\n#   Real-time on a Raspberry Pi                   -> ORB (binary descriptors are fast).\n#   Detect categories not specific instances      -> use a DNN, not features.\n\n# Anti-pattern:\n#   crossCheck=True AND knnMatch              # mutually exclusive\n# crossCheck only makes sense for .match() (1-NN). With knnMatch you do\n# the ratio test instead. Pick one or the other - never both.\n"
                  }
        ],
        tips: [
                  "ORB descriptors are binary — match with `NORM_HAMMING`, not `NORM_L2`.",
                  "Lowe's ratio test (0.7-0.8) filters ambiguous matches. Without it, half the matches are noise.",
                  "crossCheck=True works with `.match()` (one-NN). Use crossCheck=False with `knnMatch` + ratio test.",
                  "After ratio filtering, run `findHomography(RANSAC)` — it discards geometric outliers.",
                  "For panorama stitching, SIFT (patent-free since 2020) or AKAZE generally beat ORB."
        ],
        mistake: "Skipping the ratio test or RANSAC. Raw ORB matches contain ~50% noise; without filtering, the homography is garbage.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 5: Video I/O ─────────────────────────────────────────
  {
    id: "video",
    title: "Video I/O",
    entries: [
      {
        id: "cv2-videocapture",
        fn: "cv2.VideoCapture / cv2.VideoWriter — read and write video",
        desc: "VideoCapture iterates frames from a file or webcam. VideoWriter encodes frames to disk — pick the right FOURCC for the platform (`mp4v`, `avc1`, `XVID`). Always `release()` and check `cap.isOpened()`.",
        category: "video",
        subtitle: "cv2.VideoCapture (file or 0 for webcam), CAP_PROP_FPS / FRAME_COUNT / FRAME_WIDTH / HEIGHT, cv2.VideoWriter (FOURCC: mp4v / avc1 / XVID), context-manager wrapper, frame-skip via CAP_PROP_POS_FRAMES",
        signature: "cap = cv2.VideoCapture(src); ok, frame = cap.read(); writer = cv2.VideoWriter(path, fourcc, fps, (w,h))",
        descLong: "VideoCapture handles files, RTSP streams, and webcams (`0` is the default camera). Iterate with `while True: ok, frame = cap.read()` until `ok` is False. VideoWriter needs a four-character codec hint and the EXACT frame size — frames of any other size are silently dropped. Three depths solve the SAME task — read a video, run grayscale on each frame, save as a new video — at depths: minimal loop with hardcoded codec → property-based output sizing + progress → context-manager wrapper, codec fallback chain, async-frame-drop counter.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Read a video, grayscale every frame, save as a new video.\n# APPROACH  - VideoCapture loop + VideoWriter.\n# STRENGTHS - Fewest lines.\n# WEAKNESSES- Hardcoded size; no error checks; no release on exception.\nimport cv2\n\ncap = cv2.VideoCapture('input.mp4')\n\nfourcc = cv2.VideoWriter_fourcc(*'mp4v')              # codec hint\nout = cv2.VideoWriter('output.mp4', fourcc, fps=30, frameSize=(1280, 720),\n                      isColor=False)                  # grayscale output\n\nwhile True:\n    ok, frame = cap.read()\n    if not ok:\n        break\n    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n    out.write(gray)\n\ncap.release()\nout.release()\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — read video, grayscale, save — derive size + fps from input.\n# APPROACH  - Read CAP_PROP_* properties so output matches input.\n# STRENGTHS - Output dimensions stay correct for any input.\n# WEAKNESSES- Still no codec fallback; no progress reporting.\nimport cv2\n\ncap = cv2.VideoCapture('input.mp4')\nif not cap.isOpened():\n    raise RuntimeError(\"could not open input.mp4\")\n\nfps    = cap.get(cv2.CAP_PROP_FPS)                    # frames per second\nW      = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))\nH      = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))\nn_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))\n\nout = cv2.VideoWriter(\n    'output.mp4',\n    cv2.VideoWriter_fourcc(*'mp4v'),\n    fps,\n    (W, H),\n    isColor=False,\n)\n\ni = 0\nwhile True:\n    ok, frame = cap.read()\n    if not ok:\n        break\n    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n    out.write(gray)\n    i += 1\n    if i % 100 == 0:\n        print(f\"  {i}/{n_frames} frames\")\n\ncap.release()\nout.release()\nprint(f\"wrote {i} frames @ {fps:.1f} fps\")\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — read video, grayscale, save — production: context-manager\n#             wrapper, codec fallback, dropped-frame counter, mid-loop seek.\n# APPROACH  - Class with __enter__/__exit__; try codecs in order; track drops.\n# STRENGTHS - Always releases; survives codec mismatch; observable.\n# WEAKNESSES- More code; codec fallback adds startup time.\nfrom __future__ import annotations\nimport cv2\nfrom contextlib import contextmanager\nfrom pathlib import Path\n\n\n@contextmanager\ndef video_reader(src: str | int):\n    cap = cv2.VideoCapture(src)\n    if not cap.isOpened():\n        raise RuntimeError(f\"VideoCapture failed for {src!r}\")\n    try:\n        yield cap\n    finally:\n        cap.release()\n\n\ndef open_writer(path: Path, fps: float, size: tuple[int, int],\n                color: bool = True) -> cv2.VideoWriter:\n    \"\"\"Try preferred codecs in order; fall back if writer fails to open.\"\"\"\n    for fourcc_str in ('avc1', 'mp4v', 'XVID', 'MJPG'):\n        fourcc = cv2.VideoWriter_fourcc(*fourcc_str)\n        w = cv2.VideoWriter(str(path), fourcc, fps, size, isColor=color)\n        if w.isOpened():\n            print(f\"using codec {fourcc_str}\")\n            return w\n        w.release()\n    raise RuntimeError(f\"no codec produced an opened writer for {path}\")\n\n\ndef grayscale_video(src: Path, dst: Path) -> dict:\n    with video_reader(str(src)) as cap:\n        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0\n        W   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))\n        H   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))\n\n        writer = open_writer(dst, fps, (W, H), color=False)\n        try:\n            read = written = dropped = 0\n            while True:\n                ok, frame = cap.read()\n                if not ok:\n                    break\n                read += 1\n                if frame.shape[1] != W or frame.shape[0] != H:\n                    dropped += 1                       # size mismatch -> writer would silently drop\n                    continue\n                writer.write(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY))\n                written += 1\n        finally:\n            writer.release()\n\n    return {\"read\": read, \"written\": written, \"dropped\": dropped, \"fps\": fps}\n\n\nstats = grayscale_video(Path('input.mp4'), Path('output.mp4'))\nprint(stats)\n\n# Decision rule:\n#   Local mp4 file               -> mp4v or avc1 (avc1 = H.264, smaller files).\n#   Cross-platform compatibility -> mp4v inside .mp4.\n#   Open-source codec only       -> XVID inside .avi.\n#   Lossless / debugging         -> MJPG (large but every frame is a JPEG).\n#   Webcam capture               -> VideoCapture(0); set CAP_PROP_FRAME_WIDTH/HEIGHT BEFORE first read.\n#   RTSP / IP camera             -> VideoCapture('rtsp://...'); add CAP_FFMPEG backend.\n#   Need frame-accurate seeking  -> use CAP_PROP_POS_FRAMES; some codecs only seek to keyframes.\n\n# Anti-pattern:\n#   writer = cv2.VideoWriter(...)   # never check isOpened()\n# If FOURCC is unsupported (no codec installed), the writer silently\n# returns False to .write() forever. Always check writer.isOpened() and\n# fall back to another codec if False.\n"
                  }
        ],
        tips: [
                  "`cv2.VideoCapture(0)` opens the default webcam; `1` is the second camera, etc.",
                  "Always check `cap.isOpened()` and `writer.isOpened()` — both fail silently otherwise.",
                  "Frame size in `VideoWriter` must EXACTLY match the frame you write — mismatched frames are silently dropped.",
                  "`CAP_PROP_POS_FRAMES` lets you seek by frame index; some codecs round to the nearest keyframe.",
                  "`mp4v` works everywhere but produces larger files than `avc1` (H.264). Try `avc1` first, fall back to `mp4v`."
        ],
        mistake: "Forgetting `cap.release()` / `writer.release()` — leaves OS handles open and on Windows the file stays locked. Use a context-manager wrapper or `try/finally`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 6: DNN inference and DL bridges ─────────────────────────────────────────
  {
    id: "dl-integration",
    title: "DNN inference and DL bridges",
    entries: [
      {
        id: "cv2-dnn-onnx",
        fn: "cv2.dnn.readNetFromONNX — run a model without PyTorch/TF",
        desc: "cv2 ships a tiny inference engine that loads ONNX (and Caffe/TF) models. Useful when you want a pretrained detector but don't want PyTorch/TF as a dependency. Slower than ONNXRuntime, but zero extra installs.",
        category: "dl-integration",
        subtitle: "cv2.dnn.readNetFromONNX, cv2.dnn.blobFromImage (NCHW, mean subtraction, swapRB BGR->RGB), setInput, forward, output decoding (YOLO, classification, segmentation), DNN_BACKEND_OPENCV / DNN_TARGET_CPU/CUDA",
        signature: "net = cv2.dnn.readNetFromONNX(path); net.setInput(blob); out = net.forward()",
        descLong: "The cv2.dnn module is a stripped-down inference engine — no PyTorch, no ONNXRuntime, just opencv. Workflow: `blobFromImage` to convert HWC BGR uint8 → NCHW float32 (with mean subtraction and BGR→RGB toggle) → `setInput` → `forward()`. Three depths solve the SAME task — classify a single image with a pretrained ResNet50 — at depths: minimal load+forward → proper preprocessing (size, mean, std, swapRB) and softmax → switch backend to CUDA, batch images, decode top-k.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Classify a single image with ResNet50 (ONNX export).\n# APPROACH  - Load ONNX, blobFromImage, forward, argmax.\n# STRENGTHS - Demonstrates the full pipeline.\n# WEAKNESSES- Skips proper mean/std normalization; CPU only.\nimport cv2\nimport numpy as np\n\nnet = cv2.dnn.readNetFromONNX('resnet50.onnx')\nimg = cv2.imread('cat.jpg')\n\n# blobFromImage: HWC BGR uint8 -> NCHW float32; resize to 224x224.\nblob = cv2.dnn.blobFromImage(img, scalefactor=1/255.0, size=(224, 224), swapRB=True)\n\nnet.setInput(blob)\nout = net.forward()                                   # (1, 1000)\n\ncls = int(np.argmax(out))\nprint(f\"class index: {cls}\")\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — classify with ResNet50 — proper preprocessing.\n# APPROACH  - ImageNet mean/std; softmax over logits; top-5.\n# STRENGTHS - Matches torchvision preprocessing; meaningful confidences.\n# WEAKNESSES- Single image; CPU only; mean is per-channel via blobFromImage.\nimport cv2\nimport numpy as np\n\n\ndef softmax(x: np.ndarray) -> np.ndarray:\n    e = np.exp(x - x.max())\n    return e / e.sum()\n\n\nnet = cv2.dnn.readNetFromONNX('resnet50.onnx')\n\nimg = cv2.imread('cat.jpg')\n\n# ImageNet preprocessing (matching torchvision):\n#   mean = [0.485, 0.456, 0.406]  (RGB!)\n#   std  = [0.229, 0.224, 0.225]\n# blobFromImage subtracts mean and divides by 255*std (when scalefactor=1/255).\nmean_rgb = (0.485*255, 0.456*255, 0.406*255)          # in 0..255\n\nblob = cv2.dnn.blobFromImage(\n    img, scalefactor=1/255.0, size=(224, 224),\n    mean=mean_rgb, swapRB=True, crop=False,\n)\n# Note: blobFromImage doesn't divide by std - apply manually if you need it.\nstd_rgb = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 3, 1, 1)\nblob = blob / std_rgb\n\nnet.setInput(blob)\nlogits = net.forward()[0]                             # (1000,)\nprobs  = softmax(logits)\ntop5   = np.argsort(probs)[-5:][::-1]\n\nprint(\"top-5:\")\nfor idx in top5:\n    print(f\"  class {idx}: {probs[idx]:.3f}\")\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — classify with ResNet50 — production: batched inference,\n#             CUDA backend if available, label decoding, top-k.\n# APPROACH  - Detect CUDA, build batch blob, forward once, postprocess.\n# STRENGTHS - High throughput; one forward per N images; readable labels.\n# WEAKNESSES- cv2.dnn CUDA needs OpenCV built with CUDA (not the pip wheel).\nfrom __future__ import annotations\nimport cv2\nimport json\nimport numpy as np\nfrom pathlib import Path\n\n\ndef softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:\n    e = np.exp(x - x.max(axis=axis, keepdims=True))\n    return e / e.sum(axis=axis, keepdims=True)\n\n\ndef build_net(onnx_path: Path, *, prefer_cuda: bool = True) -> cv2.dnn_Net:\n    net = cv2.dnn.readNetFromONNX(str(onnx_path))\n    if prefer_cuda and cv2.cuda.getCudaEnabledDeviceCount() > 0:\n        net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)\n        net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA_FP16)\n    else:\n        net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)\n        net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)\n    return net\n\n\ndef classify(net: cv2.dnn_Net, images: list[np.ndarray], *,\n             input_size: int = 224, top_k: int = 5,\n             labels: list[str] | None = None) -> list[list[tuple[str | int, float]]]:\n    \"\"\"Return per-image list of (label_or_index, prob) pairs (top_k).\"\"\"\n    mean = (0.485*255, 0.456*255, 0.406*255)\n\n    blob = cv2.dnn.blobFromImages(\n        images, scalefactor=1/255.0, size=(input_size, input_size),\n        mean=mean, swapRB=True, crop=False,\n    )\n    std = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 3, 1, 1)\n    blob = blob / std\n\n    net.setInput(blob)\n    logits = net.forward()                            # (N, 1000)\n    probs  = softmax(logits, axis=1)\n\n    out = []\n    for row in probs:\n        idxs = np.argsort(row)[-top_k:][::-1]\n        out.append([\n            (labels[i] if labels else int(i), float(row[i]))\n            for i in idxs\n        ])\n    return out\n\n\n# Usage:\nlabels = json.loads(Path('imagenet_classes.json').read_text())\nnet = build_net(Path('resnet50.onnx'))\n\nimgs = [cv2.imread(p) for p in ['cat.jpg', 'dog.jpg', 'car.jpg']]\nresults = classify(net, imgs, labels=labels, top_k=3)\n\nfor path, top in zip(['cat.jpg', 'dog.jpg', 'car.jpg'], results):\n    print(path, top)\n\n# Decision rule:\n#   Want simple inference, no extra deps   -> cv2.dnn.readNetFromONNX.\n#   Want best CPU latency                  -> ONNXRuntime (onnxruntime).\n#   Want best GPU throughput               -> ONNXRuntime + CUDA EP, or TensorRT.\n#   Need training or finetuning            -> not cv2 - use PyTorch / TF.\n#   Need >1 image at a time                -> blobFromImages (plural) and batch.\n#   Need to mix with PyTorch tensors       -> stay in PyTorch; cv2 just reads frames.\n\n# Anti-pattern:\n#   blob = cv2.dnn.blobFromImage(img, swapRB=False)   # then feed to a model\n#                                                       # trained on RGB\n# Half of all \"model works in PyTorch but garbage with cv2\" bugs are\n# swapRB=False when the model expects RGB. Default torchvision = RGB,\n# default cv2 = BGR. Set swapRB=True almost always.\n"
                  }
        ],
        tips: [
                  "`blobFromImage` does the resize + mean subtract + BGR→RGB swap + HWC→NCHW in one call.",
                  "It does NOT divide by std — divide manually if your model expects normalized inputs.",
                  "cv2.dnn CUDA backend only works if OpenCV was compiled with CUDA — the pip wheels are CPU-only.",
                  "For best CPU latency, ONNXRuntime usually beats cv2.dnn by 2-5x.",
                  "cv2.dnn is great for drop-in inference inside an existing OpenCV pipeline (frame in, prediction out, no extra deps)."
        ],
        mistake: "Forgetting `swapRB=True` when the model was trained on RGB — colors are silently swapped, accuracy collapses.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 7: When to reach for cv2 ─────────────────────────────────────────
  {
    id: "practical",
    title: "When to reach for cv2",
    entries: [
      {
        id: "cv2-vs-pil-vs-torchvision",
        fn: "cv2 vs PIL vs torchvision — pick the right tool",
        desc: "cv2 = computer vision algorithms; PIL = image I/O + simple edits; torchvision = ML preprocessing. Mixing them is fine — just convert between BGR↔RGB at the boundary. Pick by what you're doing, not by habit.",
        category: "patterns",
        subtitle: "cv2 (algorithms: filters, transforms, detection, video) vs PIL (load/save/resize/EXIF) vs torchvision.transforms / kornia (ML augmentation), conversion glue (cv2.cvtColor, np.array(pil_img), Image.fromarray)",
        signature: "# cv2 reads BGR; PIL reads RGB; torchvision expects RGB tensor (C,H,W) float32 / 255",
        descLong: "cv2 is the C++ workhorse — fast filters, transforms, detection, video, calibration. PIL/Pillow is the friendliest for \"load this PNG, paste a watermark, save\". torchvision/kornia is purpose-built for ML augmentation pipelines. The libraries interop well — the only friction is BGR vs RGB. Three depths solve the SAME task — load 100 images, resize and augment for training a CNN — at depths: pure cv2 (BGR pitfalls everywhere) → cv2 for I/O + torchvision for transforms (correct boundary conversion) → cv2.cuda or kornia GPU pipelines for high-throughput training.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Load 100 images, resize to 224, return as a (N, 3, 224, 224)\n#             float tensor for CNN training.\n# APPROACH  - Pure cv2.\n# STRENGTHS - One library; fast disk I/O.\n# WEAKNESSES- BGR ordering must be remembered; manual normalization;\n#             no augmentation primitives.\nimport cv2\nimport numpy as np\nfrom pathlib import Path\n\npaths = sorted(Path('train/').glob('*.jpg'))[:100]\n\nbatch = []\nfor p in paths:\n    img = cv2.imread(str(p))                          # BGR uint8 (H, W, 3)\n    img = cv2.resize(img, (224, 224))\n    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)        # match RGB convention\n    img = img.astype(np.float32) / 255.0\n    img = img.transpose(2, 0, 1)                       # HWC -> CHW\n    batch.append(img)\n\ntensor = np.stack(batch)                              # (100, 3, 224, 224)\nprint(tensor.shape, tensor.dtype, tensor.min(), tensor.max())\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — 100 images for CNN training — proper Dataset with\n#             cv2 for I/O and torchvision.transforms for augmentation.\n# APPROACH  - cv2.imread (fast) -> RGB -> torchvision pipeline.\n# STRENGTHS - Right tool per stage; standard PyTorch idioms.\n# WEAKNESSES- Two libraries to coordinate; PIL conversion in middle.\nimport cv2\nimport torch\nfrom PIL import Image\nfrom pathlib import Path\nfrom torch.utils.data import Dataset, DataLoader\nfrom torchvision import transforms\n\n\nclass FastImageDataset(Dataset):\n    \"\"\"cv2 reads from disk; transforms run on PIL/tensor.\"\"\"\n    def __init__(self, paths: list[Path], train: bool = True):\n        self.paths = paths\n        self.tx = transforms.Compose([\n            transforms.Resize(256),\n            transforms.RandomCrop(224) if train else transforms.CenterCrop(224),\n            transforms.RandomHorizontalFlip() if train else transforms.Lambda(lambda x: x),\n            transforms.ToTensor(),                    # PIL -> (C,H,W) float [0,1]\n            transforms.Normalize(mean=[0.485, 0.456, 0.406],\n                                 std =[0.229, 0.224, 0.225]),\n        ])\n\n    def __len__(self): return len(self.paths)\n\n    def __getitem__(self, i):\n        # cv2 imread is ~2x faster than PIL.Image.open(file).convert('RGB')\n        bgr = cv2.imread(str(self.paths[i]))\n        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)\n        # Bridge to PIL so torchvision transforms work.\n        return self.tx(Image.fromarray(rgb))\n\n\npaths = sorted(Path('train/').glob('*.jpg'))[:100]\nds = FastImageDataset(paths, train=True)\nloader = DataLoader(ds, batch_size=32, num_workers=4)\nfor batch in loader:\n    print(batch.shape)                                # torch.Size([32, 3, 224, 224])\n    break\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — 100 images for CNN training — production: kornia\n#             GPU augmentation, no PIL detour, batched on the GPU.\n# APPROACH  - cv2 for I/O -> tensor on GPU -> kornia transforms.\n# STRENGTHS - GPU-resident augmentation; no per-sample CPU overhead;\n#             batched ops (much faster for large batches).\n# WEAKNESSES- Need kornia + a GPU; transforms are tensor-only (no PIL fallback).\nfrom __future__ import annotations\nimport cv2\nimport torch\nimport kornia.augmentation as K\nfrom pathlib import Path\nfrom torch.utils.data import Dataset, DataLoader\n\n\nclass CV2RawDataset(Dataset):\n    \"\"\"Returns raw uint8 RGB tensors; augmentation happens later on GPU.\"\"\"\n    def __init__(self, paths: list[Path]):\n        self.paths = paths\n\n    def __len__(self): return len(self.paths)\n\n    def __getitem__(self, i):\n        bgr = cv2.imread(str(self.paths[i]))\n        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)    # (H,W,3) uint8\n        rgb = cv2.resize(rgb, (256, 256))\n        return torch.from_numpy(rgb).permute(2, 0, 1) # (3,256,256) uint8\n\n\nclass GPUTransform(torch.nn.Module):\n    \"\"\"Run on the GPU after collation - one batched op, no Python loop.\"\"\"\n    def __init__(self):\n        super().__init__()\n        self.tx = torch.nn.Sequential(\n            K.RandomCrop((224, 224)),\n            K.RandomHorizontalFlip(p=0.5),\n            K.ColorJitter(0.2, 0.2, 0.2, 0.1, p=0.8),\n            K.Normalize(mean=torch.tensor([0.485, 0.456, 0.406]),\n                        std =torch.tensor([0.229, 0.224, 0.225])),\n        )\n\n    @torch.no_grad()\n    def forward(self, batch_uint8):                   # (B,3,H,W) uint8\n        return self.tx(batch_uint8.float() / 255.0)\n\n\npaths = sorted(Path('train/').glob('*.jpg'))[:100]\nds = CV2RawDataset(paths)\nloader = DataLoader(ds, batch_size=32, num_workers=4, pin_memory=True)\n\ndevice = 'cuda' if torch.cuda.is_available() else 'cpu'\ngpu_tx = GPUTransform().to(device)\n\nfor batch in loader:\n    batch = batch.to(device, non_blocking=True)       # (32, 3, 256, 256) uint8\n    augmented = gpu_tx(batch)                         # (32, 3, 224, 224) float32\n    # ... feed to model.forward(augmented)\n    print(augmented.shape, augmented.dtype)\n    break\n\n# Decision rule:\n#   Image I/O + simple ops (paste, watermark, web)   -> Pillow.\n#   Filters, transforms, detection, video            -> cv2 (BGR-aware).\n#   Train CNN, augmentation pipeline (CPU)           -> torchvision.transforms.\n#   Train CNN, augmentation pipeline (GPU, batched)  -> kornia.augmentation.\n#   Need numpy interop                               -> cv2 / numpy / Pillow all interop;\n#                                                       just remember BGR <-> RGB.\n#   Reading EXIF / metadata                          -> Pillow (cv2 strips most EXIF).\n#   Camera calibration / homography / SLAM           -> cv2 only.\n\n# Anti-pattern:\n#   img = cv2.imread(p)\n#   loss = model(transforms.ToTensor()(img))   # ToTensor expects PIL or HWC RGB\n# cv2.imread gives BGR HWC uint8. ToTensor expects RGB. Either:\n#   transforms.ToTensor()(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))\n# or skip torchvision entirely and just normalize the array yourself.\n"
                  }
        ],
        tips: [
                  "cv2.imread is ~2x faster than `PIL.Image.open(p).convert('RGB')` — use cv2 for the file load even in PIL/torchvision pipelines.",
                  "Convert at the boundary: `cv2.cvtColor(img, COLOR_BGR2RGB)` or `Image.fromarray(rgb_array)`.",
                  "PIL keeps EXIF metadata; cv2 strips it. Use PIL when EXIF orientation matters.",
                  "kornia gives GPU-batched augmentation — much faster than per-sample CPU torchvision when batches are large.",
                  "For pure ML preprocessing, prefer torchvision/kornia idioms; reach into cv2 for camera-vision algorithms (homography, SLAM, calibration)."
        ],
        mistake: "Mixing cv2 (BGR) with torchvision/PIL (RGB) without converting — colors silently swap and a CNN trained on RGB drops 5-15% accuracy.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
