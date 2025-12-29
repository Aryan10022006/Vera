/**
 * Vera Protocol - Standalone Arbitration Agent
 * Implements neutral arbitration logic from arbitration.md
 */

import { RepositoryAnalysis } from '../github-integration/github-agent.js';

export interface ArbitrationResult {
  approved: boolean;
  technicalScore: number;
  subjectiveScore: number;
  reasoning: string;
  evidence: string[];
  classification: 'technical_pass' | 'technical_fail' | 'scope_creep' | 'subjective_dispute';
  timestamp: number;
}

export interface TechnicalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  weight: number;
  type: 'technical';
}

export interface SubjectiveRequirement {
  id: string;
  description: string;
  weight: number;
  type: 'subjective';
}

export class ArbitrationAgent {
  /**
   * Apply neutral arbitration logic to repository analysis
   * Implements the Neutral Auditor Persona from arbitration.md
   */
  applyNeutralArbitration(
    analysis: RepositoryAnalysis,
    technicalRequirements: TechnicalRequirement[],
    subjectiveRequirements: SubjectiveRequirement[]
  ): ArbitrationResult {
    console.log('⚖️ NEUTRAL ARBITRATOR: Starting evidence-based assessment');
    
    // Technical Soundness Assessment (80% weight)
    const technicalScore = this.assessTechnicalSoundness(analysis, technicalRequirements);
    
    // Subjective Elements Assessment (20% weight)
    const subjectiveScore = this.assessSubjectiveElements(analysis, subjectiveRequirements);
    
    // Apply 80% threshold for technical approval
    const technicalPassed = technicalScore >= 80;
    
    // Generate transparent reasoning
    const reasoning = this.generateTransparentReasoning(analysis, technicalScore, subjectiveScore);
    
    // Gather evidence for decision
    const evidence = this.gatherEvidence(analysis, technicalRequirements);
    
    // Classify the result
    const classification = this.classifyResult(technicalPassed, technicalScore);
    
    return {
      approved: technicalPassed,
      technicalScore,
      subjectiveScore,
      reasoning,
      evidence,
      classification,
      timestamp: Date.now()
    };
  }

  /**
   * Handle scope creep disputes
   * Implements Scope Creep Decision Tree from arbitration.md
   */
  handleScopeCreep(
    originalRequirements: TechnicalRequirement[],
    newRequest: string,
    estimatedEffort: number
  ): {
    classification: 'in_scope' | 'scope_expansion' | 'scope_change';
    resolution: string;
    approved: boolean;
  } {
    console.log('🔍 SCOPE CREEP ANALYSIS: Comparing against original requirements');
    
    // Analyze new request against original requirements
    const alignsWithOriginal = this.analyzeRequestAlignment(originalRequirements, newRequest);
    
    if (alignsWithOriginal) {
      return {
        classification: 'in_scope',
        resolution: 'Request aligns with original requirements. Proceed normally.',
        approved: true
      };
    }
    
    // Check if it's expansion or change
    const isExpansion = this.isRequestExpansion(originalRequirements, newRequest);
    
    if (isExpansion) {
      if (estimatedEffort < 5) {
        return {
          classification: 'scope_expansion',
          resolution: 'Minor clarification (<5% effort). Auto-approved within original intent.',
          approved: true
        };
      } else {
        return {
          classification: 'scope_expansion',
          resolution: 'Significant change (>5% effort). Pause milestone, require new agreement.',
          approved: false
        };
      }
    }
    
    return {
      classification: 'scope_change',
      resolution: 'Request modifies existing requirements. Require mutual agreement.',
      approved: false
    };
  }

  /**
   * Filter client complaints
   * Implements Client Complaint Filtering from arbitration.md
   */
  filterClientComplaint(
    complaint: string,
    originalRequirements: TechnicalRequirement[]
  ): {
    type: 'valid_concern' | 'invalid_complaint' | 'subjective_dispute';
    shouldProcess: boolean;
    reasoning: string;
  } {
    console.log('🔍 COMPLAINT FILTER: Analyzing client complaint');
    
    // Check if complaint relates to technical non-compliance
    const isTechnicalCompliance = this.isTechnicalComplianceIssue(complaint, originalRequirements);
    
    if (isTechnicalCompliance) {
      return {
        type: 'valid_concern',
        shouldProcess: true,
        reasoning: 'Technical non-compliance with documented requirements. Valid concern.'
      };
    }
    
    // Check if it's a style preference not in original requirements
    const isStylePreference = this.isStylePreference(complaint);
    
    if (isStylePreference) {
      return {
        type: 'invalid_complaint',
        shouldProcess: false,
        reasoning: 'Style preference not specified in original requirements. Invalid complaint.'
      };
    }
    
    return {
      type: 'subjective_dispute',
      shouldProcess: true,
      reasoning: 'Subjective dispute. Route to 20% subjective variance buffer for human review.'
    };
  }

  /**
   * Calculate pro-rata release amounts
   * Implements Pro-Rata Release Protocol from arbitration.md
   */
  calculateProRataRelease(
    totalAmount: bigint,
    technicalCompletion: number,
    subjectiveCompletion: number
  ): {
    technicalRelease: bigint;
    subjectiveRelease: bigint;
    totalRelease: bigint;
    reasoning: string;
  } {
    // Technical Completion % = (Completed Objectives / Total Objectives) * 80%
    const technicalPercentage = (technicalCompletion / 100) * 80;
    
    // Subjective Completion % = (Agreed Subjective Elements / Total Subjective) * 20%
    const subjectivePercentage = (subjectiveCompletion / 100) * 20;
    
    // Calculate release amounts
    const technicalRelease = (totalAmount * BigInt(Math.floor(technicalPercentage))) / BigInt(100);
    const subjectiveRelease = (totalAmount * BigInt(Math.floor(subjectivePercentage))) / BigInt(100);
    const totalRelease = technicalRelease + subjectiveRelease;
    
    const reasoning = `Pro-rata calculation: Technical ${technicalPercentage.toFixed(1)}% + Subjective ${subjectivePercentage.toFixed(1)}% = ${(technicalPercentage + subjectivePercentage).toFixed(1)}% total release`;
    
    return {
      technicalRelease,
      subjectiveRelease,
      totalRelease,
      reasoning
    };
  }

  // Private helper methods implementing neutral arbitration logic

  private assessTechnicalSoundness(
    analysis: RepositoryAnalysis,
    requirements: TechnicalRequirement[]
  ): number {
    let totalScore = 0;
    let maxScore = 0;
    
    // Code Quality Assessment (25% weight)
    const codeQualityScore = this.scoreCodeQuality(analysis);
    totalScore += codeQualityScore * 0.25;
    maxScore += 100 * 0.25;
    
    // Functionality Assessment (35% weight)
    const functionalityScore = this.scoreFunctionality(analysis, requirements);
    totalScore += functionalityScore * 0.35;
    maxScore += 100 * 0.35;
    
    // Security Assessment (25% weight)
    const securityScore = this.scoreSecurity(analysis);
    totalScore += securityScore * 0.25;
    maxScore += 100 * 0.25;
    
    // Documentation Assessment (15% weight)
    const documentationScore = this.scoreDocumentation(analysis);
    totalScore += documentationScore * 0.15;
    maxScore += 100 * 0.15;
    
    return Math.round((totalScore / maxScore) * 100);
  }

  private assessSubjectiveElements(
    analysis: RepositoryAnalysis,
    requirements: SubjectiveRequirement[]
  ): number {
    // Subjective elements require human review
    // Return neutral score for AI assessment
    return 75; // Neutral baseline for subjective elements
  }

  private scoreCodeQuality(analysis: RepositoryAnalysis): number {
    let score = 0;
    
    // Language diversity and complexity
    if (analysis.codeQuality.complexity < 2) score += 30;
    else if (analysis.codeQuality.complexity < 3) score += 20;
    else score += 10;
    
    // File organization
    if (analysis.codeQuality.files > 5) score += 20;
    else if (analysis.codeQuality.files > 2) score += 15;
    else score += 10;
    
    // Lines of code (reasonable size)
    if (analysis.codeQuality.linesOfCode > 100) score += 30;
    else if (analysis.codeQuality.linesOfCode > 50) score += 20;
    else score += 10;
    
    // TypeScript usage bonus
    if (analysis.codeQuality.languages.TypeScript) score += 20;
    else if (analysis.codeQuality.languages.JavaScript) score += 15;
    
    return Math.min(score, 100);
  }

  private scoreFunctionality(analysis: RepositoryAnalysis, requirements: TechnicalRequirement[]): number {
    let score = 0;
    
    // Test presence and quality
    if (analysis.tests.hasTests) {
      score += 40;
      if (analysis.tests.testFiles.length > 3) score += 10;
    }
    
    // Recent activity (last commit)
    const lastCommitDate = new Date(analysis.lastCommit.date);
    const daysSinceLastCommit = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastCommit < 1) score += 30;
    else if (daysSinceLastCommit < 7) score += 20;
    else score += 10;
    
    // Commit message quality
    if (analysis.lastCommit.message.length > 20) score += 20;
    else score += 10;
    
    return Math.min(score, 100);
  }

  private scoreSecurity(analysis: RepositoryAnalysis): number {
    let score = 100; // Start with perfect score
    
    // Deduct for vulnerabilities
    score -= analysis.security.vulnerabilities.length * 20;
    
    // Deduct for dependency issues
    score -= analysis.security.dependencies.length * 10;
    
    // Deduct for exposed secrets
    score -= analysis.security.secrets.length * 30;
    
    return Math.max(score, 0);
  }

  private scoreDocumentation(analysis: RepositoryAnalysis): number {
    let score = 0;
    
    if (analysis.documentation.hasReadme) score += 50;
    if (analysis.documentation.hasApiDocs) score += 30;
    if (analysis.documentation.hasDeploymentGuide) score += 20;
    
    return Math.min(score, 100);
  }

  private generateTransparentReasoning(
    analysis: RepositoryAnalysis,
    technicalScore: number,
    subjectiveScore: number
  ): string {
    const reasoning: string[] = [];
    
    reasoning.push('=== NEUTRAL ARBITRATION REPORT ===');
    reasoning.push(`Technical Score: ${technicalScore}/100 (80% weight)`);
    reasoning.push(`Subjective Score: ${subjectiveScore}/100 (20% weight)`);
    reasoning.push('');
    
    reasoning.push('EVIDENCE-BASED ASSESSMENT:');
    
    // Code Quality Evidence
    reasoning.push(`• Code Quality: ${analysis.codeQuality.files} files, ${analysis.codeQuality.linesOfCode} lines`);
    reasoning.push(`• Complexity Score: ${analysis.codeQuality.complexity.toFixed(2)}`);
    
    // Testing Evidence
    if (analysis.tests.hasTests) {
      reasoning.push(`• Tests: ✅ ${analysis.tests.testFiles.length} test files found`);
    } else {
      reasoning.push('• Tests: ❌ No tests detected');
    }
    
    // Documentation Evidence
    if (analysis.documentation.hasReadme) {
      reasoning.push('• Documentation: ✅ README.md present');
    } else {
      reasoning.push('• Documentation: ❌ Missing README.md');
    }
    
    // Security Evidence
    if (analysis.security.vulnerabilities.length === 0) {
      reasoning.push('• Security: ✅ No vulnerabilities detected');
    } else {
      reasoning.push(`• Security: ❌ ${analysis.security.vulnerabilities.length} vulnerabilities found`);
    }
    
    reasoning.push('');
    reasoning.push('NEUTRAL AUDITOR DECISION:');
    reasoning.push(technicalScore >= 80 ? '✅ Technical requirements met (≥80%)' : '❌ Technical requirements not met (<80%)');
    reasoning.push('');
    reasoning.push('This assessment is emotionally detached, evidence-driven, and applies consistent logic regardless of project size or parties involved.');
    
    return reasoning.join('\n');
  }

  private gatherEvidence(analysis: RepositoryAnalysis, requirements: TechnicalRequirement[]): string[] {
    const evidence: string[] = [];
    
    evidence.push(`Repository: ${analysis.owner}/${analysis.repo}`);
    evidence.push(`Last commit: ${analysis.lastCommit.sha.substring(0, 8)} - "${analysis.lastCommit.message}"`);
    evidence.push(`Languages: ${Object.keys(analysis.codeQuality.languages).join(', ')}`);
    
    if (analysis.tests.hasTests) {
      evidence.push(`Tests found: ${analysis.tests.testFiles.join(', ')}`);
    }
    
    if (analysis.documentation.hasReadme) {
      evidence.push('README.md documentation present');
    }
    
    if (analysis.security.vulnerabilities.length === 0) {
      evidence.push('No security vulnerabilities detected');
    }
    
    return evidence;
  }

  private classifyResult(technicalPassed: boolean, technicalScore: number): ArbitrationResult['classification'] {
    if (technicalPassed) {
      return 'technical_pass';
    } else {
      return 'technical_fail';
    }
  }

  private analyzeRequestAlignment(requirements: TechnicalRequirement[], newRequest: string): boolean {
    // Simple keyword matching - in production would use more sophisticated NLP
    const requestLower = newRequest.toLowerCase();
    
    return requirements.some(req => {
      const reqLower = req.description.toLowerCase();
      const keywords = reqLower.split(' ').filter(word => word.length > 3);
      return keywords.some(keyword => requestLower.includes(keyword));
    });
  }

  private isRequestExpansion(requirements: TechnicalRequirement[], newRequest: string): boolean {
    // Check if request adds new functionality vs modifying existing
    const expansionKeywords = ['add', 'new', 'additional', 'extra', 'more', 'also'];
    const requestLower = newRequest.toLowerCase();
    
    return expansionKeywords.some(keyword => requestLower.includes(keyword));
  }

  private isTechnicalComplianceIssue(complaint: string, requirements: TechnicalRequirement[]): boolean {
    const technicalKeywords = ['bug', 'error', 'broken', 'not working', 'fails', 'crash', 'performance'];
    const complaintLower = complaint.toLowerCase();
    
    return technicalKeywords.some(keyword => complaintLower.includes(keyword));
  }

  private isStylePreference(complaint: string): boolean {
    const styleKeywords = ['color', 'design', 'look', 'appearance', 'style', 'font', 'layout', 'ui', 'ux'];
    const complaintLower = complaint.toLowerCase();
    
    return styleKeywords.some(keyword => complaintLower.includes(keyword));
  }
}