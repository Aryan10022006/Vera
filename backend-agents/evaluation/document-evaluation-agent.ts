/**
 * Vera Protocol - Document Evaluation Agent
 * Specialized AI agent for comprehensive document analysis and evaluation
 */

import { EvaluationAgent, EvaluationResult, EvaluationEvidence } from '../shared/types.js';

export interface DocumentRequirement {
  type: 'report' | 'article' | 'technical' | 'creative' | 'academic';
  wordCount: number;
  sections: string[];
  style: string;
  audience: string;
  format: string;
  citations?: boolean;
  originalityThreshold: number;
  readabilityLevel: string;
}

export interface DocumentEvaluation extends EvaluationResult {
  contentQuality: ContentQualityMetrics;
  grammarScore: GrammarAnalysis;
  originalityScore: OriginalityAnalysis;
  formatCompliance: FormatAnalysis;
  readabilityScore: ReadabilityMetrics;
  structureAnalysis: StructureAnalysis;
}

export interface ContentQualityMetrics {
  coherence: number;
  completeness: number;
  accuracy: number;
  relevance: number;
  depth: number;
  clarity: number;
}

export interface GrammarAnalysis {
  score: number;
  errors: GrammarError[];
  suggestions: string[];
  styleIssues: StyleIssue[];
}

export interface GrammarError {
  type: string;
  message: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  context: string;
}

export interface StyleIssue {
  type: string;
  description: string;
  line: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface OriginalityAnalysis {
  score: number;
  plagiarismDetected: boolean;
  sources: PlagiarismSource[];
  uniqueContent: number;
  paraphraseQuality: number;
  citationAccuracy: number;
}

export interface PlagiarismSource {
  url: string;
  title: string;
  similarity: number;
  matchedText: string;
  properlyAttributed: boolean;
}

export interface FormatAnalysis {
  score: number;
  formatType: string;
  structureCompliance: boolean;
  requiredSections: SectionAnalysis[];
  citationFormat: CitationAnalysis;
}

export interface SectionAnalysis {
  name: string;
  present: boolean;
  quality: number;
  wordCount: number;
  completeness: number;
}

export interface CitationAnalysis {
  style: string;
  accuracy: number;
  completeness: number;
  consistency: number;
}

export interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  gunningFogIndex: number;
  smogIndex: number;
  averageSentenceLength: number;
  averageWordsPerSentence: number;
  passiveVoicePercentage: number;
  sentenceVariety: number;
}

export interface StructureAnalysis {
  logicalFlow: number;
  paragraphStructure: number;
  transitionQuality: number;
  introductionQuality: number;
  conclusionQuality: number;
  headingStructure: number;
}

export class DocumentEvaluationAgent implements EvaluationAgent {
  async evaluate(
    workArtifacts: any[],
    requirements: DocumentRequirement,
    context?: any
  ): Promise<DocumentEvaluation> {
    const documentContent = workArtifacts[0]?.content || workArtifacts[0];
    
    if (!documentContent) {
      throw new Error('Document content is required for evaluation');
    }

    console.log('📄 Starting comprehensive document evaluation...');

    // 1. Analyze content quality
    const contentQuality = await this.analyzeContentQuality(documentContent, requirements);
    
    // 2. Perform grammar and style analysis
    const grammarScore = await this.analyzeGrammarAndStyle(documentContent, requirements);
    
    // 3. Check originality and plagiarism
    const originalityScore = await this.analyzeOriginality(documentContent, requirements);
    
    // 4. Validate format compliance
    const formatCompliance = await this.analyzeFormatCompliance(documentContent, requirements);
    
    // 5. Calculate readability metrics
    const readabilityScore = await this.analyzeReadability(documentContent, requirements);
    
    // 6. Analyze document structure
    const structureAnalysis = await this.analyzeStructure(documentContent, requirements);

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      contentQuality,
      grammarScore,
      originalityScore,
      formatCompliance,
      readabilityScore,
      structureAnalysis,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      contentQuality,
      grammarScore,
      originalityScore,
      formatCompliance,
      readabilityScore,
      structureAnalysis,
    });

    // Collect evidence
    const evidence = this.collectEvidence({
      contentQuality,
      grammarScore,
      originalityScore,
      formatCompliance,
      readabilityScore,
      structureAnalysis,
    });

    const evaluation: DocumentEvaluation = {
      agentType: 'document',
      overallScore,
      confidence: this.calculateConfidence(grammarScore, originalityScore, formatCompliance),
      recommendations,
      evidence,
      timestamp: new Date().toISOString(),
      contentQuality,
      grammarScore,
      originalityScore,
      formatCompliance,
      readabilityScore,
      structureAnalysis,
    };

    console.log('✅ Document evaluation completed:', {
      score: overallScore,
      grammar: grammarScore.score,
      originality: originalityScore.score,
      readability: readabilityScore.fleschReadingEase,
    });

    return evaluation;
  }

  private async analyzeContentQuality(content: string, requirements: DocumentRequirement): Promise<ContentQualityMetrics> {
    const wordCount = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    return {
      coherence: this.assessCoherence(content, paragraphs),
      completeness: this.assessCompleteness(wordCount, requirements.wordCount, requirements.sections, content),
      accuracy: this.assessAccuracy(content, requirements),
      relevance: this.assessRelevance(content, requirements),
      depth: this.assessDepth(content, requirements),
      clarity: this.assessClarity(sentences, paragraphs),
    };
  }

  private async analyzeGrammarAndStyle(content: string, requirements: DocumentRequirement): Promise<GrammarAnalysis> {
    const errors: GrammarError[] = [];
    const styleIssues: StyleIssue[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Analyze each sentence for common grammar issues
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length === 0) return;

      // Check for sentence length issues
      if (trimmed.split(/\s+/).length > 30) {
        errors.push({
          type: 'sentence_length',
          message: 'Sentence is too long and may be difficult to read',
          line: index + 1,
          column: 0,
          severity: 'medium',
          suggestion: 'Consider breaking into shorter sentences',
          context: trimmed.substring(0, 100) + '...',
        });
      }

      // Check for passive voice (simplified detection)
      if (/\b(was|were|is|are|been)\s+\w+ed\b/.test(trimmed)) {
        styleIssues.push({
          type: 'passive_voice',
          description: 'Consider using active voice for clarity',
          line: index + 1,
          severity: 'low',
          recommendation: 'Rewrite in active voice when possible',
        });
      }

      // Check for repetitive sentence starters
      const starter = trimmed.split(/\s+/)[0]?.toLowerCase();
      if (starter && ['the', 'this', 'that', 'it'].includes(starter)) {
        const previousStarters = sentences.slice(Math.max(0, index - 2), index)
          .map(s => s.trim().split(/\s+/)[0]?.toLowerCase());
        
        if (previousStarters.includes(starter)) {
          styleIssues.push({
            type: 'repetitive_structure',
            description: 'Repetitive sentence structure detected',
            line: index + 1,
            severity: 'low',
            recommendation: 'Vary sentence beginnings for better flow',
          });
        }
      }
    });

    // Check for common grammar patterns
    this.checkCommonGrammarIssues(content, errors);

    const score = Math.max(0, 100 - (errors.length * 3) - (styleIssues.length * 1));
    
    return {
      score,
      errors,
      suggestions: this.generateGrammarSuggestions(errors, styleIssues),
      styleIssues,
    };
  }

  private async analyzeOriginality(content: string, requirements: DocumentRequirement): Promise<OriginalityAnalysis> {
    // Simplified plagiarism detection - in production, integrate with Turnitin, Copyscape, etc.
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const suspiciousSentences = sentences.filter(s => this.isSuspiciouslyGeneric(s));
    
    const uniqueContent = Math.max(0, 100 - (suspiciousSentences.length / sentences.length) * 100);
    const plagiarismDetected = uniqueContent < requirements.originalityThreshold;

    // Mock plagiarism sources for demonstration
    const sources: PlagiarismSource[] = plagiarismDetected ? [
      {
        url: 'https://example.com/similar-article',
        title: 'Similar Article Found',
        similarity: 15,
        matchedText: suspiciousSentences[0] || 'Sample matched text',
        properlyAttributed: false,
      },
    ] : [];

    return {
      score: uniqueContent,
      plagiarismDetected,
      sources,
      uniqueContent,
      paraphraseQuality: this.assessParaphraseQuality(content),
      citationAccuracy: requirements.citations ? this.assessCitationAccuracy(content) : 100,
    };
  }

  private async analyzeFormatCompliance(content: string, requirements: DocumentRequirement): Promise<FormatAnalysis> {
    const requiredSections = requirements.sections || [];
    const sectionAnalysis: SectionAnalysis[] = [];
    
    requiredSections.forEach((sectionName: string) => {
      const sectionRegex = new RegExp(`#{1,6}\\s*${sectionName}|\\b${sectionName}\\b`, 'i');
      const present = sectionRegex.test(content);
      
      sectionAnalysis.push({
        name: sectionName,
        present,
        quality: present ? this.assessSectionQuality(content, sectionName) : 0,
        wordCount: present ? this.countWordsInSection(content, sectionName) : 0,
        completeness: present ? this.assessSectionCompleteness(content, sectionName, requirements) : 0,
      });
    });

    const structureCompliance = sectionAnalysis.length === 0 || sectionAnalysis.every(s => s.present);
    const score = structureCompliance ? 100 : (sectionAnalysis.filter(s => s.present).length / sectionAnalysis.length) * 100;

    const citationFormat = requirements.citations ? this.analyzeCitationFormat(content) : {
      style: 'none',
      accuracy: 100,
      completeness: 100,
      consistency: 100,
    };

    return {
      score,
      formatType: requirements.type,
      structureCompliance,
      requiredSections: sectionAnalysis,
      citationFormat,
    };
  }

  private async analyzeReadability(content: string, requirements: DocumentRequirement): Promise<ReadabilityMetrics> {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const syllables = this.countSyllables(content);
    
    const averageWordsPerSentence = words.length / sentences.length;
    const averageSyllablesPerWord = syllables / words.length;
    
    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = 0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;
    
    // Flesch Reading Ease
    const fleschReadingEase = 206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord;
    
    // Gunning Fog Index
    const complexWords = this.countComplexWords(content);
    const gunningFogIndex = 0.4 * (averageWordsPerSentence + 100 * (complexWords / words.length));
    
    // SMOG Index (simplified)
    const smogIndex = 1.0430 * Math.sqrt(complexWords * (30 / sentences.length)) + 3.1291;
    
    // Passive voice percentage
    const passiveVoiceCount = (content.match(/\b(was|were|is|are|been)\s+\w+ed\b/g) || []).length;
    const passiveVoicePercentage = (passiveVoiceCount / sentences.length) * 100;
    
    // Sentence variety
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const sentenceVariety = this.calculateVariety(sentenceLengths);

    return {
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      gunningFogIndex: Math.round(gunningFogIndex * 10) / 10,
      smogIndex: Math.round(smogIndex * 10) / 10,
      averageSentenceLength: Math.round(averageWordsPerSentence * 10) / 10,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      passiveVoicePercentage: Math.round(passiveVoicePercentage * 10) / 10,
      sentenceVariety: Math.round(sentenceVariety * 10) / 10,
    };
  }

  private async analyzeStructure(content: string, requirements: DocumentRequirement): Promise<StructureAnalysis> {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

    return {
      logicalFlow: this.assessLogicalFlow(paragraphs),
      paragraphStructure: this.assessParagraphStructure(paragraphs),
      transitionQuality: this.assessTransitionQuality(paragraphs),
      introductionQuality: this.assessIntroductionQuality(paragraphs[0] || ''),
      conclusionQuality: this.assessConclusionQuality(paragraphs[paragraphs.length - 1] || ''),
      headingStructure: this.assessHeadingStructure(content),
    };
  }

  // Helper methods for content quality assessment
  private assessCoherence(content: string, paragraphs: string[]): number {
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'consequently', 'additionally', 'similarly', 'in contrast', 'on the other hand'];
    const transitionCount = transitionWords.reduce((count, word) => 
      count + (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0);
    
    const coherenceScore = Math.min(100, 60 + (transitionCount / paragraphs.length) * 40);
    return Math.round(coherenceScore);
  }

  private assessCompleteness(wordCount: number, targetWordCount: number, sections: string[], content: string): number {
    let score = 0;
    
    // Word count completeness (40% weight)
    if (wordCount >= targetWordCount * 0.9 && wordCount <= targetWordCount * 1.2) {
      score += 40;
    } else if (wordCount >= targetWordCount * 0.8) {
      score += 30;
    } else if (wordCount >= targetWordCount * 0.7) {
      score += 20;
    } else {
      score += Math.max(0, (wordCount / targetWordCount) * 40);
    }
    
    // Section completeness (60% weight)
    if (sections.length > 0) {
      const presentSections = sections.filter(section => 
        new RegExp(`\\b${section}\\b`, 'i').test(content)).length;
      score += (presentSections / sections.length) * 60;
    } else {
      score += 60; // No specific sections required
    }
    
    return Math.round(score);
  }

  private assessAccuracy(content: string, requirements: DocumentRequirement): number {
    // Simplified accuracy assessment - in production, use fact-checking APIs
    // Check for common accuracy indicators
    const factualIndicators = ['according to', 'research shows', 'studies indicate', 'data reveals'];
    const indicatorCount = factualIndicators.reduce((count, indicator) => 
      count + (content.toLowerCase().match(new RegExp(`\\b${indicator}\\b`, 'g')) || []).length, 0);
    
    return Math.min(100, 70 + indicatorCount * 5);
  }

  private assessRelevance(content: string, requirements: DocumentRequirement): number {
    // Check if content matches the intended audience and purpose
    const audienceKeywords = this.getAudienceKeywords(requirements.audience);
    const typeKeywords = this.getTypeKeywords(requirements.type);
    
    const audienceMatches = audienceKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())).length;
    const typeMatches = typeKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())).length;
    
    const relevanceScore = Math.min(100, 60 + (audienceMatches * 5) + (typeMatches * 5));
    return Math.round(relevanceScore);
  }

  private assessDepth(content: string, requirements: DocumentRequirement): number {
    const wordCount = content.split(/\s+/).length;
    const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
    const vocabularyRichness = uniqueWords / wordCount;
    
    // Assess depth based on vocabulary richness and content length
    let depthScore = vocabularyRichness * 100;
    
    // Adjust based on document type
    if (requirements.type === 'technical' || requirements.type === 'academic') {
      depthScore += wordCount > 2000 ? 20 : 0;
    }
    
    return Math.min(100, Math.round(depthScore));
  }

  private assessClarity(sentences: string[], paragraphs: string[]): number {
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;
    
    let clarityScore = 100;
    
    // Penalize overly long sentences
    if (avgSentenceLength > 25) clarityScore -= 15;
    else if (avgSentenceLength > 20) clarityScore -= 5;
    
    // Penalize overly long paragraphs
    if (avgParagraphLength > 150) clarityScore -= 10;
    else if (avgParagraphLength > 100) clarityScore -= 5;
    
    return Math.max(0, clarityScore);
  }

  // Helper methods for grammar analysis
  private checkCommonGrammarIssues(content: string, errors: GrammarError[]): void {
    // Check for common grammar issues
    const commonIssues = [
      {
        pattern: /\bits\s+/g,
        type: 'possessive_its',
        message: 'Check if "its" should be "it\'s"',
        severity: 'medium' as const,
      },
      {
        pattern: /\byour\s+/g,
        type: 'possessive_your',
        message: 'Check if "your" should be "you\'re"',
        severity: 'medium' as const,
      },
      {
        pattern: /\bthere\s+/g,
        type: 'there_their_theyre',
        message: 'Check if "there" should be "their" or "they\'re"',
        severity: 'medium' as const,
      },
    ];

    commonIssues.forEach(issue => {
      const matches = content.matchAll(issue.pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          errors.push({
            type: issue.type,
            message: issue.message,
            line: lineNumber,
            column: match.index - content.lastIndexOf('\n', match.index - 1) - 1,
            severity: issue.severity,
            suggestion: 'Review context and correct if necessary',
            context: content.substring(Math.max(0, match.index - 50), match.index + 50),
          });
        }
      }
    });
  }

  private generateGrammarSuggestions(errors: GrammarError[], styleIssues: StyleIssue[]): string[] {
    const suggestions = new Set<string>();
    
    errors.forEach(error => {
      suggestions.add(error.suggestion);
    });
    
    styleIssues.forEach(issue => {
      suggestions.add(issue.recommendation);
    });
    
    // Add general suggestions based on error patterns
    if (errors.some(e => e.type === 'sentence_length')) {
      suggestions.add('Break long sentences into shorter, more readable ones');
    }
    
    if (styleIssues.some(i => i.type === 'passive_voice')) {
      suggestions.add('Use active voice to make writing more engaging and direct');
    }
    
    return Array.from(suggestions);
  }

  // Helper methods for readability
  private countSyllables(text: string): number {
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiou]{2,}/g, 'a')
      .replace(/[^aeiou]/g, '')
      .length || 1;
  }

  private countComplexWords(text: string): number {
    const words = text.split(/\s+/);
    return words.filter(word => this.countSyllables(word) >= 3).length;
  }

  private calculateVariety(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Normalize to 0-100 scale
    return Math.min(100, (standardDeviation / mean) * 100);
  }

  // Helper methods for structure analysis
  private assessLogicalFlow(paragraphs: string[]): number {
    // Simplified logical flow assessment
    let flowScore = 85; // Base score
    
    // Check for topic sentences (simplified)
    const topicSentences = paragraphs.filter(p => {
      const firstSentence = p.split(/[.!?]/)[0];
      return firstSentence && firstSentence.length > 20;
    }).length;
    
    flowScore += (topicSentences / paragraphs.length) * 15;
    
    return Math.min(100, Math.round(flowScore));
  }

  private assessParagraphStructure(paragraphs: string[]): number {
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;
    
    let structureScore = 100;
    
    // Ideal paragraph length is 50-150 words
    if (avgParagraphLength < 30 || avgParagraphLength > 200) {
      structureScore -= 20;
    } else if (avgParagraphLength < 40 || avgParagraphLength > 150) {
      structureScore -= 10;
    }
    
    return Math.max(0, structureScore);
  }

  private assessTransitionQuality(paragraphs: string[]): number {
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'consequently', 'additionally', 'similarly', 'in contrast', 'on the other hand', 'meanwhile', 'subsequently'];
    
    let transitionCount = 0;
    paragraphs.forEach(paragraph => {
      const firstSentence = paragraph.split(/[.!?]/)[0].toLowerCase();
      if (transitionWords.some(word => firstSentence.includes(word))) {
        transitionCount++;
      }
    });
    
    const transitionRatio = transitionCount / Math.max(1, paragraphs.length - 1);
    return Math.min(100, Math.round(transitionRatio * 100 + 50));
  }

  private assessIntroductionQuality(introduction: string): number {
    if (!introduction || introduction.trim().length === 0) return 0;
    
    const wordCount = introduction.split(/\s+/).length;
    let score = 70; // Base score
    
    // Good introduction length
    if (wordCount >= 50 && wordCount <= 150) score += 20;
    else if (wordCount >= 30) score += 10;
    
    // Check for hook/engaging opening
    if (/^(imagine|consider|what if|in today's|recently)/i.test(introduction.trim())) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private assessConclusionQuality(conclusion: string): number {
    if (!conclusion || conclusion.trim().length === 0) return 0;
    
    const conclusionWords = ['in conclusion', 'to summarize', 'in summary', 'finally', 'ultimately', 'therefore'];
    const hasConclusion = conclusionWords.some(word => conclusion.toLowerCase().includes(word));
    
    let score = hasConclusion ? 80 : 60;
    
    const wordCount = conclusion.split(/\s+/).length;
    if (wordCount >= 30 && wordCount <= 100) score += 20;
    
    return Math.min(100, score);
  }

  private assessHeadingStructure(content: string): number {
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    const paragraphs = content.split(/\n\s*\n/).length;
    
    if (paragraphs <= 3) return 100; // Short documents don't need many headings
    
    const headingRatio = headings.length / paragraphs;
    
    if (headingRatio >= 0.2 && headingRatio <= 0.5) return 100;
    if (headingRatio >= 0.1) return 80;
    return 60;
  }

  // Utility methods
  private isSuspiciouslyGeneric(sentence: string): boolean {
    const genericPhrases = [
      'it is important to note',
      'in today\'s world',
      'since the beginning of time',
      'throughout history',
      'it goes without saying',
    ];
    
    return genericPhrases.some(phrase => sentence.toLowerCase().includes(phrase));
  }

  private assessParaphraseQuality(content: string): number {
    // Simplified paraphrase quality assessment
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    // Good paraphrasing typically results in varied sentence lengths
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const variety = this.calculateVariety(sentenceLengths);
    
    return Math.min(100, Math.round(variety + 50));
  }

  private assessCitationAccuracy(content: string): number {
    // Simplified citation accuracy assessment
    const citations = content.match(/\([^)]*\d{4}[^)]*\)|\[[^\]]*\d{4}[^\]]*\]/g) || [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const citationRatio = citations.length / sentences.length;
    
    if (citationRatio >= 0.1) return 100;
    if (citationRatio >= 0.05) return 80;
    return 60;
  }

  private assessSectionQuality(content: string, sectionName: string): number {
    const sectionContent = this.extractSectionContent(content, sectionName);
    if (!sectionContent) return 0;
    
    const wordCount = sectionContent.split(/\s+/).length;
    
    if (wordCount >= 100) return 100;
    if (wordCount >= 50) return 80;
    if (wordCount >= 25) return 60;
    return 40;
  }

  private countWordsInSection(content: string, sectionName: string): number {
    const sectionContent = this.extractSectionContent(content, sectionName);
    return sectionContent ? sectionContent.split(/\s+/).length : 0;
  }

  private assessSectionCompleteness(content: string, sectionName: string, requirements: DocumentRequirement): number {
    const sectionContent = this.extractSectionContent(content, sectionName);
    if (!sectionContent) return 0;
    
    // Assess completeness based on section type and requirements
    const wordCount = sectionContent.split(/\s+/).length;
    const expectedLength = this.getExpectedSectionLength(sectionName, requirements);
    
    if (wordCount >= expectedLength * 0.8) return 100;
    if (wordCount >= expectedLength * 0.6) return 80;
    if (wordCount >= expectedLength * 0.4) return 60;
    return 40;
  }

  private extractSectionContent(content: string, sectionName: string): string {
    const sectionRegex = new RegExp(`#{1,6}\\s*${sectionName}[\\s\\S]*?(?=#{1,6}|$)`, 'i');
    const match = content.match(sectionRegex);
    return match ? match[0] : '';
  }

  private getExpectedSectionLength(sectionName: string, requirements: DocumentRequirement): number {
    const sectionLengths: Record<string, number> = {
      'introduction': 150,
      'methodology': 300,
      'results': 400,
      'discussion': 350,
      'conclusion': 100,
      'abstract': 250,
      'literature review': 500,
    };
    
    return sectionLengths[sectionName.toLowerCase()] || 200;
  }

  private analyzeCitationFormat(content: string): CitationAnalysis {
    const citations = content.match(/\([^)]*\d{4}[^)]*\)|\[[^\]]*\d{4}[^\]]*\]/g) || [];
    
    // Determine citation style (simplified)
    const hasParenthetical = citations.some(c => c.startsWith('('));
    const hasBrackets = citations.some(c => c.startsWith('['));
    
    let style = 'unknown';
    if (hasParenthetical && !hasBrackets) style = 'APA';
    else if (hasBrackets && !hasParenthetical) style = 'IEEE';
    else if (hasParenthetical && hasBrackets) style = 'mixed';
    
    return {
      style,
      accuracy: 85, // Simplified assessment
      completeness: citations.length > 0 ? 90 : 0,
      consistency: style !== 'mixed' ? 95 : 60,
    };
  }

  private getAudienceKeywords(audience: string): string[] {
    const audienceKeywords: Record<string, string[]> = {
      'general': ['people', 'everyone', 'readers', 'audience'],
      'academic': ['research', 'study', 'analysis', 'methodology', 'findings'],
      'technical': ['implementation', 'system', 'architecture', 'performance', 'optimization'],
      'business': ['strategy', 'market', 'revenue', 'customers', 'growth'],
    };
    
    return audienceKeywords[audience.toLowerCase()] || [];
  }

  private getTypeKeywords(type: string): string[] {
    const typeKeywords: Record<string, string[]> = {
      'report': ['findings', 'analysis', 'recommendations', 'data', 'results'],
      'article': ['discussion', 'perspective', 'opinion', 'viewpoint', 'argument'],
      'technical': ['specification', 'implementation', 'architecture', 'design', 'system'],
      'creative': ['story', 'narrative', 'character', 'plot', 'theme'],
      'academic': ['hypothesis', 'methodology', 'literature', 'research', 'conclusion'],
    };
    
    return typeKeywords[type.toLowerCase()] || [];
  }

  // Scoring and evaluation methods
  private calculateOverallScore(evaluation: Partial<DocumentEvaluation>): number {
    const weights = {
      contentQuality: 0.3,
      grammar: 0.25,
      originality: 0.2,
      format: 0.1,
      readability: 0.1,
      structure: 0.05,
    };

    let score = 0;

    if (evaluation.contentQuality) {
      const contentScore = (
        evaluation.contentQuality.coherence +
        evaluation.contentQuality.completeness +
        evaluation.contentQuality.accuracy +
        evaluation.contentQuality.relevance +
        evaluation.contentQuality.depth +
        evaluation.contentQuality.clarity
      ) / 6;
      score += contentScore * weights.contentQuality;
    }

    if (evaluation.grammarScore) {
      score += evaluation.grammarScore.score * weights.grammar;
    }

    if (evaluation.originalityScore) {
      score += evaluation.originalityScore.score * weights.originality;
    }

    if (evaluation.formatCompliance) {
      score += evaluation.formatCompliance.score * weights.format;
    }

    if (evaluation.readabilityScore) {
      // Convert Flesch Reading Ease to 0-100 scale
      const readabilityScore = Math.max(0, Math.min(100, (evaluation.readabilityScore.fleschReadingEase + 100) / 2));
      score += readabilityScore * weights.readability;
    }

    if (evaluation.structureAnalysis) {
      const structureScore = (
        evaluation.structureAnalysis.logicalFlow +
        evaluation.structureAnalysis.paragraphStructure +
        evaluation.structureAnalysis.transitionQuality +
        evaluation.structureAnalysis.introductionQuality +
        evaluation.structureAnalysis.conclusionQuality +
        evaluation.structureAnalysis.headingStructure
      ) / 6;
      score += structureScore * weights.structure;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private calculateConfidence(
    grammarScore: GrammarAnalysis,
    originalityScore: OriginalityAnalysis,
    formatCompliance: FormatAnalysis
  ): number {
    let confidence = 100;

    // Reduce confidence for grammar issues
    const criticalGrammarErrors = grammarScore.errors.filter(e => e.severity === 'high').length;
    confidence -= criticalGrammarErrors * 15;

    // Reduce confidence for plagiarism
    if (originalityScore.plagiarismDetected) {
      confidence -= 30;
    }

    // Reduce confidence for format issues
    if (!formatCompliance.structureCompliance) {
      confidence -= 20;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private generateRecommendations(evaluation: Partial<DocumentEvaluation>): string[] {
    const recommendations: string[] = [];

    if (evaluation.grammarScore && evaluation.grammarScore.score < 80) {
      recommendations.push('Improve grammar and style - review highlighted errors and suggestions');
    }

    if (evaluation.originalityScore && evaluation.originalityScore.score < 85) {
      recommendations.push('Increase originality - reduce similarity to existing sources and improve paraphrasing');
    }

    if (evaluation.formatCompliance && evaluation.formatCompliance.score < 90) {
      recommendations.push('Improve document structure - ensure all required sections are present and well-developed');
    }

    if (evaluation.readabilityScore && evaluation.readabilityScore.fleschKincaidGrade > 15) {
      recommendations.push('Simplify language - reduce sentence complexity for better readability');
    }

    if (evaluation.contentQuality) {
      if (evaluation.contentQuality.coherence < 80) {
        recommendations.push('Improve coherence - add more transition words and logical connections between ideas');
      }
      if (evaluation.contentQuality.completeness < 80) {
        recommendations.push('Expand content - address missing sections or increase depth of analysis');
      }
    }

    return recommendations;
  }

  private collectEvidence(evaluation: Partial<DocumentEvaluation>): EvaluationEvidence[] {
    const evidence: EvaluationEvidence[] = [];

    if (evaluation.contentQuality) {
      evidence.push({
        type: 'content_quality',
        description: 'Content quality assessment based on coherence, completeness, accuracy, relevance, depth, and clarity',
        score: (evaluation.contentQuality.coherence + evaluation.contentQuality.completeness + 
                evaluation.contentQuality.accuracy + evaluation.contentQuality.relevance + 
                evaluation.contentQuality.depth + evaluation.contentQuality.clarity) / 6,
        details: evaluation.contentQuality,
        artifacts: [],
      });
    }

    if (evaluation.grammarScore) {
      evidence.push({
        type: 'grammar_analysis',
        description: 'Grammar and style analysis with error detection and suggestions',
        score: evaluation.grammarScore.score,
        details: {
          errorCount: evaluation.grammarScore.errors.length,
          criticalErrors: evaluation.grammarScore.errors.filter(e => e.severity === 'high').length,
          styleIssues: evaluation.grammarScore.styleIssues.length,
        },
        artifacts: [],
      });
    }

    if (evaluation.originalityScore) {
      evidence.push({
        type: 'originality_check',
        description: 'Plagiarism detection and originality assessment',
        score: evaluation.originalityScore.score,
        details: {
          uniqueContent: evaluation.originalityScore.uniqueContent,
          plagiarismDetected: evaluation.originalityScore.plagiarismDetected,
          sourcesFound: evaluation.originalityScore.sources.length,
        },
        artifacts: [],
      });
    }

    if (evaluation.readabilityScore) {
      evidence.push({
        type: 'readability_analysis',
        description: 'Readability metrics and accessibility assessment',
        score: Math.max(0, Math.min(100, (evaluation.readabilityScore.fleschReadingEase + 100) / 2)),
        details: {
          fleschKincaidGrade: evaluation.readabilityScore.fleschKincaidGrade,
          fleschReadingEase: evaluation.readabilityScore.fleschReadingEase,
          averageSentenceLength: evaluation.readabilityScore.averageSentenceLength,
        },
        artifacts: [],
      });
    }

    return evidence;
  }
}