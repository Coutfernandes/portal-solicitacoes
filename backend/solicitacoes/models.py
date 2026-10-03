from django.db import models
from django.contrib.auth.models import User

class Categoria(models.Model):
    """
    Tabela de Categorias das solicitações (TI, RH, Compras, Financeiro, Infraestrutura)
    """
    nome = models.CharField(max_length=100, unique=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Solicitacao(models.Model):
    """
    Tabela Principal de Solicitações Internas
    """
    STATUS_CHOICES = [
        ('ABERTO', 'Aberto'),
        ('EM_ATENDIMENTO', 'Em Atendimento'),
        ('CONCLUIDO', 'Concluído'),
    ]

    PRIORIDADE_CHOICES = [
        ('BAIXA', 'Baixa'),
        ('MEDIA', 'Média'),
        ('ALTA', 'Alta'),
        ('URGENTE', 'Urgente'),
    ]

    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='solicitacoes')
    solicitante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solicitacoes')
    data_criacao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABERTO')
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default='MEDIA')

    class Meta:
        verbose_name = "Solicitação"
        verbose_name_plural = "Solicitações"
        ordering = ['-data_criacao']

    @property
    def codigo(self):
        """
        Gera o código sequencial formatado no padrão SOL-0001
        """
        return f"SOL-{self.id:04d}"

    def __str__(self):
        return f"{self.codigo} - {self.titulo}"


class HistoricoSolicitacao(models.Model):
    """
    Tabela de Auditoria e Linha do Tempo das alterações feitas em cada solicitação
    """
    solicitacao = models.ForeignKey(Solicitacao, on_delete=models.CASCADE, related_name='historico')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    acao_realizada = models.TextField()
    data_alteracao = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Histórico de Solicitação"
        verbose_name_plural = "Históricos de Solicitações"
        ordering = ['-data_alteracao']

    def __str__(self):
        return f"Histórico {self.solicitacao.codigo} - {self.data_alteracao.strftime('%d/%m/%Y %H:%M')}"