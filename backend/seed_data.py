import sys
from pathlib import Path

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
        "question_text": "Which classical machine learning cascade classifier structure is widely utilized for rapid face detection in OpenCV?",
        "options": ["Haar Feature Cascade Classifier", "HOG + Linear SVM", "SSD ResNet-50", "YOLOv8 Small"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q14",
        "question_text": "What thresholding technique automatically calculates an optimal global intensity threshold separating foreground and background based on intra-class variance?",
        "options": ["Adaptive Mean Thresholding", "Otsu's Binarization", "Triangle Thresholding", "Binary Inverted Thresholding"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q15",
        "question_text": "Which optical flow algorithm calculates sparse feature point motion vectors across consecutive frames using spatial intensity gradients?",
        "options": ["Lucas-Kanade Optical Flow", "Farneback Dense Flow", "Horn-Schunck Method", "DeepFlow"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q16",
        "question_text": "Which 3x3 kernel operator computes numerical approximations of horizontal and vertical image intensity gradients?",
        "options": ["Sobel Operator", "Gaussian Kernel", "Box Filter", "Laplacian of Gaussian"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q17",
        "question_text": "What parameter in cv2.findContours specifies storing only contour endpoint segments of horizontal, vertical, and diagonal lines?",
        "options": ["CHAIN_APPROX_NONE", "CHAIN_APPROX_SIMPLE", "RETR_EXTERNAL", "RETR_TREE"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "cv_q18",
        "question_text": "Which method performs 2D image affine transformations such as rotation, scaling, and translation given a 2x3 transformation matrix?",
        "options": ["cv2.warpAffine()", "cv2.warpPerspective()", "cv2.getPerspectiveTransform()", "cv2.remap()"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q19",
        "question_text": "What property calculates spatial moments (m00, m10, m01) of binary contours to determine object centroid coordinates?",
        "options": ["cv2.moments()", "cv2.contourArea()", "cv2.arcLength()", "cv2.isContourConvex()"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "cv_q20",
        "question_text": "Which image filtering technique preserves sharp edges while smoothing homogeneous noise regions using range and spatial Gaussian kernels?",
        "options": ["Bilateral Filter (cv2.bilateralFilter)", "Box Blur", "Gaussian Blur", "Median Blur"],
        "correct_option": 0,
        "marks": 5
    }
]

# Set 2: Test 2: Machine Learning Fundamentals (20 Questions)
ml_questions = [
    {
        "id": "ml_q1",
        "question_text": "What type of machine learning task predicts continuous numerical outcomes from input features?",
        "options": ["Regression", "Classification", "Clustering", "Dimensionality Reduction"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q2",
        "question_text": "Which evaluation metric represents the ratio of true positive predictions over total predicted positives?",
        "options": ["Recall", "Precision", "F1-Score", "Accuracy"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "ml_q3",
        "question_text": "What condition occurs when a machine learning model fits training data noise too closely and fails to generalize to unseen test data?",
        "options": ["Underfitting", "Overfitting", "Optimal Generalization", "High Bias"],
        "correct_option": 1,
        "marks": 5
    },
    {
        "id": "ml_q4",
        "question_text": "Which optimization algorithm iteratively updates parameter weights in the opposite direction of the loss function gradient?",
        "options": ["Gradient Descent", "Principal Component Analysis", "K-Means", "Random Forest"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q5",
        "question_text": "Which supervised algorithm finds an optimal hyperplane maximizing the margin between two distinct target classes?",
        "options": ["Support Vector Machine (SVM)", "Naive Bayes", "Decision Tree", "K-Nearest Neighbors"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q6",
        "question_text": "What is the mathematical harmonic mean of Precision and Recall?",
        "options": ["ROC-AUC", "Mean Squared Error", "F1-Score", "Accuracy"],
        "correct_option": 2,
        "marks": 5
    },
    {
        "id": "ml_q7",
        "question_text": "Which unsupervised clustering technique assigns data points to K cluster centroids iteratively by minimizing squared Euclidean distances?",
        "options": ["K-Means Clustering", "DBSCAN", "Hierarchical Clustering", "PCA"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q8",
        "question_text": "Which ensemble learning technique combines predictions from multiple independent decision trees built on bootstrap data samples?",
        "options": ["Random Forest", "Logistic Regression", "Linear Regression", "Single Decision Tree"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q9",
        "question_text": "What regularization method adds L1 penalty (absolute values of coefficients) to loss functions for feature selection?",
        "options": ["Lasso Regularization", "Ridge Regularization", "ElasticNet", "Dropout"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q10",
        "question_text": "What regularization method adds L2 penalty (squared values of coefficients) to prevent weight explosion?",
        "options": ["Ridge Regularization", "Lasso Regularization", "Early Stopping", "Batch Normalization"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q11",
        "question_text": "Which probabilistic classifier applies Bayes' Theorem with the strong assumption of conditional feature independence?",
        "options": ["Naive Bayes", "Logistic Regression", "Random Forest", "Gradient Boosting"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q12",
        "question_text": "What technique reduces high-dimensional data variance into orthogonal uncorrelated principal components?",
        "options": ["Principal Component Analysis (PCA)", "t-SNE", "Linear Discriminant Analysis", "Factor Analysis"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q13",
        "question_text": "What matrix tabular summary displays True Positives, False Positives, True Negatives, and False Negatives?",
        "options": ["Confusion Matrix", "Correlation Matrix", "Covariance Matrix", "Feature Importance Table"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q14",
        "question_text": "What validation technique splits data into K subsets to evaluate model performance iteratively across all folds?",
        "options": ["K-Fold Cross-Validation", "Holdout Validation", "Leave-One-Out", "Bootstrapping"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q15",
        "question_text": "What curve plots True Positive Rate (Sensitivity) against False Positive Rate (1 - Specificity) across decision thresholds?",
        "options": ["ROC Curve (Receiver Operating Characteristic)", "Precision-Recall Curve", "Learning Curve", "Scree Plot"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q16",
        "question_text": "What non-parametric algorithm classifies test instances based on majority voting of their K nearest feature neighbors?",
        "options": ["K-Nearest Neighbors (KNN)", "K-Means", "Kernel SVM", "Decision Tree"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q17",
        "question_text": "Which gradient boosting algorithm uses decision tree ensembles built sequentially to correct residual errors?",
        "options": ["XGBoost / LightGBM", "Random Forest", "Bagging Classifier", "Voting Classifier"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q18",
        "question_text": "What impurity metric measures the probability of a randomly chosen element being incorrectly labeled in Decision Trees?",
        "options": ["Gini Impurity", "Entropy", "Variance", "Cross-Entropy"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q19",
        "question_text": "What activation function squashes input values into a probabilistic range between 0.0 and 1.0 for binary logistic classification?",
        "options": ["Sigmoid Function", "ReLU Function", "Tanh Function", "Softmax Function"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "ml_q20",
        "question_text": "What data preprocessing step scales features to zero mean and unit variance ($N(0, 1)$)?",
        "options": ["Standardization (StandardScaler)", "Min-Max Normalization", "Robust Scaling", "Log Transformation"],
        "correct_option": 0,
        "marks": 5
    }
]

# Set 3: Test 3: Deep Learning & CNN (20 Questions)
dl_questions = [
    {
        "id": "dl_q1",
        "question_text": "Which mathematical operation forms the foundational building block of Convolutional Neural Networks for spatial feature extraction?",
        "options": ["Discrete 2D Cross-Correlation / Convolution", "Matrix Inversion", "Eigenvalue Decomposition", "Fourier Transform"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q2",
        "question_text": "What activation function outputs $f(x) = \max(0, x)$ to solve vanishing gradient problems in deep neural networks?",
        "options": ["Rectified Linear Unit (ReLU)", "Sigmoid", "Hyperbolic Tangent (Tanh)", "Leaky ReLU"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q3",
        "question_text": "Which layer downsamples feature map spatial dimensions (width and height) by extracting maximum local window values?",
        "options": ["MaxPooling2D", "AveragePooling2D", "GlobalAveragePooling", "Dense Layer"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q4",
        "question_text": "What regularization technique randomly deactivates a fraction of neuron outputs during each training forward pass?",
        "options": ["Dropout", "Batch Normalization", "Weight Decay", "L1 Regularization"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q5",
        "question_text": "What technique normalizes layer input activations across mini-batches to stabilize gradient flow and speed up training?",
        "options": ["Batch Normalization", "Layer Normalization", "Instance Normalization", "Group Normalization"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q6",
        "question_text": "Which algorithm computes loss function partial derivatives with respect to all layer weights using the mathematical chain rule?",
        "options": ["Backpropagation", "Forward Pass", "Stochastic Gradient Descent", "Adam Optimizer"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q7",
        "question_text": "Which activation function outputs a normalized probability distribution over multi-class target categories summing to 1.0?",
        "options": ["Softmax Function", "Sigmoid Function", "ELU Function", "SELU Function"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q8",
        "question_text": "Which optimization algorithm combines adaptive learning rates for each parameter with exponential moving averages of past gradients and squared gradients?",
        "options": ["Adam Optimizer", "RMSprop", "AdaGrad", "Standard SGD with Momentum"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q9",
        "question_text": "What landmark CNN architecture introduced residual skip connections to successfully train extremely deep networks (e.g., 50 to 152 layers)?",
        "options": ["ResNet", "AlexNet", "VGG-16", "LeNet-5"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q10",
        "question_text": "What problem occurs during backpropagation in deep un-networked architectures when gradients shrink exponentially towards zero?",
        "options": ["Vanishing Gradient Problem", "Exploding Gradient Problem", "Overfitting", "Dead Neurons"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q11",
        "question_text": "What concept repurposes weights from a model pre-trained on large image datasets (ImageNet) for specialized target tasks?",
        "options": ["Transfer Learning", "Domain Adaptation", "Few-Shot Learning", "Zero-Shot Learning"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q12",
        "question_text": "Which loss function measures numerical divergence between target probability distributions and predicted class probabilities in multi-class classification?",
        "options": ["Categorical Cross-Entropy Loss", "Mean Squared Error Loss", "Huber Loss", "Binary Cross-Entropy Loss"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q13",
        "question_text": "What hyperparameter determines the spatial step distance a convolutional filter moves across an input matrix?",
        "options": ["Stride", "Padding", "Dilation", "Kernel Size"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q14",
        "question_text": "What technique adds zero boundary pixels around an input image matrix to preserve spatial dimensions after convolution?",
        "options": ["Same Padding", "Valid Padding", "Reflect Padding", "Zero Clipping"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q15",
        "question_text": "What spatial dimension reduction layer converts multi-channel 2D feature maps into a 1D vector before fully connected dense layers?",
        "options": ["Flatten Layer", "Reshape Layer", "Permute Layer", "Embedding Layer"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q16",
        "question_text": "What recurrent neural network variant incorporates gating mechanisms (input, forget, output gates) to learn long-term temporal dependencies?",
        "options": ["LSTM (Long Short-Term Memory)", "Vanilla RNN", "Transformers", "Autoencoders"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q17",
        "question_text": "What lightweight CNN architecture utilizes depthwise separable convolutions for resource-constrained mobile and embedded vision applications?",
        "options": ["MobileNet", "EfficientNet", "DenseNet", "InceptionNet"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q18",
        "question_text": "What 1x1 convolution technique is used in architectures like Inception and ResNet bottleneck blocks to reduce channel depth?",
        "options": ["1x1 Convolution (Pointwise Convolution)", "3x3 Depthwise Convolution", "Transposed Convolution", "Dilated Convolution"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q19",
        "question_text": "What technique artificially expands training set diversity using geometric transformations like random rotations, flips, and crops?",
        "options": ["Data Augmentation", "Feature Extraction", "Normalisation", "Standardization"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dl_q20",
        "question_text": "What optimization technique stops neural network training when validation loss stops improving after a specified patience threshold?",
        "options": ["Early Stopping", "Learning Rate Decay", "Gradient Clipping", "Weight Decay"],
        "correct_option": 0,
        "marks": 5
    }
]

# Set 4: Test 4: YOLO & Object Detection (20 Questions)
yolo_questions = [
    {
        "id": "yolo_q1",
        "question_text": "What architectural distinction sets YOLO (You Only Look Once) apart from two-stage object detectors like Faster R-CNN?",
        "options": ["Single-stage unified end-to-end grid regression", "Separate region proposal network (RPN) pass", "Selective search candidate bounding box extraction", "Feature pyramid slow pooling"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q2",
        "question_text": "What metric evaluates bounding box overlap accuracy by dividing intersection area over total union area?",
        "options": ["Intersection over Union (IoU)", "Mean Average Precision (mAP)", "Dice Coefficient", "Structural Similarity Index"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q3",
        "question_text": "Which post-processing step filters out redundant overlapping bounding boxes predicting the same object instance?",
        "options": ["Non-Maximum Suppression (NMS)", "Bounding Box Regression", "Anchor Box Matching", "Feature Pyramid Network"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q4",
        "question_text": "What pre-defined spatial aspect ratio templates are used in YOLO to predict bounding box offsets across different object scales?",
        "options": ["Anchor Boxes / Prior Boxes", "Bounding Grids", "Feature Kernels", "Receptive Fields"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q5",
        "question_text": "What primary benchmark metric measures object detector precision across multiple recall thresholds and class categories?",
        "options": ["mAP (Mean Average Precision @ IoU 0.5:0.95)", "Accuracy", "F1-Score", "Pixel Recall"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q6",
        "question_text": "What component in modern YOLO architectures fuses multi-scale features from different backbone stages before detection heads?",
        "options": ["Neck (e.g., FPN / PANet)", "Backbone (e.g., DarkNet)", "Head (Anchorless / Anchor-based)", "Stem"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q7",
        "question_text": "What custom feature extractor backbone network was introduced in YOLOv2 and YOLOv3?",
        "options": ["DarkNet (DarkNet-19 / DarkNet-53)", "ResNet-101", "VGG-19", "MobileNetV2"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q8",
        "question_text": "What loss function component penalizes discrepancies between predicted bounding box coordinates (x, y, w, h) and ground truth boxes?",
        "options": ["Bounding Box Regression Loss (CIoU / GIoU Loss)", "Classification Loss", "Objectness Loss", "Focal Loss"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q9",
        "question_text": "What loss function addresses extreme foreground-background class imbalance in single-stage object detectors by down-weighting easy negative examples?",
        "options": ["Focal Loss", "Cross-Entropy Loss", "Triplet Loss", "Smooth L1 Loss"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q10",
        "question_text": "What parameter in YOLO NMS thresholding determines the maximum allowable IoU overlap before a lower-confidence bounding box is discarded?",
        "options": ["NMS IoU Threshold (e.g., 0.45)", "Confidence Threshold", "Score Cutoff", "Class Threshold"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q11",
        "question_text": "What modern YOLO paradigm shift (introduced in YOLOv8) eliminates fixed anchor boxes to predict object centers directly?",
        "options": ["Anchor-Free Detection", "Two-Stage Region Pooling", "Spatial Pyramid Matching", "Cascade Regression"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q12",
        "question_text": "What augmentation technique mixes 4 distinct training images into a single 2x2 composite canvas to improve multi-scale detection?",
        "options": ["Mosaic Augmentation", "MixUp Augmentation", "CutMix", "Random Erasing"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q13",
        "question_text": "What architectural block in YOLOv5/YOLOv8 reduces computational parameters while maintaining feature learning capacity using residual splits?",
        "options": ["C3 / C2f Block (CSP Bottleneck)", "Dense Block", "Inception Block", "Squeeze-and-Excitation Block"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q14",
        "question_text": "What output coordinate representation format is standard for YOLO bounding box ground truth annotations?",
        "options": ["Normalized [x_center, y_center, width, height]", "Absolute [x_min, y_min, x_max, y_max]", "Pascal VOC XML Format", "COCO Polygon Coordinates"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q15",
        "question_text": "What performance metric measures inference execution speed in object detection pipelines?",
        "options": ["FPS (Frames Per Second)", "mAP", "GFLOPs", "IoU Ratio"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q16",
        "question_text": "What bounding box IoU loss variant incorporates distance between box centers, aspect ratio consistency, and overlap area?",
        "options": ["Complete IoU Loss (CIoU)", "Generalized IoU (GIoU)", "Distance IoU (DIoU)", "Standard IoU"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q17",
        "question_text": "What feature pyramid network enhancement passes feature signals bidirectionally (top-down and bottom-up) across network scales?",
        "options": ["Path Aggregation Network (PANet)", "FPN", "BiFPN", "NAS-FPN"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q18",
        "question_text": "In YOLO real-time proctoring applications, what class detection confidence threshold is typically configured to filter low-probability detections?",
        "options": ["0.30 to 0.50 Confidence Threshold", "0.01 Threshold", "0.99 Threshold", "1.00 Threshold"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q19",
        "question_text": "What quantization technique optimizes YOLO PyTorch weights into 8-bit integers (INT8) or TensorRT engines for high-speed edge deployment?",
        "options": ["TensorRT / ONNX Model Quantization", "Model Pruning", "Knowledge Distillation", "Weight Decay"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "yolo_q20",
        "question_text": "What primary advantage does YOLO offer for live webcam invigilation over complex multi-stage region proposal networks?",
        "options": ["Ultra-high real-time frame rates (30+ FPS) suitable for continuous webcam stream monitoring", "Slower processing times", "Requires cloud supercomputers", "Only works on static offline images"],
        "correct_option": 0,
        "marks": 5
    }
]

# Set 5: Test 5: Data Structures and Algorithms (20 Questions)
dsa_questions = [
    {
        "id": "dsa_q1",
        "question_text": "What is the worst-case time complexity of accessing an element by its index in a contiguous array?",
        "options": ["O(1)", "O(N)", "O(log N)", "O(N^2)"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q2",
        "question_text": "Which data structure operates on a Last-In, First-Out (LIFO) principle?",
        "options": ["Stack", "Queue", "Priority Queue", "Linked List"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q3",
        "question_text": "Which data structure operates on a First-In, First-Out (FIFO) principle?",
        "options": ["Queue", "Stack", "Binary Search Tree", "Max Heap"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q4",
        "question_text": "What is the time complexity of inserting a new node at the head of a singly linked list if head pointer is known?",
        "options": ["O(1)", "O(N)", "O(log N)", "O(N log N)"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q5",
        "question_text": "Which binary tree traversal order visits nodes in ascending sorted order for a Binary Search Tree (BST)?",
        "options": ["In-order Traversal", "Pre-order Traversal", "Post-order Traversal", "Level-order Traversal"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q6",
        "question_text": "What is the average-case search time complexity in a balanced Binary Search Tree (e.g., AVL tree)?",
        "options": ["O(log N)", "O(N)", "O(1)", "O(N^2)"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q7",
        "question_text": "What is the average-case search and insertion time complexity of a Hash Table with good hash distribution?",
        "options": ["O(1)", "O(N)", "O(log N)", "O(N^2)"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q8",
        "question_text": "What is the average-case time complexity of QuickSort algorithm?",
        "options": ["O(N log N)", "O(N^2)", "O(N)", "O(log N)"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q9",
        "question_text": "Which sorting algorithm guarantees a worst-case time complexity of O(N log N) using a divide-and-conquer strategy?",
        "options": ["MergeSort", "BubbleSort", "InsertionSort", "QuickSort"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q10",
        "question_text": "Which algorithm strategy or data structure is used to implement Depth-First Search (DFS) iteratively?",
        "options": ["Stack", "Queue", "Min-Heap", "Hash Map"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q11",
        "question_text": "Which algorithm strategy or data structure is used to implement Breadth-First Search (BFS) on graphs?",
        "options": ["Queue", "Stack", "Binary Search Tree", "Array List"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q12",
        "question_text": "In a Min-Heap binary tree implementation, what element is always located at the root node?",
        "options": ["The minimum element", "The maximum element", "The median element", "The last inserted element"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q13",
        "question_text": "Which graph algorithm finds single-source shortest paths in a directed graph with non-negative edge weights?",
        "options": ["Dijkstra's Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm", "Bellman-Ford Algorithm"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q14",
        "question_text": "What two core properties characterize problems suitable for Dynamic Programming optimization?",
        "options": ["Overlapping Subproblems and Optimal Substructure", "Greedy Choice and Sorting", "Divide & Conquer with Zero Overlap", "Linearity and Monotonicity"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q15",
        "question_text": "How does a Circular Queue handle buffer wrap-around when inserting new elements?",
        "options": ["Using modulo arithmetic operator ((rear + 1) % capacity)", "Reallocating double array size", "Shifting all elements left", "Deleting root element"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q16",
        "question_text": "What structural feature distinguishes a Doubly Linked List node from a Singly Linked List node?",
        "options": ["Pointers to both Next and Previous nodes", "Pointer only to Next node", "No pointers", "Two data value fields"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q17",
        "question_text": "What is the auxiliary space complexity required to store a graph with V vertices using an Adjacency Matrix?",
        "options": ["O(V^2)", "O(V + E)", "O(E^2)", "O(V)"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q18",
        "question_text": "What is the maximum number of nodes at depth level 'k' (where root level is 0) in a Binary Tree?",
        "options": ["2^k", "2^(k+1)", "k^2", "2k"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q19",
        "question_text": "Which classic algorithm converts an Infix mathematical expression into a Postfix (Reverse Polish Notation) expression using a stack?",
        "options": ["Dijkstra's Shunting Yard Algorithm", "Kadane's Algorithm", "KMP Algorithm", "Rabin-Karp Algorithm"],
        "correct_option": 0,
        "marks": 5
    },
    {
        "id": "dsa_q20",
        "question_text": "What type of graph is required for a valid Topological Sort ordering of vertices?",
        "options": ["Directed Acyclic Graph (DAG)", "Undirected Cyclic Graph", "Complete Bipartite Graph", "Weighted Tree"],
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
        "title": "Test 5: Data Structures and Algorithms",
        "description": "Comprehensive evaluation covering arrays, linked lists, stacks, queues, trees, graph algorithms, sorting, hashing, and time complexity analysis.",
        "duration_minutes": 45,
        "total_marks": 100,
        "passing_marks": 40,
        "is_active": True,
        "created_by": "admin_system",
        "questions": dsa_questions
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
    else:
        # Ensure password hash is updated to admin123
        await db.users.update_one({"email": admin_email}, {"$set": {"hashed_password": get_password_hash("admin123"), "is_active": True}})

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
    else:
        # Ensure password hash is updated to student123
        await db.users.update_one({"email": student_email}, {"$set": {"hashed_password": get_password_hash("student123"), "is_active": True}})

    # Seed 5 Distinct Examinations
    # Clean up legacy old sample exams if present
    await db.exams.delete_many({"title": "Test 5: AI-Based Online Proctoring"})
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
    logger.info("Database seeding complete for all 5 examinations (20 questions each)!")

if __name__ == "__main__":
    asyncio.run(seed_database())
