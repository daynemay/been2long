// The panel we're overlaying can be used in a number of places.
// We don't want to affect its functionality unless we're coming in
// from the Been2Long Add/Edit window.
// Note that since everything is in an iframe, we need to deal with window.parent
// rather than window when we want to deal with the actual window.
if ( window.parent.document.getElementById ( "been2long_contactspanel" ) ) {

    var toButton = window.document.getElementById ( "toButton" );
    var ccButton = window.document.getElementById ( "ccButton" );
    var abTree   = window.document.getElementById ( "abResultsTree" );

    abTree.selType = "single";

    toButton.hidden = true;
    ccButton.hidden = true;

    window.parent.document.title = "Contacts";

    // Overridden versions of these two functions (AbPanelLoad, AbPanelUnload)
    function AbPanelLoad()  
    {
        InitCommonJS();

        LoadPreviouslySelectedAB();

        // add a listener, so we can switch directories if
        // the current directory is deleted, and change the name if the
        // selected directory's name is modified
        var addrbookSession = Components.classes["@mozilla.org/addressbook/services/session;1"].getService().QueryInterface(Components.interfaces.nsIAddrBookSession);

        // this listener only cares when a directory is removed or modified
        addrbookSession.addAddressBookListener(
            gAddressBookPanelAbListener,
            Components.interfaces.nsIAddrBookSession.directoryRemoved |
            Components.interfaces.nsIAddrBookSession.changed);

        // Removed these lines, since in our context, we can't get msgcomposeWindow
        // parent.document.getElementById("msgcomposeWindow").addEventListener('compose-window-close', AbPanelOnComposerClose, true);
        // parent.document.getElementById("msgcomposeWindow").addEventListener('compose-window-reopen', AbPanelOnComposerReOpen, true);

        gSearchInput = document.getElementById("searchInput");
    }


    function AbPanelUnload()
    {
        var addrbookSession = Components.classes["@mozilla.org/addressbook/services/session;1"].getService().QueryInterface(Components.interfaces.nsIAddrBookSession);
        addrbookSession.removeAddressBookListener(gAddressBookPanelAbListener);
 
        // Removed these lines, since in our context, we can't get msgcomposeWindow
        // parent.document.getElementById("msgcomposeWindow").removeEventListener('compose-window-close', AbPanelOnComposerClose, true);
        // parent.document.getElementById("msgcomposeWindow").removeEventListener('compose-window-reopen', AbPanelOnComposerReOpen, true);

        CloseAbView();
    }

}
