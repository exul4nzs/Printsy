"""
AI Image Enhancement Service for Printsy
Uses PIL (Pillow) for processing and optional ML APIs for advanced features
"""
import io
import base64
import logging
from enum import Enum
from PIL import Image, ImageEnhance, ImageFilter
import os

logger = logging.getLogger(__name__)


class EnhancementType(str, Enum):
    """Available image enhancement types"""
    SHARPNESS = 'sharpness'
    CONTRAST = 'contrast'
    BRIGHTNESS = 'brightness'
    SATURATION = 'saturation'
    AUTO = 'auto'  # Applies optimal enhancement
    DENOISE = 'denoise'  # Reduce noise
    UPSCALE = 'upscale'  # Increase resolution


class ImageEnhancementService:
    """Service for AI-powered image enhancement"""
    
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
    SUPPORTED_FORMATS = {'PNG', 'JPEG', 'JPG', 'WEBP'}
    
    @staticmethod
    def validate_image(image_data: bytes) -> bool:
        """Validate image format and size"""
        if len(image_data) > ImageEnhancementService.MAX_IMAGE_SIZE:
            logger.warning(f"Image exceeds max size: {len(image_data)}")
            return False
        
        try:
            img = Image.open(io.BytesIO(image_data))
            if img.format and img.format.upper() not in ImageEnhancementService.SUPPORTED_FORMATS:
                logger.warning(f"Unsupported image format: {img.format}")
                return False
            return True
        except Exception as e:
            logger.error(f"Error validating image: {e}")
            return False
    
    @staticmethod
    def enhance_sharpness(image: Image.Image, factor: float = 1.5) -> Image.Image:
        """Enhance image sharpness"""
        try:
            enhancer = ImageEnhance.Sharpness(image)
            return enhancer.enhance(factor)
        except Exception as e:
            logger.error(f"Error enhancing sharpness: {e}")
            return image
    
    @staticmethod
    def enhance_contrast(image: Image.Image, factor: float = 1.3) -> Image.Image:
        """Enhance image contrast"""
        try:
            enhancer = ImageEnhance.Contrast(image)
            return enhancer.enhance(factor)
        except Exception as e:
            logger.error(f"Error enhancing contrast: {e}")
            return image
    
    @staticmethod
    def enhance_brightness(image: Image.Image, factor: float = 1.1) -> Image.Image:
        """Adjust image brightness"""
        try:
            enhancer = ImageEnhance.Brightness(image)
            return enhancer.enhance(factor)
        except Exception as e:
            logger.error(f"Error enhancing brightness: {e}")
            return image
    
    @staticmethod
    def enhance_saturation(image: Image.Image, factor: float = 1.2) -> Image.Image:
        """Enhance color saturation"""
        try:
            enhancer = ImageEnhance.Color(image)
            return enhancer.enhance(factor)
        except Exception as e:
            logger.error(f"Error enhancing saturation: {e}")
            return image
    
    @staticmethod
    def denoise_image(image: Image.Image) -> Image.Image:
        """Reduce image noise (simple median filter)"""
        try:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Apply median filter (reduces noise)
            return image.filter(ImageFilter.MedianFilter(size=3))
        except Exception as e:
            logger.error(f"Error denoising image: {e}")
            return image
    
    @staticmethod
    def auto_enhance(image: Image.Image) -> Image.Image:
        """Apply optimal automatic enhancements"""
        try:
            # Apply a series of enhancements
            image = ImageEnhancementService.enhance_saturation(image, 1.15)
            image = ImageEnhancementService.enhance_contrast(image, 1.2)
            image = ImageEnhancementService.enhance_sharpness(image, 1.3)
            image = ImageEnhancementService.enhance_brightness(image, 1.05)
            return image
        except Exception as e:
            logger.error(f"Error in auto enhancement: {e}")
            return image
    
    @staticmethod
    def enhance(
        image_data: bytes,
        enhancement_type: EnhancementType = EnhancementType.AUTO,
        intensity: float = 1.0
    ) -> bytes:
        """
        Enhance an image and return enhanced bytes
        
        Args:
            image_data: Raw image bytes
            enhancement_type: Type of enhancement to apply
            intensity: Enhancement intensity (0.5-2.0)
        
        Returns:
            Enhanced image as bytes
        """
        try:
            # Validate input
            if not ImageEnhancementService.validate_image(image_data):
                logger.error("Invalid image provided")
                return image_data
            
            # Clamp intensity
            intensity = max(0.5, min(2.0, intensity))
            
            # Open image
            image = Image.open(io.BytesIO(image_data))
            
            # Ensure RGB mode for processing
            if image.mode not in ['RGB', 'RGBA']:
                image = image.convert('RGB')
            
            # Apply enhancement based on type
            if enhancement_type == EnhancementType.AUTO:
                image = ImageEnhancementService.auto_enhance(image)
            elif enhancement_type == EnhancementType.SHARPNESS:
                image = ImageEnhancementService.enhance_sharpness(image, intensity)
            elif enhancement_type == EnhancementType.CONTRAST:
                image = ImageEnhancementService.enhance_contrast(image, intensity)
            elif enhancement_type == EnhancementType.BRIGHTNESS:
                image = ImageEnhancementService.enhance_brightness(image, intensity)
            elif enhancement_type == EnhancementType.SATURATION:
                image = ImageEnhancementService.enhance_saturation(image, intensity)
            elif enhancement_type == EnhancementType.DENOISE:
                image = ImageEnhancementService.denoise_image(image)
            
            # Convert back to bytes
            output = io.BytesIO()
            image.save(output, format='PNG', quality=95, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error enhancing image: {e}")
            return image_data
    
    @staticmethod
    def enhance_base64(
        base64_data: str,
        enhancement_type: EnhancementType = EnhancementType.AUTO,
        intensity: float = 1.0
    ) -> str:
        """
        Enhance a base64-encoded image and return enhanced base64
        
        Args:
            base64_data: Base64-encoded image (with or without data URI prefix)
            enhancement_type: Type of enhancement
            intensity: Enhancement intensity
        
        Returns:
            Base64-encoded enhanced image
        """
        try:
            # Remove data URI prefix if present
            if ',' in base64_data:
                base64_data = base64_data.split(',')[1]
            
            # Decode
            image_bytes = base64.b64decode(base64_data)
            
            # Enhance
            enhanced_bytes = ImageEnhancementService.enhance(
                image_bytes, 
                enhancement_type,
                intensity
            )
            
            # Encode
            return base64.b64encode(enhanced_bytes).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error enhancing base64 image: {e}")
            return base64_data


# Singleton instance
enhancement_service = ImageEnhancementService()
