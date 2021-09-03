from map.serializers import UserSerializer, UserRegisterSerializer, UserChangePasswordSerializer, LandmarkSerializer, LandmarkCommentSerializer, LandmarkImageSerializer, ContentSerializer, ContentImageSerializer, ContentCommentSerializer
from map.permissions import IsOwnerOrReadOnly, IsAdminUserOrReadOnly
from django.shortcuts import get_object_or_404, render
from django.conf import settings
from django.http import Http404
from django.contrib.auth.models import User
import os
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from rest_framework import permissions

from .models import Landmark, Content, CustomUser

# Create your views here.
class MapInfo:
    def __init__(self, center, zoom):
        self.lat = center[0]
        self.lng = center[1]
        self.zoom = zoom

def index(request):
    template_name = 'map/index.html'
    mapDisplayInfo = MapInfo(center = [38.702153249882926, -0.48110166784168], zoom = 15)
    landmarks = Landmark.objects.all()
    mapAPI = os.environ['GOOGLE_MAP_API_KEY']
    return render(request, template_name, {
        'mapAPI': mapAPI,
        'mapDisplayInfo': mapDisplayInfo,
        'landmarks': landmarks,
    })

class UserList(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      permissions.IsAdminUser]
    def get_queryset(self):
        return CustomUser.objects.all()

class UserDetail(generics.RetrieveDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      permissions.IsAdminUser]
    def get_queryset(self):
        return CustomUser.objects.all()
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_user']}
        return get_object_or_404(queryset, **filter)

class UserRegister(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    def get_queryset(self):
        return CustomUser.objects.all()
    def post(self, request, format=None):        
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            CustomUser.objects.create_user(                
                serializer.data['username'],
                serializer.data['email'],
                serializer.data['password']
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserChangePassword(generics.UpdateAPIView):
    serializer_class = UserChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      (IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_object(self):
        return self.request.user
    def update(self, request, format=None):
        self.object = self.get_object()
        serializer = UserChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if not self.object.check_password(serializer.data.get("old_password")):
            return Response({"old_password": ["Wrong password"]}, status=status.HTTP_400_BAD_REQUEST)
        self.object.set_password(serializer.data.get("new_password"))
        self.object.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class LandmarkList(generics.ListCreateAPIView):
    serializer_class = LandmarkSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      IsAdminUserOrReadOnly]
    def get_queryset(self):
        return Landmark.objects.all()

class LandmarkDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LandmarkSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      IsAdminUserOrReadOnly]
    def get_queryset(self):
        return Landmark.objects.all()
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_lm']}
        return get_object_or_404(queryset, **filter)

class LandmarkImageList(generics.ListCreateAPIView):
    serializer_class = LandmarkImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).images
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, format=None):        
        serializer = LandmarkImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(landmark_id=pk_lm, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkImageDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LandmarkImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      (IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).images
        except Landmark.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_image']}
        return get_object_or_404(queryset, **filter)

class LandmarkCommentList(generics.ListCreateAPIView):
    serializer_class = LandmarkCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).comments
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, format=None):        
        serializer = LandmarkCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(landmark_id=pk_lm, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkCommentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LandmarkCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      (IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).comments
        except Landmark.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_comment']}
        return get_object_or_404(queryset, **filter)

class ContentList(generics.ListCreateAPIView):
    serializer_class = ContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      IsAdminUserOrReadOnly]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).contents
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, format=None):        
        serializer = ContentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(landmark_id=pk_lm)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      IsAdminUserOrReadOnly]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).contents
        except Landmark.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_ct']}
        return get_object_or_404(queryset, **filter)

class ContentImageList(generics.ListCreateAPIView):
    serializer_class = ContentImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        try:
            contents = Landmark.objects.get(pk=self.kwargs['pk_lm']).contents
            try:
                return contents.get(pk=self.kwargs['pk_ct']).images
            except Content.DoesNotExist:
                raise Http404
        except Landmark.DoesNotExist:
            raise Http404    
    def post(self, request, pk_lm, pk_ct, format=None):        
        serializer = ContentImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(content_id=pk_ct, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentImageDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContentImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      (IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            contents = Landmark.objects.get(pk=self.kwargs['pk_lm']).contents
            try:
                return contents.get(pk=self.kwargs['pk_ct']).images
            except Content.DoesNotExist:
                raise Http404
        except Landmark.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_image']}
        return get_object_or_404(queryset, **filter)

class ContentCommentList(generics.ListCreateAPIView):
    serializer_class = ContentCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        try:
            contents = Landmark.objects.get(pk=self.kwargs['pk_lm']).contents
            try:
                return contents.get(pk=self.kwargs['pk_ct']).comments
            except Content.DoesNotExist:
                raise Http404
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, pk_ct, format=None):        
        serializer = ContentCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(content_id=pk_ct, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentCommentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContentCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                      (IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            contents = Landmark.objects.get(pk=self.kwargs['pk_lm']).contents
            try:
                return contents.get(pk=self.kwargs['pk_ct']).comments
            except Content.DoesNotExist:
                raise Http404
        except Landmark.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_comment']}
        return get_object_or_404(queryset, **filter)