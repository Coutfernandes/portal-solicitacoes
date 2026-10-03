import csv
from django.http import HttpResponse
from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Categoria, Solicitacao
from .serializers import CategoriaSerializer, SolicitacaoSerializer
from rest_framework.permissions import AllowAny
from .serializers import UserRegisterSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
    })


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

    @action(detail=False, methods=['get'], url_path='exportar_csv')
    def exportar_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="solicitacoes.csv"'
        
        writer = csv.writer(response, delimiter=';')
        writer.writerow(['Código', 'Título', 'Categoria', 'Solicitante', 'Status', 'Data de Abertura'])
        
        for item in queryset:
            writer.writerow([
                item.id,
                item.titulo,
                item.categoria.nome if item.categoria else '',
                item.solicitante.username if item.solicitante else '',
                item.get_status_display() if hasattr(item, 'get_status_display') else item.status,
                item.criado_em.strftime('%d/%m/%Y %H:%M') if hasattr(item, 'criado_em') and item.criado_em else ''
            ])
            
        return response

    @api_view(['POST'])
    @permission_classes([AllowAny]) 
    def register_user(request):
            serializer = UserRegisterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Usuário criado com sucesso!'}, status=201)
            return Response(serializer.errors, status=400)
