from rest_framework import serializers
from django.contrib.auth.models import User
from map.models import Landmark, LandmarkImage, LandmarkComment, Content, ContentImage, ContentComment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'is_staff', 'landmarkImages', 'contentImages', 'landmarkComments', 'contentComments']

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password']

class LandmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Landmark
        fields = ['id', 'name', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc', 'contentCount', 'avgRating']

class LandmarkImageSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = LandmarkImage
        fields = ['id', 'owner', 'created', 'name', 'src', 'landmark_id']

class LandmarkCommentSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = LandmarkComment
        fields = ['id', 'owner', 'created', 'modified', 'text', 'rating', 'landmark_id']

class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = ['id', 'name', 'startDate', 'endDate', 'link', 'coverImageSrc', 'isGoing', 'avgRating']

    def validate(self, data):
        if data['startDate'] > data['endDate']:
            raise serializers.ValidationError("Start date should be earlier than end date")
        return data

class ContentImageSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = ContentImage
        fields = ['id', 'owner', 'created', 'name', 'src', 'content_id']

class ContentCommentSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = ContentComment
        fields = ['id', 'owner', 'created', 'modified', 'text', 'rating', 'content_id']