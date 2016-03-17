function initialiseAddEditWindow () {

    if ( window.arguments[0]=="add" ) {

        window.document.title = "Add Been2Long Reminder";

        populateWindow ( "" );

    } else { // i.e. window.arguments[0]=="edit"

        window.document.title = "Edit Been2Long Reminder";
        document.getElementById ( "been2longAddressBook" ).disabled = true;
        populateWindow ( window.arguments [ 1 ] );

    }

    window.sizeToContent ();

}




function populateWindow ( emailAddress ) {

    if ( emailAddress=="" ) {

        var nowTime = new Date().getTime();
        document.getElementById ( "been2longLastWrote").value = new Date().getTime();
        document.getElementById ( "been2longEmailAddress" ).value = "<press Email Address... to search>";
        document.getElementById ( "been2longEmailAddress" ).select();
        return;

    }


    // emailAddress != ""
    var abCard = getCard ( emailAddress );

    if (!abCard) return;

    var B2LField = getB2LFieldName ();

    var fieldValue = abCard.getCardValue ( B2LField );

    var lRegularity = fieldValue.split ( ";" ) [ 0 ];
    var lLastWrote  = fieldValue.split ( ";" ) [ 1 ];

    document.getElementById ( "been2longEmailAddress").value = emailAddress;
    document.getElementById ( "been2longEmailAddress").disabled = true;
    document.getElementById ( "been2longRegularity").value = lRegularity; 
    document.getElementById ( "been2longLastWrote").value = lLastWrote;

    document.getElementById ( "been2longRegularity").select();

}




function openAddressBook () {

    window.openDialog ("chrome://been2long/content/window_lookup.xul", "", "chrome,modal,resizable" );

}


function setEmailAddress ( userAddress ) {

    /*  The "email address" might be 'user@domain.com', but it might be 'The User <user@domain.com>'
        or even '"The User <something else>" <user@domain.com>'
        In all cases, if we break the "email address" into an array by "<", and trim the ">" 
        (if present) from the end of the final array entry, then that last entry is our actual
        email address user@domain.com */   

    var addressArray = userAddress.split ("<");

    var emailAddress = addressArray [ addressArray.length - 1 ].replace (">","");

    document.getElementById ( "been2longEmailAddress" ).value = emailAddress;

}


function cancelPressed () {
    window.close();
}

function okPressed () {

    // hidden element on this window.
    var enteredDate = document.getElementById ( "been2longLastWrote" ).value;

    var enteredRegularity = document.getElementById ( "been2longRegularity").value;

    if ( isNaN ( enteredRegularity ) ) {
        alert ( "Regularity must be a number of days: " + enteredRegularity );
        return;
    } 
  
    if ( parseInt ( enteredRegularity ) != parseFloat ( enteredRegularity ) ) {
        alert ( "Regularity must be a number of whole days: " + enteredRegularity );
        return;
    }

    if ( parseInt ( enteredRegularity ) <= 0 ) {
        alert ( "Regularity must be a positive whole number of days: " + enteredRegularity );
        return;
    }

    var emailAddress = document.getElementById ( "been2longEmailAddress" ).value;

    var abCard = getCard ( emailAddress );

    if (!abCard) {
        alert ( emailAddress + " does not appear as a primary email address in your address book." );
        return;
    }

    var b2lFieldName  = getB2LFieldName ();
    var b2lFieldValue = enteredRegularity + ";" + enteredDate;

    abCard.setCardValue ( b2lFieldName, b2lFieldValue );

    // This may need a change to abDirectory.ModifyCard () - see Tbird bugzilla #???
    abCard.editCardToDatabase ( "" );

    window.close();

}
