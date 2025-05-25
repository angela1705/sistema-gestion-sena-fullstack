from django.urls import path
from .views import (
    PersonaAuthView,
    PersonaRegisterView,
    PersonaListView,
    PersonaDetailView,
    CurrentUserView,
    PersonaResponsableView
)

urlpatterns = [
    path('login/', PersonaAuthView.as_view(), name='login'),
    path('register/', PersonaRegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('users/', PersonaListView.as_view(), name='user-list'),
    path('users/<int:pk>/', PersonaDetailView.as_view(), name='user-detail'),
    path('responsables/', PersonaResponsableView.as_view(), name='responsables-list'),
]