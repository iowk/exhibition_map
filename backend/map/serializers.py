from rest_framework import serializers
from . import models
from django.core import exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import django.contrib.auth.password_validation as validators

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CustomUser
        fields = ['id', 'username', 'email', 'is_staff', 'is_verified']

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

class MarkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Landmark
        fields = ['id', 'name', 'lat', 'lng', 'zIndex', 'is_visible', 'contentCount']

class LandmarkOverviewSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = models.Landmark
        fields = ['id',  'owner', 'name', 'name_eng', 'lat', 'lng', 'zIndex', 'coverImageSrc', 'is_visible', 'contentCount', 'avgRating']

class LandmarkSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = models.Landmark
        fields = ['id', 'owner', 'name', 'name_eng', 'lat', 'lng', 'zIndex', 'link', 'price', 'coverImageSrc', 'is_visible', 'contentCount', 'avgRating']

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

class ContentOverviewSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    lat = serializers.ReadOnlyField(source='landmark.lat')
    lng = serializers.ReadOnlyField(source='landmark.lng')
    landmark_name = serializers.ReadOnlyField(source='landmark.name')
    landmark_name_eng = serializers.ReadOnlyField(source='landmark.name_eng')
    class Meta:
        model = models.Content
        fields = ['id', 'owner', 'landmark_id', 'landmark_name', 'landmark_name_eng', 'lat', 'lng', 'name', 'name_eng', 'startDate', 'endDate', 'coverImageSrc', 'is_visible', 'isGoing', 'avgRating']

    def validate_start_date(self, data):
        if data['startDate'] > data['endDate']:
            raise serializers.ValidationError("Start date should be earlier than end date")
        return data

class ContentSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    lat = serializers.ReadOnlyField(source='landmark.lat')
    lng = serializers.ReadOnlyField(source='landmark.lng')
    landmark_name = serializers.ReadOnlyField(source='landmark.name')
    landmark_name_eng = serializers.ReadOnlyField(source='landmark.name_eng')
    class Meta:
        model = models.Content
        fields = ['id', 'owner', 'landmark_id', 'landmark_name', 'landmark_name_eng', 'lat', 'lng', 'name', 'name_eng', 'startDate', 'endDate', 'link', 'description', 'price', 'coverImageSrc', 'is_visible', 'isGoing', 'avgRating']

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

class UserCommentSerializer(serializers.ModelSerializer):
    landmarkComments = LandmarkCommentSerializer(many=True, read_only=True)
    contentComments = ContentCommentSerializer(many=True, read_only=True)
    class Meta:
        model = models.CustomUser
        fields = ['id', 'landmarkComments', 'contentComments']

class LandmarkReportSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = models.LandmarkReport
        fields = ['id', 'owner', 'created', 'text', 'landmark_id']

class ContentReportSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = models.ContentReport
        fields = ['id', 'owner', 'created', 'text', 'content_id']