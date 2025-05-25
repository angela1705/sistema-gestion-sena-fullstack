from django.urls import path
from .views import (
    PersonaRegisterView,
    PersonaAuthView,
    PersonaListView,
    PersonaDetailView,
    CurrentUserView,
    PersonaResponsableView,
)

urlpatterns = [
    path('register/', PersonaRegisterView.as_view(), name='persona-register'),
    path('login/', PersonaAuthView.as_view(), name='persona-login'),
    path('me/', CurrentUserView.as_view(), name='persona-me'),
    path('', PersonaListView.as_view(), name='persona-list'),
    path('<int:pk>/', PersonaDetailView.as_view(), name='persona-detail'),
    path('responsables/', PersonaResponsableView.as_view(), name='persona-responsables'),
]
