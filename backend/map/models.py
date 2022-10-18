import datetime
from django.db import models
from django.db.models import Avg
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
import datetime
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)

class Image(models.Model): # Landmark and content images
    created = models.DateTimeField(editable=False)
    name = models.CharField(max_length=100, blank=True)
    src = models.ImageField(upload_to='images/', default='images/empty.jpg')
    class Meta:
        abstract = True
    def save(self, *args, **kwargs):
        self.created = timezone.now()
        return super(Image, self).save(*args, **kwargs)

class Comment(models.Model): # Landmark and content comments
    created = models.DateTimeField(editable=False)
    modified = models.DateTimeField(editable=False)
    text = models.CharField(max_length=500, blank=True)
    rating = models.IntegerField(default = 5, validators=[
            MaxValueValidator(5),
            MinValueValidator(1)
        ])
    class Meta:
        abstract = True
    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        self.modified = timezone.now()
        return super(Comment, self).save(*args, **kwargs)

class Landmark(models.Model):
    owner = models.ForeignKey(CustomUser, related_name='landmark', on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100)
    lat = models.FloatField(default = 0.0)
    lng = models.FloatField(default = 0.0)
    zIndex = models.IntegerField(default = 1)
    link = models.CharField(max_length=200, blank=True)
    coverImageSrc = models.ImageField(upload_to='images/', default='images/empty.jpg')
    is_visible = models.BooleanField(default=False)
    def __str__(self):
        return self.name
    def contentCount(self):
        cnt = 0
        for content in self.contents.all():
            if content.isGoing() and content.is_visible:
                cnt += 1
        return cnt
    def avgRating(self):
        return list(self.comments.all().aggregate(Avg('rating')).values())[0]

class LandmarkImage(Image):
    owner = models.ForeignKey(CustomUser, related_name='landmarkImages', on_delete=models.SET_NULL, null=True)
    landmark = models.ForeignKey(Landmark, related_name='images', on_delete=models.CASCADE)

class LandmarkComment(Comment):
    owner = models.ForeignKey(CustomUser, related_name='landmarkComments', on_delete=models.CASCADE)
    landmark = models.ForeignKey(Landmark, related_name='comments', on_delete=models.CASCADE)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["owner", "landmark"], name='unique_owner_landmark_comment')]

class Content(models.Model):
    owner = models.ForeignKey(CustomUser, related_name='content', on_delete=models.SET_NULL, null=True)
    landmark = models.ForeignKey(Landmark, related_name='contents', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    startDate = models.DateField(blank=True)
    endDate = models.DateField(blank=True)
    link = models.CharField(max_length=200, blank=True)
    description = models.CharField(max_length=3000, blank=True)
    coverImageSrc = models.ImageField(upload_to='images/', default='images/empty.jpg')
    is_visible = models.BooleanField(default=False)
    def __str__(self):
        return self.name
    def isGoing(self):
        curTime = datetime.date.today()
        if self.startDate and self.startDate > curTime:
            return False
        if self.endDate and self.endDate < curTime:
            return False
        return True
    def strDateInterval(self):
        return self.startDate.strftime('%B %d %Y') + " ~ " + self.endDate.strftime('%B %d %Y')
    def avgRating(self):
        return list(self.comments.all().aggregate(Avg('rating')).values())[0]

class ContentImage(Image):
    owner = models.ForeignKey(CustomUser, related_name='contentImages', on_delete=models.SET_NULL, null=True)
    content = models.ForeignKey(Content, related_name='images', on_delete=models.CASCADE)

class ContentComment(Comment):
    owner = models.ForeignKey(CustomUser, related_name='contentComments', on_delete=models.CASCADE)
    content = models.ForeignKey(Content, related_name='comments', on_delete=models.CASCADE)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["owner", "content"], name='unique_owner_content_comment')]