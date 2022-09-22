from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

app_name = 'map'
urlpatterns = format_suffix_patterns([
    path('', views.index, name = 'index'),
    path('users/', views.UserList.as_view(), name='user_list'),    
    path('users/<int:pk_user>/', views.UserDetail.as_view(), name='user_detail'),
    path('users/register/', views.UserRegister.as_view(), name='user_register'),
    path('users/change_password/', views.UserChangePassword.as_view(), name='user_change_password'),
    path('users/send_acc_email/', views.SendUserActivationMail.as_view(), name='send_user_acc'),
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('activate/<str:uidb64>/<str:token>/', views.UserActivate.as_view(), name='user_activate'),  
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