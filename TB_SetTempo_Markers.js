function openTempoMarkerDialog() {

    
    Action.perform("onActionSetTempoMarker()", "xsheetView");
    Action.perform("onActionSetTempoMarkers()", "xsheetView");
    Action.perform("onActionSetTempo()", "xsheetView");
    Action.perform("onActionTempoMarker()", "xsheetView");
    
    MessageLog.trace("Wysłano komendy wywołania do Xsheet...");
}