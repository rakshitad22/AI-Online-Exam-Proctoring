import sys
from pathlib import Path

# Add project root directory to sys.path so top-level packages (e.g., 'vision') are importable
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

# Set 1: Test 1: Computer Vision & OpenCV (20 Questions)
cv_questions = [
    {
        "id": "cv_q1",
        "question_text": "What is the primary default color channel ordering used by OpenCV when reading images via cv2.imread?",
        "options": ["BGR (Blue, Green, Red)", "RGB (Red, Green, Blue)", "HSV (Hue, Saturation, Value)", "YCrCb"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q2",
        "question_text": "Which OpenCV function is used to apply Gaussian spatial smoothing to reduce high-frequency noise in webcam frames?",
        "options": ["cv2.medianBlur()", "cv2.GaussianBlur()", "cv2.bilateralFilter()", "cv2.boxFilter()"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q3",
        "question_text": "Which OpenCV method implements multi-stage edge detection using intensity gradients and hysteresis thresholding?",
        "options": ["cv2.Sobel()", "cv2.Laplacian()", "cv2.Canny()", "cv2.Scharr()"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "cv_q4",
        "question_text": "Which function is used in OpenCV to extract contiguous object boundary curves from binary thresholded images?",
        "options": ["cv2.findContours()", "cv2.drawContours()", "cv2.convexHull()", "cv2.approxPolyDP()"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q5",
        "question_text": "Which function calculates the non-rotated minimal bounding rectangle (x, y, width, height) enclosing a set of 2D points or contours?",
        "options": ["cv2.minAreaRect()", "cv2.boundingRect()", "cv2.boxPoints()", "cv2.fitEllipse()"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q6",
        "question_text": "What color space transformation code parameter is passed to cv2.cvtColor to convert standard BGR frames into Grayscale?",
        "options": ["cv2.COLOR_BGR2GRAY", "cv2.COLOR_RGB2GRAY", "cv2.COLOR_GRAY2BGR", "cv2.COLOR_BGR2HSV"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q7",
        "question_text": "Which morphological operation consists of erosion followed by dilation to remove small isolated noise pixels?",
        "options": ["Closing (MORPH_CLOSE)", "Gradient (MORPH_GRADIENT)", "Opening (MORPH_OPEN)", "Top Hat (MORPH_TOPHAT)"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "cv_q8",
        "question_text": "Which morphological operation consists of dilation followed by erosion to fill small dark holes within foreground objects?",
        "options": ["Opening (MORPH_OPEN)", "Closing (MORPH_CLOSE)", "Black Hat (MORPH_BLACKHAT)", "Erosion"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q9",
        "question_text": "What function is used to equalize pixel contrast distribution across a 1-channel grayscale image histogram?",
        "options": ["cv2.equalizeHist()", "cv2.normalize()", "cv2.calcHist()", "cv2.threshold()"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q10",
        "question_text": "Which OpenCV function draws bounding boxes or rectangles directly onto an image canvas given top-left and bottom-right corners?",
        "options": ["cv2.line()", "cv2.polylines()", "cv2.circle()", "cv2.rectangle()"],
        "correct_option": 3,
        "marks": 5
    },
    {
        "id": "cv_q11",
        "question_text": "What method calculates absolute per-element difference between two frame matrices for motion-based keyframe detection?",
        "options": ["cv2.subtract()", "cv2.absdiff()", "cv2.bitwise_xor()", "cv2.addWeighted()"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q12",
        "question_text": "Which function resizes an input image matrix to specified output dimensions or scaling factors?",
        "options": ["cv2.resize()", "cv2.warpAffine()", "cv2.pyrDown()", "cv2.remap()"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q13",
        "question_text": "What is the primary purpose of applying cv2.approxPolyDP to a contour in computer vision shape analysis?",
        "options": ["To compute exact pixel area", "To count color channels", "To approximate a polygonal curve with fewer vertices based on Douglas-Peucker algorithm", "To smooth image borders"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "cv_q14",
        "question_text": "Which color space separates luminance (intensity) from chrominance (color channels), making it useful for skin-tone segmentation under illumination changes?",
        "options": ["RGB", "HSV / YCrCb", "CMYK", "Grayscale"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q15",
        "question_text": "Which OpenCV class is instantiated to perform object or face detection using XML cascade files?",
        "options": ["cv2.CascadeClassifier", "cv2.HOGDescriptor", "cv2.Feature2D", "cv2.BackgroundSubtractor"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q16",
        "question_text": "Which function decodes raw binary or base64 image byte buffers into an OpenCV NumPy array?",
        "options": ["cv2.imread()", "cv2.imdecode()", "cv2.imencode()", "cv2.imwrite()"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q17",
        "question_text": "Which function renders text string overlays (e.g. classification labels) onto image matrices?",
        "options": ["cv2.drawMarker()", "cv2.drawKeypoints()", "cv2.putText()", "cv2.displayOverlay()"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "cv_q18",
        "question_text": "Which OpenCV function generates a structuring element kernel (e.g., RECT, ELLIPSE) for morphological operations?",
        "options": ["cv2.getStructuringElement()", "cv2.getGaussianKernel()", "cv2.getRotationMatrix2D()", "cv2.getPerspectiveTransform()"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q19",
        "question_text": "What is the function of Otsu's thresholding algorithm (cv2.THRESH_OTSU) in image binarization?",
        "options": ["To apply local adaptive thresholding", "To automatically calculate optimal global threshold value by minimizing intra-class variance", "To invert grayscale intensities", "To apply color mapping"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q20",
        "question_text": "What core Python data structure represents image matrices in OpenCV's Python API?",
        "options": ["NumPy ndarray", "Python List of Lists", "PIL Image Object", "PyTorch Tensor"],
        "correct_option": 0,
        "marks": 5
    }
]

# Set 2: Test 2: Machine Learning Fundamentals (20 Questions)
ml_questions = [
    {
        "id": "ml_q1",
        "question_text": "Which machine learning paradigm involves training models on labeled datasets consisting of input features and target labels?",
        "options": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Self-Supervised Learning"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q2",
        "question_text": "Which loss function is most appropriate for training binary classification models outputting probabilities?",
        "options": ["Mean Squared Error (MSE)", "Binary Cross-Entropy Loss", "Mean Absolute Error (MAE)", "Categorical Hinge Loss"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "ml_q3",
        "question_text": "What condition occurs when a machine learning model fits training data too closely, resulting in high variance and poor generalization to test data?",
        "options": ["Overfitting", "Underfitting", "Optimal convergence", "High Bias"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q4",
        "question_text": "How is the Precision metric calculated in classification evaluation?",
        "options": ["True Positives / (True Positives + False Negatives)", "True Negatives / (True Negatives + False Positives)", "True Positives / (True Positives + False Positives)", "(True Positives + True Negatives) / Total"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "ml_q5",
        "question_text": "How is the Recall (Sensitivity) metric defined in classification evaluation?",
        "options": ["True Positives / (True Positives + False Positives)", "True Positives / (True Positives + False Negatives)", "False Positives / (False Positives + True Negatives)", "True Negatives / Total"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "ml_q6",
        "question_text": "What metric represents the harmonic mean of Precision and Recall?",
        "options": ["F1-Score", "ROC-AUC", "Accuracy", "Matthews Correlation Coefficient"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q7",
        "question_text": "Which unsupervised algorithm partitions unlabeled data into K distinct clusters by minimizing distance to cluster centroids?",
        "options": ["Decision Tree", "Logistic Regression", "Naive Bayes", "K-Means Clustering"],
        "correct_option": 3,
        "marks": 5
    },
    {
        "id": "ml_q8",
        "question_text": "Which optimization algorithm iteratively adjusts model parameters in the direction of steepest negative gradient of the loss function?",
        "options": ["Simulated Annealing", "Gradient Descent", "Genetic Algorithm", "Grid Search"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "ml_q9",
        "question_text": "What technique prevents overfitting by adding a penalty term (e.g. L1 or L2 norm) to the loss function to constrain weight magnitude?",
        "options": ["Regularization", "Normalization", "One-Hot Encoding", "Data Imputation"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q10",
        "question_text": "Which model validation technique splits the dataset into K equal subsets, iteratively using K-1 folds for training and 1 fold for testing?",
        "options": ["Bootstrap Sampling", "Holdout Validation", "K-Fold Cross-Validation", "Stratified Leave-One-Out"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "ml_q11",
        "question_text": "Which linear classification algorithm finds the hyper-plane that maximizes the margin of separation between two target classes?",
        "options": ["Random Forest", "Support Vector Machine (SVM)", "K-Nearest Neighbors", "Linear Regression"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "ml_q12",
        "question_text": "Which ensemble machine learning algorithm constructs a multitude of decision trees using bootstrap aggregating (bagging)?",
        "options": ["Random Forest", "Gradient Boosting Machine", "AdaBoost", "Single Decision Tree"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q13",
        "question_text": "Which linear dimensionality reduction method projects high-dimensional data onto orthogonal directions of maximum variance?",
        "options": ["t-SNE", "Principal Component Analysis (PCA)", "LDA", "UMAP"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "ml_q14",
        "question_text": "Which instance-based learning algorithm classifies new data points based on majority vote among its K nearest training examples?",
        "options": ["Naive Bayes", "Logistic Regression", "K-Nearest Neighbors (KNN)", "Random Forest"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "ml_q15",
        "question_text": "Which mathematical function maps any real number into an output value between 0 and 1, forming the core of logistic regression?",
        "options": ["Sigmoid Function", "ReLU Function", "Hyperbolic Tangent (Tanh)", "Softmax"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q16",
        "question_text": "Which learning paradigm trains an agent to take sequential actions in an environment to maximize cumulative reward feedback?",
        "options": ["Supervised Learning", "Unsupervised Learning", "Semi-Supervised Learning", "Reinforcement Learning"],
        "correct_option": 3,
        "marks": 5
    },
    {
        "id": "ml_q17",
        "question_text": "What tabular layout visualizes performance by comparing actual target classes against predicted classes (TP, FP, TN, FN)?",
        "options": ["Scatter Plot", "Confusion Matrix", "Correlation Matrix", "Box Plot"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "ml_q18",
        "question_text": "What situation occurs when a machine learning model is too simple to capture complex relationships in the training data, causing high bias?",
        "options": ["Underfitting", "Overfitting", "Data Leakage", "Gradient Explosion"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q19",
        "question_text": "What hyperparameter determines the magnitude of parameter updates at each step during gradient descent optimization?",
        "options": ["Batch Size", "Epoch Count", "Learning Rate", "Momentum"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "ml_q20",
        "question_text": "What data preprocessing method rescales features so they have a mean of 0 and standard deviation of 1?",
        "options": ["Min-Max Scaling", "Standardization (Z-score Normalization)", "Log Transformation", "Binarization"],
        "correct_option": 1,
        "marks": 5
    }
]

# Set 3: Test 3: Deep Learning & CNN (20 Questions)
dl_questions = [
    {
        "id": "dl_q1",
        "question_text": "What fundamental operation in Convolutional Neural Network layers extracts spatial feature maps by sliding filter weights across input tensors?",
        "options": ["Discrete 2D Convolution", "Matrix Inversion", "Eigenvalue Decomposition", "Element-wise Division"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q2",
        "question_text": "Which non-linear activation function defined as f(x) = max(0, x) is widely used to prevent saturation in deep neural networks?",
        "options": ["Sigmoid", "ReLU (Rectified Linear Unit)", "Tanh", "Softplus"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "dl_q3",
        "question_text": "Which pooling layer operation reduces spatial dimensions by selecting the maximum activation value within sliding sub-regions?",
        "options": ["Max Pooling", "Average Pooling", "Global Sum Pooling", "Min Pooling"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q4",
        "question_text": "Which algorithm computes gradients of the loss function with respect to every weight using the mathematical chain rule?",
        "options": ["Forward Propagation", "Hebbian Learning", "Backpropagation", "Genetic Selection"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "dl_q5",
        "question_text": "What issue occurs when gradients diminish exponentially as backpropagation proceeds through very deep neural network layers?",
        "options": ["Exploding Gradients", "Vanishing Gradient Problem", "Internal Covariate Shift", "Overparameterization"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "dl_q6",
        "question_text": "What regularization technique randomly sets a subset of neuron activations to zero during each forward training pass?",
        "options": ["Dropout", "Weight Decay", "L1 Regularization", "Early Stopping"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q7",
        "question_text": "Which layer normalizes intermediate activations across mini-batches to stabilize training and mitigate internal covariate shift?",
        "options": ["Layer Normalization", "Group Normalization", "Batch Normalization", "Instance Normalization"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "dl_q8",
        "question_text": "Which activation function converts a vector of raw unnormalized logits into a multi-class probability distribution that sums to 1?",
        "options": ["Sigmoid", "Softmax", "Leaky ReLU", "ELU"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "dl_q9",
        "question_text": "What process fine-tunes a pre-trained deep learning backbone (e.g., ImageNet pre-trained CNN) on a specialized target dataset?",
        "options": ["Transfer Learning", "Unsupervised Pre-training", "Meta-Learning", "Few-Shot Learning"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q10",
        "question_text": "Which CNN layer connects every neuron in the previous layer to every neuron in the next layer to generate final classification scores?",
        "options": ["Convolutional Layer", "Pooling Layer", "Dropout Layer", "Fully Connected (Dense) Layer"],
        "correct_option": 3,
        "marks": 5
    },
    {
        "id": "dl_q11",
        "question_text": "Which CNN architecture introduced residual skip connections (shortcut connections) to enable training networks deeper than 100 layers?",
        "options": ["AlexNet", "ResNet", "VGG16", "LeNet-5"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "dl_q12",
        "question_text": "What parameter in a convolutional layer defines the step size with which the kernel slides across the input image?",
        "options": ["Stride", "Padding", "Dilation", "Receptive Field"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q13",
        "question_text": "What process adds zero-valued pixel borders around an input frame to maintain spatial dimensions after convolution?",
        "options": ["Cropping", "Pooling", "Zero Padding", "Sharpening"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "dl_q14",
        "question_text": "Which adaptive optimization algorithm combines concepts from both Momentum (first moment) and RMSprop (second moment)?",
        "options": ["SGD", "Adam Optimizer", "Adagrad", "Nesterov SGD"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "dl_q15",
        "question_text": "What parameter defines the spatial dimensions (height x width) of learned feature detector matrices in a CNN layer?",
        "options": ["Kernel / Filter Size", "Channel Count", "Feature Map Depth", "Batch Size"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q16",
        "question_text": "Which deep architecture processes sequential temporal inputs using internal memory cells (e.g. LSTM / GRU)?",
        "options": ["Standard CNN", "Autoencoder", "Transformer Encoder", "Recurrent Neural Network (RNN)"],
        "correct_option": 3,
        "marks": 5
    },
    {
        "id": "dl_q17",
        "question_text": "Which deep learning architecture introduced by Vaswani et al. relies exclusively on self-attention mechanisms without recurrence?",
        "options": ["CNN", "Transformer", "GAN", "MLP"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "dl_q18",
        "question_text": "Which framework consists of two neural networks (Generator and Discriminator) competing in an adversarial zero-sum game?",
        "options": ["Generative Adversarial Network (GAN)", "Variational Autoencoder (VAE)", "Deep Q-Network (DQN)", "Siamese Network"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q19",
        "question_text": "What property enables CNNs to detect learned features regardless of where they appear within the input frame?",
        "options": ["Rotation Invariance", "Scale Invariance", "Translation Invariance", "Affine Invariance"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "dl_q20",
        "question_text": "What parameter specifies the number of training samples processed in one forward and backward pass before weight updates occur?",
        "options": ["Epoch Count", "Batch Size", "Learning Rate", "Iteration Limit"],
        "correct_option": 1,
        "marks": 5
    }
]

# Set 4: Test 4: YOLO & Object Detection (20 Questions)
yolo_questions = [
    {
        "id": "yolo_q1",
        "question_text": "What is the primary architectural innovation of YOLO compared to region-proposal detectors like Faster R-CNN?",
        "options": ["Single-stage architecture evaluating bounding boxes & class probabilities in one evaluation pass", "Two-stage region proposal extraction", "Sliding window exhaustive search", "Cascade filtering"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q2",
        "question_text": "What metric quantifies spatial overlap ratio between a predicted bounding box and ground truth box?",
        "options": ["Cosine Distance", "Intersection over Union (IoU)", "Hamming Loss", "Mean Absolute Deviation"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "yolo_q3",
        "question_text": "Which post-processing algorithm filters out redundant overlapping bounding boxes pointing to the same object?",
        "options": ["Non-Maximum Suppression (NMS)", "K-Means Filtering", "Spatial Pyramid Pooling", "Softmax Thresholding"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q4",
        "question_text": "What pre-defined rectangular bounding boxes of varying aspect ratios serve as reference geometry in anchor-based object detectors?",
        "options": ["Bounding Grids", "Receptive Fields", "Anchor Boxes", "Feature Maps"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "yolo_q5",
        "question_text": "Which component in YOLO architecture is responsible for extracting feature representations at multiple spatial scales?",
        "options": ["Head", "Backbone (e.g., CSPDarknet)", "Loss Layer", "NMS Filter"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "yolo_q6",
        "question_text": "Which intermediate YOLO module (e.g. PANet / FPN) combines feature maps from different backbone stages to enrich multi-scale context?",
        "options": ["Neck", "Detection Head", "Anchor Generator", "Softmax Layer"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q7",
        "question_text": "Which final stage of a YOLO detector predicts bounding box coordinates (x, y, w, h), objectness confidence, and class probabilities?",
        "options": ["Backbone", "Neck", "Pre-processor", "Detection Head"],
        "correct_option": 3,
        "marks": 5
    },
    {
        "id": "yolo_q8",
        "question_text": "Which evaluation metric computes the average precision across class categories and IoU thresholds in object detection benchmarks?",
        "options": ["F1-Score", "mean Average Precision (mAP)", "Pixel Accuracy", "ROC-AUC"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "yolo_q9",
        "question_text": "What standard IoU threshold is commonly applied in benchmark evaluations to classify a predicted box as a True Positive?",
        "options": ["0.50 IoU", "0.10 IoU", "0.99 IoU", "0.05 IoU"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q10",
        "question_text": "Which loss function variant (e.g. CIoU / GIoU) penalizes bounding box location, aspect ratio, and scale misalignment?",
        "options": ["Cross-Entropy Loss", "Hinge Loss", "Complete IoU (CIoU) Loss", "Kullback-Leibler Divergence"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "yolo_q11",
        "question_text": "Which lightweight model variant in the YOLO family is specifically optimized for low-latency inference on edge or mobile hardware?",
        "options": ["YOLO-Extra Large", "YOLO-Nano / Tiny", "YOLO-Heavy", "YOLO-Cloud"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "yolo_q12",
        "question_text": "What benefit does Feature Pyramid Network (FPN) integration provide in modern YOLO architectures?",
        "options": ["Improves detection accuracy for small objects by fusing high-resolution low-level features", "Eliminates need for GPU acceleration", "Converts 2D images to 3D models", "Reduces dataset training size"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q13",
        "question_text": "How does YOLO divide an input frame to perform localized bounding box predictions?",
        "options": ["Sliding 1x1 windows", "Regular S x S grid cells", "Random region crops", "Concentric circular zones"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "yolo_q14",
        "question_text": "What does the objectness score in a YOLO bounding box prediction tensor represent?",
        "options": ["Probability that a bounding box contains a target object multiplied by IoU", "Distance to screen border", "RGB color intensity", "Frame resolution"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q15",
        "question_text": "What is the key difference between Object Classification and Object Localization?",
        "options": ["Classification determines 'what' an object is; Localization determines 'where' it is located using coordinates", "Classification is faster than localization", "Localization only works on video", "There is no difference"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q16",
        "question_text": "Which loss function dynamically down-weights easy negative background examples to focus on hard foreground objects during training?",
        "options": ["MSE Loss", "Focal Loss", "L1 Loss", "Cosine Loss"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "yolo_q17",
        "question_text": "What real-time frame processing speed (FPS) is typical for YOLO detectors on modern desktop GPUs?",
        "options": ["30+ Frames Per Second (Real-time)", "1 Frame Per Minute", "0.5 Frames Per Second", "1000 Frames Per Second"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q18",
        "question_text": "Which computer vision task extends object detection by identifying exact pixel-level masks for each object instance?",
        "options": ["Semantic Segmentation", "Image Classification", "Keypoint Estimation", "Instance Segmentation"],
        "correct_option": 3,
        "marks": 5
    },
    {
        "id": "yolo_q19",
        "question_text": "What data augmentation technique combines 4 training images into a single composite frame to improve YOLO scale robustness?",
        "options": ["Random Cropping", "Mosaic Augmentation", "Color Jittering", "Gaussian Noise Addition"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "yolo_q20",
        "question_text": "Which end-to-end vision transformer architecture eliminates hand-designed components like NMS and anchor generation?",
        "options": ["DETR (Detection Transformer)", "Faster R-CNN", "SSD", "YOLOv1"],
        "correct_option": 0,
        "marks": 5
    }
]

# Set 5: Test 5: AI-Based Online Proctoring (20 Questions)
proc_questions = [
    {
        "id": "proc_q1",
        "question_text": "What is the primary objective of deploying AI computer vision systems in online proctored examinations?",
        "options": ["Continuously monitoring candidate session integrity and detecting rule violations to ensure assessment fairness", "Automatically writing exam questions", "Replacing Internet service providers", "Accelerating keyboard typing speeds"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q2",
        "question_text": "Which violation category is triggered when an AI vision detector identifies more than one human face within the webcam view?",
        "options": ["EXTERNAL_DEVICE", "MULTIPLE_PERSONS", "HEAD_MOVEMENT", "TALKING"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "proc_q3",
        "question_text": "Which violation category is logged when rectangular handheld object signatures or mobile phones are detected?",
        "options": ["EXTERNAL_DEVICE", "HEAD_MOVEMENT", "TALKING", "NORMAL"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q4",
        "question_text": "Which violation category flags candidate gaze offsets exceeding yaw/pitch thresholds relative to screen center?",
        "options": ["MULTIPLE_PERSONS", "TALKING", "HEAD_MOVEMENT", "EXTERNAL_DEVICE"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "proc_q5",
        "question_text": "Which violation category monitors visual mouth aspect ratio (MAR) variations indicative of continuous speech or whispering?",
        "options": ["HEAD_MOVEMENT", "TALKING", "EXTERNAL_DEVICE", "MULTIPLE_PERSONS"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "proc_q6",
        "question_text": "What baseline status is maintained when a candidate remains focused and compliant with all exam rules?",
        "options": ["NORMAL (✓ AI Monitoring: Normal)", "FLAGGED", "SUSPICIOUS", "CRITICAL"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q7",
        "question_text": "What is the configured risk score weight added to a candidate session upon detecting an EXTERNAL_DEVICE violation?",
        "options": ["5 Points", "10 Points", "15 Points", "25 Points"],
        "correct_option": 3,
        "marks": 5
    },
    {
        "id": "proc_q8",
        "question_text": "What is the configured risk score weight added to a candidate session upon detecting a MULTIPLE_PERSONS violation?",
        "options": ["5 Points", "30 Points", "10 Points", "20 Points"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "proc_q9",
        "question_text": "What risk score weight is assigned to a TALKING mouth movement warning in the proctoring pipeline?",
        "options": ["10 Points", "25 Points", "30 Points", "2 Points"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q10",
        "question_text": "What risk score weight is assigned to a HEAD_MOVEMENT gaze offset warning in the proctoring pipeline?",
        "options": ["15 Points", "30 Points", "5 Points", "25 Points"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "proc_q11",
        "question_text": "What is the primary function of a temporal anti-spam cooldown buffer (e.g., 4 seconds) in backend violation logging?",
        "options": ["Preventing duplicate database records from rapid consecutive video frames", "Shutting down the server", "Deleting student answers", "Increasing webcam video frame rate"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q12",
        "question_text": "What is the maximum warning threshold after which an online candidate session is automatically flagged for examiner review?",
        "options": ["1 Warning", "3 Warnings", "50 Warnings", "10 Warnings"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "proc_q13",
        "question_text": "What is the primary role of human examiner dashboards in automated AI invigilation workflows?",
        "options": ["Reviewing flagged audit logs, violation timelines, and risk scores to make authoritative integrity decisions", "Writing code for the AI model", "Replacing the database server", "Grading multiple choice questions manually"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q14",
        "question_text": "Which ethical AI principle requires transparent candidate consent, data encryption, and restricted video retention boundaries?",
        "options": ["Black-box Deployment", "Unrestricted Surveillance", "Data Privacy & Algorithmic Fairness", "Automated Disqualification"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "proc_q15",
        "question_text": "What pre-exam verification step confirms candidate identity before launching the proctored test environment?",
        "options": ["Webcam permission check & candidate ID authorization", "Payment gateway check", "Speed test check", "Browser theme check"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q16",
        "question_text": "Which risk category is assigned when a candidate's accumulated risk score reaches or exceeds 75%?",
        "options": ["CRITICAL", "LOW", "MEDIUM", "SAFE"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q17",
        "question_text": "Which MongoDB collection stores timestamped proctoring violation logs (exam_id, student_id, violation_type, confidence)?",
        "options": ["db.users", "db.violations", "db.questions", "db.logs"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "proc_q18",
        "question_text": "Which MongoDB collection tracks ongoing candidate exam session status, active time, warning count, and risk score?",
        "options": ["db.exam_attempts", "db.reports", "db.exams", "db.sessions"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q19",
        "question_text": "What feature enables examiners to export official candidate proctoring audit reports for integrity hearings?",
        "options": ["Print / Save PDF Audit Report", "CSV Database Dump", "Webcam Video Re-encode", "Source Code Export"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "proc_q20",
        "question_text": "What benefit does automated AI proctoring offer educational institutions during large-scale remote assessments?",
        "options": ["Scalable, objective, and consistent integrity monitoring without requiring one-to-one human proctors per candidate", "100% elimination of exam questions", "Automatic 100% scores for all students", "Faster internet connection speeds"],
        "correct_option": 0,
        "marks": 5
    }
]

exams_list = [
    {
        "title": "Test 1: Computer Vision & OpenCV",
        "description": "Specialized examination covering OpenCV fundamentals, matrix operations, color space transformations, thresholding, and morphological operations.",
        "duration_minutes": 45,
        "total_marks": 100,
        "passing_marks": 40,
        "is_active": True,
        "created_by": "admin_system",
        "questions": cv_questions
    },
    {
        "title": "Test 2: Machine Learning Fundamentals",
        "description": "Core assessment covering supervised/unsupervised learning, classification algorithms, gradient descent, bias-variance tradeoff, and evaluation metrics.",
        "duration_minutes": 45,
        "total_marks": 100,
        "passing_marks": 40,
        "is_active": True,
        "created_by": "admin_system",
        "questions": ml_questions
    },
    {
        "title": "Test 3: Deep Learning & CNN",
        "description": "In-depth evaluation covering neural network backpropagation, convolutional layers, pooling, activation functions (ReLU, Softmax), and transfer learning.",
        "duration_minutes": 45,
        "total_marks": 100,
        "passing_marks": 40,
        "is_active": True,
        "created_by": "admin_system",
        "questions": dl_questions
    },
    {
        "title": "Test 4: YOLO & Object Detection",
        "description": "Advanced examination on single-stage vs two-stage object detectors, YOLO architecture (backbone, neck, head), non-maximum suppression (NMS), and IoU.",
        "duration_minutes": 45,
        "total_marks": 100,
        "passing_marks": 40,
        "is_active": True,
        "created_by": "admin_system",
        "questions": yolo_questions
    },
    {
        "title": "Test 5: AI-Based Online Proctoring",
        "description": "Comprehensive exam on continuous video invigilation, multi-class anomaly detection, temporal consecutive-frame verification, risk index calculation, and ethical AI.",
        "duration_minutes": 45,
        "total_marks": 100,
        "passing_marks": 40,
        "is_active": True,
        "created_by": "admin_system",
        "questions": proc_questions
    }
]

async def seed_database():
    logger.info("Connecting to MongoDB for seeding...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # Seed Admin User
    admin_email = "admin@example.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_doc = {
            "email": admin_email,
            "full_name": "Dr. Sarah Examiner",
            "hashed_password": get_password_hash("admin123"),
            "role": "admin",
            "student_id": "ADM-001",
            "department": "Computer Science & Engineering",
            "is_active": True
        }
        await db.users.insert_one(admin_doc)
        logger.info(f"Created demo admin account: {admin_email} / admin123")

    # Seed Student User
    student_email = "student@example.com"
    existing_student = await db.users.find_one({"email": student_email})
    if not existing_student:
        student_doc = {
            "email": student_email,
            "full_name": "Alex Johnson",
            "hashed_password": get_password_hash("student123"),
            "role": "student",
            "student_id": "CS-2024-001",
            "department": "Software Engineering",
            "is_active": True
        }
        await db.users.insert_one(student_doc)
        logger.info(f"Created demo student account: {student_email} / student123")

    # Seed 5 Distinct Examinations
    # Clean up legacy old single sample exam if present
    await db.exams.delete_many({"title": "Computer Vision & AI Final Assessment 2026"})

    for exam_data in exams_list:
        existing_exam = await db.exams.find_one({"title": exam_data["title"]})
        if not existing_exam:
            res = await db.exams.insert_one(exam_data)
            logger.info(f"Created exam '{exam_data['title']}' with ID: {res.inserted_id}")
        else:
            await db.exams.update_one({"_id": existing_exam["_id"]}, {"$set": exam_data})
            logger.info(f"Updated exam '{exam_data['title']}' with ID: {existing_exam['_id']}")

    client.close()
    logger.info("Database seeding complete for all 5 examinations!")

if __name__ == "__main__":
    asyncio.run(seed_database())
