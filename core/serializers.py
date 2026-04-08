from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Skill, UserSkill, Project, Booking, 
    Review, Post, Like, Comment, Message, Notification, SkillQuiz, Connection
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    following_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = '__all__'

    def get_following_count(self, obj):
        return Connection.objects.filter(follower=obj.user).count()

    def get_followers_count(self, obj):
        return Connection.objects.filter(following=obj.user).count()
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Connection.objects.filter(follower=request.user, following=obj.user).exists()
        return False

class ConnectionSerializer(serializers.ModelSerializer):
    follower_username = serializers.ReadOnlyField(source='follower.username')
    following_username = serializers.ReadOnlyField(source='following.username')
    class Meta:
        model = Connection
        fields = '__all__'
        read_only_fields = ('follower',)

class SkillSerializer(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()
    class Meta:
        model = Skill
        fields = '__all__'
    
    def get_user_count(self, obj):
        return UserSkill.objects.filter(skill=obj).count()

class UserSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source='skill.name')
    
    class Meta:
        model = UserSkill
        fields = ('id', 'user', 'skill', 'skill_name', 'level', 'verified', 'score', 'created_at')
        read_only_fields = ('user', 'skill', 'verified', 'score')

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('user',)

class BookingSerializer(serializers.ModelSerializer):
    requester_username = serializers.ReadOnlyField(source='requester.username')
    provider_username = serializers.ReadOnlyField(source='provider.username')

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('requester', 'status')

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    user_image = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'

    def get_user_image(self, obj):
        request = self.context.get('request')
        if obj.user.profile.image:
            image_url = obj.user.profile.image.url
            if request:
                return request.build_absolute_uri(image_url)
            return image_url
        return None

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Comment
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')

    class Meta:
        model = Message
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class SkillQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillQuiz
        fields = '__all__'
