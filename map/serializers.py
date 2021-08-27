from rest_framework import serializers
from map.models import Landmark, LandmarkImage, LandmarkComment, Content, ContentImage, ContentComment

class LandmarkSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Landmark
        fields = ['id', 'name', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc']

class LandmarkImageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = LandmarkImage
        fields = ['id', 'created', 'name', 'src']

class LandmarkCommentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = LandmarkComment
        fields = ['id', 'created', 'modified', 'text', 'rating']

class ContentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Content
        fields = ['id', 'name', 'startDate', 'endDate', 'link', 'coverImageSrc']

class ContentImageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ContentImage
        fields = ['id', 'created', 'name', 'src']

class ContentCommentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ContentComment
        fields = ['id', 'created', 'modified', 'text', 'rating']