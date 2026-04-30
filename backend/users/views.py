from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from django.forms.models import model_to_dict
from rest_framework import status
from django.core.files.storage import FileSystemStorage
from django.core.mail import send_mail
from django.conf import settings
import json
import secrets
import string
from .models import Owner, Manager, CustomUser, Hotel
from api.serializers import OwnerSerializer, ManagerSerializer
# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createManagerView(request):
    user = request.user
    if user.role!='Owner':
        return Response(data={'detail':'you are not allowed to create manager account.'}, status=status.HTTP_401_UNAUTHORIZED)
    data = json.loads(request.data.get('data',"{ }"))
    if data['user']['password']!=data['user']['password2']:
        return Response(data={'detail': 'password and confirm password do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    data['user'].pop('password2')
    owner = Owner.objects.get(user=user.id)

    data['owner'] = owner.id
    manager_serializer = ManagerSerializer(data=data)
    if manager_serializer.is_valid():
        manager = manager_serializer.save()
        # Send welcome email to the new manager
        try:
            mgr_user = manager.user
            send_mail(
                subject='Welcome to Hotel Hive! 🏨',
                message=(
                    f'Hello {mgr_user.first_name or mgr_user.email},\n\n'
                    f'Welcome to Hotel Hive — your all-in-one multi-hotel management platform!\n\n'
                    f'Your manager account has been created by {owner.user.first_name or owner.user.email} '
                    f'({owner.company_name}).\n\n'
                    f'You have been assigned to: {manager.hotel.name if manager.hotel else "(no hotel yet)"}\n\n'
                    f'With your account you can:\n'
                    f'  • Manage room bookings and availability\n'
                    f'  • Track customers and check-ins\n'
                    f'  • View hotel dashboard and analytics\n\n'
                    f'Log in now at: {request.build_absolute_uri("/login")}\n'
                    f'Your login email: {mgr_user.email}\n\n'
                    f'If you did not expect this email, please contact your hotel owner.\n\n'
                    f'Warm regards,\n'
                    f'The Hotel Hive Team 🏨'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[mgr_user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f'Welcome email error (manager): {e}')
        serialized_manager = ManagerSerializer(manager)
        return Response(serialized_manager.data, status=status.HTTP_201_CREATED)
    else:
        return Response(data={'detail': 'Invalid request: Validation failed', 'errors': manager_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def createOwnerView(request):
    data = json.loads(request.data.get('data',"{ }"))
    if data['user']['password']!=data['user']['password2']:
        return Response(data={'detail': 'password and confirm password do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    data['user'].pop('password2')

    owner_serializer = OwnerSerializer(data=data)
    if owner_serializer.is_valid():
        owner = owner_serializer.save()
        # Send welcome email
        try:
            user = owner.user
            send_mail(
                subject='Welcome to Hotel Hive! 🏨',
                message=(
                    f'Hello {user.first_name or user.email},\n\n'
                    f'Welcome to Hotel Hive — your all-in-one multi-hotel management platform!\n\n'
                    f'Your owner account has been created successfully. Here\'s what you can do:\n'
                    f'  • Add and manage multiple hotels\n'
                    f'  • Register and assign managers to your hotels\n'
                    f'  • Track bookings and customers in real time\n'
                    f'  • View dashboard analytics at a glance\n\n'
                    f'Log in now at: {request.build_absolute_uri("/login")}\n\n'
                    f'If you have any questions, feel free to contact us.\n\n'
                    f'Warm regards,\n'
                    f'The Hotel Hive Team 🏨'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f'Welcome email error (owner): {e}')
        serialized_owner = OwnerSerializer(owner)
        return Response(serialized_owner.data, status=status.HTTP_201_CREATED)
    else:
        return Response(data={'detail': 'Invalid request: Validation failed', 'errors': owner_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getManager(request):
    try:
        manager = Manager.objects.get(user=request.user.id)  # Get the manager profile if it exists
    except Manager.DoesNotExist:
         return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    manager_serializer = ManagerSerializer(manager)
    return Response(manager_serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOwner(request):
    try:
        owner = Owner.objects.get(user=request.user.id)  # Get the manager profile if it exists
    except Owner.DoesNotExist:
         return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    owner_serializer = OwnerSerializer(owner)
    return Response(owner_serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateProfile(request):
    curUser = request.user
    try:
        data = json.loads(request.data.get('data', '{ }'))
        image = request.FILES.get('profile_image', None)
        user = CustomUser.objects.get(id=request.user.id)
        user.first_name = data['user']['first_name']
        user.last_name = data['user']['last_name']
        user.phone_number = data['user']['phone_number']

        if image:
            file_name = f'Images/profiles/user_{user.id}_{image.name}'
            fs = FileSystemStorage()
            if user.profile_image and fs.exists(user.profile_image.path):
                fs.delete(user.profile_image.path)
            file_name = fs.save(file_name,image)
            user.profile_image = file_name
        user.save()
        if curUser.role=='Owner':
            company_name = data['company_name']
            if company_name:
                owner = Owner.objects.get(user=curUser.id)
                owner.company_name = company_name
                owner.save()


    except Exception as e:
        print(e)
        return(Response({'detail':'Error'},status=status.HTTP_400_BAD_REQUEST))
    return Response({'detail':"data saved"}, status=status.HTTP_200_OK)






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserType(request):
    return Response({"role":request.user.role}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getManagerList(request):
    user = request.user
    if user.role!='Owner':
        return Response({'detail':'Only owners can access list of managers.'}, status=status.HTTP_401_UNAUTHORIZED)
    owner = Owner.objects.get(user=user.id)
    managerList = Manager.objects.filter(owner=owner.id)
    managerdata = [{'id':manager.id, 'name':f'{manager.user.first_name} {manager.user.last_name}', 'phone_number':manager.user.phone_number, 'hotel':manager.hotel.name} for manager in managerList]
    
    return Response(managerdata, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteManager(request):
    user = request.user
    data = request.data
    if user.role!='Owner':
        return Response({'detail':'Only owners can delete managers.'}, status=status.HTTP_401_UNAUTHORIZED)
    owner = Owner.objects.get(user=user)
    try:
        manager = Manager.objects.get(id=data['manager'])
    except Manager.DoesNotExist:
        return Response({'detail':'Manager does not exists.'}, status=status.HTTP_404_NOT_FOUND)
    if manager.owner.id == owner.id:
        CustomUser.objects.get(id=manager.user.id).delete()
        return Response(status=status.HTTP_200_OK)
    else:
        return Response({'detail':'This manager is not associated with you.'}, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────
# Forgot Password — generates a random password and emails it
# ──────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email', '').strip()
    if not email:
        return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        # Return success even for unknown emails to avoid user enumeration
        return Response({'detail': 'If this email is registered, a new password has been sent to it.'}, status=status.HTTP_200_OK)

    # Generate a random 10-character alphanumeric password
    alphabet = string.ascii_letters + string.digits
    new_password = ''.join(secrets.choice(alphabet) for _ in range(10))

    user.set_password(new_password)
    user.save()

    try:
        send_mail(
            subject='Hotel Hive — Your New Password',
            message=(
                f'Hello {user.first_name or user.email},\n\n'
                f'Your password has been reset. Here is your new temporary password:\n\n'
                f'    {new_password}\n\n'
                f'Please log in and change your password immediately from your Profile page.\n\n'
                f'— Hotel Hive Team'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f'Email error: {e}')
        return Response({'detail': 'Failed to send email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'detail': 'If this email is registered, a new password has been sent to it.'}, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────
# Change Password — authenticated user changes their own password
# ──────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get('current_password', '')
    new_password = request.data.get('new_password', '')
    confirm_password = request.data.get('confirm_password', '')

    if not current_password or not new_password or not confirm_password:
        return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(current_password):
        return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({'detail': 'New password and confirm password do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({'detail': 'New password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    # Send security notification email
    try:
        from django.utils.timezone import now
        send_mail(
            subject='Hotel Hive — Your Password Was Changed 🔐',
            message=(
                f'Hello {user.first_name or user.email},\n\n'
                f'This is a confirmation that your Hotel Hive account password was successfully changed.\n\n'
                f'  📅 Date & Time : {now().strftime("%d %b %Y, %I:%M %p")} (IST)\n'
                f'  📧 Account     : {user.email}\n\n'
                f'If you made this change, no further action is needed.\n\n'
                f'⚠️  If you did NOT make this change, please reset your password immediately\n'
                f'by clicking "Forgot Password?" on the login page, or contact support.\n\n'
                f'Warm regards,\n'
                f'The Hotel Hive Team 🏨'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f'Password change email error: {e}')

    return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)

