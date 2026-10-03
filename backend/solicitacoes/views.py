import csv
from django.http import HttpResponse
from django.db.models import Q
from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Categoria, Solicitacao
from .serializers import CategoriaSerializer, SolicitacaoSerializer, UserRegisterSerializer


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
            queryset = Solicitacao.objects.all()
        else:
            queryset = Solicitacao.objects.filter(solicitante=user)

        search = self.request.query_params.get('search', '').strip()
        if search:
            codigo = search.removeprefix('#').strip()
            if codigo.isdecimal():
                queryset = queryset.filter(Q(titulo__icontains=search) | Q(pk=int(codigo)))
            else:
                queryset = queryset.filter(titulo__icontains=search)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        categoria = self.request.query_params.get('categoria')
        if categoria:
            if not categoria.isdecimal():
                return queryset.none()
            queryset = queryset.filter(categoria_id=int(categoria))

        return queryset

    def perform_create(self, serializer):
        serializer.save(solicitante=self.request.user)

    @action(detail=True, methods=['patch'], url_path='alterar_status')
    def alterar_status(self, request, pk=None):
        solicitacao = self.get_object()
        novo_status = request.data.get('status')
        if novo_status not in dict(Solicitacao.STATUS_CHOICES):
            raise serializers.ValidationError({'status': 'Status inválido.'})

        solicitacao.status = novo_status
        solicitacao.save(update_fields=['status', 'atualizado_em'])
        return Response(self.get_serializer(solicitacao).data)

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


# View desacoplada do ViewSet para registro de usuário
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Usuário criado com sucesso!'}, status=201)
    return Response(serializer.errors, status=400)