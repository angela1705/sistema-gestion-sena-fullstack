from rest_framework.routers import DefaultRouter
from .views import PrecioViewSet

routerPrecio= DefaultRouter()
routerPrecio.register(prefix='precio',viewset=PrecioViewSet )

urlpatterns = routerPrecio.urls