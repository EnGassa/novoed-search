$(document).ready(function() {
    console.log('Locked and loaded!');

    $('form#add-user').on('submit', function(e) {
        e.preventDefault();

        console.log('Triggered form submission via XHR');
        // TODO do the real stuff here
        var firstname = $('form input[name="firstname"]').val(),
            lastname = $('form input[name="lastname"]').val(),
            address = $('form input[name="address"]').val();
        console.log('Values:', firstname, lastname, address);

        $.post('/users/add_user', {
            firstname: firstname,
            lastname: lastname,
            address: address
        }).done(function(response) {
            // Success callback
            console.log('User created successfully', response);
            // TODO some UI stuff to inform the user
        }).fail(function(jqXHR, status, error) {
            // Error callback
            console.log('User creation FAILED:', jqXHR, status, error);
        });
    });
});