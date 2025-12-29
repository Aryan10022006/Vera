/**
 * Vera Protocol - Document Analysis MCP Server
 * Provides comprehensive document evaluation and quality assessment
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

interface DocumentAnalysisConfig {
  grammarApiKey?: string;
  plagiarismApiKey?: string;
  readabilityApiKey?: string;
}

interface DocumentEvaluation {
  overallScore: number;
  contentQuality: ContentQualityMetrics;
  grammarScore: GrammarAnalysis;
  originalityScore: OriginalityAnalysis;
  formatCompliance: FormatAnalysis;
  readabilityScore: ReadabilityMetrics;
  recommendations: string[];
  evidence: EvaluationEvidence[];
}

interface ContentQualityMetrics {
  coherence: number;
  completeness: number;
  accuracy: number;
  relevance: number;
  structure: number;
}

interface GrammarAnalysis {
  score: number;
  errors: GrammarError[];
  suggestions: string[];
}

interface GrammarError {
  type: string;
  message: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

interface OriginalityAnalysis {
  score: number;
  plagiarismDetected: boolean;
  sources: PlagiarismSource[];
  uniqueContent: number;
}

interface PlagiarismSource {
  url: string;
  similarity: number;
  matchedText: string;
}

interface FormatAnalysis {
  score: number;
  formatType: string;
  structureCompliance: boolean;
  requiredSections: SectionAnalysis[];
}

interface SectionAnalysis {
  name: string;
  present: boolean;
  quality: number;
  wordCount: number;
}

interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  gunningFogIndex: number;
  smogIndex: number;
  averageSentenceLength: number;
  averageWordsPerSentence: number;
}

interface EvaluationEvidence {
  type: string;
  description: string;
  score: number;
  details: any;
}

class DocumentAnalysisMCP {
  private server: Server;
  private config: DocumentAnalysisConfig;

  constructor(config: DocumentAnalysisConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: 'vera-document-analysis',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'evaluate_document',
            description: 'Perform comprehensive evaluation of a document',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Document content to evaluate',
                },
                requirements: {
                  type: 'object',
                  description: 'Document requirements and specifications',
                  properties: {
                    type: { type: 'string', enum: ['report', 'article', 'technical', 'creative'] },
                    wordCount: { type: 'number' },
                    sections: { type: 'array', items: { type: 'string' } },
                    style: { type: 'string' },
                    audience: { type: 'string' },
                  },
                },
                evaluationCriteria: {
                  type: 'object',
                  description: 'Specific evaluation criteria',
                  properties: {
                    grammar: { type: 'boolean', default: true },
                    plagiarism: { type: 'boolean', default: true },
                    readability: { type: 'boolean', default: true },
                    structure: { type: 'boolean', default: true },
                  },
                },
              },
              required: ['content', 'requirements'],
            },
          },
          {
            name: 'check_grammar',
            description: 'Perform detailed grammar and style analysis',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Text to analyze for grammar issues',
                },
                language: {
                  type: 'string',
                  description: 'Language code (e.g., en, es, fr)',
                  default: 'en',
                },
                styleGuide: {
                  type: 'string',
                  enum: ['academic', 'business', 'casual', 'technical'],
                  description: 'Style guide to apply',
                  default: 'business',
                },
              },
              required: ['text'],
            },
          },
          {
            name: 'detect_plagiarism',
            description: 'Check document for plagiarism and originality',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Content to check for plagiarism',
                },
                threshold: {
                  type: 'number',
                  description: 'Similarity threshold (0-100)',
                  default: 15,
                },
                excludeQuotes: {
                  type: 'boolean',
                  description: 'Exclude properly quoted content',
                  default: true,
                },
              },
              required: ['content'],
            },
          },
          {
            name: 'analyze_readability',
            description: 'Calculate readability metrics and scores',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Text to analyze for readability',
                },
                targetAudience: {
                  type: 'string',
                  enum: ['general', 'academic', 'technical', 'children'],
                  description: 'Target audience for readability assessment',
                  default: 'general',
                },
              },
              required: ['text'],
            },
          },
          {
            name: 'validate_format',
            description: 'Validate document format and structure',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Document content to validate',
                },
                format: {
                  type: 'string',
                  enum: ['markdown', 'html', 'plain', 'structured'],
                  description: 'Expected document format',
                },
                requiredSections: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Required sections that must be present',
                },
              },
              required: ['content', 'format'],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'evaluate_document':
            return await this.evaluateDocument(args);
          case 'check_grammar':
            return await this.checkGrammar(args);
          case 'detect_plagiarism':
            return await this.detectPlagiarism(args);
          case 'analyze_readability':
            return await this.analyzeReadability(args);
          case 'validate_format':
            return await this.validateFormat(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async evaluateDocument(args: any): Promise<any> {
    const { content, requirements, evaluationCriteria = {} } = args;

    const evaluation: DocumentEvaluation = {
      overallScore: 0,
      contentQuality: await this.analyzeContentQuality(content, requirements),
      grammarScore: evaluationCriteria.grammar !== false 
        ? await this.performGrammarAnalysis(content)
        : { score: 100, errors: [], suggestions: [] },
      originalityScore: evaluationCriteria.plagiarism !== false
        ? await this.performPlagiarismCheck(content)
        : { score: 100, plagiarismDetected: false, sources: [], uniqueContent: 100 },
      formatCompliance: evaluationCriteria.structure !== false
        ? await this.analyzeFormatCompliance(content, requirements)
        : { score: 100, formatType: 'unknown', structureCompliance: true, requiredSections: [] },
      readabilityScore: evaluationCriteria.readability !== false
        ? await this.calculateReadabilityMetrics(content)
        : { fleschKincaidGrade: 12, fleschReadingEase: 60, gunningFogIndex: 12, smogIndex: 12, averageSentenceLength: 20, averageWordsPerSentence: 20 },
      recommendations: [],
      evidence: [],
    };

    // Calculate overall score
    evaluation.overallScore = this.calculateOverallScore(evaluation);

    // Generate recommendations
    evaluation.recommendations = this.generateRecommendations(evaluation);

    // Collect evidence
    evaluation.evidence = this.collectEvidence(evaluation);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            evaluation,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  }

  private async analyzeContentQuality(content: string, requirements: any): Promise<ContentQualityMetrics> {
    const wordCount = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    return {
      coherence: this.assessCoherence(content),
      completeness: this.assessCompleteness(content, requirements),
      accuracy: this.assessAccuracy(content),
      relevance: this.assessRelevance(content, requirements),
      structure: this.assessStructure(paragraphs, sentences),
    };
  }

  private async performGrammarAnalysis(text: string): Promise<GrammarAnalysis> {
    // Simplified grammar analysis - in production, integrate with LanguageTool or similar
    const errors: GrammarError[] = [];
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach((sentence, index) => {
      // Check for common issues
      if (sentence.length > 200) {
        errors.push({
          type: 'sentence_length',
          message: 'Sentence is too long and may be difficult to read',
          line: index + 1,
          column: 0,
          severity: 'medium',
          suggestion: 'Consider breaking into shorter sentences',
        });
      }
      
      // Check for passive voice (simplified)
      if (/\b(was|were|is|are|been)\s+\w+ed\b/.test(sentence)) {
        errors.push({
          type: 'passive_voice',
          message: 'Consider using active voice',
          line: index + 1,
          column: 0,
          severity: 'low',
          suggestion: 'Rewrite in active voice for clarity',
        });
      }
    });

    const score = Math.max(0, 100 - (errors.length * 5));
    
    return {
      score,
      errors,
      suggestions: this.generateGrammarSuggestions(errors),
    };
  }

  private async performPlagiarismCheck(content: string): Promise<OriginalityAnalysis> {
    // Simplified plagiarism check - in production, integrate with Turnitin or similar
    const uniqueContent = 95; // Placeholder
    
    return {
      score: uniqueContent,
      plagiarismDetected: uniqueContent < 85,
      sources: [], // Would contain actual sources in production
      uniqueContent,
    };
  }

  private async analyzeFormatCompliance(content: string, requirements: any): Promise<FormatAnalysis> {
    const requiredSections = requirements.sections || [];
    const sectionAnalysis: SectionAnalysis[] = [];
    
    requiredSections.forEach((sectionName: string) => {
      const sectionRegex = new RegExp(`#{1,6}\\s*${sectionName}|\\b${sectionName}\\b`, 'i');
      const present = sectionRegex.test(content);
      
      sectionAnalysis.push({
        name: sectionName,
        present,
        quality: present ? 85 : 0,
        wordCount: present ? this.countWordsInSection(content, sectionName) : 0,
      });
    });

    const structureCompliance = sectionAnalysis.every(s => s.present);
    const score = structureCompliance ? 100 : (sectionAnalysis.filter(s => s.present).length / sectionAnalysis.length) * 100;

    return {
      score,
      formatType: requirements.type || 'general',
      structureCompliance,
      requiredSections: sectionAnalysis,
    };
  }

  private async calculateReadabilityMetrics(text: string): Promise<ReadabilityMetrics> {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const syllables = this.countSyllables(text);
    
    const averageWordsPerSentence = words / sentences;
    const averageSyllablesPerWord = syllables / words;
    
    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = 0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;
    
    // Flesch Reading Ease
    const fleschReadingEase = 206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord;
    
    // Gunning Fog Index (simplified)
    const complexWords = this.countComplexWords(text);
    const gunningFogIndex = 0.4 * (averageWordsPerSentence + 100 * (complexWords / words));
    
    return {
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      gunningFogIndex: Math.round(gunningFogIndex * 10) / 10,
      smogIndex: Math.round(gunningFogIndex * 0.9), // Simplified SMOG
      averageSentenceLength: Math.round(averageWordsPerSentence * 10) / 10,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    };
  }

  // Helper methods
  private assessCoherence(content: string): number {
    // Simplified coherence assessment
    const paragraphs = content.split(/\n\s*\n/);
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'consequently'];
    const transitionCount = transitionWords.reduce((count, word) => 
      count + (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0);
    
    return Math.min(100, 60 + (transitionCount / paragraphs.length) * 40);
  }

  private assessCompleteness(content: string, requirements: any): number {
    const wordCount = content.split(/\s+/).length;
    const targetWordCount = requirements.wordCount || 1000;
    
    if (wordCount >= targetWordCount * 0.9 && wordCount <= targetWordCount * 1.1) {
      return 100;
    } else if (wordCount >= targetWordCount * 0.8) {
      return 85;
    } else if (wordCount >= targetWordCount * 0.7) {
      return 70;
    } else {
      return Math.max(0, (wordCount / targetWordCount) * 100);
    }
  }

  private assessAccuracy(content: string): number {
    // Simplified accuracy assessment - would need fact-checking APIs in production
    return 85; // Placeholder
  }

  private assessRelevance(content: string, requirements: any): number {
    // Simplified relevance assessment
    const keywords = requirements.keywords || [];
    if (keywords.length === 0) return 85;
    
    const keywordMatches = keywords.filter((keyword: string) => 
      content.toLowerCase().includes(keyword.toLowerCase())).length;
    
    return (keywordMatches / keywords.length) * 100;
  }

  private assessStructure(paragraphs: string[], sentences: string[]): number {
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    let score = 100;
    if (avgParagraphLength > 200) score -= 10;
    if (avgSentenceLength > 30) score -= 10;
    if (paragraphs.length < 3) score -= 15;
    
    return Math.max(0, score);
  }

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

  private countWordsInSection(content: string, sectionName: string): number {
    const sectionRegex = new RegExp(`#{1,6}\\s*${sectionName}[\\s\\S]*?(?=#{1,6}|$)`, 'i');
    const match = content.match(sectionRegex);
    return match ? match[0].split(/\s+/).length : 0;
  }

  private calculateOverallScore(evaluation: DocumentEvaluation): number {
    const weights = {
      contentQuality: 0.3,
      grammar: 0.25,
      originality: 0.2,
      format: 0.15,
      readability: 0.1,
    };

    const contentScore = (
      evaluation.contentQuality.coherence +
      evaluation.contentQuality.completeness +
      evaluation.contentQuality.accuracy +
      evaluation.contentQuality.relevance +
      evaluation.contentQuality.structure
    ) / 5;

    return Math.round(
      contentScore * weights.contentQuality +
      evaluation.grammarScore.score * weights.grammar +
      evaluation.originalityScore.score * weights.originality +
      evaluation.formatCompliance.score * weights.format +
      ((evaluation.readabilityScore.fleschReadingEase + 100) / 2) * weights.readability
    );
  }

  private generateRecommendations(evaluation: DocumentEvaluation): string[] {
    const recommendations: string[] = [];

    if (evaluation.grammarScore.score < 80) {
      recommendations.push('Improve grammar and style - review highlighted errors');
    }
    if (evaluation.originalityScore.score < 85) {
      recommendations.push('Increase originality - reduce similarity to existing sources');
    }
    if (evaluation.formatCompliance.score < 90) {
      recommendations.push('Improve document structure - ensure all required sections are present');
    }
    if (evaluation.readabilityScore.fleschKincaidGrade > 15) {
      recommendations.push('Simplify language - reduce sentence complexity for better readability');
    }

    return recommendations;
  }

  private generateGrammarSuggestions(errors: GrammarError[]): string[] {
    const suggestions = new Set<string>();
    
    errors.forEach(error => {
      suggestions.add(error.suggestion);
    });
    
    return Array.from(suggestions);
  }

  private collectEvidence(evaluation: DocumentEvaluation): EvaluationEvidence[] {
    const evidence: EvaluationEvidence[] = [];

    evidence.push({
      type: 'content_quality',
      description: 'Content quality assessment based on coherence, completeness, accuracy, relevance, and structure',
      score: (evaluation.contentQuality.coherence + evaluation.contentQuality.completeness + 
              evaluation.contentQuality.accuracy + evaluation.contentQuality.relevance + 
              evaluation.contentQuality.structure) / 5,
      details: evaluation.contentQuality,
    });

    evidence.push({
      type: 'grammar_analysis',
      description: 'Grammar and style analysis with error detection',
      score: evaluation.grammarScore.score,
      details: {
        errorCount: evaluation.grammarScore.errors.length,
        majorErrors: evaluation.grammarScore.errors.filter(e => e.severity === 'high').length,
      },
    });

    evidence.push({
      type: 'originality_check',
      description: 'Plagiarism detection and originality assessment',
      score: evaluation.originalityScore.score,
      details: {
        uniqueContent: evaluation.originalityScore.uniqueContent,
        sourcesFound: evaluation.originalityScore.sources.length,
      },
    });

    return evidence;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vera Document Analysis MCP Server running on stdio');
  }
}

// Start the server
const config: DocumentAnalysisConfig = {
  grammarApiKey: process.env.GRAMMAR_API_KEY,
  plagiarismApiKey: process.env.PLAGIARISM_API_KEY,
  readabilityApiKey: process.env.READABILITY_API_KEY,
};

const server = new DocumentAnalysisMCP(config);
server.run().catch(console.error);