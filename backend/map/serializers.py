from rest_framework import serializers
from .models import CustomUser, Landmark, LandmarkImage, LandmarkComment, Content, ContentImage, ContentComment
from django.core import exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import django.contrib.auth.password_validation as validators

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'is_staff', 'landmarkImages', 'contentImages', 'landmarkComments', 'contentComments']

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']
    def validate_password(self, value): 
        try:
            validators.validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))          
        return value

class UserActivateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['is_active']

class UserChangePasswordSerializer(serializers.Serializer):
    model = CustomUser
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['name'] = user.username
        # ...

        return token

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