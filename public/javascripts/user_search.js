$(document).ready(function() {
    console.log('Locked and loaded!');

    $('#search-submit').on('click', function(e) {
        e.preventDefault();
        var searchTerm = $('#search-text').val();
        if(searchTerm.length == 0) {
            console.log('Empty search term. Rejecting request');
            return false;
        }

        console.log('Submit clicked!');
        $.get('/users/search', {
            searchTerm: searchTerm,
            mode: $('#search-mode').val()
        }).done(function(response) {
            console.log('Search success', response);
            // TODO remove earlier results
            $('.no-result').hide();
            $('#search-results tbody tr').not('.result-template').not('.no-result').remove();
            if (response.results.length == 0) {
                $('.no-result').show();
            }
            _.each(response.results, function(result) {
                var template = $('#search-results tbody tr.result-template').clone();
                template.removeClass('result-template');
                template.find('.fname').html(result.firstname);
                template.find('.lname').html(result.lastname);
                template.find('.city').html(result.city);
                template.find('.state').html(result.state);
                template.find('.country').html(result.country);

                $('#search-results tbody').append(template);
            });
        }).fail(function(jqXHR) {
            console.log('Search failed', jqXHR);
        });
    })
});