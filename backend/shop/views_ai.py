"""
AI-powered API endpoints for Printsy
Includes image enhancement, recommendations, and quality analysis
"""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .ai_enhancement import enhancement_service, EnhancementType

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def enhance_image(request):
    """
    Enhance an image using AI algorithms
    
    POST /api/ai/enhance-image/
    
    Request body:
    {
        "image": "<base64 data URI or base64 string>",
        "enhancement_type": "auto|sharpness|contrast|brightness|saturation|denoise",
        "intensity": 1.0  // Optional, default 1.0 (0.5-2.0)
    }
    
    Response:
    {
        "success": true,
        "enhanced_image": "<base64 string>",
        "enhancement_type": "auto",
        "original_size": 15000,
        "enhanced_size": 14500
    }
    """
    try:
        image_data = request.data.get('image')
        enhancement_type = request.data.get('enhancement_type', 'auto')
        intensity = float(request.data.get('intensity', 1.0))
        
        if not image_data:
            return Response(
                {'error': 'Image data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate enhancement type
        try:
            enhancement_type_enum = EnhancementType(enhancement_type.lower())
        except ValueError:
            return Response(
                {'error': f'Invalid enhancement type. Choose from: {", ".join([e.value for e in EnhancementType])}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clamp intensity
        if not (0.5 <= intensity <= 2.0):
            return Response(
                {'error': 'Intensity must be between 0.5 and 2.0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get original size for comparison
        original_size = len(image_data)
        
        # Enhance image
        enhanced_base64 = enhancement_service.enhance_base64(
            image_data,
            enhancement_type_enum,
            intensity
        )
        
        return Response({
            'success': True,
            'enhanced_image': enhanced_base64,
            'enhancement_type': enhancement_type,
            'intensity': intensity,
            'original_size': original_size,
            'enhanced_size': len(enhanced_base64),
            'message': f'Image enhanced with {enhancement_type} at {intensity}x intensity'
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        logger.error(f"Validation error in enhance_image: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error enhancing image: {e}")
        return Response(
            {'error': 'Failed to enhance image'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_image_quality(request):
    """
    Analyze if an image is suitable for printing
    
    POST /api/ai/analyze-quality/
    
    Request body:
    {
        "image": "<base64 data URI>"
    }
    
    Response:
    {
        "quality_score": 0.85,  // 0-1
        "recommendations": [
            "Increase brightness",
            "Reduce noise"
        ],
        "suitable_for_printing": true,
        "suggested_size": "4R"
    }
    """
    try:
        image_data = request.data.get('image')
        
        if not image_data:
            return Response(
                {'error': 'Image data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simple quality analysis (can be enhanced with ML)
        import base64
        from PIL import Image
        import io
        
        # Decode image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Analyze image properties
        width, height = image.size
        pixel_count = width * height
        
        # Simple quality heuristics
        recommendations = []
        quality_score = 0.7  # Base score
        
        # Resolution check (minimum 1 megapixel)
        if pixel_count < 1_000_000:
            recommendations.append("Image resolution is low. Recommended: at least 1 megapixel")
            quality_score -= 0.2
        elif pixel_count > 10_000_000:
            quality_score += 0.1  # High resolution bonus
        else:
            quality_score += 0.05
        
        # Aspect ratio check
        aspect_ratio = width / height if height > 0 else 1
        if 0.6 < aspect_ratio < 1.7:  # Common print ratios
            quality_score += 0.1
        else:
            recommendations.append("Aspect ratio may not be optimal for standard print sizes")
        
        # Suggested size based on resolution
        if pixel_count < 1_000_000:
            suggested_size = "2x3"
        elif pixel_count < 2_000_000:
            suggested_size = "4R"
        elif pixel_count < 5_000_000:
            suggested_size = "5R"
        elif pixel_count < 8_000_000:
            suggested_size = "8R"
        else:
            suggested_size = "A4"
        
        # Clamp quality score
        quality_score = max(0.0, min(1.0, quality_score))
        suitable_for_printing = quality_score > 0.5
        
        return Response({
            'quality_score': round(quality_score, 2),
            'recommendations': recommendations,
            'suitable_for_printing': suitable_for_printing,
            'suggested_size': suggested_size,
            'image_properties': {
                'width': width,
                'height': height,
                'megapixels': round(pixel_count / 1_000_000, 2),
                'format': image.format,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        return Response(
            {'error': 'Failed to analyze image'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_enhancement_options(request):
    """
    Get available enhancement types and their descriptions
    
    GET /api/ai/enhancement-options/
    """
    options = {
        'enhancement_types': [
            {
                'value': 'auto',
                'label': 'Auto Enhancement',
                'description': 'Automatically applies optimal enhancements',
                'default_intensity': 1.0
            },
            {
                'value': 'sharpness',
                'label': 'Sharpness',
                'description': 'Enhance image sharpness and details',
                'default_intensity': 1.5
            },
            {
                'value': 'contrast',
                'label': 'Contrast',
                'description': 'Increase contrast between light and dark areas',
                'default_intensity': 1.3
            },
            {
                'value': 'brightness',
                'label': 'Brightness',
                'description': 'Adjust overall brightness',
                'default_intensity': 1.1
            },
            {
                'value': 'saturation',
                'label': 'Saturation',
                'description': 'Enhance color saturation',
                'default_intensity': 1.2
            },
            {
                'value': 'denoise',
                'label': 'Denoise',
                'description': 'Reduce image noise',
                'default_intensity': 1.0
            },
        ],
        'intensity_range': {
            'min': 0.5,
            'max': 2.0,
            'default': 1.0
        }
    }
    return Response(options, status=status.HTTP_200_OK)
