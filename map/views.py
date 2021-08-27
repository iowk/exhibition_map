from map.serializers import LandmarkSerializer, LandmarkCommentSerializer, LandmarkImageSerializer, ContentSerializer, ContentImageSerializer, ContentCommentSerializer
from django.shortcuts import render
from django.core import serializers
from django.db.models import Count
from django.conf import settings
from django.http import Http404
import os
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.parsers import FileUploadParser

from .models import Landmark, LandmarkImage, Content

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

class LandmarkList(APIView):
    def get(self, request, format=None):
        landmarks = Landmark.objects.all()
        serializer = LandmarkSerializer(landmarks, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = LandmarkSerializer(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkDetail(APIView):
    def get_landmark(self, pk):
        try:
            return Landmark.objects.get(pk=pk)
        except Landmark.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        landmark = self.get_landmark(pk)        
        serializer = LandmarkSerializer(landmark)
        return Response(serializer.data)
    
    def put(self, request, pk, format=None):
        landmark = self.get_landmark(pk)
        serializer = LandmarkSerializer(landmark, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, format=None):
        landmark = self.get_landmark(pk)
        serializer = LandmarkSerializer(landmark, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        landmark = self.get_landmark(pk)
        landmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class LandmarkImageList(APIView):
    def get(self, request, pk, format=None):
        landmark = LandmarkDetail.get_landmark(self, pk)
        serializer = LandmarkImageSerializer(landmark.images, many=True)
        return Response(serializer.data)

    def post(self, request, pk, format=None):
        landmark = LandmarkDetail.get_landmark(self, pk)
        serializer = LandmarkImageSerializer(landmark.images, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkImageDetail(APIView):
    def get_image(self, pk, pk_image):
        landmark = LandmarkDetail.get_landmark(self, pk)
        try:
            return landmark.images.get(pk=pk_image)
        except LandmarkImage.DoesNotExist:
            raise Http404      

    def get(self, request, pk, pk_image, format=None):
        image = self.get_image(pk, pk_image)
        serializer = LandmarkImageSerializer(image)
        return Response(serializer.data)
    
    def put(self, request, pk, pk_image, format=None):
        image = self.get_image(pk, pk_image)
        serializer = LandmarkImageSerializer(image, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, pk_image, format=None):
        image = self.get_image(pk, pk_image)
        serializer = LandmarkImageSerializer(image, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, pk_image, format=None):
        image = self.get_image(pk, pk_image)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class LandmarkCommentList(APIView):
    def get(self, request, pk, format=None):
        landmark = LandmarkDetail.get_landmark(self, pk)
        serializer = LandmarkCommentSerializer(landmark.comments, many=True)
        return Response(serializer.data)

    def post(self, request, pk, format=None):
        landmark = LandmarkDetail.get_landmark(self, pk)
        serializer = LandmarkCommentSerializer(landmark.comments, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkCommentDetail(APIView):
    def get_image(self, pk, pk_image):
        landmark = LandmarkDetail.get_landmark(self, pk)
        try:
            return landmark.images.get(pk=pk_image)
        except LandmarkImage.DoesNotExist:
            raise Http404      

    def get(self, request, pk, pk_image, format=None):
        image = self.get_image(pk, pk_image)
        serializer = LandmarkImageSerializer(image)
        return Response(serializer.data)
    
    def put(self, request, pk, pk_image, format=None):
        image = self.get_image(pk, pk_image)
        serializer = LandmarkImageSerializer(image, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, pk_image, format=None):
        image = self.get_image(pk, pk_image)
        serializer = LandmarkImageSerializer(image, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, pk_image, format=None):
        image = self.get_image(pk, pk_image)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ContentList(APIView):
    def get_content(self, pk, pk_cont):
        landmark = LandmarkDetail.get_landmark(self, pk)
        try:
            return landmark.contents.get(pk=pk_cont)
        except Content.DoesNotExist:
            raise Http404
    
    def get(self, request, pk, pk_cont, format=None):
        content = self.get_content(pk, pk_cont)
        serializer = ContentSerializer(content)
        return Response(serializer.data)
    
    def post(self, request, pk, pk_cont, format=None):
        content = self.get_content(pk, pk_cont)
        serializer = ContentSerializer(content, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
