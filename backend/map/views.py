from django.shortcuts import get_object_or_404, render
from django.conf import settings
from django.http import Http404
from django.contrib.auth.models import User
from django.db.models import F
from django.core.cache import cache
from django_redis import get_redis_connection
import os
import pickle
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenVerifyView
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from .models import Landmark, Content, CustomUser, LandmarkReport, ContentReport
from .mail import SendAccActiveEmail
from .token import account_activation_token
from . import serializers
from .permissions import ReadOnly, IsOwnerOrReadOnly, IsAdminUserOrReadOnly, IsActivatedOrReadOnly
from .utils import search_score, find_nearest

r = get_redis_connection("default")

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

def get_querylist_landmark():
    landmarks = r.hvals('landmarks')
    if not landmarks:
        response = Landmark.objects.all()
        r.hmset('landmarks', {item.id:pickle.dumps(item) for item in response})
        return list(response)
    return list(map(pickle.loads, landmarks))

def get_landmark(lmid):
    landmark = r.hget('landmarks', lmid)
    if not landmark:
        try:
            response = Landmark.objects.get(pk=lmid)
            r.hset('landmarks', lmid, pickle.dumps(response))
            return response
        except Landmark.DoesNotExist:
            r.hdel('landmarks', lmid)
            raise Http404
    return pickle.loads(landmark)

def get_querylist_landmark_content(lmid):
    contents = r.hvals('lm%d_contents'%lmid)
    if not contents:
        try:
            response = Landmark.objects.get(pk=lmid).contents.all()
            if response: r.hmset('lm%d_contents'%lmid, {item.id:pickle.dumps(item) for item in response})
            return list(response)
        except Landmark.DoesNotExist:
            r.hdel('landmarks', lmid)
            raise Http404
    return list(map(pickle.loads, contents))

def get_landmark_content(lmid, ctid):
    content = r.hget('lm%d_contents'%lmid, ctid)
    if not content:
        try:
            response = Content.objects.get(pk=ctid)
            r.hset('lm%d_contents'%lmid, ctid, pickle.dumps(response))
            return response
        except Content.DoesNotExist:
            r.hdel('lm%d_contents'%lmid, ctid)
            raise Http404
    return pickle.loads(content)

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
            if settings.ACTIVATE_ON_REGISTER:
                user.is_verified = True
                serializer.data['is_verified'] = True
                user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendUserActivationMail(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        try:
            current_site = get_current_site(request)
            SendAccActiveEmail(request.user, current_site)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
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

class MarkerList(generics.ListAPIView):
    serializer_class = serializers.MarkerSerializer
    permission_classes = [ReadOnly]
    def get_queryset(self):
        return get_querylist_landmark()

class LandmarkOverviewList(generics.ListAPIView):
    serializer_class = serializers.LandmarkOverviewSerializer
    permission_classes = [ReadOnly]
    def get_queryset(self):
        return get_querylist_landmark()

class LandmarkList(generics.ListCreateAPIView):
    serializer_class = serializers.LandmarkSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        return get_querylist_landmark()
    def post(self, request, format=None):
        serializer = serializers.LandmarkSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.is_staff:
                obj = serializer.save(owner=request.user, is_visible=True)
            else:
                obj = serializer.save(owner=request.user, is_visible=False)
            r.hset('landmarks', obj.id, pickle.dumps(obj))
            r.expire('landmarks', settings.CACHE_TTL)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkOverviewDetail(generics.RetrieveAPIView):
    serializer_class = serializers.LandmarkOverviewSerializer
    permission_classes = [ReadOnly]
    def get_object(self):
        return get_landmark(self.kwargs['pk_lm'])

class LandmarkDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.LandmarkSerializer
    permission_classes = [(IsAdminUserOrReadOnly)]
    def get_queryset(self):
        return get_querylist_landmark()
    def get_object(self):
        return get_landmark(self.kwargs['pk_lm'])
    def patch(self, request, *args, **kwargs):
        try:
            obj_old = self.get_object()
            serializer = serializers.LandmarkSerializer(obj_old, data=request.data, partial=True)
            if serializer.is_valid():
                obj = serializer.save()
                r.hset('landmarks', obj.id, pickle.dumps(obj))
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            raise Http404
    def delete(self, request, *args, **kwargs):
        try:
            obj = self.get_object()
            r.hdel('landmarks', obj.id)
            obj.delete()
            return Response("Deleted", status=status.HTTP_204_NO_CONTENT)
        except:
            raise Http404

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

class LandmarkReportCreate(generics.CreateAPIView):
    serializer_class = serializers.LandmarkReportSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def post(self, request, pk_lm, format=None):
        serializer = serializers.LandmarkReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(landmark_id=pk_lm, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkReportDetail(generics.RetrieveDestroyAPIView):
    serializer_class = serializers.LandmarkReportSerializer
    permission_classes = [(IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            return Landmark.objects.get(pk=self.kwargs['pk_lm']).reports
        except Landmark.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'owner': self.kwargs['pk_user']}
        return get_object_or_404(queryset, **filter)

class LandmarksReportList(generics.ListAPIView):
    serializer_class = serializers.LandmarkReportSerializer
    permission_classes = [permissions.IsAdminUser]
    def get_queryset(self):
        return LandmarkReport.objects.all()

class LandmarkContentList(generics.ListCreateAPIView):
    serializer_class = serializers.ContentSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        return get_querylist_landmark_content(self.kwargs['pk_lm'])
    def post(self, request, pk_lm, format=None):
        serializer = serializers.ContentSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.is_staff:
                obj = serializer.save(landmark_id=pk_lm, owner=request.user, is_visible=True)
            else:
                obj = serializer.save(landmark_id=pk_lm, owner=request.user, is_visible=False)
            r.hset('lm%d_contents'%self.kwargs['pk_lm'], obj.id, pickle.dumps(obj))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LandmarkContentOverviewList(generics.ListAPIView):
    serializer_class = serializers.ContentOverviewSerializer
    permission_classes = [ReadOnly]
    def get_queryset(self):
        return get_querylist_landmark_content(self.kwargs['pk_lm'])

class ContentOverviewList(generics.ListAPIView):
    serializer_class = serializers.ContentOverviewSerializer
    permission_classes = [ReadOnly]
    def get_queryset(self):
        return Content.objects.all()

class ContentList(generics.ListAPIView):
    serializer_class = serializers.ContentSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def get_queryset(self):
        return Content.objects.all()

class ContentOverviewDetail(generics.RetrieveAPIView):
    serializer_class = serializers.ContentOverviewSerializer
    permission_classes = [ReadOnly]
    def get_queryset(self):
        return Content.objects.all()
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_ct']}
        return get_object_or_404(queryset, **filter)

class ContentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.ContentSerializer
    permission_classes = [(IsAdminUserOrReadOnly)]
    def get_queryset(self):
        return Content.objects.all()
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'pk': self.kwargs['pk_ct']}
        return get_object_or_404(queryset, **filter)
    def patch(self, request, *args, **kwargs):
        try:
            obj_old = self.get_object()
            serializer = serializers.ContentSerializer(obj_old, data=request.data, partial=True)
            if serializer.is_valid():
                obj = serializer.save()
                r.hset('lm%d_contents'%obj.landmark_id, obj.id, pickle.dumps(obj))
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            raise Http404
    def delete(self, request, *args, **kwargs):
        try:
            obj = self.get_object()
            r.hdel('lm%d_contents'%obj.landmark_id, obj.id)
            obj.delete()
            return Response("Deleted", status=status.HTTP_204_NO_CONTENT)
        except:
            raise Http404

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

class ContentReportCreate(generics.CreateAPIView):
    serializer_class = serializers.ContentReportSerializer
    permission_classes = [IsActivatedOrReadOnly]
    def post(self, request, pk_ct, format=None):
        serializer = serializers.ContentReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(content_id=pk_ct, owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContentReportDetail(generics.RetrieveDestroyAPIView):
    serializer_class = serializers.ContentReportSerializer
    permission_classes = [(IsOwnerOrReadOnly | IsAdminUserOrReadOnly)]
    def get_queryset(self):
        try:
            return Content.objects.get(pk=self.kwargs['pk_ct']).reports
        except Content.DoesNotExist:
            raise Http404
    def get_object(self):
        queryset = self.get_queryset()
        filter = {'owner': self.kwargs['pk_user']}
        return get_object_or_404(queryset, **filter)

class ContentsReportList(generics.ListAPIView):
    serializer_class = serializers.ContentReportSerializer
    permission_classes = [permissions.IsAdminUser]
    def get_queryset(self):
        return ContentReport.objects.all()

class SearchFast(APIView):
    '''
    Compare the searched pattern with landmark names, and return a list of landmark overviews sorted by f(Dice coefficient, distance to map center).
    Search landmark (cached) only to be faster
    request.data
        Argument        Type        Description
        pattern         string      searched pattern
        lat             float       map center lat
        lng             float       map center lng
        count           int         top {count} results will be returned
        thres           float       minimum score threshold
    '''
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        rq = request.data
        ls = serializers.LandmarkOverviewSerializer(get_querylist_landmark(), context={"request": request}, many=True).data
        for i, dic in enumerate(ls):
            ls[i]['score'] = search_score(dic, rq)
        ls.sort(key=lambda x: -x['score'])
        idx = 0
        while idx < min(len(ls), rq['count']) and ls[idx]['score'] >= rq['thres']:
            idx+=1
        return Response(ls[:idx], status=status.HTTP_200_OK)

class Search(APIView):
    '''
    Compare the searched pattern with landmark, content names, and return a list of landmark, content overviews sorted by f(Dice coefficient, distance to map center).
    request.data
        Argument        Type        Description
        pattern         string      searched pattern
        lat             float       map center lat
        lng             float       map center lng
        count           int         top {count} results will be returned
        thres           float       minimum score threshold
    '''
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        rq = request.data
        ls = serializers.LandmarkOverviewSerializer(get_querylist_landmark(), context={"request": request}, many=True).data + serializers.ContentOverviewSerializer(Content.objects.all(), context={"request": request}, many=True).data
        for i, dic in enumerate(ls):
            if('isGoing' in dic.keys() and not dic['isGoing']): ls[i]['score'] = -1000 # Non ongoing content
            else: ls[i]['score'] = search_score(dic, rq)
        ls.sort(key=lambda x: -x['score'])
        idx = 0
        while idx < min(len(ls), rq['count']) and ls[idx]['score'] >= rq['thres']:
            idx+=1
        return Response(ls[:idx], status=status.HTTP_200_OK)

class FindNearestLandmark(APIView):
    '''
    Find which landmark a content belongs to using its lat and lng. Returns the landmark with minimum distance. Returns nothing if minimum distance > thres.
    request.data
        Argument        Type        Description
        lat             float       content lat
        lng             float       content lng
        thres           float       minimum distance threshold
    '''
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        #rq = {'lat': 25.041367, 'lng': 121.52861840740967, 'thres':0.001}
        rq = request.data
        landmarks = serializers.MarkerSerializer(get_querylist_landmark(), context={"request": request}, many=True).data
        result = find_nearest(rq['lat'], rq['lng'], landmarks, rq['thres'])
        return Response(result, status=status.HTTP_200_OK)