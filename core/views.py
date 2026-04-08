from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.db import models
from .models import (
    Profile, Skill, UserSkill, Project, Booking, 
    Review, Post, Like, Comment, Message, Notification, SkillQuiz, Connection
)
from .serializers import (
    UserSerializer, ProfileSerializer, SkillSerializer, 
    UserSkillSerializer, ProjectSerializer, BookingSerializer, 
    ReviewSerializer, PostSerializer, LikeSerializer, 
    CommentSerializer, MessageSerializer, NotificationSerializer, SkillQuizSerializer,
    ConnectionSerializer
)
from .services import generate_mcqs
from haversine import haversine, Unit

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    lookup_field = 'username'

    def get_queryset(self):
        return Profile.objects.all().select_related('user')

    @action(detail=False, methods=['get'])
    def discover(self, request):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = float(request.query_params.get('radius', 50))
        
        if not lat or not lng:
            return Response({'error': 'Latitude and Longitude are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        user_location = (float(lat), float(lng))
        profiles = Profile.objects.exclude(latitude__isnull=True).exclude(longitude__isnull=True)
        
        nearby_profiles = []
        for profile in profiles:
            dist = haversine(user_location, (float(profile.latitude), float(profile.longitude)), unit=Unit.KILOMETERS)
            if dist <= radius:
                data = ProfileSerializer(profile, context={'request': request}).data
                data['distance'] = dist
                nearby_profiles.append(data)
        return Response(nearby_profiles)
                
    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
        user_skills = set(UserSkill.objects.filter(user=user).values_list('skill__name', flat=True))
        user_profile = user.profile
        user_location = (float(user_profile.latitude), float(user_profile.longitude)) if user_profile.latitude and user_profile.longitude else None
        
        other_profiles = Profile.objects.exclude(user=user)
        recommendations = []
        
        for profile in other_profiles:
            score = 0
            profile_skills = set(UserSkill.objects.filter(user=profile.user).values_list('skill__name', flat=True))
            overlap = user_skills.intersection(profile_skills)
            score += len(overlap) * 10
            
            if user_location and profile.latitude and profile.longitude:
                dist = haversine(user_location, (float(profile.latitude), float(profile.longitude)), unit=Unit.KILOMETERS)
                if dist < 10: score += 20
                elif dist < 50: score += 10
            
            avg_rating = Review.objects.filter(booking__provider=profile.user).aggregate(models.Avg('rating'))['rating__avg']
            if avg_rating:
                score += avg_rating * 5
                
            if score > 0:
                data = ProfileSerializer(profile, context={'request': request}).data
                data['recommendation_score'] = score
                recommendations.append(data)
                
        recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return Response(recommendations[:10])

class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        following_user = serializer.validated_data['following']
        if following_user == self.request.user:
            return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        connection, created = Connection.objects.get_or_create(
            follower=self.request.user,
            following=following_user
        )
        if created:
            Notification.objects.create(
                user=following_user,
                message=f"USER_FOLLOW|{self.request.user.username}|started following you!"
            )
            return Response(ConnectionSerializer(connection).data, status=status.HTTP_201_CREATED)
        return Response({'message': 'Already following'}, status=status.HTTP_200_OK)

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    @action(detail=False, methods=['get'])
    def trending(self, request):
        trending_skills = Skill.objects.annotate(user_count=models.Count('userskill')).order_by('-user_count')[:4]
        return Response(SkillSerializer(trending_skills, many=True).data)

class UserSkillViewSet(viewsets.ModelViewSet):
    queryset = UserSkill.objects.all()
    serializer_class = UserSkillSerializer

    def get_queryset(self):
        username = self.request.query_params.get('username')
        if username:
            return UserSkill.objects.filter(user__username=username)
        return UserSkill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        skill_name = self.request.data.get('skill_name')
        skill, _ = Skill.objects.get_or_create(name=skill_name)
        serializer.save(user=self.request.user, skill=skill)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        username = self.request.query_params.get('username')
        if username:
            return Project.objects.filter(user__username=username)
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(requester=user) | Booking.objects.filter(provider=user)

    def perform_create(self, serializer):
        booking = serializer.save(requester=self.request.user)
        # Detailed notification: TYPE|ID|SENDER|TIME|PRICE|MSG
        details = f"BOOKING_REQUEST|{booking.id}|{self.request.user.username}|{booking.scheduled_time.strftime('%Y-%m-%d %H:%M')}|{booking.price}|{booking.message}"
        Notification.objects.create(
            user=booking.provider,
            message=details
        )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        booking = self.get_object()
        if booking.provider != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        booking.status = 'accepted'
        booking.save()
        Notification.objects.create(
            user=booking.requester,
            message=f"BOOKING_STATUS|{booking.id}|{request.user.username}|ACCEPTED"
        )
        return Response({'status': 'booking accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.provider != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        booking.status = 'rejected'
        booking.save()
        Notification.objects.create(
            user=booking.requester,
            message=f"BOOKING_STATUS|{booking.id}|{request.user.username}|REJECTED"
        )
        return Response({'status': 'booking rejected'})

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('timestamp')
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(models.Q(sender=user) | models.Q(receiver=user)).order_by('timestamp')

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'notifications marked as read'})
