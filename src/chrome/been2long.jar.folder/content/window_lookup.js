// Override the existing AddRecipient (is this an overlay rather than a window?)
function AddRecipient ( dummy, emailAddress ) {
    window.opener.setEmailAddress ( emailAddress );
    window.close ( );
}
