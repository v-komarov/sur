def get_client_id(request):
    client_id = False
    if request.user.has_perm('cabinet.overlord_interface'):
        if 'client_id' in request.session:
            client_id = int(request.session['client_id'])
        else:
            client_id = True

    elif request.user.has_perm('cabinet.client_interface'):
        client_id = request.user.client_id

    return client_id