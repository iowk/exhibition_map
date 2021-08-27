from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

app_name = 'map'
urlpatterns = format_suffix_patterns([
    path('', views.index, name = 'index'),
    path('landmark/', views.LandmarkList.as_view(), name='landmark_list'),
    path('landmark/<int:pk>/', views.LandmarkDetail.as_view(), name='landmark_detail'),
    path('landmark/<int:pk>/images/', views.LandmarkImageList.as_view(), name='landmark_image_list'),
    path('landmark/<int:pk>/images/<int:pk_image>/', views.LandmarkImageDetail.as_view(), name='landmark_image_detail'),
])