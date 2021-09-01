from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

app_name = 'map'
urlpatterns = format_suffix_patterns([
    path('', views.index, name = 'index'),
    path('landmarks/', views.LandmarkList.as_view(), name='landmark_list'),
    path('landmarks/<int:pk_lm>/', views.LandmarkDetail.as_view(), name='landmark_detail'),
    path('landmarks/<int:pk_lm>/images/', views.LandmarkImageList.as_view(), name='landmark_image_list'),
    path('landmarks/<int:pk_lm>/images/<int:pk_image>/', views.LandmarkImageDetail.as_view(), name='landmark_image_detail'),
    path('landmarks/<int:pk_lm>/comments/', views.LandmarkCommentList.as_view(), name='landmark_comment_list'),
    path('landmarks/<int:pk_lm>/comments/<int:pk_comment>/', views.LandmarkCommentDetail.as_view(), name='landmark_comment_detail'),
    path('landmarks/<int:pk_lm>/contents/', views.ContentList.as_view(), name='content_list'),
    path('landmarks/<int:pk_lm>/contents/<int:pk_ct>/', views.ContentDetail.as_view(), name='content_detail'),
    path('landmarks/<int:pk_lm>/contents/<int:pk_ct>/images/', views.ContentImageList.as_view(), name='content_image_list'),
    path('landmarks/<int:pk_lm>/contents/<int:pk_ct>/images/<int:pk_image>/', views.ContentImageDetail.as_view(), name='content_image_detail'),
    path('landmarks/<int:pk_lm>/contents/<int:pk_ct>/comments/', views.ContentCommentList.as_view(), name='content_comment_list'),
    path('landmarks/<int:pk_lm>/contents/<int:pk_ct>/comments/<int:pk_comment>/', views.ContentCommentDetail.as_view(), name='content_comment_detail'),
])