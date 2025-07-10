from rest_framework.routers import DefaultRouter
from .views import DetalleCarteraViewSet

routerCartera = DefaultRouter()
routerCartera.register(prefix='cartera',viewset=DetalleCarteraViewSet,basename='cartera' )

urlpatterns = routerCartera.urls