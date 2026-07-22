export const meta = {
  "title": "Machine Learning",
  "domain": "javascript",
  "sheet": "ml",
  "icon": "🧠"
}

export const sections = [

  // ── Section 1: TensorFlow.js — tensors, models, training ─────────────────────────────────────────
  {
    id: "tensorflow-js",
    title: "TensorFlow.js — tensors, models, training",
    entries: [
      {
        id: "tfjs-basics",
        fn: "TensorFlow.js — tensors, operations, models",
        desc: "TensorFlow.js (TF.js) brings machine learning to JavaScript — train and run models in Node.js (CPU/GPU) or the browser (WebGL/WebGPU). Tensors are n-dimensional arrays; models are layered graphs of operations.",
        category: "ML",
        subtitle: "tf.tensor, tf.model, tf.layers, tf.train, fit, predict, save, load",
        signature: "const model = tf.sequential(); model.add(tf.layers.dense({ units: 10, inputShape: [4] })); model.compile({ optimizer: 'adam', loss: 'meanSquaredError' })",
        descLong: "TF.js mirrors the TensorFlow/Keras API in JavaScript. Tensors (tf.tensor) are immutable n-dimensional arrays with automatic memory management (tf.tidy() prevents leaks). Models are built with tf.sequential() or tf.model() (functional API). Layers: dense, conv2d, lstm, embedding, dropout. Training: model.fit() with batches, epochs, validation. Save/load: model.save() to local storage, IndexedDB, or file system. Use TF.js for in-browser inference, server-side ML without Python, and on-device training.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Train a simple linear regression model.\n// APPROACH  - tf.sequential with one dense layer; model.fit on synthetic data.\n// STRENGTHS - Runs in browser or Node.js; no Python needed.\n// WEAKNESSES- Slower than Python TF for large models; limited GPU support on Node.\n//\nimport * as tf from '@tensorflow/tfjs-node';\n\n// Generate training data: y = 2x + 1 + noise\nconst xs = tf.tensor([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);\nconst ys = tf.tensor([3, 5, 7, 9, 11, 13, 15, 17, 19, 21]);  // 2x+1\n\n// Build model\nconst model = tf.sequential();\nmodel.add(tf.layers.dense({ units: 1, inputShape: [1] }));\n\nmodel.compile({\n  optimizer: tf.train.sgd(0.01),\n  loss: 'meanSquaredError',\n});\n\n// Train\nawait model.fit(xs, ys, { epochs: 100 });\n\n// Predict\nconst prediction = model.predict(tf.tensor([15]));\nprediction.print();  // ~31 (2*15+1)\n\n// Clean up — prevent memory leaks\nxs.dispose(); ys.dispose(); prediction.dispose();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Build and train a neural network for classification\n//             (iris dataset); evaluate accuracy; save/load model.\n// APPROACH  - Sequential model with 2 hidden layers; tf.data for batching;\n//             model.evaluate for metrics; model.save to disk.\n// STRENGTHS - Full training pipeline; model persistence; batch training.\n// WEAKNESSES- Manual data preprocessing; no built-in data loading utilities.\n//\nimport * as tf from '@tensorflow/tfjs-node';\nimport * as fs from 'fs';\n\n// Load and preprocess iris dataset\nconst raw = fs.readFileSync('iris.csv', 'utf-8')\n  .trim().split('\\n')\n  .map(line => line.split(','));\n\nconst labels = ['setosa', 'versicolor', 'virginica'];\nconst data = raw.map(([sl, sw, pl, pw, species]) => ({\n  features: [Number(sl), Number(sw), Number(pl), Number(pw)],\n  label: labels.indexOf(species),\n}));\n\n// Shuffle and split\ntf.util.shuffle(data);\nconst splitIdx = Math.floor(data.length * 0.8);\nconst trainData = data.slice(0, splitIdx);\nconst testData = data.slice(splitIdx);\n\n// Convert to tensors\nconst trainXs = tf.tensor2d(trainData.map(d => d.features));\nconst trainYs = tf.oneHot(tf.tensor1d(trainData.map(d => d.label), 'int32'), 3);\nconst testXs = tf.tensor2d(testData.map(d => d.features));\nconst testYs = tf.oneHot(tf.tensor1d(testData.map(d => d.label), 'int32'), 3);\n\n// Build model\nconst model = tf.sequential();\nmodel.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [4] }));\nmodel.add(tf.layers.dense({ units: 12, activation: 'relu' }));\nmodel.add(tf.layers.dense({ units: 3, activation: 'softmax' }));\n\nmodel.compile({\n  optimizer: tf.train.adam(0.01),\n  loss: 'categoricalCrossentropy',\n  metrics: ['accuracy'],\n});\n\n// Train with validation\nawait model.fit(trainXs, trainYs, {\n  epochs: 50,\n  batchSize: 16,\n  validationData: [testXs, testYs],\n  callbacks: {\n    onEpochEnd: (epoch, logs) => {\n      if (epoch % 10 === 0) console.log(`Epoch ${epoch}: acc=${logs.acc.toFixed(4)}, val_acc=${logs.val_acc.toFixed(4)}`);\n    },\n  },\n});\n\n// Evaluate\nconst evalResult = model.evaluate(testXs, testYs);\nconsole.log('Test loss:', evalResult[0].dataSync()[0]);\nconsole.log('Test accuracy:', evalResult[1].dataSync()[0]);\n\n// Save model\nawait model.save('file://./iris-model');\n\n// Load model later\nconst loadedModel = await tf.loadLayersModel('file://./iris-model/model.json');\nconst prediction = loadedModel.predict(tf.tensor2d([[5.1, 3.5, 1.4, 0.2]]));\nconst predictedClass = prediction.argMax(-1).dataSync()[0];\nconsole.log('Predicted:', labels[predictedClass]);  // setosa\n\n// Cleanup\ntf.dispose([trainXs, trainYs, testXs, testYs, prediction]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Custom training loop with tf.tidy, gradient computation,\n//             custom loss, learning rate scheduling, and model export\n//             for browser deployment.\n// APPROACH  - tf.variableGrads for custom gradients; tf.tidy for memory;\n//             tf.train.scheduler for LR decay; model.save to tfjs format\n//             for browser loading.\n// STRENGTHS - Full control over training; memory-safe; deployable to browser.\n// WEAKNESSES- Custom loops are verbose; must manage tensor disposal manually.\n//\nimport * as tf from '@tensorflow/tfjs-node';\n\n// Custom training loop with gradient tape\nclass CustomTrainer {\n  constructor(model, learningRate = 0.001) {\n    this.model = model;\n    this.optimizer = tf.train.adam(learningRate);\n    this.lrScheduler = tf.train.exponentialDecay(learningRate, 1000, 0.95);\n  }\n\n  // Custom loss: weighted categorical crossentropy\n  lossFn(yTrue, yPred, classWeights) {\n    return tf.tidy(() => {\n      const weights = tf.tensor1d(classWeights);\n      const weightedYTrue = yTrue.mul(weights);\n      const epsilon = tf.scalar(1e-7);\n      const loss = weightedYTrue.mul(yPred.add(epsilon).log()).neg().sum(-1);\n      return loss.mean();\n    });\n  }\n\n  // Single training step with gradient computation\n  trainStep(xBatch, yBatch, classWeights) {\n    return tf.tidy(() => {\n      const { value, grads } = this.optimizer.computeGradients(() => {\n        const predictions = this.model.predict(xBatch);\n        return this.lossFn(yBatch, predictions, classWeights);\n      });\n\n      this.optimizer.applyGradients(grads);\n      return value;\n    });\n  }\n\n  async train(dataset, epochs, classWeights) {\n    for (let epoch = 0; epoch < epochs; epoch++) {\n      let epochLoss = 0;\n      let batches = 0;\n\n      for (const batch of dataset) {\n        const loss = this.trainStep(batch.xs, batch.ys, classWeights);\n        epochLoss += loss.dataSync()[0];\n        batches++;\n        tf.dispose(loss);\n      }\n\n      const avgLoss = epochLoss / batches;\n      if (epoch % 10 === 0) {\n        console.log(`Epoch ${epoch}: loss=${avgLoss.toFixed(4)}, lr=${this.lrScheduler(epoch * batches).dataSync()[0].toFixed(6)}`);\n      }\n    }\n  }\n}\n\n// Build a model for browser deployment\nfunction buildImageClassifier() {\n  const model = tf.sequential();\n  model.add(tf.layers.conv2d({\n    inputShape: [28, 28, 1], filters: 32, kernelSize: 3,\n    activation: 'relu',\n  }));\n  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));\n  model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }));\n  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));\n  model.add(tf.layers.flatten());\n  model.add(tf.layers.dropout({ rate: 0.25 }));\n  model.add(tf.layers.dense({ units: 128, activation: 'relu' }));\n  model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));\n\n  model.compile({\n    optimizer: tf.train.adam(0.001),\n    loss: 'categoricalCrossentropy',\n    metrics: ['accuracy'],\n  });\n\n  return model;\n}\n\n// Train and export for browser\nconst model = buildImageClassifier();\nconst trainer = new CustomTrainer(model, 0.001);\n\n// Train with custom loop\nawait trainer.train(trainingBatches, 30, [1.0, 1.2, 1.5, 1.0, 0.8, 1.0, 1.1, 1.0, 0.9, 1.0]);\n\n// Save in tfjs format (loadable in browser)\nawait model.save('file://./image-classifier');\n\n// Browser loading code:\n// import * as tf from '@tensorflow/tfjs';\n// const model = await tf.loadLayersModel('https://cdn.example.com/image-classifier/model.json');\n// const prediction = model.predict(tf.browser.fromPixels(canvas).resizeBilinear([28, 28]).expandDims(0));"
                  }
        ],
        tips: [
                  "Always wrap tensor operations in tf.tidy() — automatically disposes intermediate tensors to prevent memory leaks.",
                  "Use tf.dispose() or tf.dispose([t1, t2]) for manual cleanup — tensors are not garbage collected.",
                  "Use @tensorflow/tfjs-node (CPU) or @tensorflow/tfjs-node-gpu (CUDA) for server-side — much faster than pure JS tfjs.",
                  "Save models with model.save() — supports file://, localstorage://, indexeddb://, and http:// schemes.",
                  "Use tf.oneHot() for categorical labels — converts integer labels to one-hot encoded tensors."
        ],
        mistake: "Not disposing tensors — each tf.tensor() allocates GPU/CPU memory. Without tf.tidy() or .dispose(), you get OOM errors. Always clean up.",
        shorthand: {
          verbose: "import * as tf from '@tensorflow/tfjs-node';\nconst m = tf.sequential();\nm.add(tf.layers.dense({ units: 1, inputShape: [1] }));\nm.compile({ optimizer: 'adam', loss: 'meanSquaredError' });\nawait m.fit(xs, ys, { epochs: 100 });",
          concise: "const m = tf.sequential(); m.add(tf.layers.dense({units:1,inputShape:[1]})); m.compile({optimizer:'adam',loss:'mse'}); await m.fit(xs,ys,{epochs:100});",
        },
      },
    ],
  },

  // ── Section 2: scikitjs — sklearn-like API for JavaScript ─────────────────────────────────────────
  {
    id: "scikitjs",
    title: "scikitjs — sklearn-like API for JavaScript",
    entries: [
      {
        id: "scikitjs-basics",
        fn: "scikitjs — simple ML algorithms without deep learning",
        desc: "scikitjs provides scikit-learn-like APIs in JavaScript — LogisticRegression, RandomForest, KMeans, PCA, StandardScaler. Good for traditional ML without the overhead of TensorFlow.js.",
        category: "ML",
        subtitle: "LogisticRegression, RandomForestClassifier, KMeans, PCA, StandardScaler, fit, predict",
        signature: "const clf = new LogisticRegression(); clf.fit(X, y); clf.predict(X_new)",
        descLong: "scikitjs mirrors the scikit-learn API for JavaScript. Available models: LogisticRegression, RandomForestClassifier, RandomForestRegressor, KMeans, PCA, StandardScaler, MinMaxScaler, trainTestSplit. The API follows fit/predict/transform pattern. Uses TF.js under the hood for computation but exposes a simpler interface. Good for tabular data, classification, clustering, and preprocessing — when you don't need neural networks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Train a logistic regression classifier on tabular data.\n// APPROACH  - scikitjs LogisticRegression; fit/predict API.\n// STRENGTHS - Simple sklearn-like API; no deep learning needed.\n// WEAKNESSES- Limited model selection; slower than Python sklearn.\n//\nimport { LogisticRegression, StandardScaler, trainTestSplit } from 'scikitjs';\n\n// Sample data — features and labels\nconst X = [\n  [25, 50000, 1], [35, 75000, 0], [45, 100000, 1], [23, 30000, 0],\n  [50, 120000, 1], [30, 60000, 0], [40, 90000, 1], [28, 45000, 0],\n];\nconst y = [0, 1, 1, 0, 1, 0, 1, 0];  // binary classification\n\n// Split data\nconst [XTrain, XTest, yTrain, yTest] = trainTestSplit(X, y, { testSize: 0.25 });\n\n// Scale features\nconst scaler = new StandardScaler();\nconst XTrainScaled = scaler.fitTransform(XTrain);\nconst XTestScaled = scaler.transform(XTest);\n\n// Train\nconst clf = new LogisticRegression({ learningRate: 0.01, iterations: 100 });\nclf.fit(XTrainScaled, yTrain);\n\n// Predict\nconst predictions = clf.predict(XTestScaled);\nconsole.log('Predictions:', predictions);\nconsole.log('Actual:', yTest);\n\n// Accuracy\nconst accuracy = predictions.filter((p, i) => p === yTest[i]).length / yTest.length;\nconsole.log('Accuracy:', accuracy);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - RandomForest classifier with preprocessing pipeline,\n//             cross-validation, and feature importance.\n// APPROACH  - Pipeline: StandardScaler -> RandomForest; cross-validation\n//             for robust evaluation; feature importances for interpretability.\n// STRENGTHS - Handles non-linear data; feature importance; robust to outliers.\n// WEAKNESSES- RandomForest in JS is slower than Python; no parallelism.\n//\nimport {\n  RandomForestClassifier, StandardScaler, KFold,\n  accuracyScore, confusionMatrix,\n} from 'scikitjs';\n\n// Dataset\nconst X = loadData();  // [[f1, f2, f3, ...], ...]\nconst y = loadLabels();  // [0, 1, 2, ...]\n\n// Preprocessing\nconst scaler = new StandardScaler();\nconst XScaled = scaler.fitTransform(X);\n\n// Cross-validation\nconst kf = new KFold({ nSplits: 5 });\nconst scores = [];\n\nfor (const [trainIdx, valIdx] of kf.split(XScaled)) {\n  const XTrain = trainIdx.map(i => XScaled[i]);\n  const yTrain = trainIdx.map(i => y[i]);\n  const XVal = valIdx.map(i => XScaled[i]);\n  const yVal = valIdx.map(i => y[i]);\n\n  const clf = new RandomForestClassifier({\n    nEstimators: 50,\n    maxDepth: 10,\n    randomState: 42,\n  });\n\n  clf.fit(XTrain, yTrain);\n  const preds = clf.predict(XVal);\n  const acc = accuracyScore(yVal, preds);\n  scores.push(acc);\n}\n\nconsole.log('CV scores:', scores);\nconsole.log('Mean accuracy:', scores.reduce((a, b) => a + b) / scores.length);\n\n// Train final model on all data\nconst finalModel = new RandomForestClassifier({ nEstimators: 100, maxDepth: 10 });\nfinalModel.fit(XScaled, y);\n\n// Feature importance\nconst importances = finalModel.featureImportances();\nconsole.log('Feature importances:', importances);\n\n// Confusion matrix on training data\nconst trainPreds = finalModel.predict(XScaled);\nconsole.log('Confusion matrix:', confusionMatrix(y, trainPreds));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - KMeans clustering, PCA dimensionality reduction, and\n//             a full ML pipeline with model serialization.\n// APPROACH  - KMeans for customer segmentation; PCA for visualization;\n//             pipeline with fit/transform/predict; save/load via JSON.\n// STRENGTHS - Unsupervised learning; dimensionality reduction; serializable.\n// WEAKNESSES- scikitjs has fewer algorithms than Python sklearn.\n//\nimport { KMeans, PCA, StandardScaler, Pipeline } from 'scikitjs';\n\n// Customer data for segmentation\nconst customerData = [\n  [25, 50000, 5, 12],   // age, income, visits, months\n  [35, 75000, 3, 24],\n  [45, 120000, 8, 36],\n  // ... thousands more\n];\n\n// Build preprocessing pipeline\nconst pipeline = new Pipeline([\n  ['scaler', new StandardScaler()],\n  ['pca', new PCA({ nComponents: 2 })],  // reduce to 2D for visualization\n]);\n\n// Fit and transform\nconst reduced = pipeline.fitTransform(customerData);\nconsole.log('Reduced shape:', reduced.length, 'x', reduced[0].length);\n\n// KMeans clustering on reduced data\nconst kmeans = new KMeans({ nClusters: 4, maxIter: 300, randomState: 42 });\nconst clusters = kmeans.fitPredict(reduced);\n\n// Analyze clusters\nconst clusterStats = {};\ncustomerData.forEach((customer, i) => {\n  const cluster = clusters[i];\n  if (!clusterStats[cluster]) clusterStats[cluster] = { count: 0, avgIncome: 0, avgAge: 0 };\n  clusterStats[cluster].count++;\n  clusterStats[cluster].avgIncome += customer[1];\n  clusterStats[cluster].avgAge += customer[0];\n});\n\nfor (const [cluster, stats] of Object.entries(clusterStats)) {\n  console.log(`Cluster ${cluster}: ${stats.count} customers, avg age=${(stats.avgAge/stats.count).toFixed(1)}, avg income=${(stats.avgIncome/stats.count).toFixed(0)}`);\n}\n\n// Serialize model for deployment\nconst modelBundle = {\n  pipeline: pipeline.toJSON(),\n  kmeans: kmeans.toJSON(),\n  metadata: { trainedAt: new Date().toISOString(), nSamples: customerData.length },\n};\nfs.writeFileSync('customer-segmentation.json', JSON.stringify(modelBundle));\n\n// Load and use in production\nconst loaded = JSON.parse(fs.readFileSync('customer-segmentation.json', 'utf-8'));\nconst loadedPipeline = Pipeline.fromJSON(loaded.pipeline);\nconst loadedKMeans = KMeans.fromJSON(loaded.kmeans);\n\nfunction classifyCustomer(customer) {\n  const reduced = loadedPipeline.transform([customer]);\n  const cluster = loadedKMeans.predict(reduced);\n  return cluster[0];\n}"
                  }
        ],
        tips: [
                  "Always scale features with StandardScaler before training — unscaled features skew distance-based algorithms.",
                  "Use trainTestSplit or KFold for evaluation — never evaluate on training data.",
                  "Use PCA for dimensionality reduction before clustering — improves performance and visualization.",
                  "Serialize models to JSON for deployment — scikitjs models are JSON-serializable.",
                  "Use RandomForest for tabular data — often outperforms neural networks on small datasets."
        ],
        mistake: "Not scaling features before KMeans or PCA — these algorithms are distance-based, so features with larger ranges dominate. Always StandardScaler first.",
        shorthand: {
          verbose: "import { LogisticRegression } from 'scikitjs';\nconst clf = new LogisticRegression();\nclf.fit(XTrain, yTrain);\nconst preds = clf.predict(XTest);",
          concise: "const clf = new LogisticRegression(); clf.fit(X, y); clf.predict(Xnew);",
        },
      },
    ],
  },
]

export default { meta, sections }
