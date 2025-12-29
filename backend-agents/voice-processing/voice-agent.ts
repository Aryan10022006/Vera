/**
 * Vera Protocol - Standalone Voice Processing Agent
 * Converts speech to structured agreements without external dependencies
 */

export interface VoiceTranscript {
  text: string;
  confidence: number;
  timestamp: number;
  language: string;
}

export interface Agreement {
  projectId: string;
  title: string;
  description: string;
  requirements: {
    technical: TechnicalRequirement[];
    subjective: SubjectiveRequirement[];
  };
  payment: {
    totalAmount: number;
    currency: string;
    technicalPercentage: number; // Always 80%
    subjectivePercentage: number; // Always 20%
  };
  parties: {
    client: string;
    freelancer: string;
  };
  timeline: {
    created: number;
    deadline: number;
    silentConsentHours: number; // Always 72
  };
  ipfsHash?: string;
}

export interface TechnicalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  weight: number;
  type: 'technical';
  measurable: boolean;
}

export interface SubjectiveRequirement {
  id: string;
  description: string;
  weight: number;
  type: 'subjective';
  reviewRequired: boolean;
}

export class VoiceProcessingAgent {
  private technicalKeywords = [
    'function', 'api', 'database', 'authentication', 'security', 'performance',
    'responsive', 'mobile', 'testing', 'deployment', 'integration', 'backend',
    'frontend', 'algorithm', 'optimization', 'scalability', 'compatibility'
  ];

  private subjectiveKeywords = [
    'design', 'style', 'color', 'font', 'layout', 'aesthetic', 'beautiful',
    'modern', 'clean', 'professional', 'user-friendly', 'intuitive', 'appealing'
  ];

  /**
   * Convert voice transcript to structured agreement
   * Implements Natural Language Processing for project requirements
   */
  async processVoiceToAgreement(
    transcript: VoiceTranscript,
    clientAddress: string,
    freelancerAddress: string
  ): Promise<Agreement> {
    console.log('🎤 VOICE PROCESSING: Converting speech to structured agreement');

    // Extract project metadata
    const projectMetadata = this.extractProjectMetadata(transcript.text);
    
    // Classify requirements into technical (80%) and subjective (20%)
    const requirements = this.classifyRequirements(transcript.text);
    
    // Extract payment information
    const payment = this.extractPaymentInfo(transcript.text);
    
    // Generate unique project ID
    const projectId = this.generateProjectId(projectMetadata.title, clientAddress);

    const agreement: Agreement = {
      projectId,
      title: projectMetadata.title,
      description: projectMetadata.description,
      requirements,
      payment: {
        ...payment,
        technicalPercentage: 80, // Immutable 80% for technical
        subjectivePercentage: 20  // Immutable 20% for subjective
      },
      parties: {
        client: clientAddress,
        freelancer: freelancerAddress
      },
      timeline: {
        created: Date.now(),
        deadline: projectMetadata.deadline,
        silentConsentHours: 72 // Immutable 72-hour silent consent
      }
    };

    console.log('✅ VOICE PROCESSING: Agreement structure generated');
    console.log(`   Technical Requirements: ${requirements.technical.length}`);
    console.log(`   Subjective Requirements: ${requirements.subjective.length}`);
    console.log(`   80/20 Split: $${payment.totalAmount * 0.8}/$${payment.totalAmount * 0.2}`);

    return agreement;
  }

  /**
   * Validate agreement structure for IPFS storage
   */
  validateAgreement(agreement: Agreement): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!agreement.title || agreement.title.length < 5) {
      errors.push('Project title must be at least 5 characters');
    }

    if (!agreement.description || agreement.description.length < 20) {
      errors.push('Project description must be at least 20 characters');
    }

    if (agreement.requirements.technical.length === 0) {
      errors.push('At least one technical requirement is required');
    }

    if (agreement.payment.totalAmount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    // Validate 80/20 invariant
    if (agreement.payment.technicalPercentage !== 80) {
      errors.push('Technical percentage must be exactly 80%');
    }

    if (agreement.payment.subjectivePercentage !== 20) {
      errors.push('Subjective percentage must be exactly 20%');
    }

    // Validate 72-hour silent consent
    if (agreement.timeline.silentConsentHours !== 72) {
      errors.push('Silent consent period must be exactly 72 hours');
    }

    // Validate addresses
    if (!this.isValidEthereumAddress(agreement.parties.client)) {
      errors.push('Invalid client Ethereum address');
    }

    if (!this.isValidEthereumAddress(agreement.parties.freelancer)) {
      errors.push('Invalid freelancer Ethereum address');
    }

    // Warnings for optimization
    if (agreement.requirements.technical.length > 10) {
      warnings.push('Consider breaking down complex projects into smaller milestones');
    }

    if (agreement.requirements.subjective.length > 3) {
      warnings.push('Too many subjective requirements may lead to disputes');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate natural language summary of agreement
   */
  generateAgreementSummary(agreement: Agreement): string {
    const summary = [];
    
    summary.push(`📋 PROJECT: ${agreement.title}`);
    summary.push(`💰 PAYMENT: $${agreement.payment.totalAmount} (80% technical / 20% subjective)`);
    summary.push(`⏰ DEADLINE: ${new Date(agreement.timeline.deadline).toLocaleDateString()}`);
    summary.push(`🔒 SILENT CONSENT: 72 hours auto-release`);
    summary.push('');
    
    summary.push('📝 TECHNICAL REQUIREMENTS (80% - Auto-Release):');
    agreement.requirements.technical.forEach((req, index) => {
      summary.push(`   ${index + 1}. ${req.description}`);
    });
    
    if (agreement.requirements.subjective.length > 0) {
      summary.push('');
      summary.push('🎨 SUBJECTIVE REQUIREMENTS (20% - Review Required):');
      agreement.requirements.subjective.forEach((req, index) => {
        summary.push(`   ${index + 1}. ${req.description}`);
      });
    }
    
    summary.push('');
    summary.push('🤖 AI ARBITRATION: Neutral evaluation based on evidence');
    summary.push('⚖️ DISPUTE RESOLUTION: Scope creep protection included');
    
    return summary.join('\n');
  }

  // Private helper methods

  private extractProjectMetadata(text: string): {
    title: string;
    description: string;
    deadline: number;
  } {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Extract title (usually first meaningful sentence)
    const title = this.extractTitle(sentences);
    
    // Extract description (combine relevant sentences)
    const description = this.extractDescription(text);
    
    // Extract deadline (look for time references)
    const deadline = this.extractDeadline(text);
    
    return { title, description, deadline };
  }

  private extractTitle(sentences: string[]): string {
    // Look for project-related keywords in first few sentences
    const projectKeywords = ['build', 'create', 'develop', 'make', 'design', 'implement'];
    
    for (const sentence of sentences.slice(0, 3)) {
      const words = sentence.toLowerCase().split(' ');
      if (projectKeywords.some(keyword => words.includes(keyword))) {
        return sentence.trim().substring(0, 100); // Limit title length
      }
    }
    
    // Fallback to first sentence
    return sentences[0]?.trim().substring(0, 100) || 'Untitled Project';
  }

  private extractDescription(text: string): string {
    // Clean and format the full text as description
    return text.trim().substring(0, 500); // Limit description length
  }

  private extractDeadline(text: string): number {
    const timeKeywords = {
      'week': 7 * 24 * 60 * 60 * 1000,
      'weeks': 7 * 24 * 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'days': 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000,
      'months': 30 * 24 * 60 * 60 * 1000
    };

    const words = text.toLowerCase().split(' ');
    
    for (let i = 0; i < words.length - 1; i++) {
      const number = parseInt(words[i]);
      const timeUnit = words[i + 1];
      
      if (!isNaN(number) && timeKeywords[timeUnit]) {
        return Date.now() + (number * timeKeywords[timeUnit]);
      }
    }
    
    // Default to 2 weeks if no deadline specified
    return Date.now() + (14 * 24 * 60 * 60 * 1000);
  }

  private classifyRequirements(text: string): {
    technical: TechnicalRequirement[];
    subjective: SubjectiveRequirement[];
  } {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const technical: TechnicalRequirement[] = [];
    const subjective: SubjectiveRequirement[] = [];

    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence contains technical keywords
      const isTechnical = this.technicalKeywords.some(keyword => 
        lowerSentence.includes(keyword)
      );
      
      // Check if sentence contains subjective keywords
      const isSubjective = this.subjectiveKeywords.some(keyword => 
        lowerSentence.includes(keyword)
      );

      if (isTechnical && !isSubjective) {
        technical.push({
          id: `tech_${index}`,
          description: sentence.trim(),
          acceptanceCriteria: this.generateAcceptanceCriteria(sentence),
          weight: 1,
          type: 'technical',
          measurable: true
        });
      } else if (isSubjective) {
        subjective.push({
          id: `subj_${index}`,
          description: sentence.trim(),
          weight: 1,
          type: 'subjective',
          reviewRequired: true
        });
      } else {
        // Default to technical if unclear
        technical.push({
          id: `tech_${index}`,
          description: sentence.trim(),
          acceptanceCriteria: ['Functionality implemented as described'],
          weight: 1,
          type: 'technical',
          measurable: true
        });
      }
    });

    // Ensure at least one technical requirement
    if (technical.length === 0) {
      technical.push({
        id: 'tech_default',
        description: 'Complete the project as described',
        acceptanceCriteria: ['All specified functionality working correctly'],
        weight: 1,
        type: 'technical',
        measurable: true
      });
    }

    return { technical, subjective };
  }

  private generateAcceptanceCriteria(requirement: string): string[] {
    const criteria = ['Functionality implemented as described'];
    
    if (requirement.toLowerCase().includes('test')) {
      criteria.push('Unit tests provided with >80% coverage');
    }
    
    if (requirement.toLowerCase().includes('api')) {
      criteria.push('API endpoints documented and functional');
    }
    
    if (requirement.toLowerCase().includes('responsive')) {
      criteria.push('Works correctly on mobile and desktop devices');
    }
    
    if (requirement.toLowerCase().includes('security')) {
      criteria.push('Security best practices implemented');
    }
    
    return criteria;
  }

  private extractPaymentInfo(text: string): { totalAmount: number; currency: string } {
    // Look for currency symbols and amounts
    const dollarMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    const ethMatch = text.match(/(\d+(?:\.\d+)?)\s*eth/i);
    
    if (dollarMatch) {
      return {
        totalAmount: parseFloat(dollarMatch[1].replace(',', '')),
        currency: 'USD'
      };
    }
    
    if (ethMatch) {
      return {
        totalAmount: parseFloat(ethMatch[1]),
        currency: 'ETH'
      };
    }
    
    // Default payment if not specified
    return {
      totalAmount: 1000,
      currency: 'USD'
    };
  }

  private generateProjectId(title: string, clientAddress: string): string {
    const titleHash = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    const addressHash = clientAddress.substring(2, 8);
    const timestamp = Date.now().toString().slice(-6);
    
    return `vera_${titleHash}_${addressHash}_${timestamp}`;
  }

  private isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}