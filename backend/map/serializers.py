from rest_framework import serializers
from . import models
from django.core import exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import django.contrib.auth.password_validation as validators

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CustomUser
        fields = ['id', 'username', 'email', 'is_staff', 'is_verified', 'landmarkImages', 'contentImages', 'landmarkComments', 'contentComments']

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CustomUser
        fields = ['id', 'username', 'email', 'password']
    def validate_password(self, value): 
        try:
            validators.validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))          
        return value

class UserActivateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CustomUser
        fields = ['is_verified']

class UserChangePasswordSerializer(serializers.Serializer):
    model = models.CustomUser
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = user.username
        return token

class LandmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Landmark
        fields = ['id', 'owner', 'name', 'lat', 'lng', 'zIndex', 'link', 'coverImageSrc', 'contentCount', 'avgRating']

class LandmarkImageSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = models.LandmarkImage
        fields = ['id', 'owner', 'created', 'name', 'src', 'landmark_id']

class LandmarkCommentSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = models.LandmarkComment
        fields = ['id', 'owner', 'created', 'modified', 'text', 'rating', 'landmark_id']

class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Content
        fields = ['id', 'owner', 'name', 'startDate', 'endDate', 'link', 'coverImageSrc', 'isGoing', 'avgRating']

    def validate_start_date(self, data):
        if data['startDate'] > data['endDate']:
            raise serializers.ValidationError("Start date should be earlier than end date")
        return data

class ContentImageSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = models.ContentImage
        fields = ['id', 'owner', 'created', 'name', 'src', 'content_id']

class ContentCommentSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = models.ContentComment
        fields = ['id', 'owner', 'created', 'modified', 'text', 'rating', 'content_id']