from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet

routerProducto= DefaultRouter()
routerProducto.register(prefix='producto',viewset= ProductoViewSet)

urlpatterns = routerProducto.urls