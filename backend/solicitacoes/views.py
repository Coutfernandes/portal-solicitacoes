from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
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

    # NOVO ENDPOINT: /api/solicitacoes/kpis/
    @action(detail=False, methods=['get'])
    def kpis(self, request):
        queryset = self.get_queryset()
        data = {
            'total': queryset.count(),
            'pendentes': queryset.filter(status='PENDENTE').count(),
            'em_andamento': queryset.filter(status='EM_ANDAMENTO').count(),
            'concluidos': queryset.filter(status='CONCLUIDO').count(),
        }
        return Response(data)