from map.serializers import LandmarkSerializer, LandmarkCommentSerializer, LandmarkImageSerializer, ContentSerializer, ContentImageSerializer, ContentCommentSerializer
from django.shortcuts import get_object_or_404, render
from django.core import serializers
from django.db.models import Count
from django.conf import settings
from django.http import Http404
import os
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import generics

from .models import Landmark, Content

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

class LandmarkList(generics.ListCreateAPIView):
    serializer_class = LandmarkSerializer
    def get_queryset(self):
        return Landmark.objects.all()

class LandmarkDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LandmarkSerializer
    def get_queryset(self):
        return Landmark.objects.all()
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_lm']}
        return get_object_or_404(queryset, **filter)

class LandmarkImageList(generics.ListCreateAPIView):
    serializer_class = LandmarkImageSerializer
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).images
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, format=None):        
        serializer = LandmarkImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(landmark_id=pk_lm)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkImageDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LandmarkImageSerializer
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
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).comments
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, format=None):        
        serializer = LandmarkCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(landmark_id=pk_lm)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkCommentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LandmarkCommentSerializer
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
            serializer.save(content_id=pk_ct)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentImageDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContentImageSerializer
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
            serializer.save(content_id=pk_ct)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentCommentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContentCommentSerializer
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