/**
 * Vera Protocol - Agent Orchestrator
 * Manages multiple evaluation agents and aggregates results
 */

import { CodeEvaluationAgent, CodeRequirement, CodeEvaluation } from './code-evaluation-agent.js';
import { DocumentEvaluationAgent, DocumentRequirement, DocumentEvaluation } from './document-evaluation-agent.js';
import { EvaluationAgent, EvaluationResult, EvaluationEvidence } from '../shared/types.js';

export interface ProjectRequirements {
  workTypes: WorkType[];
  code?: CodeRequirement;
  document?: DocumentRequirement;
  design?: DesignRequirement;
  presentation?: PresentationRequirement;
  weights?: EvaluationWeights;
}

export interface DesignRequirement {
  type: 'logo' | 'website' | 'app' | 'print' | 'branding';
  dimensions: { width: number; height: number };
  colorPalette: string[];
  fonts: string[];
  style: string;
  target: string;
  brandGuidelines?: BrandGuidelines;
  accessibility: boolean;
}

export interface BrandGuidelines {
  primaryColors: string[];
  secondaryColors: string[];
  primaryFont: string;
  secondaryFont: string;
  logoSpecs: any;
  spacing: any;
}

export interface PresentationRequirement {
  type: 'business' | 'academic' | 'training' | 'pitch';
  slideCount: number;
  duration: number;
  audience: string;
  style: string;
  sections: string[];
  interactivity: boolean;
}

export interface EvaluationWeights {
  code?: number;
  document?: number;
  design?: number;
  presentation?: number;
}

export enum WorkType {
  SOFTWARE_DEVELOPMENT = 'software_development',
  DOCUMENT_CREATION = 'document_creation',
  DESIGN_WORK = 'design_work',
  PRESENTATION = 'presentation',
  DATA_ANALYSIS = 'data_analysis',
  CONTENT_CREATION = 'content_creation'
}

export interface AggregatedEvaluation {
  overallScore: number;
  confidence: number;
  workTypes: WorkType[];
  evaluations: Map<WorkType, EvaluationResult>;
  aggregatedEvidence: EvaluationEvidence[];
  recommendations: string[];
  technicalScore: number;
  subjectiveScore: number;
  timestamp: string;
}

export class AgentOrchestrator {
  private codeAgent: CodeEvaluationAgent;
  private documentAgent: DocumentEvaluationAgent;
  // Note: Design and Presentation agents would be implemented similarly
  
  constructor(githubToken: string) {
    this.codeAgent = new CodeEvaluationAgent(githubToken);
    this.documentAgent = new DocumentEvaluationAgent();
  }

  async evaluateProject(
    workArtifacts: Map<WorkType, any[]>,
    requirements: ProjectRequirements,
    context?: any
  ): Promise<AggregatedEvaluation> {
    console.log('🎯 Starting multi-agent project evaluation...');
    console.log('Work types:', requirements.workTypes);

    const evaluations = new Map<WorkType, EvaluationResult>();
    const evaluationPromises: Promise<void>[] = [];

    // Route work artifacts to appropriate agents
    for (const workType of requirements.workTypes) {
      const artifacts = workArtifacts.get(workType);
      if (!artifacts || artifacts.length === 0) {
        console.warn(`No artifacts found for work type: ${workType}`);
        continue;
      }

      const evaluationPromise = this.evaluateWorkType(
        workType,
        artifacts,
        requirements,
        context
      ).then(evaluation => {
        evaluations.set(workType, evaluation);
      }).catch(error => {
        console.error(`Error evaluating ${workType}:`, error);
        // Create a failed evaluation result
        evaluations.set(workType, {
          agentType: workType,
          overallScore: 0,
          confidence: 0,
          recommendations: [`Failed to evaluate ${workType}: ${error.message}`],
          evidence: [],
          timestamp: new Date().toISOString(),
        });
      });

      evaluationPromises.push(evaluationPromise);
    }

    // Wait for all evaluations to complete
    await Promise.all(evaluationPromises);

    // Aggregate results
    const aggregatedResult = this.aggregateEvaluations(
      evaluations,
      requirements.weights || this.getDefaultWeights(requirements.workTypes)
    );

    console.log('✅ Multi-agent evaluation completed:', {
      overallScore: aggregatedResult.overallScore,
      technicalScore: aggregatedResult.technicalScore,
      subjectiveScore: aggregatedResult.subjectiveScore,
      workTypes: aggregatedResult.workTypes,
    });

    return aggregatedResult;
  }

  private async evaluateWorkType(
    workType: WorkType,
    artifacts: any[],
    requirements: ProjectRequirements,
    context?: any
  ): Promise<EvaluationResult> {
    console.log(`🔍 Evaluating ${workType}...`);

    switch (workType) {
      case WorkType.SOFTWARE_DEVELOPMENT:
        if (!requirements.code) {
          throw new Error('Code requirements not provided for software development evaluation');
        }
        return await this.codeAgent.evaluate(artifacts, requirements.code, context);

      case WorkType.DOCUMENT_CREATION:
        if (!requirements.document) {
          throw new Error('Document requirements not provided for document evaluation');
        }
        return await this.documentAgent.evaluate(artifacts, requirements.document, context);

      case WorkType.DESIGN_WORK:
        // Design agent would be implemented here
        return this.createMockEvaluation(workType, 'Design evaluation not yet implemented');

      case WorkType.PRESENTATION:
        // Presentation agent would be implemented here
        return this.createMockEvaluation(workType, 'Presentation evaluation not yet implemented');

      case WorkType.DATA_ANALYSIS:
        // Data analysis agent would be implemented here
        return this.createMockEvaluation(workType, 'Data analysis evaluation not yet implemented');

      case WorkType.CONTENT_CREATION:
        // Content creation agent would be implemented here
        return this.createMockEvaluation(workType, 'Content creation evaluation not yet implemented');

      default:
        throw new Error(`Unsupported work type: ${workType}`);
    }
  }

  private createMockEvaluation(workType: WorkType, message: string): EvaluationResult {
    return {
      agentType: workType,
      overallScore: 75, // Placeholder score
      confidence: 50,
      recommendations: [message],
      evidence: [{
        type: 'placeholder',
        description: message,
        score: 75,
        details: { implemented: false },
        artifacts: [],
      }],
      timestamp: new Date().toISOString(),
    };
  }

  private aggregateEvaluations(
    evaluations: Map<WorkType, EvaluationResult>,
    weights: EvaluationWeights
  ): AggregatedEvaluation {
    console.log('📊 Aggregating evaluation results...');

    const workTypes = Array.from(evaluations.keys());
    const totalWeight = this.calculateTotalWeight(weights, workTypes);
    
    let weightedScore = 0;
    let weightedConfidence = 0;
    const allRecommendations: string[] = [];
    const allEvidence: EvaluationEvidence[] = [];

    // Calculate weighted scores
    for (const [workType, evaluation] of evaluations) {
      const weight = this.getWeightForWorkType(workType, weights) / totalWeight;
      
      weightedScore += evaluation.overallScore * weight;
      weightedConfidence += evaluation.confidence * weight;
      
      // Collect recommendations with work type prefix
      evaluation.recommendations.forEach(rec => {
        allRecommendations.push(`[${workType}] ${rec}`);
      });
      
      // Collect evidence
      allEvidence.push(...evaluation.evidence);
    }

    // Calculate technical vs subjective scores
    const { technicalScore, subjectiveScore } = this.calculateTechnicalSubjectiveScores(
      evaluations,
      weights,
      totalWeight
    );

    // Generate aggregated recommendations
    const aggregatedRecommendations = this.generateAggregatedRecommendations(
      evaluations,
      allRecommendations
    );

    return {
      overallScore: Math.round(weightedScore),
      confidence: Math.round(weightedConfidence),
      workTypes,
      evaluations,
      aggregatedEvidence: allEvidence,
      recommendations: aggregatedRecommendations,
      technicalScore: Math.round(technicalScore),
      subjectiveScore: Math.round(subjectiveScore),
      timestamp: new Date().toISOString(),
    };
  }

  private calculateTechnicalSubjectiveScores(
    evaluations: Map<WorkType, EvaluationResult>,
    weights: EvaluationWeights,
    totalWeight: number
  ): { technicalScore: number; subjectiveScore: number } {
    let technicalScore = 0;
    let subjectiveScore = 0;

    for (const [workType, evaluation] of evaluations) {
      const weight = this.getWeightForWorkType(workType, weights) / totalWeight;
      
      // Determine technical vs subjective split based on work type
      const { technical, subjective } = this.getTechnicalSubjectiveSplit(workType, evaluation);
      
      technicalScore += technical * weight;
      subjectiveScore += subjective * weight;
    }

    return { technicalScore, subjectiveScore };
  }

  private getTechnicalSubjectiveSplit(
    workType: WorkType,
    evaluation: EvaluationResult
  ): { technical: number; subjective: number } {
    // Apply 80/20 technical/subjective split as per Vera Protocol requirements
    const technicalWeight = 0.8;
    const subjectiveWeight = 0.2;

    switch (workType) {
      case WorkType.SOFTWARE_DEVELOPMENT:
        // Code is highly technical
        return {
          technical: evaluation.overallScore * technicalWeight,
          subjective: evaluation.overallScore * subjectiveWeight,
        };

      case WorkType.DOCUMENT_CREATION:
        // Documents have both technical (grammar, structure) and subjective (style) elements
        return {
          technical: evaluation.overallScore * technicalWeight,
          subjective: evaluation.overallScore * subjectiveWeight,
        };

      case WorkType.DESIGN_WORK:
        // Design has technical specs but more subjective elements
        return {
          technical: evaluation.overallScore * 0.6, // Less technical weight for design
          subjective: evaluation.overallScore * 0.4, // More subjective weight
        };

      case WorkType.PRESENTATION:
        // Presentations are more subjective
        return {
          technical: evaluation.overallScore * 0.5,
          subjective: evaluation.overallScore * 0.5,
        };

      default:
        // Default 80/20 split
        return {
          technical: evaluation.overallScore * technicalWeight,
          subjective: evaluation.overallScore * subjectiveWeight,
        };
    }
  }

  private generateAggregatedRecommendations(
    evaluations: Map<WorkType, EvaluationResult>,
    allRecommendations: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Add high-priority recommendations first
    const lowScoreEvaluations = Array.from(evaluations.entries())
      .filter(([_, evaluation]) => evaluation.overallScore < 70)
      .sort(([_, a], [__, b]) => a.overallScore - b.overallScore);

    if (lowScoreEvaluations.length > 0) {
      recommendations.push(
        `Priority: Address issues in ${lowScoreEvaluations.map(([type, _]) => type).join(', ')} - these have the lowest scores`
      );
    }

    // Add confidence-based recommendations
    const lowConfidenceEvaluations = Array.from(evaluations.entries())
      .filter(([_, evaluation]) => evaluation.confidence < 60);

    if (lowConfidenceEvaluations.length > 0) {
      recommendations.push(
        `Review: ${lowConfidenceEvaluations.map(([type, _]) => type).join(', ')} evaluations have low confidence - manual review recommended`
      );
    }

    // Add specific recommendations (limit to top 5 to avoid overwhelming)
    const specificRecommendations = allRecommendations
      .filter(rec => !rec.includes('not yet implemented'))
      .slice(0, 5);
    
    recommendations.push(...specificRecommendations);

    // Add overall project recommendations
    const overallScore = this.calculateOverallScore(evaluations);
    if (overallScore >= 90) {
      recommendations.push('Excellent work! Consider minor optimizations for perfection');
    } else if (overallScore >= 80) {
      recommendations.push('Good quality work with room for improvement in highlighted areas');
    } else if (overallScore >= 70) {
      recommendations.push('Acceptable quality but significant improvements needed');
    } else {
      recommendations.push('Major improvements required before milestone approval');
    }

    return recommendations;
  }

  private calculateOverallScore(evaluations: Map<WorkType, EvaluationResult>): number {
    if (evaluations.size === 0) return 0;
    
    const scores = Array.from(evaluations.values()).map(evaluation => evaluation.overallScore);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private getDefaultWeights(workTypes: WorkType[]): EvaluationWeights {
    const weights: EvaluationWeights = {};
    const equalWeight = 1 / workTypes.length;

    workTypes.forEach(workType => {
      switch (workType) {
        case WorkType.SOFTWARE_DEVELOPMENT:
          weights.code = equalWeight;
          break;
        case WorkType.DOCUMENT_CREATION:
          weights.document = equalWeight;
          break;
        case WorkType.DESIGN_WORK:
          weights.design = equalWeight;
          break;
        case WorkType.PRESENTATION:
          weights.presentation = equalWeight;
          break;
      }
    });

    return weights;
  }

  private calculateTotalWeight(weights: EvaluationWeights, workTypes: WorkType[]): number {
    let total = 0;
    
    workTypes.forEach(workType => {
      total += this.getWeightForWorkType(workType, weights);
    });
    
    return total || 1; // Avoid division by zero
  }

  private getWeightForWorkType(workType: WorkType, weights: EvaluationWeights): number {
    switch (workType) {
      case WorkType.SOFTWARE_DEVELOPMENT:
        return weights.code || 0;
      case WorkType.DOCUMENT_CREATION:
        return weights.document || 0;
      case WorkType.DESIGN_WORK:
        return weights.design || 0;
      case WorkType.PRESENTATION:
        return weights.presentation || 0;
      default:
        return 0;
    }
  }

  // Utility methods for external use
  async evaluateCodeOnly(
    repositoryUrl: string,
    requirements: CodeRequirement,
    context?: any
  ): Promise<CodeEvaluation> {
    return await this.codeAgent.evaluate([repositoryUrl], requirements, context);
  }

  async evaluateDocumentOnly(
    documentContent: string,
    requirements: DocumentRequirement,
    context?: any
  ): Promise<DocumentEvaluation> {
    return await this.documentAgent.evaluate([documentContent], requirements, context);
  }

  // Method to check if all required agents are available
  getAvailableWorkTypes(): WorkType[] {
    return [
      WorkType.SOFTWARE_DEVELOPMENT,
      WorkType.DOCUMENT_CREATION,
      // WorkType.DESIGN_WORK, // Not yet implemented
      // WorkType.PRESENTATION, // Not yet implemented
      // WorkType.DATA_ANALYSIS, // Not yet implemented
      // WorkType.CONTENT_CREATION, // Not yet implemented
    ];
  }

  // Method to validate requirements before evaluation
  validateRequirements(requirements: ProjectRequirements): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!requirements.workTypes || requirements.workTypes.length === 0) {
      errors.push('At least one work type must be specified');
    }

    const availableTypes = this.getAvailableWorkTypes();
    const unsupportedTypes = requirements.workTypes.filter(type => !availableTypes.includes(type));
    
    if (unsupportedTypes.length > 0) {
      errors.push(`Unsupported work types: ${unsupportedTypes.join(', ')}`);
    }

    // Validate specific requirements
    if (requirements.workTypes.includes(WorkType.SOFTWARE_DEVELOPMENT) && !requirements.code) {
      errors.push('Code requirements must be provided for software development evaluation');
    }

    if (requirements.workTypes.includes(WorkType.DOCUMENT_CREATION) && !requirements.document) {
      errors.push('Document requirements must be provided for document evaluation');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}