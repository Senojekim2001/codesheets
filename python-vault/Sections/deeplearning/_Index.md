---
type: "file-index"
domain: "python"
file: "deeplearning"
title: "Deep Learning"
tags:
  - "python"
  - "python/deeplearning"
  - "index"
---

# Deep Learning

> 31 entries across 5 sections.

## Tensors & Autograd · 7

- [[Sections/deeplearning/tensors-autograd/tensor-creation|torch.tensor]] — Create a tensor from data.
- [[Sections/deeplearning/tensors-autograd/tensor-operations|Tensor Operations]] — Element-wise and matrix operations.
- [[Sections/deeplearning/tensors-autograd/tensor-reshaping|Reshape & View]] — Change tensor shape without copying.
- [[Sections/deeplearning/tensors-autograd/autograd-backward|Autograd & backward()]] — Automatic gradient computation.
- [[Sections/deeplearning/tensors-autograd/gradient-zeroing|zero_grad()]] — Clear accumulated gradients.
- [[Sections/deeplearning/tensors-autograd/gpu-device|.to(device)]] — Move tensors to device.
- [[Sections/deeplearning/tensors-autograd/no-grad-context|torch.no_grad()]] — Disable gradient tracking.

## Building Networks · 6

- [[Sections/deeplearning/building-networks/nn-module|nn.Module]] — Base class for all neural networks.
- [[Sections/deeplearning/building-networks/nn-linear|nn.Linear]] — Fully connected layer.
- [[Sections/deeplearning/building-networks/nn-sequential|nn.Sequential]] — Stack layers sequentially.
- [[Sections/deeplearning/building-networks/activation-functions|Activation Functions]] — Non-linearities: ReLU, Sigmoid, Tanh.
- [[Sections/deeplearning/building-networks/nn-conv2d|nn.Conv2d]] — 2D convolutional layer.
- [[Sections/deeplearning/building-networks/nn-lstm|nn.LSTM]] — Long Short-Term Memory layer.

## Training Loop · 6

- [[Sections/deeplearning/training-loop/loss-functions|Loss Functions]] — CrossEntropyLoss, MSELoss, others.
- [[Sections/deeplearning/training-loop/optimizers|Optimizers (SGD, Adam)]] — Update model parameters.
- [[Sections/deeplearning/training-loop/dataloader|DataLoader]] — Batch data efficiently.
- [[Sections/deeplearning/training-loop/training-loop-pattern|Training Loop Pattern]] — Standard epoch-based training.
- [[Sections/deeplearning/training-loop/model-train-eval|model.train() vs model.eval()]] — Toggle training and evaluation modes.
- [[Sections/deeplearning/training-loop/save-load-model|torch.save / torch.load]] — Save and load model checkpoints.

## CNNs & Vision · 6

- [[Sections/deeplearning/cnns-vision/conv2d-architecture|CNN Architecture]] — Build complete CNN for images.
- [[Sections/deeplearning/cnns-vision/maxpool2d|nn.MaxPool2d]] — Max pooling for spatial reduction.
- [[Sections/deeplearning/cnns-vision/batchnorm2d|nn.BatchNorm2d]] — Batch normalization for conv layers.
- [[Sections/deeplearning/cnns-vision/dropout|nn.Dropout]] — Regularization via random node dropping.
- [[Sections/deeplearning/cnns-vision/torchvision-transforms|torchvision Transforms]] — Image augmentation and preprocessing.
- [[Sections/deeplearning/cnns-vision/transfer-learning|Transfer Learning]] — Use pretrained models as feature extractors.

## NLP & Sequences · 6

- [[Sections/deeplearning/nlp-sequences/embedding-layer|nn.Embedding]] — Lookup table for word embeddings.
- [[Sections/deeplearning/nlp-sequences/rnn-patterns|RNN / GRU Patterns]] — Recurrent networks for sequences.
- [[Sections/deeplearning/nlp-sequences/lstm-patterns|LSTM Patterns]] — Long-term dependencies in sequences.
- [[Sections/deeplearning/nlp-sequences/attention-mechanism|Attention Mechanism]] — Weighted focus on sequence parts.
- [[Sections/deeplearning/nlp-sequences/tokenization-padding|Tokenization & Padding]] — Convert text to token IDs and pad sequences.
- [[Sections/deeplearning/nlp-sequences/subword-tokenization|Subword Tokenization]] — BPE, WordPiece for OOV handling.
