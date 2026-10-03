from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Categoria, Solicitacao
from .serializers import CategoriaSerializer, SolicitacaoSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]


class SolicitacaoViewSet(viewsets.ModelViewSet):
    serializer_class = SolicitacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Solicitacao.objects.all()
        return Solicitacao.objects.filter(solicitante=user)

    def perform_create(self, serializer):
        serializer.save(solicitante=self.request.user)