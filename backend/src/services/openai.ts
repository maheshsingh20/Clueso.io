import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { TranscriptSegment } from '@clueso/shared';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

export interface TranscriptionResult {
  text: string;
  segments: TranscriptSegment[];
  language: string;
  confidence: number;
}

export interface ScriptEnhancementResult {
  enhancedText: string;
  improvements: string[];
}

export class OpenAIService {
  async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult> {
    try {
      logger.info(`Starting transcription for: ${filename}`);
      
      // Create a File-like object from buffer
      const file = new File([audioBuffer], filename, { type: 'audio/wav' });
      
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment']
      });

      // Convert OpenAI segments to our format
      const segments: TranscriptSegment[] = transcription.segments?.map((segment, index) => ({
        id: `segment_${index}`,
        text: segment.text,
        start: segment.start,
        end: segment.end,
        confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.8,
        speaker: undefined // Whisper doesn't provide speaker identification
      })) || [];

      logger.info(`Transcription completed for: ${filename}`);
      
      return {
        text: transcription.text,
        segments,
        language: transcription.language || 'en',
        confidence: segments.length > 0 
          ? segments.reduce((sum, seg) => sum + seg.confidence, 0) / segments.length 
          : 0.8
      };
    } catch (error) {
      logger.error('OpenAI transcription error:', error);
      throw new Error(`Transcription failed: ${error}`);
    }
  }

  async enhanceScript(originalText: string, context?: string): Promise<ScriptEnhancementResult> {
    try {
      logger.info('Starting script enhancement');
      
      const systemPrompt = `You are an expert technical writer and video script enhancer. Your task is to improve video transcripts for screen recordings and tutorials.

Guidelines:
- Fix grammar, punctuation, and spelling errors
- Improve clarity and flow while maintaining the original meaning
- Remove filler words (um, uh, like, you know, etc.)
- Structure content with proper paragraphs
- Maintain the conversational tone appropriate for video content
- Keep technical terms accurate
- Don't add new information not present in the original

Return your response as JSON with:
- "enhancedText": the improved script
- "improvements": array of key improvements made`;

      const userPrompt = `Please enhance this video transcript:

${context ? `Context: ${context}\n\n` : ''}Original transcript:
${originalText}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      logger.info('Script enhancement completed');
      
      return {
        enhancedText: result.enhancedText || originalText,
        improvements: result.improvements || []
      };
    } catch (error) {
      logger.error('OpenAI script enhancement error:', error);
      throw new Error(`Script enhancement failed: ${error}`);
    }
  }

  async generateVoiceover(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'): Promise<Buffer> {
    try {
      logger.info('Starting voiceover generation');
      
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
        response_format: 'mp3'
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      logger.info('Voiceover generation completed');
      
      return buffer;
    } catch (error) {
      logger.error('OpenAI voiceover error:', error);
      throw new Error(`Voiceover generation failed: ${error}`);
    }
  }

  async generateDocumentation(transcript: string, videoTitle: string): Promise<{
    steps: Array<{
      title: string;
      description: string;
      timestamp?: number;
    }>;
    introduction: string;
    conclusion: string;
  }> {
    try {
      logger.info('Starting documentation generation');
      
      const systemPrompt = `You are an expert technical documentation writer. Create step-by-step documentation from video transcripts.

Guidelines:
- Break down the content into clear, actionable steps
- Each step should have a descriptive title and detailed description
- Include an introduction and conclusion
- Focus on the actual actions being performed
- Use clear, concise language
- Number the steps logically

Return JSON with:
- "introduction": brief overview of what will be accomplished
- "steps": array of objects with "title" and "description"
- "conclusion": summary of what was accomplished`;

      const userPrompt = `Create step-by-step documentation for this video:

Title: ${videoTitle}

Transcript:
${transcript}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      logger.info('Documentation generation completed');
      
      return {
        introduction: result.introduction || '',
        steps: result.steps || [],
        conclusion: result.conclusion || ''
      };
    } catch (error) {
      logger.error('OpenAI documentation error:', error);
      throw new Error(`Documentation generation failed: ${error}`);
    }
  }
}

export const openaiService = new OpenAIService();