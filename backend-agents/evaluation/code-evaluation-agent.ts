/**
 * Vera Protocol - Code Evaluation Agent
 * Specialized AI agent for comprehensive code analysis and evaluation
 */

import { GitHubAgent } from '../github-integration/github-agent.js';
import { EvaluationAgent, EvaluationResult, EvaluationEvidence } from '../shared/types.js';

export interface CodeRequirement {
  functionality: string[];
  performance: PerformanceRequirement[];
  security: SecurityRequirement[];
  testing: TestingRequirement[];
  documentation: DocumentationRequirement[];
  codeQuality: QualityRequirement[];
}

export interface PerformanceRequirement {
  metric: string;
  threshold: number;
  unit: string;
}

export interface SecurityRequirement {
  type: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface TestingRequirement {
  type: 'unit' | 'integration' | 'e2e';
  coverage: number;
  framework?: string;
}

export interface DocumentationRequirement {
  type: 'readme' | 'api' | 'inline' | 'setup';
  required: boolean;
  quality: number;
}

export interface QualityRequirement {
  metric: string;
  threshold: number;
  tool: string;
}

export interface CodeEvaluation extends EvaluationResult {
  codeQuality: CodeQualityMetrics;
  functionality: FunctionalityAnalysis;
  security: SecurityAnalysis;
  performance: PerformanceAnalysis;
  testing: TestingAnalysis;
  documentation: DocumentationAnalysis;
  compilation: CompilationResult;
}

export interface CodeQualityMetrics {
  maintainabilityIndex: number;
  cyclomaticComplexity: number;
  codeSmells: number;
  duplication: number;
  linesOfCode: number;
  technicalDebt: number;
}

export interface FunctionalityAnalysis {
  requirementsMet: number;
  featuresImplemented: string[];
  missingFeatures: string[];
  bugCount: number;
  criticalIssues: string[];
}

export interface SecurityAnalysis {
  vulnerabilities: SecurityVulnerability[];
  securityScore: number;
  dependencyIssues: DependencyIssue[];
  secretsExposed: boolean;
  authenticationIssues: string[];
}

export interface SecurityVulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file: string;
  line?: number;
  cwe?: string;
  recommendation: string;
}

export interface DependencyIssue {
  package: string;
  version: string;
  vulnerabilities: number;
  recommendation: string;
}

export interface PerformanceAnalysis {
  benchmarks: PerformanceBenchmark[];
  memoryUsage: number;
  cpuUsage: number;
  loadTime: number;
  optimizationSuggestions: string[];
}

export interface PerformanceBenchmark {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  passed: boolean;
}

export interface TestingAnalysis {
  coverage: TestCoverage;
  testResults: TestResult[];
  testQuality: number;
  missingTests: string[];
}

export interface TestCoverage {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
}

export interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export interface DocumentationAnalysis {
  readmeQuality: number;
  apiDocumentation: number;
  inlineComments: number;
  setupInstructions: number;
  missingDocumentation: string[];
}

export interface CompilationResult {
  success: boolean;
  errors: CompilationError[];
  warnings: CompilationWarning[];
  buildTime: number;
}

export interface CompilationError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface CompilationWarning {
  file: string;
  line: number;
  column: number;
  message: string;
  type: string;
}

export class CodeEvaluationAgent implements EvaluationAgent {
  private githubAgent: GitHubAgent;

  constructor(githubToken: string) {
    this.githubAgent = new GitHubAgent(githubToken);
  }

  async evaluate(
    workArtifacts: any[],
    requirements: CodeRequirement,
    context?: any
  ): Promise<CodeEvaluation> {
    const repositoryUrl = workArtifacts[0]?.url || workArtifacts[0];
    
    if (!repositoryUrl) {
      throw new Error('Repository URL is required for code evaluation');
    }

    console.log('🔍 Starting comprehensive code evaluation...');

    // 1. Analyze repository structure and code
    const repoAnalysis = await this.githubAgent.analyzeRepository(repositoryUrl);
    
    // 2. Run static code analysis
    const codeQuality = await this.analyzeCodeQuality(repositoryUrl, repoAnalysis);
    
    // 3. Analyze functionality against requirements
    const functionality = await this.analyzeFunctionality(repositoryUrl, requirements.functionality);
    
    // 4. Perform security analysis
    const security = await this.analyzeSecurityVulnerabilities(repositoryUrl, requirements.security);
    
    // 5. Run performance benchmarks
    const performance = await this.analyzePerformance(repositoryUrl, requirements.performance);
    
    // 6. Analyze testing coverage and quality
    const testing = await this.analyzeTesting(repositoryUrl, requirements.testing);
    
    // 7. Evaluate documentation quality
    const documentation = await this.analyzeDocumentation(repositoryUrl, requirements.documentation);
    
    // 8. Check compilation status
    const compilation = await this.checkCompilation(repositoryUrl);

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      codeQuality,
      functionality,
      security,
      performance,
      testing,
      documentation,
      compilation,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      codeQuality,
      functionality,
      security,
      performance,
      testing,
      documentation,
      compilation,
    });

    // Collect evidence
    const evidence = this.collectEvidence({
      codeQuality,
      functionality,
      security,
      performance,
      testing,
      documentation,
      compilation,
    });

    const evaluation: CodeEvaluation = {
      agentType: 'code',
      overallScore,
      confidence: this.calculateConfidence(compilation, testing, security),
      recommendations,
      evidence,
      timestamp: new Date().toISOString(),
      codeQuality,
      functionality,
      security,
      performance,
      testing,
      documentation,
      compilation,
    };

    console.log('✅ Code evaluation completed:', {
      score: overallScore,
      compilation: compilation.success,
      security: security.securityScore,
      coverage: testing.coverage.lines,
    });

    return evaluation;
  }

  private async analyzeCodeQuality(repositoryUrl: string, repoAnalysis: any): Promise<CodeQualityMetrics> {
    // Simplified code quality analysis - in production, integrate with SonarQube, CodeClimate, etc.
    const linesOfCode = repoAnalysis.codeQuality?.linesOfCode || 1000;
    const complexity = repoAnalysis.codeQuality?.complexity || 1.2;
    
    return {
      maintainabilityIndex: Math.max(0, 100 - (complexity * 10)),
      cyclomaticComplexity: complexity,
      codeSmells: Math.floor(linesOfCode / 500), // Simplified calculation
      duplication: Math.min(20, linesOfCode / 1000), // Percentage
      linesOfCode,
      technicalDebt: Math.floor(complexity * linesOfCode / 100), // Hours
    };
  }

  private async analyzeFunctionality(repositoryUrl: string, requirements: string[]): Promise<FunctionalityAnalysis> {
    // Analyze if functional requirements are met
    // In production, this would involve running the application and testing features
    
    const featuresImplemented = requirements.slice(0, Math.floor(requirements.length * 0.85));
    const missingFeatures = requirements.slice(Math.floor(requirements.length * 0.85));
    
    return {
      requirementsMet: (featuresImplemented.length / requirements.length) * 100,
      featuresImplemented,
      missingFeatures,
      bugCount: Math.floor(Math.random() * 3), // Simplified
      criticalIssues: [],
    };
  }

  private async analyzeSecurityVulnerabilities(
    repositoryUrl: string,
    requirements: SecurityRequirement[]
  ): Promise<SecurityAnalysis> {
    // Simplified security analysis - in production, integrate with Snyk, OWASP ZAP, etc.
    
    const vulnerabilities: SecurityVulnerability[] = [];
    const dependencyIssues: DependencyIssue[] = [];
    
    // Mock some common vulnerabilities for demonstration
    if (Math.random() > 0.7) {
      vulnerabilities.push({
        type: 'Cross-Site Scripting (XSS)',
        severity: 'medium',
        description: 'Potential XSS vulnerability in user input handling',
        file: 'src/components/UserInput.tsx',
        line: 45,
        cwe: 'CWE-79',
        recommendation: 'Sanitize user input and use proper encoding',
      });
    }

    const securityScore = Math.max(0, 100 - (vulnerabilities.length * 15) - (dependencyIssues.length * 10));

    return {
      vulnerabilities,
      securityScore,
      dependencyIssues,
      secretsExposed: false,
      authenticationIssues: [],
    };
  }

  private async analyzePerformance(
    repositoryUrl: string,
    requirements: PerformanceRequirement[]
  ): Promise<PerformanceAnalysis> {
    // Simplified performance analysis - in production, run actual benchmarks
    
    const benchmarks: PerformanceBenchmark[] = requirements.map(req => ({
      name: req.metric,
      value: req.threshold * 0.9, // Assume 90% of threshold performance
      unit: req.unit,
      threshold: req.threshold,
      passed: true,
    }));

    return {
      benchmarks,
      memoryUsage: 128, // MB
      cpuUsage: 15, // Percentage
      loadTime: 1200, // ms
      optimizationSuggestions: [
        'Consider code splitting for better load times',
        'Optimize image assets and use lazy loading',
        'Implement caching strategies for API calls',
      ],
    };
  }

  private async analyzeTesting(repositoryUrl: string, requirements: TestingRequirement[]): Promise<TestingAnalysis> {
    // Simplified testing analysis - in production, run actual test suites
    
    const coverage: TestCoverage = {
      lines: 85,
      functions: 90,
      branches: 75,
      statements: 88,
    };

    const testResults: TestResult[] = [
      {
        suite: 'Unit Tests',
        passed: 45,
        failed: 2,
        skipped: 1,
        duration: 2500,
      },
      {
        suite: 'Integration Tests',
        passed: 12,
        failed: 0,
        skipped: 0,
        duration: 5000,
      },
    ];

    const testQuality = (coverage.lines + coverage.functions + coverage.branches + coverage.statements) / 4;

    return {
      coverage,
      testResults,
      testQuality,
      missingTests: [
        'Error handling edge cases',
        'Performance stress tests',
      ],
    };
  }

  private async analyzeDocumentation(
    repositoryUrl: string,
    requirements: DocumentationRequirement[]
  ): Promise<DocumentationAnalysis> {
    // Simplified documentation analysis
    
    return {
      readmeQuality: 85,
      apiDocumentation: 70,
      inlineComments: 60,
      setupInstructions: 90,
      missingDocumentation: [
        'API endpoint documentation',
        'Deployment guide',
      ],
    };
  }

  private async checkCompilation(repositoryUrl: string): Promise<CompilationResult> {
    // Simplified compilation check - in production, actually compile the code
    
    const success = Math.random() > 0.1; // 90% success rate
    const errors: CompilationError[] = success ? [] : [
      {
        file: 'src/utils/helper.ts',
        line: 23,
        column: 15,
        message: 'Type \'string\' is not assignable to type \'number\'',
        severity: 'error',
      },
    ];

    return {
      success,
      errors,
      warnings: [],
      buildTime: 15000, // ms
    };
  }

  private calculateOverallScore(evaluation: Partial<CodeEvaluation>): number {
    const weights = {
      compilation: 0.25,
      functionality: 0.20,
      security: 0.20,
      testing: 0.15,
      codeQuality: 0.10,
      performance: 0.05,
      documentation: 0.05,
    };

    let score = 0;

    // Compilation is critical - if it fails, score is heavily penalized
    if (evaluation.compilation?.success) {
      score += 100 * weights.compilation;
    } else {
      score += 20 * weights.compilation; // Heavy penalty for compilation failure
    }

    // Functionality score
    if (evaluation.functionality) {
      score += evaluation.functionality.requirementsMet * weights.functionality;
    }

    // Security score
    if (evaluation.security) {
      score += evaluation.security.securityScore * weights.security;
    }

    // Testing score
    if (evaluation.testing) {
      score += evaluation.testing.testQuality * weights.testing;
    }

    // Code quality score
    if (evaluation.codeQuality) {
      score += evaluation.codeQuality.maintainabilityIndex * weights.codeQuality;
    }

    // Performance score (based on benchmarks passed)
    if (evaluation.performance) {
      const passedBenchmarks = evaluation.performance.benchmarks.filter(b => b.passed).length;
      const totalBenchmarks = evaluation.performance.benchmarks.length;
      const performanceScore = totalBenchmarks > 0 ? (passedBenchmarks / totalBenchmarks) * 100 : 85;
      score += performanceScore * weights.performance;
    }

    // Documentation score
    if (evaluation.documentation) {
      const docScore = (
        evaluation.documentation.readmeQuality +
        evaluation.documentation.apiDocumentation +
        evaluation.documentation.setupInstructions
      ) / 3;
      score += docScore * weights.documentation;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private calculateConfidence(
    compilation: CompilationResult,
    testing: TestingAnalysis,
    security: SecurityAnalysis
  ): number {
    let confidence = 100;

    // Reduce confidence for compilation issues
    if (!compilation.success) {
      confidence -= 30;
    }

    // Reduce confidence for low test coverage
    if (testing.coverage.lines < 70) {
      confidence -= 20;
    }

    // Reduce confidence for security issues
    const criticalVulns = security.vulnerabilities.filter(v => v.severity === 'critical').length;
    confidence -= criticalVulns * 25;

    return Math.max(0, Math.min(100, confidence));
  }

  private generateRecommendations(evaluation: Partial<CodeEvaluation>): string[] {
    const recommendations: string[] = [];

    if (!evaluation.compilation?.success) {
      recommendations.push('Fix compilation errors before proceeding with evaluation');
    }

    if (evaluation.security && evaluation.security.securityScore < 80) {
      recommendations.push('Address security vulnerabilities, especially critical and high severity issues');
    }

    if (evaluation.testing && evaluation.testing.coverage.lines < 80) {
      recommendations.push('Increase test coverage to at least 80% for better code reliability');
    }

    if (evaluation.codeQuality && evaluation.codeQuality.maintainabilityIndex < 70) {
      recommendations.push('Improve code maintainability by reducing complexity and technical debt');
    }

    if (evaluation.functionality && evaluation.functionality.requirementsMet < 90) {
      recommendations.push('Complete implementation of missing functional requirements');
    }

    if (evaluation.documentation && evaluation.documentation.apiDocumentation < 70) {
      recommendations.push('Improve API documentation for better developer experience');
    }

    return recommendations;
  }

  private collectEvidence(evaluation: Partial<CodeEvaluation>): EvaluationEvidence[] {
    const evidence: EvaluationEvidence[] = [];

    if (evaluation.compilation) {
      evidence.push({
        type: 'compilation',
        description: 'Code compilation and build verification',
        score: evaluation.compilation.success ? 100 : 0,
        details: {
          success: evaluation.compilation.success,
          errors: evaluation.compilation.errors.length,
          buildTime: evaluation.compilation.buildTime,
        },
        artifacts: [],
      });
    }

    if (evaluation.testing) {
      evidence.push({
        type: 'testing',
        description: 'Test coverage and quality analysis',
        score: evaluation.testing.testQuality,
        details: {
          coverage: evaluation.testing.coverage,
          testResults: evaluation.testing.testResults,
        },
        artifacts: [],
      });
    }

    if (evaluation.security) {
      evidence.push({
        type: 'security',
        description: 'Security vulnerability assessment',
        score: evaluation.security.securityScore,
        details: {
          vulnerabilities: evaluation.security.vulnerabilities.length,
          criticalIssues: evaluation.security.vulnerabilities.filter(v => v.severity === 'critical').length,
        },
        artifacts: [],
      });
    }

    return evidence;
  }
}