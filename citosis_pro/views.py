from django.shortcuts import render


def index(request):
    return render(request, 'citosis/index.html', {'api_base': '/api'})