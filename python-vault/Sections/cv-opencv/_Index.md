---
type: "file-index"
domain: "python"
file: "cv-opencv"
title: "OpenCV (cv2)"
tags:
  - "python"
  - "python/cv-opencv"
  - "index"
---

# OpenCV (cv2)

> 12 entries across 7 sections.

## I/O, color spaces, pixel access · 3

- [[Sections/cv-opencv/basics/cv2-imread-imwrite|cv2.imread / cv2.imwrite — load and save images]] — Read an image from disk into a NumPy array, save it back. cv2 reads as **BGR**, height×width×3, dtype `uint8`. Returns `None` on failure (no exception) — always check.
- [[Sections/cv-opencv/basics/cv2-color-spaces|cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB)]] — Convert between BGR (cv2 default), RGB (everyone else), HSV (color filtering), LAB (perceptual color), and grayscale. Always know the input space — half of all cv2 bugs come from forgetting that imread is BGR.
- [[Sections/cv-opencv/basics/cv2-pixel-access-roi|Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2]]] — cv2 images are NumPy arrays — index with `[y, x]` (row, col), slice ROIs with `[y1:y2, x1:x2]`. Slices are **views**, not copies — modifying the ROI mutates the source. Use `.copy()` if you need an independent buffer.

## Geometric transforms — resize, rotate, warp · 2

- [[Sections/cv-opencv/transforms/cv2-resize-rotation|cv2.resize / cv2.warpAffine — resize and rotate]] — Resize with `cv2.resize(img, (w, h), interpolation=...)` — note `(w, h)` order. Rotate with `getRotationMatrix2D` + `warpAffine`. Pick the right interpolation: AREA for downscale, CUBIC/LANCZOS4 for upscale.
- [[Sections/cv-opencv/transforms/cv2-perspective-warp|cv2.getPerspectiveTransform / warpPerspective — deskew documents]] — Compute a 3x3 homography from 4 source points to 4 destination points. Used for document deskewing, license plate rectification, AR markers — anywhere you have a quadrilateral that should become a rectangle.

## Blur, edges, morphology, thresholding · 2

- [[Sections/cv-opencv/filters/cv2-blur-edges|cv2.GaussianBlur / cv2.Canny — smoothing and edge detection]] — GaussianBlur smooths noise (kernel must be odd, sigma controls strength). Canny finds edges from a blurred image — the workhorse pipeline is `Gaussian → Canny → contours`. Tune Canny's two hysteresis thresholds, not just one.
- [[Sections/cv-opencv/filters/cv2-morphology-thresholding|cv2.threshold / cv2.morphologyEx — binarize and clean masks]] — Threshold turns grayscale → binary. Morphology cleans the binary mask — open removes specks, close fills holes, erode/dilate shrink/grow shapes. Use Otsu for auto-threshold; use adaptive for uneven lighting.

## Template, feature, and contour detection · 2

- [[Sections/cv-opencv/detection/cv2-template-matching|cv2.matchTemplate — find a known image inside another]] — Slide a template across an image and report the best match location. Fast and simple, but not invariant to scale or rotation. Use TM_CCOEFF_NORMED, threshold the result, run NMS to drop overlapping detections.
- [[Sections/cv-opencv/detection/cv2-feature-orb|cv2.ORB / cv2.BFMatcher — keypoint matching for scenes]] — ORB detects rotation-invariant keypoints + binary descriptors. BFMatcher with Hamming distance + Lowe's ratio test gives reliable correspondences. Use this when template matching is too rigid — different angles, partial occlusion, panorama stitching.

## Video I/O · 1

- [[Sections/cv-opencv/video/cv2-videocapture|cv2.VideoCapture / cv2.VideoWriter — read and write video]] — VideoCapture iterates frames from a file or webcam. VideoWriter encodes frames to disk — pick the right FOURCC for the platform (`mp4v`, `avc1`, `XVID`). Always `release()` and check `cap.isOpened()`.

## DNN inference and DL bridges · 1

- [[Sections/cv-opencv/dl-integration/cv2-dnn-onnx|cv2.dnn.readNetFromONNX — run a model without PyTorch/TF]] — cv2 ships a tiny inference engine that loads ONNX (and Caffe/TF) models. Useful when you want a pretrained detector but don't want PyTorch/TF as a dependency. Slower than ONNXRuntime, but zero extra installs.

## When to reach for cv2 · 1

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool]] — cv2 = computer vision algorithms; PIL = image I/O + simple edits; torchvision = ML preprocessing. Mixing them is fine — just convert between BGR↔RGB at the boundary. Pick by what you're doing, not by habit.
