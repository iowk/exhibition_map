from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.template.loader import render_to_string  
from django.core.mail import send_mail
from django.conf import settings
from .token import account_activation_token 

def SendAccActiveEmail(user, current_site):  
    mail_subject = 'Exhibition map activation email'  
    message = render_to_string('acc_active_email.html', {  
        'user': user,  
        'domain': settings.FRONTEND_PATH, 
        'uid':urlsafe_base64_encode(force_bytes(user.id)),  
        'token':account_activation_token.make_token(user),  
    })
    send_mail(
        subject = mail_subject, 
        message = message, 
        from_email = settings.EMAIL_HOST_USER, 
        recipient_list=[user.email]  
    )
