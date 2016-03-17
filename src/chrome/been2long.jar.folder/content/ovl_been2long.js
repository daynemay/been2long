var been2long = {

    onLoad: function() {

        // initialization code
        this.initialized = true;
        this.strings = document.getElementById("been2long-strings");

        // If the preference has been set to show on startup, and if there are overdue notifications, then show.
        if ( getPref ( "extensions.been2long@daynemay.showonstartup" )==true && shouldShowOnStartup () ) {
            window.open("chrome://been2long/content/wdw_b2lnotifications.xul", "", "chrome,centerscreen,resizable");
        }
    
    },
	
    onMenuItemCommand: function() {

        var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
        var windowManagerInterface = windowManager.QueryInterface(nsIWindowMediator);

        var topWindow = windowManagerInterface.getMostRecentWindow("been2long");

        if (topWindow)
            topWindow.focus();
        else
            // window.open(uri, "_blank", "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
            MyWindows = window.open("chrome://been2long/content/wdw_b2lnotifications.xul", "", "chrome,centerscreen,resizable");
    
    },

};

window.addEventListener("load", function(e) { been2long.onLoad(e); }, false);
