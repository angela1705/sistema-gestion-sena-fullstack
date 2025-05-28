"""
URL configuration for SiREP_SUPERETE project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from apps.usuarios.rol.api.router import routerRol
from apps.usuarios.cargo.api.router import routerCargo
from apps.entidades.sena_empresa.api.router import routerSena
from apps.entidades.sede.api.router import routerSede
from apps.entidades.unidades_productivas.api.router import routerUnidadP
from apps.inventario.categorias.api.router import routerCategoria

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/personas/', include('apps.usuarios.persona.api.router')),
    path('api/', include(routerRol.urls)),
    path('api/', include(routerCargo.urls)),
    path('api/', include(routerSena.urls)),
    path('api/', include(routerSede.urls)),
    path('api/', include(routerUnidadP.urls)),
    path('api/', include(routerCategoria.urls)),
    
    
    
]
