/**
 * AI Enhancement Service for Frontend
 * Integrates with backend AI enhancement API
 */

import api from './api';

export interface EnhancementOptions {
  type: 'auto' | 'sharpness' | 'contrast' | 'brightness' | 'saturation' | 'denoise';
  intensity?: number;
}

export interface EnhancementResult {
  success: boolean;
  enhanced_image: string;
  enhancement_type: string;
  intensity: number;
  original_size: number;
  enhanced_size: number;
  message: string;
}

export interface QualityAnalysis {
  quality_score: number;
  recommendations: string[];
  suitable_for_printing: boolean;
  suggested_size: string;
  image_properties: {
    width: number;
    height: number;
    megapixels: number;
    format: string;
  };
}

export interface EnhancementTypeOption {
  value: string;
  label: string;
  description: string;
  default_intensity: number;
}

class AIEnhancementService {
  /**
   * Enhance an image using AI algorithms
   * @param imageBase64 Base64 encoded image or data URI
   * @param options Enhancement options
   */
  async enhanceImage(
    imageBase64: string,
    options: EnhancementOptions = { type: 'auto', intensity: 1.0 }
  ): Promise<EnhancementResult> {
    try {
      const response = await api.post<EnhancementResult>('/ai/enhance-image/', {
        image: imageBase64,
        enhancement_type: options.type,
        intensity: options.intensity || 1.0,
      });

      if (!response.data.success) {
        throw new Error('Enhancement failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error enhancing image:', error);
      throw error;
    }
  }

  /**
   * Analyze image quality for printing
   * @param imageBase64 Base64 encoded image
   */
  async analyzeImageQuality(imageBase64: string): Promise<QualityAnalysis> {
    try {
      const response = await api.post<QualityAnalysis>('/ai/analyze-quality/', {
        image: imageBase64,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  /**
   * Get available enhancement types and options
   */
  async getEnhancementOptions(): Promise<{
    enhancement_types: EnhancementTypeOption[];
    intensity_range: {
      min: number;
      max: number;
      default: number;
    };
  }> {
    try {
      const response = await api.get('/ai/enhancement-options/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching enhancement options:', error);
      throw error;
    }
  }

  /**
   * Convert file to base64
   * @param file File object
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URI prefix if needed
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert base64 image to data URI
   * @param base64 Base64 string
   * @param mimeType MIME type (default: image/png)
   */
  static base64ToDataURI(base64: string, mimeType = 'image/png'): string {
    if (base64.startsWith('data:')) {
      return base64;
    }
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Download enhanced image
   * @param base64 Enhanced image as base64
   * @param filename Filename for download
   */
  static downloadEnhancedImage(base64: string, filename = 'enhanced-image.png') {
    const link = document.createElement('a');
    link.href = this.base64ToDataURI(base64);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const aiEnhancementService = new AIEnhancementService();
export default aiEnhancementService;
