/**
 * E2B Data Science Interpreter Implementation
 * 
 * This script demonstrates the implementation of a specialized E2B Code Interpreter
 * for data science and machine learning tasks using scikit-learn.
 */

// Import the Sandbox class from E2B
import { Sandbox } from "npm:@e2b/code-interpreter";

// Define the interface for execution result
export interface ExecutionResult {
  /** Output text from the execution */
  text: string;
  /** Any results or artifacts generated during execution */
  results: any[];
  /** Error information if execution failed */
  error?: {
    type: string;
    value: string;
  } | null;
  /** Logs from the execution */
  logs: {
    stdout: string[];
    stderr: string[];
  };
  /** Visualization data (for plots, charts, etc.) */
  visualizations?: {
    type: string;
    data: any;
    path?: string;
  }[];
}

// Define the interface for data science interpreter options
export interface DataScienceInterpreterOptions {
  /** Optional API key to use instead of the environment variable */
  apiKey?: string;
  /** Whether to install common data science packages automatically */
  autoInstallPackages?: boolean;
  /** List of additional packages to install */
  additionalPackages?: string[];
}

// Define the interface for run code options
export interface RunCodeOptions {
  /** Whether to stream output */
  stream?: boolean;
  /** Language to use for execution */
  language?: "python" | "r";
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to save generated visualizations */
  saveVisualizations?: boolean;
  /** Directory to save visualizations */
  visualizationDir?: string;
}

// Common data science packages to install by default
const DEFAULT_PACKAGES = [
  "numpy",
  "pandas",
  "matplotlib",
  "scikit-learn",
  "seaborn"
];

/**
 * Create a new sandbox instance for data science
 * @param options Options for the sandbox
 * @returns A promise that resolves to the sandbox instance
 */
export async function createDataScienceSandbox(options: DataScienceInterpreterOptions = {}): Promise<Sandbox> {
  const apiKey = options.apiKey || Deno.env.get("E2B_API_KEY");
  if (!apiKey) {
    throw new Error("E2B_API_KEY is required either in options or as an environment variable");
  }

  try {
    // Create a new sandbox instance using the factory method
    // @ts-ignore - Ignore TypeScript errors for API compatibility
    const sandbox = await Sandbox.create({ apiKey });
    console.log("Created data science sandbox");
    
    // Install common data science packages if requested
    if (options.autoInstallPackages !== false) {
      await installDataSciencePackages(sandbox, options.additionalPackages);
    }
    
    return sandbox;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to create data science sandbox:", errorMessage);
    throw error;
  }
}

/**
 * Install common data science packages in the sandbox
 * @param sandbox The sandbox instance
 * @param additionalPackages Additional packages to install
 */
async function installDataSciencePackages(sandbox: Sandbox, additionalPackages: string[] = []): Promise<void> {
  const packages = [...DEFAULT_PACKAGES, ...additionalPackages];
  console.log(`Installing data science packages: ${packages.join(", ")}`);
  
  try {
    // @ts-ignore - Ignore TypeScript errors for API compatibility
    const result = await sandbox.runCode(`
!pip install ${packages.join(" ")} --quiet
print("Data science packages installed successfully")
    `);
    
    console.log("Package installation result:", result.logs.stdout.join("\n"));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to install data science packages:", errorMessage);
    // Continue even if package installation fails, as some packages might already be installed
  }
}

/**
 * Execute data science code in the sandbox
 * @param code The code to execute
 * @param options Options for execution
 * @returns The execution result
 */
export async function executeDataScienceCode(
  code: string,
  options: RunCodeOptions = {}
): Promise<ExecutionResult> {
  const sandbox = await createDataScienceSandbox();

  try {
    // Prepare the code based on the language
    let preparedCode = code;
    const language = options.language || "python";
    
    if (language === "python") {
      // For Python, ensure basic imports are available
      if (!code.trim().startsWith("!pip") && !code.trim().startsWith("import")) {
        preparedCode = "import numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nfrom sklearn import *\n" + preparedCode;
      }
      
      // Add code to save visualizations if requested
      if (options.saveVisualizations) {
        const visualizationDir = options.visualizationDir || "/tmp";
        preparedCode = `
import os
import matplotlib.pyplot as plt

# Create visualization directory if it doesn't exist
os.makedirs("${visualizationDir}", exist_ok=True)

# Configure matplotlib to save figures
plt.rcParams["savefig.directory"] = "${visualizationDir}"

# Override show method to save figures
original_show = plt.show
def custom_show(*args, **kwargs):
    # Generate a unique filename
    import time
    filename = f"${visualizationDir}/plot_{int(time.time() * 1000)}.png"
    plt.savefig(filename)
    print(f"Plot saved to {filename}")
    return original_show(*args, **kwargs)
plt.show = custom_show

${preparedCode}
        `;
      }
    } else if (language === "r") {
      // For R, ensure basic libraries are loaded
      preparedCode = `
library(ggplot2)
library(dplyr)
${preparedCode}
      `;
    }
    
    // Set up execution options
    const execOptions: any = {
      language
    };
    
    if (options.stream) {
      execOptions.onStdout = (data: any) => console.log("[stdout]", data);
      execOptions.onStderr = (data: any) => console.error("[stderr]", data);
    }
    
    // Execute the code with timeout
    let execution: any;
    if (options.timeout) {
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Execution timed out after ${options.timeout}ms`)), options.timeout);
      });
      
      // Race the execution against the timeout
      // @ts-ignore - Ignore TypeScript errors for API compatibility
      execution = await Promise.race([
        sandbox.runCode(preparedCode, execOptions),
        timeoutPromise
      ]);
    } else {
      // @ts-ignore - Ignore TypeScript errors for API compatibility
      execution = await sandbox.runCode(preparedCode, execOptions);
    }
    
    // Extract visualization paths from stdout if any
    const visualizations = extractVisualizationPaths(execution.logs?.stdout || []);
    
    // Format the result to match our ExecutionResult interface
    const result: ExecutionResult = {
      text: execution.text || "",
      results: execution.results || [],
      error: execution.error ? {
        type: "error",
        value: typeof execution.error === 'string' ? execution.error : JSON.stringify(execution.error)
      } : null,
      logs: {
        stdout: Array.isArray(execution.logs?.stdout) ? execution.logs.stdout : 
               (execution.logs?.stdout ? [execution.logs.stdout] : []),
        stderr: Array.isArray(execution.logs?.stderr) ? execution.logs.stderr : 
               (execution.logs?.stderr ? [execution.logs.stderr] : [])
      },
      visualizations: visualizations
    };
    
    // Log the execution result
    const isError = result.error !== null && result.error !== undefined;
    console.log(
    const visualizations = extractVisualizationPaths(execution.logs?.stdout || []);
    
    // Format the result to match our ExecutionResult interface
    const result: ExecutionResult = {
      text: execution.text || "",
      results: execution.results || [],
      error: execution.error ? {
        type: "error",
        value: typeof execution.error === 'string' ? execution.error : JSON.stringify(execution.error)
      } : null,
      logs: {
        stdout: Array.isArray(execution.logs?.stdout) ? execution.logs.stdout : 
               (execution.logs?.stdout ? [execution.logs.stdout] : []),
        stderr: Array.isArray(execution.logs?.stderr) ? execution.logs.stderr : 
               (execution.logs?.stderr ? [execution.logs.stderr] : [])
      },
      visualizations: visualizations
    };
    
    // Log the execution result
    const isError = result.error !== null && result.error !== undefined;
    console.log(
      `Data science code execution ${isError ? "failed" : "completed"}`,
      {
        error: isError && result.error ? result.error.value : undefined,
        outputLength: result.text.length,
        resultsCount: result.results.length,
        visualizationsCount: visualizations.length
      }
    );
    
    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Data science code execution failed:", errorMessage);
    
    // Return an error result
    return {
      text: "",
      results: [],
      error: {
        type: "error",
        value: errorMessage
      },
      logs: {
        stdout: [],
        stderr: [errorMessage]
      }
    };
  } finally {
    // Always close the sandbox to free resources
    // @ts-ignore - Ignore TypeScript errors for API compatibility
    await sandbox.kill();
  }
}

/**
 * Extract visualization paths from stdout
 * @param stdout Array of stdout lines
 * @returns Array of visualization objects
 */
function extractVisualizationPaths(stdout: string[]): { type: string; data: any; path: string }[] {
  const visualizations: { type: string; data: any; path: string }[] = [];
  
  // Look for lines that indicate a plot was saved
  for (const line of stdout) {
    const match = line.match(/Plot saved to (.+\.png)/);
    if (match && match[1]) {
      visualizations.push({
        type: "image",
        data: null,
        path: match[1]
      });
    }
  }
  
  return visualizations;
}

/**
 * Generate a synthetic dataset for testing
 * @param dataType Type of dataset to generate
 * @param options Options for dataset generation
 * @returns The execution result
 */
export async function generateSyntheticData(
  dataType: "classification" | "regression" | "clustering",
  options: {
    n_samples?: number;
    n_features?: number;
    n_classes?: number;
    n_clusters?: number;
    n_informative?: number;
    noise?: number;
    random_state?: number;
    outputPath?: string;
  } = {}
): Promise<ExecutionResult> {
  // Set default options
  const n_samples = options.n_samples || 1000;
  const n_features = options.n_features || 10;
  const n_classes = options.n_classes || 2;
  const n_clusters = options.n_clusters || 3;
  const n_informative = options.n_informative || Math.min(5, n_features);
  const noise = options.noise || 0.1;
  const random_state = options.random_state || 42;
  const outputPath = options.outputPath || "/tmp/synthetic_data.csv";
  
  // Prepare data generation code based on data type
  let dataCode: string;
  
  if (dataType === "classification") {
    dataCode = `
import pandas as pd
import numpy as np
from sklearn.datasets import make_classification

# Generate synthetic classification dataset
X, y = make_classification(
    n_samples=${n_samples},
    n_features=${n_features},
    n_informative=${n_informative},
    n_redundant=${Math.max(0, Math.min(n_features - n_informative - 1, 2))},
    n_classes=${n_classes},
    random_state=${random_state},
    n_clusters_per_class=2,
    class_sep=1.0,
    flip_y=${noise}
)

# Convert to DataFrame
feature_names = [f'feature_{i}' for i in range(X.shape[1])]
df = pd.DataFrame(X, columns=feature_names)
df['target'] = y

# Display dataset info
print(f"Generated classification dataset with {n_samples} samples and {n_features} features")
print(f"Target distribution:\\n{df['target'].value_counts()}")
print("\\nSample data:")
print(df.head())

# Save to CSV
df.to_csv("${outputPath}", index=False)
print(f"\\nDataset saved to {repr("${outputPath}")}")

# Return success message
"Classification dataset generated successfully"
`;
  } else if (dataType === "regression") {
    dataCode = `
import pandas as pd
import numpy as np
from sklearn.datasets import make_regression

# Generate synthetic regression dataset
X, y = make_regression(
    n_samples=${n_samples},
    n_features=${n_features},
    n_informative=${n_informative},
    noise=${noise},
    random_state=${random_state}
)

# Convert to DataFrame
feature_names = [f'feature_{i}' for i in range(X.shape[1])]
df = pd.DataFrame(X, columns=feature_names)
df['target'] = y

# Display dataset info
print(f"Generated regression dataset with {n_samples} samples and {n_features} features")
print("\\nTarget statistics:")
print(df['target'].describe())
print("\\nSample data:")
print(df.head())

# Save to CSV
df.to_csv("${outputPath}", index=False)
print(f"\\nDataset saved to {repr("${outputPath}")}")

# Return success message
"Regression dataset generated successfully"
`;
  } else if (dataType === "clustering") {
    dataCode = `
import pandas as pd
import numpy as np
from sklearn.datasets import make_blobs

# Generate synthetic clustering dataset
X, y = make_blobs(
    n_samples=${n_samples},
    n_features=${n_features},
    centers=${n_clusters},
    cluster_std=${noise},
    random_state=${random_state}
)

# Convert to DataFrame
feature_names = [f'feature_{i}' for i in range(X.shape[1])]
df = pd.DataFrame(X, columns=feature_names)
df['true_cluster'] = y  # Include true cluster labels for evaluation

# Display dataset info
print(f"Generated clustering dataset with {n_samples} samples and {n_features} features")
print(f"True cluster distribution:\\n{df['true_cluster'].value_counts()}")
print("\\nSample data:")
print(df.head())

# Save to CSV
df.to_csv("${outputPath}", index=False)
print(f"\\nDataset saved to {repr("${outputPath}")}")

# Return success message
"Clustering dataset generated successfully"
`;
  } else {
    throw new Error(`Unsupported data type: ${dataType}`);
  }
  
  // Execute the data generation code
  return executeDataScienceCode(dataCode);
}

/**
 * Run a complete machine learning workflow
 * @param dataType Type of dataset to use
 * @param modelType Type of model to train
 * @param options Options for the workflow
 * @returns The execution result
 */
export async function runMLWorkflow(
  dataType: "classification" | "regression" | "clustering",
  modelType: "classification" | "regression" | "clustering",
  options: {
    useExistingData?: boolean;
    dataPath?: string;
    targetColumn?: string;
    hyperparameterTuning?: boolean;
    modelParams?: Record<string, any>;
    dataOptions?: Record<string, any>;
  } = {}
): Promise<ExecutionResult> {
  try {
    // Set default options
    const useExistingData = options.useExistingData || false;
    const dataPath = options.dataPath || "/tmp/synthetic_data.csv";
    const targetColumn = options.targetColumn || "target";
    const hyperparameterTuning = options.hyperparameterTuning || false;
    const modelParams = options.modelParams || {};
    const dataOptions = options.dataOptions || {};
    
    // Step 1: Generate or use existing data
    let dataResult: ExecutionResult;
    if (!useExistingData) {
      console.log(`Generating synthetic ${dataType} dataset...`);
      dataResult = await generateSyntheticData(dataType, {
        outputPath: dataPath,
        ...dataOptions
      });
      console.log("Data generation result:", dataResult.text);
    } else {
      console.log(`Using existing dataset at ${dataPath}`);
    }
    
    // Step 2: Train the model
    console.log(`Training ${modelType} model...`);
    const modelResult = await executeDataScienceCode(`
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split

# Load the dataset
print(f"Loading data from {repr("${dataPath}")}...")
df = pd.read_csv("${dataPath}")
print(f"Dataset shape: {df.shape}")

# Display basic info
print("\\nDataset info:")
print(df.info())

print("\\nFirst 5 rows:")
print(df.head())

# Exploratory Data Analysis
print("\\nPerforming exploratory data analysis...")

# Check for missing values
print("\\nMissing values per column:")
print(df.isnull().sum())

# Summary statistics
print("\\nSummary statistics:")
print(df.describe())

# Correlation matrix
plt.figure(figsize=(10, 8))
corr = df.corr()
sns.heatmap(corr, annot=False, cmap='coolwarm')
plt.title('Correlation Matrix')
plt.tight_layout()
plt.show()

# Target distribution (if classification)
if "${modelType}" == "classification" and "${targetColumn}" in df.columns:
    plt.figure(figsize=(8, 6))
    sns.countplot(x="${targetColumn}", data=df)
    plt.title('Target Distribution')
    plt.show()

# Feature distributions
num_features = min(5, len(df.columns) - 1)  # Show at most 5 features
plt.figure(figsize=(15, 10))
for i, feature in enumerate(df.columns[:num_features]):
    if feature != "${targetColumn}":
        plt.subplot(2, 3, i+1)
        sns.histplot(df[feature], kde=True)
        plt.title(f'Distribution of {feature}')
plt.tight_layout()
plt.show()

print("\\nExploratory data analysis completed")
    `, { saveVisualizations: true });
    
    console.log("EDA completed");
    
    // Step 3: Train the model
    const trainingResult = await executeDataScienceCode(`
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# Load the dataset
df = pd.read_csv("${dataPath}")

# Prepare features and target
if "${targetColumn}" in df.columns:
    X = df.drop("${targetColumn}", axis=1)
    y = df["${targetColumn}"]
else:
    X = df
    y = None

# Split the data for supervised learning
if "${modelType}" in ["classification", "regression"]:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Training set shape: {X_train.shape}")
    print(f"Test set shape: {X_test.shape}")

# Create preprocessing pipeline
numeric_features = X.select_dtypes(include=['float64', 'int64']).columns.tolist()
categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

# Define preprocessing steps
preprocessor = ColumnTransformer(
    transformers=[
        ('num', Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ]), numeric_features)
    ]
)

if categorical_features:
    preprocessor.transformers.append(
        ('cat', Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ]), categorical_features)
    )

# Choose model based on type
if "${modelType}" == "classification":
    from sklearn.ensemble import RandomForestClassifier
    model_params = ${JSON.stringify(modelParams)}
    model = RandomForestClassifier(random_state=42, **model_params)
    
    # Create full pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', model)
    ])
    
    # Train the model
    print("\\nTraining classification model...")
    ${hyperparameterTuning ? `
    # Define parameter grid for hyperparameter tuning
    param_grid = {
        'model__n_estimators': [50, 100, 200],
        'model__max_depth': [None, 10, 20],
        'model__min_samples_split': [2, 5, 10]
    }
    
    # Create grid search
    grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    # Get best model
    pipeline = grid_search.best_estimator_
    print("\\nBest parameters:")
    print(grid_search.best_params_)
    ` : `
    # Train the model without hyperparameter tuning
    pipeline.fit(X_train, y_train)
    `}
    
    # Make predictions
    y_pred = pipeline.predict(X_test)
    
    # Evaluate the model
    print("\\nModel evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\\nClassification report:")
    print(classification_report(y_test, y_pred))
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.show()
    
elif "${modelType}" == "regression":
    from sklearn.ensemble import RandomForestRegressor
    model_params = ${JSON.stringify(modelParams)}
    model = RandomForestRegressor(random_state=42, **model_params)
    
    # Create full pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', model)
    ])
    
    # Train the model
    print("\\nTraining regression model...")
    ${hyperparameterTuning ? `
    # Define parameter grid for hyperparameter tuning
    param_grid = {
        'model__n_estimators': [50, 100, 200],
        'model__max_depth': [None, 10, 20],
        'model__min_samples_split': [2, 5, 10]
    }
    
    # Create grid search
    grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='neg_mean_squared_error', n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    # Get best model
    pipeline = grid_search.best_estimator_
    print("\\nBest parameters:")
    print(grid_search.best_params_)
    ` : `
    # Train the model without hyperparameter tuning
    pipeline.fit(X_train, y_train)
    `}
    
    # Make predictions
    y_pred = pipeline.predict(X_test)
    
    # Evaluate the model
    print("\\nModel evaluation:")
    print(f"Mean Squared Error: {mean_squared_error(y_test, y_pred):.4f}")
    print(f"Root Mean Squared Error: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
    print(f"Mean Absolute Error: {mean_absolute_error(y_test, y_pred):.4f}")
    print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
    
    # Plot actual vs predicted values
    plt.figure(figsize=(10, 8))
    plt.scatter(y_test, y_pred, alpha=0.5)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.title('Actual vs Predicted Values')
    plt.show()
    
elif "${modelType}" == "clustering":
    # For clustering, we use all data
    model_params = ${JSON.stringify(modelParams)}
    n_clusters = model_params.get('n_clusters', 3)
    model = KMeans(n_clusters=n_clusters, random_state=42, **{k: v for k, v in model_params.items() if k != 'n_clusters'})
    
    # Create full pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', model)
    ])
    
    # Find optimal number of clusters if hyperparameter tuning is enabled
    if ${hyperparameterTuning}:
        print("\\nFinding optimal number of clusters...")
        X_preprocessed = preprocessor.fit_transform(X)
        
        # Calculate silhouette scores for different numbers of clusters
        silhouette_scores = []
        k_range = range(2, min(11, len(X) // 5))  # Try up to 10 clusters or 1/5 of data points
        
        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=42)
            cluster_labels = kmeans.fit_predict(X_preprocessed)
            silhouette_avg = silhouette_score(X_preprocessed, cluster_labels)
            silhouette_scores.append(silhouette_avg)
            print(f"For n_clusters = {k}, the silhouette score is {silhouette_avg:.4f}")
        
        # Plot silhouette scores
        plt.figure(figsize=(10, 6))
        plt.plot(list(k_range), silhouette_scores, 'o-')
        plt.xlabel('Number of clusters')
        plt.ylabel('Silhouette Score')
        plt.title('Silhouette Score vs. Number of Clusters')
        plt.grid(True)
        plt.show()
        
        # Find optimal number of clusters
        optimal_k = k_range[np.argmax(silhouette_scores)]
        print(f"\\nOptimal number of clusters: {optimal_k}")
        
        # Update model with optimal number of clusters
        model = KMeans(n_clusters=optimal_k, random_state=42)
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('model', model)
        ])
    
    # Fit the clustering model
    print("\\nFitting clustering model...")
    pipeline.fit(X)
    
    # Get cluster labels
    cluster_labels = pipeline.predict(X)
    X_with_clusters = X.copy()
    X_with_clusters['cluster'] = cluster_labels
    
    # Evaluate clustering
    X_preprocessed = preprocessor.transform(X)
    silhouette_avg = silhouette_score(X_preprocessed, cluster_labels)
    print(f"Silhouette Score: {silhouette_avg:.4f}")
    
    # Visualize clusters using PCA
    from sklearn.decomposition import PCA
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_preprocessed)
    
    plt.figure(figsize=(10, 8))
    scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1], c=cluster_labels, cmap='viridis', alpha=0.5)
    plt.colorbar(scatter, label='Cluster')
    plt.title('Cluster Visualization (PCA)')
    plt.xlabel('Principal Component 1')
    plt.ylabel('Principal Component 2')
    plt.show()
    
    # Analyze clusters
    print("\\nCluster analysis:")
    cluster_stats = X_with_clusters.groupby('cluster').agg(['mean', 'std', 'count'])
    print(cluster_stats.head())
    
    # Visualize cluster distributions
    plt.figure(figsize=(10, 6))
    X_with_clusters['cluster'].value_counts().plot(kind='bar')
    plt.title('Cluster Distribution')
    plt.xlabel('Cluster')
    plt.ylabel('Count')
    plt.show()
    
    # If we have a target column, analyze clusters with respect to target
    if "${targetColumn}" in df.columns:
        X_with_clusters['target'] = df["${targetColumn}"]
        
        # Analyze target distribution per cluster
        print("\\nTarget distribution per cluster:")
        target_cluster = pd.crosstab(X_with_clusters['cluster'], X_with_clusters['target'])
        print(target_cluster)
        
        # Visualize target distribution per cluster
        plt.figure(figsize=(12, 8))
        target_cluster.plot(kind='bar', stacked=True)
        plt.title('Target Distribution per Cluster')
        plt.xlabel('Cluster')
        plt.ylabel('Count')
        plt.legend(title='Target')
        plt.show()

# Save the model
import joblib
joblib.dump(pipeline, '/tmp/trained_model.joblib')
print("\\nModel saved to /tmp/trained_model.joblib")

# Return success message
f"{modelType.capitalize()} model training completed successfully"
    `, { saveVisualizations: true });
    
    console.log("Model training result:", trainingResult.text);
    
    return trainingResult;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ML workflow failed:", errorMessage);
    
    // Return an error result
    return {
      text: "",
      results: [],
      error: {
        type: "error",
        value: errorMessage
      },
      logs: {
        stdout: [],
        stderr: [errorMessage]
      }
    };
  }
}

// Run the main function if this script is executed directly
if (import.meta.main) {
  main();
}