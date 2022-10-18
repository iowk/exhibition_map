from django.shortcuts import get_object_or_404, render
from django.conf import settings
from django.http import Http404
from django.contrib.auth.models import User
from django.db.models import F
import os
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenVerifyView
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from .models import Landmark, Content, CustomUser
from .mail import SendAccActiveEmail
from .token import account_activation_token
from . import serializers
from .permissions import ReadOnly, IsOwnerOrReadOnly, IsAdminUserOrReadOnly, IsActivatedOrReadOnly
from .utils import search_score

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

class CurrentUser(generics.RetrieveAPIView):
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.AllowAny]
    def get_object(self):
        return self.request.user

class UserComment(generics.RetrieveAPIView):
    serializer_class = serializers.UserCommentSerializer
    permission_classes = [permissions.AllowAny]
    def get_object(self):
        try:
            obj = CustomUser.objects.get(pk=self.kwargs['pk_user'])
            serializer = serializers.UserCommentSerializer(instance=obj)
            return serializer.data
        except CustomUser.DoesNotExist:
            raise Http404

class UserList(generics.ListAPIView):
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAdminUser]
    def get_queryset(self):
        return CustomUser.objects.all()

class UserDetail(generics.RetrieveDestroyAPIView):
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAdminUser]
    def get_queryset(self):
        return CustomUser.objects.all()
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_user']}
        return get_object_or_404(queryset, **filter)

class UserRegister(generics.CreateAPIView):
    serializer_class = serializers.UserRegisterSerializer
    permission_classes = [permissions.AllowAny]
    def post(self, request, format=None): 
        serializer = serializers.UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = CustomUser.objects.create_user(   
                serializer.data['username'],
                serializer.data['email'],
                serializer.data['password']
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendUserActivationMail(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        current_site = get_current_site(request)
        try:            
            SendAccActiveEmail(request.user, current_site)
            return Response(status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

class UserActivate(generics.RetrieveAPIView):
    serializer_class = serializers.UserActivateSerializer
    permission_classes = [permissions.AllowAny]
    def get_object(self):
        try:  
            uid = force_str(urlsafe_base64_decode(self.kwargs['uidb64']))  
            user = CustomUser.objects.get(pk=uid)  
        except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):  
            user = None
        if user is not None and account_activation_token.check_token(user, self.kwargs['token']):  
            user.is_verified = True  
            user.save()
        return {'is_verified': user.is_verified}

class UserChangePassword(generics.UpdateAPIView):
    serializer_class = serializers.UserChangePasswordSerializer
    permission_classes = [(IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_object(self):
        return self.request.user
    def update(self, request, format=None):
        self.object = self.get_object()
        serializer = serializers.UserChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if not self.object.check_password(serializer.data.get("old_password")):
            return Response({"old_password": ["Wrong password"]}, status=status.HTTP_400_BAD_REQUEST)
        self.object.set_password(serializer.data.get("new_password"))
        self.object.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = serializers.MyTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

class LandmarkList(generics.ListCreateAPIView):
    serializer_class = serializers.LandmarkSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        return Landmark.objects.all()
    def post(self, request, format=None):
        serializer = serializers.LandmarkSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.is_staff:
                serializer.save(owner=request.user, is_visible=True)
            else:
                serializer.save(owner=request.user, is_visible=False)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.LandmarkSerializer
    permission_classes = [(IsAdminUserOrReadOnly)]
    def get_queryset(self):
        return Landmark.objects.all()
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_lm']}
        return get_object_or_404(queryset, **filter)

class LandmarkImageList(generics.ListCreateAPIView):
    serializer_class = serializers.LandmarkImageSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).images
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, format=None):
        serializer = serializers.LandmarkImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(landmark_id=pk_lm, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkImageDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.LandmarkImageSerializer
    permission_classes = [(IsAdminUserOrReadOnly)]
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
    serializer_class = serializers.LandmarkCommentSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).comments
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, format=None):        
        serializer = serializers.LandmarkCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(landmark_id=pk_lm, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkCommentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.LandmarkCommentSerializer
    permission_classes = [(IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).comments
        except Landmark.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'owner': self.kwargs['pk_user']}
        return get_object_or_404(queryset, **filter)

class LandmarkContentList(generics.ListCreateAPIView):
    serializer_class = serializers.ContentSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).contents
        except Landmark.DoesNotExist:
            raise Http404
    def post(self, request, pk_lm, format=None):
        serializer = serializers.ContentSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.is_staff:
                serializer.save(landmark_id=pk_lm, owner=request.user, is_visible=True)
            else:
                serializer.save(landmark_id=pk_lm, owner=request.user, is_visible=False)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.ContentSerializer
    permission_classes = [(IsAdminUserOrReadOnly)]
    def get_queryset(self):
        return Content.objects.all()
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_ct']}
        return get_object_or_404(queryset, **filter)

class ContentImageList(generics.ListCreateAPIView):
    serializer_class = serializers.ContentImageSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        try:
            return Content.objects.get(pk=self.kwargs['pk_ct']).images
        except Content.DoesNotExist:
            raise Http404
    def post(self, request, pk_ct, format=None):        
        serializer = serializers.ContentImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(content_id=pk_ct, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentImageDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.ContentImageSerializer
    permission_classes = [(IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            return Content.objects.get(pk=self.kwargs['pk_ct']).images
        except Content.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_image']}
        return get_object_or_404(queryset, **filter)

class ContentCommentList(generics.ListCreateAPIView):
    serializer_class = serializers.ContentCommentSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        try:
            return Content.objects.get(pk=self.kwargs['pk_ct']).comments
        except Content.DoesNotExist:
            raise Http404
    def post(self, request, pk_ct, format=None):        
        serializer = serializers.ContentCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(content_id=pk_ct, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentCommentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.ContentCommentSerializer
    permission_classes = [(IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            return Content.objects.get(pk=self.kwargs['pk_ct']).comments
        except Content.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'owner': self.kwargs['pk_user']}
        return get_object_or_404(queryset, **filter)

class Search(APIView):
    '''
    Compare the searched pattern with landmark, content names, and return a list of landmarks, contents sorted by Dice coefficient.
    request.data
        Argument        Type        Description
        pattern         string      searched pattern
        lat             float       map center lat
        lng             float       map center lng
        count           int         top {count} results will be returned
        thres           int         minimum score threshold 
    '''
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        #rq = {'lat': 24.2, 'lng': 122.2, 'pattern': 'huashan', 'count': 100, 'thres': 0.001}
        rq = request.data
        ls = serializers.LandmarkSerializer(Landmark.objects.all(), context={"request": request}, many=True).data + serializers.ContentSerializer(Content.objects.all(), context={"request": request}, many=True).data
        for i, dic in enumerate(ls):
            if('isGoing' in dic.keys() and not dic['isGoing']): ls[i]['score'] = -1000 # Non ongoing content
            else: ls[i]['score'] = search_score(dic, rq)
        ls.sort(key=lambda x: -x['score'])
        idx = 0
        while idx < min(len(ls), rq['count']) and ls[idx]['score'] >= rq['thres']:
            idx+=1
        return Response(ls[:idx], status=status.HTTP_200_OK)
