import datetime
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
import datetime
from django.utils import timezone

# Create your models here.
class Image(models.Model): #Landmark and content images
    created = models.DateTimeField(editable=False)
    name = models.CharField(max_length=100, blank=True)
    src = models.ImageField(upload_to='images/', default='images/empty.jpg')
    class Meta:
        abstract = True
    def save(self, *args, **kwargs):
        self.created = timezone.now()
        return super(Image, self).save(*args, **kwargs)

class Comment(models.Model): #Landmark and content comments
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

class Landmark(models.Model): #museums
    name = models.CharField(max_length=100)
    lat = models.FloatField(default = 0.0)
    lng = models.FloatField(default = 0.0)
    zIndex = models.IntegerField(default = 1)
    link = models.CharField(max_length=200, blank=True)
    coverImageSrc = models.ImageField(upload_to='images/', default='images/empty.jpg')
    def __str__(self):
        return self.name

    def contentCount(self):
        cnt = 0
        for content in self.contents.all():
            if content.isGoing():
                cnt += 1
        return cnt

class LandmarkImage(Image):
    landmark = models.ForeignKey(Landmark, related_name='images', on_delete=models.CASCADE)

class LandmarkComment(Comment):
    landmark = models.ForeignKey(Landmark, related_name='comments', on_delete=models.CASCADE)

class Content(models.Model): #expositions, key from landmarks
    landmark = models.ForeignKey(Landmark, related_name='contents', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    startDate = models.DateField(blank=True)
    endDate = models.DateField(blank=True)
    link = models.CharField(max_length=200, blank=True)
    coverImageSrc = models.ImageField(upload_to='images/', default='images/empty.jpg')

    class Meta:
        ordering = ['startDate', 'endDate']

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

class ContentImage(Image):
    content = models.ForeignKey(Content, related_name='images', on_delete=models.CASCADE)

class ContentComment(Comment):
    content = models.ForeignKey(Content, related_name='comments', on_delete=models.CASCADE)